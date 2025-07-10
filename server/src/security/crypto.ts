import { JOSEAlgNotAllowed, JWEDecryptionFailed, JWEInvalid } from 'jose/dist/types/util/errors';
import generateKeys from '../config/rsa';
import {
  importJWK,
  exportSPKI,
  type JWK,
  CompactEncrypt,
  compactDecrypt,
  CompactJWEHeaderParameters,
} from 'jose';

// const locale = 'crypto.ts';

function analyzeError(err: unknown) {
  if (err instanceof JOSEAlgNotAllowed) return 'alg is not allowed';

  if (err instanceof JWEInvalid) return 'invalid compact jwe';

  if (err instanceof TypeError || err instanceof SyntaxError) return 'invalid encoding';

  if (err instanceof JWEDecryptionFailed) return 'decryption failed';
}

class KeyManager {
  protected static keys: { public: JWK; private: JWK; old: JWK } = {
    public: {} as JWK,
    private: {} as JWK,
    old: {} as JWK,
  };

  private time = 604800000;

  private _initCalled = false;

  public async init(): Promise<boolean> {
    try {
      if (this._initCalled) throw new Error('not allowed to restart');
      this._initCalled = true;

      const createKeys = async () => {
        const newPair = await generateKeys('crypto');

        if (KeyManager.keys.private != KeyManager.keys.old)
          KeyManager.keys.old = KeyManager.keys.private;

        KeyManager.keys.public = newPair.public;
        KeyManager.keys.private = newPair.private;

        setTimeout(async () => await createKeys(), this.time);
      };
      await createKeys();
      return true;
    } catch (err) {
      return false;
    }
  }
}

interface test {
  updated: boolean;
  plaintext: Uint8Array;
  protectedHeader: CompactJWEHeaderParameters;
}

class CryptoEngine extends KeyManager {
  private async importKey<K extends keyof typeof KeyManager.keys>(key: K): Promise<CryptoKey> {
    return (await importJWK(KeyManager.keys[key], 'RSA-OAEP')) as CryptoKey;
  }

  public async getPublic() {
    return await exportSPKI(await this.importKey('public'));
  }

  public async encode(info: Record<string, any>) {
    try {
      const payload = new TextEncoder().encode(JSON.stringify(info));
      return await new CompactEncrypt(payload)
        .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' })
        .encrypt(await this.importKey('public'));
    } catch (err) {
      return false;
    }
  }

  public async decode(grossInfo: string) {
    try {
      const {
        plaintext,
        protectedHeader,
        updated,
      }: {
        updated: boolean;
        plaintext: Uint8Array;
        protectedHeader: CompactJWEHeaderParameters;
      } = await compactDecrypt(grossInfo, await this.importKey('private'))
        .then((info) => ({ ...info, updated: true }))
        .catch(async (err) => {
          const verify = analyzeError(err);
          if (verify != undefined && verify != 'decryption failed') throw new Error(verify);

          return await compactDecrypt(grossInfo, await this.importKey('old'))
            .then((info) => ({ ...info, updated: false }))
            .catch((err) => {
              throw new Error(analyzeError(err));
            });
        });

        // console.log({ plaintext, protectedHeader, updated });

    } catch (err) {
      // console.log(err);
    }
  }
}

// class test {
//   protected abc() {
//     return true;
//   }
// }

// const aa = new test();
// export const abc = new class extends test {
//   public createaa() { return this.abc }
// }().createaa
