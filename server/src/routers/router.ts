import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { loginUser, registerUser, updateUser } from '../controllers/userControllers';

import {
  getReport,
  registerReport,
  deleteReport,
  getReportByNeighborhood,
} from '../controllers/reportControllers';

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

  // métodos para reports
  fastify.get('/reports', getReport);
  fastify.get('/reportsByNeighborhood/:NeighborhoodId', getReportByNeighborhood);
  fastify.post('/reports/register', registerReport);
  fastify.delete('/reports/:reportId', deleteReport);

  //métodos para emails
  fastify.post('/email/sendtoken', sendVerificationToken);
  fastify.post('/email/verification', verifyToken);
}

export const userRoutersPlugin = fp(userRouters);
