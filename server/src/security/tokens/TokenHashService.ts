// Configurações
import webcrypto from '../../config/keys/crypto.config';

// Retorno do erro
import FormatError from '../../errors/FormatError';

// Variáveis rotacionais
import { usesSaltToken } from '../../config/KeyTokens/KeyManager';

// Funções
import concatArrayBuffer from '../utils/concatArrayBuffer';
import BufferConverter from '../utils/BufferConverter';

class TokenHashService {
  public static async hash(payload: ArrayBuffer, useOld: boolean = false): Promise<string> {
    try {
      return BufferConverter.arrayBufferToBase64(
        await crypto.subtle.digest(
          webcrypto.jwt.alg.hash.name,
          concatArrayBuffer(payload, usesSaltToken()[!useOld ? 'current' : 'old'].buffer)
        )
      );
    } catch (error) {
      throw new FormatError(500, 'SystemError', 'Data hash failed for token', {
        inputErro: ['TOKEN'],
      });
    }
  }

  public static equalHash(buf1: string, buf2: string): boolean {
    const buffers = [
      BufferConverter.base64ToArrayBuffer(buf1),
      BufferConverter.base64ToArrayBuffer(buf2),
    ];
    const str = [...buffers].map((buf) => Buffer.from(new Uint8Array(buf)).toString('base64'));

    return str[0] === str[1];
  }
}

export default TokenHashService;
