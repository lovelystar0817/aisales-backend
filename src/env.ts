import type { JSONSchemaType } from 'ajv';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'staging' | 'production' | string;
    }
  }
}

export function envExtension() {
  switch (process.env.NODE_ENV) {
    case 'development':
      return '.env.local';
    case 'test':
      return '.env.test';
    case 'staging':
      return '.env.staging';
    case 'production':
      return '.env.prod';
    default:
      return '.env.local';
  }
}

export type Environment = {
  NODE_ENV: string;
  PORT: string;
  HOST: string;

  DATABASE_URL: string;

  AUTH0_DOMAIN: string;
  AUTH0_AUDIENCE: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AUTH0_TRIGGER_TOKEN: string;

  ADMIN_SECRET: string;

  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  COOKIE_PASSWORD: string;

  POSTHOG_API_KEY: string;
  POSTHOG_HOST?: string;

  AUTH0_M2M_CLIENT_ID: string;
  AUTH0_M2M_CLIENT_SECRET: string;

  SENTRY_DSN: string;

  FEATURE_ENV?: string;
};
export const isDev = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';
export const isProd = process.env.NODE_ENV === 'production';
export const isStaging = process.env.NODE_ENV === 'staging';
export const isProdOrStaging = isProd || isStaging;

export const envSchema: JSONSchemaType<Environment> = {
  type: 'object',
  properties: {
    NODE_ENV: { type: 'string' },
    PORT: { type: 'string' },
    HOST: { type: 'string' },

    DATABASE_URL: { type: 'string' },

    AUTH0_DOMAIN: { type: 'string' },
    AUTH0_AUDIENCE: { type: 'string' },
    AUTH0_CLIENT_ID: { type: 'string' },
    AUTH0_CLIENT_SECRET: { type: 'string' },
    AUTH0_TRIGGER_TOKEN: { type: 'string' },

    ADMIN_SECRET: { type: 'string' },

    ADMIN_EMAIL: { type: 'string' },
    ADMIN_PASSWORD: { type: 'string' },
    COOKIE_PASSWORD: { type: 'string' },

    POSTHOG_API_KEY: { type: 'string' },
    POSTHOG_HOST: { type: 'string', nullable: true },

    AUTH0_M2M_CLIENT_ID: { type: 'string' },
    AUTH0_M2M_CLIENT_SECRET: { type: 'string' },

    SENTRY_DSN: { type: 'string' },

    SENDGRID_API_KEY: { type: 'string' },
    SENDGRID_VALIDATOR_API_KEY: { type: 'string' },

    FEATURE_ENV: { type: 'string', nullable: true },
  },
  required: [
    'PORT',
    'DATABASE_URL',
    // 'AUTH0_DOMAIN',
    // 'AUTH0_AUDIENCE',
    // 'AUTH0_CLIENT_ID',
    // 'AUTH0_CLIENT_SECRET',
    // 'AUTH0_TRIGGER_TOKEN',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'COOKIE_PASSWORD',
    // 'POSTHOG_API_KEY',
  ],
  additionalProperties: false,
};
