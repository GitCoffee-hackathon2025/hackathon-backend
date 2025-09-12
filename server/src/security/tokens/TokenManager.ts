// Tipagens
import { type DecryptedRequestData } from '../../typescript/requestBodyType';
import { type ID, type Token, type PairToken } from '../../typescript/token';

// Configurações
import timing from '../../config/keys/timing.config';

// Retorno do erro
import FormatError from '../../errors/FormatError';

// Variáveis rotacionais
import { usesJwtInstance, getVersionKey } from '../../config/KeyTokens/KeyManager';

// Tipagens reais
import TokenTypes from '../../types/TokenTypes';

// Funções
import TokenValidations from './TokenValidations';
import TokenHashService from './TokenHashService';
import BufferConverter from '../utils/BufferConverter';

// Tipagens do arquivo
type Browser = Exclude<DecryptedRequestData['browser'], null>;

function compareTypeToken(typ: Token['type'], official: Token['type']): void {
  if (typ !== official)
    throw new FormatError(401, 'Invalid token', 'Different token type', { inputErro: ['TOKEN'] });
}

class TokenManager {
  public static async issueTokens(id: ID, browser: Browser): Promise<PairToken> {
    TokenValidations.validateBrowser(browser);

    const auth = await TokenHashService.hash(
      new TextEncoder().encode(JSON.stringify(browser.auth)).buffer
    );
    const connect = await TokenHashService.hash(
      BufferConverter.base64ToArrayBuffer(browser.connect)
    );
    try {
      return {
        refresh: usesJwtInstance().sign(
          { id, type: TokenTypes.refresh, bh: auth },
          { kid: getVersionKey().current, expiresIn: timing.expires.refresh }
        ),
        access: usesJwtInstance().sign(
          { id, type: TokenTypes.access, bh: auth, akid: connect },
          { kid: getVersionKey().current, expiresIn: timing.expires.refresh }
        ),
      };
    } catch (error) {
      throw new FormatError(500, 'SystemError', 'Failed to sign tokens on login-up');
    }
  }

  public static async authenticateAccessToken(
    authorization: string,
    browser: Browser
  ): Promise<ID> {
    TokenValidations.validateBrowser(browser);

    const token = authorization.split(' ')[1];
    await TokenValidations.validateToken(token, browser);

    try {
      const { id, type, akid } = usesJwtInstance().decode(token) as Token;

      compareTypeToken(type, TokenTypes.access);

      if (
        id &&
        akid &&
        !TokenHashService.equalHash(
          await TokenHashService.hash(BufferConverter.base64ToArrayBuffer(browser.connect)),
          akid
        )
      )
        throw new FormatError(401, 'Invalid token content', 'Invalid token security information', {
          inputErro: ['TOKEN'],
        });

      return id;
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'SystemError', 'Failed to decode token in Access');
    }
  }

  public static async refreshTokens(authorization: string, browser: Browser) {
    TokenValidations.validateBrowser(browser);

    const token = authorization.split(' ')[1];
    await TokenValidations.validateToken(token, browser);

    try {
      const { id, type } = usesJwtInstance().decode(token) as Token;

      compareTypeToken(type, TokenTypes.refresh);

      if (!id)
        throw new FormatError(401, 'Invalid token content', 'Invalid token security information', {
          inputErro: ['TOKEN'],
        });

      return await this.issueTokens(id, browser);
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'SystemError', 'Failed to decode token in Refresh');
    }
  }
}

export default TokenManager;
