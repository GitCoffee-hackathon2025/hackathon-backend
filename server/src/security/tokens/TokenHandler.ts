import webcrypto from '../../config/keys/crypto.config';
import { usesJwtInstance, usesSaltToken } from '../../config/KeyTokens/KeyManager';

import concatArrayBuffer from '../utils/concatArrayBuffer';

import { type RequestBody, type DecryptedRequestData } from '../../typescript/requestBodyType';

type ID = `${number}`;

class TokenHandler {
  private static async hash(payload: ArrayBuffer, useOld: boolean = false) {
    return await crypto.subtle.digest(
      webcrypto.jwt.alg.hash.name,
      concatArrayBuffer(payload, usesSaltToken()[!useOld ? 'current' : 'old'])
    );
  }

  public static async issueTokens(id: ID, browser: DecryptedRequestData['browser']) {
    if (!browser) throw new Error('invalid browser data');

    const auth = await this.hash(new TextEncoder().encode(JSON.stringify(browser.auth)));
    const connect = await this.hash(browser.connect);

    const token = usesJwtInstance().sign({ id, bh: auth, akid: connect }, {  });
  }
}
