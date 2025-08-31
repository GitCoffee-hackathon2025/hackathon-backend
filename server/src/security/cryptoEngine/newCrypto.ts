import { subtle } from 'crypto';

import { webcrypto, getKey, getVersionKey } from '../../config/keyCrypto/KeyManager';
import { type RequestBody, type DecryptedRequestData } from '../../typescript/requestBodyType';

class CryptoEngine {
  public static async sendPublicKey(): Promise<{
    key: JsonWebKey;
    kid: `${number}v`;
  }> {
    const key = await getKey('public');
    return {
      // enviando chave privada exportada
      key: await subtle.exportKey(webcrypto.rsa.format, key.key),
      kid: key.kid,
    };
  }

  private static async importKey(aesExported: ArrayBuffer) {
    // convertendo a chave para CryptoKey
    return await subtle.importKey(webcrypto.aes.format, aesExported, webcrypto.aes.alg.name, true, [
      ...webcrypto.aes.keyUsages,
    ]);
  }

  private static concatArrayBuffer(buf1: ArrayBuffer, buf2: ArrayBuffer): ArrayBuffer {
    // cria um buffer temporario do tamanho da soma
    const tmp = new Uint8Array(buf1.byteLength + buf2.byteLength);

    // pega os valores dos buffers e os coloca nas posições
    tmp.set(new Uint8Array(buf1), 0);
    tmp.set(new Uint8Array(buf2), buf1.byteLength);

    // retorna o buffer resultante
    return tmp.buffer;
  }

  private aes!: ArrayBuffer;

  private _init: boolean = false;

  public async init(ct: ArrayBuffer, kid: `${number}v`) {
    if (this._init) return false;
    this._init = true;

    // descriptografando chave AES exportada
    this.aes = await subtle.decrypt(
      // criando uma função autoexecutavel que retorna o name e hash
      (({ name, hash }) => ({ name, hash }))(webcrypto.rsa.alg),
      // comparando a versão (já verificada) da requisição e puxando a chave dela
      (
        await getKey(kid === getVersionKey().current ? 'private' : 'old')
      ).key,
      ct
    );

    return true;
  }

  public async decode(body: Omit<RequestBody, 'header' | 'ct'>): Promise<DecryptedRequestData> {
    if (!this._init) throw new Error('not started key');

    // importando chave AES
    const aes = await CryptoEngine.importKey(this.aes);

    // descriptando o dado
    return await subtle
      .decrypt(
        { name: webcrypto.aes.alg.name, iv: body.iv },
        aes,
        // concatenando o ct com tag
        CryptoEngine.concatArrayBuffer(body.ek, body.tag)
      )
      // desconvertendo do ArrayBuffer -> JSON -> leitura de código
      .then((result) => JSON.parse(new TextDecoder().decode(result)));
  }
}

const cryptoEngine = new CryptoEngine();
export default cryptoEngine;
