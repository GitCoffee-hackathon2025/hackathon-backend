import {
  exportSPKI,
  CompactEncrypt,
  compactDecrypt,
  CompactDecryptResult,
  CompactJWEHeaderParameters,
} from 'jose';

import { constants, getKey } from '../../config/keyCrypto/KeyManager';
import analyzeError from './utils/analyzeError';

class CryptoEngine {
  private async resolveSecureAESKey(
    grossAES: string,
    allowOld: boolean = false
  ): Promise<
    | {
        status: true;
        result: { key: CryptoKey; version: string };
      }
    | {
        status: false;
        result: string;
      }
  > {
    try {
      // puxando chave privada e descriptando chave AES
      const privateKey = await getKey('private');

      // descriptando a chave AES do Front com a privada ou a velha
      const aes: {
        plaintext: CompactDecryptResult['plaintext'];
        protectedHeader: CompactJWEHeaderParameters;
        versionUsed: string;
      } = await compactDecrypt(grossAES, privateKey.key)
        .then((key) => ({
          ...key,
          versionUsed: privateKey.version,
        }))
        .catch(async (err) => {
          const verify = analyzeError(err);
          if (
            !allowOld &&
            privateKey.version === '0' &&
            verify != undefined &&
            verify != 'decryption failed'
          )
            throw new Error(verify);

          const oldKey = await getKey('old');
          return await compactDecrypt(grossAES, oldKey.key)
            .then((key) => ({ ...key, versionUsed: oldKey.version }))
            .catch((err) => {
              throw new Error(analyzeError(err));
            });
        });

      // validando header
      if (aes.protectedHeader.alg != constants.algAES)
        throw new Error('arg different from the original');
      if (aes.protectedHeader.enc != constants.encAES)
        throw new Error('enc different from the original');
      if (aes.protectedHeader.kid != aes.versionUsed) throw new Error('non-coherent key version');

      // preparando chave AES
      const aesKey = await crypto.subtle.importKey(
        'raw',
        aes.plaintext,
        { name: constants.encAES },
        false,
        ['encrypt', 'decrypt']
      );

      return { status: true, result: { key: aesKey, version: aes.versionUsed } };
    } catch (err) {
      return { status: false, result: String(err) };
    }
  }

  /* ------------------------- */

  public async getPublic() {
    try {
      // puxando a chave publica e enviando em formato SPKI junto com sua versão
      const key = await getKey('public');
      return {
        status: true,
        result: {
          key: await exportSPKI(key.key),
          version: key.version,
        },
      };
    } catch (err) {
      return {
        status: false,
        result: String(err),
      };
    }
  }

  /* ------------------------- */

  public async encode(
    info: Record<string, any>,
    groosAES: { key: string; groos: true } | { key: CryptoKey; version: string; groos: false }
  ) {
    try {
      // puxando chave privada e descriptando chave AES
      const aes = groosAES.groos
        ? await this.resolveSecureAESKey(groosAES.key)
        : {
            status: true,
            result: {
              key: groosAES.key,
              version: groosAES.version,
            },
          };
      if (aes.status == false) throw new Error(String(aes.result));

      // criptando dado que será enviado
      const bufferPayload = new TextEncoder().encode(JSON.stringify(info));
      return {
        status: true,
        result: await new CompactEncrypt(bufferPayload)
          .setProtectedHeader({
            alg: constants.algAES,
            enc: constants.encAES,
            kid: aes.result.version,
          })
          .encrypt(aes.result.key),
      };
    } catch (err) {
      return {
        status: false,
        result: String(err),
      };
    }
  }

  /* ------------------------- */

  public async decode(body: string) {
    try {
      // separando chave do dado
      const [grossAES, grossInfo] = body.split(':::');

      // verificando se existe os dois
      if (!grossAES || !grossInfo) throw new Error('there is no key or data');

      // descriptando a chave AES do Front com a privada ou a velha
      const aes = await this.resolveSecureAESKey(grossAES, true);

      if (aes.status == false) throw new Error(String(aes.result));

      // descriptando o dado recebido
      const info = await compactDecrypt(grossInfo, aes.result.key);

      // validação do header do payload criptografado
      if (info.protectedHeader.alg !== constants.algAES)
        throw new Error('arg different from the original');
      if (info.protectedHeader.enc !== constants.encAES)
        throw new Error('enc different from the original');

      // concluindo conversão
      const payload: Record<string, any> = JSON.parse(new TextDecoder().decode(info.plaintext));

      // validando dado
      if (typeof payload !== 'object' || payload === null || Array.isArray(payload))
        throw new Error('data in invalid format');

      return {
        status: true,
        result: {
          payload,
          aes: {
            key: aes.result.key,
            version: aes.result.version,
          },
        },
      };
    } catch (err) {
      return {
        status: false,
        result: String(err),
      };
    }
  }
}
