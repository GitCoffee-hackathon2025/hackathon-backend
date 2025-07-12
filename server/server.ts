// ESM
import Fastify from 'fastify'
import { userRouters } from './src/routers/userRouter/router'
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
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
