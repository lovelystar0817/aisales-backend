/**
 * This file initializes Sentry before any other imports
 * to ensure proper instrumentation of Fastify
 */
import * as Sentry from '@sentry/node';
import { isProd, isStaging, isProdOrStaging, isTest } from './env.js';

// Check if profiling should be enabled (can be disabled in feature deployments)
const profilingEnabled = process.env.SENTRY_PROFILING_ENABLED !== 'false';

// Build integrations array conditionally
const integrations = [
  Sentry.onUncaughtExceptionIntegration(),
  Sentry.onUnhandledRejectionIntegration(),
];

// Only add profiling integration if enabled and supported
// Use async IIFE with proper error handling to avoid unhandled promise rejection
if (profilingEnabled) {
  (async () => {
    try {
      // Dynamic import to avoid loading native module when profiling is disabled
      const { nodeProfilingIntegration } = await import(
        '@sentry/profiling-node'
      );
      integrations.unshift(nodeProfilingIntegration());
    } catch (error) {
      // Silently ignore profiling initialization errors
      // This is expected in environments without compatible native modules
    }
  })().catch(() => {
    // Catch any unhandled promise rejections
  });
}

// Initialize Sentry first, before any other imports
// Skip initialization entirely in test environment to avoid native module errors
if (!isTest) {
  Sentry.init({
    dsn: isStaging
      ? 'https://8776770564b044531b25a900399d0f36@o4507293794893824.ingest.de.sentry.io/4510911162351696'
      : 'https://b23cffaee19f25fe7c06483fbc43e078@o4507293794893824.ingest.de.sentry.io/4509326697168976',
    integrations,
    // Reduced sample rates to prioritize error tracking over performance monitoring
    // tracesSampleRate: 5% to avoid exceeding performance quota
    // profilesSampleRate: disabled to save quota
    tracesSampleRate: 0.05,
    profilesSampleRate: 0,
    environment: process.env.NODE_ENV,
    enabled: isProdOrStaging,

    beforeSend(event, hint) {
      const error = hint.originalException;

      // @ts-ignore
      if (error.status === 409) {
        // Ignore 409 errors
        return null;
      }
      return event;
    },
  });
}

export default Sentry;
