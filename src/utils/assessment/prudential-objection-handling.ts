import { ChatOpenAI } from '@langchain/openai';
import { Message } from '../../models/Message.js';
import { SalesSession } from '../../models/SalesSession.js';
import {
  getPrudentialOHSalesTechniquePrompt,
  prudentialOHSalesTechniqueSchema,
} from '../../prompts/prudential/prudential-oh-sales-technique-prompt.js';
import {
  getPrudentialOHObjectionHandlingPrompt,
  prudentialOHObjectionHandlingSchema,
} from '../../prompts/prudential/prudential-oh-objection-handling-prompt.js';
import { OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { triggerStandingCalculationIfReady } from '../prudential-standing.js';
import { isSessionTooBrief } from '../session.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

/**
 * Generate the 3F Sales Technique assessment for Prudential Objection Handling
 */
export async function generatePrudentialOHSalesTechniqueJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Prudential OH] Starting 3F Sales Technique generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.prudentialOHSalesTechnique) {
      console.log(
        `[Prudential OH] Sales Technique already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialOHSalesTechniqueGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.prudentialOHSalesTechniqueGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[Prudential OH] Session too brief for Sales Technique assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialOHSalesTechniqueGenerating': false,
        },
      });
      return;
    }

    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const characterName = session.persona?.name || 'Customer';
    const prompt = getPrudentialOHSalesTechniquePrompt(
      characterName,
      languageCode,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      transcript,
    });

    const data = await model
      .withStructuredOutput(prudentialOHSalesTechniqueSchema)
      .invoke(formattedPrompt);

    if (data?.salesTechnique) {
      // Recalculate overall score from section scores to ensure accuracy
      const calculatedScore = data.salesTechnique.sections.reduce(
        (sum, section) => sum + section.score,
        0,
      );

      console.log(
        `[Prudential OH] Sales Technique score comparison for session ${sessionId}: ` +
          `LLM=${data.salesTechnique.overallScore} Calculated=${calculatedScore}`,
      );

      const salesTechniqueWithScore = {
        ...data.salesTechnique,
        overallScore: calculatedScore,
      };

      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialOHSalesTechnique': JSON.stringify(
            salesTechniqueWithScore,
          ),
          'roleplay.feedback.prudentialOHSalesTechniqueGenerating': false,
        },
      });

      console.log(
        `[Prudential OH] Sales Technique generation completed for session: ${sessionId}`,
      );

      await triggerStandingCalculationIfReady(sessionId);
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialOHSalesTechniqueGenerating': false,
        },
      });
      console.log(
        `[Prudential OH] Sales Technique generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Prudential OH] Sales Technique job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.prudentialOHSalesTechniqueGenerating': false },
    });
    throw error;
  }
}

/**
 * Generate the LAPR Objection Handling assessment for Prudential Objection Handling
 */
export async function generatePrudentialOHObjectionHandlingJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Prudential OH] Starting LAPR Objection Handling generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.prudentialOHObjectionHandling) {
      console.log(
        `[Prudential OH] Objection Handling already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialOHObjectionHandlingGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: {
        'roleplay.feedback.prudentialOHObjectionHandlingGenerating': true,
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
        `[Prudential OH] Session too brief for Objection Handling assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialOHObjectionHandlingGenerating': false,
        },
      });
      return;
    }

    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const characterName = session.persona?.name || 'Customer';
    const prompt = getPrudentialOHObjectionHandlingPrompt(
      characterName,
      languageCode,
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      transcript,
    });

    const data = await model
      .withStructuredOutput(prudentialOHObjectionHandlingSchema)
      .invoke(formattedPrompt);

    if (data?.objectionHandling) {
      // Recalculate overall score from section scores to ensure accuracy
      const calculatedScore = data.objectionHandling.sections.reduce(
        (sum, section) => sum + section.score,
        0,
      );

      console.log(
        `[Prudential OH] Objection Handling score comparison for session ${sessionId}: ` +
          `LLM=${data.objectionHandling.overallScore} Calculated=${calculatedScore}`,
      );

      const objectionHandlingWithScore = {
        ...data.objectionHandling,
        overallScore: calculatedScore,
      };

      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialOHObjectionHandling': JSON.stringify(
            objectionHandlingWithScore,
          ),
          'roleplay.feedback.prudentialOHObjectionHandlingGenerating': false,
        },
      });

      console.log(
        `[Prudential OH] Objection Handling generation completed for session: ${sessionId}`,
      );

      await triggerStandingCalculationIfReady(sessionId);
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialOHObjectionHandlingGenerating': false,
        },
      });
      console.log(
        `[Prudential OH] Objection Handling generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Prudential OH] Objection Handling job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.prudentialOHObjectionHandlingGenerating': false,
      },
    });
    throw error;
  }
}
