import { ChatOpenAI } from '@langchain/openai';
import { LangChainCallbackHandler } from '@posthog/ai';
import { DEFAULT_FRAMEWORK } from '../../frameworks/common.js';
import { SalesFramework } from '../../frameworks/types.js';
import { callbackHandler } from '../../libs/langchain.js';
import { Message } from '../../models/Message.js';
import { SalesProductDocument } from '../../models/SalesProduct.js';
import { AssessmentType, SalesSession } from '../../models/SalesSession.js';
import { getProductKnowledgePrompt } from '../../prompts/product-knowledge.js';
import { getPrudentialRoleplayOverviewPrompt } from '../../prompts/prudential/prudential-roleplay-overview.js';
import { getRoleplayOverviewPrompt } from '../../prompts/roleplay-overview.js';
import { getSalesTechniquePrompt } from '../../prompts/sales-technique.js';
import {
  DEFAULT_OPENAI_MODEL,
  OPENAI_MODEL_GPT_4_1,
  OPENAI_MODEL_GPT_4_1_MINI,
} from '../constants.js';
import { HttpError } from '../errors.js';
import { parseJsonSafely, parseResponse } from '../json.js';
import { getLanguageName } from '../languages.js';
import { isSessionTooBrief } from '../session.js';
import {
  getKtAxaRecruitmentSoftSkillsPrompt,
  ktAxaRecruitmentSoftSkillsSchema,
} from '../../prompts/kt-axa-recruitment-soft-skills.js';
import {
  getKtAxaRecruitmentKnowledgeSkillsPrompt,
  ktAxaRecruitmentKnowledgeSkillsSchema,
} from '../../prompts/kt-axa-recruitment-knowledge-skills.js';
import {
  getKtAxaFnaKnowledgeSkillsPrompt,
  ktAxaFnaKnowledgeSkillsSchema,
} from '../../prompts/kt-axa-fna-knowledge-skills.js';
import {
  getKtAxaFnaSoftSkillsPrompt,
  ktAxaFnaSoftSkillsSchema,
} from '../../prompts/kt-axa-fna-soft-skills.js';
import {
  getKtAxaFnaProductKnowledgePrompt,
  ktAxaFnaProductKnowledgeSchema,
} from '../../prompts/kt-axa-fna-product-knowledge.js';
import {
  getKtAxaWealthplusSoftSkillsPrompt,
  ktAxaWealthplusSoftSkillsSchema,
} from '../../prompts/kt-axa-wealthplus-soft-skills.js';
import {
  getKtAxaWealthplusKnowledgeSkillsPrompt,
  ktAxaWealthplusKnowledgeSkillsSchema,
} from '../../prompts/kt-axa-wealthplus-knowledge-skills.js';
import {
  getKtAxaWealthplusProductKnowledgePrompt,
  ktAxaWealthplusProductKnowledgeSchema,
} from '../../prompts/kt-axa-wealthplus-product-knowledge.js';
import { ScenarioDocument } from '../../models/Scenario.js';
import { ScorecardDocument, ScorecardSection } from '../../models/Scorecard.js';
import { parseFeedbackScores } from '../manage/shared.js';
import { triggerSCORMCompletionIfReady } from './regular.js';
import z from 'zod';

export interface SalesFeedbackInput {
  callType: string;
  scenario: string;
  objectives: string[];
  messages: any[];
  characterName: string;
  framework: SalesFramework;
  companyId?: string;
  sessionId?: string;
  languageCode?: string;
  productInfo?: string;
  product?: SalesProductDocument;
  assessmentType?: AssessmentType;
  scorecard?: ScorecardSection;
}

export async function generateKtAxaSoftSkillsJob(job: any): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[KT-AXA] Starting soft skills generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.ktAxaSoftSkills) {
      console.log(
        `[KT-AXA] Soft skills already exist for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.ktAxaSoftSkillsGenerating': false },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.ktAxaSoftSkillsGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[KT-AXA] Session too brief for soft skills assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.ktAxaSoftSkillsGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });

    // Determine which prompt and schema to use based on assessment type
    const isFna = session.assessmentType === 'kt-axa-fna';
    const isWealthplus = session.assessmentType === 'kt-axa-wealthplus';

    let prompt;
    let schema;

    if (isWealthplus) {
      prompt = getKtAxaWealthplusSoftSkillsPrompt(
        session.persona?.name || 'Prospect',
        languageCode,
      );
      schema = ktAxaWealthplusSoftSkillsSchema;
    } else if (isFna) {
      prompt = getKtAxaFnaSoftSkillsPrompt(
        session.persona?.name || 'Prospect',
        languageCode,
      );
      schema = ktAxaFnaSoftSkillsSchema;
    } else {
      prompt = getKtAxaRecruitmentSoftSkillsPrompt(
        session.persona?.name || 'Prospect',
        languageCode,
      );
      schema = ktAxaRecruitmentSoftSkillsSchema;
    }

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext: '',
    });

    // Use structured output with Zod schema
    const modelWithStructuredOutput = model.withStructuredOutput(schema);

    const softSkillsData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (softSkillsData?.ktAxaSoftSkills) {
      // Calculate overall score as sum of section scores
      let softSkillsWithOverallScore = softSkillsData.ktAxaSoftSkills;

      if (
        softSkillsData.ktAxaSoftSkills.sections &&
        Array.isArray(softSkillsData.ktAxaSoftSkills.sections)
      ) {
        const calculatedScore = softSkillsData.ktAxaSoftSkills.sections.reduce(
          (sum: number, section: any) => {
            return sum + (section.score || 0);
          },
          0,
        );

        console.log(
          `[KT-AXA] Soft skills score comparison for session ${sessionId}: LLM-generated=${softSkillsData.ktAxaSoftSkills.overallScore}, Calculated=${calculatedScore}`,
        );

        softSkillsWithOverallScore = {
          ...softSkillsData.ktAxaSoftSkills,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.ktAxaSoftSkills': JSON.stringify(
            softSkillsWithOverallScore,
          ),
          'roleplay.feedback.ktAxaSoftSkillsGenerating': false,
        },
      });
      console.log(
        `[KT-AXA] Soft skills generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.ktAxaSoftSkillsGenerating': false,
        },
      });
      console.log(
        `[KT-AXA] Soft skills generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[KT-AXA] Soft skills job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.ktAxaSoftSkillsGenerating': false },
    });
    throw error;
  }
}

export async function generateKtAxaKnowledgeSkillsJob(job: any): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[KT-AXA] Starting knowledge skills generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.ktAxaKnowledgeSkills) {
      console.log(
        `[KT-AXA] Knowledge skills already exist for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': false },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[KT-AXA] Session too brief for knowledge skills assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });

    // Use different prompts based on assessment type
    const isFna = session.assessmentType === 'kt-axa-fna';
    const isWealthplus = session.assessmentType === 'kt-axa-wealthplus';

    let prompt;
    let schema;

    if (isWealthplus) {
      prompt = getKtAxaWealthplusKnowledgeSkillsPrompt(
        session.persona?.name || 'Prospect',
        languageCode,
      );
      schema = ktAxaWealthplusKnowledgeSkillsSchema;
    } else if (isFna) {
      prompt = getKtAxaFnaKnowledgeSkillsPrompt(
        session.persona?.name || 'Prospect',
        languageCode,
      );
      schema = ktAxaFnaKnowledgeSkillsSchema;
    } else {
      prompt = getKtAxaRecruitmentKnowledgeSkillsPrompt(
        session.persona?.name || 'Prospect',
        languageCode,
      );
      schema = ktAxaRecruitmentKnowledgeSkillsSchema;
    }

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext: '',
    });

    // Use structured output with Zod schema
    const modelWithStructuredOutput = model.withStructuredOutput(schema);

    const knowledgeSkillsData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (knowledgeSkillsData?.ktAxaKnowledgeSkills) {
      // Calculate overall score as sum of section scores
      let knowledgeSkillsWithOverallScore =
        knowledgeSkillsData.ktAxaKnowledgeSkills;

      if (
        knowledgeSkillsData.ktAxaKnowledgeSkills.sections &&
        Array.isArray(knowledgeSkillsData.ktAxaKnowledgeSkills.sections)
      ) {
        const calculatedScore =
          knowledgeSkillsData.ktAxaKnowledgeSkills.sections.reduce(
            (sum: number, section: any) => {
              return sum + (section.score || 0);
            },
            0,
          );

        console.log(
          `[KT-AXA] Knowledge skills score comparison for session ${sessionId}: LLM-generated=${knowledgeSkillsData.ktAxaKnowledgeSkills.overallScore}, Calculated=${calculatedScore}`,
        );

        knowledgeSkillsWithOverallScore = {
          ...knowledgeSkillsData.ktAxaKnowledgeSkills,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.ktAxaKnowledgeSkills': JSON.stringify(
            knowledgeSkillsWithOverallScore,
          ),
          'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': false,
        },
      });
      console.log(
        `[KT-AXA] Knowledge skills generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': false,
        },
      });
      console.log(
        `[KT-AXA] Knowledge skills generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[KT-AXA] Knowledge skills job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': false },
    });
    throw error;
  }
}

export async function generateKtAxaProductKnowledgeJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[KT-AXA] Starting product knowledge generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.ktAxaProductKnowledge) {
      console.log(
        `[KT-AXA] Product knowledge already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.ktAxaProductKnowledgeGenerating': false },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.ktAxaProductKnowledgeGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[KT-AXA] Session too brief for product knowledge assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.ktAxaProductKnowledgeGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });

    // Determine which prompt and schema to use based on assessment type
    const isFna = session.assessmentType === 'kt-axa-fna';
    const isWealthplus = session.assessmentType === 'kt-axa-wealthplus';

    let prompt;
    let schema: z.ZodSchema;
    let dataKey: 'ktAxaWealthplusProductKnowledge' | 'ktAxaFnaProductKnowledge';

    if (isWealthplus) {
      prompt = getKtAxaWealthplusProductKnowledgePrompt(
        session.persona?.name || 'Prospect',
        languageCode,
      );
      schema = ktAxaWealthplusProductKnowledgeSchema;
      dataKey = 'ktAxaWealthplusProductKnowledge';
    } else if (isFna) {
      prompt = getKtAxaFnaProductKnowledgePrompt(
        session.persona?.name || 'Prospect',
        languageCode,
      );
      schema = ktAxaFnaProductKnowledgeSchema;
      dataKey = 'ktAxaFnaProductKnowledge';
    } else {
      console.log(
        `[KT-AXA] Product knowledge not applicable for assessment type: ${session.assessmentType}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.ktAxaProductKnowledgeGenerating': false },
      });
      return;
    }

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      extraContext: '',
    });

    const modelWithStructuredOutput = model.withStructuredOutput(schema);

    const productKnowledgeData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (productKnowledgeData?.[dataKey]) {
      // Calculate overall score from sections
      let productKnowledgeWithOverallScore = productKnowledgeData[dataKey];

      if (
        productKnowledgeData[dataKey].sections &&
        Array.isArray(productKnowledgeData[dataKey].sections)
      ) {
        const calculatedScore = productKnowledgeData[dataKey].sections.reduce(
          (sum: number, section: any) => {
            return sum + (section.score || 0);
          },
          0,
        );

        console.log(
          `[KT-AXA] Product knowledge score for session ${sessionId}: ${calculatedScore}`,
        );

        productKnowledgeWithOverallScore = {
          ...productKnowledgeData[dataKey],
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.ktAxaProductKnowledge': JSON.stringify(
            productKnowledgeWithOverallScore,
          ),
          'roleplay.feedback.ktAxaProductKnowledgeGenerating': false,
        },
      });
      console.log(
        `[KT-AXA] Product knowledge generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.ktAxaProductKnowledgeGenerating': false,
        },
      });
      console.log(
        `[KT-AXA] Product knowledge generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[KT-AXA] Product knowledge job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.ktAxaProductKnowledgeGenerating': false },
    });
    throw error;
  }
}
