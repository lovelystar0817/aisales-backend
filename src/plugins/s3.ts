import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import fp from 'fastify-plugin';
import { S3 } from '../libs/s3.js';

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.decorate('s3', S3);
};

export default fp(plugin, {
  fastify: '5.x',
  name: 's3',
});

declare module 'fastify' {
  interface FastifyInstance {
    s3: typeof S3;
  }
}
