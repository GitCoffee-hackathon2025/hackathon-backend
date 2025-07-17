import { generateKeyPair, exportJWK } from 'jose';
import { constants, registerToken, setKey } from './KeyManager';
import type uuidType from './uuidType';

class KeyBootstrapCrypto {
  private static token: uuidType = crypto.randomUUID();

  private static time: number = 604800000;

  private static _initCalled: boolean = false;

  public static async init(): Promise<void> {
    if (this._initCalled) throw new Error('not allowed to restart');
    this._initCalled = true;

    registerToken(this.token);

    const createKeys = async () => {
      await generateKeyPair(constants.jwa.algRSA, {
        modulusLength: 2048,
        extractable: true,
      }).then(async ({ publicKey, privateKey }) => {
        const newKeys = {
          publicKey: await exportJWK(publicKey),
          privateKey: await exportJWK(privateKey),
        };
        setKey(newKeys, this.token);
      });

      setTimeout(async () => await createKeys(), this.time);
    };
    await createKeys();
    return;
  }
}

export default KeyBootstrapCrypto;
