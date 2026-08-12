import { SalesSession } from '../../models/SalesSession.js';
import {
  parseFeedbackScores,
  buildSessionFilterWithCompany,
  calculateSessionDurations,
  calculateBasicStatistics,
  buildDateRangeFilter,
  generateRegularProgressData,
  generateRegularProgressDataV2,
  generateRegularPracticeBreakdown,
  getBulkSessionsByUser,
  calculateSessionDuration,
  formatCallTypeName,
  type BulkUserStatisticsResult,
  type SessionHistoryResult,
  calculateOverallAverageScore,
} from './shared.js';

export async function getRegularPracticeSummary(
  companyId?: string,
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

  const finishedPractices = await SalesSession.countDocuments(sessionFilter);

  const sessions = await SalesSession.find(sessionFilter).lean();

  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);

  const { overallAverageScore } = calculateOverallAverageScore(sessions);

  return {
    finishedPractices,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore,
  };
}

export async function getRegularPracticeDetails(
  companyId?: string,
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
    .populate({
      path: 'scenario',
      populate: [{ path: 'module' }],
    })
    .lean();

  return generateRegularPracticeBreakdown(sessions, companyId, languageCode);
}

export async function getRegularProgressData(
  companyId?: string,
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
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const result = generateRegularProgressData(sessions, months);

  // Note: Ensure charts are always displayed in Admin Dashboard even when there are no related Sales Sessions
  if (result.charts.length === 0) {
    const zeroData = result.months.map(() => 0);
    result.charts.push(
      {
        name: 'Sales Technique',
        data: zeroData,
        color: '#1C7AEB',
      },
      {
        name: 'Product Knowledge',
        data: zeroData,
        color: '#FF4B0A',
      },
    );
  }

  return result;
}

export async function getRegularProgressDataV2(
  companyId: string,
  months: number = 6,
  module: string,
  teams?: string[],
) {
  const { startDate, endDate } = buildDateRangeFilter(months);

  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    teams, // Pass teams to filter
    module,
    additionalFilters: {
      endedAt: { $exists: true, $ne: null, $gte: startDate, $lte: endDate },
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const result = await generateRegularProgressDataV2(
    companyId,
    months,
    module,
    sessions,
  );

  // Note: Ensure charts are always displayed in Admin Dashboard even when there are no related Sales Sessions
  if (result.charts.length === 0) {
    const zeroData = result.months.map(() => 0);
    result.charts.push(
      {
        name: 'Sales Technique',
        data: zeroData,
        color: '#1C7AEB',
      },
      {
        name: 'Product Knowledge',
        data: zeroData,
        color: '#FF4B0A',
      },
    );
  }

  return result;
}

export async function getRegularUserStatistics(
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

  const { overallAverageScore } = calculateOverallAverageScore(sessions);

  return {
    totalPractices,
    averageDurationMinutes,
    averageScore: overallAverageScore,
    averageDurationSeconds,
    lastSessionDate,
  };
}

export async function getRegularUserPracticeSummary(
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

  const { overallAverageScore } = calculateOverallAverageScore(sessions);

  return {
    finishedPractices: sessions.length,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore,
  };
}

export async function getRegularUserPracticeBreakdown(
  userId: string,
  companyId: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
  });

  const sessions = await SalesSession.find(sessionFilter)
    .populate('product', 'name friendlyId')
    .populate({
      path: 'scenario',
      populate: [{ path: 'module' }],
    })
    .lean();

  return generateRegularPracticeBreakdown(sessions, companyId, 'en');
}

export async function getRegularUserProgressData(
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
      endedAt: {
        $exists: true,
        $ne: null,
        $gte: startDate,
        $lte: endDate,
      },
    },
  });

  const sessions = await SalesSession.find(sessionFilter)
    .sort({ endedAt: 1 })
    .lean();

  return generateRegularProgressData(sessions, months);
}

/**
 * Bulk version of getRegularUserStatistics to avoid N+1 queries
 */
export async function getBulkRegularUserStatistics(
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

    const { overallAverageScore } = calculateOverallAverageScore(userSessions);

    results[userId] = {
      totalPractices,
      averageDurationMinutes,
      averageScore: overallAverageScore,
      averageDurationSeconds,
      lastSessionDate,
    };
  }

  return results;
}

/**
 * Get session history for a regular (non-Prudential/Manulife/BBL) user
 */
export async function getRegularUserSessionHistory(
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

  // Transform sessions
  const sessionHistory = sessions.map((session: any) => {
    // Use roleplay.duration (actual conversation time) if available,
    // otherwise fall back to calculated session time
    const durationSeconds =
      session.roleplay?.duration ??
      calculateSessionDuration(session.startedAt, session.endedAt);

    const { overallScore } = parseFeedbackScores(session);

    // Get persona from scenario if available, otherwise fall back to legacy persona field
    const persona = session.scenario?.persona || session.persona;

    return {
      id: session._id.toString(),
      type:
        session?.scenario?.module?.title ??
        formatCallTypeName(session.callType),
      endedAt: session.endedAt,
      durationSeconds,
      productName: session.product?.name || null,
      personaName: persona?.name || null,
      personaOccupation: persona?.occupation || null,
      score: overallScore,
      standing: null,
      standingLevel: null,
      standingGrade: null,
      isTooBrief: false,
    };
  });

  return {
    sessions: sessionHistory,
    totalSessions,
  };
}
