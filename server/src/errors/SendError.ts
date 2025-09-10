// Tipagens
import { type FastifyReply } from 'fastify';

// Retorno do erro
import FormatError from './FormatError';

function SendError(error: unknown, reply: FastifyReply): void {
  if (error instanceof FormatError) reply.status(error.status).send({ message: error.name });
  else reply.status(500).send({ message: 'Server Error' });
}

export default SendError;
