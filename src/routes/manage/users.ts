import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { User } from '../../models/User.js';
import { MANULIFE_COMPANY_ID, MSIG_COMPANY_ID } from '../../utils/constants.js';
import {
  getBulkUserStatistics,
  getUserPracticeBreakdown,
  getUserPracticeSummary,
  getUserProgressData,
  getUserSessionHistory,
  getUserStatistics,
} from '../../utils/manage/index.js';
import {
  buildBaseUserFilter,
  validateUserAccess,
} from '../../utils/manage/shared.js';
import { shouldUsePrudentialData } from '../../utils/prudential-standing.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Middleware to check if the user is authenticated
   */
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  /**
   * @method GET /manage/users
   * @description Get paginated list of users with their statistics
   */
  app.get('/', {
    schema: {
      querystring: z.object({
        module: z.string().optional(),
        search: z.string().optional(),
        page: z.coerce.number().optional().default(1),
        limit: z.coerce.number().optional().default(10),
        status: z.enum(['active', 'inactive']).optional(),
        teams: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((teams) => {
            if (!teams) return undefined;
            const teamArray = Array.isArray(teams) ? teams : teams.split(',');
            const filtered = teamArray.filter(
              (team) => team && team.trim() !== '' && team !== 'all',
            );
            return filtered.length > 0 ? filtered : undefined;
          }),
      }),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { module, teams, search, page, limit, status } = req.query;

        // Build user filter using helper function
        const userFilter = buildBaseUserFilter(companyId);

        // Add teams filter if provided
        if (teams && teams.length > 0) {
          // Filter users who belong to any of the specified teams
          userFilter.teams = { $in: teams };
        } else if (req.user?.role === 'admin' && req.user?.teams?.length) {
          // Superadmins see all users in their company
          userFilter.teams = { $in: req.user?.teams };
        }

        // Add status filter — always exclude invited users from this page
        if (status === 'inactive') {
          userFilter.status = 'inactive';
        } else if (status === 'active') {
          userFilter.status = { $in: ['active', null] };
        } else {
          // No filter provided: show all except invited
          userFilter.status = { $nin: ['invited'] };
        }

        // Add search filter
        if (search) {
          // Escape special regex characters to treat them as literals
          const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          userFilter.$or = [
            { name: { $regex: escapedSearch, $options: 'i' } },
            { email: { $regex: escapedSearch, $options: 'i' } },
          ];
        }

        // Get ALL users without pagination (we'll paginate after sorting)
        const users = await User.find(userFilter)
          .select('_id name email status')
          .populate('teams')
          .lean();

        // Get statistics for all users
        const userIds = users.map((user) => user._id.toString());
        const bulkStats = await getBulkUserStatistics(
          userIds,
          companyId,
          module,
        );

        const usersWithStats = users.map((user) => {
          const userId = user._id.toString();
          const stats = bulkStats[userId] || {
            totalPractices: 0,
            averageDurationMinutes: 0,
            averageDurationSeconds: 0,
            averageScore: 0,
            lastSessionDate: null,
          };

          return {
            id: userId,
            name: user.name || 'Unknown User',
            email: user.email || '',
            status: user.status || 'active',
            teams: user.teams,
            ...stats,
          };
        });

        // Filter out users with no practices when a specific module is selected
        const filteredUsers =
          module && module !== 'all'
            ? usersWithStats.filter((user) => user.totalPractices > 0)
            : usersWithStats;

        // Sort by status (active/non-inactive first, inactive second) then by email ascending
        filteredUsers.sort((a, b) => {
          const aIsInactive = a.status === 'inactive';
          const bIsInactive = b.status === 'inactive';

          // First, sort by inactive status (non-inactive first, inactive second)
          if (aIsInactive !== bIsInactive) {
            return aIsInactive ? 1 : -1;
          }

          // Within each status group, sort by email ascending
          return a.email.localeCompare(b.email);
        });

        // Calculate pagination after sorting
        const totalUsers = filteredUsers.length;
        const totalPages = Math.ceil(totalUsers / limit);
        const skip = (page - 1) * limit;

        // Apply pagination
        const paginatedUsers = filteredUsers.slice(skip, skip + limit);

        return reply.send({
          users: paginatedUsers,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching users:');
        return reply.status(500).send({ error: 'Failed to fetch users' });
      }
    },
  });

  /**
   * @method GET /manage/users/:userId/session-history
   * @description Get paginated session history for a specific user
   */
  app.get('/:userId/session-history', {
    schema: {
      params: z.object({
        userId: z.string(),
      }),
      querystring: z.object({
        page: z.coerce.number().optional().default(1),
        limit: z.coerce.number().optional().default(10),
      }),
    },
    async handler(req, reply) {
      try {
        const { userId } = req.params;
        const { page, limit } = req.query;
        const companyId = req.user!.company!.toString();

        // Validate user access
        const { user, error } = await validateUserAccess(userId, companyId);
        if (error || !user) {
          const statusCode = error?.includes('not found') ? 404 : 403;
          return reply
            .status(statusCode)
            .send({ error: error || 'User not found' });
        }

        // Get session history using unified function
        const { sessions, totalSessions } = await getUserSessionHistory(
          userId,
          companyId,
          page,
          limit,
        );

        // Calculate pagination
        const totalPages = Math.ceil(totalSessions / limit);

        return reply.send({
          sessions,
          pagination: {
            currentPage: page,
            totalPages,
            totalSessions,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching session history:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch session history' });
      }
    },
  });

  /**
   * @method GET /manage/users/:userId
   * @description Get detailed information about a specific user
   */
  app.get('/:userId', {
    schema: {
      params: z.object({
        userId: z.string(),
      }),
      querystring: z.object({
        module: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const { userId } = req.params;
        const { module } = req.query;
        const companyId = req.user!.company!.toString();

        // Validate user access
        const { user, error } = await validateUserAccess(userId, companyId);
        if (error || !user) {
          const statusCode = error?.includes('not found') ? 404 : 403;
          return reply
            .status(statusCode)
            .send({ error: error || 'User not found' });
        }

        // Get user statistics
        const stats = await getUserStatistics(userId, companyId, module);

        return reply.send({
          id: user._id.toString(),
          name: user.name || 'Unknown User',
          email: user.email || '',
          ...stats,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching user details:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch user details' });
      }
    },
  });

  /**
   * @method GET /manage/users/:userId/practice-summary
   * @description Get practice summary for a specific user
   */
  app.get('/:userId/practice-summary', {
    schema: {
      params: z.object({
        userId: z.string(),
      }),
    },
    async handler(req, reply) {
      try {
        const { userId } = req.params;
        const companyId = req.user!.company!.toString();

        // Validate user access
        const { user, error } = await validateUserAccess(userId, companyId);
        if (error || !user) {
          const statusCode = error?.includes('not found') ? 404 : 403;
          return reply
            .status(statusCode)
            .send({ error: error || 'User not found' });
        }

        const result = await getUserPracticeSummary(userId, companyId);

        let layout = 'regular';
        if (shouldUsePrudentialData(companyId)) {
          layout = 'prudential';
        } else if (companyId === MANULIFE_COMPANY_ID) {
          layout = 'manulife';
        } else if (companyId === MSIG_COMPANY_ID) {
          layout = 'msig';
        }
        // All other companies (BBL, HSBC, Grab, MTL, etc.) use 'regular' layout

        return reply.send({
          ...result,
          layout,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching user practice summary:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch practice summary' });
      }
    },
  });

  /**
   * @method GET /manage/users/:userId/practice-breakdown
   * @description Get practice breakdown by type for a specific user
   */
  app.get('/:userId/practice-breakdown', {
    schema: {
      params: z.object({
        userId: z.string(),
      }),
    },
    async handler(req, reply) {
      try {
        const { userId } = req.params;
        const companyId = req.user!.company!.toString();

        // Validate user access
        const { user, error } = await validateUserAccess(userId, companyId);
        if (error || !user) {
          const statusCode = error?.includes('not found') ? 404 : 403;
          return reply
            .status(statusCode)
            .send({ error: error || 'User not found' });
        }

        const result = await getUserPracticeBreakdown(userId, companyId);
        let layout = 'regular';
        if (shouldUsePrudentialData(companyId)) {
          layout = 'prudential';
        } else if (companyId === MANULIFE_COMPANY_ID) {
          layout = 'manulife';
        } else if (companyId === MSIG_COMPANY_ID) {
          layout = 'msig';
        }
        // All other companies (BBL, HSBC, Grab, MTL, etc.) use 'regular' layout

        return reply.send({
          breakdown: result,
          layout,
        });
      } catch (error) {
        req.log.error(
          { err: error },
          'Error fetching user practice breakdown:',
        );
        return reply
          .status(500)
          .send({ error: 'Failed to fetch practice breakdown' });
      }
    },
  });

  /**
   * @method GET /manage/users/:userId/progress
   * @description Get progress data over time for a specific user
   */
  app.get('/:userId/progress', {
    schema: {
      params: z.object({
        userId: z.string(),
      }),
      querystring: z.object({
        months: z.coerce.number().optional().default(6),
        module: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const { userId } = req.params;
        const { months, module } = req.query;
        const companyId = req.user!.company!.toString();

        // Validate user access
        const { user, error } = await validateUserAccess(userId, companyId);
        if (error || !user) {
          const statusCode = error?.includes('not found') ? 404 : 403;
          return reply
            .status(statusCode)
            .send({ error: error || 'User not found' });
        }

        const result = await getUserProgressData(
          userId,
          companyId,
          months,
          module,
        );
        let layout = 'regular';
        if (shouldUsePrudentialData(companyId)) {
          layout = 'prudential';
        } else if (companyId === MANULIFE_COMPANY_ID) {
          layout = 'manulife';
        } else if (companyId === MSIG_COMPANY_ID) {
          layout = 'msig';
        }
        // All other companies (BBL, HSBC, Grab, MTL, etc.) use 'regular' layout
        return reply.send({
          ...result,
          layout,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching user progress:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch progress data' });
      }
    },
  });
};

export default router;
