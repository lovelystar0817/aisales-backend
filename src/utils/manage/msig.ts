import { SalesSession } from '../../models/SalesSession.js';
import { getProductByFriendlyId } from '../product.js';
import {
  buildSessionFilterWithCompany,
  calculateSessionDurations,
  calculateBasicStatistics,
  buildDateRangeFilter,
  calculateSessionDuration,
  type BulkUserStatisticsResult,
  type SessionHistoryResult,
  formatCallTypeName,
  createMSIGStandingBreakdown,
  MSIG_STANDING_COLORS,
  type PracticeBreakdownItem,
} from './shared.js';
import {
  calculateMSIGOverallScore,
  getMSIGTierName,
  hasFailedMandatory,
  isMsigDataIncomplete,
} from '../assessment/msig.js';

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse MSIG sections from a session and calculate tier info
 */
export function parseMSIGSessionTier(session: any): {
  tierLevel: number;
  tierName: string;
  overallScore: number;
  isValid: boolean;
} {
  try {
    const assessmentType = session.assessmentType;

    // Handle MSIG Telesales (msig)
    if (assessmentType === 'msig') {
      const salesTechniques = session.roleplay?.feedback?.salesTechniques
        ? JSON.parse(String(session.roleplay.feedback.salesTechniques))
        : null;

      if (!salesTechniques?.sections) {
        return {
          tierLevel: 0,
          tierName: 'Not available',
          overallScore: 0,
          isValid: false,
        };
      }

      // Use stored overallScore if available, otherwise calculate it
      const overallScore =
        salesTechniques.overallScore ??
        calculateMSIGOverallScore(salesTechniques.sections);
      const tierName = getMSIGTierName(salesTechniques.sections);
      const hasMandatoryFailures = hasFailedMandatory(salesTechniques.sections);
      const isDataIncomplete = isMsigDataIncomplete(salesTechniques.sections);

      // Map tier name to tier level
      let tierLevel = 0;
      if (!hasMandatoryFailures && !isDataIncomplete) {
        if (tierName === 'Sales Novice') {
          tierLevel = 1;
        } else if (tierName === 'Emerging Seller') {
          tierLevel = 2;
        } else if (tierName === 'Skilled Advisor') {
          tierLevel = 3;
        } else if (tierName === 'Strategic Consultant') {
          tierLevel = 4;
        }
      }

      return {
        tierLevel,
        tierName,
        overallScore,
        isValid: tierLevel > 0,
      };
    }

    // Handle MSIG Product Positioning (msig-3f)
    if (assessmentType === 'msig-3f') {
      const salesTechniques = session.roleplay?.feedback?.salesTechniques
        ? JSON.parse(String(session.roleplay.feedback.salesTechniques))
        : null;
      const productKnowledge = session.roleplay?.feedback?.productKnowledge
        ? JSON.parse(String(session.roleplay.feedback.productKnowledge))
        : null;

      const salesTechScore = salesTechniques?.overallScore || 0;
      const productKnowledgeScore = productKnowledge?.overallScore || 0;

      // Check if scores are valid
      if (salesTechScore === 0 && productKnowledgeScore === 0) {
        return {
          tierLevel: 0,
          tierName: 'Not available',
          overallScore: 0,
          isValid: false,
        };
      }

      // Calculate combined score (equal weight)
      const overallScore = Math.round(
        (salesTechScore + productKnowledgeScore) / 2,
      );

      // Map score to tier level (based on MSIGProductPositioningSessionCard.tsx)
      let tierLevel = 0;
      let tierName = 'Not available';
      if (overallScore >= 80) {
        tierLevel = 4;
        tierName = 'Strategic Consultant';
      } else if (overallScore >= 60) {
        tierLevel = 3;
        tierName = 'Skilled Advisor';
      } else if (overallScore >= 40) {
        tierLevel = 2;
        tierName = 'Emerging Seller';
      } else if (overallScore >= 0) {
        tierLevel = 1;
        tierName = 'Sales Novice';
      }

      return {
        tierLevel,
        tierName,
        overallScore,
        isValid: tierLevel > 0,
      };
    }

    // Handle MSIG TravelEasy (msig-travel-easy)
    if (assessmentType === 'msig-travel-easy') {
      const softSkills = session.roleplay?.feedback?.msigTravelEasySoftSkills
        ? JSON.parse(String(session.roleplay.feedback.msigTravelEasySoftSkills))
        : null;
      const knowledgeSkills = session.roleplay?.feedback
        ?.msigTravelEasyKnowledgeSkills
        ? JSON.parse(
            String(session.roleplay.feedback.msigTravelEasyKnowledgeSkills),
          )
        : null;
      const productKnowledge = session.roleplay?.feedback
        ?.msigTravelEasyProductKnowledge
        ? JSON.parse(
            String(session.roleplay.feedback.msigTravelEasyProductKnowledge),
          )
        : null;

      const softSkillsScore = softSkills?.overallScore || 0;
      const knowledgeSkillsScore = knowledgeSkills?.overallScore || 0;
      const productKnowledgeScore = productKnowledge?.overallScore || 0;

      // Check if scores are valid
      if (
        softSkillsScore === 0 &&
        knowledgeSkillsScore === 0 &&
        productKnowledgeScore === 0
      ) {
        return {
          tierLevel: 0,
          tierName: 'Not available',
          overallScore: 0,
          isValid: false,
        };
      }

      // Calculate combined score (out of 100: 30 + 30 + 40)
      const overallScore =
        softSkillsScore + knowledgeSkillsScore + productKnowledgeScore;

      // Map score to tier level (TravelEasy uses 95/90/85 thresholds)
      let tierLevel = 0;
      let tierName = 'Not available';
      if (overallScore >= 95) {
        tierLevel = 4;
        tierName = 'Strategic Consultant';
      } else if (overallScore >= 90) {
        tierLevel = 3;
        tierName = 'Skilled Advisor';
      } else if (overallScore >= 85) {
        tierLevel = 2;
        tierName = 'Emerging Seller';
      } else if (overallScore >= 0) {
        tierLevel = 1;
        tierName = 'Sales Novice';
      }

      return {
        tierLevel,
        tierName,
        overallScore,
        isValid: tierLevel > 0,
      };
    }

    return {
      tierLevel: 0,
      tierName: 'Not available',
      overallScore: 0,
      isValid: false,
    };
  } catch (error) {
    console.warn('Failed to parse MSIG session tier:', {
      sessionId: session._id?.toString() || 'unknown',
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      tierLevel: 0,
      tierName: 'Not available',
      overallScore: 0,
      isValid: false,
    };
  }
}

// ==================== MAIN FUNCTIONS ====================

/**
 * Get practice summary for MSIG company
 */
export async function getMSIGPracticeSummary(
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
    additionalFilters: {
      assessmentType: { $in: ['msig', 'msig-3f', 'msig-travel-easy'] },
    },
  });

  const finishedPractices = await SalesSession.countDocuments(sessionFilter);
  const sessions = await SalesSession.find(sessionFilter).lean();

  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);

  // Calculate average score from actual session scores
  let totalScore = 0;
  let scoreCount = 0;

  for (const session of sessions) {
    const tierInfo = parseMSIGSessionTier(session);
    if (tierInfo.isValid && tierInfo.overallScore > 0) {
      totalScore += tierInfo.overallScore;
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
 * Get practice details for MSIG company - grouped by call type and product
 * Following Prudential's structure but with score-based badges
 */
export async function getMSIGPracticeDetails(
  companyId?: string,
  dateFrom?: string,
  dateTo?: string,
  teams?: string[],
  languageCode: string = 'en',
): Promise<PracticeBreakdownItem[]> {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    dateFrom,
    dateTo,
    teams,
    additionalFilters: {
      assessmentType: { $in: ['msig', 'msig-3f', 'msig-travel-easy'] },
    },
  });

  const sessions = await SalesSession.find(sessionFilter)
    .populate('product', 'name friendlyId')
    .lean();

  return generateMSIGPracticeBreakdown(sessions, companyId, languageCode);
}

/**
 * Get progress data for MSIG company - handles multiple assessment types dynamically
 */
export async function getMSIGProgressData(
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
      assessmentType: { $in: ['msig', 'msig-3f', 'msig-travel-easy'] },
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  // Track which assessment types are present
  const assessmentTypesPresent = new Set<string>();

  // Track which scorecard types are present in the data
  type ScorecardType =
    | 'salesTechnique'
    | 'productKnowledge'
    | 'softSkills'
    | 'knowledgeSkills'
    | 'travelEasyProductKnowledge';

  // Initialize monthly data for each scorecard type
  const monthlyData: Record<
    string,
    Record<ScorecardType, { scores: number[]; count: number }>
  > = {};

  for (const session of sessions) {
    if (!session.endedAt) continue;

    const monthKey = new Date(session.endedAt).toISOString().slice(0, 7);

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        salesTechnique: { scores: [], count: 0 },
        productKnowledge: { scores: [], count: 0 },
        softSkills: { scores: [], count: 0 },
        knowledgeSkills: { scores: [], count: 0 },
        travelEasyProductKnowledge: { scores: [], count: 0 },
      };
    }

    const assessmentType = session.assessmentType;
    assessmentTypesPresent.add(assessmentType);

    // Extract scores based on assessment type
    if (assessmentType === 'msig') {
      // Telesales: Only sales technique
      const salesTechniques = session.roleplay?.feedback?.salesTechniques
        ? JSON.parse(String(session.roleplay.feedback.salesTechniques))
        : null;
      const score = salesTechniques?.overallScore || 0;
      // Include score even if 0 to ensure chart is shown
      monthlyData[monthKey].salesTechnique.scores.push(score);
      monthlyData[monthKey].salesTechnique.count++;
    } else if (assessmentType === 'msig-3f') {
      // Product Positioning: Sales technique + Product knowledge
      const salesTechniques = session.roleplay?.feedback?.salesTechniques
        ? JSON.parse(String(session.roleplay.feedback.salesTechniques))
        : null;
      const productKnowledge = session.roleplay?.feedback?.productKnowledge
        ? JSON.parse(String(session.roleplay.feedback.productKnowledge))
        : null;

      const salesScore = salesTechniques?.overallScore || 0;
      const productScore = productKnowledge?.overallScore || 0;

      // Include scores even if 0 to ensure both charts are shown
      monthlyData[monthKey].salesTechnique.scores.push(salesScore);
      monthlyData[monthKey].salesTechnique.count++;
      monthlyData[monthKey].productKnowledge.scores.push(productScore);
      monthlyData[monthKey].productKnowledge.count++;
    } else if (assessmentType === 'msig-travel-easy') {
      // TravelEasy: Soft skills + Knowledge skills + Product knowledge
      const softSkills = session.roleplay?.feedback?.msigTravelEasySoftSkills
        ? JSON.parse(String(session.roleplay.feedback.msigTravelEasySoftSkills))
        : null;
      const knowledgeSkills = session.roleplay?.feedback
        ?.msigTravelEasyKnowledgeSkills
        ? JSON.parse(
            String(session.roleplay.feedback.msigTravelEasyKnowledgeSkills),
          )
        : null;
      const productKnowledge = session.roleplay?.feedback
        ?.msigTravelEasyProductKnowledge
        ? JSON.parse(
            String(session.roleplay.feedback.msigTravelEasyProductKnowledge),
          )
        : null;

      const softScore = softSkills?.overallScore || 0;
      const knowledgeScore = knowledgeSkills?.overallScore || 0;
      const productScore = productKnowledge?.overallScore || 0;

      // Include scores even if 0 to ensure all three charts are shown
      monthlyData[monthKey].softSkills.scores.push(softScore);
      monthlyData[monthKey].softSkills.count++;
      monthlyData[monthKey].knowledgeSkills.scores.push(knowledgeScore);
      monthlyData[monthKey].knowledgeSkills.count++;
      monthlyData[monthKey].travelEasyProductKnowledge.scores.push(productScore);
      monthlyData[monthKey].travelEasyProductKnowledge.count++;
    }
  }

  // Generate month labels
  const monthLabels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    monthLabels.push(monthKey);
  }

  // Determine which scorecards have data
  const scorecardData: Array<{
    type: ScorecardType;
    name: string;
    color: string;
    data: number[];
  }> = [];

  const scorecardConfigs = [
    {
      type: 'salesTechnique' as ScorecardType,
      name: 'Sales Technique',
      color: '#1C7AEB',
    },
    {
      type: 'productKnowledge' as ScorecardType,
      name: 'Product Knowledge',
      color: '#FF4B0A',
    },
    {
      type: 'softSkills' as ScorecardType,
      name: 'Soft Skills',
      color: '#1C7AEB',
    },
    {
      type: 'knowledgeSkills' as ScorecardType,
      name: 'Knowledge Skills',
      color: '#FF4B0A',
    },
    {
      type: 'travelEasyProductKnowledge' as ScorecardType,
      name: 'Product Knowledge',
      color: '#058A62',
    },
  ];

  // Determine which scorecards to show based on assessment types present
  const shouldIncludeScorecard = (type: ScorecardType): boolean => {
    if (type === 'salesTechnique') {
      // Show for msig, msig-3f
      return (
        assessmentTypesPresent.has('msig') ||
        assessmentTypesPresent.has('msig-3f')
      );
    }
    if (type === 'productKnowledge') {
      // Show for msig-3f only (not msig-travel-easy)
      return assessmentTypesPresent.has('msig-3f');
    }
    if (
      type === 'softSkills' ||
      type === 'knowledgeSkills' ||
      type === 'travelEasyProductKnowledge'
    ) {
      // Show for msig-travel-easy
      return assessmentTypesPresent.has('msig-travel-easy');
    }
    return false;
  };

  for (const config of scorecardConfigs) {
    if (!shouldIncludeScorecard(config.type)) {
      continue;
    }

    const monthlyScores = monthLabels.map((monthKey) => {
      const data = monthlyData[monthKey]?.[config.type];
      return data && data.count > 0
        ? Math.round(
            data.scores.reduce((a, b) => a + b, 0) / data.count,
          )
        : 0;
    });

    scorecardData.push({
      type: config.type,
      name: config.name,
      color: config.color,
      data: monthlyScores,
    });
  }

  // If no assessment types present, return default charts
  if (assessmentTypesPresent.size === 0) {
    const zeroData = monthLabels.map(() => 0);
    return {
      months: monthLabels,
      charts: [
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
      ],
    };
  }

  return {
    months: monthLabels,
    charts: scorecardData.map((scorecard) => ({
      name: scorecard.name,
      data: scorecard.data,
      color: scorecard.color,
    })),
  };
}

/**
 * Get user statistics for MSIG company
 */
export async function getMSIGUserStatistics(
  userId: string,
  companyId: string,
  module?: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
    module,
    additionalFilters: {
      assessmentType: { $in: ['msig', 'msig-3f', 'msig-travel-easy'] },
    },
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
    const tierInfo = parseMSIGSessionTier(session);
    if (tierInfo.isValid && tierInfo.overallScore > 0) {
      totalScore += tierInfo.overallScore;
      scoreCount++;
    }
  }

  const overallAverageScore =
    scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  return {
    totalPractices,
    overallAverageScore,
    averageDurationMinutes,
    averageDurationSeconds,
    lastSessionDate,
  };
}

/**
 * Get user practice summary for MSIG company
 */
export async function getMSIGUserPracticeSummary(
  userId: string,
  companyId: string,
) {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
    additionalFilters: {
      assessmentType: { $in: ['msig', 'msig-3f', 'msig-travel-easy'] },
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);

  let totalScore = 0;
  let scoreCount = 0;

  for (const session of sessions) {
    const tierInfo = parseMSIGSessionTier(session);
    if (tierInfo.isValid && tierInfo.overallScore > 0) {
      totalScore += tierInfo.overallScore;
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

/**
 * Get user practice breakdown for MSIG company
 */
export async function getMSIGUserPracticeBreakdown(
  userId: string,
  companyId: string,
): Promise<PracticeBreakdownItem[]> {
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    userId,
    additionalFilters: {
      assessmentType: { $in: ['msig', 'msig-3f', 'msig-travel-easy'] },
    },
  });

  const sessions = await SalesSession.find(sessionFilter)
    .populate('product', 'name')
    .lean();

  return generateMSIGPracticeBreakdown(sessions);
}

/**
 * Get user progress data for MSIG company - handles multiple assessment types dynamically
 */
export async function getMSIGUserProgressData(
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
      assessmentType: { $in: ['msig', 'msig-3f', 'msig-travel-easy'] },
    },
  });

  const sessions = await SalesSession.find(sessionFilter)
    .sort({ endedAt: 1 })
    .lean();

  // Track which assessment types are present
  const assessmentTypesPresent = new Set<string>();

  // Track which scorecard types are present in the data
  type ScorecardType =
    | 'salesTechnique'
    | 'productKnowledge'
    | 'softSkills'
    | 'knowledgeSkills'
    | 'travelEasyProductKnowledge';

  // Initialize monthly data for each scorecard type
  const monthlyData: Record<
    string,
    Record<ScorecardType, { scores: number[]; count: number }>
  > = {};

  for (const session of sessions) {
    if (!session.endedAt) continue;

    const monthKey = new Date(session.endedAt).toISOString().slice(0, 7);

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        salesTechnique: { scores: [], count: 0 },
        productKnowledge: { scores: [], count: 0 },
        softSkills: { scores: [], count: 0 },
        knowledgeSkills: { scores: [], count: 0 },
        travelEasyProductKnowledge: { scores: [], count: 0 },
      };
    }

    const assessmentType = session.assessmentType;
    assessmentTypesPresent.add(assessmentType);

    // Extract scores based on assessment type
    if (assessmentType === 'msig') {
      // Telesales: Only sales technique
      const salesTechniques = session.roleplay?.feedback?.salesTechniques
        ? JSON.parse(String(session.roleplay.feedback.salesTechniques))
        : null;
      const score = salesTechniques?.overallScore || 0;
      // Include score even if 0 to ensure chart is shown
      monthlyData[monthKey].salesTechnique.scores.push(score);
      monthlyData[monthKey].salesTechnique.count++;
    } else if (assessmentType === 'msig-3f') {
      // Product Positioning: Sales technique + Product knowledge
      const salesTechniques = session.roleplay?.feedback?.salesTechniques
        ? JSON.parse(String(session.roleplay.feedback.salesTechniques))
        : null;
      const productKnowledge = session.roleplay?.feedback?.productKnowledge
        ? JSON.parse(String(session.roleplay.feedback.productKnowledge))
        : null;

      const salesScore = salesTechniques?.overallScore || 0;
      const productScore = productKnowledge?.overallScore || 0;

      // Include scores even if 0 to ensure both charts are shown
      monthlyData[monthKey].salesTechnique.scores.push(salesScore);
      monthlyData[monthKey].salesTechnique.count++;
      monthlyData[monthKey].productKnowledge.scores.push(productScore);
      monthlyData[monthKey].productKnowledge.count++;
    } else if (assessmentType === 'msig-travel-easy') {
      // TravelEasy: Soft skills + Knowledge skills + Product knowledge
      const softSkills = session.roleplay?.feedback?.msigTravelEasySoftSkills
        ? JSON.parse(String(session.roleplay.feedback.msigTravelEasySoftSkills))
        : null;
      const knowledgeSkills = session.roleplay?.feedback
        ?.msigTravelEasyKnowledgeSkills
        ? JSON.parse(
            String(session.roleplay.feedback.msigTravelEasyKnowledgeSkills),
          )
        : null;
      const productKnowledge = session.roleplay?.feedback
        ?.msigTravelEasyProductKnowledge
        ? JSON.parse(
            String(session.roleplay.feedback.msigTravelEasyProductKnowledge),
          )
        : null;

      const softScore = softSkills?.overallScore || 0;
      const knowledgeScore = knowledgeSkills?.overallScore || 0;
      const productScore = productKnowledge?.overallScore || 0;

      // Include scores even if 0 to ensure all three charts are shown
      monthlyData[monthKey].softSkills.scores.push(softScore);
      monthlyData[monthKey].softSkills.count++;
      monthlyData[monthKey].knowledgeSkills.scores.push(knowledgeScore);
      monthlyData[monthKey].knowledgeSkills.count++;
      monthlyData[monthKey].travelEasyProductKnowledge.scores.push(productScore);
      monthlyData[monthKey].travelEasyProductKnowledge.count++;
    }
  }

  // Generate month labels
  const monthLabels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    monthLabels.push(monthKey);
  }

  // Determine which scorecards have data
  const scorecardData: Array<{
    type: ScorecardType;
    name: string;
    color: string;
    data: number[];
  }> = [];

  const scorecardConfigs = [
    {
      type: 'salesTechnique' as ScorecardType,
      name: 'Sales Technique',
      color: '#1C7AEB',
    },
    {
      type: 'productKnowledge' as ScorecardType,
      name: 'Product Knowledge',
      color: '#FF4B0A',
    },
    {
      type: 'softSkills' as ScorecardType,
      name: 'Soft Skills',
      color: '#1C7AEB',
    },
    {
      type: 'knowledgeSkills' as ScorecardType,
      name: 'Knowledge Skills',
      color: '#FF4B0A',
    },
    {
      type: 'travelEasyProductKnowledge' as ScorecardType,
      name: 'Product Knowledge',
      color: '#058A62',
    },
  ];

  // Determine which scorecards to show based on assessment types present
  const shouldIncludeScorecard = (type: ScorecardType): boolean => {
    if (type === 'salesTechnique') {
      // Show for msig, msig-3f
      return (
        assessmentTypesPresent.has('msig') ||
        assessmentTypesPresent.has('msig-3f')
      );
    }
    if (type === 'productKnowledge') {
      // Show for msig-3f only (not msig-travel-easy)
      return assessmentTypesPresent.has('msig-3f');
    }
    if (
      type === 'softSkills' ||
      type === 'knowledgeSkills' ||
      type === 'travelEasyProductKnowledge'
    ) {
      // Show for msig-travel-easy
      return assessmentTypesPresent.has('msig-travel-easy');
    }
    return false;
  };

  for (const config of scorecardConfigs) {
    if (!shouldIncludeScorecard(config.type)) {
      continue;
    }

    const monthlyScores = monthLabels.map((monthKey) => {
      const data = monthlyData[monthKey]?.[config.type];
      return data && data.count > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count)
        : 0;
    });

    scorecardData.push({
      type: config.type,
      name: config.name,
      color: config.color,
      data: monthlyScores,
    });
  }

  // If no assessment types present, return default charts
  if (assessmentTypesPresent.size === 0) {
    const zeroData = monthLabels.map(() => 0);
    return {
      months: monthLabels,
      charts: [
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
      ],
    };
  }

  return {
    months: monthLabels,
    charts: scorecardData.map((scorecard) => ({
      name: scorecard.name,
      data: scorecard.data,
      color: scorecard.color,
    })),
  };
}

/**
 * Bulk version of getMSIGUserStatistics to avoid N+1 queries
 */
export async function getBulkMSIGUserStatistics(
  userIds: string[],
  companyId: string,
  module?: string,
): Promise<BulkUserStatisticsResult> {
  if (userIds.length === 0) {
    return {};
  }

  // Get sessions filtered by assessment type
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    module,
    additionalFilters: {
      user: { $in: userIds },
      assessmentType: { $in: ['msig', 'msig-3f', 'msig-travel-easy'] },
    },
  });

  const sessions = await SalesSession.find(sessionFilter).lean();

  // Group sessions by user
  const sessionsByUser: Record<string, any[]> = {};
  userIds.forEach((userId) => {
    sessionsByUser[userId] = [];
  });

  sessions.forEach((session: any) => {
    const userId = session.user.toString();
    if (sessionsByUser[userId]) {
      sessionsByUser[userId].push(session);
    }
  });

  const result: BulkUserStatisticsResult = {};

  for (const [userId, sessions] of Object.entries(sessionsByUser)) {
    const {
      totalPractices,
      averageDurationMinutes,
      averageDurationSeconds,
      lastSessionDate,
    } = calculateBasicStatistics(sessions);

    let totalScore = 0;
    let scoreCount = 0;

    for (const session of sessions) {
      const tierInfo = parseMSIGSessionTier(session);
      if (tierInfo.isValid && tierInfo.overallScore > 0) {
        totalScore += tierInfo.overallScore;
        scoreCount++;
      }
    }

    const overallAverageScore =
      scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    result[userId] = {
      totalPractices,
      averageScore: overallAverageScore,
      averageDurationMinutes,
      averageDurationSeconds,
      lastSessionDate,
    };
  }

  return result;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get paginated session history for MSIG users
 * Shows tier information calculated on-the-fly for each session
 */
export async function getMSIGUserSessionHistory(
  userId: string,
  companyId: string,
  page: number = 1,
  limit: number = 10,
): Promise<SessionHistoryResult> {
  // Build session filter (only completed sessions with MSIG assessment types)
  const sessionFilter = {
    user: userId,
    endedAt: { $exists: true, $ne: null },
    $expr: { $gte: [{ $size: '$messages' }, 6] },
    assessmentType: { $in: ['msig', 'msig-3f', 'msig-travel-easy'] },
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
      'callType endedAt startedAt roleplay.feedback roleplay.duration product persona assessmentType scenario',
    )
    .lean();

  // Transform sessions with MSIG tier information
  const sessionHistory = sessions.map((session: any) => {
    // Use roleplay.duration (actual conversation time) if available,
    // otherwise fall back to calculated session time
    const durationSeconds =
      session.roleplay?.duration ??
      calculateSessionDuration(session.startedAt, session.endedAt);

    const tierInfo = parseMSIGSessionTier(session);

    // Format standing information
    const standing = tierInfo.isValid ? tierInfo.tierName : null;
    const standingLevel = tierInfo.isValid ? `L${tierInfo.tierLevel}` : null;
    const standingGrade = tierInfo.isValid ? tierInfo.tierName : null;

    // Get persona from scenario if available, otherwise fall back to legacy persona field
    const persona = session.scenario?.persona || session.persona;

    // Only show score if tier is valid
    const score = tierInfo.isValid ? tierInfo.overallScore : null;

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
      isTooBrief: false, // MSIG sessions are validated to have minimum messages
    };
  });

  return {
    sessions: sessionHistory,
    totalSessions,
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate MSIG practice breakdown following Prudential's structure
 * But with score-based tier calculations instead of standings
 */
function generateMSIGPracticeBreakdown(
  sessions: any[],
  companyId?: string,
  languageCode: string = 'en',
): PracticeBreakdownItem[] {
  const practiceBreakdown: Record<
    string,
    {
      totalPractices: number;
      tierCounts: Record<number, number>;
      totalScore: number;
      scoreCount: number;
      // Track scores per tier level for breakdown
      tierScores: Record<number, { total: number; count: number }>;
      productName?: string;
      bestStanding?: {
        tierName: string;
        tierLevel: number;
      };
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
        tierCounts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
        totalScore: 0,
        scoreCount: 0,
        tierScores: {
          0: { total: 0, count: 0 },
          1: { total: 0, count: 0 },
          2: { total: 0, count: 0 },
          3: { total: 0, count: 0 },
          4: { total: 0, count: 0 },
        },
        productName: productName !== 'N/A' ? productName : undefined,
        bestStanding: undefined,
      };
    }

    practiceBreakdown[key].totalPractices++;

    const tierInfo = parseMSIGSessionTier(session);
    practiceBreakdown[key].tierCounts[tierInfo.tierLevel]++;

    // Accumulate actual scores only for sessions with valid tiers
    if (tierInfo.isValid && tierInfo.overallScore !== null && tierInfo.overallScore !== undefined) {
      practiceBreakdown[key].totalScore += tierInfo.overallScore;
      practiceBreakdown[key].scoreCount++;

      // Also track score per tier level
      practiceBreakdown[key].tierScores[tierInfo.tierLevel].total +=
        tierInfo.overallScore;
      practiceBreakdown[key].tierScores[tierInfo.tierLevel].count++;
    }

    // Track best standing (highest tier achieved)
    if (
      tierInfo.isValid &&
      (!practiceBreakdown[key].bestStanding ||
        tierInfo.tierLevel > practiceBreakdown[key].bestStanding!.tierLevel)
    ) {
      practiceBreakdown[key].bestStanding = {
        tierName: tierInfo.tierName,
        tierLevel: tierInfo.tierLevel,
      };
    }
  }

  return Object.entries(practiceBreakdown)
    .map(([key, data]) => {
      const [callType, productFriendlyId] = key.split('::', 2);

      // Look up the product by friendlyId to get the localized name
      let localizedProductName = data.productName;
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

      const sessionsWithStanding =
        data.tierCounts[1] +
        data.tierCounts[2] +
        data.tierCounts[3] +
        data.tierCounts[4];
      const sessionsWithoutStanding =
        data.totalPractices - sessionsWithStanding;

      // Create breakdown using the helper function, then populate with actual counts and scores
      const breakdown = createMSIGStandingBreakdown().map((item) => {
        if (item.level === 'N/A') {
          const tierScoreData = data.tierScores[0];
          const averageScore =
            tierScoreData.count > 0
              ? Math.round(tierScoreData.total / tierScoreData.count)
              : null;

          return {
            ...item,
            totalPractices: sessionsWithoutStanding,
            averageScore,
          };
        } else {
          // Extract tier level from the item (L1 = 1, L2 = 2, L3 = 3, L4 = 4)
          const tierLevel = parseInt(item.level.substring(1)); // Extract number from "L1", "L2", etc.
          const tierScoreData = data.tierScores[tierLevel];
          const averageScore =
            tierScoreData.count > 0
              ? Math.round(tierScoreData.total / tierScoreData.count)
              : null;

          return {
            ...item,
            totalPractices: data.tierCounts[tierLevel] || 0,
            averageScore,
          };
        }
      });

      // Calculate average score from actual session scores
      const averageScore =
        data.scoreCount > 0
          ? Math.round(data.totalScore / data.scoreCount)
          : null;

      return {
        type: formatCallTypeName(callType),
        productName: localizedProductName,
        totalPractices: data.totalPractices,
        averageScore,
        grade: 'Badges-based',
        bestStanding: data.bestStanding
          ? (() => {
              const colors = MSIG_STANDING_COLORS[data.bestStanding.tierLevel];
              return {
                standing: data.bestStanding.tierName,
                tierLevel: data.bestStanding.tierLevel,
                backgroundColor: colors.backgroundColor,
                textColor: colors.textColor,
              };
            })()
          : null,
        breakdown,
      };
    })
    .sort((a, b) => b.totalPractices - a.totalPractices);
}
