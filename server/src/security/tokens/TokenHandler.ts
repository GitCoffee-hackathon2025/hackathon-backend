// Tipagens
import { type DecryptedRequestData } from '../../typescript/requestBodyType';
import { type ID, type Token, type PairToken } from '../../typescript/token';

// Configurações
import webcrypto from '../../config/keys/crypto.config';
import timing from '../../config/keys/timing.config';

// Retorno do erro
import FormatError from '../../errors/FormatError';

// Variáveis rotacionais
import { usesJwtInstance, usesSaltToken, getVersionKey } from '../../config/KeyTokens/KeyManager';

// Funções
import concatArrayBuffer from '../utils/concatArrayBuffer';
import BufferConverter from '../utils/BufferConverter';

// Tipagens do Arquivo
type Browser = Exclude<DecryptedRequestData['browser'], null>;

const inputErro: Uppercase<string>[] = ['TOKEN'];

class TokenHandler {
  private static async hash(payload: ArrayBuffer, useOld: boolean = false): Promise<string> {
    try {
      return BufferConverter.arrayBufferToBase64(
        await crypto.subtle.digest(
          webcrypto.jwt.alg.hash.name,
          concatArrayBuffer(payload, usesSaltToken()[!useOld ? 'current' : 'old'].buffer)
        )
      );
    } catch (error) {
      throw new FormatError(500, 'SystemError', 'Data hash failed for token', {
        inputErro,
      });
    }
  }

  private static equalHash(buf1: string, buf2: string): boolean {
    const buffers = [
      BufferConverter.base64ToArrayBuffer(buf1),
      BufferConverter.base64ToArrayBuffer(buf2),
    ];
    const str = [...buffers].map((buf) => Buffer.from(new Uint8Array(buf)).toString('base64'));

    return str[0] === str[1];
  }

  private static async validateToken(token: string, browser: Browser): Promise<void> {
    try {
      try {
        usesJwtInstance().verify(token);
      } catch (error) {
        throw new FormatError(401, 'Expired token', 'Token does not belong to the server', {
          inputErro,
        });
      }

      const payload = usesJwtInstance().decode(token) as Token;

      if (!payload || typeof payload !== 'object') {
        throw new FormatError(
          400,
          'Invalid token structure',
          'Invalid token payload structure format',
          { inputErro }
        );
      }

      const { bh } = payload;
      const bufferAuth = new TextEncoder().encode(JSON.stringify(browser.auth)).buffer;

      if (
        bh && !this.equalHash(await this.hash(bufferAuth), bh)
          ? !this.equalHash(await this.hash(bufferAuth, true), bh)
          : false
      )
        throw new FormatError(401, 'Invalid token content', 'Token payload hash invalid', {
          inputErro,
        });
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'SystemError', 'Token validation failed', { inputErro });
    }
  }

  private static validateBrowser(browser: Browser): void {
    if (typeof browser.auth.number !== 'number' || typeof browser.auth.string !== 'string')
      throw new FormatError(400, 'Identifier violation', 'Browser IDs do not exist', {
        inputErro: ['TOKEN', 'BROWSER'],
      });

    const str = browser.auth.string.length;
    const num = String(browser.auth.number).length;
    if (str < 16 || str > 256 || num < 9 || num > 10)
      throw new FormatError(400, 'Identifier violation', 'Different browser IDs', {
        inputErro: ['TOKEN', 'BROWSER'],
      });

    const connect = BufferConverter.base64ToArrayBuffer(browser.connect);
    if (connect.byteLength !== 16)
      throw new FormatError(400, 'First key invalid', 'First aes key size different', {
        inputErro: ['TOKEN', 'BROWSER'],
      });
  }

  public static async issueTokens(id: ID, browser: Browser): Promise<PairToken> {
    this.validateBrowser(browser);

    const auth = await this.hash(new TextEncoder().encode(JSON.stringify(browser.auth)).buffer);
    const connect = await this.hash(BufferConverter.base64ToArrayBuffer(browser.connect));
    try {
      return {
        refresh: usesJwtInstance().sign(
          { id, bh: auth },
          { kid: getVersionKey().current, expiresIn: timing.expires.refresh }
        ),
        access: usesJwtInstance().sign(
          { id, bh: auth, akid: connect },
          {
            kid: getVersionKey().current,
            expiresIn: timing.expires.refresh,
          }
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
    this.validateBrowser(browser);

    const token = authorization.split(' ')[1];
    await this.validateToken(token, browser);

    try {
      const { id, akid } = usesJwtInstance().decode(token) as Token;

      if (
        id &&
        akid &&
        !this.equalHash(await this.hash(BufferConverter.base64ToArrayBuffer(browser.connect)), akid)
      )
        throw new FormatError(401, 'Invalid token content', 'Invalid token security information', {
          inputErro,
        });

      return id;
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'SystemError', 'Failed to decode token in Access');
    }
  }

  public static async refreshTokens(authorization: string, browser: Browser) {
    this.validateBrowser(browser);

    const token = authorization.split(' ')[1];
    await this.validateToken(token, browser);

    try {
      const { id } = usesJwtInstance().decode(token) as Token;
      if (!id)
        throw new FormatError(401, 'Invalid token content', 'Invalid token security information', {
          inputErro,
        });

      return await this.issueTokens(id, browser);
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'SystemError', 'Failed to decode token in Refresh');
    }
  }
}

export default TokenHandler;
