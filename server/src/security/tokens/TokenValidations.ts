// Tipagens
import { type DecryptedRequestData } from '../../types/requestBodyTypes';
import { type TokenPayload } from '../../templates/tokenTemplates';

// Retorno do erro
import FormatError from '../../errors/FormatError';

// Variáveis rotacionais
import { usesJwtInstance } from '../../config/KeyTokens/KeyManager';

// Funções
import TokenHashService from '../hashing/TokenHashService';
import BufferConverter from '../utils/BufferConverter';

// Tipagens do arquivo
type Browser = Exclude<DecryptedRequestData['browser'], null>;

function compareTypeToken(typ: TokenPayload['type'], official: TokenPayload['type']): void {
  if (typ !== official)
    throw new FormatError(401, 'Invalid token', {
      message: 'Different token type',
      inputErro: ['TOKEN'],
    });
}

class TokenValidations {
  public async validateToken(token: string, browser: Browser): Promise<void> {
    try {
      try {
        usesJwtInstance().verify(token);
      } catch (error) {
        throw new FormatError(401, 'Expired', {
          message: 'Token does not belong to the server',
          inputErro: ['TOKEN'],
        });
      }

      const payload = usesJwtInstance().decode(token) as TokenPayload;

      if (!payload || typeof payload !== 'object') {
        throw new FormatError(
          400,
          'Invalid token structure',

          { message: 'Invalid token payload structure format', inputErro: ['TOKEN'] }
        );
      }

      const { bh } = payload;
      const bufferAuth = new TextEncoder().encode(JSON.stringify(browser.auth)).buffer;

      if (
        bh && !TokenHashService.equalHash(await TokenHashService.hash(bufferAuth), bh)
          ? !TokenHashService.equalHash(await TokenHashService.hash(bufferAuth, true), bh)
          : false
      )
        throw new FormatError(401, 'Invalid token content', {
          message: 'Token payload hash invalid',
          inputErro: ['TOKEN'],
        });
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'SystemError', {
        message: 'Token validation failed',
        inputErro: ['TOKEN'],
      });
    }
  }

  public validateBrowser(browser: Browser): void {
    if (typeof browser.auth.number !== 'number' || typeof browser.auth.string !== 'string')
      throw new FormatError(400, 'Identifier violation', {
        message: 'Browser IDs do not exist',
        inputErro: ['TOKEN', 'BROWSER'],
      });

    const str = browser.auth.string.length;
    const num = String(browser.auth.number).length;

    if (str < 16 || str > 256 || num < 9 || num > 10)
      throw new FormatError(400, 'Identifier violation', {
        message: 'Different browser IDs',
        inputErro: ['TOKEN', 'BROWSER'],
      });

    const connect = BufferConverter.base64ToArrayBuffer(browser.connect);
    if (connect.byteLength !== 16)
      throw new FormatError(400, 'First key invalid', {
        message: 'First aes key size different',
        inputErro: ['TOKEN', 'BROWSER'],
      });
  }
}

export default TokenValidations;
