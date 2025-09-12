import { type FastifyRequest } from 'fastify';

function getUserIdFromCookie(request: FastifyRequest): number | null {
  const id = request.cookies.userId;
  return id ? parseInt(id) : null;
}

export default getUserIdFromCookie;
