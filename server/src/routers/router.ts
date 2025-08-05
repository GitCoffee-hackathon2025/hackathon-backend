import fastify from "fastify";
import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions} from "fastify";
import {loginUser, registerReport, registerReview, registerUser, updateUser} from "../controllers/userControllers"


async function userRouters(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.post('/login', loginUser);
  fastify.post('/register', registerUser);
  fastify.put('/update/:id', updateUser);
  fastify.post('/user/:id/registerReport', registerReport)
  fastify.post('/user/:id/registerReview', registerReview)
}

export const userRoutersPlugin = fp(userRouters);


