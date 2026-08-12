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
  type SessionHistoryResult,
} from './shared.js';

// ==================== FEEDBACK PARSING UTILITIES ====================

/**
 * Helper function to parse AXA PH feedback scores from session
 * AXA PH has two scoring types:
 * - FNA (regular): uses salesTechniques + productKnowledge
 * - Recruitment/Objection Handling: uses axaPhSoftSkills + axaPhKnowledgeSkills
 */
export function parseAxaPhFeedbackScores(session: any) {
  try {
    const assessmentType = session.assessmentType;

    // For recruitment and objection handling, use soft skills + knowledge skills
    if (
      assessmentType === 'axa-ph-recruitment' ||
      assessmentType === 'axa-ph-objection-handling'
    ) {
      const softSkills = session.roleplay?.feedback?.axaPhSoftSkills
        ? parseJsonSafely(session.roleplay.feedback.axaPhSoftSkills)
        : null;

      const knowledgeSkills = session.roleplay?.feedback?.axaPhKnowledgeSkills
        ? parseJsonSafely(session.roleplay.feedback.axaPhKnowledgeSkills)
        : null;

      const softSkillsScore = softSkills?.overallScore ?? null;
      const knowledgeSkillsScore = knowledgeSkills?.overallScore ?? null;

      const validScores = [softSkillsScore, knowledgeSkillsScore].filter(
        (s) => s !== null,
      );
      const overallScore =
        validScores.length > 0
          ? Math.round(
              validScores.reduce((sum, s) => sum + (s as number), 0) /
                validScores.length,
            )
          : null;

      return {
        salesTechniqueScore: null,
        productKnowledgeScore: null,
        softSkillsScore,
        knowledgeSkillsScore,
        overallScore,
        isValid: overallScore !== null,
      };
    }

    // For FNA and other regular assessments, use salesTechniques + productKnowledge
    const salesTechniques = session.roleplay?.feedback?.salesTechniques
      ? parseJsonSafely(session.roleplay.feedback.salesTechniques)
      : null;

    const productKnowledge = session.roleplay?.feedback?.productKnowledge
      ? parseJsonSafely(session.roleplay.feedback.productKnowledge)
      : null;

    const salesTechniqueScore = salesTechniques?.overallScore ?? null;
    const productKnowledgeScore = productKnowledge?.overallScore ?? null;

    const validScores = [salesTechniqueScore, productKnowledgeScore].filter(
      (s) => s !== null,
    );
    const overallScore =
      validScores.length > 0
        ? Math.round(
            validScores.reduce((sum, s) => sum + (s as number), 0) /
              validScores.length,
          )
        : null;

    return {
      salesTechniqueScore,
      productKnowledgeScore,
      softSkillsScore: null,
      knowledgeSkillsScore: null,
      overallScore,
      isValid: overallScore !== null,
    };
  } catch (error) {
    console.warn('Failed to parse AXA PH feedback scores for session:', {
      sessionId: session._id?.toString() || 'unknown',
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      salesTechniqueScore: null,
      productKnowledgeScore: null,
      softSkillsScore: null,
      knowledgeSkillsScore: null,
      overallScore: null,
      isValid: false,
    };
  }
}

// ==================== SUMMARY FUNCTIONS ====================

export async function getAxaPhPracticeSummary(
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
    const scores = parseAxaPhFeedbackScores(session);
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

export async function getAxaPhPracticeDetails(
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

  return generateAxaPhPracticeBreakdown(sessions, companyId, languageCode);
}

/**
 * Generate practice breakdown for AXA PH scoring system
 */
export function generateAxaPhPracticeBreakdown(
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

    const scores = parseAxaPhFeedbackScores(session);
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

export async function getAxaPhProgressData(
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

  return generateAxaPhProgressData(sessions, months, module);
}

/**
 * Generate progress data for AXA PH scoring system
 * Handles both FNA (salesTechnique + productKnowledge) and
 * Recruitment/Objection Handling (softSkills + knowledgeSkills)
 */
export function generateAxaPhProgressData(
  sessions: any[],
  months: number,
  module?: string,
): ProgressDataResult {
  const monthlyData: Record<
    string,
    {
      salesTechnique: number[];
      productKnowledge: number[];
      softSkills: number[];
      knowledgeSkills: number[];
    }
  > = {};

  const monthlyDataPoints = generateMonthlyDataPoints(months);
  for (const dataPoint of monthlyDataPoints) {
    monthlyData[dataPoint.monthLabel] = {
      salesTechnique: [],
      productKnowledge: [],
      softSkills: [],
      knowledgeSkills: [],
    };
  }

  for (const session of sessions) {
    if (!session.endedAt) continue;

    const sessionDate = new Date(session.endedAt);
    const monthKey = sessionDate.toLocaleDateString('en-US', {
      month: 'short',
    });

    if (!monthlyData[monthKey]) continue;

    const scores = parseAxaPhFeedbackScores(session);
    // FNA scores
    if (scores.salesTechniqueScore !== null) {
      monthlyData[monthKey].salesTechnique.push(scores.salesTechniqueScore);
    }
    if (scores.productKnowledgeScore !== null) {
      monthlyData[monthKey].productKnowledge.push(scores.productKnowledgeScore);
    }
    // Recruitment/Objection handling scores
    if (scores.softSkillsScore !== null) {
      monthlyData[monthKey].softSkills.push(scores.softSkillsScore);
    }
    if (scores.knowledgeSkillsScore !== null) {
      monthlyData[monthKey].knowledgeSkills.push(scores.knowledgeSkillsScore);
    }
  }

  const monthLabels = monthlyDataPoints.map((point) => point.monthLabel);

  const salesTechniqueData = monthLabels.map((month) => {
    const scores = monthlyData[month].salesTechnique;
    return scores.length > 0
      ? Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        )
      : 0;
  });

  const productKnowledgeData = monthLabels.map((month) => {
    const scores = monthlyData[month].productKnowledge;
    return scores.length > 0
      ? Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        )
      : 0;
  });

  const softSkillsData = monthLabels.map((month) => {
    const scores = monthlyData[month].softSkills;
    return scores.length > 0
      ? Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        )
      : 0;
  });

  const knowledgeSkillsData = monthLabels.map((month) => {
    const scores = monthlyData[month].knowledgeSkills;
    return scores.length > 0
      ? Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        )
      : 0;
  });

  // Build charts array - only include charts that have data
  const charts = [];

  const hasSalesTechniqueData = salesTechniqueData.some((d) => d > 0);
  const hasProductKnowledgeData = productKnowledgeData.some((d) => d > 0);
  const hasSoftSkillsData = softSkillsData.some((d) => d > 0);
  const hasKnowledgeSkillsData = knowledgeSkillsData.some((d) => d > 0);

  // FNA charts
  if (hasSalesTechniqueData) {
    charts.push({
      name: 'Sales Technique',
      data: salesTechniqueData,
      color: '#1C7AEB',
    });
  }
  if (hasProductKnowledgeData) {
    charts.push({
      name: 'Product Knowledge',
      data: productKnowledgeData,
      color: '#FF4B0A',
    });
  }

  // Recruitment/Objection handling charts
  if (hasSoftSkillsData) {
    charts.push({
      name: 'Soft Skills',
      data: softSkillsData,
      color: '#10B981',
    });
  }
  if (hasKnowledgeSkillsData) {
    charts.push({
      name: 'Knowledge Skills',
      data: knowledgeSkillsData,
      color: '#8B5CF6',
    });
  }

  // If no data at all, show default empty charts
  if (charts.length === 0) {
    charts.push(
      { name: 'Sales Technique', data: salesTechniqueData, color: '#1C7AEB' },
      {
        name: 'Product Knowledge',
        data: productKnowledgeData,
        color: '#FF4B0A',
      },
    );
  }

  return {
    months: monthLabels,
    charts,
  };
}

// ==================== USER STATISTICS FUNCTIONS ====================

export async function getAxaPhUserStatistics(
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
    const scores = parseAxaPhFeedbackScores(session);
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

export async function getAxaPhUserPracticeSummary(
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
    const scores = parseAxaPhFeedbackScores(session);
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

export async function getAxaPhUserPracticeBreakdown(
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

  return generateAxaPhPracticeBreakdown(sessions);
}

export async function getAxaPhUserProgressData(
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

  return generateAxaPhProgressData(sessions, months, module);
}

// ==================== BULK OPERATIONS ====================

/**
 * Bulk version of getAxaPhUserStatistics to avoid N+1 queries
 */
export async function getBulkAxaPhUserStatistics(
  userIds: string[],
  companyId: string,
  module?: string,
  teams?: string[],
): Promise<BulkUserStatisticsResult> {
  if (userIds.length === 0) {
    return {};
  }

  const sessionsByUser = await getBulkSessionsByUser(
    userIds,
    companyId,
    module,
    teams,
  );

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
      const scores = parseAxaPhFeedbackScores(session);
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
 * Get session history for an AXA PH user
 */
export async function getAxaPhUserSessionHistory(
  userId: string,
  companyId: string,
  page: number = 1,
  limit: number = 10,
): Promise<SessionHistoryResult> {
  const sessionFilter = {
    user: userId,
    endedAt: { $exists: true, $ne: null },
    $expr: { $gte: [{ $size: '$messages' }, 6] },
  };

  const totalSessions = await SalesSession.countDocuments(sessionFilter);

  const skip = (page - 1) * limit;

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

  const sessionHistory = sessions.map((session: any) => {
    const durationSeconds =
      session.roleplay?.duration ??
      calculateSessionDuration(session.startedAt, session.endedAt);

    const axaPhScores = parseAxaPhFeedbackScores(session);
    const score =
      axaPhScores.isValid && axaPhScores.overallScore !== null
        ? Math.round(axaPhScores.overallScore)
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
