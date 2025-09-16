// ESM
import 'reflect-metadata';
import Fastify from 'fastify';
import { AppDataSource } from './src/db/data-source';
import userRoutersPlugin from './src/routers/router';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';

import KeyBootstrap from './src/config/keys/KeyBootstrap';

const fastify = Fastify({
  logger: true,
});
fastify.register(fastifyCors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
fastify.register(fastifyCookie);
fastify.register(userRoutersPlugin);
const start = async () => {
  try {
    await AppDataSource.initialize();
    await KeyBootstrap.init(fastify);
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
