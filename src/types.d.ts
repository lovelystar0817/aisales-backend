import { Environment } from './env.ts';

declare module 'fastify' {
  interface FastifyInstance {
    config: Environment;
  }

  interface Session {
    redirectTo?: string;
    adminUser: Record<string, unknown> | null | false | unknown;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Environment {
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}
