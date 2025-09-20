// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { type RequestBody } from '../types/requestBodyTypes';

function validateOfFormatBody(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
  const body = request.body;
  if (!body.header || !body.ct || !body.ek || !body.iv || !body.tag)
    return reply.status(400).send({ message: 'Invalid body format' });
}

export default validateOfFormatBody;
