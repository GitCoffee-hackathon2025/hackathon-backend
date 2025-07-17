function analyzeError(err: Error) {
  const name = err.name;

  if (name == 'JOSEAlgNotAllowed') return 'alg is not allowed';

  if (name == 'JWEInvalid') return 'invalid compact jwe';

  if (name == 'TypeError' || name == 'SyntaxError') return 'invalid encoding';

  if (name == 'JWEDecryptionFailed') return 'decryption failed';

  return 'unknown error';
}

export default analyzeError;
