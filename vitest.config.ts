import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // Suppress unhandled rejection warnings from async Sentry initialization
    dangerouslyIgnoreUnhandledErrors: false,
    silent: true,
    onConsoleLog() {
      // Suppress all console logs in tests
      return false;
    },
  },
});
