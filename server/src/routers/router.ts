import fastify from "fastify";
import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions} from "fastify";
import {loginUser, registerUser, updateUser} from "../controllers/userControllers"


async function userRouters(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get('/login', loginUser);
  fastify.post('/register', registerUser);
  fastify.put('/update/:id', updateUser);
}

export const userRoutersPlugin = fp(userRouters);


