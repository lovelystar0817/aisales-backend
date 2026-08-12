import { AuthenticationClient, UserInfoClient } from 'auth0';
import type { RequestHandler } from 'express';
import express from 'express';
import { auth, AuthResult } from 'express-oauth2-jwt-bearer';
import type { onRequestHookHandler } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { User, type UserDocument } from '../models/User.js';
import { ManageUser } from '../models/ManageUser.js';

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const plugin: FastifyPluginAsyncZod = async (app, _opts) => {
  app.register(import('@fastify/auth'));

  const auth0 = new AuthenticationClient({
    domain: app.config.AUTH0_DOMAIN,
    clientId: app.config.AUTH0_CLIENT_ID,
    clientSecret: app.config.AUTH0_CLIENT_SECRET,
    telemetry: false,
  });

  const userInfo = new UserInfoClient({
    domain: app.config.AUTH0_DOMAIN,
    telemetry: false,
  });

  // Express compatibility cuz of auth0
  await app.register(import('@fastify/express'), {
    createProxyHandler: (fastifyRequest) => ({
      set(target, prop, value) {
        if (prop === 'auth') {
          return Reflect.set(fastifyRequest, 'auth0Data', value);
        }

        return Reflect.set(target, prop, value);
      },
    }),
  });

  app.express.use(express.json());

  const checkJWT = auth({
    audience: app.config.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${app.config.AUTH0_DOMAIN}/`,
  });

  app.decorate('auth0', auth0);
  app.decorate('userInfo', userInfo);
  app.decorate('checkAuth0JWT', checkJWT);

  app.decorate('authenticate', async (req) => {
    // Check if this is a guest token by examining the Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        // Try to decode the token to check if it's a guest token
        const decoded = jwt.decode(token) as any;

        if (decoded && decoded.sub && decoded.sub.startsWith('guest_')) {
          // This is a guest token, verify it using our secret
          const payload = jwt.verify(
            token,
            app.config.AUTH0_CLIENT_SECRET,
          ) as any;

          // Extract user ID from the subject
          const userId = payload.sub.replace('guest_', '');
          const user = await User.findById(userId).orFail(
            new AuthenticationError('Unauthorized (guest user not found)'),
          );

          // Verify this is actually a guest user
          if (!user.isGuest) {
            throw new AuthenticationError('Unauthorized (invalid guest token)');
          }

          req.user = user.toObject();
          return;
        }
      } catch (error) {
        // If guest token verification fails, fall through to regular Auth0 verification
      }
    }

    // Regular Auth0 authentication
    if (!req.auth0Data) {
      throw new AuthenticationError('Unauthorized (not authenticated)');
    }

    const sub = req.auth0Data.payload.sub;
    const user = await User.findOne({ auth0Id: sub }).orFail(
      new AuthenticationError('Unauthorized (no user found)'),
    );

    if (user.hasChangedPassword) {
      await User.findOneAndUpdate(
        { _id: user._id },
        { hasChangedPassword: false },
      );
      throw new AuthenticationError(
        'Unauthorized (password changed, please log in again)',
      );
    }

    req.user = user.toObject();
  });

  app.decorate('authenticateManage', async (req) => {
    if (!req.auth0Data) {
      throw new AuthenticationError('Unauthorized (not authenticated)');
    }

    const sub = req.auth0Data.payload.sub;
    const user = await ManageUser.findOne({ auth0Id: sub }).orFail(
      new AuthenticationError('Unauthorized (no management user found)'),
    );

    if (!user.company) {
      throw new AuthenticationError('Unauthorized (no company assigned)');
    }

    req.user = user.toObject();
  });
};

export default fp(plugin, {
  name: 'auth0',
  fastify: '5.x',
});

declare module 'fastify' {
  interface FastifyInstance {
    auth0: AuthenticationClient;
    userInfo: UserInfoClient;
    checkAuth0JWT: RequestHandler;
    authenticate: onRequestHookHandler;
    authenticateManage: onRequestHookHandler;
  }
  interface FastifyRequest {
    auth0Data?: AuthResult;
    user?: UserDocument;
  }
}
