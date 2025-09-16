// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { Browser, type RequestBody } from '../types/requestBodyTypes';

import { type UserValues } from '../templates/userTemplates';

// Retorno do erro
import SendError from '../errors/SendError';
import FormatError from '../errors/FormatError';

// Segurança
import CryptoManager from '../security/crypto/CryptoManager';
import authService from '../services/AuthService';

// Funções
import userService from '../services/UserService';

class AuthController {
  public static async login(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
    try {
      const { decoded, aes } = await CryptoManager.decode(request.body);

      const parameters = decoded.data as Pick<UserValues, 'email' | 'password'>;
      const { id: userId, ...dataUser } = await userService.login(parameters);

      return reply.status(200).send({
        success: true,
        data: await CryptoManager.encode({ message: 'Usuário logado', dataUser }, aes),
        tokens: await authService.issueTokens(userId, decoded.browser!),
      });
    } catch (error) {
      return SendError(error, reply);
    }
  }

  public static async recover(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
    try {
      const decoded = (await CryptoManager.decode(request.body)).decoded;

      const tokens = await authService.refreshTokens(
        request.headers.authorization!,
        decoded.browser!
      );

      return reply.status(200).send({ success: true, tokens });
    } catch (error) {
      return SendError(error, reply);
    }
  }

  public static async sendMailPassword(
    request: FastifyRequest<{ Body: RequestBody }>,
    reply: FastifyReply
  ) {
    try {
      const { decoded, aes } = await CryptoManager.decode(request.body);

      const userId = await authService.authenticateAccess(
        request.headers.authorization!,
        decoded.browser!
      );

      await userService.sendCodeToChange(userId, 'password');
      return reply.status(200).send(
        await CryptoManager.encode(
          {
            success: true,
            message: 'Foi enviado um código para seu e-mail',
          },
          aes
        )
      );
    } catch (error) {
      return SendError(error, reply);
    }
  }

  public static async sendMailChangeEmail(
    request: FastifyRequest<{ Body: RequestBody }>,
    reply: FastifyReply
  ) {
    try {
      const { decoded, aes } = await CryptoManager.decode(request.body);

      const userId = await authService.authenticateAccess(
        request.headers.authorization!,
        decoded.browser!
      );

      await userService.sendCodeToChange(userId, 'email');
      return reply.status(200).send(
        await CryptoManager.encode(
          {
            success: true,
            message: 'Foi enviado um código para seu e-mail',
          },
          aes
        )
      );
    } catch (error) {
      return SendError(error, reply);
    }
  }
}

export async function authentic(auth: string | undefined, browser: Browser) {
  if (!auth)
    throw new FormatError(401, 'Não autenticado', {
      inputErro: ['TOKEN'],
    });

  return authService.authenticateAccess(auth, browser);
}

export default AuthController;
