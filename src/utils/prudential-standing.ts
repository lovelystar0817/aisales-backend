import { prudentialStandings } from '../data/standings/prudential.js';
import {
  StandingConfiguration,
  StandingCriterion,
} from '../types/standings.js';
import { SalesSession, SalesSessionDocument } from '../models/SalesSession.js';
import {
  AGENDA_JOB_TYPES,
  LIPSUM_COMPANY_ID,
  PLT_COMPANY_ID,
  PRUDENTIAL_COMPANY_ID,
  PRUDENTIAL_ID_COMPANY_ID,
} from './constants.js';
import { getAgenda } from '../jobs/agenda.js';
import { User } from '../models/User.js';
import { getLocalizedStanding } from '../data/standings/common.js';
import { UserStanding } from '../models/UserStanding.js';
import { Types } from 'mongoose';

export interface AssessmentDetails {
  clientVerification?: {
    completed: boolean;
    score: number;
  };
  frameworkExecution?: {
    score: number;
    type: '4C' | '3F';
  };
  objectionHandling?: {
    attemptCount: number;
    successfulCount: number;
    overallScore: number;
  };
  productKnowledge?: {
    score: number;
  };
  operationalKnowledge?: {
    score: number;
  };
  // MSIG-specific fields
  msigSections?: {
    [sectionKey: string]: {
      evaluations: Array<{
        description: string;
        pass: boolean;
        mandatory?: boolean;
        reasoning?: string;
      }>;
      isGenerating?: boolean;
      notApplicable?: boolean;
    };
  };
  manulifeSections?: {
    [sectionKey: string]: {
      evaluations: Array<{
        description: string;
        pass: boolean;
        reasoning?: string;
      }>;
      isGenerating?: boolean;
      notApplicable?: boolean;
    };
  };
  assessmentType?:
    | 'regular'
    | 'prudential'
    | 'prudential-objection-handling'
    | 'msig'
    | 'msig-3f'
    | 'manulife';
}

export interface StandingWithDetails {
  tierName: string;
  tierLevel: number;
  achievedAt: Date;
  assessmentDetails?: AssessmentDetails | null;
}

export type StandingProgressionType =
  | 'first-time' // First time completing this scenario
  | 'upgrade' // New personal best standing
  | 'maintained-same' // Same standing as previous best, same or worse score
  | 'maintained-improved' // Same standing as previous best, better score
  | 'downgrade' // Lower standing than personal best
  | 'no-standing'; // No standing achieved (mandatory not met)

export interface StandingProgressionContext {
  type: StandingProgressionType;
  currentStanding?: {
    tierName: string;
    tierLevel: number;
  };
  previousBest?: {
    tierName: string;
    tierLevel: number;
    achievedAt: Date;
  };
  isFirstTime: boolean;
  isNewBest: boolean;
  isNewBestScore: boolean;
  isHighestLevel: boolean;
}

/**
 * Safely parse JSON feedback data
 */
const parseJsonSafely = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
};

/**
 * Extract assessment details from session feedback
 */
export const extractAssessmentDetails = (
  feedback: any,
  moduleId: string,
): AssessmentDetails | null => {
  if (!feedback) return null;

  const assessment = parseJsonSafely(feedback.salesTechniques || '{}');
  const technicalKnowledge = parseJsonSafely(
    feedback.technicalKnowledge || '{}',
  );

  const objectionHandling = assessment.objectionHandling || {};
  const clientVerification = assessment.clientVerification || {};
  const frameworkExecution = assessment.frameworkExecution || {};
  const productKnowledge = technicalKnowledge.productKnowledge || {};
  const operationalKnowledge = technicalKnowledge.operationalKnowledge || {};

  // Calculate attemptCount and successfulCount from objections array
  const objections = objectionHandling.objections || [];
  const attemptCount = objections.length;
  const successfulCount = objections.filter(
    (obj: any) => obj.isSuccessful,
  ).length;
  const objectionScore = objectionHandling.overallScore || 0;

  const result: AssessmentDetails = {
    frameworkExecution: {
      score: frameworkExecution.overallScore || 0,
      type: moduleId === 'cold-call' ? '4C' : '3F',
    },
    objectionHandling: {
      attemptCount,
      successfulCount,
      overallScore: objectionScore,
    },
  };

  // Only include clientVerification for cold call sessions
  if (moduleId === 'cold-call') {
    result.clientVerification = {
      completed: Boolean(clientVerification.completed),
      score: clientVerification.completed ? 100 : 0,
    };
  } else {
    result.productKnowledge = {
      score: productKnowledge.overallScore || 0,
    };
    result.operationalKnowledge = {
      score: operationalKnowledge.overallScore || 0,
    };
  }

  return result;
};

/**
 * Enrich standings with assessment details from sessions
 */
export const enrichStandingsWithDetails = async (
  standings: any[],
  moduleId: string,
  languageCode: string = 'en',
  productId?: string,
): Promise<
  {
    latestStanding: StandingWithDetails | null;
    personalBest: StandingWithDetails | null;
  }[]
> => {
  // Find the appropriate standing configuration
  const standingConfig = prudentialStandings.find((config) => {
    // First match by module
    if (config.base.module !== moduleId) {
      return false;
    }

    // If the config specifies a product, it must match
    if (config.base.product && productId) {
      return config.base.product.toString() === productId;
    }

    // If the config doesn't specify a product, it's a general module config
    if (!config.base.product) {
      return true;
    }

    return false;
  });

  // Get localized tier names
  const getLocalizedTierName = (tierLevel: number): string => {
    if (!standingConfig) {
      return `Tier ${tierLevel}`; // Fallback
    }

    const localizedData =
      standingConfig.localized[
        languageCode as keyof typeof standingConfig.localized
      ] || standingConfig.localized.en; // Fallback to English

    // Find the index of the tier in the base configuration
    const baseTierIndex = standingConfig.base.tiers.findIndex(
      (bt) => bt.level === tierLevel,
    );

    if (baseTierIndex >= 0 && baseTierIndex < localizedData.tiers.length) {
      return localizedData.tiers[baseTierIndex].name;
    }

    return `Tier ${tierLevel}`; // Fallback
  };

  // Get unique session IDs
  const sessionIds = [
    ...new Set(
      standings
        .flatMap((s) => [
          s.latestStanding?.session?.toString(),
          s.personalBest?.session?.toString(),
        ])
        .filter(Boolean),
    ),
  ];

  // Fetch sessions in one query
  const sessions = await SalesSession.find({
    _id: { $in: sessionIds },
  })
    .select('_id roleplay.feedback')
    .lean();

  const sessionDataMap = new Map(
    sessions.map((session) => [
      session._id.toString(),
      session.roleplay?.feedback,
    ]),
  );

  // Transform standings with assessment details
  return standings.map((s) => ({
    latestStanding: s.latestStanding
      ? {
          tierName: getLocalizedTierName(s.latestStanding.tierLevel),
          tierLevel: s.latestStanding.tierLevel,
          achievedAt: s.latestStanding.createdAt,
          assessmentDetails: extractAssessmentDetails(
            sessionDataMap.get(s.latestStanding.session?.toString()),
            moduleId,
          ),
        }
      : null,
    personalBest: s.personalBest
      ? {
          tierName: getLocalizedTierName(s.personalBest.tierLevel),
          tierLevel: s.personalBest.tierLevel,
          achievedAt: s.personalBest.createdAt,
          assessmentDetails: extractAssessmentDetails(
            sessionDataMap.get(s.personalBest.session?.toString()),
            moduleId,
          ),
        }
      : null,
  }));
};

/**
 * Checks if a session's assessment data satisfies a single criterion.
 * @param assessmentData The parsed assessment data object from the session.
 * @param criterion The standing criterion to check against.
 * @returns True if the criterion is met, false otherwise.
 */
function checkCriterion(
  assessmentData: any,
  criterion: StandingCriterion,
): boolean {
  // Handle custom function-based criterion
  if (
    criterion.condition === 'custom' &&
    typeof criterion.check === 'function'
  ) {
    return criterion.check(assessmentData);
  }

  const value = getFromPath(assessmentData, criterion.assessmentArea);

  if (value === undefined) {
    console.warn(
      `[StandingCalculator] Assessment area '${criterion.assessmentArea}' not found in assessment data.`,
    );
    return false;
  }

  switch (criterion.condition) {
    case 'is-true':
      return value === true;
    case 'min-score':
      return typeof value === 'number' && value >= (criterion.value as number);
    case 'max-score':
      return typeof value === 'number' && value <= (criterion.value as number);
    case 'score-range':
      if (Array.isArray(criterion.value) && criterion.value.length === 2) {
        const [min, max] = criterion.value;
        return typeof value === 'number' && value >= min && value <= max;
      }
      return false;
    case 'min-count':
      return typeof value === 'number' && value >= (criterion.value as number);
    default:
      return false;
  }
}

/**
 * A simple helper to get a value from a nested object using a dot-notation path.
 * Replaces the need for lodash.get.
 * @param object The object to query.
 * @param path The dot-notation path string.
 * @returns The value, or undefined if not found.
 */
function getFromPath(object: any, path: string): any {
  return path.split('.').reduce((o, k) => (o || {})[k], object);
}

/**
 * Finds the highest standing tier achieved by a user for a given session.
 * @param session The sales session document.
 * @returns The achieved standing tier name and level, or null if no tier was achieved.
 */
export function calculateUserStanding(
  session: SalesSessionDocument,
  config: StandingConfiguration,
): {
  tierName: string;
  tierLevel: number;
  unmetHigherTierCriteria?: string[];
} | null {
  // Currently, standings are only for Prudential.
  if (
    session.assessmentType !== 'prudential' &&
    session.assessmentType !== 'prudential-objection-handling'
  ) {
    return null;
  }

  // Parse all the different feedback parts, accessing the nested data object.
  const assessment = session.roleplay?.feedback?.salesTechniques
    ? JSON.parse(session.roleplay.feedback.salesTechniques)
    : {};

  let assessmentData: any;

  if (session.assessmentType === 'prudential-objection-handling') {
    // For Prudential Objection Handling, the assessment has salesTechnique and objectionHandling directly
    assessmentData = {
      salesTechnique: {
        overallScore: assessment.salesTechnique?.overallScore || 0,
      },
      objectionHandling: {
        overallScore: assessment.objectionHandling?.overallScore || 0,
      },
      scores: session.scores || {},
    };
  } else {
    // Original Prudential assessment logic
    const salesTechniqueData = assessment.frameworkExecution || {};
    const technicalKnowledgeData = session.roleplay?.feedback
      ?.technicalKnowledge
      ? JSON.parse(session.roleplay.feedback.technicalKnowledge)
      : {};

    // Calculate objection handling metrics from the new schema structure
    const objectionHandling = assessment.objectionHandling || {};
    const objections = objectionHandling.objections || [];
    const attemptCount = objections.length;
    const successfulCount = objections.filter(
      (obj: any) => obj.isSuccessful,
    ).length;

    // Base structure for sales techniques, starting with factual data
    const finalSalesTechniques: any = {
      objectionHandling: {
        ...objectionHandling,
        attemptCount,
        successfulCount,
      },
      clientVerification: assessment.clientVerification,
    };

    // Add framework execution score
    finalSalesTechniques.frameworkExecution = {
      overallScore: salesTechniqueData.overallScore || 0,
    };

    // Combine all data into a single, merged object to evaluate against.
    assessmentData = {
      salesTechniques: finalSalesTechniques,
      technicalKnowledge: technicalKnowledgeData,
      scores: session.scores || {}, // Include top-level scores for easier access if needed
    };

    console.log(
      `[StandingCalculator] Assessment data summary - frameworkScore: ${finalSalesTechniques.frameworkExecution?.overallScore}, attemptCount: ${finalSalesTechniques.objectionHandling?.attemptCount}`,
    );
  }

  // Tiers are ordered by level in the static data (e.g., 3, 2, 1).
  // We check from the highest tier downwards.
  const sortedTiers = [...config.base.tiers].sort((a, b) => b.level - a.level);
  // Collect reasons why each higher tier was not achieved so that callers can display
  // or log them. This list is populated in descending order (highest tier first).
  const failureDetails: string[] = [];

  for (let i = 0; i < sortedTiers.length; i++) {
    const tier = sortedTiers[i];
    const failingCriteria: string[] = [];

    for (const criterion of tier.criteria) {
      const value = getFromPath(assessmentData, criterion.assessmentArea);
      if (!checkCriterion(assessmentData, criterion)) {
        failingCriteria.push(
          `'${criterion.assessmentArea}' (value: ${JSON.stringify(value)}, required: ${criterion.condition} ${
            criterion.value !== undefined ? JSON.stringify(criterion.value) : ''
          })`,
        );
      }
    }

    // Get tier name from localized data by index
    const tierName =
      config.localized.en.tiers[sortedTiers.length - i - 1]?.name ||
      `Tier ${tier.level}`;

    if (failingCriteria.length === 0) {
      // All criteria met for this tier.

      // If we previously failed one or more higher tiers, expose the reasons so that
      // the caller (or logs) can provide feedback to the user on what prevented a
      // higher standing.
      if (failureDetails.length > 0) {
        console.log(
          `[StandingCalculator] Higher tier(s) not achieved. Breakdown:\n- ` +
            failureDetails.join('\n- '),
        );
      }

      return {
        tierName,
        tierLevel: tier.level,
        unmetHigherTierCriteria: failureDetails,
      };
    } else {
      // Some criteria failed. Store details and check the next lower tier.
      failureDetails.push(
        `Tier '${tierName}' (Level ${tier.level}) failed due to: ${failingCriteria.join(', ')}`,
      );
    }
  }

  // If we're here, no tier was achieved. Log the details.
  if (failureDetails.length > 0) {
    console.log(
      `[StandingCalculator] No standing achieved. Breakdown:\n- ` +
        failureDetails.join('\n- '),
    );
  }

  return null; // User did not meet the criteria for any tier.
}

/**
 * Gets the standing configuration for a given module and product combination.
 * @param moduleId The module ID (e.g., 'cold-call', 'product-positioning')
 * @param productId The product ID (optional, for product-specific standings)
 * @returns The standing configuration ID or null if no configuration exists
 */
export function getStandingConfigurationByModuleAndProduct(
  moduleId: string,
  productId?: string,
): StandingConfiguration | undefined {
  const config = prudentialStandings.find((c) => {
    // First match by module
    if (c.base.module !== moduleId) {
      return false;
    }

    // If the config specifies a product, it must match
    if (c.base.product && productId) {
      return c.base.product.toString() === productId;
    }

    // If the config doesn't specify a product, it's a general module config
    if (!c.base.product) {
      return true;
    }

    return false;
  });

  return config;
}

/**
 * Finds a standing configuration that is applicable for a new session.
 * @param companyId The company ID.
 * @param moduleId The module ID (e.g., 'cold-call').
 * @param productId The product ID (optional).
 * @returns The standing configuration or undefined.
 */
export function findStandingConfigurationForSession(
  companyId: string,
  moduleId: string,
  productId?: string,
): StandingConfiguration | undefined {
  return prudentialStandings.find((c) => {
    if (!shouldUsePrudentialData(companyId)) {
      return false;
    }
    if (c.base.module !== moduleId) {
      return false;
    }
    // If config has a product, it must match.
    if (c.base.product && productId) {
      return c.base.product.toString() === productId;
    }
    // If config has no product, it's a match for the module.
    if (!c.base.product) {
      return true;
    }
    return false;
  });
}

/**
 * Gets the standing configuration by ID.
 * @param standingConfigurationId The ID of the standing configuration.
 * @returns The standing configuration, or undefined if no configuration exists.
 */
export function getStandingConfigurationById(
  standingConfigurationId: string,
): StandingConfiguration | undefined {
  return prudentialStandings.find(
    (c) => c.base.friendlyId === standingConfigurationId,
  );
}

/**
 * Enrich a single session's standing with its assessment details.
 * This function is shared between the endpoints.
 */
export function enrichSessionStanding(
  standing: any, // IUserStanding
  session: any, // ISalesSession
  languageCode: string,
) {
  if (!standing || !session?.roleplay?.feedback) return standing;

  const config = getStandingConfigurationById(standing.standingConfigurationId);
  const localizedStanding = config
    ? getLocalizedStanding(config, languageCode)
    : null;
  const currentTier = localizedStanding?.tiers[standing.tierLevel - 1];

  const parseJsonSafely = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  };
  const feedback = session.roleplay.feedback;
  const salesTechniques = parseJsonSafely(feedback.salesTechniques || '{}');
  const technicalKnowledge = parseJsonSafely(
    feedback.technicalKnowledge || '{}',
  );

  const clientVerification = salesTechniques.clientVerification || {};
  const objectionHandling = salesTechniques.objectionHandling || {};
  const frameworkExecution = salesTechniques.frameworkExecution || {};
  const productKnowledge = technicalKnowledge.productKnowledge || {};
  const operationalKnowledge = technicalKnowledge.operationalKnowledge || {};
  const clientVerificationScore =
    clientVerification.toImproveItems && clientVerification.completedItems
      ? 100 -
        (clientVerification.toImproveItems.length /
          (clientVerification.toImproveItems.length +
            clientVerification.completedItems.length)) *
          100
      : 0;

  // Calculate attemptCount and successfulCount from objections array
  const objections = objectionHandling.objections || [];
  const attemptCount = objections.length;
  const successfulCount = objections.filter(
    (obj: any) => obj.isSuccessful,
  ).length;
  const objectionScore = objectionHandling.overallScore || 0;

  // Handle Prudential Objection Handling assessments
  if (session.assessmentType === 'prudential-objection-handling') {
    return {
      ...standing,
      tierName: currentTier?.name || standing.tierName,
      assessmentDetails: {
        assessmentType: 'prudential-objection-handling',
        salesTechnique: {
          overallScore: salesTechniques.salesTechnique?.overallScore || 0,
          sections: salesTechniques.salesTechnique?.sections || [],
        },
        objectionHandling: {
          overallScore: salesTechniques.objectionHandling?.overallScore || 0,
          sections: salesTechniques.objectionHandling?.sections || [],
        },
      },
    };
  }

  // Handle MSIG assessments differently
  if (session.assessmentType === 'msig') {
    return {
      ...standing,
      tierName: currentTier?.name || standing.tierName,
      assessmentDetails: {
        assessmentType: 'msig',
        msigSections: salesTechniques.sections || {},
      },
    };
  }

  // Handle Manulife assessments differently
  if (session.assessmentType === 'manulife') {
    return {
      ...standing,
      tierName: currentTier?.name || standing.tierName,
      assessmentDetails: {
        assessmentType: 'manulife',
        manulifeSections: salesTechniques.sections || {},
      },
    };
  }

  // Handle MSIG-3F (Product Positioning) assessments
  if (session.assessmentType === 'msig-3f') {
    const productKnowledgeData = parseJsonSafely(
      feedback.productKnowledge || '{}',
    );

    // Create synthetic msigSections structure with Sales Technique and Product Knowledge
    const syntheticMsigSections = {
      salesTechnique: {
        evaluations: [
          {
            description: 'Sales Technique (3F Framework)',
            pass: (salesTechniques.overallScore || 0) >= 50,
            score: salesTechniques.overallScore || 0,
            reasoning: `Overall score: ${salesTechniques.overallScore || 0}%`,
          },
        ],
        isGenerating: false,
        notApplicable: false,
        overallScore: salesTechniques.overallScore || 0,
      },
      productKnowledge: {
        evaluations: [
          {
            description: 'Product Knowledge',
            pass: (productKnowledgeData.overallScore || 0) >= 50,
            score: productKnowledgeData.overallScore || 0,
            reasoning: `Overall score: ${productKnowledgeData.overallScore || 0}%`,
          },
        ],
        isGenerating: false,
        notApplicable: false,
        overallScore: productKnowledgeData.overallScore || 0,
      },
    };

    return {
      ...standing,
      tierName: currentTier?.name || standing.tierName,
      assessmentDetails: {
        assessmentType: 'msig-3f',
        msigSections: syntheticMsigSections,
      },
    };
  }

  // Handle regular/prudential assessments
  return {
    ...standing,
    tierName: currentTier?.name || standing.tierName,
    assessmentDetails: {
      assessmentType: session.assessmentType || 'regular',
      ...(session.callType === 'cold-call'
        ? {
            clientVerification: {
              completed: Boolean(clientVerification.completed),
              score: clientVerificationScore,
            },
          }
        : {
            productKnowledge: {
              score: productKnowledge.overallScore || 0,
            },
            operationalKnowledge: {
              score: operationalKnowledge.overallScore || 0,
            },
          }),
      frameworkExecution: {
        score: frameworkExecution.overallScore || 0,
        type: session.callType === 'cold-call' ? '4C' : '3F',
      },
      objectionHandling: {
        attemptCount,
        successfulCount,
        overallScore: objectionScore,
      },
    },
  };
}

/**
 * Checks if all required data points for a session are complete and, if so,
 * queues the final user standing calculation job.
 * This function is the single source of truth for triggering the final calculation.
 * @param sessionId The ID of the session to check.
 */
export async function triggerStandingCalculationIfReady(sessionId: string) {
  const session = await SalesSession.findById(sessionId)
    .select('callType roleplay.feedback user')
    .lean();
  if (!session) {
    console.warn(
      `[StandingGatekeeper] Session ${sessionId} not found during check.`,
    );
    return;
  }

  // Standings are only for Prudential. If the user is not from Prudential, stop.
  const user = await User.findById(session.user).select('company').lean();
  const isPrudential = shouldUsePrudentialData(user?.company?.toString());
  if (!isPrudential) {
    return;
  }

  const feedback = session.roleplay?.feedback;
  const callType = session.callType;

  // Define all data points required before final calculation can run.
  const requiredData = ['salesTechniques'];
  // For prudential-objection-handling, only salesTechniques is needed (contains both 3F and LAPR)
  // For other modules, also require technicalKnowledge except for cold-call
  if (
    callType !== 'cold-call' &&
    callType !== 'prudential-objection-handling'
  ) {
    requiredData.push('technicalKnowledge');
  }

  // Check if all required data is present and not still generating.
  const allDataReady = requiredData.every((key) => {
    const dataKey = key as keyof typeof feedback;
    const generatingKey = `${key}Generating` as keyof typeof feedback;

    const hasData = !!feedback?.[dataKey];
    const isGenerating = feedback?.[generatingKey] === true;

    if (isGenerating) {
      console.log(
        `[StandingGatekeeper] Waiting on ${key} for session ${sessionId}.`,
      );
      return false;
    }
    if (!hasData) {
      console.log(
        `[StandingGatekeeper] Data for ${key} is missing for session ${sessionId}.`,
      );
      return false;
    }
    return true;
  });

  if (allDataReady) {
    console.log(
      `[StandingGatekeeper] All data is ready for session ${sessionId}. Queuing final calculation job.`,
    );

    const agenda = getAgenda();
    await agenda.now(AGENDA_JOB_TYPES.CALCULATE_USER_STANDING, { sessionId });
  }
}

/**
 * Analyzes the standing progression for a given session by comparing with user's history
 */
export async function analyzeStandingProgression(
  sessionId: string,
  userId: string,
  callType: string,
  personaId: string,
  languageCode: string = 'en',
  productId?: string,
): Promise<StandingProgressionContext> {
  try {
    // Get current session standing
    const currentSession =
      await SalesSession.findById(sessionId).populate('standing');
    const currentStanding = currentSession?.standing;

    if (!currentSession) {
      console.log(
        `[StandingGatekeeper] Session ${sessionId} not found during progression analysis.`,
      );
      return {
        type: 'no-standing',
        isFirstTime: true,
        isNewBest: false,
        isNewBestScore: false,
        isHighestLevel: false,
      };
    }

    // Find standing configuration for this module/product combination
    const standingConfig = getStandingConfigurationByModuleAndProduct(
      callType,
      productId,
    );
    const standingConfigurationId = standingConfig?.base.friendlyId;

    if (!standingConfigurationId) {
      console.log(
        `[StandingGatekeeper] No standing configuration found for module ${callType} and product ${productId}.`,
      );
      return {
        type: 'no-standing',
        isFirstTime: true,
        isNewBest: false,
        isNewBestScore: false,
        isHighestLevel: false,
      };
    }

    // Helper function to get localized tier name
    const getLocalizedTierName = (tierLevel: number): string => {
      if (!standingConfig) {
        return `Tier ${tierLevel}`; // Fallback
      }

      const localizedData =
        standingConfig.localized[
          languageCode as keyof typeof standingConfig.localized
        ] || standingConfig.localized.en; // Fallback to English

      // Find the index of the tier in the base configuration
      const baseTierIndex = standingConfig.base.tiers.findIndex(
        (bt) => bt.level === tierLevel,
      );

      if (baseTierIndex >= 0 && baseTierIndex < localizedData.tiers.length) {
        return localizedData.tiers[baseTierIndex].name;
      }

      return `Tier ${tierLevel}`; // Fallback
    };

    // Get the timestamp of the current session to ensure we only compare with earlier sessions
    const currentSessionTimestamp =
      currentSession.endedAt || currentSession.createdAt;

    // Get user's standing history for this persona/module/product
    // Only include sessions that were completed BEFORE the current session
    const standingHistory = await UserStanding.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          persona: personaId,
          standingConfigurationId: standingConfigurationId,
          session: { $ne: new Types.ObjectId(sessionId) }, // Exclude current session
        },
      },
      {
        $lookup: {
          from: 'salessessions',
          localField: 'session',
          foreignField: '_id',
          as: 'sessionData',
        },
      },
      {
        $unwind: '$sessionData',
      },
      {
        $match: {
          // Only include sessions that were completed before the current session
          $or: [
            { 'sessionData.endedAt': { $lt: currentSessionTimestamp } },
            {
              'sessionData.endedAt': { $exists: false },
              'sessionData.createdAt': { $lt: currentSessionTimestamp },
            },
          ],
        },
      },
      {
        $sort: {
          tierLevel: -1, // Highest tier first
          'sessionData.createdAt': -1, // Most recent first for same tier
        },
      },
    ]);

    const isFirstTime = standingHistory.length === 0;
    const previousBest = standingHistory[0]; // Highest tier achieved previously

    // If no current standing achieved
    if (!currentStanding) {
      console.log(
        `[StandingGatekeeper] No standing found for session ${sessionId}.`,
      );
      return {
        type: 'no-standing',
        previousBest: previousBest
          ? {
              tierName: getLocalizedTierName(previousBest.tierLevel),
              tierLevel: previousBest.tierLevel,
              achievedAt: previousBest.createdAt,
            }
          : undefined,
        isFirstTime,
        isNewBest: false,
        isNewBestScore: false,
        isHighestLevel: false,
      };
    }

    // If this is the first time
    if (isFirstTime) {
      return {
        type: 'first-time',
        currentStanding: {
          tierName: getLocalizedTierName(currentStanding.tierLevel),
          tierLevel: currentStanding.tierLevel,
        },
        isFirstTime: true,
        isNewBest: true,
        isNewBestScore: true, // Also a new best score
        isHighestLevel:
          currentStanding.tierLevel === standingConfig.base.tiers.length,
      };
    }

    // Compare with previous best
    const currentTierLevel = currentStanding.tierLevel;
    const previousBestLevel = previousBest.tierLevel;

    if (currentTierLevel > previousBestLevel) {
      // New personal best (higher tier level = better standing)
      return {
        type: 'upgrade',
        currentStanding: {
          tierName: getLocalizedTierName(currentStanding.tierLevel),
          tierLevel: currentStanding.tierLevel,
        },
        previousBest: {
          tierName: getLocalizedTierName(previousBest.tierLevel),
          tierLevel: previousBest.tierLevel,
          achievedAt: previousBest.createdAt,
        },
        isFirstTime: false,
        isNewBest: true,
        isNewBestScore: true, // Also a new best score
        isHighestLevel:
          currentStanding.tierLevel === standingConfig.base.tiers.length,
      };
    } else if (currentTierLevel === previousBestLevel) {
      // Same standing level - check if score improved
      const currentSession = await SalesSession.findById(sessionId);
      const previousSession = await SalesSession.findById(previousBest.session);

      let currentScore = 0;
      let previousScore = 0;

      // Calculate current session score
      if (currentSession?.roleplay?.feedback) {
        const salesData = parseJsonSafely(
          currentSession.roleplay.feedback.salesTechniques || '{}',
        );
        const productData = parseJsonSafely(
          currentSession.roleplay.feedback.productKnowledge || '{}',
        );

        // For prudential-objection-handling, use salesTechnique and objectionHandling scores
        if (currentSession.assessmentType === 'prudential-objection-handling') {
          const validScores = [
            salesData?.salesTechnique?.overallScore,
            salesData?.objectionHandling?.overallScore,
          ].filter((score) => score != null && !isNaN(score));
          currentScore =
            validScores.length > 0
              ? validScores.reduce((sum, score) => sum + score, 0) /
                validScores.length
              : 0;
        } else {
          const validScores = [
            salesData?.overallScore,
            productData?.overallScore,
          ].filter((score) => score != null && !isNaN(score));
          currentScore =
            validScores.length > 0
              ? validScores.reduce((sum, score) => sum + score, 0) /
                validScores.length
              : 0;
        }
      }

      // Calculate previous session score
      if (previousSession?.roleplay?.feedback) {
        const salesData = parseJsonSafely(
          previousSession.roleplay.feedback.salesTechniques || '{}',
        );
        const productData = parseJsonSafely(
          previousSession.roleplay.feedback.productKnowledge || '{}',
        );

        // For prudential-objection-handling, use salesTechnique and objectionHandling scores
        if (
          previousSession.assessmentType === 'prudential-objection-handling'
        ) {
          const validScores = [
            salesData?.salesTechnique?.overallScore,
            salesData?.objectionHandling?.overallScore,
          ].filter((score) => score != null && !isNaN(score));
          previousScore =
            validScores.length > 0
              ? validScores.reduce((sum, score) => sum + score, 0) /
                validScores.length
              : 0;
        } else {
          const validScores = [
            salesData?.overallScore,
            productData?.overallScore,
          ].filter((score) => score != null && !isNaN(score));
          previousScore =
            validScores.length > 0
              ? validScores.reduce((sum, score) => sum + score, 0) /
                validScores.length
              : 0;
        }
      }

      const progressionType =
        currentScore > previousScore
          ? 'maintained-improved'
          : 'maintained-same';
      const isNewBestScore = currentScore > previousScore;

      return {
        type: progressionType,
        currentStanding: {
          tierName: getLocalizedTierName(currentStanding.tierLevel),
          tierLevel: currentStanding.tierLevel,
        },
        previousBest: {
          tierName: getLocalizedTierName(previousBest.tierLevel),
          tierLevel: previousBest.tierLevel,
          achievedAt: previousBest.createdAt,
        },
        isFirstTime: false,
        isNewBest: false,
        isNewBestScore,
        isHighestLevel:
          currentStanding.tierLevel === standingConfig.base.tiers.length,
      };
    } else {
      // Lower standing than previous best
      return {
        type: 'downgrade',
        currentStanding: {
          tierName: getLocalizedTierName(currentStanding.tierLevel),
          tierLevel: currentStanding.tierLevel,
        },
        previousBest: {
          tierName: getLocalizedTierName(previousBest.tierLevel),
          tierLevel: previousBest.tierLevel,
          achievedAt: previousBest.createdAt,
        },
        isFirstTime: false,
        isNewBest: false,
        isNewBestScore: false,
        isHighestLevel: false, // Downgraded, so can't be highest
      };
    }
  } catch (error) {
    console.error('Error analyzing standing progression:', error);
    return {
      type: 'no-standing',
      isFirstTime: true,
      isNewBest: false,
      isNewBestScore: false,
      isHighestLevel: false,
    };
  }
}

export function shouldUsePrudentialData(companyId: string | undefined) {
  return (
    companyId === PRUDENTIAL_COMPANY_ID ||
    companyId === PLT_COMPANY_ID ||
    companyId === PRUDENTIAL_ID_COMPANY_ID ||
    companyId === LIPSUM_COMPANY_ID
  );
}
