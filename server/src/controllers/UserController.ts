import { type FastifyRequest, type FastifyReply } from 'fastify';
import { type RequestBody } from '../types/requestBodyTypes';


import {
  userTemplate,
  type UserRegisterValues,
  type PartialUserRegisterValues,
} from '../templates/userTemplates';


// Retorno do erro
import SendError from '../errors/SendError';


// Segurança
import CryptoManager from '../security/crypto/CryptoManager';
import authService from '../services/AuthService';
import { authentic } from './AuthController';


// Funções
import userService from '../services/UserService';
import checksFieldExistence from './utils/checksFieldExistence';


class UserControllers {
  public static async register(request: any, reply: FastifyReply) {
  try {
    console.log('Request body raw:', request.body);
    const { decoded, aes } = await CryptoManager.decode(request.body);
    console.log('Decoded:', decoded);
   
    const userData = {
      ...decoded.data,
      dateBirth: new Date(decoded.data.dateBirth)
    };
   
    console.log('User data after processing:', userData);


    // ✅ LOG ANTES do registro
    console.log('🔍 Verificando se email existe no banco...');
    // Cria usuário no banco
    await userService.register(userData as UserRegisterValues);
    console.log('✅ Usuário registrado com sucesso');


    return reply.status(201).send(
      await CryptoManager.encode(
        { success: true, message: 'Usuário cadastrado com sucesso' },
        aes
      )
    );
  } catch (error) {
    console.error('❌ ERRO DETALHADO NO REGISTER:');
    return SendError(error, reply);
  }


}
  public static async get(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
    try {
      const { decoded, aes } = await CryptoManager.decode(request.body);


      const userId = await authentic(request.headers.authorization, decoded.browser!);


      const user = await userService.getUser(userId);


      return reply
        .status(200)
        .send(
          await CryptoManager.encode(
            { success: true, message: 'Dados do usuário encontrado', data: user },
            aes
          )
        );
    } catch (error) {
      return SendError(error, reply);
    }
  }


  public static async update(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
    try {
      const { decoded, aes } = await CryptoManager.decode(request.body);


      const data = decoded.data as { random: number; dataUser: PartialUserRegisterValues };


      const userId = await authService.authenticateAccess(
        request.headers.authorization!,
        decoded.browser!
      );


      const saved = await userService.update(userId, data.dataUser, data.random);


      return reply
        .status(200)
        .send(
          await CryptoManager.encode(
            { success: true, message: 'Usuário atualizado com sucesso', data: saved },
            aes
          )
        );
    } catch (error) {
      return SendError(error, reply);
    }
  }
}


export default UserControllers;
