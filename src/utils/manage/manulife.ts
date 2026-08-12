import { SalesSession } from '../../models/SalesSession.js';
import { parseJsonSafely } from '../json.js';
import {
  calculateManulifeOverallScore,
  getManulifeTierName,
  calculateGoalReadyOverallScore,
  getGoalReadyTierName,
} from '../assessment/manulife.js';
import {
  buildSessionFilterWithCompany,
  buildDateRangeFilter,
  calculateSessionDurations,
  calculateSessionDuration,
  formatCallTypeName,
  generateManulifePracticeBreakdown,
  generateManulifeProgressData,
  type SessionHistoryResult,
  BulkUserStatisticsResult,
  getBulkSessionsByUser,
  calculateBasicStatistics,
} from './shared.js';

/**
 * Helper function to calculate overall score based on assessment type
 * Supports both FNA (manulife) and GoalReady (manulife-goalready)
 */
function calculateSessionScore(session: any): number {
  const assessmentType = session.assessmentType;

  if (assessmentType === 'manulife') {
    // FNA assessment
    const salesTechniques = parseJsonSafely(
      session?.roleplay?.feedback?.salesTechniques,
    );
    const sections = salesTechniques?.sections;
    return calculateManulifeOverallScore(sections);
  } else if (assessmentType === 'manulife-goalready') {
    // GoalReady assessment
    return calculateGoalReadyOverallScore(session);
  }

  return 0;
}

/**
 * Get Manulife standings summary for dashboard
 * Supports both FNA and GoalReady assessment types
 */
export async function getManulifeStandingsSummary(
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
  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);
  const finishedPractices = sessions.length;

  let totalScore = 0;
  let scoreCount = 0;

  for (const session of sessions) {
    const score = calculateSessionScore(session);
    if (score) {
      totalScore += score;
      scoreCount++;
    }
  }
  const overallAverageScore =
    scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  return {
    finishedPractices,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore,
  };
}

/**
 * Get Manulife practice details with same structure but scores as hyphens
 */
export async function getManulifePracticeDetails(
  companyId: string,
  dateFrom?: string,
  dateTo?: string,
  teams?: string[],
  languageCode: string = 'en',
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    dateFrom,
    dateTo,
    teams,
  });

  const sessions = await SalesSession.find(sessionFilter)
    .populate('product', 'name friendlyId')
    .lean();

  return generateManulifePracticeBreakdown(sessions, languageCode, companyId);
}

/**
 * Get Prudential standings progress over time
 */
export async function getManulifeStandingsProgress(
  companyId: string,
  months: number = 6,
  module?: string,
) {
  const { startDate, endDate } = buildDateRangeFilter(months);

  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    module,
    additionalFilters: {
      endedAt: { $exists: true, $ne: null, $gte: startDate, $lte: endDate },
      'roleplay.feedback': { $exists: true },
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const result = generateManulifeProgressData(sessions, months);

  // Note: Ensure charts are always displayed in Admin Dashboard even when there are no related Sales Sessions
  if (result.charts.length === 0) {
    const zeroData = result.months.map(() => 0);

    // Different default charts based on module type
    if (module === 'manulife-goalready') {
      // GoalReady default charts
      result.charts.push(
        {
          name: 'Sales & Negotiation Skills',
          data: zeroData,
          color: '#058A62',
        },
        {
          name: 'Soft Skills',
          data: zeroData,
          color: '#1C7AEB',
        },
        {
          name: 'Product Knowledge',
          data: zeroData,
          color: '#F59E0B',
        },
      );
    } else {
      // Default to FNA charts when no data (for backward compatibility)
      // When GoalReady sessions exist, the appropriate charts will be generated automatically
      result.charts.push(
        {
          name: 'Introduction to Manulife & Facts of Life',
          data: zeroData,
          color: '#058A62',
        },
        {
          name: 'Financial Needs, Goal Guide and Conclusion',
          data: zeroData,
          color: '#1C7AEB',
        },
      );
    }
  }

  return result;
}

export async function getManulifeUserPracticeSummary(
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

  let totalScore = 0;
  let scoreCount = 0;

  for (const session of sessions) {
    const score = calculateSessionScore(session);
    if (score) {
      totalScore += score;
      scoreCount++;
    }
  }
  const overallAverageScore =
    scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  return {
    finishedPractices: sessions.length,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore,
  };
}

export async function getManulifeUserPracticeBreakdown(
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

  return generateManulifePracticeBreakdown(sessions, 'en', companyId);
}

export async function getManulifeUserProgressData(
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

  return generateManulifeProgressData(sessions, months);
}

/**
 * Bulk version of getManulifeUserStatistics to avoid N+1 queries
 * Supports both FNA and GoalReady assessment types
 */
export async function getBulkManulifeUserStatistics(
  userIds: string[],
  companyId: string,
  module?: string,
  teams?: string[],
): Promise<BulkUserStatisticsResult> {
  if (userIds.length === 0) {
    return {};
  }

  // Use shared helper to get sessions grouped by user
  const sessionsByUser = await getBulkSessionsByUser(
    userIds,
    companyId,
    module,
    teams,
  );

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

    let totalScore = 0;
    let scoreCount = 0;

    for (const session of userSessions) {
      const score = calculateSessionScore(session);
      if (score) {
        totalScore += score;
        scoreCount++;
      }
    }

    const averageScore =
      scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    results[userId] = {
      totalPractices,
      averageDurationMinutes,
      averageScore,
      averageDurationSeconds,
      lastSessionDate,
    };
  }

  return results;
}

/**
 * Get session history for a Manulife user with tier/standing info
 */
export async function getManulifeUserSessionHistory(
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
      'callType endedAt startedAt assessmentType roleplay.feedback roleplay.duration product persona scenario',
    )
    .lean();

  // Transform sessions
  const sessionHistory = sessions.map((session: any) => {
    // Use roleplay.duration (actual conversation time) if available,
    // otherwise fall back to calculated session time
    const durationSeconds =
      session.roleplay?.duration ??
      calculateSessionDuration(session.startedAt, session.endedAt);

    const assessmentType = session.assessmentType;

    let score: number | null = null;
    let standingLevel: string | null = null;
    let standingGrade: string | null = null;
    let standing: string | null = null;

    // Calculate score and tier based on assessment type
    score = calculateSessionScore(session);

    if (score > 0) {
      let tierName = '';

      if (assessmentType === 'manulife') {
        // FNA assessment
        const salesTechniques = parseJsonSafely(
          session.roleplay?.feedback?.salesTechniques,
        );
        const sections = salesTechniques?.sections;
        tierName = getManulifeTierName(sections);
      } else if (assessmentType === 'manulife-goalready') {
        // GoalReady assessment
        tierName = getGoalReadyTierName(score);
      }

      const tierMap: any = {
        Failed: { level: 'L1', grade: 'Failed' },
        Pass: { level: 'L2', grade: 'Pass' },
        Champion: { level: 'L3', grade: 'Champion' },
      };

      const tierInfo = tierMap[tierName];
      if (tierInfo) {
        standingLevel = tierInfo.level;
        standingGrade = tierInfo.grade;
        standing = tierName;
      }
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
      score,
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
