import pino from 'pino';
import pretty from 'pino-pretty';
import {
  createPostHogLogStream,
  type PostHogLogTransport,
} from './posthog-log-transport.js';

type Environment = 'development' | 'production' | 'test';

export interface LoggerResult {
  logger: pino.Logger;
  closePostHog: (() => Promise<void>) | null;
}

export async function createLogger(
  env: string,
): Promise<LoggerResult | false> {
  const normalizedEnv = env.toLowerCase() as Environment;

  if (normalizedEnv === 'test') return false;

  const streams: pino.StreamEntry[] = [];
  let posthogTransport: PostHogLogTransport | null = null;

  // Console/stdout stream
  if (normalizedEnv === 'development') {
    streams.push({
      stream: pretty({
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      }),
    });
  } else {
    streams.push({ stream: process.stdout });
  }

  // PostHog stream via OpenTelemetry
  const posthogApiKey = process.env.POSTHOG_API_KEY;
  if (posthogApiKey) {
    try {
      posthogTransport = await createPostHogLogStream({
        posthogApiKey,
        posthogHost:
          process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
        environment: process.env.NODE_ENV || 'development',
      });
      streams.push({ stream: posthogTransport.stream });
    } catch (err) {
      console.warn('Failed to initialize PostHog log transport:', err);
    }
  }

  const logger = pino(
    {
      level: 'info',
      redact: {
        paths: [
          'req.headers.authorization',
          'POSTHOG_API_KEY',
          '*.password',
          '*.token',
          '*.secret',
        ],
        remove: true,
      },
    },
    pino.multistream(streams),
  );

  return {
    logger,
    closePostHog: posthogTransport ? posthogTransport.close : null,
  };
}
