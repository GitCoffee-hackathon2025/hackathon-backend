import { JOSEAlgNotAllowed, JWEDecryptionFailed, JWEInvalid } from 'jose/dist/types/util/errors';

function analyzeError(err: unknown) {
  if (err instanceof JOSEAlgNotAllowed) return 'alg is not allowed';

  if (err instanceof JWEInvalid) return 'invalid compact jwe';

  if (err instanceof TypeError || err instanceof SyntaxError) return 'invalid encoding';

  if (err instanceof JWEDecryptionFailed) return 'decryption failed';
}

export default analyzeError;
