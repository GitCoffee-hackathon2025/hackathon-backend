import {
  importJWK,
  exportSPKI,
  CompactEncrypt,
  compactDecrypt,
  CompactJWEHeaderParameters,
} from 'jose';

import KeyManager from '../../config/keyCrypto/KeyManager';
import analyzeError from './utils/analyzeError';

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
