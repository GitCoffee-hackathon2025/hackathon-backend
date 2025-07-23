// ESM
import "reflect-metadata";
import Fastify from 'fastify'
import { AppDataSource } from "./src/db/data-source";
import { userRoutersPlugin } from './src/routers/router';

const fastify = Fastify({
  logger: true
})
fastify.register(userRoutersPlugin);

const start = async () => {
  try {
    await AppDataSource.initialize();
    await fastify.listen({ port: 3000 })
    
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
