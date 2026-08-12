import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import fp from 'fastify-plugin';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { AuthenticationError } from './auth0.js';
import { HttpError } from '../utils/errors.js';

const httpErrors = {
  accessDenied: (message: string) => new HttpError(403, message),
  notFound: (message: string, data?: any) => new HttpError(404, message, data),
  unauthorized: (message: string) => new AuthenticationError(message),
  conflict: (message: string, data: any) => new HttpError(409, message, data),
  badRequest: (message: string, data?: any) =>
    new HttpError(400, message, data),
  forbidden: (message: string) => new HttpError(403, message),
};

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.decorate('httpErrors', httpErrors);

  app.setErrorHandler((error, request, reply) => {
    if (
      error instanceof AuthenticationError ||
      error instanceof UnauthorizedError
    ) {
      return reply.status(401).send({
        ok: false,
        message: error.message,
      });
    }

    if (error instanceof HttpError) {
      return reply.status(error.status).send({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }

    app.log.error(error);

    return reply.status(500).send({
      ok: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  });
};

export default fp(plugin, {
  fastify: '5.x',
  name: 'error',
});

declare module 'fastify' {
  interface FastifyInstance {
    httpErrors: typeof httpErrors;
  }
}
