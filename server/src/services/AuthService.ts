// Tipagens
import { type Browser } from '../types/requestBodyTypes';
import { type TokenTable, type TokenPayload } from '../templates/tokenTemplates';

// Configurações
import tokensConf from '../config/keys/tokens.config';

// Banco
import TokenEntity from '../entities/TokenEntity';
import TokenRepository from '../repositories/TokenRepository';
import UserEntity from '../entities/UserEntity';

// Retorno de erro
import FormatError from '../errors/FormatError';

// Funções
import TokenManager from '../security/tokens/TokenManager';
import UserRepository from '../repositories/UserRepository';
class AuthService {
  private repo = new TokenRepository();
  private userRepo = UserRepository;
  private tokenManager = new TokenManager();

  private validateToken(type: Uppercase<string>, payload: TokenPayload, stored: TokenTable | null) {
    if (!stored)
      throw new FormatError(404, 'Token não encontrado', {
        inputErro: ['TOKEN'],
      });

    if (![type, stored.type].every(payload.type as any))
      throw new FormatError(403, 'Tipo de token usado inválido', {
        inputErro: ['TOKEN'],
      });

    if (payload.bh !== stored.browser)
      throw new FormatError(401, 'Credenciais do navegador inválidas', {
        inputErro: ['TOKEN'],
      });

    if (payload.id !== stored['id_user'])
      throw new FormatError(401, 'Usuário do token inválido', {
        inputErro: ['TOKEN'],
      });
  }

    public async getUserDataFromToken(token: string): Promise<any> {
    try {
      console.log('Obtendo dados do usuário do token:', token);
      
      // Decodificar o token para obter o payload
      const payload = this.tokenManager.decodeToken(token);
      
      if (!payload || !payload.id) {
        throw new FormatError(401, 'Token inválido ou sem ID de usuário');
      }

      console.log('Payload decodificado:', payload);

      // Buscar dados do usuário no banco de dados
      // Você precisa implementar o UserRepository.findById()
      const userData = await this.userRepo.findById(payload.id);
      
      if (!userData) {
        throw new FormatError(404, 'Usuário não encontrado');
      }

      console.log('Dados do usuário encontrados:', userData);

      // Retornar apenas os dados necessários (evitar dados sensíveis)
      return {
        id: userData.id_user,
        email: userData.email,
        name: userData.name,
        dateBirth: userData.dateBirth, // ajuste conforme seu schema
        // adicione outros campos necessários
      };
    } catch (error) {
      console.error('Erro em getUserDataFromToken:', error);
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'Erro ao obter dados do usuário');
    }
  }

  public async issueTokens(userId: number, browser: Browser) {
  try {
    const { refresh, access } = await this.tokenManager.generatePairForLogin(userId, browser);

    if (!(await this.repo.deleteAllByUserId(userId)))
      throw new FormatError(500, 'Não foi possível limpar os tokens');

    for (const props of Object.values({ refresh, access })) {
      const Token = new TokenEntity();
      
      // Como você já mudou tudo para id_user, props.table já deve ter id_user
      Object.assign(Token, props.table);
      
      // Adicione a relação com o usuário
      Token.user = { id_user: userId } as UserEntity;

      if (!(await this.repo.save(Token, props.expiresIn)))
        throw new FormatError(500, 'Falha ao armazenar os tokens');
    }

    return { refresh: refresh.token, access: access.token };
  } catch (error) {
    if (error instanceof FormatError) throw error;
    throw new FormatError(500, 'Erro ao criar tokens');
  }
}

  public async authenticateAccess(auth: string, browser: Browser) {
    try {
      const token = await this.tokenManager.authenticateAccessToken(auth, browser);
      const stored = await this.repo.findByJti(token.jti);


      return stored!['id_user'];
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'Erro ao autenticar usuário');
    }
  }

  public async refreshTokens(auth: string, browser: Browser) {
    try {
      console.log('Refreshing tokens with auth:', auth, 'and browser:', browser);
      const token = await this.tokenManager.refreshTokens(auth, browser);
      console.log('Token payload:', token);
      const stored = await this.repo.findByJti(token.jti);

      const userId = stored!['id_user'];

      await this.repo.deleteAllByUserId(userId);

      return this.issueTokens(userId, browser);
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'Erro ao re-autenticar usuário');
    }
  }
  public async deleteAll(userId: number): Promise<boolean> {
    return this.repo.deleteAllByUserId(userId);
  }
}

const authService = new AuthService();
export default authService;
