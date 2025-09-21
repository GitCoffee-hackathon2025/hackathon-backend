import { type FastifyRequest, type FastifyReply } from 'fastify';
import { Browser, type RequestBody } from '../types/requestBodyTypes';


import { type UserValues } from '../templates/userTemplates';
import mailService from '../services/sub-services/MailService';
// Retorno do erro
import SendError from '../errors/SendError';
import FormatError from '../errors/FormatError';


// Segurança
import CryptoManager from '../security/crypto/CryptoManager';
import authService from '../services/AuthService';


// Funções
import userService from '../services/UserService';


class AuthController {
    // AuthController.ts
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


     public static async sendEmailForRegister(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
    try {
      const { decoded } = await CryptoManager.decode(request.body);
      const { email } = decoded.data as { email: string };


      if (!email) throw new FormatError(400, 'E-mail não informado');


      await mailService.sendRegistrationCode(email);


      return reply.status(200).send({
        success: true,
        message: 'Código de verificação enviado para o e-mail',
      });
    } catch (error) {
      return SendError(error, reply);
    }
  }


  public static async verifyRegistrationCode(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
    try {
      console.log('Verifying registration code...');
      console.log('Request body:', request.body);
      const { decoded, aes } = await CryptoManager.decode(request.body);
      console.log('Decoded data:', decoded.data);


      if (!decoded.data || typeof decoded.data !== 'object') {
        throw new FormatError(400, 'Dados inválidos');
      }


      if (!('email' in decoded.data)){
        throw new FormatError(400, 'E-mail não informado');
      }
      const { email, code } = decoded.data as { email: string; code: string };


      // Verificar código
      await mailService.verifyRegistrationCode(email, String(code));


      return reply.status(200).send(
        await CryptoManager.encode(
          {
            success: true,
            message: 'Código verificado com sucesso',
            verified: true
          },
          aes
        )
      );
    } catch (error) {
      return SendError(error, reply);
    }
  }


 public static async recover(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
  try {
    console.log('Iniciando recuperação de tokens e dados do usuário');
    
    const { decoded, aes } = await CryptoManager.decode(request.body);
    console.log('Decoded data for token recovery:', decoded);

    const tokens = await authService.refreshTokens(
      request.headers.authorization!,
      decoded.browser!
    );
    
    // Obter dados do usuário
    // const userData = await authService.getUserDataFromToken(tokens.access);
    //console.log('User data recovered:', userData);
    
    // Criptografar dados do usuário com a mesma chave AES
    //const encryptedUserData = await CryptoManager.encode({ dataUser: userData }, aes);
    
    console.log('Tokens refreshed:', tokens);

    return reply.status(200).send({ 
      success: true, 
      tokens,
      // 👈 AGORA ESTÁ RETORNANDO OS DADOS DO USUÁRIO
    });
  } catch (error) {
    console.error('Erro no recover:', error);
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
