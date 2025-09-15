// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { type RequestBody } from '../types/requestBodyTypes';

import { userTemplate, type UserValues, type UserRegisterValues } from '../templates/userTemplates';

// Retorno do erro
import SendError from './../errors/SendError';
import FormatError from '../errors/FormatError';

// Segurança
import CryptoManager from '../security/crypto/CryptoManager';

// Funções
import userService from '../services/User';
import checksFieldExistence from './utils/checksFieldExistence';

class UserControllers {
  public async register(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
    try {
      const { decoded, aes } = await CryptoManager.decode(request.body);

      const user = decoded.data as UserRegisterValues;

      checksFieldExistence(user, userTemplate);
      await userService.register(user);

      return reply
        .status(201)
        .send(await CryptoManager.encode({ message: 'Usuário cadastrado com sucesso' }, aes));
    } catch (error) {
      SendError(error, reply);
    }
  }

  public async login(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
    try {
      const { decoded, aes } = await CryptoManager.decode(request.body);

      const user = decoded;
    } catch (error) {}
  }
}

// static async register(
//     request: FastifyRequest,
//     reply: FastifyReply
//   ) {
//     const user = request.body;
//     const type = 'EMAIL_VERIFICATION';

//     const device_request_id = request.cookies.device_request_id;

//       const tokenExisting = await tokenService.find(user.email, type);

//       if (tokenExisting.deviceRequestId != device_request_id) {
//         return ResponseHandler.unauthorized(reply);
//       }

//       if (
//         tokenExisting.ipAddress !== request.ip ||
//         tokenExisting.userAgent !== request.headers['user-agent']
//       ) {
//         return ResponseHandler.unauthorized(reply);
//       }

//       if (!tokenExisting.used) {
//         return ResponseHandler.errorInCode(reply, 'Código inválido.', undefined);
//       }

//       await userService.register(user);
//       await tokenService.delete(user.email, type);
//       reply.clearCookie('device_request_id', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//       });
//       return ResponseHandler.success(reply, undefined, 'Cadastro feito com sucesso.', undefined);
//   }
