// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { type RequestBody } from '../types/requestBodyTypes';

// Configurações
import webcrypto from '../config/keys/crypto.config';

// Funções
import { getVersionKey } from '../config/keyCrypto/KeyManager';

function validateOfHeaderBody(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
  const header = request.body.header;
  if (!Object.values(getVersionKey()).includes(header.rsa.kid))
    return reply.status(400).send({ message: 'Invalid kid' });

  if (header.rsa.alg !== webcrypto.rsa.alg.name)
    return reply.status(400).send({ message: 'Invalid algorithm' });

  if (header.aes.enc !== webcrypto.aes.enc)
    return reply.status(400).send({ message: 'Invalid encryption' });
}

export default validateOfHeaderBody;
