import type { FastifyCorsOptions } from '@fastify/cors';

export default {
  // Allow all origins - most permissive setting for debugging
  origin: '*',

  methods: ['*'],
  allowedHeaders: ['*'],
  exposedHeaders: ['*'],
  credentials: false, // Note: Must be false when origin is '*'
  maxAge: 3600,
  preflight: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
} satisfies FastifyCorsOptions;
