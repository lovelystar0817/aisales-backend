import { Job } from '@hokify/agenda';
import { DashboardCache } from '../../models/DashboardCache.js';
import {
  getAccountSummary,
  getPracticeSummary,
  getPracticeDetails,
  getProgressData,
} from '../../utils/manage/index.js';

interface CalculateDashboardData {
  companyId?: string;
  teams?: string[];
  forceRecalculate?: boolean;
}

const CALCULATION_VERSION = '20250630';

// Cache TTL in hours
const CACHE_TTL_HOURS = 6;

/**
 * Standalone function to calculate dashboard summary - can be called directly
 */
export const calculateDashboardSummaryDirect = async (
  params: CalculateDashboardData = {},
) => {
  const { companyId, teams, forceRecalculate = false } = params;
  const startTime = Date.now();

  try {
    // Normalize team IDs - sort them for consistent caching
    const teamIds = teams && teams.length > 0 ? teams.sort() : undefined;

    console.log(
      `Starting dashboard calculation for company: ${companyId || 'global'}${teamIds ? `, teams: [${teamIds.join(', ')}]` : ' (all teams)'}`,
    );

    // Check if we have fresh cached data (unless forced)
    if (!forceRecalculate) {
      const cacheQuery: any = {
        companyId: companyId || null,
        expiresAt: { $gt: new Date() },
        calculationVersion: CALCULATION_VERSION,
      };

      // Add teamIds to query only if we're filtering by specific teams
      if (teamIds) {
        cacheQuery.teamIds = teamIds;
      } else {
        // When not filtering by teams, look for cache entries without teamIds field
        cacheQuery.teamIds = { $exists: false };
      }

      const existingCache = await DashboardCache.findOne(cacheQuery);

      if (existingCache) {
        console.log(
          `Found fresh cache for company: ${companyId || 'global'}${teamIds ? `, teams: [${teamIds.join(', ')}]` : ' (all teams)'}, skipping calculation`,
        );
        return existingCache;
      }
    }

    // Calculate all dashboard data
    const [accountSummary, practiceSummary, practiceDetails, progressData] =
      await Promise.all([
        getAccountSummary(companyId, teams),
        getPracticeSummary(companyId, teams),
        getPracticeDetails(companyId, teams),
        getProgressData(companyId, teams, 6, undefined),
      ]);

    const calculationDurationMs = Date.now() - startTime;

    // Set expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

    // Prepare cache document
    const cacheDoc: any = {
      companyId: companyId || null,
      calculatedAt: new Date(),
      expiresAt,
      accountSummary,
      practiceSummary,
      practiceDetails,
      progressData,
      calculationVersion: CALCULATION_VERSION,
      calculationDurationMs,
    };

    // Only add teamIds if we're filtering by specific teams
    if (teamIds) {
      cacheDoc.teamIds = teamIds;
    }

    // Build query for upsert
    const upsertQuery: any = {
      companyId: companyId || null,
    };

    if (teamIds) {
      upsertQuery.teamIds = teamIds;
    } else {
      upsertQuery.teamIds = { $exists: false };
    }

    // Save to cache (upsert to handle existing records)
    const savedCache = await DashboardCache.findOneAndUpdate(
      upsertQuery,
      cacheDoc,
      {
        upsert: true,
        new: true,
      },
    );

    console.log(
      `Dashboard calculation completed for company: ${companyId || 'global'}${teamIds ? `, teams: [${teamIds.join(', ')}]` : ' (all teams)'} in ${calculationDurationMs}ms`,
    );
    return savedCache;
  } catch (error) {
    console.error(
      `Error calculating dashboard summary for company: ${companyId || 'global'}${teams?.length ? `, teams: [${teams.join(', ')}]` : ' (all teams)'}:`,
      error,
    );
    throw error;
  }
};

export const calculateDashboardSummary = async (
  job: Job<CalculateDashboardData>,
) => {
  const { companyId, teams, forceRecalculate = false } = job.attrs.data || {};

  // Delegate to the standalone function
  await calculateDashboardSummaryDirect({ companyId, teams, forceRecalculate });
};
