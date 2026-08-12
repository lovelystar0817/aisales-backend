import { SalesSession } from '../../models/SalesSession.js';
import { getProductByFriendlyId } from '../product.js';
import {
  buildSessionFilterWithCompany,
  calculateSessionDurations,
  calculateBasicStatistics,
  buildDateRangeFilter,
  generateMonthlyDataPoints,
  parseJsonSafely,
  formatCallTypeName,
  calculateGrade,
  calculateSessionDuration,
  GRADE_COLORS,
  GRADE_LEVELS,
  getBulkSessionsByUser,
  parseFeedbackScores,
  generateRegularProgressData,
  generateRegularProgressDataV2,
  generateRegularPracticeBreakdown,
  normalizeProductFriendlyId,
  type BulkUserStatisticsResult,
  type ProgressDataResult,
  type PracticeBreakdownItem,
  type SessionHistoryResult,
} from './shared.js';
import { parseGrabMexFeedbackScores } from './grab-mex.js';

// ==================== CONFIGURATION ====================

/**
 * Call types to exclude from Grab admin manage portal
 * These sessions will not appear in any dashboards, reports, or user statistics
 */
const GRAB_EXCLUDED_CALL_TYPES = ['getting-gandalf-right'];

/**
 * Returns the session filter for excluding specific call types from Grab reports
 * Using $nin (not in) for flexibility to exclude multiple call types if needed
 */
function getGrabSessionFilter(): Record<string, any> {
  return {
    callType: { $nin: GRAB_EXCLUDED_CALL_TYPES },
  };
}

/**
 * Returns a filter to include sessions that have valid scores
 * This includes both:
 * - Traditional sessions with the top-level `scores` field
 * - Scorecard-based sessions (self-serve scenarios) with `roleplay.feedback.scorecards`
 */
function getHasScoresFilter(): Record<string, any> {
  return {
    $or: [
      { scores: { $exists: true } },
      {
        'roleplay.feedback.scorecards': {
          $exists: true,
          $not: { $size: 0 },
        },
      },
    ],
  };
}

// ==================== FEEDBACK PARSING UTILITIES ====================

/**
 * Parse feedback scores for Grab company sessions
 * Handles both 'regular' and 'grab-mex' assessment types
 */
export function parseGrabFeedbackScores(session: any) {
  const assessmentType = session.assessmentType || 'regular';

  if (assessmentType === 'grab-mex') {
    const scores = parseGrabMexFeedbackScores(session);
    console.log(
      '---parseGrabFeedbackScores grab-mex sessionId:',
      session._id,
      'scores:',
      scores,
    );
    return scores;
  } else {
    // Regular assessment type - use the overallScore already calculated by parseFeedbackScores
    const scores = parseFeedbackScores(session);
    console.log(
      '---parseGrabFeedbackScores regular sessionId:',
      session._id,
      'scores:',
      scores,
    );

    // Return the scores as-is - parseFeedbackScores already calculated the correct overallScore
    return scores;
  }
}

// ==================== SUMMARY FUNCTIONS ====================

export async function getGrabPracticeSummary(
  companyId: string,
  dateFrom?: string,
  dateTo?: string,
  teams?: string[],
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    dateFrom,
    dateTo,
    teams,
    // No assessmentType filter - include both 'regular' and 'grab-mex'
    additionalFilters: {
      ...getGrabSessionFilter(),
      ...getHasScoresFilter(),
    },
  });

  const finishedPractices = await SalesSession.countDocuments(sessionFilter);
  const sessions = await SalesSession.find(sessionFilter).lean();

  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);

  let totalScore = 0;
  let scoreCount = 0;

  for (const session of sessions) {
    const scores = parseGrabFeedbackScores(session);
    console.log(
      '---getGrabPracticeSummary sessionId:',
      session._id,
      'scores:',
      scores,
    );

    if (scores.isValid && scores.overallScore !== null) {
      totalScore += scores.overallScore;
      scoreCount++;
    }
  }

  const overallAverageScore =
    scoreCount > 0 ? Math.round(totalScore / scoreCount) : null;

  console.log(
    '---getGrabPracticeSummary, overallAverageScore:',
    overallAverageScore,
    'scoreCount:',
    scoreCount,
    'totalScore:',
    totalScore,
  );

  return {
    finishedPractices,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore,
  };
}

// ==================== PRACTICE DETAILS FUNCTIONS ====================

export async function getGrabPracticeDetails(
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
    additionalFilters: {
      ...getGrabSessionFilter(),
      ...getHasScoresFilter(),
    },
  });

  const sessions = await SalesSession.find(sessionFilter)
    .populate('product', 'name friendlyId')
    .lean();

  return generateGrabPracticeBreakdown(sessions, companyId, languageCode);
}

/**
 * Generate practice breakdown for Grab company (handles both regular and grab-mex)
 */
export function generateGrabPracticeBreakdown(
  sessions: any[],
  companyId?: string,
  languageCode: string = 'en',
): PracticeBreakdownItem[] {
  const practiceBreakdown: Record<
    string,
    {
      totalPractices: number;
      totalScore: number;
      scoreCount: number;
      productName?: string;
      actualProductFriendlyId?: string; // Track the first actual friendlyId for lookup
      bestScore?: number;
      breakdown: {
        grade: string;
        totalPractices: number;
        totalScore: number;
        scoreCount: number;
      }[];
    }
  > = {};

  for (const session of sessions) {
    const callType = session.callType || 'unknown';
    const rawProductFriendlyId =
      (session.product as any)?.friendlyId || 'no-product';
    const productName = (session.product as any)?.name || 'N/A';

    // Normalize the product friendlyId to remove nanoid suffixes
    const productFriendlyId = normalizeProductFriendlyId(
      rawProductFriendlyId,
      companyId,
    );
    const key = `${callType}::${productFriendlyId}`;

    // Parse scores first to determine if this session should be counted
    const scores = parseGrabFeedbackScores(session);

    // Only process sessions with valid scores
    if (scores.isValid && scores.overallScore !== null) {
      if (!practiceBreakdown[key]) {
        practiceBreakdown[key] = {
          totalPractices: 0,
          totalScore: 0,
          scoreCount: 0,
          productName: productName !== 'N/A' ? productName : undefined,
          actualProductFriendlyId: rawProductFriendlyId, // Store the actual friendlyId
          bestScore: undefined,
          breakdown: ['Excellent', 'Good', 'Fair', 'Poor'].map((grade) => ({
            grade,
            totalPractices: 0,
            totalScore: 0,
            scoreCount: 0,
          })),
        };
      }

      practiceBreakdown[key].totalPractices++;
      practiceBreakdown[key].totalScore += scores.overallScore;
      practiceBreakdown[key].scoreCount++;

      const sessionScore = Math.round(scores.overallScore);

      if (
        !practiceBreakdown[key].bestScore ||
        sessionScore > practiceBreakdown[key].bestScore!
      ) {
        practiceBreakdown[key].bestScore = sessionScore;
      }

      const grade = calculateGrade(sessionScore);

      const gradeData = practiceBreakdown[key].breakdown.find(
        (b) => b.grade === grade,
      );
      if (gradeData) {
        gradeData.totalPractices++;
        gradeData.totalScore += sessionScore;
        gradeData.scoreCount++;
      }
    }
  }

  return Object.entries(practiceBreakdown)
    .map(([key, stats]) => {
      const [callType, productFriendlyId] = key.split('::', 2);

      // Look up the product by friendlyId to get the localized name
      // Use the actual friendlyId from the first session in the group
      let localizedProductName = stats.productName;
      if (
        stats.actualProductFriendlyId &&
        stats.actualProductFriendlyId !== 'no-product' &&
        companyId
      ) {
        try {
          const product = getProductByFriendlyId(
            companyId,
            stats.actualProductFriendlyId,
            languageCode,
          );
          localizedProductName = product.name;
        } catch (error) {
          // If product lookup fails, fall back to the stored name
          // This can happen if the product was deleted or friendlyId changed
        }
      }

      const averageScore =
        stats.scoreCount > 0
          ? Math.round(stats.totalScore / stats.scoreCount)
          : null;

      const breakdown = stats.breakdown
        .map((gradeStats) => {
          const gradeAvgScore =
            gradeStats.scoreCount > 0
              ? Math.round(gradeStats.totalScore / gradeStats.scoreCount)
              : 0;

          const colors =
            GRADE_COLORS[gradeStats.grade as keyof typeof GRADE_COLORS];

          return {
            level: GRADE_LEVELS[gradeStats.grade as keyof typeof GRADE_LEVELS],
            grade: gradeStats.grade,
            totalPractices: gradeStats.totalPractices,
            averageScore: gradeAvgScore,
            backgroundColor: colors.backgroundColor,
            textColor: colors.textColor,
          };
        })
        .sort((a, b) => (a.level || '').localeCompare(b.level || ''));

      const bestScore = stats.bestScore
        ? (() => {
            const grade = calculateGrade(stats.bestScore);
            const colors = GRADE_COLORS[grade as keyof typeof GRADE_COLORS];
            return {
              level: GRADE_LEVELS[grade as keyof typeof GRADE_LEVELS],
              grade,
              score: stats.bestScore,
              backgroundColor: colors.backgroundColor,
              textColor: colors.textColor,
            };
          })()
        : null;

      return {
        type: formatCallTypeName(callType),
        productName: localizedProductName,
        totalPractices: stats.totalPractices,
        averageScore,
        grade: averageScore !== null ? calculateGrade(averageScore) : undefined,
        bestScore,
        breakdown,
      };
    })
    .sort((a, b) => b.totalPractices - a.totalPractices);
}

// ==================== PROGRESS DATA FUNCTIONS ====================

export async function getGrabProgressData(
  companyId: string,
  months: number = 6,
  module?: string,
  teams?: string[],
) {
  const { startDate, endDate } = buildDateRangeFilter(months);

  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    teams,
    module,
    additionalFilters: {
      endedAt: { $exists: true, $ne: null, $gte: startDate, $lte: endDate },
      ...getGrabSessionFilter(),
      ...getHasScoresFilter(),
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const result = generateGrabProgressData(sessions, months, module);

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

/**
 * Generate progress data for Grab company (handles both regular and grab-mex)
 */
export function generateGrabProgressData(
  sessions: any[],
  months: number,
  module?: string,
): ProgressDataResult {
  // Use regular progress data generation which handles both types
  return generateRegularProgressData(sessions, months);
}

// ==================== PROGRESS DATA FUNCTIONS V2 (self-serve) ====================

export async function getGrabProgressDataV2(
  companyId: string,
  months: number = 6,
  module: string,
  teams?: string[],
) {
  const { startDate, endDate } = buildDateRangeFilter(months);

  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    teams,
    module,
    additionalFilters: {
      endedAt: { $exists: true, $ne: null, $gte: startDate, $lte: endDate },
      ...getGrabSessionFilter(),
      ...getHasScoresFilter(),
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const result = await generateGrabProgressDataV2(
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

/**
 * Generate progress data for Grab company (self-serve score-card)
 */
export function generateGrabProgressDataV2(
  companyId: string,
  months: number,
  module: string,
  sessions: any[],
) {
  // Use regular progress data generation which handles both types
  return generateRegularProgressDataV2(companyId, months, module, sessions);
}

// ==================== USER STATISTICS FUNCTIONS ====================

export async function getGrabUserStatistics(
  userId: string,
  companyId: string,
  module?: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
    module,
    additionalFilters: getGrabSessionFilter(),
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const {
    totalPractices,
    averageDurationMinutes,
    averageDurationSeconds,
    lastSessionDate,
  } = calculateBasicStatistics(sessions);

  let totalScore = 0;
  let scoreCount = 0;

  for (const session of sessions) {
    const scores = parseGrabFeedbackScores(session);
    if (scores.isValid && scores.overallScore !== null) {
      totalScore += scores.overallScore;
      scoreCount++;
    }
  }

  const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  return {
    totalPractices,
    averageDurationMinutes,
    averageScore,
    averageDurationSeconds,
    lastSessionDate,
  };
}

export async function getGrabUserPracticeSummary(
  userId: string,
  companyId: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
    additionalFilters: {
      ...getGrabSessionFilter(),
      ...getHasScoresFilter(),
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);

  let totalScore = 0;
  let scoreCount = 0;

  for (const session of sessions) {
    const scores = parseGrabFeedbackScores(session);
    if (scores.isValid && scores.overallScore !== null) {
      totalScore += scores.overallScore;
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

export async function getGrabUserPracticeBreakdown(
  userId: string,
  companyId: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
    additionalFilters: {
      ...getGrabSessionFilter(),
      ...getHasScoresFilter(),
    },
  });

  const sessions = await SalesSession.find(sessionFilter)
    .populate('product', 'name friendlyId')
    .lean();

  return generateGrabPracticeBreakdown(sessions, companyId, 'en');
}

export async function getGrabUserProgressData(
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
      ...getGrabSessionFilter(),
      ...getHasScoresFilter(),
    },
  });

  const sessions = await SalesSession.find(sessionFilter)
    .sort({ endedAt: 1 })
    .lean();

  return generateGrabProgressData(sessions, months, module);
}

// ==================== BULK OPERATIONS ====================

/**
 * Bulk version of getGrabUserStatistics to avoid N+1 queries
 */
export async function getBulkGrabUserStatistics(
  userIds: string[],
  companyId: string,
  module?: string,
  teams?: string[],
): Promise<BulkUserStatisticsResult> {
  if (userIds.length === 0) {
    return {};
  }

  // Use shared helper with Grab-specific session filter
  const sessionsByUser = await getBulkSessionsByUser(
    userIds,
    companyId,
    module,
    teams,
    undefined, // no assessmentType filter
    {
      ...getGrabSessionFilter(),
      ...getHasScoresFilter(),
    },
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
      const scores = parseGrabFeedbackScores(session);
      if (scores.isValid && scores.overallScore !== null) {
        totalScore += scores.overallScore;
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
 * Get session history for a Grab user (handles both regular and grab-mex)
 */
export async function getGrabUserSessionHistory(
  userId: string,
  companyId: string,
  page: number = 1,
  limit: number = 10,
): Promise<SessionHistoryResult> {
  // Build session filter (only completed sessions, no assessmentType filter)
  // Include sessions with either top-level scores OR scorecard-based scores (self-serve scenarios)
  const sessionFilter = {
    user: userId,
    endedAt: { $exists: true, $ne: null },
    $expr: { $gte: [{ $size: '$messages' }, 6] },
    ...getGrabSessionFilter(),
    ...getHasScoresFilter(),
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
      'callType endedAt startedAt roleplay product persona assessmentType scenario',
    )
    .lean();

  // Transform sessions
  const sessionHistory = sessions.map((session: any) => {
    // Use roleplay.duration (actual conversation time) if available,
    // otherwise fall back to calculated session time
    const durationSeconds =
      session.roleplay?.duration ??
      calculateSessionDuration(session.startedAt, session.endedAt);

    // Parse scores based on assessment type
    const scores = parseGrabFeedbackScores(session);
    const score =
      scores.isValid && scores.overallScore !== null
        ? Math.round(scores.overallScore)
        : 0;

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
