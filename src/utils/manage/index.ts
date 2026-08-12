import { SalesSession } from '../../models/SalesSession.js';
import { User } from '../../models/User.js';
import { UserStanding } from '../../models/UserStanding.js';
import {
  BBL_COMPANY_ID,
  MANULIFE_COMPANY_ID,
  MSIG_COMPANY_ID,
  HSBC_COMPANY_ID,
  HSBC_YUE_COMPANY_ID,
  GRAB_COMPANY_ID,
  MTL_COMPANY_ID,
  AXA_PH_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
  KT_AXA_COMPANY_ID,
  AIA_KO_COMPANY_ID,
} from '../constants.js';
import { shouldUsePrudentialData } from '../prudential-standing.js';
import {
  getBulkManulifeUserStatistics,
  getManulifePracticeDetails,
  getManulifeStandingsProgress,
  getManulifeStandingsSummary,
  getManulifeUserPracticeBreakdown,
  getManulifeUserPracticeSummary,
  getManulifeUserProgressData,
} from './manulife.js';
import {
  getBulkPrudentialUserStatistics,
  getPrudentialPracticeDetails,
  getPrudentialStandingsProgress,
  getPrudentialStandingsSummary,
  getPrudentialUserPracticeBreakdown,
  getPrudentialUserPracticeSummary,
  getPrudentialUserProgressData,
  getPrudentialUserSessionHistory,
  getPrudentialUserStatistics,
} from './prudential.js';
import {
  getMSIGPracticeDetails,
  getMSIGPracticeSummary,
  getMSIGProgressData,
  getMSIGUserStatistics,
  getMSIGUserPracticeSummary,
  getMSIGUserPracticeBreakdown,
  getMSIGUserProgressData,
  getBulkMSIGUserStatistics,
  getMSIGUserSessionHistory,
} from './msig.js';
import {
  getBulkRegularUserStatistics,
  getRegularPracticeDetails,
  getRegularPracticeSummary,
  getRegularProgressData,
  getRegularProgressDataV2,
  getRegularUserPracticeBreakdown,
  getRegularUserPracticeSummary,
  getRegularUserProgressData,
  getRegularUserSessionHistory,
  getRegularUserStatistics,
} from './regular.js';
import {
  getBBLPracticeDetails,
  getBBLStandingsProgress,
  getBBLStandingsSummary,
  getBBLUserPracticeBreakdown,
  getBBLUserPracticeSummary,
  getBBLUserProgressData,
  getBBLUserSessionHistory,
  getBBLUserStatistics,
  getBulkBBLUserStatistics,
} from './bbl.js';
import {
  getHSBCPracticeDetails,
  getHSBCPracticeSummary,
  getHSBCProgressData,
  getHSBCUserStatistics,
  getHSBCUserPracticeSummary,
  getHSBCUserPracticeBreakdown,
  getHSBCUserProgressData,
  getBulkHSBCUserStatistics,
  getHSBCUserSessionHistory,
} from './hsbc.js';
import {
  getGrabPracticeDetails,
  getGrabPracticeSummary,
  getGrabProgressData,
  getGrabProgressDataV2,
  getGrabUserStatistics,
  getGrabUserPracticeSummary,
  getGrabUserPracticeBreakdown,
  getGrabUserProgressData,
  getBulkGrabUserStatistics,
  getGrabUserSessionHistory,
} from './grab.js';
import {
  getMTLPracticeDetails,
  getMTLPracticeSummary,
  getMTLProgressData,
  getMTLUserStatistics,
  getMTLUserPracticeSummary,
  getMTLUserPracticeBreakdown,
  getMTLUserProgressData,
  getBulkMTLUserStatistics,
  getMTLUserSessionHistory,
} from './mtl.js';
import {
  getAxaPhPracticeDetails,
  getAxaPhPracticeSummary,
  getAxaPhProgressData,
  getAxaPhUserStatistics,
  getAxaPhUserPracticeSummary,
  getAxaPhUserPracticeBreakdown,
  getAxaPhUserProgressData,
  getBulkAxaPhUserStatistics,
  getAxaPhUserSessionHistory,
} from './axa-ph.js';
import {
  getKtAxaPracticeDetails,
  getKtAxaPracticeSummary,
  getKtAxaProgressData,
  getKtAxaUserStatistics,
  getKtAxaUserPracticeSummary,
  getKtAxaUserPracticeBreakdown,
  getKtAxaUserProgressData,
  getBulkKtAxaUserStatistics,
  getKtAxaUserSessionHistory,
} from './kt-axa.js';
import {
  getAiaKoPracticeDetails,
  getAiaKoPracticeSummary,
  getAiaKoProgressData,
  getAiaKoUserPracticeSummary,
  getAiaKoUserPracticeBreakdown,
  getAiaKoUserSessionHistory,
  getAiaKoUserProgressData,
  getBulkAiaKoUserStatistics,
} from './aia-ko.js';
import { getManulifeUserSessionHistory } from './manulife.js';
import {
  buildBaseUserFilter,
  type BulkUserStatisticsResult,
} from './shared.js';

export async function getAccountSummary(companyId?: string, teams?: string[]) {
  const currentDate = new Date();
  const last30Days = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previous30Days = new Date(
    currentDate.getTime() - 60 * 24 * 60 * 60 * 1000,
  );
  const previous30DaysEnd = new Date(
    currentDate.getTime() - 30 * 24 * 60 * 60 * 1000,
  );

  // Build query filter
  const userFilter = buildBaseUserFilter(companyId, teams);

  // Get user IDs for company/team filtering
  const userIds =
    companyId || teams?.length
      ? await User.find(userFilter).distinct('_id')
      : null;

  // Get total accounts created
  const accountsCreated = await User.countDocuments(userFilter);

  // Get active users in the last 30 days (users who had sessions in the last 30 days)
  const last30DaysSessions = await SalesSession.find({
    startedAt: { $gte: last30Days },
    ...((companyId || teams?.length) && { user: { $in: userIds } }),
  }).distinct('user');
  const monthlyActiveUsers = last30DaysSessions.length;

  // Get previous 30 days' active users for growth calculation (days 31-60 ago)
  const previous30DaysSessions = await SalesSession.find({
    startedAt: { $gte: previous30Days, $lt: previous30DaysEnd },
    ...((companyId || teams?.length) && { user: { $in: userIds } }),
  }).distinct('user');
  const lastMonthActiveUsers = previous30DaysSessions.length;

  // Calculate growth percentage
  const monthlyActiveUsersGrowth =
    lastMonthActiveUsers > 0
      ? Math.round(
          ((monthlyActiveUsers - lastMonthActiveUsers) / lastMonthActiveUsers) *
            100,
        )
      : monthlyActiveUsers > 0
        ? 100
        : 0;

  // Get repeat users (users with more than one completed session)
  const userSessionCounts = await SalesSession.aggregate([
    {
      $match: {
        endedAt: { $exists: true, $ne: null },
        $expr: { $gte: [{ $size: '$messages' }, 6] },
        ...((companyId || teams?.length) && { user: { $in: userIds } }),
      },
    },
    {
      $group: {
        _id: '$user',
        sessionCount: { $sum: 1 },
      },
    },
    {
      $match: {
        sessionCount: { $gte: 2 },
      },
    },
  ]);
  const repeatUsers = userSessionCounts.length;

  // For Prudential, add standings-specific metrics
  let prudentialMetrics = null;
  if (companyId && shouldUsePrudentialData(companyId)) {
    // Build standings filter
    const standingsFilter: any = { company: companyId };
    if (teams?.length) {
      // Get users in the specified teams
      const teamUserIds = await User.find({
        company: companyId,
        teams: { $in: teams },
      }).distinct('_id');
      standingsFilter.user = { $in: teamUserIds };
    }

    // Get standings from last 30 days
    const currentMonthStandings = await UserStanding.find({
      ...standingsFilter,
      createdAt: { $gte: last30Days },
    }).lean();

    // Get standings from previous 30 days (days 31-60 ago)
    const lastMonthStandings = await UserStanding.find({
      ...standingsFilter,
      createdAt: { $gte: previous30Days, $lt: previous30DaysEnd },
    }).lean();

    // Calculate tier distribution for current month
    const tierDistribution = currentMonthStandings.reduce(
      (acc, standing) => {
        acc[standing.tierLevel] = (acc[standing.tierLevel] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    // Users with level 3 (Strategic Consultant) standings
    const strategicConsultants = currentMonthStandings.filter(
      (s) => s.tierLevel === 3,
    ).length;

    prudentialMetrics = {
      monthlyStandings: currentMonthStandings.length,
      lastMonthStandings: lastMonthStandings.length,
      standingsGrowth:
        lastMonthStandings.length > 0
          ? Math.round(
              ((currentMonthStandings.length - lastMonthStandings.length) /
                lastMonthStandings.length) *
                100,
            )
          : currentMonthStandings.length > 0
            ? 100
            : 0,
      strategicConsultants,
      tierDistribution,
    };
  }

  return {
    accountsCreated,
    monthlyActiveUsers,
    monthlyActiveUsersGrowth,
    repeatUsers,
    ...(prudentialMetrics && { prudentialMetrics }),
  };
}

export async function getPracticeSummary(
  companyId?: string,
  teams?: string[],
  dateFrom?: string,
  dateTo?: string,
) {
  // Check if this is Prudential company - if so, use standings instead
  if (companyId && shouldUsePrudentialData(companyId)) {
    return getPrudentialStandingsSummary(companyId, dateFrom, dateTo);
  } else if (companyId === MANULIFE_COMPANY_ID) {
    return getManulifeStandingsSummary(companyId, dateFrom, dateTo);
  } else if (companyId === BBL_COMPANY_ID) {
    return getBBLStandingsSummary(companyId, dateFrom, dateTo);
  } else if (companyId === MSIG_COMPANY_ID) {
    return getMSIGPracticeSummary(companyId, dateFrom, dateTo, teams);
  } else if (
    companyId === HSBC_COMPANY_ID ||
    companyId === HSBC_YUE_COMPANY_ID
  ) {
    return getHSBCPracticeSummary(companyId, dateFrom, dateTo, teams);
  } else if (
    companyId === GRAB_COMPANY_ID ||
    companyId === GRAB_TEST_COMPANY_ID
  ) {
    return getGrabPracticeSummary(companyId, dateFrom, dateTo, teams);
  } else if (companyId === MTL_COMPANY_ID) {
    return getMTLPracticeSummary(companyId, dateFrom, dateTo, teams);
  } else if (companyId === AXA_PH_COMPANY_ID) {
    return getAxaPhPracticeSummary(companyId, dateFrom, dateTo, teams);
  } else if (companyId === KT_AXA_COMPANY_ID) {
    return getKtAxaPracticeSummary(companyId, dateFrom, dateTo, teams);
  } else if (companyId === AIA_KO_COMPANY_ID) {
    return getAiaKoPracticeSummary(companyId, dateFrom, dateTo, teams);
  }

  return getRegularPracticeSummary(companyId, dateFrom, dateTo, teams);
}

export async function getPracticeDetails(
  companyId?: string,
  teams?: string[],
  dateFrom?: string,
  dateTo?: string,
  languageCode: string = 'en',
) {
  // Check if this is Prudential company - if so, show sessions but with no scores
  if (companyId && shouldUsePrudentialData(companyId)) {
    return getPrudentialPracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  } else if (companyId === MANULIFE_COMPANY_ID) {
    return getManulifePracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  } else if (companyId === BBL_COMPANY_ID) {
    return getBBLPracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  } else if (companyId === MSIG_COMPANY_ID) {
    return getMSIGPracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  } else if (
    companyId === HSBC_COMPANY_ID ||
    companyId === HSBC_YUE_COMPANY_ID
  ) {
    return getHSBCPracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  } else if (
    companyId === GRAB_COMPANY_ID ||
    companyId === GRAB_TEST_COMPANY_ID
  ) {
    return getGrabPracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  } else if (companyId === MTL_COMPANY_ID) {
    return getMTLPracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  } else if (companyId === AXA_PH_COMPANY_ID) {
    return getAxaPhPracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  } else if (companyId === KT_AXA_COMPANY_ID) {
    return getKtAxaPracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  } else if (companyId === AIA_KO_COMPANY_ID) {
    return getAiaKoPracticeDetails(
      companyId,
      dateFrom,
      dateTo,
      teams,
      languageCode,
    );
  }

  return getRegularPracticeDetails(
    companyId,
    dateFrom,
    dateTo,
    teams,
    languageCode,
  );
}

export async function getProgressData(
  companyId?: string,
  teams?: string[],
  months: number = 6,
  module?: string,
) {
  // Check if this is Prudential company - if so, use standings instead
  if (companyId && shouldUsePrudentialData(companyId)) {
    return getPrudentialStandingsProgress(companyId, months, module);
  } else if (companyId === MANULIFE_COMPANY_ID) {
    return getManulifeStandingsProgress(companyId, months, module);
  } else if (companyId === BBL_COMPANY_ID) {
    return getBBLStandingsProgress(companyId, months, module);
  } else if (companyId === MSIG_COMPANY_ID) {
    return getMSIGProgressData(companyId, months, module, teams);
  } else if (
    companyId === HSBC_COMPANY_ID ||
    companyId === HSBC_YUE_COMPANY_ID
  ) {
    return getHSBCProgressData(companyId, months, module, teams);
  } else if (
    companyId === GRAB_COMPANY_ID ||
    companyId === GRAB_TEST_COMPANY_ID
  ) {
    return getGrabProgressData(companyId, months, module, teams);
  } else if (companyId === MTL_COMPANY_ID) {
    return getMTLProgressData(companyId, months, module, teams);
  } else if (companyId === AXA_PH_COMPANY_ID) {
    return getAxaPhProgressData(companyId, months, module, teams);
  } else if (companyId === KT_AXA_COMPANY_ID) {
    return getKtAxaProgressData(companyId, months, module, teams);
  } else if (companyId === AIA_KO_COMPANY_ID) {
    return getAiaKoProgressData(companyId, months, module, teams);
  }

  return getRegularProgressData(companyId, months, module, teams);
}

export async function getProgressDataV2(
  companyId: string,
  teams: string[],
  months: number,
  module: string,
) {
  if (companyId === GRAB_COMPANY_ID || companyId === GRAB_TEST_COMPANY_ID) {
    return getGrabProgressDataV2(companyId, months, module, teams);
  }

  return getRegularProgressDataV2(companyId, months, module, teams);
}

export async function getUserStatistics(
  userId: string,
  companyId: string,
  module?: string,
) {
  // Check if this is Prudential company - if so, include standings data
  if (companyId && shouldUsePrudentialData(companyId)) {
    return getPrudentialUserStatistics(userId, companyId, module);
  } else if (companyId === BBL_COMPANY_ID) {
    return getBBLUserStatistics(userId, companyId, module);
  } else if (companyId === MSIG_COMPANY_ID) {
    return getMSIGUserStatistics(userId, companyId, module);
  } else if (
    companyId === HSBC_COMPANY_ID ||
    companyId === HSBC_YUE_COMPANY_ID
  ) {
    return getHSBCUserStatistics(userId, companyId, module);
  } else if (
    companyId === GRAB_COMPANY_ID ||
    companyId === GRAB_TEST_COMPANY_ID
  ) {
    return getGrabUserStatistics(userId, companyId, module);
  } else if (companyId === MTL_COMPANY_ID) {
    return getMTLUserStatistics(userId, companyId, module);
  } else if (companyId === AXA_PH_COMPANY_ID) {
    return getAxaPhUserStatistics(userId, companyId, module);
  } else if (companyId === KT_AXA_COMPANY_ID) {
    return getKtAxaUserStatistics(userId, companyId, module);
  }

  return getRegularUserStatistics(userId, companyId, module);
}

export async function getUserPracticeSummary(
  userId: string,
  companyId: string,
) {
  // Check if this is Prudential company - if so, use standings instead
  if (companyId && shouldUsePrudentialData(companyId)) {
    return getPrudentialUserPracticeSummary(userId, companyId);
  } else if (companyId === MANULIFE_COMPANY_ID) {
    return getManulifeUserPracticeSummary(userId, companyId);
  } else if (companyId === BBL_COMPANY_ID) {
    return getBBLUserPracticeSummary(userId, companyId);
  } else if (companyId === MSIG_COMPANY_ID) {
    return getMSIGUserPracticeSummary(userId, companyId);
  } else if (
    companyId === HSBC_COMPANY_ID ||
    companyId === HSBC_YUE_COMPANY_ID
  ) {
    return getHSBCUserPracticeSummary(userId, companyId);
  } else if (
    companyId === GRAB_COMPANY_ID ||
    companyId === GRAB_TEST_COMPANY_ID
  ) {
    return getGrabUserPracticeSummary(userId, companyId);
  } else if (companyId === MTL_COMPANY_ID) {
    return getMTLUserPracticeSummary(userId, companyId);
  } else if (companyId === AXA_PH_COMPANY_ID) {
    return getAxaPhUserPracticeSummary(userId, companyId);
  } else if (companyId === KT_AXA_COMPANY_ID) {
    return getKtAxaUserPracticeSummary(userId, companyId);
  } else if (companyId === AIA_KO_COMPANY_ID) {
    return getAiaKoUserPracticeSummary(userId, companyId);
  }

  return getRegularUserPracticeSummary(userId, companyId);
}

export async function getUserPracticeBreakdown(
  userId: string,
  companyId: string,
) {
  // Check if this is Prudential company - if so, use standings instead
  if (companyId && shouldUsePrudentialData(companyId)) {
    return getPrudentialUserPracticeBreakdown(userId, companyId);
  } else if (companyId === MANULIFE_COMPANY_ID) {
    return getManulifeUserPracticeBreakdown(userId, companyId);
  } else if (companyId === BBL_COMPANY_ID) {
    return getBBLUserPracticeBreakdown(userId, companyId);
  } else if (companyId === MSIG_COMPANY_ID) {
    return getMSIGUserPracticeBreakdown(userId, companyId);
  } else if (
    companyId === HSBC_COMPANY_ID ||
    companyId === HSBC_YUE_COMPANY_ID
  ) {
    return getHSBCUserPracticeBreakdown(userId, companyId);
  } else if (
    companyId === GRAB_COMPANY_ID ||
    companyId === GRAB_TEST_COMPANY_ID
  ) {
    return getGrabUserPracticeBreakdown(userId, companyId);
  } else if (companyId === MTL_COMPANY_ID) {
    return getMTLUserPracticeBreakdown(userId, companyId);
  } else if (companyId === AXA_PH_COMPANY_ID) {
    return getAxaPhUserPracticeBreakdown(userId, companyId);
  } else if (companyId === KT_AXA_COMPANY_ID) {
    return getKtAxaUserPracticeBreakdown(userId, companyId);
  } else if (companyId === AIA_KO_COMPANY_ID) {
    return getAiaKoUserPracticeBreakdown(userId, companyId);
  }

  return getRegularUserPracticeBreakdown(userId, companyId);
}

export async function getUserProgressData(
  userId: string,
  companyId: string,
  months: number = 6,
  module?: string,
) {
  // Check if this is Prudential company - if so, use standings instead
  if (companyId && shouldUsePrudentialData(companyId)) {
    return getPrudentialUserProgressData(userId, companyId, months, module);
  } else if (companyId === MANULIFE_COMPANY_ID) {
    return getManulifeUserProgressData(userId, companyId);
  } else if (companyId === BBL_COMPANY_ID) {
    return getBBLUserProgressData(userId, companyId, months, module);
  } else if (companyId === MSIG_COMPANY_ID) {
    return getMSIGUserProgressData(userId, companyId, months, module);
  } else if (
    companyId === HSBC_COMPANY_ID ||
    companyId === HSBC_YUE_COMPANY_ID
  ) {
    return getHSBCUserProgressData(userId, companyId, months, module);
  } else if (
    companyId === GRAB_COMPANY_ID ||
    companyId === GRAB_TEST_COMPANY_ID
  ) {
    return getGrabUserProgressData(userId, companyId, months, module);
  } else if (companyId === MTL_COMPANY_ID) {
    return getMTLUserProgressData(userId, companyId, months, module);
  } else if (companyId === AXA_PH_COMPANY_ID) {
    return getAxaPhUserProgressData(userId, companyId, months, module);
  } else if (companyId === KT_AXA_COMPANY_ID) {
    return getKtAxaUserProgressData(userId, companyId, months, module);
  } else if (companyId === AIA_KO_COMPANY_ID) {
    return getAiaKoUserProgressData(userId, companyId, months, module);
  }

  return getRegularUserProgressData(userId, companyId, months, module);
}

/**
 * Bulk version of getUserStatistics
 * Returns a map of userId -> statistics for efficient lookups
 */
export async function getBulkUserStatistics(
  userIds: string[],
  companyId: string,
  module?: string,
): Promise<BulkUserStatisticsResult> {
  if (userIds.length === 0) {
    return {};
  }

  if (companyId && shouldUsePrudentialData(companyId)) {
    return getBulkPrudentialUserStatistics(userIds, companyId, module);
  } else if (companyId === MANULIFE_COMPANY_ID) {
    return getBulkManulifeUserStatistics(userIds, companyId, module);
  } else if (companyId === BBL_COMPANY_ID) {
    return getBulkBBLUserStatistics(userIds, companyId, module);
  } else if (companyId === MSIG_COMPANY_ID) {
    return getBulkMSIGUserStatistics(userIds, companyId, module);
  } else if (
    companyId === HSBC_COMPANY_ID ||
    companyId === HSBC_YUE_COMPANY_ID
  ) {
    return getBulkHSBCUserStatistics(userIds, companyId, module);
  } else if (
    companyId === GRAB_COMPANY_ID ||
    companyId === GRAB_TEST_COMPANY_ID
  ) {
    return getBulkGrabUserStatistics(userIds, companyId, module);
  } else if (companyId === MTL_COMPANY_ID) {
    return getBulkMTLUserStatistics(userIds, companyId, module);
  } else if (companyId === AXA_PH_COMPANY_ID) {
    return getBulkAxaPhUserStatistics(userIds, companyId, module);
  } else if (companyId === KT_AXA_COMPANY_ID) {
    return getBulkKtAxaUserStatistics(userIds, companyId, module);
  } else if (companyId === AIA_KO_COMPANY_ID) {
    return getBulkAiaKoUserStatistics(userIds, companyId, module);
  }

  return getBulkRegularUserStatistics(userIds, companyId, module);
}

/**
 * Get paginated session history for a user
 * Automatically routes to the appropriate company-specific implementation
 */
export async function getUserSessionHistory(
  userId: string,
  companyId: string,
  page: number = 1,
  limit: number = 10,
) {
  if (companyId && shouldUsePrudentialData(companyId)) {
    return getPrudentialUserSessionHistory(userId, companyId, page, limit);
  } else if (companyId === MANULIFE_COMPANY_ID) {
    return getManulifeUserSessionHistory(userId, companyId, page, limit);
  } else if (companyId === BBL_COMPANY_ID) {
    return getBBLUserSessionHistory(userId, companyId, page, limit);
  } else if (companyId === MSIG_COMPANY_ID) {
    return getMSIGUserSessionHistory(userId, companyId, page, limit);
  } else if (
    companyId === HSBC_COMPANY_ID ||
    companyId === HSBC_YUE_COMPANY_ID
  ) {
    return getHSBCUserSessionHistory(userId, companyId, page, limit);
  } else if (
    companyId === GRAB_COMPANY_ID ||
    companyId === GRAB_TEST_COMPANY_ID
  ) {
    return getGrabUserSessionHistory(userId, companyId, page, limit);
  } else if (companyId === MTL_COMPANY_ID) {
    return getMTLUserSessionHistory(userId, companyId, page, limit);
  } else if (companyId === AXA_PH_COMPANY_ID) {
    return getAxaPhUserSessionHistory(userId, companyId, page, limit);
  } else if (companyId === KT_AXA_COMPANY_ID) {
    return getKtAxaUserSessionHistory(userId, companyId, page, limit);
  } else if (companyId === AIA_KO_COMPANY_ID) {
    return getAiaKoUserSessionHistory(userId, companyId, page, limit);
  }

  return getRegularUserSessionHistory(userId, companyId, page, limit);
}
