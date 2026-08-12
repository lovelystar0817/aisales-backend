/**
 * This file is now replaced by sentry-init.ts
 * We're importing from there to ensure Sentry is initialized early
 */
import Sentry from './sentry-init.js';

// Re-export Sentry for backward compatibility
export const sentry = Sentry;
