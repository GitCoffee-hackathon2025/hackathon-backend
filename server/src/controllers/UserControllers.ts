import { type FastifyRequest, type FastifyReply } from 'fastify';

import userService from '../service/UserService';
import tokenService from '../service/TokenService';
import sessionService from '../service/SessionService';

import { LoginUser, CreateUserDTO, RecoverPassword, ExtendedUpdateBody } from '../types/userTypes';

import crypto from 'crypto';

import { ResponseHandler } from '../utils/requisitionsResposnses';
import { CryptoUtil } from '../utils/crypto';
import UserEntity from '../entities/UserEntity';

class UserControllers {
  static async login(request: FastifyRequest<{ Body: LoginUser }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;
      const { user, comparedPassword } = await userService.login(email, password);

      if (!user) {
        return ResponseHandler.invalidCredentials(reply);
      }

      if (!comparedPassword) {
        return ResponseHandler.invalidCredentials(reply);
      }
      const fingerprint = crypto
        .createHash('sha256')
        .update((request.headers['user-agent'] ?? '') + (request.ip ?? ''))
        .digest('hex');

      const created = await sessionService.create(user.id_user, fingerprint);

      reply.setCookie('session_id', created.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // segundos (7 dias)
      });

      return ResponseHandler.success(reply, user, 'Login efetuado com sucesso.', undefined);
    } catch (err: any) {
      return ResponseHandler.error(reply, err.message, undefined, undefined);
    }
  }

  static async register(
    request: FastifyRequest<{
      Body: CreateUserDTO;
    }>,
    reply: FastifyReply
  ) {
    const user = request.body;
    const type = 'EMAIL_VERIFICATION';

    if (!user.email) {
      return ResponseHandler.errorInEmail(reply, 'Email obrigatório.', undefined);
    }

    if (!user.dateBirth) {
      return ResponseHandler.error(reply, 'Data de nascimento obrigatória.', 400, ['DATE']);
    }

    if (!user.name) {
      return ResponseHandler.error(reply, 'Nome completo obrigatório.', 400, ['NAME']);
    }
    if (
      !user.password ||
      //Regex de senha
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(user.password)
    ) {
      return ResponseHandler.error(reply, 'Senha inválida.', 400, ['PASSWORD']);
    }

    const device_request_id = request.cookies.device_request_id;

    try {
      const userAlredyExist = await userService.findByEmail(user.email);
      if (userAlredyExist) {
        return ResponseHandler.errorInEmail(reply, 'Este email ja esta em uso.', undefined);
      }

      const tokenExisting = await tokenService.find(user.email, type);

      if (!tokenExisting) {
        return ResponseHandler.errorInCode(reply, 'Código inválido.', undefined);
      }

      if (tokenExisting.deviceRequestId != device_request_id) {
        return ResponseHandler.unauthorized(reply);
      }

      if (
        tokenExisting.ipAddress !== request.ip ||
        tokenExisting.userAgent !== request.headers['user-agent']
      ) {
        return ResponseHandler.unauthorized(reply);
      }

      if (!tokenExisting.used) {
        return ResponseHandler.errorInCode(reply, 'Código inválido.', undefined);
      }

      await userService.register(user);
      await tokenService.delete(user.email, type);
      reply.clearCookie('device_request_id', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return ResponseHandler.success(reply, undefined, 'Cadastro feito com sucesso.', undefined);
    } catch (err: any) {
      return ResponseHandler.error(reply, err.message, undefined, undefined);
    }
  }

  static async update(
    request: FastifyRequest<{
      Body: ExtendedUpdateBody;
    }>,
    reply: FastifyReply
  ) {
    const updateType = request.body.type;
    const data = request.body.data;

    if (
      updateType != 'PASSWORD' &&
      updateType != 'NAME' &&
      updateType != 'BIRTHDAY' &&
      updateType != 'EMAIL'
    ) {
      return ResponseHandler.unauthorized(reply);
    }

    try {
      const userId = request.body.userId;
      const user = (await userService.findById(userId)) as UserEntity;

      if (updateType === 'EMAIL') {
        const newEmail = request.body.data.email;
        if (!newEmail) return ResponseHandler.errorInEmail(reply, 'Email obrigatório.', undefined);

        const already = await userService.findByEmail(newEmail);
        if (already) return ResponseHandler.errorInEmail(reply, 'Este email ja esta em uso.', 409);

        const tokenExisting = await tokenService.find(newEmail, 'CHANGE_EMAIL');
        if (
          !tokenExisting ||
          !tokenExisting.used ||
          tokenExisting.deviceRequestId !== request.cookies.device_request_id
        ) {
          return ResponseHandler.unauthorized(reply);
        }
      }

      if (updateType === 'PASSWORD') {
        const confirmPassword = data.confirmPassword;
        const newPassword = data.newPassword;

        if (!confirmPassword || !newPassword)
          return ResponseHandler.error(reply, 'Senha inválida', 400);

        const compared = await CryptoUtil.comparePassword(confirmPassword, user.password);
        if (!compared) return ResponseHandler.invalidCredentials(reply);
      }

      const updatedUser = await userService.update(userId, data, updateType);

      return ResponseHandler.success(reply, updatedUser, 'Atualizado com sucesso.', undefined);
    } catch (err: any) {
      return ResponseHandler.error(reply, err.message, undefined, undefined);
    }
  }

  static async resetPassword(
    request: FastifyRequest<{
      Body: { data: RecoverPassword; type: 'PASSWORD' };
    }>,
    reply: FastifyReply
  ) {
    const email = request.body.data.email;
    const updateType = request.body.type;
    const type = 'PASSWORD_RESET';
    const device_request_id = request.cookies.device_request_id;

    if (updateType != 'PASSWORD') {
      return ResponseHandler.unauthorized(reply);
    }

    try {
      const user = await userService.findByEmail(email);

      if (!user) {
        return ResponseHandler.error(reply, 'Usuário não encontrado.', 404);
      }

      const tokenExisting = await tokenService.find(email, type);

      if (!tokenExisting) {
        return ResponseHandler.errorInCode(reply, 'Código inválido.', undefined);
      }
      if (tokenExisting.deviceRequestId != device_request_id) {
        return ResponseHandler.unauthorized(reply);
      }

      if (!tokenExisting.used) {
        return ResponseHandler.errorInCode(reply, 'Código inválido.', undefined);
      }

      const updatedUser = await userService.update(
        user.id_user,
        { newPassword: request.body.data.password },
        updateType
      );
      await tokenService.delete(email, type);

      return ResponseHandler.success(
        reply,
        updatedUser,
        'Senha recuperada com sucesso.',
        undefined
      );
    } catch (err: any) {
      return ResponseHandler.error(reply, err.message, undefined, undefined);
    }
  }
}

export default UserControllers;
