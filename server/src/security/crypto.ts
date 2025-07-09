import { JOSEAlgNotAllowed, JWEDecryptionFailed, JWEInvalid } from 'jose/dist/types/util/errors';
import generateKeys from '../config/rsa';
import { importJWK, exportSPKI, type JWK, CompactEncrypt, compactDecrypt } from 'jose';

// const locale = 'crypto.ts';

function analyzeError(err: unknown) {
  if (err instanceof JOSEAlgNotAllowed) 
    return { msg: 'alg is not allowed', status: false };

  if (err instanceof JWEInvalid) 
    return { msg: 'invalid compact jwe', status: false };

  if (err instanceof TypeError || err instanceof SyntaxError)
    return { msg: 'invalid encoding', status: false };

  if (err instanceof JWEDecryptionFailed) 
    return { msg: 'decryption failed', status: false };

  return true;
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
        .encrypt(await this.importKey('private'));
    } catch (err) {
      return false;
    }
  }

  public async decode(grossInfo: string) {
    try {
      const { plaintext, protectedHeader, updated } = await compactDecrypt(
        grossInfo,
        KeyManager.keys.private
      )
        .then((result) => ({ ...result, updated: true }))
        .catch(async (err) => {
          return {
            ...(await compactDecrypt(grossInfo, KeyManager.keys.old)),
            updated: false,
          };
        });
    } catch (err) {}
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
