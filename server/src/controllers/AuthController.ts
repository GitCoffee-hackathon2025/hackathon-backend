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

public static async verifyPasswordRecoveryCode(
    request: FastifyRequest<{ Body: RequestBody }>,
    reply: FastifyReply
  ) {
    let aes: any; // Declarar aes fora do try para ter escopo no catch
    
    try {
      console.log('🔴 [DEBUG] === VERIFICAÇÃO DE CÓDIGO DE RECUPERAÇÃO ===');
      
      const { decoded, aes: aesKey } = await CryptoManager.decode(request.body);
      aes = aesKey; // Atribuir à variável externa
      
      console.log('🔴 [DEBUG] Dados decodificados:', decoded);

      // Verificar estrutura dos dados - conforme o frontend envia
      if (!decoded.data.data || typeof decoded.data !== 'object') {
        throw new FormatError(400, 'Dados inválidos');
      }

      const { email, code } = decoded.data.data as { email: string; code: string };
      
      console.log('🔴 [DEBUG] Email:', email);
      console.log('🔴 [DEBUG] Código:', code);

      if (!email || !code) {
        throw new FormatError(400, 'E-mail ou código não informado');
      }

      // Verificar código
      await mailService.verifyPasswordRecoveryCode(email, String(code));
      
      // Resposta no formato que o frontend espera
      const responseData = {
        success: true,
        message: 'Código verificado com sucesso',
        verified: true
      };

      const encodedResponse = await CryptoManager.encode(responseData, aes);
      return reply.status(200).send(encodedResponse);

    } catch (error) {
      console.log('❌ [DEBUG] Erro:', error);
      
      // Resposta de erro no formato esperado pelo frontend
      if (error instanceof FormatError) {
        const errorResponse = {
          success: false,
          message: error.message || 'Erro na verificação',
          verified: false
        };
        
        try {
          // Usar aes se estiver disponível
          if (aes) {
            const encodedError = await CryptoManager.encode(errorResponse, aes);
            return reply.status(error.status).send(encodedError);
          } else {
            return reply.status(error.status).send(errorResponse);
          }
        } catch (encodeError) {
          return reply.status(500).send({ 
            success: false, 
            message: 'Erro interno no servidor' 
          });
        }
      }
      
      // Erro genérico
      const errorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        verified: false
      };
      
      try {
        if (aes) {
          const encodedError = await CryptoManager.encode(errorResponse, aes);
          return reply.status(500).send(encodedError);
        } else {
          return reply.status(500).send(errorResponse);
        }
      } catch (encodeError) {
        return reply.status(500).send({ 
          success: false, 
          message: 'Erro interno no servidor' 
        });
      }
    }
  }
  public static async resetPassword(
  request: FastifyRequest<{ Body: RequestBody }>, 
  reply: FastifyReply
) {
  let aes; // Declarar fora do try para ter acesso no catch

  try {

    const { decoded, aes: decodedAes } = await CryptoManager.decode(request.body);
    aes = decodedAes; // Armazenar para usar no catch
    console.log('Decoded data for password reset:', decoded.data.data);
    const { email, newPassword, code } = decoded.data.data as { 
      email: string; 
      newPassword: string;
      code?: string;
    };
    console.log('🔴 [DEBUG] Email:', email);
    console.log('🔴 [DEBUG] New Password:', newPassword);
    // Resetar a senha do usuário
    await userService.resetPassword(email, newPassword);

    return reply.status(200).send(
      await CryptoManager.encode({
        success: true,
        message: 'Senha alterada com sucesso'
      }, aes)
    );

  } catch (error) {
    // Se temos a chave AES, criar resposta criptografada
    if (aes) {
      try {
        const errorResponse = {
          success: false,
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          ...(error && typeof error === 'object' && 'inputErro' in error ? { inputErro: (error as any).inputErro } : {})
        };

        return reply.status((typeof error === 'object' && error !== null && 'status' in error ? (error as any).status : 500)).send(
          await CryptoManager.encode(errorResponse, aes)
        );
      } catch (encodeError) {
        // Se falhar na codificação, usa SendError padrão
        return SendError(error, reply);
      }
    }

    // Se não temos AES, usa SendError padrão
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
  
public static async sendPasswordRecoveryCode(
  request: FastifyRequest<{ Body: RequestBody }>, 
  reply: FastifyReply
) {
  try {
    console.log(request.body)
    const { decoded } = await CryptoManager.decode(request.body);
    console.log("DECODE RECUPERAR ", decoded)
     const email = decoded.data?.data?.email;
    console.log("Email extraído:", email)
    
    console.log(email)
    if (!email) throw new FormatError(400, 'E-mail não informado');

    // Enviar código para o email (similar ao registro)
    await mailService.sendPasswordRecoveryCode(email);

    return reply.status(200).send({
      success: true,
      message: 'Código de recuperação enviado para o e-mail',
    });
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
    
    // Obter dados do usuário usando o token de acesso
    const userData = await authService.getUserDataFromToken(tokens.access);
    console.log('User data recovered:', userData);
    
    console.log('Tokens refreshed:', tokens);

    return reply.status(200).send({ 
      success: true, 
      tokens,
      user: userData // 👈 Enviar dados do usuário diretamente
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
