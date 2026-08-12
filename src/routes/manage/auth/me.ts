import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { ManageUser } from '../../../models/ManageUser.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Middleware to check if the user is authenticated
   */
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  /**
   * @method GET /manage/auth/me
   * @description Get current authenticated user details
   * @headers Authorization: Bearer <token>, Accept-Language: en|id|ms, X-Client: manage
   * @returns User details with company information
   */
  app.get('/', async (req, reply) => {
    // req.user is guaranteed to be set by authenticateManage preHandler
    if (!req.user) {
      throw app.httpErrors.unauthorized('Unauthorized');
    }

    const token = req.headers.authorization?.split(' ')[1];

    // Get user info from Auth0 to retrieve picture
    let picture = '';
    if (token) {
      try {
        const result = await app.userInfo.getUserInfo(token);
        picture = result.data.picture || '';
      } catch (error) {
        app.log.error(
          `[manage/auth/me] Failed to get user info from Auth0: ${error}`,
        );
        // Continue without picture if Auth0 call fails
      }
    }

    // Get user with populated company
    const user = await ManageUser.findOne({ auth0Id: req.user.auth0Id })
      .populate('company', 'name trialEndsAt')
      .orFail();

    // Check if user is deactivated
    if (user.status === 'inactive' || user.isDeleted) {
      throw app.httpErrors.forbidden('Account has been deactivated');
    }

    return reply.send({
      id: user.id,
      name: user.name,
      email: user.email,
      picture,
      company: {
        _id: (user.company as any)._id.toString(),
        name: (user.company as any).name,
        trialEndsAt: (user.company as any).trialEndsAt
          ? (user.company as any).trialEndsAt.toISOString()
          : null,
      },
      role: user.role,
      teams:
        user.teams && user.teams.length > 0
          ? user.teams.map((t) => t.toString())
          : null,
    });
  });

  app.log.info('[manage/auth/me.ts] router registered');
};

export default router;
