// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';

// Retorno do erro
import SendError from '../errors/SendError';

// Funções
import { sendPublic } from '../security/crypto/CryptoManager';

async function PublicKeyController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const publicKey = await sendPublic();

    return reply.status(200).send({
      success: true,
      rsaPublicKey: publicKey.key,
      kidRsa: publicKey.kid,
    });
  } catch (error) {
    return SendError(error, reply);
  }
}

export default PublicKeyController