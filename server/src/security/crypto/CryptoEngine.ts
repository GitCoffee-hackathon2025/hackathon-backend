// Tipagens
import {
  type RequestBody,
  type DecryptedRequestData,
  type Kid,
} from '../../typescript/requestBodyType';

// Configurações
import webcrypto from '../../config/keys/crypto.config';

// Retorno do erro
import FormatError from '../../errors/FormatError';

// Funções
import { getKey, getVersionKey } from '../../config/keyCrypto/KeyManager';
import BufferConverter from '../utils/BufferConverter';
import concatArrayBuffer from '../utils/concatArrayBuffer';

// Tipagens do arquivo
type CrudeBody = Omit<RequestBody, 'header' | 'ek'>;

class CryptoEngine {
  public async sendPublicKey(): Promise<{
    key: JsonWebKey;
    kid: Kid;
  }> {
    try {
      const key = await getKey('public');
      return {
        // enviando chave privada exportada
        key: await crypto.subtle.exportKey(webcrypto.rsa.format, key.key),
        kid: key.kid,
      };
    } catch (error) {
      throw new FormatError(500, 'SystemError', 'Failed to call and export public rsa key');
    }
  }

  private async importKey(aesExported: ArrayBuffer): Promise<CryptoKey> {
    try {
      // convertendo a chave para CryptoKey
      return await crypto.subtle.importKey(
        webcrypto.aes.format,
        aesExported,
        webcrypto.aes.alg.name,
        true,
        [...webcrypto.aes.keyUsages]
      );
    } catch (error) {
      throw new FormatError(500, 'SystemError', 'Error calling aes key');
    }
  }

  public async decodeKey(ek: string, kid: Kid): Promise<CryptoKey> {
    try {
      // descriptografando chave AES
      return await this.importKey(
        await crypto.subtle.decrypt(
          // criando uma função autoexecutavel que retorna o name e hash
          (({ name, hash }) => ({ name, hash }))(webcrypto.rsa.alg),
          // comparando a versão (já verificada) da requisição e puxando a chave dela
          (
            await getKey(kid === getVersionKey().current ? 'private' : 'old')
          ).key,
          BufferConverter.base64ToArrayBuffer(ek)
        )
      );
    } catch (error) {
      if (error instanceof FormatError) throw error;

      throw new FormatError(401, 'Vandalized aes key', 'Corrupted or tampered request aes key', {
        inputErro: ['CRYPTO'],
      });
    }
  }

  public async decodeData(body: CrudeBody, aes: CryptoKey): Promise<DecryptedRequestData> {
    try {
      // descriptando o dado
      return await crypto.subtle
        .decrypt(
          { name: webcrypto.aes.alg.name, iv: BufferConverter.base64ToArrayBuffer(body.iv) },
          aes,
          // concatenando o ct com tag
          concatArrayBuffer(
            BufferConverter.base64ToArrayBuffer(body.ct),
            BufferConverter.base64ToArrayBuffer(body.tag)
          )
        )
        // ArrayBuffer -> JSON -> código
        .then((result) => JSON.parse(new TextDecoder().decode(result)));
    } catch (error) {
      throw new FormatError(
        400,
        'Malformed ciphertext',
        'Error decrypting data received from the request',
        { inputErro: ['CRYPTO'] }
      );
    }
  }

  public async encodeData(data: Record<string, any>, aes: CryptoKey): Promise<CrudeBody> {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const { ciphertext, tag } = await crypto.subtle
        .encrypt(
          { name: webcrypto.aes.alg.name, iv },
          aes,
          new TextEncoder().encode(JSON.stringify(data))
        )
        .then((ek) => ({
          ciphertext: ek.slice(0, ek.byteLength - 16),
          tag: ek.slice(ek.byteLength - 16),
        }));

      return {
        ct: BufferConverter.arrayBufferToBase64(ciphertext),
        iv: BufferConverter.arrayBufferToBase64(iv.buffer),
        tag: BufferConverter.arrayBufferToBase64(tag),
      };
    } catch (error) {
      throw new FormatError(500, 'SystemError', 'Response encryption failed');
    }
  }
}

const cryptoEngine = new CryptoEngine();
export default cryptoEngine;
