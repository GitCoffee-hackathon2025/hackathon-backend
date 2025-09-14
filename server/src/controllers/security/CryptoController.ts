// // Tipagens
// import { type FastifyRequest, type FastifyReply } from 'fastify';

// // Retorno do erro
// import SendError from '../../errors/SendError';

// // Funções
// import { sendPublic } from '../../security/crypto/CryptoManager';

// async function PublicKeyController(request: FastifyRequest, reply: FastifyReply) {
//   try {
//     const publicKey = await sendPublic();

//     reply.status(200).send({
//       rsaPublicKey: publicKey.key,
//       kidRsa: publicKey.kid,
//     });
//   } catch (error) {
//     SendError(error, reply);
//   }
// }

// export default PublicKeyController