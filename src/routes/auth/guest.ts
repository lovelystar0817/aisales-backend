import type { FastifyRequest } from 'fastify';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Company } from '../../models/Company.js';
import { User } from '../../models/User.js';

const DEFAULT_AVATAR_URL = 'https://cdn.auth0.com/avatars/default.png';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Register rate limiting for guest creation
  await app.register(import('@fastify/rate-limit'), {
    max: 50, // max 50 requests per window
    timeWindow: '1 minute', // per minute
    keyGenerator: (req: FastifyRequest) => req.ip, // rate limit by IP
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    allowList: (req: FastifyRequest) => req.method === 'OPTIONS',
  });

  // Check if guest user exists
  app.get(
    '/guest/:companyFriendlyId/check',
    {
      schema: {
        params: z.object({
          companyFriendlyId: z.string().min(1),
        }),
        querystring: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (req, reply) => {
      const { companyFriendlyId } = req.params;
      const { email } = req.query;

      const normalizedFriendlyId = companyFriendlyId
        .trim()
        .toLowerCase()
        .replace(/ /g, '-');

      try {
        // Look up company by friendlyId
        const company = await Company.findOne({
          friendlyId: normalizedFriendlyId,
        });

        if (!company) {
          throw app.httpErrors.notFound(
            `Company with friendlyId '${companyFriendlyId}' not found`,
          );
        }

        // Check if user exists
        const user = await User.findOne({
          email: email,
          company: company._id,
        });

        return reply.send({
          exists: !!user,
          email: email,
        });
      } catch (error) {
        console.log('error', error);
        app.log.error({ err: error }, 'Error checking guest user:');
        throw app.httpErrors.badRequest('Failed to check guest user');
      }
    },
  );

  // New route: /guest/:companyFriendlyId with optional email
  app.post(
    '/guest/:companyFriendlyId',
    {
      schema: {
        params: z.object({
          companyFriendlyId: z.string().min(1),
        }),
        body: z.object({
          name: z.string().min(1).max(100).optional(),
          email: z.string().email().optional(),
        }),
      },
    },
    async (req, reply) => {
      const { companyFriendlyId } = req.params;
      const { email, name } = req.body;

      const normalizedFriendlyId = companyFriendlyId
        .trim()
        .toLowerCase()
        .replace(/ /g, '-');

      try {
        // Look up company by friendlyId
        const company = await Company.findOne({
          friendlyId: normalizedFriendlyId,
        });

        if (!company) {
          throw app.httpErrors.notFound(
            `Company with friendlyId '${companyFriendlyId}' not found`,
          );
        }

        let guestUser;

        // If email is provided, check if user already exists
        if (email) {
          guestUser = await User.findOne({
            email: email,
            company: company._id,
          });

          if (guestUser) {
            console.log('Existing guest user found:', guestUser.email);
            // Populate company for response
            await guestUser.populate('company', 'name trialEndsAt');
          } else {
            // Create new user with provided email
            console.log('Creating new guest user with email:', email);

            // Use provided name or generate from email
            const userName = name || email.split('@')[0];

            guestUser = await User.create({
              name: userName,
              firstName: userName.split(' ')[0] || userName,
              lastName: userName.split(' ').slice(1).join(' ') || '',
              email: email,
              company: company._id,
              isGuest: true,
              createdAsGuestAt: new Date(),
            });

            console.log('Created new guest user:', guestUser.email);
            // Populate company for response
            await guestUser.populate('company', 'name trialEndsAt');
          }
        } else {
          // No email provided, create user with random email (old behavior)
          const randomAlphanumeric = Math.random().toString(36).substr(2, 9);
          const sanitizedName = (name || 'Guest').trim();
          const normalizedName = sanitizedName
            .toLowerCase()
            .replace(/\s+/g, '');
          const guestEmail = `guest+${companyFriendlyId}_${normalizedName}_${randomAlphanumeric}@hupo.co`;

          console.log('Creating guest user with generated email:', guestEmail);

          guestUser = await User.create({
            name: sanitizedName,
            firstName: sanitizedName.split(' ')[0] || sanitizedName,
            lastName: sanitizedName.split(' ').slice(1).join(' ') || '',
            email: guestEmail,
            company: company._id,
            isGuest: true,
            createdAsGuestAt: new Date(),
          });

          console.log('Created guest user:', guestUser.email);
          // Populate company for response
          await guestUser.populate('company', 'name trialEndsAt');
        }

        // Generate JWT token compatible with Auth0 format
        const payload = {
          sub: `guest_${guestUser._id}`,
          aud: app.config.AUTH0_AUDIENCE,
          iss: `https://${app.config.AUTH0_DOMAIN}/`,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60, // 4 hours expiration
          scope: 'read:users',
          gty: 'client-credentials',
          // Add custom claims for guest user
          isGuest: true,
          userId: guestUser._id.toString(),
          companyId: company._id.toString(),
        };

        const token = jwt.sign(payload, app.config.AUTH0_CLIENT_SECRET, {
          algorithm: 'HS256',
        });

        // Return response in the expected format
        return reply.send({
          token,
          user: {
            id: guestUser._id,
            name: guestUser.name,
            email: guestUser.email,
            picture: DEFAULT_AVATAR_URL,
            company: {
              _id: company._id,
              name: company.name,
              // trialEndsAt: company.trialEndsAt,
            },
          },
        });
      } catch (error) {
        console.log('error', error);
        app.log.error({ err: error }, 'Error creating/finding guest user:');
        throw app.httpErrors.badRequest('Failed to create or find guest user');
      }
    },
  );

  app.log.info('[auth/guest.ts] router registered');
};

export default router;
