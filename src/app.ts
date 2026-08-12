import fastifyAutoload from '@fastify/autoload';
import MongoStore from 'connect-mongo';
import type { FastifyServerOptions } from 'fastify';
import fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import corsOpts from './cors.js';
import { envExtension, envSchema } from './env.js';
import { getAgenda, initializeAgenda } from './jobs/agenda.js';
import Sentry from './sentry-init.js';
import { checkEmailVerification } from './middlewares/checkEmailVerification.js';
import { FILE_SIZE_LIMIT } from './utils/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function createApp(opts?: FastifyServerOptions) {
  const app = fastify(opts).withTypeProvider<ZodTypeProvider>();

  await app.register(import('@fastify/cors'), corsOpts);

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Content type parsers first
  await app.register(import('@fastify/formbody'));
  await app.register(import('@fastify/multipart'), {
    attachFieldsToBody: true,
    limits: {
      fileSize: FILE_SIZE_LIMIT,
      files: 10, // Max number of files (allowing up to 10 for safety)
    },
  });

  // Environment variables
  await app.register(import('@fastify/env'), {
    confKey: 'config',
    schema: envSchema,
    dotenv: { path: join(process.cwd(), envExtension()) },
  });

  await app.register(import('@fastify/cookie'), {
    secret: app.config.COOKIE_PASSWORD,
  });

  await app.register(import('@fastify/session'), {
    secret: app.config.COOKIE_PASSWORD,
    cookieName: 'adminjs',
    cookie: {
      httpOnly: app.config.NODE_ENV === 'production',
      secure: 'auto',
    },
    store: MongoStore.create({
      mongoUrl: app.config.DATABASE_URL,
      ttl: 30 * 24 * 60 * 60, // = 30 days
    }),
    saveUninitialized: true,
  });

  await app.register(import('@fastify/helmet'), {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  Sentry.setupFastifyErrorHandler(app);

  await app.register(fastifyAutoload, {
    dir: join(__dirname, 'plugins'),
    ignorePattern: /^.*(?:test|spec).js$/,
  });

  // Auth routes
  await app.register(import('./routes/auth/company.js'), {
    prefix: '/auth',
  });

  await app.register(import('./routes/auth/success.js'), {
    prefix: '/auth',
  });

  await app.register(import('./routes/auth/error.js'), {
    prefix: '/auth',
  });

  await app.register(import('./routes/auth/guest.js'), {
    prefix: '/auth',
  });

  await app.register(import('./routes/auth/revoke.js'), {
    prefix: '/auth',
  });

  await app.register(import('./routes/auth/check-status.js'), {
    prefix: '/auth',
  });

  // Session routes
  await app.register(import('./routes/sessions/basic.js'), {
    prefix: '/sessions',
  });

  await app.register(import('./routes/sessions/roleplay.js'), {
    prefix: '/sessions',
  });

  await app.register(import('./routes/sessions/assessment.js'), {
    prefix: '/sessions',
  });

  await app.register(import('./routes/sessions/persona.js'), {
    prefix: '/sessions',
  });

  // Standings routes
  await app.register(import('./routes/standings/configuration.js'), {
    prefix: '/standings',
  });
  await app.register(import('./routes/standings/summary.js'), {
    prefix: '/standings',
  });

  await app.register(import('./routes/monitoring/monitoring.js'), {
    prefix: '/monitoring',
  });

  await app.register(import('./routes/monitoring/livekit-agent.js'), {
    prefix: '/monitoring',
  });

  await app.register(import('./routes/test/index.js'), {
    prefix: '/manage/temp',
  });

  // TTS routes
  await app.register(import('./routes/tts/index.js'), {
    prefix: '/tts', // Or /api/tts if preferred
  });

  await app.register(import('./routes/sessions/report.js'), {
    prefix: '/sessions',
  });

  // Feedback routes
  await app.register(import('./routes/feedback/index.js'), {
    prefix: '/feedback',
  });

  // Issue reports routes
  await app.register(import('./routes/issues/index.js'), {
    prefix: '/issues',
  });

  // Call analysis routes
  await app.register(import('./routes/call-analysis/index.js'), {
    prefix: '/call-analysis',
  });

  await app.register(import('./routes/livekit/token.js'), {
    prefix: '/livekit',
  });

  await app.register(import('./routes/livekit/roleplay.js'), {
    prefix: '/livekit',
  });

  // Manage routes
  await app.register(import('./routes/manage/index.js'), {
    prefix: '/manage',
  });

  // Admin API routes
  await app.register(import('./routes/admin/index.js'), {
    prefix: '/api/admin',
  });

  // Deployments routes
  await app.register(import('./routes/manage/deployments.js'), {
    prefix: '/api',
  });

  await app.register(import('./routes/elevenlabs/signed-url.js'), {
    prefix: '/elevenlabs',
  });

  await initializeAgenda(app);

  // Check email verification
  app.addHook('onRequest', checkEmailVerification);

  // Add cleanup hook
  app.addHook('onClose', async () => {
    const agenda = getAgenda();
    await agenda.stop();
  });

  return app;
}
