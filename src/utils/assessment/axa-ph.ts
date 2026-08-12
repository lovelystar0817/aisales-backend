import { ChatOpenAI } from '@langchain/openai';
import { DEFAULT_FRAMEWORK } from '../../frameworks/common.js';
import { SalesFramework } from '../../frameworks/types.js';
import { Message } from '../../models/Message.js';
import { SalesProductDocument } from '../../models/SalesProduct.js';
import { AssessmentType, SalesSession } from '../../models/SalesSession.js';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../constants.js';
import { isSessionTooBrief } from '../session.js';
import {
  getAxaPhRecruitmentSoftSkillsPrompt,
  axaPhRecruitmentSoftSkillsSchema,
} from '../../prompts/axa-ph-recruitment-soft-skills.js';
import {
  getAxaPhRecruitmentKnowledgeSkillsPrompt,
  axaPhRecruitmentKnowledgeSkillsSchema,
} from '../../prompts/axa-ph-recruitment-knowledge-skills.js';
import { ScorecardSection } from '../../models/Scorecard.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

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

export async function generateAxaPhSoftSkillsJob(job: any): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[AXA-PH] Starting soft skills generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.axaPhSoftSkills) {
      console.log(
        `[AXA-PH] Soft skills already exist for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.axaPhSoftSkillsGenerating': false },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.axaPhSoftSkillsGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[AXA-PH] Session too brief for soft skills assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.axaPhSoftSkillsGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });
    const prompt = getAxaPhRecruitmentSoftSkillsPrompt(
      session.persona?.name || 'Prospect',
      languageCode,
    );

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
    const modelWithStructuredOutput = model.withStructuredOutput(
      axaPhRecruitmentSoftSkillsSchema,
    );

    const softSkillsData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (softSkillsData?.axaPhSoftSkills) {
      // Calculate overall score as sum of section scores
      let softSkillsWithOverallScore = softSkillsData.axaPhSoftSkills;

      if (
        softSkillsData.axaPhSoftSkills.sections &&
        Array.isArray(softSkillsData.axaPhSoftSkills.sections)
      ) {
        const calculatedScore = softSkillsData.axaPhSoftSkills.sections.reduce(
          (sum: number, section: any) => {
            return sum + (section.score || 0);
          },
          0,
        );

        console.log(
          `[AXA-PH] Soft skills score comparison for session ${sessionId}: LLM-generated=${softSkillsData.axaPhSoftSkills.overallScore}, Calculated=${calculatedScore}`,
        );

        softSkillsWithOverallScore = {
          ...softSkillsData.axaPhSoftSkills,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.axaPhSoftSkills': JSON.stringify(
            softSkillsWithOverallScore,
          ),
          'roleplay.feedback.axaPhSoftSkillsGenerating': false,
        },
      });
      console.log(
        `[AXA-PH] Soft skills generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.axaPhSoftSkillsGenerating': false,
        },
      });
      console.log(
        `[AXA-PH] Soft skills generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[AXA-PH] Soft skills job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.axaPhSoftSkillsGenerating': false },
    });
    throw error;
  }
}

export async function generateAxaPhKnowledgeSkillsJob(job: any): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[AXA-PH] Starting knowledge skills generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.axaPhKnowledgeSkills) {
      console.log(
        `[AXA-PH] Knowledge skills already exist for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.axaPhKnowledgeSkillsGenerating': false },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.axaPhKnowledgeSkillsGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[AXA-PH] Session too brief for knowledge skills assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.axaPhKnowledgeSkillsGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });
    const prompt = getAxaPhRecruitmentKnowledgeSkillsPrompt(
      session.persona?.name || 'Prospect',
      languageCode,
    );

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
    const modelWithStructuredOutput = model.withStructuredOutput(
      axaPhRecruitmentKnowledgeSkillsSchema,
    );

    const knowledgeSkillsData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (knowledgeSkillsData?.axaPhKnowledgeSkills) {
      // Calculate overall score as sum of section scores
      let knowledgeSkillsWithOverallScore =
        knowledgeSkillsData.axaPhKnowledgeSkills;

      if (
        knowledgeSkillsData.axaPhKnowledgeSkills.sections &&
        Array.isArray(knowledgeSkillsData.axaPhKnowledgeSkills.sections)
      ) {
        const calculatedScore =
          knowledgeSkillsData.axaPhKnowledgeSkills.sections.reduce(
            (sum: number, section: any) => {
              return sum + (section.score || 0);
            },
            0,
          );

        console.log(
          `[AXA-PH] Knowledge skills score comparison for session ${sessionId}: LLM-generated=${knowledgeSkillsData.axaPhKnowledgeSkills.overallScore}, Calculated=${calculatedScore}`,
        );

        knowledgeSkillsWithOverallScore = {
          ...knowledgeSkillsData.axaPhKnowledgeSkills,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.axaPhKnowledgeSkills': JSON.stringify(
            knowledgeSkillsWithOverallScore,
          ),
          'roleplay.feedback.axaPhKnowledgeSkillsGenerating': false,
        },
      });
      console.log(
        `[AXA-PH] Knowledge skills generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.axaPhKnowledgeSkillsGenerating': false,
        },
      });
      console.log(
        `[AXA-PH] Knowledge skills generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[AXA-PH] Knowledge skills job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.axaPhKnowledgeSkillsGenerating': false },
    });
    throw error;
  }
}
