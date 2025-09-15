// Tipagens
import { type Browser } from '../types/requestBodyTypes';
import { type TokenTable, type TokenPayload } from '../templates/tokenTemplates';

// Configurações
import tokensConf from '../config/keys/tokens.config';

// Banco
import TokenEntity from '../entities/token';
import TokenRepository from '../repositories/TokenRepository';

// Retorno de erro
import FormatError from '../errors/FormatError';

// Funções
import TokenManager from '../security/tokens/newTokenManager';

class AuthService {
  private repo = new TokenRepository();
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

    if (payload.id !== stored['user_id'])
      throw new FormatError(401, 'Usuário do token inválido', {
        inputErro: ['TOKEN'],
      });
  }

  public async issueTokens(userId: number, browser: Browser) {
    try {
      const { refresh, access } = await this.tokenManager.generatePairForLogin(userId, browser);

      if (!(await this.repo.deleteAllByUserId(userId)))
        throw new FormatError(500, 'Não foi possível limpar os tokens');

      for (const props of Object.values({ refresh, access })) {
        const Token = new TokenEntity();
        Object.assign(Token, props.table);

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

      this.validateToken(tokensConf.access.name, token, stored);

      return stored!['user_id'];
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'Erro ao autenticar usuário');
    }
  }

  public async refreshTokens(auth: string, browser: Browser) {
    try {
      const token = await this.tokenManager.refreshTokens(auth, browser);
      const stored = await this.repo.findByJti(token.jti);

      this.validateToken(tokensConf.refresh.name, token, stored);

      return this.issueTokens(stored!['user_id'], browser);
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
