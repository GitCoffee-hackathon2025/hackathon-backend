import { generateKeyPair, exportJWK } from 'jose';
import { constants, setKey } from './KeyManager';

class KeyBootstrapCrypto {
  private static time = 604800000;

  private static _initCalled = false;

  public static async init(): Promise<boolean> {
    try {
      if (this._initCalled) throw new Error('not allowed to restart');
      this._initCalled = true;

      const createKeys = async () => {
        await generateKeyPair(constants.algRSA, {
          modulusLength: 2048,
          extractable: true,
        }).then(async ({ publicKey, privateKey }) => {
          const newKeys = {
            publicKey: await exportJWK(publicKey),
            privateKey: await exportJWK(privateKey),
          };
          setKey(newKeys);
        });

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
