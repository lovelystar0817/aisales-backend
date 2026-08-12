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
  type BulkUserStatisticsResult,
  type ProgressDataResult,
  type PracticeBreakdownItem,
  type BreakdownItem,
  type SessionHistoryResult,
} from './shared.js';

// ==================== FEEDBACK PARSING UTILITIES ====================

/**
 * Helper function to parse HSBC feedback scores from session
 * HSBC has relationshipManagement, processAdherence, representation, and communicationAndPresence
 */
export function parseHSBCFeedbackScores(session: any) {
  try {
    const relationshipManagement = session.roleplay?.feedback
      ?.relationshipManagement
      ? parseJsonSafely(session.roleplay.feedback.relationshipManagement)
      : null;
    const processAdherence = session.roleplay?.feedback?.processAdherence
      ? parseJsonSafely(session.roleplay.feedback.processAdherence)
      : null;
    const representation = session.roleplay?.feedback?.representation
      ? parseJsonSafely(session.roleplay.feedback.representation)
      : null;
    const communicationAndPresence = session.roleplay?.feedback
      ?.communicationAndPresence
      ? parseJsonSafely(session.roleplay.feedback.communicationAndPresence)
      : null;

    const relationshipManagementScore =
      relationshipManagement?.overallScore ?? null;
    const processAdherenceScore = processAdherence?.overallScore ?? null;
    const representationScore = representation?.overallScore ?? null;
    const communicationAndPresenceScore =
      communicationAndPresence?.overallScore ?? null;

    // Calculate overall score as average of all 4 scores
    const validScores = [
      relationshipManagementScore,
      processAdherenceScore,
      representationScore,
      communicationAndPresenceScore,
    ].filter((score) => score !== null);

    const overallScore =
      validScores.length > 0
        ? validScores.reduce((sum, score) => sum + score!, 0) /
          validScores.length
        : null;

    return {
      relationshipManagementScore,
      processAdherenceScore,
      representationScore,
      communicationAndPresenceScore,
      overallScore,
      isValid:
        relationshipManagementScore !== null &&
        processAdherenceScore !== null &&
        representationScore !== null &&
        communicationAndPresenceScore !== null,
    };
  } catch (error) {
    console.warn('Failed to parse HSBC feedback scores for session:', {
      sessionId: session._id?.toString() || 'unknown',
      error: error instanceof Error ? error.message : String(error),
      relationshipManagementRaw:
        session.roleplay?.feedback?.relationshipManagement,
      processAdherenceRaw: session.roleplay?.feedback?.processAdherence,
      representationRaw: session.roleplay?.feedback?.representation,
      communicationAndPresenceRaw:
        session.roleplay?.feedback?.communicationAndPresence,
    });

    return {
      relationshipManagementScore: null,
      processAdherenceScore: null,
      representationScore: null,
      communicationAndPresenceScore: null,
      overallScore: null,
      isValid: false,
    };
  }
}

// ==================== SUMMARY FUNCTIONS ====================

export async function getHSBCPracticeSummary(
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
  });

  const finishedPractices = await SalesSession.countDocuments(sessionFilter);
  const sessions = await SalesSession.find(sessionFilter).lean();

  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);

  let totalScore = 0;
  let scoreCount = 0;

  for (const session of sessions) {
    const scores = parseHSBCFeedbackScores(session);
    if (scores.isValid && scores.overallScore !== null) {
      totalScore += scores.overallScore;
      scoreCount++;
    }
  }

  const overallAverageScore =
    scoreCount > 0 ? Math.round(totalScore / scoreCount) : null;

  return {
    finishedPractices,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore,
  };
}

// ==================== PRACTICE DETAILS FUNCTIONS ====================

export async function getHSBCPracticeDetails(
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

  return generateHSBCPracticeBreakdown(sessions, companyId, languageCode);
}

/**
 * Generate practice breakdown for HSBC scoring system
 */
export function generateHSBCPracticeBreakdown(
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
    const productFriendlyId =
      (session.product as any)?.friendlyId || 'no-product';
    const productName = (session.product as any)?.name || 'N/A';
    const key = `${callType}::${productFriendlyId}`;

    if (!practiceBreakdown[key]) {
      practiceBreakdown[key] = {
        totalPractices: 0,
        totalScore: 0,
        scoreCount: 0,
        productName: productName !== 'N/A' ? productName : undefined,
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

    const scores = parseHSBCFeedbackScores(session);
    if (scores.isValid && scores.overallScore !== null) {
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
      let localizedProductName = stats.productName;
      if (
        productFriendlyId &&
        productFriendlyId !== 'no-product' &&
        companyId
      ) {
        try {
          const product = getProductByFriendlyId(
            companyId,
            productFriendlyId,
            languageCode,
          );
          localizedProductName = product.name;
        } catch (error) {
          // If product lookup fails, fall back to the stored name
        }
      }

      const averageScore =
        stats.scoreCount > 0
          ? Math.round((stats.totalScore / stats.scoreCount) * 10) / 10
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

export async function getHSBCProgressData(
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
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  return generateHSBCProgressData(sessions, months, module);
}

/**
 * Generate progress data for HSBC scoring system
 */
export function generateHSBCProgressData(
  sessions: any[],
  months: number,
  module?: string,
): ProgressDataResult {
  const monthlyData: Record<
    string,
    {
      relationshipManagement: number[];
      processAdherence: number[];
      representation: number[];
      communicationAndPresence: number[];
    }
  > = {};

  const monthlyDataPoints = generateMonthlyDataPoints(months);
  for (const dataPoint of monthlyDataPoints) {
    monthlyData[dataPoint.monthLabel] = {
      relationshipManagement: [],
      processAdherence: [],
      representation: [],
      communicationAndPresence: [],
    };
  }

  for (const session of sessions) {
    if (!session.endedAt) continue;

    const sessionDate = new Date(session.endedAt);
    const monthKey = sessionDate.toLocaleDateString('en-US', {
      month: 'short',
    });

    if (!monthlyData[monthKey]) continue;

    const scores = parseHSBCFeedbackScores(session);
    if (scores.relationshipManagementScore !== null) {
      monthlyData[monthKey].relationshipManagement.push(
        scores.relationshipManagementScore,
      );
    }
    if (scores.processAdherenceScore !== null) {
      monthlyData[monthKey].processAdherence.push(scores.processAdherenceScore);
    }
    if (scores.representationScore !== null) {
      monthlyData[monthKey].representation.push(scores.representationScore);
    }
    if (scores.communicationAndPresenceScore !== null) {
      monthlyData[monthKey].communicationAndPresence.push(
        scores.communicationAndPresenceScore,
      );
    }
  }

  const monthLabels = monthlyDataPoints.map((point) => point.monthLabel);
  const relationshipManagementData = monthLabels.map((month) => {
    const scores = monthlyData[month].relationshipManagement;
    return scores.length > 0
      ? Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        )
      : 0;
  });
  const processAdherenceData = monthLabels.map((month) => {
    const scores = monthlyData[month].processAdherence;
    return scores.length > 0
      ? Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        )
      : 0;
  });
  const representationData = monthLabels.map((month) => {
    const scores = monthlyData[month].representation;
    return scores.length > 0
      ? Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        )
      : 0;
  });
  const communicationAndPresenceData = monthLabels.map((month) => {
    const scores = monthlyData[month].communicationAndPresence;
    return scores.length > 0
      ? Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        )
      : 0;
  });

  return {
    months: monthLabels,
    charts: [
      {
        name: 'Relationship Management',
        data: relationshipManagementData,
        color: '#1C7AEB',
      },
      {
        name: 'Process Adherence',
        data: processAdherenceData,
        color: '#058A62',
      },
      {
        name: 'Representation',
        data: representationData,
        color: '#8b5cf6',
      },
      {
        name: 'Communication and Presence',
        data: communicationAndPresenceData,
        color: '#f59e0b',
      },
    ],
  };
}

// ==================== USER STATISTICS FUNCTIONS ====================

export async function getHSBCUserStatistics(
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

  let totalScore = 0;
  let scoreCount = 0;

  for (const session of sessions) {
    const scores = parseHSBCFeedbackScores(session);
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

export async function getHSBCUserPracticeSummary(
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
    const scores = parseHSBCFeedbackScores(session);
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

export async function getHSBCUserPracticeBreakdown(
  userId: string,
  companyId: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
  });

  const sessions = await SalesSession.find(sessionFilter)
    .populate('product', 'name')
    .lean();

  return generateHSBCPracticeBreakdown(sessions);
}

export async function getHSBCUserProgressData(
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

  return generateHSBCProgressData(sessions, months, module);
}

// ==================== BULK OPERATIONS ====================

/**
 * Bulk version of getHSBCUserStatistics to avoid N+1 queries
 */
export async function getBulkHSBCUserStatistics(
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
      const scores = parseHSBCFeedbackScores(session);
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
 * Get session history for an HSBC user
 */
export async function getHSBCUserSessionHistory(
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

    // HSBC uses 4 scores: relationshipManagement, processAdherence, representation, communicationAndPresence
    const hsbcScores = parseHSBCFeedbackScores(session);
    const score =
      hsbcScores.isValid && hsbcScores.overallScore !== null
        ? Math.round(hsbcScores.overallScore)
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
