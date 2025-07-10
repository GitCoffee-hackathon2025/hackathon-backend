import { generateKeyPair, exportJWK } from 'jose';
import KeyManagerCrypto from './KeyManager';

class KeyBootstrapCrypto extends KeyManagerCrypto {
  private static time = 604800000;

  private static _initCalled = false;

  public static async init(): Promise<boolean> {
    try {
      if (this._initCalled) throw new Error('not allowed to restart');
      this._initCalled = true;

      const createKeys = async () => {
        const newPair = await generateKeyPair('RSA-OAEP', {
          modulusLength: 2048,
          extractable: true,
        }).then(async ({ publicKey, privateKey }) => ({
          public: await exportJWK(publicKey),
          private: await exportJWK(privateKey),
        }));

        if (KeyManagerCrypto.keys.private != KeyManagerCrypto.keys.old)
          KeyManagerCrypto.keys.old = KeyManagerCrypto.keys.private;

        KeyManagerCrypto.keys.public = newPair.public;
        KeyManagerCrypto.keys.private = newPair.private;

        setTimeout(async () => await createKeys(), this.time);
      };
      await createKeys();
      return true;
    } catch (err) {
      return false;
    }
  }
}

export default KeyBootstrapCrypto;
