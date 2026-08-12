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
  ManulifeSectionCriteria,
  getManulifeAvailableSections,
  getManulifeSectionPrompt,
} from '../../prompts/manulife-fna-assessment.js';

// Manulife constants
import {
  MANULIFE_SECTION_ORDER,
  MANULIFE_SECTIONS,
  ManulifeSectionKey,
  getManulifeTierFromScore,
} from '../../constants/manulife.js';

// GoalReady imports
import {
  getManulifeGoalReadyAssessmentPrompt,
  ManulifeGoalReadyAssessment,
  manulifeGoalReadyAssessmentSchema,
  getManulifeGoalReadySalesAndNegotiationSkillsPrompt,
  getManulifeGoalReadySoftSkillsPrompt,
  getManulifeGoalReadyProductKnowledgePrompt,
  salesAndNegotiationSkillsSchema,
  softSkillsSchema,
  productKnowledgeSchema,
  SalesAndNegotiationSkillsAssessment,
  SoftSkillsAssessment,
  ProductKnowledgeAssessment,
} from '../../prompts/manulife-goalready-assessment.js';
import { getGoalReadyTierFromScore } from '../../constants/manulife-goalready.js';

// Updated section evaluation interface
export interface ManulifeSectionEvaluation {
  sectionType: keyof ManulifeSectionCriteria;
  description: string;
  evaluations: ManulifeCriterionEvaluation[];
  isGenerating?: boolean;
  /** Indicates the section does not apply for this call */
  notApplicable?: boolean;
}

/**
 * Map of sectionKey → evaluation object. Not all sections are guaranteed to be present
 * because the system supports lazy generation and `notApplicable` flags.
 */
export type ManulifeSectionsRecord = Partial<
  Record<ManulifeSectionKey, ManulifeSectionEvaluation>
>;

export interface ManulifeCriterionEvaluation {
  criteriaId: string;
  criteriaText: string;
  pass: boolean;
  evidence: string;
}

export interface ManulifeAssessmentInput {
  callType: string;
  scenario: string;
  objectives: string[];
  framework: string;
  messages: MessageDocument[];
  characterName: string;
  sessionId?: string;
  languageCode?: string;
  sectionType: keyof ManulifeSectionCriteria;
}

export const generateManulifeSectionAssessment = async ({
  callType,
  scenario,
  objectives,
  framework,
  messages,
  characterName,
  sessionId,
  languageCode,
  sectionType,
}: ManulifeAssessmentInput) => {
  try {
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const session = sessionId
      ? await SalesSession.findById(sessionId)
          .select('user roleplay persona messages product')
          .orFail()
      : null;

    const { prompt } = getManulifeSectionPrompt({
      sectionType,
      language: getLanguageName(languageCode),
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
      `generateManulifeSectionAssessment ${sectionType} formattedPrompt:`,
      formattedPrompt,
    );

    const callback = session
      ? callbackHandler({
          userId: session.user?.toString(),
          sessionId: session.id,
          type: `manulife_${sectionType}_assessment`,
        })
      : undefined;

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: callback ? [callback] : [],
    });

    let assessmentData: {
      sectionEvaluation: ManulifeSectionEvaluation & {
        isApplicable?: boolean;
        notApplicableReason?: string;
      };
    };
    try {
      assessmentData = parseResponse(response);
    } catch (error) {
      console.error(
        `Failed to parse Manulife ${sectionType} assessment response:`,
        error,
      );
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        `Invalid JSON format in Manulife ${sectionType} assessment response`,
      );
    }

    const sectionEvaluation = assessmentData.sectionEvaluation;

    // Handle not applicable sections (though for FNA, all sections should typically be applicable)
    if (sectionEvaluation.isApplicable === false) {
      const { sectionData } = getManulifeSectionPrompt({
        sectionType,
        language: getLanguageName(languageCode),
      });

      // Create placeholder evaluations to show criteria without evaluation
      const placeholderEvaluations = sectionData.criteria.map((criterion) => ({
        criteriaId: criterion.id,
        criteriaText: criterion.text,
        pass: false, // Not evaluated
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
    console.error(
      `Error generating Manulife ${sectionType} assessment:`,
      error,
    );
    throw new HttpError(
      500,
      `Manulife ${sectionType} assessment generation failed`,
    );
  }
};

// Job function for generating individual Manulife section
export const generateManulifeSectionAssessmentJob = async (job: any) => {
  const { sessionId, languageCode = 'en', sectionType } = job.attrs.data;

  console.log(
    `Starting Manulife ${sectionType} section generation job for session: ${sessionId}`,
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
    const currentAssessment = await getManulifeAssessmentData(sessionId);
    const existingSection = currentAssessment?.sections?.[sectionType];

    if (
      existingSection &&
      !existingSection.isGenerating &&
      existingSection.evaluations
    ) {
      console.log(
        `Manulife ${sectionType} section already exists for session: ${sessionId}`,
      );
      return;
    }

    // Mark section as generating
    await setManulifeSectionGenerating(sessionId, sectionType, true);

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for Manulife ${sectionType} assessment: ${sessionId}`,
      );
      await setManulifeSectionGenerating(sessionId, sectionType, false);
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';

    // Generate this specific section
    const sectionAssessment = await generateManulifeSectionAssessment({
      callType: session.callType,
      scenario: session.roleplay?.title || '',
      objectives: session.roleplay?.objectives || [],
      framework,
      messages: messages as MessageDocument[],
      characterName: session.persona?.name || 'Prospect',
      sessionId: session.id,
      languageCode,
      sectionType,
    });

    if (sectionAssessment) {
      // Update the assessment data atomically
      await updateManulifeSectionData(
        sessionId,
        sectionType,
        sectionAssessment,
      );
      console.log(
        `Manulife ${sectionType} section generation completed for session: ${sessionId}`,
      );
    } else {
      console.log(
        `Manulife ${sectionType} section generation returned no data for session: ${sessionId}`,
      );
      await setManulifeSectionGenerating(sessionId, sectionType, false);
    }
  } catch (error) {
    console.error(
      `Manulife ${sectionType} section generation job failed for session ${sessionId}:`,
      error,
    );
    // Mark section as not generating on error
    await setManulifeSectionGenerating(sessionId, sectionType, false);
  }
};

// Helper function to get current Manulife assessment data
export const getManulifeAssessmentData = async (sessionId: string) => {
  const session = await SalesSession.findById(sessionId).select(
    'roleplay.feedback.salesTechniques assessmentType',
  );

  if (!session?.roleplay?.feedback?.salesTechniques) {
    return null;
  }

  try {
    const data = JSON.parse(session.roleplay.feedback.salesTechniques);
    return session.assessmentType === 'manulife' ? data : null;
  } catch (error) {
    return null;
  }
};

// Helper function to set section generating status
export const setManulifeSectionGenerating = async (
  sessionId: string,
  sectionType: string,
  isGenerating: boolean,
) => {
  let currentAssessment = await getManulifeAssessmentData(sessionId);

  if (!currentAssessment) {
    currentAssessment = {
      sections: {},
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
  const availableSections = getManulifeAvailableSections();
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

// Helper function to update a specific section in the Manulife assessment
export const updateManulifeSectionData = async (
  sessionId: string,
  sectionType: string,
  sectionData: ManulifeSectionEvaluation,
) => {
  const session = await SalesSession.findById(sessionId);
  if (!session) throw new Error('Session not found');

  // Get current assessment data or create new structure
  let currentAssessment = await getManulifeAssessmentData(sessionId);

  if (!currentAssessment) {
    currentAssessment = {
      sections: {},
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

  // Check if any sections are still generating
  const hasGeneratingSections = Object.values(currentAssessment.sections).some(
    (section: any) => section.isGenerating === true,
  );

  // Check if all sections are complete
  const availableSections = getManulifeAvailableSections();
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
    console.log(`All Manulife sections completed for session: ${sessionId}.`);
  }

  return currentAssessment;
};

// Helper function to check if Manulife data is incomplete
export function isManulifeDataIncomplete(
  sections: ManulifeSectionsRecord | null,
): boolean {
  if (!sections) return true;

  return MANULIFE_SECTIONS.some((sectionType: ManulifeSectionKey) => {
    const section: ManulifeSectionEvaluation | undefined =
      sections?.[sectionType];
    return (
      !section ||
      section.isGenerating === true ||
      (!section.notApplicable &&
        (!section.evaluations || section.evaluations.length === 0))
    );
  });
}

// Helper function to get Manulife tier name with validation checks
export function getManulifeTierName(
  sections: ManulifeSectionsRecord | null,
  languageCode: string = 'en',
): string {
  const overallScore = calculateManulifeOverallScore(sections ?? null);
  const isDataIncomplete = isManulifeDataIncomplete(sections ?? null);

  if (overallScore !== undefined && overallScore !== null) {
    if (isDataIncomplete) {
      return 'Not available';
    }
    return getManulifeTierFromScore(overallScore, languageCode);
  }
  return 'Not available';
}

// Helper function to get Manulife tier level from tier name
export function getManulifeTierLevel(tierName?: string): number {
  // Map tier name to tier level for consistency
  let tierLevel = 0;
  if (tierName === 'Failed') {
    tierLevel = 1;
  } else if (tierName === 'Pass') {
    tierLevel = 2;
  } else if (tierName === 'Champion') {
    tierLevel = 3;
  }
  return tierLevel;
}

// Helper function to calculate overall score from sections (simple average)
export function calculateManulifeOverallScore(
  sections: ManulifeSectionsRecord | null,
): number {
  if (!sections) return 0;

  let totalPassed = 0;

  MANULIFE_SECTION_ORDER.forEach(({ key }) => {
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

      totalPassed += passedEvaluations;
    }
  });

  return totalPassed;
}

// ==================== GOALREADY SCORE CALCULATION ====================

/**
 * Calculate GoalReady overall score from session feedback
 * Returns the average of three scores: Sales & Negotiation Skills, Soft Skills, and Product Knowledge
 */
export function calculateGoalReadyOverallScore(session: any): number {
  try {
    // Parse the three feedback fields
    const salesAndNegotiationSkills = session?.roleplay?.feedback
      ?.manulifeSalesAndNegotiationSkills
      ? JSON.parse(session.roleplay.feedback.manulifeSalesAndNegotiationSkills)
      : null;

    const softSkills = session?.roleplay?.feedback?.manulifeSoftSkills
      ? JSON.parse(session.roleplay.feedback.manulifeSoftSkills)
      : null;

    const productKnowledge = session?.roleplay?.feedback
      ?.manulifeProductKnowledge
      ? JSON.parse(session.roleplay.feedback.manulifeProductKnowledge)
      : null;

    // Get scores (each has max 100)
    const salesScore = salesAndNegotiationSkills?.score;
    const softSkillsScore = softSkills?.score;
    const productScore = productKnowledge?.score;

    // Check if all scores are available
    if (
      salesScore !== null &&
      salesScore !== undefined &&
      softSkillsScore !== null &&
      softSkillsScore !== undefined &&
      productScore !== null &&
      productScore !== undefined
    ) {
      // Calculate average (round to 1 decimal place)
      const average = (salesScore + softSkillsScore + productScore) / 3;
      return Math.round(average * 10) / 10;
    }

    return 0;
  } catch (error) {
    console.error('Error calculating GoalReady overall score:', error);
    return 0;
  }
}

/**
 * Get GoalReady tier name from score
 */
export function getGoalReadyTierName(
  score: number,
  languageCode: string = 'en',
): string {
  if (score === 0 || Number.isNaN(score)) {
    return 'Not available';
  }
  return getGoalReadyTierFromScore(score, languageCode);
}

/**
 * Get GoalReady tier level from tier name
 * - Failed: 1
 * - Pass: 2
 * - Champion: 3
 */
export function getGoalReadyTierLevel(tierName?: string): number {
  if (tierName === 'Failed') {
    return 1;
  } else if (tierName === 'Pass') {
    return 2;
  } else if (tierName === 'Champion') {
    return 3;
  }
  return 0;
}

// Helper function to queue all Manulife sections in parallel
export const queueAllManulifeSections = async (
  sessionId: string,
  languageCode: string = 'en',
) => {
  const availableSections = getManulifeAvailableSections();
  const { getAgenda } = await import('../../jobs/agenda.js');
  const agenda = getAgenda();

  // Initialize complete Manulife assessment structure with all sections marked as generating
  const initialAssessment: any = {
    sections: {},
  };

  // Set all sections as generating upfront
  availableSections.forEach((sectionType) => {
    initialAssessment.sections[sectionType] = {
      isGenerating: true,
      evaluations: [],
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
      .now(AGENDA_JOB_TYPES.GENERATE_MANULIFE_SECTION_ASSESSMENT, {
        sessionId,
        languageCode,
        sectionType,
      })
      .catch((error) => {
        console.error(
          `Failed to queue Manulife ${sectionType} section job:`,
          error,
        );
        // Don't clear generating flag here - let the polling mechanism handle it
      });
  });

  try {
    await Promise.all(queuePromises);
    console.log(
      `Successfully queued all ${availableSections.length} Manulife sections for session: ${sessionId}`,
    );
  } catch (error) {
    console.error(
      `Error queuing Manulife sections for session ${sessionId}:`,
      error,
    );
    // Only clear generating flag if ALL sections failed to queue
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.salesTechniquesGenerating': false },
    });
  }
};

// ==================== GOALREADY ASSESSMENT ====================

export async function assessGoalReadySession(
  transcript: string,
  callType: string,
  scenario: string,
  objectives: string[],
  framework: string,
  characterName: string,
  language: string = 'en',
): Promise<ManulifeGoalReadyAssessment> {
  const prompt = getManulifeGoalReadyAssessmentPrompt(characterName, language);

  const llm = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1,
    temperature: 0,
  }).withStructuredOutput(manulifeGoalReadyAssessmentSchema);

  const chain = prompt.pipe(llm);

  const result = await chain.invoke({
    callType,
    scenario,
    objectives: objectives.join('\n'),
    framework,
    transcript,
  });

  // Validate the result against our schema
  const validated = manulifeGoalReadyAssessmentSchema.parse(result);

  // Calculate the average score from the three sections (with 1 decimal place)
  const salesScore =
    validated.goalReadyAssessment.salesAndNegotiationSkills.score;
  const softSkillsScore = validated.goalReadyAssessment.softSkills.score;
  const productScore = validated.goalReadyAssessment.productKnowledge.score;

  const averageScore = parseFloat(
    ((salesScore + softSkillsScore + productScore) / 3).toFixed(1),
  );

  // Override the overallScore with the calculated average
  validated.goalReadyAssessment.overallScore = averageScore;

  return validated;
}

/**
 * Assess Sales & Negotiation Skills section only
 */
export async function assessGoalReadySalesAndNegotiationSkills(
  transcript: string,
  callType: string,
  scenario: string,
  objectives: string[],
  framework: string,
  characterName: string,
  language: string = 'en',
): Promise<SalesAndNegotiationSkillsAssessment> {
  const prompt = getManulifeGoalReadySalesAndNegotiationSkillsPrompt(
    characterName,
    language,
  );

  const llm = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1,
    temperature: 0,
    timeout: 180000, // 3 minutes timeout to prevent indefinite hangs
  }).withStructuredOutput(salesAndNegotiationSkillsSchema);

  const chain = prompt.pipe(llm);

  const result = await chain.invoke({
    callType,
    scenario,
    objectives: objectives.join('\n'),
    framework,
    transcript,
  });

  // Validate the result against our schema
  const validated = salesAndNegotiationSkillsSchema.parse(result);

  return validated;
}

/**
 * Assess Soft Skills section only
 */
export async function assessGoalReadySoftSkills(
  transcript: string,
  callType: string,
  scenario: string,
  objectives: string[],
  framework: string,
  characterName: string,
  language: string = 'en',
): Promise<SoftSkillsAssessment> {
  const prompt = getManulifeGoalReadySoftSkillsPrompt(characterName, language);

  const llm = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1,
    temperature: 0,
    timeout: 180000, // 3 minutes timeout to prevent indefinite hangs
  }).withStructuredOutput(softSkillsSchema);

  const chain = prompt.pipe(llm);

  const result = await chain.invoke({
    callType,
    scenario,
    objectives: objectives.join('\n'),
    framework,
    transcript,
  });

  // Validate the result against our schema
  const validated = softSkillsSchema.parse(result);

  return validated;
}

/**
 * Assess Product Knowledge section only
 */
export async function assessGoalReadyProductKnowledge(
  transcript: string,
  callType: string,
  scenario: string,
  objectives: string[],
  framework: string,
  characterName: string,
  language: string = 'en',
): Promise<ProductKnowledgeAssessment> {
  const prompt = getManulifeGoalReadyProductKnowledgePrompt(
    characterName,
    language,
  );

  const llm = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1,
    temperature: 0,
    timeout: 180000, // 3 minutes timeout to prevent indefinite hangs
  }).withStructuredOutput(productKnowledgeSchema);

  const chain = prompt.pipe(llm);

  const result = await chain.invoke({
    callType,
    scenario,
    objectives: objectives.join('\n'),
    framework,
    transcript,
  });

  // Validate the result against our schema
  const validated = productKnowledgeSchema.parse(result);

  return validated;
}

// ==================== GOALREADY JOB HANDLERS ====================

/**
 * Job handler for generating Manulife GoalReady Sales & Negotiation Skills assessment
 */
export const generateManulifeSalesAndNegotiationSkillsJob = async (
  job: any,
) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting Manulife GoalReady Sales & Negotiation Skills generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate({
        path: 'scenario',
        populate: [{ path: 'product' }, { path: 'persona' }],
      })
      .select(
        'roleplay scenario callType product assessmentType persona messages',
      )
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if already exists
    if (session.roleplay.feedback?.manulifeSalesAndNegotiationSkills) {
      console.log(
        `Manulife GoalReady Sales & Negotiation Skills already exists for session: ${sessionId}`,
      );
      return;
    }

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for Manulife GoalReady assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.manulifeSalesAndNegotiationSkillsGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n');

    const characterName =
      ((session as any)?.scenario?.persona || (session as any).persona)?.name ||
      'Prospect';

    // Call the specific Sales & Negotiation Skills assessment
    const assessmentResult = await assessGoalReadySalesAndNegotiationSkills(
      transcript,
      session.callType,
      session.roleplay?.title || '',
      session.roleplay?.objectives || [],
      framework,
      characterName,
      languageCode,
    );

    // Extract the section
    const salesAndNegotiationSkills =
      assessmentResult.salesAndNegotiationSkills;

    // Save to database
    await session.updateOne({
      $set: {
        'roleplay.feedback.manulifeSalesAndNegotiationSkills': JSON.stringify(
          salesAndNegotiationSkills,
        ),
        'roleplay.feedback.manulifeSalesAndNegotiationSkillsGenerating': false,
      },
    });

    console.log(
      `Manulife GoalReady Sales & Negotiation Skills generation completed for session: ${sessionId}, score: ${salesAndNegotiationSkills.score}`,
    );
  } catch (error) {
    console.error(
      `Manulife GoalReady Sales & Negotiation Skills generation job failed for session ${sessionId}:`,
      error,
    );
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.manulifeSalesAndNegotiationSkillsGenerating': false,
      },
    });
  }
};

/**
 * Job handler for generating Manulife GoalReady Soft Skills assessment
 */
export const generateManulifeSoftSkillsJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting Manulife GoalReady Soft Skills generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate({
        path: 'scenario',
        populate: [{ path: 'product' }, { path: 'persona' }],
      })
      .select(
        'roleplay scenario callType product assessmentType persona messages',
      )
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if already exists
    if (session.roleplay.feedback?.manulifeSoftSkills) {
      console.log(
        `Manulife GoalReady Soft Skills already exists for session: ${sessionId}`,
      );
      return;
    }

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for Manulife GoalReady assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.manulifeSoftSkillsGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n');

    const characterName =
      ((session as any)?.scenario?.persona || (session as any).persona)?.name ||
      'Prospect';

    // Call the specific Soft Skills assessment
    const assessmentResult = await assessGoalReadySoftSkills(
      transcript,
      session.callType,
      session.roleplay?.title || '',
      session.roleplay?.objectives || [],
      framework,
      characterName,
      languageCode,
    );

    // Extract the section
    const softSkills = assessmentResult.softSkills;

    // Save to database
    await session.updateOne({
      $set: {
        'roleplay.feedback.manulifeSoftSkills': JSON.stringify(softSkills),
        'roleplay.feedback.manulifeSoftSkillsGenerating': false,
      },
    });

    console.log(
      `Manulife GoalReady Soft Skills generation completed for session: ${sessionId}, score: ${softSkills.score}`,
    );
  } catch (error) {
    console.error(
      `Manulife GoalReady Soft Skills generation job failed for session ${sessionId}:`,
      error,
    );
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.manulifeSoftSkillsGenerating': false,
      },
    });
  }
};

/**
 * Job handler for generating Manulife GoalReady Product Knowledge assessment
 */
export const generateManulifeProductKnowledgeJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting Manulife GoalReady Product Knowledge generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate({
        path: 'scenario',
        populate: [{ path: 'product' }, { path: 'persona' }],
      })
      .select(
        'roleplay scenario callType product assessmentType persona messages',
      )
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if already exists
    if (session.roleplay.feedback?.manulifeProductKnowledge) {
      console.log(
        `Manulife GoalReady Product Knowledge already exists for session: ${sessionId}`,
      );
      return;
    }

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for Manulife GoalReady assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.manulifeProductKnowledgeGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n');

    const characterName =
      ((session as any)?.scenario?.persona || (session as any).persona)?.name ||
      'Prospect';

    // Call the specific Product Knowledge assessment
    const assessmentResult = await assessGoalReadyProductKnowledge(
      transcript,
      session.callType,
      session.roleplay?.title || '',
      session.roleplay?.objectives || [],
      framework,
      characterName,
      languageCode,
    );

    // Extract the section
    const productKnowledge = assessmentResult.productKnowledge;

    // Save to database
    await session.updateOne({
      $set: {
        'roleplay.feedback.manulifeProductKnowledge':
          JSON.stringify(productKnowledge),
        'roleplay.feedback.manulifeProductKnowledgeGenerating': false,
      },
    });

    console.log(
      `Manulife GoalReady Product Knowledge generation completed for session: ${sessionId}, score: ${productKnowledge.score}`,
    );
  } catch (error) {
    console.error(
      `Manulife GoalReady Product Knowledge generation job failed for session ${sessionId}:`,
      error,
    );
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.manulifeProductKnowledgeGenerating': false,
      },
    });
  }
};
