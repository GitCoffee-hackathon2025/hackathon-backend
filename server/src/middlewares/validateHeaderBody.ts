// Tipagens
import { type RequestBody } from '../typescript/requestBodyType';

// Configurações
import webcrypto from '../config/keys/crypto.config';

// Retorno do erro
import FormatError from '../errors/FormatError';

// Funções
import { getVersionKey } from '../config/keyCrypto/KeyManager';

function validateHeaderBody(header: RequestBody['header']): void {
  if (!Object.values(getVersionKey()).includes(header.rsa.kid))
    throw new FormatError(400, 'Invalid kid', 'Kid of the rsa keys that were received are invalid');

  if (header.rsa.alg !== webcrypto.rsa.alg.name)
    throw new FormatError(400, 'Invalid algorithm', 'RSA algorithm received different');

  if (header.aes.enc !== webcrypto.aes.enc)
    throw new FormatError(400, 'Invalid encryption', 'Different received encryption');
}

export default validateHeaderBody;
