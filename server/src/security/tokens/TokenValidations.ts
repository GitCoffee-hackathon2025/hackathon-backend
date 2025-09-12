// Tipagens
import { type DecryptedRequestData } from '../../typescript/requestBodyType';
import { type Token } from '../../typescript/token';

// Retorno do erro
import FormatError from '../../errors/FormatError';

// Variáveis rotacionais
import { usesJwtInstance } from '../../config/KeyTokens/KeyManager';

// Funções
import TokenHashService from './TokenHashService';
import BufferConverter from '../utils/BufferConverter';

// Tipagens do arquivo
type Browser = Exclude<DecryptedRequestData['browser'], null>;

function compareTypeToken(typ: Token['type'], official: Token['type']): void {
  if (typ !== official)
    throw new FormatError(401, 'Invalid token', 'Different token type', { inputErro: ['TOKEN'] });
}

class TokenValidations {
  public static async validateToken(token: string, browser: Browser): Promise<void> {
    try {
      try {
        usesJwtInstance().verify(token);
      } catch (error) {
        throw new FormatError(401, 'Expired token', 'Token does not belong to the server', {
          inputErro: ['TOKEN'],
        });
      }

      const payload = usesJwtInstance().decode(token) as Token;

      if (!payload || typeof payload !== 'object') {
        throw new FormatError(
          400,
          'Invalid token structure',
          'Invalid token payload structure format',
          { inputErro: ['TOKEN'] }
        );
      }

      const { bh } = payload;
      const bufferAuth = new TextEncoder().encode(JSON.stringify(browser.auth)).buffer;

      if (
        bh && !TokenHashService.equalHash(await TokenHashService.hash(bufferAuth), bh)
          ? !TokenHashService.equalHash(await TokenHashService.hash(bufferAuth, true), bh)
          : false
      )
        throw new FormatError(401, 'Invalid token content', 'Token payload hash invalid', {
          inputErro: ['TOKEN'],
        });
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'SystemError', 'Token validation failed', {
        inputErro: ['TOKEN'],
      });
    }
  }

  public static validateBrowser(browser: Browser): void {
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
}

export default TokenValidations;
