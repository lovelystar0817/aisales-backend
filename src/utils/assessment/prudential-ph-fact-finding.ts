import { ChatOpenAI } from '@langchain/openai';
import { Message } from '../../models/Message.js';
import { SalesSession } from '../../models/SalesSession.js';
import {
  getPrudentialPhFactFindingTechniquePrompt,
  prudentialPhFactFindingTechniqueSchema,
} from '../../prompts/prudential-ph/fact-finding-sales-technique.js';
import {
  getPrudentialPhProductKnowledgePrompt,
  prudentialPhProductKnowledgeSchema,
} from '../../prompts/prudential-ph/product-pitch-knowledge.js';
import { OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { isSessionTooBrief } from '../session.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

/**
 * Generate the Fact Finding Technique (SPIN) assessment for Prudential PH
 */
export async function generatePrudentialPHFactFindingTechniqueJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Prudential PH] Starting Fact Finding Technique generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.prudentialPHFactFindingTechnique) {
      console.log(
        `[Prudential PH] Fact Finding Technique already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHFactFindingTechniqueGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: {
        'roleplay.feedback.prudentialPHFactFindingTechniqueGenerating': true,
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
        `[Prudential PH] Session too brief for Fact Finding Technique assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHFactFindingTechniqueGenerating': false,
        },
      });
      return;
    }

    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const characterName = session.persona?.name || 'Prospect';
    const prompt = getPrudentialPhFactFindingTechniquePrompt(
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
      .withStructuredOutput(prudentialPhFactFindingTechniqueSchema)
      .invoke(formattedPrompt);

    if (data?.factFindingTechnique) {
      const calculatedScore = data.factFindingTechnique.sections.reduce(
        (sum, section) => sum + section.score,
        0,
      );

      console.log(
        `[Prudential PH] Fact Finding Technique score comparison for session ${sessionId}: ` +
          `LLM=${data.factFindingTechnique.overallScore} Calculated=${calculatedScore}`,
      );

      const factFindingTechniqueWithScore = {
        ...data.factFindingTechnique,
        overallScore: calculatedScore,
      };

      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHFactFindingTechnique': JSON.stringify(
            factFindingTechniqueWithScore,
          ),
          'roleplay.feedback.prudentialPHFactFindingTechniqueGenerating': false,
        },
      });

      console.log(
        `[Prudential PH] Fact Finding Technique generation completed for session: ${sessionId}`,
      );

      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHFactFindingTechniqueGenerating': false,
        },
      });
      console.log(
        `[Prudential PH] Fact Finding Technique generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Prudential PH] Fact Finding Technique job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.prudentialPHFactFindingTechniqueGenerating': false,
      },
    });
    throw error;
  }
}

/**
 * Generate the Product Knowledge (FAB) assessment for Prudential PH
 */
export async function generatePrudentialPHProductKnowledgeJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Prudential PH] Starting Product Knowledge generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.prudentialPHProductKnowledge) {
      console.log(
        `[Prudential PH] Product Knowledge already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHProductKnowledgeGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: {
        'roleplay.feedback.prudentialPHProductKnowledgeGenerating': true,
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
        `[Prudential PH] Session too brief for Product Knowledge assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHProductKnowledgeGenerating': false,
        },
      });
      return;
    }

    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const characterName = session.persona?.name || 'Prospect';
    const productName = (session.product as any)?.name || 'Insurance Product';
    const prompt = getPrudentialPhProductKnowledgePrompt(
      characterName,
      productName,
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
      .withStructuredOutput(prudentialPhProductKnowledgeSchema)
      .invoke(formattedPrompt);

    if (data?.productKnowledge) {
      const calculatedScore = data.productKnowledge.sections.reduce(
        (sum, section) => sum + section.score,
        0,
      );

      console.log(
        `[Prudential PH] Product Knowledge score comparison for session ${sessionId}: ` +
          `LLM=${data.productKnowledge.overallScore} Calculated=${calculatedScore}`,
      );

      const productKnowledgeWithScore = {
        ...data.productKnowledge,
        overallScore: calculatedScore,
      };

      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHProductKnowledge': JSON.stringify(
            productKnowledgeWithScore,
          ),
          'roleplay.feedback.prudentialPHProductKnowledgeGenerating': false,
        },
      });

      console.log(
        `[Prudential PH] Product Knowledge generation completed for session: ${sessionId}`,
      );

      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHProductKnowledgeGenerating': false,
        },
      });
      console.log(
        `[Prudential PH] Product Knowledge generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Prudential PH] Product Knowledge job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.prudentialPHProductKnowledgeGenerating': false,
      },
    });
    throw error;
  }
}
