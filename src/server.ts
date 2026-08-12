// Import polyfills for browser APIs required by pdfjs-dist before any other imports
import './utils/pdfjs-polyfills.js';

import * as AdminJSMongoose from '@adminjs/mongoose';
import AdminJS from 'adminjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { envExtension } from './env.js';
import createApp from './app.js';
import { gracefullyStopAgenda } from './jobs/agenda.js';
import { createLogger } from './utils/logger.js';
import Sentry from './sentry-init.js';
import { configureEmail } from './utils/email.js';

// Load env vars early so the logger can read POSTHOG_API_KEY
dotenv.config({ path: envExtension() });

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

let closePostHog: (() => Promise<void>) | null = null;

async function startServer() {
  const loggerResult = await createLogger(process.env.NODE_ENV ?? 'development');

  const app = await createApp({
    ...(loggerResult ? { loggerInstance: loggerResult.logger } : { logger: false }),
    disableRequestLogging: true,
    bodyLimit: 600 * 1024 * 1024, // 600MB
  });

  if (loggerResult) {
    closePostHog = loggerResult.closePostHog;
  }

  try {
    await app.ready();

    configureEmail();

    await mongoose.connect(app.config.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });

    const { HOST, PORT } = app.config;
    const address = await app.listen({ port: parseInt(PORT), host: HOST });

    app.log.info('AdminJS started on %s/admin', address);
    return app;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

export const app = startServer();

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', {
    error: error?.stack || error,
  });

  // Capture the error in Sentry
  Sentry.captureException(error, {
    tags: {
      type: 'uncaughtException',
    },
  });
  // Gracefully shutdown the process
  process.exit(1);
});

process.on('unhandledRejection', (error: any, _promise) => {
  console.error('Unhandled Rejection:', {
    error: error?.stack || error,
  });

  // Capture the error in Sentry
  Sentry.captureException(error, {
    tags: {
      type: 'unhandledRejection',
    },
    extra: {
      promise: _promise,
    },
  });
});

// Handle server shutdown
async function gracefulShutdown() {
  try {
    await closePostHog?.();
  } catch (error) {
    console.error('Error flushing PostHog logs during shutdown:', error);
  }
  try {
    await gracefullyStopAgenda();
  } catch (error) {
    console.error('Error stopping Agenda during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
