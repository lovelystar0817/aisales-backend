import { FastifyRequest } from 'fastify';

export const ensureAdmin = async (app: any, request: FastifyRequest) => {
  const adminSecret = request.headers['admin-secret'];

  if (!adminSecret) {
    throw app.httpErrors.unauthorized('Missing admin secret');
  }

  if (adminSecret !== app.config.ADMIN_SECRET) {
    throw app.httpErrors.unauthorized('Invalid admin secret');
  }
};
