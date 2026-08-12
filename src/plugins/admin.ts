import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { RouteHandlerMethod } from 'fastify';
import fp from 'fastify-plugin';
import { Router as AdminRouter } from 'adminjs';
import fromPairs from 'lodash/fromPairs.js';
import mime from 'mime-types';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

import { admin } from '../utils/adminjs.js';
import { withProtectedRoutesHandler } from '../utils/authentication/protected-routes.handler.js';
import { withLogin } from '../utils/authentication/login.handler.js';
import { withLogout } from '../utils/authentication/logout.handler.js';
import { withRefresh } from '../utils/authentication/refresh.handler.js';
import { AuthenticationOptions } from '../utils/authentication/types.js';

const plugin: FastifyPluginAsyncZod = async (app, _opts) => {
  const { routes, assets } = AdminRouter;

  routes.forEach((route) => {
    // we have to change routes defined in AdminJS from {recordId} to :recordId
    const path = route.path.replace(/{/g, ':').replace(/}/g, '');

    const handler: RouteHandlerMethod = async (request, reply) => {
      const controller = new route.Controller(
        { admin },
        request.session?.adminUser,
      );
      const { params, query } = request;
      const method = request.method.toLowerCase();

      const body = request.body as Record<
        string,
        { value: string; file?: File }
      >;
      const fields = fromPairs(
        Object.keys((body ?? {}) as Record<string, unknown>).map((key) => [
          key,
          body[key].value ?? body[key],
        ]),
      );
      const html = await controller[route.action](
        {
          ...request,
          params,
          query,
          payload: fields ?? {},
          method,
        },
        reply,
      );

      if (route.contentType) {
        reply.type(route.contentType);
      } else if (typeof html === 'string') {
        reply.type('text/html');
      }
      if (html) {
        return reply.send(html);
      }
    };

    if (route.method === 'GET') {
      app.get(`${admin.options.rootPath}${path}`, handler);
    }

    if (route.method === 'POST') {
      app.post(`${admin.options.rootPath}${path}`, handler);
    }
  });

  assets.forEach((asset) => {
    app.get(`${admin.options.rootPath}${asset.path}`, async (_req, reply) => {
      const mimeType = mime.lookup(asset.src);
      const file = await readFile(path.resolve(asset.src));

      if (mimeType) {
        return reply.type(mimeType).send(file);
      }
      return reply.send(file);
    });
  });

  withProtectedRoutesHandler(app, admin);

  const auth: AuthenticationOptions = {
    cookiePassword: app.config.COOKIE_PASSWORD,
    authenticate(email: string, password: string) {
      if (
        email === app.config.ADMIN_EMAIL &&
        password === app.config.ADMIN_PASSWORD
      ) {
        return Promise.resolve({ email, password });
      }
      return null;
    },
    cookieName: 'adminjs',
  };

  withLogin(app, admin, auth);
  withLogout(app, admin, auth);
  withRefresh(app, admin, auth);
};

export default fp(plugin, {
  fastify: '5.x',
  name: 'adminjs',
});
