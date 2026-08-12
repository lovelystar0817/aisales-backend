import { vi } from 'vitest';

// Mock Sentry to prevent native module loading errors in tests
vi.mock('./src/sentry-init.js', () => ({
  default: {
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    setUser: vi.fn(),
    setTag: vi.fn(),
    setContext: vi.fn(),
    addBreadcrumb: vi.fn(),
    withScope: vi.fn((callback) => callback({ setTag: vi.fn() })),
  },
}));

// Mock @sentry/node to prevent native module loading
vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  setTag: vi.fn(),
  setContext: vi.fn(),
  addBreadcrumb: vi.fn(),
  withScope: vi.fn((callback) => callback({ setTag: vi.fn() })),
  onUncaughtExceptionIntegration: vi.fn(() => ({})),
  onUnhandledRejectionIntegration: vi.fn(() => ({})),
}));

// Mock @sentry/profiling-node to prevent native module loading errors
vi.mock('@sentry/profiling-node', () => ({
  nodeProfilingIntegration: vi.fn(() => ({})),
}));
