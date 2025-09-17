// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';

// Retorno do erro
import SendError from '../errors/SendError';

// Funções
import { sendPublic } from '../security/crypto/CryptoManager';

async function PublicKeyController(request: FastifyRequest, reply: FastifyReply) {
  try {
    console.log('👉 Rota /connect/get chamada');

    const publicKey = await sendPublic();
    console.log('🔑 Public key gerada:', publicKey);

    return reply.status(200).send({
      success: true,
      rsaPublicKey: publicKey.key,
      kidRsa: publicKey.kid,
    });
  } catch (error) {
    console.error('❌ Erro no PublicKeyController:', error);
    return SendError(error, reply);
  }
}
export default PublicKeyController;