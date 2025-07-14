// ESM
import "reflect-metadata";
import Fastify from 'fastify'
import { AppDataSource } from "./src/db/data-source";

import { userRouters } from './src/routers/router'
const fastify = Fastify({
  logger: true
})

fastify.register(userRouters);
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})


const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    await AppDataSource.initialize();
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
