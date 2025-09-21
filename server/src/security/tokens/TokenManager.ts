// Tipagens
import { type Browser } from '../../types/requestBodyTypes';
import { type TokenPayload, type TokenTable } from '../../templates/tokenTemplates';

// Configurações
import tokensConf from '../../config/keys/tokens.config';

// Retorno do erro
import FormatError from '../../errors/FormatError';

// Variáveis rotacionais
import { usesJwtInstance, getVersionKey } from '../../config/KeyTokens/KeyManager';

// Funções
import TokenValidations from './TokenValidations';
import TokenHashService from '../hashing/TokenHashService';
import BufferConverter from '../utils/BufferConverter';

async function hashBrowserAuth(auth: Browser['auth']): Promise<string> {
  return TokenHashService.hash(new TextEncoder().encode(JSON.stringify(auth)).buffer);
}

async function hashBrowserConnect(connect: string): Promise<string> {
  return TokenHashService.hash(BufferConverter.base64ToArrayBuffer(connect));
}

class TokenManager {
  private validations = new TokenValidations();
private createToken(
  options: { name: Uppercase<string>; expiresIn: number },
  payload: { id: number; bh: string; akid?: string; vCode?: number }
) {
  const current = getVersionKey().current;
  const jti = crypto.randomUUID();

  const table: Omit<TokenTable, 'id_token' | 'expires_at'> = {
    id_user: payload.id, // ← Volte para user_id se a interface ainda usar user_id
    type: options.name,
    browser: payload.bh,
    jti,
  };

  return {
    token: usesJwtInstance().sign(
      { name: options.name, ...payload },
      { kid: current, jti, expiresIn: options.expiresIn }
    ),
    table,
    expiresIn: options.expiresIn,
  };
}
   public decodeToken(token: string): TokenPayload | null {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const decoded = usesJwtInstance().decode(cleanToken);
    console.log("Payload decodificado:", decoded); // 👈 Adicione este log
    return decoded as TokenPayload;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}
  public async generatePairForLogin(id: number, browser: Browser) {
    this.validations.validateBrowser(browser);
    try {
      const bh = await hashBrowserAuth(browser.auth);
      const akid = await hashBrowserConnect(browser.connect);

      return {
        refresh: this.createToken(tokensConf.refresh, { id, bh }),
        access: this.createToken(tokensConf.access, { id, bh, akid }),
      };
    } catch (error) {
      throw new FormatError(500, 'SystemError', {
        message: 'Failed to sign tokens on login-up',
      });
    }
  }

  public async authenticateAccessToken(authorization: string, browser: Browser) {
    this.validations.validateBrowser(browser);

        console.log('authorization', authorization)
    const access = authorization.startsWith('Bearer ') 
  ? authorization.split(' ')[1]
  : authorization;
    console.log('access', access)

  //  await this.validations.validateToken(access, browser);

    try {
      const decoded = usesJwtInstance().decode(access) as TokenPayload;

      const { akid, ...payload } = decoded ?? {};

      // if (
      //   akid &&
      //   payload.id &&
      //   payload.type === tokensConf.access.name &&
      //   !TokenHashService.equalHash(await hashBrowserConnect(browser.connect), payload.bh)
      // ) {
      //   throw new FormatError(401, 'Invalid token content', {
      //     message: 'Invalid token security information',
      //     inputErro: ['TOKEN'],
      //   });
      // }

      return payload;
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'SystemError', { message: 'Failed to decode token in Access' });
    }
  }

  public async refreshTokens(authorization: string, browser: Browser) {
    this.validations.validateBrowser(browser);

    const refresh = authorization.split(' ')[1];
    // await this.validations.validateToken(refresh, browser);

    try {
      const payload = usesJwtInstance().decode(refresh) as Omit<TokenPayload, 'akid'>;

      // if (payload.id && payload.type !== tokensConf.refresh.name)
      //   throw new FormatError(401, 'Invalid token content', {
      //     message: 'Invalid token security information',
      //     inputErro: ['TOKEN'],
      //   });

      return payload;
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'SystemError', { message: 'Failed to decode token in Refresh' });
    }
  }
}

export default TokenManager;
