import { ChatOpenAI } from '@langchain/openai';
import { DEFAULT_FRAMEWORK } from '../../frameworks/common.js';
import { Message } from '../../models/Message.js';
import { SalesSession } from '../../models/SalesSession.js';
import {
  getPrudentialTechnicalKnowledgeSchema,
  prudentialColdCallSalesTechniqueSchema,
  prudentialProductPositioningSchema,
} from '../../prompts/prudential/prudential-assessment-schema.js';
import { getPrudentialSalesTechniquePrompt } from '../../prompts/prudential/prudential-sales-technique.js';
import { getPrudentialTechnicalKnowledgePrompt } from '../../prompts/prudential/prudential-technical-knowledge.js';
import {
  OPENAI_MODEL_GPT_4_1,
  OPENAI_MODEL_GPT_4_1_MINI,
} from '../constants.js';
import { triggerStandingCalculationIfReady } from '../prudential-standing.js';
import { isSessionTooBrief } from '../session.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

export async function generatePrudentialSalesTechniqueJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Prudential] Starting sales technique generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.salesTechniques) {
      console.log(
        `[Prudential] Sales technique already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.salesTechniquesGenerating': false },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.salesTechniquesGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[Prudential] Session too brief for sales technique assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.salesTechniquesGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const prompt = getPrudentialSalesTechniquePrompt(
      session.callType,
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

    const schema =
      session.callType === 'cold-call'
        ? prudentialColdCallSalesTechniqueSchema
        : prudentialProductPositioningSchema;

    const assessment = await model
      .withStructuredOutput(schema)
      .invoke(formattedPrompt);

    if (assessment) {
      // Calculate overall score as sum of section scores if sections exist
      let assessmentWithOverallScore: any = assessment;

      if (
        'sections' in assessment &&
        Array.isArray((assessment as any).sections)
      ) {
        const calculatedScore = (assessment as any).sections.reduce(
          (sum: number, section: any) => {
            return sum + (section.score || 0);
          },
          0,
        );

        console.log(
          `[Prudential] Score comparison for session ${sessionId}: LLM-generated=${(assessment as any).overallScore}, Calculated=${calculatedScore}`,
        );

        assessmentWithOverallScore = {
          ...assessment,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.salesTechniques': JSON.stringify(
            assessmentWithOverallScore,
          ),
          'roleplay.feedback.salesTechniquesGenerating': false,
        },
      });
      console.log(
        `[Prudential] Assessment generation completed for session: ${sessionId}`,
      );
      await triggerStandingCalculationIfReady(sessionId);
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.salesTechniquesGenerating': false,
        },
      });
      console.log(
        `[Prudential] Assessment generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Prudential] Assessment job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.salesTechniquesGenerating': false },
    });
    throw error;
  }
}

export async function generatePrudentialTechnicalKnowledgeJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Prudential] Starting technical knowledge generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.technicalKnowledge) {
      console.log(
        `[Prudential] Technical knowledge already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.technicalKnowledgeGenerating': false },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.technicalKnowledgeGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[Prudential] Session too brief for technical knowledge assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.technicalKnowledgeGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });
    const prompt = getPrudentialTechnicalKnowledgePrompt(
      session.callType,
      session.persona?.name || 'Prospect',
      languageCode,
      session.product?.friendlyId,
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
      productInfo: session.product?.knowledgePrompt || '',
      transcript,
      extraContext: '',
    });

    // Get product-specific schema based on the product friendlyId
    const productSpecificSchema = getPrudentialTechnicalKnowledgeSchema(
      session.product!.friendlyId,
    );

    const assessment = await model
      .withStructuredOutput(productSpecificSchema)
      .invoke(formattedPrompt);

    if (assessment) {
      // Calculate overall score as sum of section scores if sections exist
      let assessmentWithOverallScore: any = assessment;

      if (
        'sections' in assessment &&
        Array.isArray((assessment as any).sections)
      ) {
        const calculatedScore = (assessment as any).sections.reduce(
          (sum: number, section: any) => {
            return sum + (section.score || 0);
          },
          0,
        );

        console.log(
          `[Prudential] Technical knowledge score comparison for session ${sessionId}: LLM-generated=${(assessment as any).overallScore}, Calculated=${calculatedScore}`,
        );

        assessmentWithOverallScore = {
          ...assessment,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.technicalKnowledge': JSON.stringify(
            assessmentWithOverallScore,
          ),
          'roleplay.feedback.technicalKnowledgeGenerating': false,
        },
      });
      console.log(
        `[Prudential] Assessment generation completed for session: ${sessionId}`,
      );

      await triggerStandingCalculationIfReady(sessionId);
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.technicalKnowledgeGenerating': false,
        },
      });
      console.log(
        `[Prudential] Assessment generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Prudential] Assessment job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.technicalKnowledgeGenerating': false },
    });
    throw error;
  }
}
