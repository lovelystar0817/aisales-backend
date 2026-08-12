import { ChatOpenAI } from '@langchain/openai';
import { callbackHandler } from '../../libs/langchain.js';
import { Message } from '../../models/Message.js';
import { SalesSession } from '../../models/SalesSession.js';
import { ScorecardSection } from '../../models/Scorecard.js';
import { isSessionTooBrief } from '../session.js';
import { DEFAULT_OPENAI_MODEL } from '../constants.js';
import { LangChainCallbackHandler } from '@posthog/ai';
import { parseResponse } from '../json.js';
import { HttpError } from '../errors.js';
import { getScorecardPrompt } from '../../prompts/scorecard-assessment.js';
import {
  generateProductKnowledge,
  triggerSCORMCompletionIfReady,
} from './regular.js';
import { parseFeedbackScores } from '../manage/shared.js';

interface ScorecardInput {
  scorecardSection: ScorecardSection;
  scenario: string;
  objectives: string[];
  messages: any[];
  characterName: string;
  callback: LangChainCallbackHandler;
  languageCode?: string;
}

interface ScorecardAssessment {
  overallScore: number;
  maxScore: number;
  criteria: {
    title: string;
    score: number;
    maxScore: number;
    reason: string;
    suggestion: string;
  }[];
}

export const generateScorecardsJob = async (job: any) => {
  const { sessionId, scorecards, languageCode } = job.attrs.data;

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      console.log(
        `[SCORECARDS-JOB] No roleplay found for session: ${sessionId}`,
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
        `[SCORECARDS-JOB] Session too brief for assessment: ${sessionId}`,
      );
      return;
    }

    // Get existing scorecards or initialize empty array
    const existingScorecards: any = session.roleplay.feedback?.scorecards || [];

    // Filter scorecards that need generation
    const scorecardsToGenerate = (scorecards as ScorecardSection[]).filter(
      (scorecardSection) => {
        const alreadyGenerated = existingScorecards.find(
          (sc: any) => sc.name === scorecardSection.name,
        );
        return (
          !alreadyGenerated ||
          !alreadyGenerated.criteria ||
          alreadyGenerated.criteria.length === 0
        );
      },
    );

    if (scorecardsToGenerate.length === 0) {
      console.log(
        `[SCORECARDS-JOB] No scorecards to generate for session: ${sessionId}`,
      );
      return;
    }

    // Mark ALL scorecards as generating UPFRONT
    const updatedScorecards = [
      // Keep existing completed scorecards
      ...existingScorecards.filter(
        (sc: any) => sc.criteria && sc.criteria.length > 0,
      ),
      // Mark all to-be-generated scorecards as generating
      ...scorecardsToGenerate.map((section) => ({
        name: section.name,
        sectionType: section.sectionType,
        isGenerating: true,
      })),
    ];

    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.scorecards': updatedScorecards,
      },
    });

    // Process each scorecard section
    for (const scorecardSection of scorecardsToGenerate) {
      const callback = callbackHandler({
        userId: session.user?.toString(),
        sessionId: session.id,
        type: 'custom_scorecard_assessment',
      });

      try {
        // Generate assessment for this scorecard
        let assessment: any = null;

        if (scorecardSection.sectionType === 'custom') {
          assessment = await generateScorecardAssessment({
            scorecardSection,
            scenario: session.roleplay.title || '',
            objectives: session.roleplay.objectives || [],
            messages,
            characterName: session.persona?.name || 'Prospect',
            callback,
            languageCode,
          });
        } else if (scorecardSection.sectionType === 'product-knowledge') {
          const productKnowledge = await generateProductKnowledge({
            callType: session.callType,
            scenario: session.roleplay.title || '',
            objectives: session.roleplay.objectives || [],
            framework: session.roleplay.framework,
            messages,
            characterName: session.persona?.name || 'Prospect',
            callback,
            languageCode,
            productInfo: '',
            product: session.product,
            scorecard: scorecardSection,
          });

          assessment = {
            name: scorecardSection.name,
            overallScore: productKnowledge.overallScore,
            maxScore: productKnowledge.maxScore,
            criteria: productKnowledge.sections,
          };
        }

        // Only save if we have valid assessment with criteria
        if (
          assessment &&
          assessment.criteria &&
          assessment.criteria.length > 0
        ) {
          // Get fresh session data
          const currentSession = await SalesSession.findById(sessionId);
          const currentScorecards: any =
            currentSession?.roleplay?.feedback?.scorecards || [];

          const calculatedScore = assessment.criteria.reduce(
            (sum: number, section: any) => {
              return sum + (section.score || 0);
            },
            0,
          );

          const updatedScorecards = currentScorecards.map((sc: any) =>
            sc.name === scorecardSection.name
              ? {
                  name: scorecardSection.name,
                  isGenerating: false,
                  sectionType: scorecardSection.sectionType,
                  overallScore:
                    scorecardSection.sectionType === 'product-knowledge'
                      ? calculatedScore
                      : assessment.overallScore,
                  maxScore: assessment.maxScore,
                  criteria: assessment.criteria,
                }
              : sc,
          );

          await SalesSession.findByIdAndUpdate(sessionId, {
            $set: {
              'roleplay.feedback.scorecards': updatedScorecards,
            },
          });
        } else {
          // Generation failed - mark as not generating but don't save empty criteria
          const currentSession = await SalesSession.findById(sessionId);
          const currentScorecards: any =
            currentSession?.roleplay?.feedback?.scorecards || [];

          const updatedScorecards = currentScorecards.map((sc: any) =>
            sc.name === scorecardSection.name
              ? {
                  name: scorecardSection.name,
                  sectionType: scorecardSection.sectionType,
                  isGenerating: false,
                  error: 'Generation failed - no valid criteria returned',
                }
              : sc,
          );

          await SalesSession.findByIdAndUpdate(sessionId, {
            $set: {
              'roleplay.feedback.scorecards': updatedScorecards,
            },
          });
        }
      } catch (error) {
        console.error(
          `[SCORECARDS-JOB] ❌ Failed to generate assessment for ${scorecardSection.name}:`,
          error,
        );

        // Mark as error
        const currentSession = await SalesSession.findById(sessionId);
        const currentScorecards: any =
          currentSession?.roleplay?.feedback?.scorecards || [];

        const updatedScorecards = currentScorecards.map((sc: any) =>
          sc.name === scorecardSection.name
            ? {
                name: scorecardSection.name,
                isGenerating: false,
                sectionType: scorecardSection.sectionType,
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : sc,
        );

        await SalesSession.findByIdAndUpdate(sessionId, {
          $set: {
            'roleplay.feedback.scorecards': updatedScorecards,
          },
        });
      }
    }

    // Re-fetch session to get fresh scorecard data (in-memory session is stale)
    const freshSession = await SalesSession.findById(sessionId).orFail();
    const { overallScore } = parseFeedbackScores(freshSession);

    // Store calculated scores in session for reference
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.overallScore': overallScore,
      },
    });

    await triggerSCORMCompletionIfReady(sessionId);

    console.log(`[SCORECARDS-JOB] ✅ Completed job for session: ${sessionId}`);
  } catch (error) {
    console.error(
      `[SCORECARDS-JOB] ❌ Job failed for session ${sessionId}:`,
      error,
    );
  }
};

export const generateScorecardAssessment = async (
  param: ScorecardInput,
): Promise<ScorecardAssessment | null> => {
  try {
    const {
      scorecardSection,
      scenario,
      objectives,
      messages,
      characterName,
      callback,
      languageCode = 'en',
    } = param;

    if (!scorecardSection.prompt) {
      console.error(
        `No prompt defined for scorecard section: ${scorecardSection.name}`,
      );
      return null;
    }

    const model = new ChatOpenAI({
      modelName: DEFAULT_OPENAI_MODEL,
      modelKwargs: {
        response_format: { type: 'json_object' },
      },
    });

    const prompt = getScorecardPrompt(
      characterName,
      scorecardSection,
      languageCode,
    );

    if (!prompt) {
      console.error(
        `Failed to create prompt for scorecard section: ${scorecardSection.name}`,
      );
      return null;
    }

    const conversationContext = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      scenario,
      objectives: objectives.join('\n'),
      transcript: conversationContext,
      characterName,
      scorecardName: scorecardSection.name,
      criteria: scorecardSection.criteria
        .map((c) => `- ${c.title}: ${c.description}`)
        .join('\n'),
    });

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: [callback],
    });

    let assessmentData;
    try {
      assessmentData = parseResponse(response);
      console.log(
        '[SCORECARDS] Parsed assessment data:',
        JSON.stringify(assessmentData, null, 2).substring(0, 1000),
      );
    } catch (error) {
      console.error('[SCORECARDS] Failed to parse response:', error);
      throw new HttpError(
        500,
        'Invalid JSON format in custom scorecard response',
      );
    }

    // Handle wrapped response - LLM might wrap in different objects
    let criteriaData = assessmentData;

    // If wrapped in "section", unwrap it
    if (assessmentData.section && !assessmentData.criteria) {
      criteriaData = assessmentData.section;
    }

    // Handle MEDDPICC format which uses salesTechnique.sections instead of criteria
    if (assessmentData.salesTechnique?.sections) {
      criteriaData = {
        criteria: assessmentData.salesTechnique.sections,
        overallScore: assessmentData.salesTechnique.overallScore,
        maxScore: assessmentData.salesTechnique.maxScore,
      };
    }

    // Handle Soft Skills format which uses grabMexSoftSkills.sections instead of criteria
    if (assessmentData.grabMexSoftSkills?.sections) {
      criteriaData = {
        criteria: assessmentData.grabMexSoftSkills.sections,
        overallScore: assessmentData.grabMexSoftSkills.overallScore,
        maxScore: assessmentData.grabMexSoftSkills.maxScore,
      };
    }

    // Also handle if sections is at root level
    if (assessmentData.sections && !assessmentData.criteria) {
      criteriaData = {
        criteria: assessmentData.sections,
        overallScore: assessmentData.overallScore,
        maxScore: assessmentData.maxScore,
      };
    }

    // Validate that we have criteria
    if (
      !criteriaData ||
      !criteriaData.criteria ||
      !Array.isArray(criteriaData.criteria)
    ) {
      console.error(
        '[SCORECARDS] Invalid criteria structure:',
        JSON.stringify(criteriaData, null, 2),
      );
      return null;
    }

    // Validate criteria array is not empty
    if (criteriaData.criteria.length === 0) {
      console.error('[SCORECARDS] Assessment data has empty criteria array');
      return null;
    }

    // Validate criteria structure - support both MEDDPICC and Soft Skills formats
    const validCriteria = criteriaData.criteria.every((c: any) => {
      const hasBasicFields =
        c.title &&
        typeof c.score === 'number' &&
        typeof c.maxScore === 'number';

      // MEDDPICC format: has reason/why + suggestion
      const hasMeddpiccFormat = (c.reason || c.why) && c.suggestion;

      // Soft Skills format: has strengths and/or toImprove
      const hasSoftSkillsFormat = c.strengths || c.toImprove;

      return hasBasicFields && (hasMeddpiccFormat || hasSoftSkillsFormat);
    });

    if (!validCriteria) {
      console.error(
        '[SCORECARDS] Invalid criteria fields. Criteria:',
        JSON.stringify(criteriaData.criteria, null, 2),
      );
      return null;
    }

    const overallScore = criteriaData.criteria.reduce(
      (sum: number, c: any) => sum + (c.score || 0),
      0,
    );

    return {
      overallScore,
      maxScore: 100,
      criteria: criteriaData.criteria.map((c: any) => {
        const baseCriteria: any = {
          title: c.title,
          score: c.score,
          maxScore: c.maxScore,
        };

        // Preserve MEDDPICC format fields if present
        if (c.reason || c.why || c.suggestion) {
          baseCriteria.reason = c.reason || c.why;
          baseCriteria.suggestion = c.suggestion;
        }

        // Preserve Soft Skills format fields if present
        if (c.strengths) {
          baseCriteria.strengths = c.strengths;
        }
        if (c.toImprove) {
          baseCriteria.toImprove = c.toImprove;
        }

        return baseCriteria;
      }),
    };
  } catch (error) {
    console.error('Error generating scorecard assessment:', error);
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace',
    );
    throw new HttpError(500, 'Custom scorecard assessment generation failed');
  }
};
