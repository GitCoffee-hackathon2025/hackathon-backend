// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';

const inputErro = ['TOKEN'];

function middlewareOfToken(request: FastifyRequest, reply: FastifyReply) {
  const authorization = request.headers.authorization;
  if (!authorization)
    return reply.status(401).send({
      message: 'No authorization',
      inputErro,
    });

  if (!authorization.startsWith('Bearer '))
    return reply.status(400).send({
      message: 'Token without bearer',
      inputErro,
    });

  const arrayToken = authorization.split(' ');
  if (arrayToken.length !== 2)
    return reply.status(401).send({
      message: 'Token invalid',
    });

  if (!arrayToken[1])
    return reply.status(401).send({
      message: 'Not the token',
      inputErro,
    });
}

export default middlewareOfToken;
