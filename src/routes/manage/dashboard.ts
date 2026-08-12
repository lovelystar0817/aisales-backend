import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getLanguageHeader } from '../../locale/request.js';
import { calculateDashboardSummaryDirect } from '../../jobs/dashboard/calculateDashboardSummary.js';
import { DashboardCache } from '../../models/DashboardCache.js';
import { SalesSession } from '../../models/SalesSession.js';
import { Company } from '../../models/Company.js';
import { MANULIFE_COMPANY_ID, MSIG_COMPANY_ID } from '../../utils/constants.js';
import {
  getAccountSummary,
  getPracticeDetails,
  getPracticeSummary,
  getProgressData,
  getProgressDataV2,
} from '../../utils/manage/index.js';
import {
  formatCallTypeName,
  determineTeamsFilter,
  generateRegularProgressDataV2,
  buildSessionFilterWithCompany,
  buildDateRangeFilter,
  isLegacyModule,
} from '../../utils/manage/shared.js';
import {
  getModules,
  getModulesV2,
  getInactiveModulesWithHistory,
} from '../../utils/module.js';
import { shouldUsePrudentialData } from '../../utils/prudential-standing.js';
import { logAdminAction } from '../../utils/adminLogger.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Middleware to check if the user is authenticated
   */
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  // Common query schema for team filtering
  const teamsFilterSchema = z.object({
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
  });

  /**
   * @method GET /manage/dashboard/filter-options
   * @description Get available filter options for dashboard filters
   */
  app.get('/filter-options', {
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        // Get available modules
        const modules = getModules(companyId).map((module) => ({
          id: module.friendlyId,
          name: formatCallTypeName(module.friendlyId),
        }));

        return reply.send({
          modules: [{ id: 'all', name: 'All modules' }, ...modules],
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching filter options:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch filter options' });
      }
    },
  });

  /**
   * @method GET /manage/dashboard/filter-options-v2
   * @description Get available filter options for dashboard filters (v2 with database modules)
   */
  app.get('/filter-options-v2', {
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const languageCode = getLanguageHeader(req);

        // Get modules from all sources
        const modulesV1 = getModules(companyId);
        const modulesV2 = await getModulesV2(companyId, languageCode);
        const inactiveModulesWithHistory = await getInactiveModulesWithHistory(
          companyId,
          languageCode,
        );

        // Format modules from V1
        const formattedV1 = modulesV1.map((module) => ({
          id: module.friendlyId,
          name: formatCallTypeName(module.friendlyId),
        }));

        // Format modules from V2 (active scenarios)
        const formattedV2 = modulesV2.map((module) => ({
          id: module.friendlyId,
          name: module.title || formatCallTypeName(module.friendlyId),
        }));

        // Format inactive modules with history
        const formattedInactive = inactiveModulesWithHistory.map((module) => ({
          id: module.friendlyId,
          name: module.title || formatCallTypeName(module.friendlyId),
        }));

        // Merge and deduplicate by id (priority: V2 > inactive > V1)
        const moduleMap = new Map<string, { id: string; name: string }>();

        formattedV1.forEach((module) => {
          moduleMap.set(module.id, module);
        });

        formattedInactive.forEach((module) => {
          moduleMap.set(module.id, module);
        });

        formattedV2.forEach((module) => {
          moduleMap.set(module.id, module);
        });

        // Convert to array and sort ascending by name
        const sortedModules = Array.from(moduleMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        return reply.send({
          modules: [{ id: 'all', name: 'All modules' }, ...sortedModules],
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching filter options v2:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch filter options' });
      }
    },
  });

  /**
   * @method GET /manage/dashboard/filter-roles
   * @description Get available filter roles for user management filters
   */
  app.get('/filter-roles', {
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        // Get available modules
        const modules = getModules(companyId).map((module) => ({
          id: module.friendlyId,
          name: formatCallTypeName(module.friendlyId),
        }));

        return reply.send({
          modules: [{ id: 'all', name: 'All modules' }, ...modules],
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching filter options:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch filter options' });
      }
    },
  });

  /**
   * @method GET /manage/dashboard/account-summary
   * @description Get account summary metrics
   */
  app.get('/account-summary', {
    schema: {
      querystring: teamsFilterSchema,
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { teams: queryTeams } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          queryTeams,
          userRole,
          userTeams,
        );

        const result = await getAccountSummary(companyId, filteredTeams);

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
        req.log.error({ err: error }, 'Error fetching account summary:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch account summary' });
      }
    },
  });

  /**
   * @method GET /manage/dashboard/practice-summary
   * @description Get practice summary metrics
   */
  app.get('/practice-summary', {
    schema: {
      querystring: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        teams: z
          .union([
            z
              .string()
              .transform((str) =>
                str
                  .split(',')
                  .filter(
                    (team) => team && team.trim() !== '' && team !== 'all',
                  ),
              ),
            z.array(z.string()),
          ])
          .optional()
          .transform((teams) => {
            if (!teams) return undefined;
            const filtered = teams.filter(
              (team) => team && team.trim() !== '' && team !== 'all',
            );
            return filtered.length > 0 ? filtered : undefined;
          }),
      }),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { dateFrom, dateTo, teams: queryTeams } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          queryTeams,
          userRole,
          userTeams,
        );

        const result = await getPracticeSummary(
          companyId,
          filteredTeams,
          dateFrom,
          dateTo,
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
        req.log.error({ err: error }, 'Error fetching practice summary:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch practice summary' });
      }
    },
  });

  /**
   * @method GET /manage/dashboard/practice-breakdown
   * @description Get practice details by type
   */
  app.get('/practice-breakdown', {
    schema: {
      querystring: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
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
        const { dateFrom, dateTo, teams: queryTeams } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;
        const languageCode = getLanguageHeader(req);

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          queryTeams,
          userRole,
          userTeams,
        );

        const result = await getPracticeDetails(
          companyId,
          filteredTeams,
          dateFrom,
          dateTo,
          languageCode,
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
          breakdown: result,
          layout,
        });
      } catch (error: any) {
        req.log.error('Error fetching practice details:', error.message);

        return reply
          .status(500)
          .send({ error: 'Failed to fetch practice details' });
      }
    },
  });

  /**
   * @method GET /manage/dashboard/progress
   * @description Get progress data over time
   */
  app.get('/progress', {
    schema: {
      querystring: z.object({
        months: z.coerce.number().optional().default(6),
        module: z.string().optional(),
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
        const { months, module, teams: queryTeams } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          queryTeams,
          userRole,
          userTeams,
        );

        const result = await getProgressData(
          companyId,
          filteredTeams,
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
        req.log.error({ err: error }, 'Error fetching progress data:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch progress data' });
      }
    },
  });

  /**
   * @method GET /manage/dashboard/progress-v2
   * @description Get progress data over time with module scorecard fallback
   * Checks if module is legacy (hardcoded) or self-serve (database):
   * - If legacy: uses getProgressData (legacy modules)
   * - If not legacy: uses getProgressDataV2 (self-serve modules)
   */
  app.get('/progress-v2', {
    schema: {
      querystring: z.object({
        months: z.coerce.number().optional().default(6),
        module: z.string(),
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
        const { months, module, teams: queryTeams } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          queryTeams,
          userRole,
          userTeams,
        );

        // Check if module is a legacy module (hardcoded) or self-serve (database)
        const isLegacy = isLegacyModule(companyId, module);

        let result;
        if (isLegacy) {
          // Module is legacy - use legacy approach
          result = await getProgressData(
            companyId,
            filteredTeams,
            months,
            module,
          );
        } else {
          // Module is self-serve - use self-serve approach
          result = await getProgressDataV2(
            companyId,
            filteredTeams ? filteredTeams : [],
            months,
            module,
          );
        }

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
        req.log.error({ err: error }, 'Error fetching progress data v2:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch progress data' });
      }
    },
  });

  /**
   * @method GET /manage/dashboard/summary
   * @description Get all dashboard data from cache, calculate if needed
   */
  app.get('/summary', {
    schema: {
      querystring: teamsFilterSchema,
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { teams: queryTeams } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          queryTeams,
          userRole,
          userTeams,
        );
        // Create cache query
        const cacheQuery: any = {
          companyId,
          expiresAt: { $gt: new Date() },
        };

        if (filteredTeams && filteredTeams.length > 0) {
          // Sort teams for consistent cache lookup
          cacheQuery.teamIds = filteredTeams.sort();
        } else {
          // When not filtering by teams, look for cache entries without teamIds field
          cacheQuery.teamIds = { $exists: false };
        }

        // Try to get cached data first
        let cachedData = await DashboardCache.findOne(cacheQuery).sort({
          calculatedAt: -1,
        });

        // If no fresh cache exists, calculate immediately and wait for completion
        if (!cachedData) {
          req.log.info('No fresh cache found, calculating dashboard data...');

          // Calculate immediately and get fresh data
          cachedData = await calculateDashboardSummaryDirect({
            companyId,
            teams: filteredTeams,
            forceRecalculate: true,
          });
        }

        if (!cachedData) {
          return reply
            .status(500)
            .send({ error: 'Failed to generate dashboard data' });
        }

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
          layout,
          accountSummary: cachedData.accountSummary,
          practiceSummary: cachedData.practiceSummary,
          practiceDetails: cachedData.practiceDetails,
          progressData: cachedData.progressData,
          lastUpdated: cachedData.calculatedAt,
          calculationDuration: cachedData.calculationDurationMs,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching dashboard summary:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch dashboard summary' });
      }
    },
  });

  /**
   * @method POST /manage/dashboard/refresh
   * @description Manually refresh dashboard cache
   */
  app.post('/refresh', {
    schema: {
      body: teamsFilterSchema.optional(),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { teams: queryTeams } = req.body || {};
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          queryTeams,
          userRole,
          userTeams,
        );

        // Calculate fresh data immediately
        await calculateDashboardSummaryDirect({
          companyId,
          teams: filteredTeams,
          forceRecalculate: true,
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'dashboard_refreshed',
          category: 'system',
          targetType: 'DashboardCache',
          targetName: 'Dashboard Cache',
          details: {
            teams: filteredTeams,
          },
        });

        return reply.send({
          message: 'Dashboard refresh completed',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error refreshing dashboard:');
        return reply.status(500).send({ error: 'Failed to refresh dashboard' });
      }
    },
  });
};

export default router;
