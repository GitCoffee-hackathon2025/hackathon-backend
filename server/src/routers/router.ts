import fastify from "fastify";
import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions} from "fastify";
import {loginUser, registerUser, updateUser, } from "../controllers/userControllers"
import {registerReportComment, registerReviewComment} from "../controllers/commentControllers"
import {deleteReview, getReview, registerReview} from "../controllers/reviewControllers"
import {deleteReport, getReport, registerReport} from "../controllers/reportControllers"


async function userRouters(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.post('/login', loginUser);
  fastify.post('/register', registerUser);

  fastify.put('/user/update', updateUser);         
  fastify.post('/user/registerReport', registerReport);  
  fastify.post('/user/registerReview', registerReview);  

  fastify.post('/reports/:reportId/comments', registerReportComment);
  fastify.post('/reviews/:reviewId/comments', registerReviewComment);

   
  fastify.delete('/review/reviewId:', deleteReview);
    fastify.delete('/reports/:reportId', deleteReport);
}


export const userRoutersPlugin = fp(userRouters);


