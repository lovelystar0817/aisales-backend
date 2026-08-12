import { ChatOpenAI } from '@langchain/openai';
import { DEFAULT_FRAMEWORK } from '../../frameworks/common.js';
import { Message } from '../../models/Message.js';
import { SalesSession } from '../../models/SalesSession.js';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../constants.js';
import { isSessionTooBrief } from '../session.js';
import {
  getMsigTravelEasySoftSkillsPrompt,
  msigTravelEasySoftSkillsSchema,
} from '../../prompts/msig-travel-easy-soft-skills.js';
import {
  getMsigTravelEasyKnowledgeSkillsPrompt,
  msigTravelEasyKnowledgeSkillsSchema,
} from '../../prompts/msig-travel-easy-knowledge-skills.js';
import {
  getMsigTravelEasyProductKnowledgePrompt,
  msigTravelEasyProductKnowledgeSchema,
} from '../../prompts/msig-travel-easy-product-knowledge.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

/**
 * Generate MSIG TravelEasy Soft Skills Assessment
 * Evaluates: Communication Skills, Relationship Building, Adaptability, Customer Orientation
 * Total: 30 points (4 sections × 7.5 points each)
 */
export async function generateMsigTravelEasySoftSkillsJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[MSIG-TravelEasy] Starting soft skills generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.msigTravelEasySoftSkills) {
      console.log(
        `[MSIG-TravelEasy] Soft skills already exist for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasySoftSkillsGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.msigTravelEasySoftSkillsGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[MSIG-TravelEasy] Session too brief for soft skills assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasySoftSkillsGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });

    const prompt = getMsigTravelEasySoftSkillsPrompt(
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
      msigTravelEasySoftSkillsSchema,
    );

    const softSkillsData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (softSkillsData?.msigTravelEasySoftSkills) {
      // Calculate overall score as sum of section scores
      let softSkillsWithOverallScore = softSkillsData.msigTravelEasySoftSkills;

      if (
        softSkillsData.msigTravelEasySoftSkills.sections &&
        Array.isArray(softSkillsData.msigTravelEasySoftSkills.sections)
      ) {
        const calculatedScore =
          softSkillsData.msigTravelEasySoftSkills.sections.reduce(
            (sum: number, section: any) => {
              return sum + (section.score || 0);
            },
            0,
          );

        console.log(
          `[MSIG-TravelEasy] Soft skills score comparison for session ${sessionId}: LLM-generated=${softSkillsData.msigTravelEasySoftSkills.overallScore}, Calculated=${calculatedScore}`,
        );

        softSkillsWithOverallScore = {
          ...softSkillsData.msigTravelEasySoftSkills,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasySoftSkills': JSON.stringify(
            softSkillsWithOverallScore,
          ),
          'roleplay.feedback.msigTravelEasySoftSkillsGenerating': false,
        },
      });
      console.log(
        `[MSIG-TravelEasy] Soft skills generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasySoftSkillsGenerating': false,
        },
      });
      console.log(
        `[MSIG-TravelEasy] Soft skills generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[MSIG-TravelEasy] Soft skills job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.msigTravelEasySoftSkillsGenerating': false,
      },
    });
    throw error;
  }
}

/**
 * Generate MSIG TravelEasy Knowledge Skills Assessment
 * Evaluates: Fact Finding, Problem-Solving, Sales & Negotiation Skills
 * Total: 30 points (3 sections × 10 points each)
 */
export async function generateMsigTravelEasyKnowledgeSkillsJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[MSIG-TravelEasy] Starting knowledge skills generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.msigTravelEasyKnowledgeSkills) {
      console.log(
        `[MSIG-TravelEasy] Knowledge skills already exist for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: {
        'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': true,
      },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[MSIG-TravelEasy] Session too brief for knowledge skills assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });

    const prompt = getMsigTravelEasyKnowledgeSkillsPrompt(
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
      msigTravelEasyKnowledgeSkillsSchema,
    );

    const knowledgeSkillsData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (knowledgeSkillsData?.msigTravelEasyKnowledgeSkills) {
      // Calculate overall score as sum of section scores
      let knowledgeSkillsWithOverallScore =
        knowledgeSkillsData.msigTravelEasyKnowledgeSkills;

      if (
        knowledgeSkillsData.msigTravelEasyKnowledgeSkills.sections &&
        Array.isArray(
          knowledgeSkillsData.msigTravelEasyKnowledgeSkills.sections,
        )
      ) {
        const calculatedScore =
          knowledgeSkillsData.msigTravelEasyKnowledgeSkills.sections.reduce(
            (sum: number, section: any) => {
              return sum + (section.score || 0);
            },
            0,
          );

        console.log(
          `[MSIG-TravelEasy] Knowledge skills score comparison for session ${sessionId}: LLM-generated=${knowledgeSkillsData.msigTravelEasyKnowledgeSkills.overallScore}, Calculated=${calculatedScore}`,
        );

        knowledgeSkillsWithOverallScore = {
          ...knowledgeSkillsData.msigTravelEasyKnowledgeSkills,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasyKnowledgeSkills': JSON.stringify(
            knowledgeSkillsWithOverallScore,
          ),
          'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': false,
        },
      });
      console.log(
        `[MSIG-TravelEasy] Knowledge skills generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': false,
        },
      });
      console.log(
        `[MSIG-TravelEasy] Knowledge skills generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[MSIG-TravelEasy] Knowledge skills job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': false,
      },
    });
    throw error;
  }
}

/**
 * Generate MSIG TravelEasy Product Knowledge Assessment
 * Evaluates: Product Pitch (understanding of TravelEasy features and benefits)
 * Total: 40 points (1 section × 40 points)
 */
export async function generateMsigTravelEasyProductKnowledgeJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[MSIG-TravelEasy] Starting product knowledge generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.msigTravelEasyProductKnowledge) {
      console.log(
        `[MSIG-TravelEasy] Product knowledge already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: {
        'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': true,
      },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[MSIG-TravelEasy] Session too brief for product knowledge assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });

    const prompt = getMsigTravelEasyProductKnowledgePrompt(
      session.persona?.name || 'Prospect',
      languageCode,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    // Get product info for context
    const productInfo = session.product
      ? JSON.stringify({
          name: session.product.name,
          keyFeatures: session.product.keyFeatures,
          evaluationFocus: session.product.evaluationFocus,
        })
      : '';

    const formattedPrompt = await prompt.format({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives?.join('\n') || '',
      framework,
      transcript,
      productInfo,
    });

    // Use structured output with Zod schema
    const modelWithStructuredOutput = model.withStructuredOutput(
      msigTravelEasyProductKnowledgeSchema,
    );

    const productKnowledgeData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (productKnowledgeData?.msigTravelEasyProductKnowledge) {
      // Calculate overall score as sum of section scores
      let productKnowledgeWithOverallScore =
        productKnowledgeData.msigTravelEasyProductKnowledge;

      if (
        productKnowledgeData.msigTravelEasyProductKnowledge.sections &&
        Array.isArray(
          productKnowledgeData.msigTravelEasyProductKnowledge.sections,
        )
      ) {
        const calculatedScore =
          productKnowledgeData.msigTravelEasyProductKnowledge.sections.reduce(
            (sum: number, section: any) => {
              return sum + (section.score || 0);
            },
            0,
          );

        console.log(
          `[MSIG-TravelEasy] Product knowledge score comparison for session ${sessionId}: LLM-generated=${productKnowledgeData.msigTravelEasyProductKnowledge.overallScore}, Calculated=${calculatedScore}`,
        );

        productKnowledgeWithOverallScore = {
          ...productKnowledgeData.msigTravelEasyProductKnowledge,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasyProductKnowledge': JSON.stringify(
            productKnowledgeWithOverallScore,
          ),
          'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': false,
        },
      });
      console.log(
        `[MSIG-TravelEasy] Product knowledge generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': false,
        },
      });
      console.log(
        `[MSIG-TravelEasy] Product knowledge generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[MSIG-TravelEasy] Product knowledge job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': false,
      },
    });
    throw error;
  }
}
