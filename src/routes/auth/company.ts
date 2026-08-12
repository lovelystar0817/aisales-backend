import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { Company } from '../../models/Company.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.get(
    '/company',
    {
      schema: {
        querystring: z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
        }),
      },
    },
    async (req, reply) => {
      const { name, slug } = req.query;
      const friendlyId = name?.trim().toLowerCase().replace(/ /g, '-');
      const normalizedSlug = slug?.trim().toLowerCase().replace(/ /g, '-');

      const company = await Company.findOne({
        $or: name
          ? [{ name }, { friendlyId }]
          : normalizedSlug
            ? [{ friendlyId: normalizedSlug }]
            : [
                // We can default
              ],
      }).select({
        name: 1,
        friendlyId: 1,
        auth0OrgId: 1,
        auth0ConnectionName: 1,
        trialEndsAt: 1,
      });

      if (!company) {
        throw app.httpErrors.notFound('Company not found');
      }

      return reply.send(company);
    },
  );

  app.log.info('[auth/company.ts] router registered');
};

export default router;
