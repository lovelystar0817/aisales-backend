import { ChatOpenAI } from '@langchain/openai';
import { callbackHandler } from '../../libs/langchain.js';
import { HttpError } from '../errors.js';
import { parseResponse } from '../json.js';
import { SalesSession } from '../../models/SalesSession.js';
import { Message, MessageDocument } from '../../models/Message.js';
import { AGENDA_JOB_TYPES, OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { getLanguageName } from '../languages.js';

import { isSessionTooBrief } from '../session.js';
import {
  SectionCriteria,
  getAvailableSections,
  getMSIGSectionPrompt,
} from '../../prompts/msig-assessment.js';

// MSIG constants centralised in one module
import {
  MSIG_SECTION_ORDER,
  MSIG_SECTIONS,
  MSIGSectionKey,
  getMSIGTierFromScore,
} from '../../constants/msig.js';

// Updated section evaluation interface without totalScore/actualScore
export interface MSIGSectionEvaluation {
  sectionType: keyof SectionCriteria;
  sectionWeight: number;
  description: string;
  evaluations: CriterionEvaluation[];
  isGenerating?: boolean;
  /** Indicates the section does not apply for this call */
  notApplicable?: boolean;
}

/**
 * Map of sectionKey → evaluation object.  Not all sections are guaranteed to be present
 * because the system supports lazy generation and `notApplicable` flags.
 */
export type MSIGSectionsRecord = Partial<
  Record<MSIGSectionKey, MSIGSectionEvaluation>
>;

export interface CriterionEvaluation {
  criteriaId: string;
  criteriaText: string;
  pass: boolean;
  mandatory: boolean;
  evidence: string;
}

export interface MSIGAssessmentInput {
  callType: string;
  scenario: string;
  objectives: string[];
  framework: string;
  messages: MessageDocument[];
  characterName: string;
  sessionId?: string;
  languageCode?: string;
  sectionType: keyof SectionCriteria;
}

export const generateMSIGSectionAssessment = async ({
  callType,
  scenario,
  objectives,
  framework,
  messages,
  characterName,
  sessionId,
  languageCode,
  sectionType,
}: MSIGAssessmentInput) => {
  try {
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const session = sessionId
      ? await SalesSession.findById(sessionId)
          .select('user roleplay persona messages product callType')
          .orFail()
      : null;

    const { prompt } = getMSIGSectionPrompt({
      sectionType,
      language: getLanguageName(languageCode),
      productId: session?.product?.friendlyId,
      callType: session?.callType,
    });

    const conversationContext = messages
      .map((m: MessageDocument) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      callType,
      scenario,
      objectives: objectives.join('\n'),
      framework,
      transcript: conversationContext,
    });

    console.log(
      `generateMSIGSectionAssessment ${sectionType} formattedPrompt:`,
      formattedPrompt,
    );

    const callback = session
      ? callbackHandler({
          userId: session.user?.toString(),
          sessionId: session.id,
          type: `msig_${sectionType}_assessment`,
        })
      : undefined;

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: callback ? [callback] : [],
    });

    let assessmentData: {
      sectionEvaluation: MSIGSectionEvaluation & {
        isApplicable?: boolean;
        notApplicableReason?: string;
      };
    };
    try {
      assessmentData = parseResponse(response);
    } catch (error) {
      console.error(
        `Failed to parse MSIG ${sectionType} assessment response:`,
        error,
      );
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        `Invalid JSON format in MSIG ${sectionType} assessment response`,
      );
    }

    const sectionEvaluation = assessmentData.sectionEvaluation;

    // Handle not applicable sections
    if (!sectionEvaluation.isApplicable) {
      // Get section criteria to show what would have been evaluated
      const { sectionData } = getMSIGSectionPrompt({
        sectionType,
        language: getLanguageName(languageCode),
        productId: session?.product?.friendlyId,
        callType: session?.callType,
      });

      // Create placeholder evaluations to show criteria without evaluation
      const placeholderEvaluations = sectionData.criteria.map((criterion) => ({
        criteriaId: criterion.id,
        criteriaText: criterion.text,
        pass: false, // Not evaluated
        mandatory: criterion.mandatory,
        evidence: '', // No evidence since not evaluated
      }));

      return {
        ...sectionEvaluation,
        notApplicable: true,
        notApplicableReason:
          sectionEvaluation.notApplicableReason || 'Section not applicable',
        evaluations: placeholderEvaluations,
      };
    }

    // For applicable sections, ensure the isApplicable field is removed from the final response
    const { isApplicable, notApplicableReason, ...finalEvaluation } =
      sectionEvaluation;
    return finalEvaluation;
  } catch (error) {
    console.error(`Error generating MSIG ${sectionType} assessment:`, error);
    throw new HttpError(
      500,
      `MSIG ${sectionType} assessment generation failed`,
    );
  }
};

// Job function for generating individual MSIG section
export const generateMSIGSectionAssessmentJob = async (job: any) => {
  const { sessionId, languageCode = 'en', sectionType } = job.attrs.data;

  console.log(
    `Starting MSIG ${sectionType} section generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if this specific section already exists (and is not just generating)
    const currentAssessment = await getMSIGAssessmentData(sessionId);
    const existingSection = currentAssessment?.sections?.[sectionType];

    if (
      existingSection &&
      !existingSection.isGenerating &&
      existingSection.evaluations
    ) {
      console.log(
        `MSIG ${sectionType} section already exists for session: ${sessionId}`,
      );
      return;
    }

    // Mark section as generating
    await setSectionGenerating(sessionId, sectionType, true);

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for MSIG ${sectionType} assessment: ${sessionId}`,
      );
      await setSectionGenerating(sessionId, sectionType, false);
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';

    // Generate this specific section
    const sectionAssessment = await generateMSIGSectionAssessment({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives || [],
      framework,
      messages: messages as MessageDocument[],
      characterName: session.persona?.name || 'Prospect',
      sessionId: session.id,
      languageCode,
      sectionType,
    });

    if (sectionAssessment) {
      // Update the assessment data atomically
      await updateMSIGSectionData(sessionId, sectionType, sectionAssessment);
      console.log(
        `MSIG ${sectionType} section generation completed for session: ${sessionId}`,
      );
    } else {
      console.log(
        `MSIG ${sectionType} section generation returned no data for session: ${sessionId}`,
      );
      await setSectionGenerating(sessionId, sectionType, false);
    }
  } catch (error) {
    console.error(
      `MSIG ${sectionType} section generation job failed for session ${sessionId}:`,
      error,
    );
    // Mark section as not generating on error
    await setSectionGenerating(sessionId, sectionType, false);
  }
};

// Helper function to get current MSIG assessment data
export const getMSIGAssessmentData = async (sessionId: string) => {
  const session = await SalesSession.findById(sessionId).select(
    'roleplay.feedback.salesTechniques assessmentType',
  );

  if (!session?.roleplay?.feedback?.salesTechniques) {
    return null;
  }

  try {
    const data = JSON.parse(session.roleplay.feedback.salesTechniques);
    return session.assessmentType === 'msig' ? data : null;
  } catch (error) {
    return null;
  }
};

// Helper function to set section generating status
export const setSectionGenerating = async (
  sessionId: string,
  sectionType: string,
  isGenerating: boolean,
) => {
  let currentAssessment = await getMSIGAssessmentData(sessionId);

  if (!currentAssessment) {
    currentAssessment = {
      sections: {},
      overallScore: 0,
    };
  }

  // Ensure sections object exists
  if (!currentAssessment.sections) {
    currentAssessment.sections = {};
  }

  // Update or create section with generating status
  if (currentAssessment.sections[sectionType]) {
    currentAssessment.sections[sectionType].isGenerating = isGenerating;
  } else {
    currentAssessment.sections[sectionType] = {
      isGenerating,
    };
  }

  // Check if any sections are generating
  const hasGeneratingSections = Object.values(currentAssessment.sections).some(
    (section: any) => section.isGenerating === true,
  );

  // Check if all sections are complete
  const availableSections = getAvailableSections();
  const completedSections = Object.keys(currentAssessment.sections).filter(
    (sectionKey) => {
      const section = currentAssessment.sections[sectionKey];
      return section && section.evaluations && !section.isGenerating;
    },
  );

  const allSectionsComplete =
    completedSections.length === availableSections.length;

  // Update in database
  await SalesSession.findByIdAndUpdate(sessionId, {
    $set: {
      'roleplay.feedback.salesTechniques': JSON.stringify(currentAssessment),
      'roleplay.feedback.salesTechniquesGenerating':
        hasGeneratingSections && !allSectionsComplete,
    },
  });

  return currentAssessment;
};

// Helper function to check if section is generating
export const isSectionGenerating = async (
  sessionId: string,
  sectionType: string,
): Promise<boolean> => {
  const assessment = await getMSIGAssessmentData(sessionId);
  return assessment?.sections?.[sectionType]?.isGenerating === true;
};

// Helper function to update a specific section in the MSIG assessment
export const updateMSIGSectionData = async (
  sessionId: string,
  sectionType: string,
  sectionData: MSIGSectionEvaluation,
) => {
  const session = await SalesSession.findById(sessionId);
  if (!session) throw new Error('Session not found');

  // Get current assessment data or create new structure
  let currentAssessment = await getMSIGAssessmentData(sessionId);

  if (!currentAssessment) {
    currentAssessment = {
      sections: {},
      overallScore: 0,
    };
  }

  // Ensure sections object exists
  if (!currentAssessment.sections) {
    currentAssessment.sections = {};
  }

  // Update the specific section with data and remove generating flag
  currentAssessment.sections[sectionType] = {
    ...sectionData,
    isGenerating: false,
  };

  // Recalculate overall score using weighted scoring (matching frontend)
  const overallScore = calculateMSIGOverallScore(currentAssessment.sections);
  currentAssessment.overallScore = overallScore;

  // Check if any sections are still generating
  const hasGeneratingSections = Object.values(currentAssessment.sections).some(
    (section: any) => section.isGenerating === true,
  );

  // Check if all sections are complete
  const availableSections = getAvailableSections();
  const completedSections = Object.keys(currentAssessment.sections).filter(
    (sectionKey) => {
      const section = currentAssessment.sections[sectionKey];
      return section && section.evaluations && !section.isGenerating;
    },
  );

  const allSectionsComplete =
    completedSections.length === availableSections.length;

  // Update in database
  await session.updateOne({
    $set: {
      'roleplay.feedback.salesTechniques': JSON.stringify(currentAssessment),
      'roleplay.feedback.salesTechniquesGenerating':
        hasGeneratingSections && !allSectionsComplete,
    },
  });

  // Log completion status
  if (allSectionsComplete) {
    console.log(
      `All MSIG sections completed for session: ${sessionId}. Overall score: ${overallScore.toFixed(2)}%`,
    );
  }

  return currentAssessment;
};
// Helper function to check if any mandatory criteria have failed (matching frontend)
export function hasFailedMandatory(
  sections: MSIGSectionsRecord | null,
): boolean {
  if (!sections) return false;

  return Object.values(sections).some(
    (section: any) =>
      // Skip sections that are not applicable
      !section?.notApplicable &&
      section?.evaluations?.some(
        (criteria: any) => criteria.mandatory && !criteria.pass,
      ),
  );
}

// Helper function to check if MSIG data is incomplete (matching frontend)
export function isMsigDataIncomplete(
  sections: MSIGSectionsRecord | null,
): boolean {
  if (!sections) return true;

  return MSIG_SECTIONS.some((sectionType: MSIGSectionKey) => {
    const section: MSIGSectionEvaluation | undefined = sections?.[sectionType];
    return (
      !section ||
      section.isGenerating === true ||
      (!section.notApplicable &&
        (!section.evaluations || section.evaluations.length === 0))
    );
  });
}

// Helper function to get tier name based on overall score for MSIG (matching frontend)

// Helper function to get MSIG tier name with all validation checks (matching frontend)
export function getMSIGTierName(sections: MSIGSectionsRecord | null): string {
  const overallScore = calculateMSIGOverallScore(sections ?? null);
  const hasMandatoryFailures = hasFailedMandatory(sections ?? null);
  const isDataIncomplete = isMsigDataIncomplete(sections ?? null);

  if (overallScore !== undefined && overallScore !== null) {
    if (isDataIncomplete || hasMandatoryFailures) {
      return 'Not available';
    }
    return getMSIGTierFromScore(overallScore);
  }
  return 'Not available';
}

// Helper function to calculate weighted overall score from sections (matching frontend logic exactly)
export function calculateMSIGOverallScore(
  sections: MSIGSectionsRecord | null,
): number {
  if (!sections) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  MSIG_SECTION_ORDER.forEach(({ key, weight }) => {
    const section = sections[key];

    // Only include sections that have completed evaluations and are not marked as not applicable
    if (
      section &&
      section.evaluations &&
      Array.isArray(section.evaluations) &&
      !section.isGenerating &&
      !section.notApplicable
    ) {
      const passedEvaluations = section.evaluations.filter(
        (evaluation: any) => evaluation.pass === true,
      ).length;
      const totalEvaluations = section.evaluations.length;

      if (totalEvaluations > 0) {
        // Calculate section score (0-100)
        const sectionScore = (passedEvaluations / totalEvaluations) * 100;

        // Add weighted contribution
        totalWeightedScore += sectionScore * weight;
        totalWeight += weight * 100; // Each section contributes weight * 100 to total possible
      }
    }
  });

  // Return overall percentage
  return totalWeight > 0
    ? Math.round((totalWeightedScore / totalWeight) * 100)
    : 0;
}

// Legacy function for backward compatibility
const calculateWeightedOverallScore = calculateMSIGOverallScore;

// Helper function to queue all MSIG sections in parallel
export const queueAllMSIGSections = async (
  sessionId: string,
  languageCode: string = 'en',
) => {
  const availableSections = getAvailableSections();
  const { getAgenda } = await import('../../jobs/agenda.js');
  const agenda = getAgenda();

  // Initialize complete MSIG assessment structure with all sections marked as generating
  const initialAssessment: any = {
    sections: {},
    overallScore: 0,
  };

  // Set all sections as generating upfront
  availableSections.forEach((sectionType) => {
    const sectionConfig = MSIG_SECTION_ORDER.find((s) => s.key === sectionType);
    initialAssessment.sections[sectionType] = {
      isGenerating: true,
      evaluations: [],
      sectionWeight: sectionConfig?.weight || 0,
      description: '',
    };
  });

  // Set initial structure and generating flag
  await SalesSession.findByIdAndUpdate(sessionId, {
    $set: {
      'roleplay.feedback.salesTechniques': JSON.stringify(initialAssessment),
      'roleplay.feedback.salesTechniquesGenerating': true,
    },
  });

  console.log(
    `Initialized all ${availableSections.length} sections as generating for session: ${sessionId}`,
  );

  // Queue all sections in parallel
  const queuePromises = availableSections.map((sectionType) => {
    return agenda
      .now(AGENDA_JOB_TYPES.GENERATE_MSIG_SECTION_ASSESSMENT, {
        sessionId,
        languageCode,
        sectionType,
      })
      .catch((error) => {
        console.error(
          `Failed to queue MSIG ${sectionType} section job:`,
          error,
        );
        // Don't clear generating flag here - let the polling mechanism handle it
      });
  });

  try {
    await Promise.all(queuePromises);
    console.log(
      `Successfully queued all ${availableSections.length} MSIG sections for session: ${sessionId}`,
    );
  } catch (error) {
    console.error(
      `Error queuing MSIG sections for session ${sessionId}:`,
      error,
    );
    // Only clear generating flag if ALL sections failed to queue
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.salesTechniquesGenerating': false },
    });
  }
};

// Helper function to check if all sections are complete
export const areAllSectionsComplete = async (
  sessionId: string,
): Promise<boolean> => {
  const assessment = await getMSIGAssessmentData(sessionId);
  if (!assessment?.sections) return false;

  const availableSections = getAvailableSections();
  const completedSections = Object.keys(assessment.sections).filter(
    (sectionKey) => {
      const section = assessment.sections[sectionKey];
      return section && section.evaluations && !section.isGenerating;
    },
  );

  return completedSections.length === availableSections.length;
};
export const getGeneratingSections = async (
  sessionId: string,
): Promise<string[]> => {
  const assessment = await getMSIGAssessmentData(sessionId);
  if (!assessment?.sections) return [];

  return Object.entries(assessment.sections)
    .filter(([_, section]: [string, any]) => section.isGenerating === true)
    .map(([sectionType]) => sectionType);
};

// Helper function to get completed sections
export const getCompletedSections = async (
  sessionId: string,
): Promise<string[]> => {
  const assessment = await getMSIGAssessmentData(sessionId);
  if (!assessment?.sections) return [];

  return Object.entries(assessment.sections)
    .filter(
      ([_, section]: [string, any]) =>
        section.evaluations && !section.isGenerating,
    )
    .map(([sectionType]) => sectionType);
};

/**
 * Convert MSIG sections object to ordered array for frontend display
 */
export const getMSIGSectionsAsOrderedArray = (
  sectionsObj: Record<string, any>,
) => {
  return MSIG_SECTION_ORDER.map(({ key: sectionType }) => ({
    sectionType,
    ...sectionsObj[sectionType],
  })).filter(
    (section) =>
      sectionsObj[section.sectionType] &&
      !sectionsObj[section.sectionType].isGenerating,
  );
};
