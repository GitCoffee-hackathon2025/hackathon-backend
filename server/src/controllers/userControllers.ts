import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../service/userService';
import { TokenService } from '../service/tokenService';
import { UserType, UpdateUserBody, UpdateUserParams, UpdateType } from '../types/userTypes';

const userService = new UserService();
const tokenService = new TokenService();
const defaultError = 'Erro interno ao processar a solicitação. Tente novamente mais tarde.';

function getUserIdFromCookie(request: FastifyRequest): number | null {
  const id = request.cookies.userId;
  return id ? parseInt(id) : null;
}

export async function loginUser(request: FastifyRequest<{ Body: UserType }>, reply: FastifyReply) {
  try {
    const { email, password } = request.body;
    const { user, comparedPassword } = await userService.login(email, password);

    if (!user) {
      return reply.status(400).send({
        succes: false,
        message: 'Credênciais de usuário inválidas',
        error: 'Credênciais inválidas.',
      });
    }

    if (!comparedPassword) {
      return reply.status(400).send({
        succes: false,
        message: 'Credênciais de usuário inválidas',
        error: 'Credênciais inválidas.',
      });
    }

    reply.setCookie('userId', user.id_user.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return reply.status(200).send({ success: true, message: 'Login de usuário efetivado' });
  } catch (err: any) {
    return reply
      .status(500)
      .send({ success: false, message: err.message ?? defaultError, error: defaultError });
  }
}

export async function registerUser(
  request: FastifyRequest<{
    Body: UserType;
  }>,
  reply: FastifyReply
) {
  const user = request.body;
  const type = 'EMAIL_VERIFICATION';

  if (!user.email) {
    return reply.code(400).send({
      success: false,
      message: 'Email não consta no corpo da requisição',
      error: 'Email obrigatório.',
    });
  }

  try {
    const userAlredyExist = await userService.findUser(user.email);
    if (userAlredyExist) {
      return reply.status(409).send({
        success: false,
        message: 'Email fornecido pelo usuário ja está em uso',
        error: 'Este email ja está em uso.',
      });
    }

    const tokenExisting = await tokenService.verify(user.email, type);

    if (!tokenExisting) {
      return reply.code(400).send({
        success: false,
        message: 'Código fornecido pelo usuário não foi encontrado no banco de dados',
        error: 'Código inválido.',
      });
    }
    if (!tokenExisting.used) {
      return reply.code(400).send({
        success: false,
        message: 'Código fornecido pelo usuário não foi verificado',
        error: 'Código inválido.',
      });
    }

    await userService.register(request.body);
    await tokenService.delete(user.email, type);
    return reply.status(201).send({ success: true, message: 'Usuário registrado com sucesso' });
  } catch (err: any) {
    return reply
      .status(500)
      .send({ success: false, message: err.message ?? defaultError, error: defaultError });
  }
}

export async function updateUser(
  request: FastifyRequest<{
    Params: UpdateUserParams;
    Body: { user: UpdateUserBody; type: UpdateType };
  }>,
  reply: FastifyReply
) {
  const updateType = request.body.type;
  const type = updateType == 'PASSWORD' ? 'PASSWORD_RESET' : 'CHANGE_EMAIL';
  const userId = getUserIdFromCookie(request);

  if (
    updateType != 'PASSWORD' &&
    updateType != 'NAME' &&
    updateType != 'CEP' &&
    updateType != 'DATE' &&
    updateType != 'EMAIL'
  ) {
    return reply.status(401).send({
      succes: false,
      message: 'Tipo de atualização de usuário inválido',
      error: 'Sem autorização para atualizar.',
    });
  }

  if (!userId)
    return reply.status(401).send({
      succes: false,
      message: 'Não autorizado pelo id',
      error: 'Sem autorização para atualizar.',
    });

  try {
    const email = (await userService.findById(userId))?.email;

    if (!email) {
      return reply.status(400).send({
        success: false,
        message: 'Usuário não encontrado para atualizar algo nele',
        error: 'Usuário não encontrado para atualizar.',
      });
    }

    if (updateType == 'PASSWORD' || updateType == 'EMAIL') {
      if (email == request.body.user.email) {
        return reply.status(400).send({
          success: false,
          message: 'Email fornecido pelo usuário já está em uso',
          error: 'Esta email já esta em uso.',
        });
      }

      const tokenExisting = await tokenService.verify(email, type);

      if (!tokenExisting) {
        return reply.code(400).send({
          success: false,
          message: 'Código do email fornecido pelo usuário não foi encontrado no banco de dados',
          error: 'Erro ao atualizar.',
        });
      }
      if (!tokenExisting.used) {
        return reply.code(400).send({
          success: false,
          message: 'Código do email fornecido pelo usuário não foi verificado',
          error: 'Erro ao atualizar.',
        });
      }
    }

    const updatedUser = await userService.update(userId, request.body.user, updateType);
    if (updateType == 'PASSWORD' || updateType == 'EMAIL') await tokenService.delete(email, type);

    return reply.status(200).send({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser,
    });
  } catch (err: any) {
    return reply
      .status(500)
      .send({ success: false, message: err.message ?? defaultError, error: defaultError });
  }
}
