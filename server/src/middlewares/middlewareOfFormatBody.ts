// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { type RequestBody } from '../typescript/requestBodyType';

function middlewareOfFormatBody(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as RequestBody;
  if (!body.header || !body.ct || !body.ek || !body.iv || !body.tag)
    return reply.status(400).send({ message: 'Invalid body format' });
}

export default middlewareOfFormatBody;
