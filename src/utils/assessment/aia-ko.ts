import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { DEFAULT_FRAMEWORK } from '../../frameworks/common.js';
import {
  aiaKoIntroductionEvaluationPrompt,
  aiaKoObjectionHandlingEvaluationPrompt,
  aiaKoNeedsExplorationEvaluationPrompt,
} from '../../frameworks/aiaKoOpeningObjectionCall.js';
import {
  aiaKoNeedsAnalysisEvaluationPrompt,
  aiaKoProductPitchEvaluationPrompt,
  aiaKoProductPitchObjectionHandlingEvaluationPrompt,
} from '../../frameworks/aiaKoProductPitch.js';
import { aiaKoE2EEvaluationPrompt } from '../../frameworks/aiaKoEndToEndOutboundCall.js';
import { Message } from '../../models/Message.js';
import { SalesSession } from '../../models/SalesSession.js';
import { OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { getLanguageName } from '../languages.js';
import { isSessionTooBrief } from '../session.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

function buildResponseTimeContext(
  messages: { role: string; responseTimeSec?: number | null }[],
): string {
  const userResponseTimes = messages
    .filter((m) => m.role === 'user' && m.responseTimeSec != null)
    .map((m, i) => ({ turnIndex: i, responseTimeSec: m.responseTimeSec! }));

  if (!userResponseTimes.length) return '';

  const avg =
    userResponseTimes.reduce((sum, rt) => sum + rt.responseTimeSec, 0) /
    userResponseTimes.length;
  const fastCount = userResponseTimes.filter(
    (rt) => rt.responseTimeSec < 3,
  ).length;
  const slowCount = userResponseTimes.filter(
    (rt) => rt.responseTimeSec >= 3,
  ).length;
  const perTurn = userResponseTimes
    .map((rt) => `Turn ${rt.turnIndex + 1}: ${rt.responseTimeSec}s`)
    .join(', ');

  return `[MEASURED RESPONSE TIME DATA]
The following response times were measured from when the AI customer finished speaking to when the salesperson began speaking:
- Average response time: ${avg.toFixed(1)} seconds
- Fast responses (under 3 seconds): ${fastCount} out of ${userResponseTimes.length} turns
- Slow responses (3 seconds or more): ${slowCount} out of ${userResponseTimes.length} turns
- Per-turn breakdown: ${perTurn}

Use this MEASURED data (not guesswork) to evaluate Response Speed. Under 3 seconds indicates confidence and preparedness. 3 seconds or more suggests hesitation.`;
}

// E2E assessment schemas (nested criteria within sections)
const aiaKoE2ECriterionSchema = z.object({
  title: z.string(),
  score: z.number(),
  maxScore: z.number(),
  why: z.string(),
  suggestion: z.string(),
});

const aiaKoE2ESectionSchema = z.object({
  title: z.string(),
  score: z.number(),
  maxScore: z.number(),
  weight: z.number(),
  criteria: z.array(aiaKoE2ECriterionSchema),
});

const aiaKoE2EAssessmentSchema = z.object({
  e2eAssessment: z.object({
    description: z.string(),
    overallScore: z.number(),
    maxScore: z.number(),
    sections: z.array(aiaKoE2ESectionSchema),
  }),
});

// Zod schemas for structured output with per-criterion scoring
const aiaKoSectionSchema = z.object({
  title: z.string(),
  score: z.number(),
  maxScore: z.number(),
  why: z.string(),
  suggestion: z.string(),
});

const aiaKoIntroductionSchema = z.object({
  introduction: z.object({
    description: z.string(),
    overallScore: z.number(),
    maxScore: z.number(),
    sections: z.array(aiaKoSectionSchema),
  }),
});

const aiaKoObjectionHandlingSchema = z.object({
  objectionHandling: z.object({
    description: z.string(),
    overallScore: z.number(),
    maxScore: z.number(),
    sections: z.array(aiaKoSectionSchema),
  }),
});

const aiaKoNeedsExplorationSchema = z.object({
  needsExploration: z.object({
    description: z.string(),
    overallScore: z.number(),
    maxScore: z.number(),
    sections: z.array(aiaKoSectionSchema),
  }),
});

// Product Pitch scenario schemas
const aiaKoNeedsAnalysisSchema = z.object({
  needsAnalysis: z.object({
    description: z.string(),
    overallScore: z.number(),
    maxScore: z.number(),
    sections: z.array(aiaKoSectionSchema),
  }),
});

const aiaKoProductPitchSchema = z.object({
  productPitch: z.object({
    description: z.string(),
    overallScore: z.number(),
    maxScore: z.number(),
    sections: z.array(aiaKoSectionSchema),
  }),
});

const aiaKoProductPitchObjectionHandlingSchema = z.object({
  objectionHandling: z.object({
    description: z.string(),
    overallScore: z.number(),
    maxScore: z.number(),
    sections: z.array(aiaKoSectionSchema),
  }),
});

/** Clamp each section's score to its maxScore (LLM sometimes exceeds bounds) */
function clampSectionScores(data: {
  sections?: { score: number; maxScore: number }[];
}) {
  if (data.sections) {
    for (const section of data.sections) {
      if (section.score > section.maxScore) {
        section.score = section.maxScore;
      }
      if (section.score < 0) {
        section.score = 0;
      }
    }
  }
}

/** Recalculate overall score as sum of section scores (don't trust LLM's overall) */
function recalculateOverallScore(data: {
  overallScore: number;
  sections?: { score: number }[];
}) {
  if (data.sections && data.sections.length > 0) {
    data.overallScore = data.sections.reduce(
      (sum, s) => sum + (s.score || 0),
      0,
    );
  }
}

// Prompt generators
function getAiaKoIntroductionPrompt(characterName: string, language?: string, userName?: string) {
  const languageName = getLanguageName(language) || language || 'English';
  let basePrompt = aiaKoIntroductionEvaluationPrompt.replaceAll(
    '{{characterName}}',
    characterName,
  ).replaceAll('{{userName}}', userName || 'TSR');

  const isEnglish = !language || language === 'en';
  if (isEnglish) {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in English. Every single word in the "why", "suggestion", "description", and "title" fields MUST be in English. Writing in Korean is STRICTLY FORBIDDEN even though examples in the prompt are in Korean — those are for tone reference only. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output must be written in English. The Korean examples in the feedback tone section are for TONE REFERENCE ONLY — translate the style, not the words.`;
  } else {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in ${languageName} (${language}). Every single word in the "why" and "suggestion" fields MUST be in ${languageName}. Writing in English is STRICTLY FORBIDDEN. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output — every string in "why" and "suggestion" — must be written in ${languageName}. Do NOT write any feedback in English. If the conversation was conducted in ${languageName}, all feedback must be in ${languageName}.`;
  }

  const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate an introduction assessment based strictly on the salesperson's performance. Output ONLY valid JSON using the exact format specified.`;

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userTemplate],
  ]);
}

function getAiaKoObjectionHandlingPrompt(
  characterName: string,
  language?: string,
  userName?: string,
) {
  const languageName = getLanguageName(language) || language || 'English';
  let basePrompt = aiaKoObjectionHandlingEvaluationPrompt.replaceAll(
    '{{characterName}}',
    characterName,
  ).replaceAll('{{userName}}', userName || 'TSR');

  const isEnglish = !language || language === 'en';
  if (isEnglish) {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in English. Every single word in the "why", "suggestion", "description", and "title" fields MUST be in English. Writing in Korean is STRICTLY FORBIDDEN even though examples in the prompt are in Korean — those are for tone reference only. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output must be written in English. The Korean examples in the feedback tone section are for TONE REFERENCE ONLY — translate the style, not the words.`;
  } else {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in ${languageName} (${language}). Every single word in the "why" and "suggestion" fields MUST be in ${languageName}. Writing in English is STRICTLY FORBIDDEN. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output — every string in "why" and "suggestion" — must be written in ${languageName}. Do NOT write any feedback in English. If the conversation was conducted in ${languageName}, all feedback must be in ${languageName}.`;
  }

  const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate an objection handling assessment based strictly on the salesperson's performance. Output ONLY valid JSON using the exact format specified.`;

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userTemplate],
  ]);
}

function getAiaKoNeedsExplorationPrompt(
  characterName: string,
  language?: string,
  userName?: string,
) {
  const languageName = getLanguageName(language) || language || 'English';
  let basePrompt = aiaKoNeedsExplorationEvaluationPrompt.replaceAll(
    '{{characterName}}',
    characterName,
  ).replaceAll('{{userName}}', userName || 'TSR');

  const isEnglish = !language || language === 'en';
  if (isEnglish) {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in English. Every single word in the "why", "suggestion", "description", and "title" fields MUST be in English. Writing in Korean is STRICTLY FORBIDDEN even though examples in the prompt are in Korean — those are for tone reference only. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output must be written in English. The Korean examples in the feedback tone section are for TONE REFERENCE ONLY — translate the style, not the words.`;
  } else {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in ${languageName} (${language}). Every single word in the "why" and "suggestion" fields MUST be in ${languageName}. Writing in English is STRICTLY FORBIDDEN. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output — every string in "why" and "suggestion" — must be written in ${languageName}. Do NOT write any feedback in English. If the conversation was conducted in ${languageName}, all feedback must be in ${languageName}.`;
  }

  const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate a needs exploration assessment based strictly on the salesperson's performance. Output ONLY valid JSON using the exact format specified.`;

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userTemplate],
  ]);
}

/**
 * Generate AIA KO Introduction Assessment
 * Evaluates 6 criteria: Greeting(15), Name(15), Affiliation&ID(25), Customer Name(15), Purpose(18), Tone&Flow(12)
 * Total: 100 points
 */
export async function generateAiaKoIntroductionJob(job: any): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[AIA-KO] Starting introduction assessment for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      throw new Error(`No roleplay found for session: ${sessionId}`);
    }

    // Do not re-generate if already present
    if (session.roleplay.feedback?.aiaKoIntroduction) {
      console.log(
        `[AIA-KO] Introduction assessment already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoIntroductionGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.aiaKoIntroductionGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content responseTimeSec');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[AIA-KO] Session too brief for introduction assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoIntroductionGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    const salespersonName = (session.user as any)?.firstName || (session.user as any)?.name || 'TSR';
    const prompt = getAiaKoIntroductionPrompt(
      session.persona?.name || 'Customer',
      languageCode,
      salespersonName,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = buildResponseTimeContext(messages);

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext,
    });

    const modelWithStructuredOutput = model.withStructuredOutput(
      aiaKoIntroductionSchema,
    );

    const introductionData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (introductionData?.introduction) {
      clampSectionScores(introductionData.introduction);
      recalculateOverallScore(introductionData.introduction);
      console.log(
        `[AIA-KO] Introduction assessment score for session ${sessionId}: ${introductionData.introduction.overallScore}/${introductionData.introduction.maxScore}`,
      );

      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoIntroduction': JSON.stringify(
            introductionData.introduction,
          ),
          'roleplay.feedback.aiaKoIntroductionGenerating': false,
        },
      });
      console.log(
        `[AIA-KO] Introduction assessment completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoIntroductionGenerating': false,
        },
      });
      console.log(
        `[AIA-KO] Introduction assessment returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[AIA-KO] Introduction job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.aiaKoIntroductionGenerating': false,
      },
    });
    throw error;
  }
}

/**
 * Generate AIA KO Objection Handling Assessment
 * Evaluates 7 criteria: Light Response(15), Speed(15), Composure(15), Fillers(12), No Reset(15), Yes-But(15), Momentum(13)
 * Total: 100 points
 */
export async function generateAiaKoObjectionHandlingJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[AIA-KO] Starting objection handling assessment for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      throw new Error(`No roleplay found for session: ${sessionId}`);
    }

    // Do not re-generate if already present
    if (session.roleplay.feedback?.aiaKoObjectionHandling) {
      console.log(
        `[AIA-KO] Objection handling assessment already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoObjectionHandlingGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.aiaKoObjectionHandlingGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content responseTimeSec');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[AIA-KO] Session too brief for objection handling assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoObjectionHandlingGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    const salespersonName = (session.user as any)?.firstName || (session.user as any)?.name || 'TSR';
    const prompt = getAiaKoObjectionHandlingPrompt(
      session.persona?.name || 'Customer',
      languageCode,
      salespersonName,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = buildResponseTimeContext(messages);

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext,
    });

    const modelWithStructuredOutput = model.withStructuredOutput(
      aiaKoObjectionHandlingSchema,
    );

    const objectionHandlingData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (objectionHandlingData?.objectionHandling) {
      clampSectionScores(objectionHandlingData.objectionHandling);
      recalculateOverallScore(objectionHandlingData.objectionHandling);
      console.log(
        `[AIA-KO] Objection handling assessment score for session ${sessionId}: ${objectionHandlingData.objectionHandling.overallScore}/${objectionHandlingData.objectionHandling.maxScore}`,
      );

      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoObjectionHandling': JSON.stringify(
            objectionHandlingData.objectionHandling,
          ),
          'roleplay.feedback.aiaKoObjectionHandlingGenerating': false,
        },
      });
      console.log(
        `[AIA-KO] Objection handling assessment completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoObjectionHandlingGenerating': false,
        },
      });
      console.log(
        `[AIA-KO] Objection handling assessment returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[AIA-KO] Objection handling job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.aiaKoObjectionHandlingGenerating': false,
      },
    });
    throw error;
  }
}

/**
 * Generate AIA KO Needs Exploration Assessment
 * Evaluates 5 criteria: Transition(22), Benefit Framing(22), Control(22), New Needs(17), Health Exploration(17)
 * Total: 100 points
 */
export async function generateAiaKoNeedsExplorationJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[AIA-KO] Starting needs exploration assessment for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      throw new Error(`No roleplay found for session: ${sessionId}`);
    }

    // Do not re-generate if already present
    if (session.roleplay.feedback?.aiaKoNeedsExploration) {
      console.log(
        `[AIA-KO] Needs exploration assessment already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoNeedsExplorationGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.aiaKoNeedsExplorationGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content responseTimeSec');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[AIA-KO] Session too brief for needs exploration assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoNeedsExplorationGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    const salespersonName = (session.user as any)?.firstName || (session.user as any)?.name || 'TSR';
    const prompt = getAiaKoNeedsExplorationPrompt(
      session.persona?.name || 'Customer',
      languageCode,
      salespersonName,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = buildResponseTimeContext(messages);

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext,
    });

    const modelWithStructuredOutput = model.withStructuredOutput(
      aiaKoNeedsExplorationSchema,
    );

    const needsExplorationData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (needsExplorationData?.needsExploration) {
      clampSectionScores(needsExplorationData.needsExploration);
      recalculateOverallScore(needsExplorationData.needsExploration);
      console.log(
        `[AIA-KO] Needs exploration assessment score for session ${sessionId}: ${needsExplorationData.needsExploration.overallScore}/${needsExplorationData.needsExploration.maxScore}`,
      );

      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoNeedsExploration': JSON.stringify(
            needsExplorationData.needsExploration,
          ),
          'roleplay.feedback.aiaKoNeedsExplorationGenerating': false,
        },
      });
      console.log(
        `[AIA-KO] Needs exploration assessment completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoNeedsExplorationGenerating': false,
        },
      });
      console.log(
        `[AIA-KO] Needs exploration assessment returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[AIA-KO] Needs exploration job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.aiaKoNeedsExplorationGenerating': false,
      },
    });
    throw error;
  }
}

// ============================================================================
// PRODUCT PITCH SCENARIO ASSESSMENTS
// ============================================================================

// Prompt generators for Product Pitch scenario
function getAiaKoNeedsAnalysisPrompt(characterName: string, language?: string, userName?: string) {
  const languageName = getLanguageName(language) || language || 'English';
  let basePrompt = aiaKoNeedsAnalysisEvaluationPrompt.replaceAll(
    '{{characterName}}',
    characterName,
  ).replaceAll('{{userName}}', userName || 'TSR');

  const isEnglish = !language || language === 'en';
  if (isEnglish) {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in English. Every single word in the "why", "suggestion", "description", and "title" fields MUST be in English. Writing in Korean is STRICTLY FORBIDDEN even though examples in the prompt are in Korean — those are for tone reference only. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output must be written in English. The Korean examples in the feedback tone section are for TONE REFERENCE ONLY — translate the style, not the words.`;
  } else {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in ${languageName} (${language}). Every single word in the "why" and "suggestion" fields MUST be in ${languageName}. Writing in English is STRICTLY FORBIDDEN. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output — every string in "why" and "suggestion" — must be written in ${languageName}. Do NOT write any feedback in English.`;
  }

  const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate a needs analysis assessment based strictly on the salesperson's performance. Output ONLY valid JSON using the exact format specified.`;

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userTemplate],
  ]);
}

function getAiaKoProductPitchPrompt(characterName: string, language?: string, userName?: string) {
  const languageName = getLanguageName(language) || language || 'English';
  let basePrompt = aiaKoProductPitchEvaluationPrompt.replaceAll(
    '{{characterName}}',
    characterName,
  ).replaceAll('{{userName}}', userName || 'TSR');

  const isEnglish = !language || language === 'en';
  if (isEnglish) {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in English. Every single word in the "why", "suggestion", "description", and "title" fields MUST be in English. Writing in Korean is STRICTLY FORBIDDEN even though examples in the prompt are in Korean — those are for tone reference only. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output must be written in English. The Korean examples in the feedback tone section are for TONE REFERENCE ONLY — translate the style, not the words.`;
  } else {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in ${languageName} (${language}). Every single word in the "why" and "suggestion" fields MUST be in ${languageName}. Writing in English is STRICTLY FORBIDDEN. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output — every string in "why" and "suggestion" — must be written in ${languageName}. Do NOT write any feedback in English.`;
  }

  const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate a product pitch assessment based strictly on the salesperson's performance. Output ONLY valid JSON using the exact format specified.`;

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userTemplate],
  ]);
}

function getAiaKoProductPitchObjectionHandlingPrompt(
  characterName: string,
  language?: string,
  userName?: string,
) {
  const languageName = getLanguageName(language) || language || 'English';
  let basePrompt =
    aiaKoProductPitchObjectionHandlingEvaluationPrompt.replaceAll(
      '{{characterName}}',
      characterName,
    ).replaceAll('{{userName}}', userName || 'TSR');

  const isEnglish = !language || language === 'en';
  if (isEnglish) {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in English. Every single word in the "why", "suggestion", "description", and "title" fields MUST be in English. Writing in Korean is STRICTLY FORBIDDEN even though examples in the prompt are in Korean — those are for tone reference only. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output must be written in English. The Korean examples in the feedback tone section are for TONE REFERENCE ONLY — translate the style, not the words.`;
  } else {
    basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in ${languageName} (${language}). Every single word in the "why" and "suggestion" fields MUST be in ${languageName}. Writing in English is STRICTLY FORBIDDEN. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output — every string in "why" and "suggestion" — must be written in ${languageName}. Do NOT write any feedback in English.`;
  }

  const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate an objection handling assessment (during product pitch phase) based strictly on the salesperson's performance. Output ONLY valid JSON using the exact format specified.`;

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userTemplate],
  ]);
}

/**
 * Generate AIA KO Needs Analysis Assessment (Product Pitch Scenario)
 * Evaluates: Comprehensive probing of cancer risk, insurance coverage, and pre-existing conditions
 * Total: 34 points
 */
export async function generateAiaKoNeedsAnalysisJob(job: any): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[AIA-KO-PP] Starting needs analysis assessment for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      throw new Error(`No roleplay found for session: ${sessionId}`);
    }

    // Do not re-generate if already present
    if (session.roleplay.feedback?.aiaKoNeedsAnalysis) {
      console.log(
        `[AIA-KO-PP] Needs analysis assessment already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoNeedsAnalysisGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.aiaKoNeedsAnalysisGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content responseTimeSec');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[AIA-KO-PP] Session too brief for needs analysis assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoNeedsAnalysisGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    const salespersonName = (session.user as any)?.firstName || (session.user as any)?.name || 'TSR';
    const prompt = getAiaKoNeedsAnalysisPrompt(
      session.persona?.name || 'Customer',
      languageCode,
      salespersonName,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = buildResponseTimeContext(messages);

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext,
    });

    const modelWithStructuredOutput = model.withStructuredOutput(
      aiaKoNeedsAnalysisSchema,
    );

    const needsAnalysisData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (needsAnalysisData?.needsAnalysis) {
      clampSectionScores(needsAnalysisData.needsAnalysis);
      recalculateOverallScore(needsAnalysisData.needsAnalysis);
      console.log(
        `[AIA-KO-PP] Needs analysis assessment score for session ${sessionId}: ${needsAnalysisData.needsAnalysis.overallScore}/${needsAnalysisData.needsAnalysis.maxScore}`,
      );

      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoNeedsAnalysis': JSON.stringify(
            needsAnalysisData.needsAnalysis,
          ),
          'roleplay.feedback.aiaKoNeedsAnalysisGenerating': false,
        },
      });
      console.log(
        `[AIA-KO-PP] Needs analysis assessment completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoNeedsAnalysisGenerating': false,
        },
      });
      console.log(
        `[AIA-KO-PP] Needs analysis assessment returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[AIA-KO-PP] Needs analysis job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.aiaKoNeedsAnalysisGenerating': false,
      },
    });
    throw error;
  }
}

/**
 * Generate AIA KO Product Pitch Assessment (Product Pitch Scenario)
 * Evaluates: FAB method execution - Features, Advantages, Benefits
 * Total: 33 points
 */
export async function generateAiaKoProductPitchJob(job: any): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[AIA-KO-PP] Starting product pitch assessment for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      throw new Error(`No roleplay found for session: ${sessionId}`);
    }

    // Do not re-generate if already present
    if (session.roleplay.feedback?.aiaKoProductPitch) {
      console.log(
        `[AIA-KO-PP] Product pitch assessment already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoProductPitchGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.aiaKoProductPitchGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content responseTimeSec');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[AIA-KO-PP] Session too brief for product pitch assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoProductPitchGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    const salespersonName = (session.user as any)?.firstName || (session.user as any)?.name || 'TSR';
    const prompt = getAiaKoProductPitchPrompt(
      session.persona?.name || 'Customer',
      languageCode,
      salespersonName,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = buildResponseTimeContext(messages);

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext,
    });

    const modelWithStructuredOutput = model.withStructuredOutput(
      aiaKoProductPitchSchema,
    );

    const productPitchData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (productPitchData?.productPitch) {
      clampSectionScores(productPitchData.productPitch);
      recalculateOverallScore(productPitchData.productPitch);
      console.log(
        `[AIA-KO-PP] Product pitch assessment score for session ${sessionId}: ${productPitchData.productPitch.overallScore}/${productPitchData.productPitch.maxScore}`,
      );

      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoProductPitch': JSON.stringify(
            productPitchData.productPitch,
          ),
          'roleplay.feedback.aiaKoProductPitchGenerating': false,
        },
      });
      console.log(
        `[AIA-KO-PP] Product pitch assessment completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoProductPitchGenerating': false,
        },
      });
      console.log(
        `[AIA-KO-PP] Product pitch assessment returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[AIA-KO-PP] Product pitch job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.aiaKoProductPitchGenerating': false,
      },
    });
    throw error;
  }
}

/**
 * Generate AIA KO Product Pitch Objection Handling Assessment
 * Evaluates: Confident, empathetic objection handling with multiple persuasion attempts
 * Total: 33 points
 */
export async function generateAiaKoProductPitchObjectionHandlingJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[AIA-KO-PP] Starting product pitch objection handling assessment for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      throw new Error(`No roleplay found for session: ${sessionId}`);
    }

    // Do not re-generate if already present
    if (session.roleplay.feedback?.aiaKoProductPitchObjectionHandling) {
      console.log(
        `[AIA-KO-PP] Product pitch objection handling assessment already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: {
        'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': true,
      },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content responseTimeSec');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[AIA-KO-PP] Session too brief for product pitch objection handling assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    const salespersonName = (session.user as any)?.firstName || (session.user as any)?.name || 'TSR';
    const prompt = getAiaKoProductPitchObjectionHandlingPrompt(
      session.persona?.name || 'Customer',
      languageCode,
      salespersonName,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = buildResponseTimeContext(messages);

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext,
    });

    const modelWithStructuredOutput = model.withStructuredOutput(
      aiaKoProductPitchObjectionHandlingSchema,
    );

    const objectionHandlingData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (objectionHandlingData?.objectionHandling) {
      clampSectionScores(objectionHandlingData.objectionHandling);
      recalculateOverallScore(objectionHandlingData.objectionHandling);
      console.log(
        `[AIA-KO-PP] Product pitch objection handling assessment score for session ${sessionId}: ${objectionHandlingData.objectionHandling.overallScore}/${objectionHandlingData.objectionHandling.maxScore}`,
      );

      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoProductPitchObjectionHandling':
            JSON.stringify(objectionHandlingData.objectionHandling),
          'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': false,
        },
      });
      console.log(
        `[AIA-KO-PP] Product pitch objection handling assessment completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': false,
        },
      });
      console.log(
        `[AIA-KO-PP] Product pitch objection handling assessment returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[AIA-KO-PP] Product pitch objection handling job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': false,
      },
    });
    throw error;
  }
}

// ============================================================================
// END-TO-END OUTBOUND CALL SCENARIO ASSESSMENT
// ============================================================================

function getAiaKoE2EAssessmentPrompt(
  characterName: string,
  participantName: string,
  language?: string,
) {
  const languageName = getLanguageName(language) || language || 'English';
  let basePrompt = aiaKoE2EEvaluationPrompt
    .replaceAll('{{characterName}}', characterName)
    .replaceAll('{{participantName}}', participantName);

  if (language === 'ko') {
    const koTitles: Record<string, string> = {
      '"Opening"': '"도입"',
      '"Needs Analysis"': '"니즈 분석"',
      '"Product Pitch"': '"상품설명"',
      '"Objection Handling"': '"반론극복"',
      '"Closing"': '"클로징"',
      '"Other"': '"기타"',
      '"Professional Greeting"': '"전문적 인사"',
      '"Full Name Statement"': '"성명 소개"',
      '"Affiliation & Identification"': '"소속 및 신원 소개"',
      '"Customer Name Confirmation"': '"고객 성함 확인"',
      '"Call Purpose Explanation"': '"통화 목적 설명"',
      '"Tone, Manner & Flow"': '"말투, 태도 및 흐름"',
      '"Statistics & News-Based Need Stimulation"':
        '"통계·뉴스 기반 필요성 자극"',
      '"Age & Medical History-Based Risk Awareness"':
        '"연령·병력 기반 질병 위험 자극"',
      '"Empathy → Need Stimulation → Benefit Delivery"':
        '"공감하기 → 필요성 자극 → 상품 혜택 전달"',
      '"Buying Signal Identification and Closing Attempt"':
        '"니즈환기, 혜택 제시 및 클로징 시도"',
      '"Sales Cycle Consistency"': '"세일즈 사이클 유지"',
      '"Coverage Accuracy / Misrepresentation Check"': '"보장내용 오안내 여부"',
      '"3-Second Response"': '"3초 이내 즉각적인 반응"',
      '"Empathy Expressions"': '"공감 표현 사용"',
      '"Response Content Appropriateness"':
        '"반론에 대한 내용 및 대응의 적절성"',
      '"Persuasion Techniques Variety"': '"다양한 설득 화법 사용 여부"',
      '"Objection Persistence — 5+ Attempts"': '"5회 이상 반론 극복 여부"',
      '"Reading Buying Signals"': '"구매 신호 포착"',
      '"Closing Techniques"': '"클로징 기법 활용"',
      '"Closing Confidence"': '"클로징 자신감"',
      '"Voice Quality & Confidence"': '"음성 품질 및 자신감"',
      '"Confident Expressions & Emphasis"': '"확신에 찬 표현 및 강조"',
      '"No Unnecessary Questions"': '"불필요한 질문 여부"',
    };
    for (const [en, ko] of Object.entries(koTitles)) {
      basePrompt = basePrompt.replaceAll(en, ko);
    }
  }

  basePrompt = `[ABSOLUTE LANGUAGE REQUIREMENT]\nYou MUST write the ENTIRE response in ${languageName} (${language || 'en'}). Every single word in the "why" and "suggestion" fields MUST be in ${languageName}. Writing in any other language is STRICTLY FORBIDDEN. This is non-negotiable.\n\n${basePrompt}

[LANGUAGE - FINAL REMINDER]
CRITICAL: The entire assessment output — every string in "why", "suggestion", "title", and "description" — must be written in ${languageName}. Do NOT write any feedback in any other language. All feedback must be in ${languageName}.`;

  const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate an end-to-end outbound call assessment based strictly on the salesperson's performance. Output ONLY valid JSON using the exact format specified.`;

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userTemplate],
  ]);
}

/** Recalculate section scores from criteria scores, then weighted overall from sections */
function recalculateE2EScores(data: {
  overallScore: number;
  sections?: {
    score: number;
    maxScore: number;
    weight: number;
    criteria?: { score: number }[];
  }[];
}) {
  if (data.sections && data.sections.length > 0) {
    for (const section of data.sections) {
      if (section.criteria && section.criteria.length > 0) {
        section.score = section.criteria.reduce(
          (sum, c) => sum + (c.score || 0),
          0,
        );
      }
      // Sections with maxScore=99 (33+33+33) get bumped to 100 when fully scored
      if (section.maxScore === 99 && section.score === 99) {
        section.score = 100;
      }
    }
    data.overallScore = Math.round(
      data.sections.reduce(
        (sum, s) =>
          sum + ((s.score || 0) / (s.maxScore || 100)) * (s.weight || 0),
        0,
      ),
    );
  }
}

/**
 * Generate AIA KO End-To-End Assessment
 * Evaluates the full call: Opening(10) + Needs(15) + Pitch(20) + Objection(25) + Closing(15) + Other(15)
 * Total: 100 points
 */
export async function generateAiaKoE2EAssessmentJob(job: any): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[AIA-KO-E2E] Starting E2E assessment for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      throw new Error(`No roleplay found for session: ${sessionId}`);
    }

    // Do not re-generate if already present
    if (session.roleplay.feedback?.aiaKoE2EAssessment) {
      console.log(
        `[AIA-KO-E2E] E2E assessment already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoE2EAssessmentGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.aiaKoE2EAssessmentGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content responseTimeSec');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[AIA-KO-E2E] Session too brief for E2E assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoE2EAssessmentGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    const participantName =
      (session.user as any)?.name ||
      (session.user as any)?.firstName ||
      '참가자';
    const prompt = getAiaKoE2EAssessmentPrompt(
      session.persona?.name || 'Customer',
      participantName,
      languageCode,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = buildResponseTimeContext(messages);

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext,
    });

    const modelWithStructuredOutput = model.withStructuredOutput(
      aiaKoE2EAssessmentSchema,
    );

    const e2eData = await modelWithStructuredOutput.invoke(formattedPrompt);

    if (e2eData?.e2eAssessment) {
      recalculateE2EScores(e2eData.e2eAssessment);
      console.log(
        `[AIA-KO-E2E] E2E assessment score for session ${sessionId}: ${e2eData.e2eAssessment.overallScore}/${e2eData.e2eAssessment.maxScore}`,
      );

      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoE2EAssessment': JSON.stringify(
            e2eData.e2eAssessment,
          ),
          'roleplay.feedback.aiaKoE2EAssessmentGenerating': false,
        },
      });
      console.log(
        `[AIA-KO-E2E] E2E assessment completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.aiaKoE2EAssessmentGenerating': false,
        },
      });
      console.log(
        `[AIA-KO-E2E] E2E assessment returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[AIA-KO-E2E] E2E assessment job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.aiaKoE2EAssessmentGenerating': false,
      },
    });
    throw error;
  }
}
