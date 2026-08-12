import fp from 'fastify-plugin';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { getPostHogClient } from '../libs/posthog.js';
import { PostHog } from 'posthog-node';

const plugin: FastifyPluginAsyncZod = async (app) => {
  app.decorate('posthog', getPostHogClient()!);
};

export default fp(plugin, {
  fastify: '5.x',
  name: 'posthog',
});

declare module 'fastify' {
  interface FastifyInstance {
    posthog: PostHog;
  }
}
