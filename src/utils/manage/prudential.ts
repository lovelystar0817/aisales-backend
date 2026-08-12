import { SalesSession } from '../../models/SalesSession.js';
import { User } from '../../models/User.js';
import { UserStanding } from '../../models/UserStanding.js';
import {
  buildBaseUserFilter,
  buildDateRangeFilter,
  buildSessionFilterWithCompany,
  calculateBasicStatistics,
  calculateSessionDurations,
  calculateSessionDuration,
  formatCallTypeName,
  generatePrudentialPracticeBreakdown,
  generatePrudentialProgressData,
  getBulkSessionsByUser,
  type BulkUserStatisticsResult,
  type SessionHistoryResult,
} from './shared.js';

/**
 * Helper function to get Prudential user statistics with standings
 */
export async function getPrudentialUserStatistics(
  userId: string,
  companyId: string,
  module?: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
    module,
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const {
    totalPractices,
    averageDurationMinutes,
    averageDurationSeconds,
    lastSessionDate,
  } = calculateBasicStatistics(sessions);

  return {
    totalPractices,
    averageDurationMinutes,
    averageDurationSeconds,
    averageScore: null,
    lastSessionDate,
  };
}

/**
 * Get Prudential standings summary for dashboard
 */
export async function getPrudentialStandingsSummary(
  companyId: string,
  dateFrom?: string,
  dateTo?: string,
  teams?: string[], // Add teams parameter
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    dateFrom,
    dateTo,
    teams, // Pass teams to filter
  });

  const sessions = await SalesSession.find(sessionFilter).lean();
  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);
  const finishedPractices = sessions.length;

  return {
    finishedPractices,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore: null,
  };
}

/**
 * Get detailed Prudential standings breakdown by module and tier
 */
export async function getPrudentialStandingsDetails(
  companyId: string,
  dateFrom?: string,
  dateTo?: string,
  module?: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    dateFrom,
    dateTo,
    module,
  });

  const sessions = await SalesSession.find(sessionFilter).lean();
  const sessionIds = sessions.map((s) => s._id);

  const standings = await UserStanding.find({
    company: companyId,
    session: { $in: sessionIds },
  })
    .populate({
      path: 'session',
      select: 'callType createdAt',
    })
    .lean();

  const moduleData: Record<
    string,
    {
      totalAssessments: number;
      tierDistribution: Record<string, number>;
      breakdown: {
        tierName: string;
        tierLevel: number;
        count: number;
        percentage: number;
      }[];
    }
  > = {};

  for (const standing of standings) {
    const callType = (standing.session as any)?.callType || 'unknown';

    if (!moduleData[callType]) {
      moduleData[callType] = {
        totalAssessments: 0,
        tierDistribution: {},
        breakdown: [],
      };
    }

    moduleData[callType].totalAssessments++;
    const tierKey = `${standing.tierName} (L${standing.tierLevel})`;
    moduleData[callType].tierDistribution[tierKey] =
      (moduleData[callType].tierDistribution[tierKey] || 0) + 1;
  }

  const formattedDetails = Object.entries(moduleData)
    .map(([callType, data]) => {
      const breakdown = Object.entries(data.tierDistribution)
        .map(([tierKey, count]) => {
          const match = tierKey.match(/^(.+) \(L(\d+)\)$/);
          const tierName = match ? match[1] : tierKey;
          const tierLevel = match ? parseInt(match[2]) : 0;

          return {
            tierName,
            tierLevel,
            count,
            percentage: Math.round((count / data.totalAssessments) * 100),
          };
        })
        .sort((a, b) => b.tierLevel - a.tierLevel); // Sort by tier level descending

      return {
        type: formatCallTypeName(callType),
        totalAssessments: data.totalAssessments,
        breakdown,
      };
    })
    .sort((a, b) => b.totalAssessments - a.totalAssessments); // Sort by total assessments descending

  return formattedDetails;
}

/**
 * Get Prudential practice details with same structure but scores as hyphens
 */
export async function getPrudentialPracticeDetails(
  companyId: string,
  dateFrom?: string,
  dateTo?: string,
  teams?: string[], // Add teams parameter
  languageCode: string = 'en',
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    dateFrom,
    dateTo,
    teams, // Pass teams to filter
  });

  const sessions = await SalesSession.find(sessionFilter)
    .populate('product', 'name friendlyId')
    .lean();
  const sessionIds = sessions.map((s) => s._id);

  // Filter standings by team if needed
  let standingsFilter: any = {
    company: companyId,
    session: { $in: sessionIds },
  };

  if (teams && teams.length > 0) {
    const validTeams = teams.filter(
      (team) => team && team.trim() !== '' && team !== 'all',
    );
    if (validTeams.length > 0) {
      const userQuery = buildBaseUserFilter(companyId, validTeams);
      const teamUserIds = await User.find(userQuery).distinct('_id');
      standingsFilter.user = { $in: teamUserIds };
    }
  }

  const standings = await UserStanding.find(standingsFilter)
    .populate({
      path: 'session',
      select: 'callType product',
    })
    .lean();

  return generatePrudentialPracticeBreakdown(
    sessions,
    standings,
    companyId,
    languageCode,
  );
}
/**
 * Get Prudential standings progress over time
 */
export async function getPrudentialStandingsProgress(
  companyId: string,
  months: number = 6,
  module?: string,
  teams?: string[], // Add teams parameter
) {
  const { startDate, endDate } = buildDateRangeFilter(months);

  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    teams, // Pass teams to filter
    module,
    additionalFilters: {
      endedAt: { $exists: true, $ne: null, $gte: startDate, $lte: endDate },
      'roleplay.feedback': { $exists: true },
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  return generatePrudentialProgressData(sessions, months, module);
}

export async function getPrudentialUserPracticeSummary(
  userId: string,
  companyId: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);

  return {
    finishedPractices: sessions.length,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore: null,
  };
}

export async function getPrudentialUserPracticeBreakdown(
  userId: string,
  companyId: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
  });

  const sessions = await SalesSession.find(sessionFilter)
    .populate('product', 'name friendlyId')
    .lean();
  const sessionIds = sessions.map((s) => s._id);

  const standings = await UserStanding.find({
    user: userId,
    company: companyId,
    session: { $in: sessionIds },
  })
    .populate({
      path: 'session',
      select: 'callType product',
      populate: {
        path: 'product',
        select: 'name friendlyId',
      },
    })
    .lean();

  return generatePrudentialPracticeBreakdown(
    sessions,
    standings,
    companyId,
    'en',
  );
}

export async function getPrudentialUserProgressData(
  userId: string,
  companyId: string,
  months: number = 6,
  module?: string,
) {
  const { startDate, endDate } = buildDateRangeFilter(months);

  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
    module,
    additionalFilters: {
      endedAt: { $exists: true, $ne: null, $gte: startDate, $lte: endDate },
    },
  });

  const sessions = await SalesSession.find(sessionFilter)
    .sort({ endedAt: 1 })
    .lean();

  return generatePrudentialProgressData(sessions, months, module);
}

/**
 * Bulk version of getPrudentialUserStatistics to avoid N+1 queries
 */
export async function getBulkPrudentialUserStatistics(
  userIds: string[],
  companyId: string,
  module?: string,
  teams?: string[], // Add teams parameter
): Promise<BulkUserStatisticsResult> {
  if (userIds.length === 0) {
    return {};
  }

  // Use shared helper to get sessions grouped by user
  const sessionsByUser = await getBulkSessionsByUser(
    userIds,
    companyId,
    module,
    teams, // Pass teams to shared function
  );

  // Get all session IDs for fetching standings
  const allSessionIds = Object.values(sessionsByUser)
    .flat()
    .map((session) => session._id);

  // Fetch all standings for these sessions in one query
  const standings = await UserStanding.find({
    company: companyId,
    session: { $in: allSessionIds },
  })
    .select('session tierLevel tierName')
    .lean();

  // Create a map of session -> standing info
  const standingBySession = new Map<
    string,
    { tierLevel: number; tierName: string }
  >();
  standings.forEach((standing) => {
    standingBySession.set(standing.session.toString(), {
      tierLevel: standing.tierLevel,
      tierName: standing.tierName,
    });
  });

  // Calculate statistics for each user
  const results: BulkUserStatisticsResult = {};

  for (const userId of userIds) {
    const userSessions = sessionsByUser[userId] || [];

    const {
      totalPractices,
      averageDurationMinutes,
      averageDurationSeconds,
      lastSessionDate,
    } = calculateBasicStatistics(userSessions);

    // Aggregate standings for this user's sessions
    const standingCounts = new Map<
      string,
      { level: string; grade: string; count: number }
    >();

    userSessions.forEach((session) => {
      const standing = standingBySession.get(session._id.toString());
      if (standing) {
        const key = `L${standing.tierLevel}`;
        if (standingCounts.has(key)) {
          standingCounts.get(key)!.count++;
        } else {
          standingCounts.set(key, {
            level: key,
            grade: standing.tierName,
            count: 1,
          });
        }
      }
    });

    // Convert to array and sort by level (L3, L2, L1)
    const standingsArray = Array.from(standingCounts.values()).sort((a, b) => {
      const levelA = parseInt(a.level.substring(1));
      const levelB = parseInt(b.level.substring(1));
      return levelB - levelA; // Descending order
    });

    results[userId] = {
      totalPractices,
      averageDurationMinutes,
      averageDurationSeconds,
      averageScore: null, // Prudential uses standings instead of scores
      lastSessionDate,
      standings: standingsArray.length > 0 ? standingsArray : undefined,
    };
  }

  return results;
}

/**
 * Get session history for a Prudential user with standings
 */
export async function getPrudentialUserSessionHistory(
  userId: string,
  companyId: string,
  page: number = 1,
  limit: number = 10,
): Promise<SessionHistoryResult> {
  // Build session filter (only completed sessions)
  const sessionFilter = {
    user: userId,
    endedAt: { $exists: true, $ne: null },
    $expr: { $gte: [{ $size: '$messages' }, 6] },
  };

  // Get total count
  const totalSessions = await SalesSession.countDocuments(sessionFilter);

  // Pagination
  const skip = (page - 1) * limit;

  // Fetch sessions
  const sessions = await SalesSession.find(sessionFilter)
    .sort({ endedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('product', 'name')

    .populate('persona', 'name occupation')
    .populate({
      path: 'scenario',
      populate: [
        { path: 'module' },
        { path: 'persona', select: 'name occupation' },
      ],
    })
    .select(
      'callType endedAt startedAt roleplay.feedback roleplay.duration product persona scenario',
    )
    .lean();

  // Prepare standing map
  const sessionIds = sessions.map((s) => s._id);
  const standings = await UserStanding.find({
    company: companyId,
    session: { $in: sessionIds },
  }).lean();

  const standingMap: Record<string, { tierName: string; tierLevel: number }> =
    {};
  standings.forEach((st: any) => {
    standingMap[st.session.toString()] = {
      tierName: (() => {
        if (st.tierLevel === 1) return 'Sales Novice';
        if (st.tierLevel === 2) return 'Skilled Advisor';
        return 'Strategic Consultant';
      })(),
      tierLevel: st.tierLevel,
    };
  });

  // Transform sessions
  const sessionHistory = sessions.map((session: any) => {
    // Use roleplay.duration (actual conversation time) if available,
    // otherwise fall back to calculated session time
    const durationSeconds =
      session.roleplay?.duration ??
      calculateSessionDuration(session.startedAt, session.endedAt);

    const st = standingMap[session._id.toString()];
    let standingLevel: string | null = null;
    let standingGrade: string | null = null;
    let standing: string | null = null;

    if (st) {
      standingLevel = `L${st.tierLevel}`;
      standingGrade = st.tierName;
      standing = st.tierName;
    }

    // Get persona from scenario if available, otherwise fall back to legacy persona field
    const persona = session.scenario?.persona || session.persona;

    return {
      id: session._id.toString(),
      type: formatCallTypeName(session.callType),
      endedAt: session.endedAt,
      durationSeconds,
      productName: session.product?.name || null,
      personaName: persona?.name || null,
      personaOccupation: persona?.occupation || null,
      score: null, // Prudential uses standings instead of scores
      standing,
      standingLevel,
      standingGrade,
      isTooBrief: false,
    };
  });

  return {
    sessions: sessionHistory,
    totalSessions,
  };
}
