import { ChatOpenAI } from '@langchain/openai';
import { Message } from '../../models/Message.js';
import { SalesSession } from '../../models/SalesSession.js';
import {
  getPrudentialPhClosingCallTechniquePrompt,
  prudentialPhClosingCallTechniqueSchema,
} from '../../prompts/prudential-ph/closing-call-technique.js';
import { OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { isSessionTooBrief } from '../session.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

/**
 * Generate the Closing Call Technique assessment for Prudential PH
 */
export async function generatePrudentialPHClosingCallTechniqueJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Prudential PH] Starting Closing Call Technique generation for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      throw new Error(`No roleplay found for session: ${sessionId}`);
    }

    if (session.roleplay.feedback?.prudentialPHClosingCallTechnique) {
      console.log(
        `[Prudential PH] Closing Call Technique already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHClosingCallTechniqueGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: {
        'roleplay.feedback.prudentialPHClosingCallTechniqueGenerating': true,
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
        `[Prudential PH] Session too brief for Closing Call Technique assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHClosingCallTechniqueGenerating': false,
        },
      });
      return;
    }

    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const characterName = session.persona?.name || 'Prospect';
    const productName = (session.product as any)?.name || 'Insurance Product';
    const prompt = getPrudentialPhClosingCallTechniquePrompt(
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
      .withStructuredOutput(prudentialPhClosingCallTechniqueSchema)
      .invoke(formattedPrompt);

    if (data?.closingCallTechnique) {
      const maxPossibleScore = data.closingCallTechnique.sections.reduce(
        (sum, section) => sum + section.maxScore,
        0,
      );
      const rawScore = data.closingCallTechnique.sections.reduce(
        (sum, section) => sum + section.score,
        0,
      );
      const calculatedScore = Math.round((rawScore / maxPossibleScore) * 100);

      console.log(
        `[Prudential PH] Closing Call Technique score for session ${sessionId}: ` +
          `LLM=${data.closingCallTechnique.overallScore} Calculated(avg)=${calculatedScore}`,
      );

      const closingCallTechniqueWithScore = {
        ...data.closingCallTechnique,
        overallScore: calculatedScore,
      };

      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHClosingCallTechnique': JSON.stringify(
            closingCallTechniqueWithScore,
          ),
          'roleplay.feedback.prudentialPHClosingCallTechniqueGenerating': false,
        },
      });

      console.log(
        `[Prudential PH] Closing Call Technique generation completed for session: ${sessionId}`,
      );

      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHClosingCallTechniqueGenerating': false,
        },
      });
      console.log(
        `[Prudential PH] Closing Call Technique generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Prudential PH] Closing Call Technique job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.prudentialPHClosingCallTechniqueGenerating': false,
      },
    });
    throw error;
  }
}
