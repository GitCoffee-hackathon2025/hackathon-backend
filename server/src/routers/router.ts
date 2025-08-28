import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { loginUser, registerUser, updateUser } from '../controllers/userControllers';

import { getReport, registerReport, deleteReport, getReportByNeighborhood } from '../controllers/reportControllers';
import { getReview, registerReview, deleteReview } from '../controllers/reviewControllers';

import { registerReportComment, registerReviewComment } from '../controllers/commentControllers';

async function userRouters(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Conta do usuário
  fastify.post('/auth/login', loginUser);
  fastify.post('/auth/register', registerUser);
  fastify.put('/auth/update', updateUser);

  // métodos para reports
  fastify.get('/reports', getReport);
  fastify.get('/reportsByNeighborhood/:NeighborhoodId', () => console.log("Oi"))
  fastify.post('/reports/register', registerReport);
  fastify.post('/reports/:reportId/comments', registerReportComment);
  fastify.delete('/reports/:reportId', deleteReport);
  
  // métodos para reviews
  fastify.get('/reviews', getReview);
  fastify.post('/reviews/register', registerReview);
  fastify.post('/reviews/:reviewId/comments', registerReviewComment);
  fastify.delete('/reviews/:reviewId', deleteReview);
}

export const userRoutersPlugin = fp(userRouters);
