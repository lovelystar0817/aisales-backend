import { parseJsonSafely } from '../json.js';
import { SalesSession } from '../../models/SalesSession.js';
import { getProductByFriendlyId } from '../product.js';
import {
  buildSessionFilterWithCompany,
  calculateSessionDurations,
  buildDateRangeFilter,
  generateMonthlyDataPoints,
  formatCallTypeName,
  GRADE_COLORS,
  GRADE_LEVELS,
  calculateGrade,
  calculateSessionDuration,
  createGradeBreakdown,
  normalizeProductFriendlyId,
  calculateBasicStatistics,
  getBulkSessionsByUser,
  type SessionHistoryResult,
  type BulkUserStatisticsResult,
} from './shared.js';

// ==================== FEEDBACK PARSING UTILITIES ====================

/**
 * Helper function to parse AIA KO feedback scores from session
 *
 * AIA KO has three assessment types:
 * 1. aia-ko-opening-objection-call: Introduction + Objection Handling + Needs Exploration (total 300 max)
 * 2. aia-ko-product-pitch: Needs Analysis + Product Pitch + Objection Handling (total 100 max)
 * 3. aia-ko-end-to-end-outbound-call: Complete E2E assessment (total 100 max)
 */
export function parseAiaKoFeedbackScores(session: any) {
  try {
    const assessmentType = session.assessmentType;

    if (assessmentType === 'aia-ko-opening-objection-call') {
      // Parse the three components for Opening & Objection Call
      const introduction = session.roleplay?.feedback?.aiaKoIntroduction
        ? parseJsonSafely(session.roleplay.feedback.aiaKoIntroduction)
        : null;

      const objectionHandling = session.roleplay?.feedback
        ?.aiaKoObjectionHandling
        ? parseJsonSafely(session.roleplay.feedback.aiaKoObjectionHandling)
        : null;

      const needsExploration = session.roleplay?.feedback?.aiaKoNeedsExploration
        ? parseJsonSafely(session.roleplay.feedback.aiaKoNeedsExploration)
        : null;

      const introductionScore = introduction?.overallScore ?? null;
      const objectionHandlingScore = objectionHandling?.overallScore ?? null;
      const needsExplorationScore = needsExploration?.overallScore ?? null;

      // Weights matching frontend: Introduction 20%, Objection Handling 50%, Needs Exploration 30%
      const scores = [
        { score: introductionScore, weight: 0.2 },
        { score: objectionHandlingScore, weight: 0.5 },
        { score: needsExplorationScore, weight: 0.3 },
      ];

      const validScores = scores.filter((s) => s.score !== null);

      if (validScores.length === 0) {
        return {
          introductionScore,
          objectionHandlingScore,
          needsExplorationScore,
          overallScore: null,
          isValid: false,
        };
      }

      // Calculate weighted average: (score1/100 * weight1 + score2/100 * weight2 + ...) * 100
      const totalWeight = validScores.reduce((acc, s) => acc + s.weight, 0);
      const weightedSum = validScores.reduce(
        (acc, s) => acc + ((s.score as number) / 100) * s.weight,
        0,
      );
      const weightedAverage = (weightedSum / totalWeight) * 100;
      const averageScore = Math.round(weightedAverage);

      return {
        introductionScore,
        objectionHandlingScore,
        needsExplorationScore,
        overallScore: averageScore,
        isValid: true,
      };
    } else if (assessmentType === 'aia-ko-product-pitch') {
      // Parse the three components for Product Pitch
      const needsAnalysis = session.roleplay?.feedback?.aiaKoNeedsAnalysis
        ? parseJsonSafely(session.roleplay.feedback.aiaKoNeedsAnalysis)
        : null;

      const productPitch = session.roleplay?.feedback?.aiaKoProductPitch
        ? parseJsonSafely(session.roleplay.feedback.aiaKoProductPitch)
        : null;

      const objectionHandling = session.roleplay?.feedback
        ?.aiaKoProductPitchObjectionHandling
        ? parseJsonSafely(
            session.roleplay.feedback.aiaKoProductPitchObjectionHandling,
          )
        : null;

      const needsAnalysisScore = needsAnalysis?.overallScore ?? null;
      const productPitchScore = productPitch?.overallScore ?? null;
      const objectionHandlingScore = objectionHandling?.overallScore ?? null;

      // Weights matching frontend: Needs Analysis 20%, Product Pitch 40%, Objection Handling 40%
      const scores = [
        { score: needsAnalysisScore, weight: 0.2 },
        { score: productPitchScore, weight: 0.4 },
        { score: objectionHandlingScore, weight: 0.4 },
      ];

      const validScores = scores.filter((s) => s.score !== null);

      if (validScores.length === 0) {
        return {
          needsAnalysisScore,
          productPitchScore,
          objectionHandlingScore,
          overallScore: null,
          isValid: false,
        };
      }

      // Calculate weighted average: (score1/100 * weight1 + score2/100 * weight2 + ...) * 100
      const totalWeight = validScores.reduce((acc, s) => acc + s.weight, 0);
      const weightedSum = validScores.reduce(
        (acc, s) => acc + ((s.score as number) / 100) * s.weight,
        0,
      );
      const weightedAverage = (weightedSum / totalWeight) * 100;
      const averageScore = Math.round(weightedAverage);

      return {
        needsAnalysisScore,
        productPitchScore,
        objectionHandlingScore,
        overallScore: averageScore,
        isValid: true,
      };
    } else if (assessmentType === 'aia-ko-end-to-end-outbound-call') {
      // Parse the comprehensive E2E assessment
      const e2eAssessment = session.roleplay?.feedback?.aiaKoE2EAssessment
        ? parseJsonSafely(session.roleplay.feedback.aiaKoE2EAssessment)
        : null;

      const e2eScore = e2eAssessment?.overallScore ?? null;

      if (e2eScore === null) {
        return {
          e2eScore,
          overallScore: null,
          isValid: false,
        };
      }

      const roundedScore = Math.round(e2eScore);

      return {
        e2eScore,
        overallScore: roundedScore,
        isValid: true,
      };
    }

    // Unknown assessment type
    return {
      overallScore: null,
      isValid: false,
    };
  } catch (error) {
    console.warn('Failed to parse AIA KO feedback scores for session:', {
      sessionId: session._id?.toString() || 'unknown',
      assessmentType: session.assessmentType,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      overallScore: null,
      isValid: false,
    };
  }
}

// ==================== DASHBOARD IMPLEMENTATIONS ====================

/**
 * Calculate overall average score using AIA KO parsing
 */
function calculateAiaKoOverallAverageScore(sessions: any[]) {
  let totalScore = 0;
  let sessionCount = 0;

  for (const session of sessions) {
    const { overallScore, isValid } = parseAiaKoFeedbackScores(session);

    if (isValid && overallScore !== null) {
      totalScore += overallScore;
      sessionCount++;
    }
  }

  const overallAverageScore =
    sessionCount > 0 ? Math.round(totalScore / sessionCount) : 0;

  return {
    overallAverageScore,
  };
}

/**
 * Get practice summary for AIA KO
 */
export async function getAiaKoPracticeSummary(
  companyId?: string,
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

  const { overallAverageScore } = calculateAiaKoOverallAverageScore(sessions);

  return {
    finishedPractices,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore,
  };
}

/**
 * Get practice details breakdown for AIA KO
 */
export async function getAiaKoPracticeDetails(
  companyId?: string,
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
    .populate({
      path: 'scenario',
      populate: [{ path: 'module' }],
    })
    .lean();

  return generateAiaKoPracticeBreakdown(sessions, companyId, languageCode);
}

/**
 * Get progress data over time for AIA KO
 */
export async function getAiaKoProgressData(
  companyId?: string,
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

  return generateAiaKoProgressData(sessions, months, module);
}

/**
 * Generate progress data using AIA KO scoring
 * Shows component scores based on module type
 */
function generateAiaKoProgressData(
  sessions: any[],
  months: number,
  module?: string,
) {
  const monthlyDataPoints = generateMonthlyDataPoints(months);
  const monthLabels = monthlyDataPoints.map((point) => point.monthLabel);

  // Determine which sections to show based on module
  let sectionNames: string[] = [];
  let sectionColors: string[] = [];

  if (module === 'aia-ko-opening-objection-call') {
    sectionNames = ['Introduction', 'Objection Handling', 'Needs Exploration'];
    sectionColors = ['#1C7AEB', '#058A62', '#9333EA'];
  } else if (module === 'aia-ko-product-pitch') {
    sectionNames = ['Needs Analysis', 'Product Pitch', 'Objection Handling'];
    sectionColors = ['#1C7AEB', '#058A62', '#9333EA'];
  } else if (module === 'aia-ko-end-to-end-outbound-call') {
    sectionNames = ['E2E Assessment'];
    sectionColors = ['#1C7AEB'];
  } else {
    // Show all assessment types if no module specified
    sectionNames = [
      'Opening & Objection Call',
      'Product Pitch',
      'E2E Outbound Call',
    ];
    sectionColors = ['#1C7AEB', '#058A62', '#9333EA'];
  }

  // Initialize monthly data structure
  const monthlyData: Record<string, Record<string, number[]>> = {};
  for (const dataPoint of monthlyDataPoints) {
    monthlyData[dataPoint.monthLabel] = {};
    sectionNames.forEach((name) => {
      monthlyData[dataPoint.monthLabel][name] = [];
    });
  }

  // Process each session
  for (const session of sessions) {
    if (!session.endedAt) continue;

    const sessionDate = new Date(session.endedAt);
    const monthKey = sessionDate.toLocaleDateString('en-US', {
      month: 'short',
    });

    if (!monthlyData[monthKey]) continue;

    const assessmentType = session.assessmentType;
    const result = parseAiaKoFeedbackScores(session);

    if (!result.isValid) continue;

    // Add scores based on assessment type and module filter
    if (module === 'aia-ko-opening-objection-call') {
      if (assessmentType === 'aia-ko-opening-objection-call') {
        const typedResult = result as {
          introductionScore: number | null;
          objectionHandlingScore: number | null;
          needsExplorationScore: number | null;
        };
        if (typedResult.introductionScore !== null) {
          monthlyData[monthKey]['Introduction'].push(
            typedResult.introductionScore,
          );
        }
        if (typedResult.objectionHandlingScore !== null) {
          monthlyData[monthKey]['Objection Handling'].push(
            typedResult.objectionHandlingScore,
          );
        }
        if (typedResult.needsExplorationScore !== null) {
          monthlyData[monthKey]['Needs Exploration'].push(
            typedResult.needsExplorationScore,
          );
        }
      }
    } else if (module === 'aia-ko-product-pitch') {
      if (assessmentType === 'aia-ko-product-pitch') {
        const typedResult = result as {
          needsAnalysisScore: number | null;
          productPitchScore: number | null;
          objectionHandlingScore: number | null;
        };
        if (typedResult.needsAnalysisScore !== null) {
          monthlyData[monthKey]['Needs Analysis'].push(
            typedResult.needsAnalysisScore,
          );
        }
        if (typedResult.productPitchScore !== null) {
          monthlyData[monthKey]['Product Pitch'].push(
            typedResult.productPitchScore,
          );
        }
        if (typedResult.objectionHandlingScore !== null) {
          monthlyData[monthKey]['Objection Handling'].push(
            typedResult.objectionHandlingScore,
          );
        }
      }
    } else if (module === 'aia-ko-end-to-end-outbound-call') {
      if (
        assessmentType === 'aia-ko-end-to-end-outbound-call' &&
        result.overallScore !== null
      ) {
        monthlyData[monthKey]['E2E Assessment'].push(result.overallScore);
      }
    } else {
      // No module filter - show overall scores by assessment type
      if (result.overallScore !== null) {
        let chartName = 'E2E Outbound Call';
        if (assessmentType === 'aia-ko-opening-objection-call') {
          chartName = 'Opening & Objection Call';
        } else if (assessmentType === 'aia-ko-product-pitch') {
          chartName = 'Product Pitch';
        }
        monthlyData[monthKey][chartName].push(result.overallScore);
      }
    }
  }

  // Generate chart data
  const charts = sectionNames.map((name, index) => {
    const data = monthLabels.map((month) => {
      const scores = monthlyData[month][name] || [];
      return scores.length > 0
        ? Math.round(
            scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
          )
        : 0;
    });

    return {
      name,
      data,
      color: sectionColors[index],
    };
  });

  return {
    months: monthLabels,
    charts,
  };
}

/**
 * Generate practice breakdown for AIA KO sessions
 * Similar to generateRegularPracticeBreakdown but uses parseAiaKoFeedbackScores
 */
function generateAiaKoPracticeBreakdown(
  sessions: any[],
  companyId?: string,
  languageCode: string = 'en',
) {
  const practiceBreakdown: Record<
    string,
    {
      totalPractices: number;
      totalScore: number;
      scoreCount: number;
      productName?: string;
      bestScore?: number;
      actualProductFriendlyId?: string;
      breakdown: {
        grade: string;
        totalPractices: number;
        totalScore: number;
        scoreCount: number;
      }[];
    }
  > = {};

  for (const session of sessions) {
    const callType =
      session?.scenario?.module?.title ?? (session.callType || 'unknown');
    const rawProductFriendlyId =
      (session.product as any)?.friendlyId || 'no-product';
    const productName = (session.product as any)?.name || 'N/A';

    const productFriendlyId = normalizeProductFriendlyId(
      rawProductFriendlyId,
      companyId,
    );
    const key = `${callType}::${productFriendlyId}`;

    if (!practiceBreakdown[key]) {
      practiceBreakdown[key] = {
        totalPractices: 0,
        totalScore: 0,
        scoreCount: 0,
        productName: productName !== 'N/A' ? productName : undefined,
        actualProductFriendlyId: rawProductFriendlyId,
        bestScore: undefined,
        breakdown: createGradeBreakdown().map((item) => ({
          grade: item.grade,
          totalPractices: 0,
          totalScore: 0,
          scoreCount: 0,
        })),
      };
    }

    practiceBreakdown[key].totalPractices++;

    // Use AIA KO feedback parsing
    const { overallScore, isValid } = parseAiaKoFeedbackScores(session);

    if (isValid && overallScore !== null) {
      practiceBreakdown[key].totalScore += overallScore;
      practiceBreakdown[key].scoreCount++;

      if (
        !practiceBreakdown[key].bestScore ||
        overallScore > practiceBreakdown[key].bestScore
      ) {
        practiceBreakdown[key].bestScore = overallScore;
      }

      const grade = calculateGrade(overallScore);

      const gradeData = practiceBreakdown[key].breakdown.find(
        (b) => b.grade === grade,
      );
      if (gradeData) {
        gradeData.totalPractices++;
        gradeData.totalScore += overallScore;
        gradeData.scoreCount++;
      }
    }
  }

  return Object.entries(practiceBreakdown)
    .map(([key, stats]) => {
      const [callType, productFriendlyId] = key.split('::', 2);

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
          // Fall back to stored name
        }
      }

      const averageScore =
        stats.scoreCount > 0
          ? Math.round(stats.totalScore / stats.scoreCount)
          : 0;

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
        bestScore,
        breakdown,
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return (a.productName || '').localeCompare(b.productName || '');
    });
}

// ==================== USER-SPECIFIC ENDPOINTS ====================

/**
 * Get practice summary for a specific user (AIA KO)
 */
export async function getAiaKoUserPracticeSummary(
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

  const { overallAverageScore } = calculateAiaKoOverallAverageScore(sessions);

  return {
    finishedPractices: sessions.length,
    averageDurationMinutes,
    averageDurationSeconds,
    overallAverageScore,
  };
}

/**
 * Get practice breakdown by type for a specific user (AIA KO)
 */
export async function getAiaKoUserPracticeBreakdown(
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

  return generateAiaKoPracticeBreakdown(sessions, companyId, 'en');
}

/**
 * Get paginated session history for a specific user (AIA KO)
 */
export async function getAiaKoUserSessionHistory(
  userId: string,
  companyId: string,
  page: number = 1,
  limit: number = 10,
): Promise<SessionHistoryResult> {
  // Build session filter (only completed sessions)
  const { sessionFilter: baseFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
  });

  const sessionFilter = {
    ...baseFilter,
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
      'callType endedAt startedAt roleplay.feedback roleplay.duration product persona scenario assessmentType',
    )
    .lean();

  // Transform sessions using AIA KO feedback parsing
  const sessionHistory = sessions.map((session: any) => {
    // Use roleplay.duration (actual conversation time) if available,
    // otherwise fall back to calculated session time
    const durationSeconds =
      session.roleplay?.duration ??
      calculateSessionDuration(session.startedAt, session.endedAt);

    const { overallScore } = parseAiaKoFeedbackScores(session);

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

/**
 * Get progress data over time for a specific user (AIA KO)
 */
export async function getAiaKoUserProgressData(
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

  return generateAiaKoProgressData(sessions, months, module);
}

/**
 * Bulk version of user statistics for AIA KO
 * Returns a map of userId -> statistics for efficient lookups
 */
export async function getBulkAiaKoUserStatistics(
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

    // Use AIA KO-specific score calculation
    const { overallAverageScore } =
      calculateAiaKoOverallAverageScore(userSessions);

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
