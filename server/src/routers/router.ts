import fp from 'fastify-plugin';
import { type FastifyInstance, type FastifyPluginOptions } from 'fastify';

import UserControllers from '../controllers/UserControllers';
import OccurrenceControllers from '../controllers/OccurrenceController';

import { sendVerificationToken, verifyToken } from '../controllers/tokenControllers';

import { authenticateSession } from '../plugins/authenticate';

import { UpdateUserBody, UpdateType, ExtendedUpdateBody } from '../types/userTypes';

async function userRouters(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Conta do usuário
  fastify.post('/auth/login', UserControllers.login);
  fastify.post('/auth/register', UserControllers.register);
  fastify.put<{
    Body: ExtendedUpdateBody;
  }>(
    '/auth/update',
    {
      preHandler: authenticateSession,
    },
    UserControllers.update
  );

  // métodos para occurrences
  fastify.get('/occurrences', OccurrenceControllers.get);
  fastify.get(
    '/occurrencesByNeighborhood/:NeighborhoodId',
    OccurrenceControllers.getByNeighborhood
  );
  fastify.post('/occurrences/register', OccurrenceControllers.register);
  fastify.delete('/occurrences/:occurrenceId', OccurrenceControllers.delete);

  //métodos para emails
  fastify.post('/email/sendtoken', sendVerificationToken);
  fastify.post('/email/verification', verifyToken);
}

const userRoutersPlugin = fp(userRouters);
export default userRoutersPlugin;
