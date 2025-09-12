import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { loginUser, registerUser, updateUser } from '../controllers/userControllers';

import {
  getOccurrence,
  registerOccurrence,
  deleteOccurrence,
  getOccurrenceByNeighborhood,
} from '../controllers/occurrenceControllers';

import { sendVerificationToken, verifyToken } from '../controllers/tokenControllers';

import { authenticateSession } from '../plugins/authenticate';

import { UpdateUserBody, UpdateType, ExtendedUpdateBody } from '../types/userTypes';

async function userRouters(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Conta do usuário
  fastify.post('/auth/login', loginUser);
  fastify.post('/auth/register', registerUser);
  fastify.put<{
    Body: ExtendedUpdateBody;
  }>(
    '/auth/update',
    {
      preHandler: authenticateSession,
    },
    updateUser
  );

  // métodos para occurrences
  fastify.get('/occurrences', getOccurrence);
  fastify.get('/occurrencesByNeighborhood/:NeighborhoodId', getOccurrenceByNeighborhood);
  fastify.post('/occurrences/register', registerOccurrence);
  fastify.delete('/occurrences/:occurrenceId', deleteOccurrence);

  //métodos para emails
  fastify.post('/email/sendtoken', sendVerificationToken);
  fastify.post('/email/verification', verifyToken);
}

export const userRoutersPlugin = fp(userRouters);
