import fastify from "fastify";
import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions} from "fastify";
import {loginUser, registerReport, registerReview, registerUser, updateUser, registerReviewComment, registerReportComment} from "../controllers/userControllers"


async function userRouters(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.post('/login', loginUser);
  fastify.post('/register', registerUser);

  fastify.put('/user/update', updateUser);         
  fastify.post('/user/registerReport', registerReport);  
  fastify.post('/user/registerReview', registerReview);  

  fastify.post('/reports/:reportId/comments', registerReportComment);
  fastify.post('/reviews/:reportId/comments', registerReviewComment);
}


export const userRoutersPlugin = fp(userRouters);


