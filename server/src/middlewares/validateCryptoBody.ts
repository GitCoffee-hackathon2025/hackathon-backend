import { webcrypto, getVersionKey } from '../config/keyCrypto/KeyManager';
import { type RequestBody } from '../typescript/requestBodyType';

function validateHeaderBody(header: RequestBody['header']): true | [false, string] {
  if (!Object.values(getVersionKey()).includes(header.rsa.kid)) return [false, 'invalid kid'];

  if (header.rsa.alg !== webcrypto.rsa.alg.name) return [false, 'invalid algorithm'];

  if (header.aes.enc !== webcrypto.aes.enc) return [false, 'invalid encryption'];

  return true;
}

export default validateHeaderBody;
