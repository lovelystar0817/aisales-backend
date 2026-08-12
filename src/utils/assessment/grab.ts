import { SalesSession } from '../../models/SalesSession.js';
import { Message } from '../../models/Message.js';
import { isSessionTooBrief } from '../session.js';
import { DEFAULT_FRAMEWORK } from '../../frameworks/common.js';
import { ChatOpenAI } from '@langchain/openai';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../constants.js';
import {
  getGrabMexSoftSkillsPrompt,
  grabMexSoftSkillsSchema,
} from '../../prompts/grab-mex-soft-skills.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

export async function generateGrabMexSoftSkillsJob(job: any): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Grab MEX] Starting soft skills generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.grabMexSoftSkills) {
      console.log(
        `[Grab MEX] Soft skills already exist for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.grabMexSoftSkillsGenerating': false },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.grabMexSoftSkillsGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[Grab MEX] Session too brief for soft skills assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.grabMexSoftSkillsGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });
    const prompt = getGrabMexSoftSkillsPrompt(
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
      grabMexSoftSkillsSchema,
    );

    const softSkillsData =
      await modelWithStructuredOutput.invoke(formattedPrompt);

    if (softSkillsData?.grabMexSoftSkills) {
      // Calculate overall score as sum of section scores
      let softSkillsWithOverallScore = softSkillsData.grabMexSoftSkills;

      if (
        softSkillsData.grabMexSoftSkills.sections &&
        Array.isArray(softSkillsData.grabMexSoftSkills.sections)
      ) {
        const calculatedScore =
          softSkillsData.grabMexSoftSkills.sections.reduce(
            (sum: number, section: any) => {
              return sum + (section.score || 0);
            },
            0,
          );

        console.log(
          `[Grab MEX] Soft skills score comparison for session ${sessionId}: LLM-generated=${softSkillsData.grabMexSoftSkills.overallScore}, Calculated=${calculatedScore}`,
        );

        softSkillsWithOverallScore = {
          ...softSkillsData.grabMexSoftSkills,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.grabMexSoftSkills': JSON.stringify(
            softSkillsWithOverallScore,
          ),
          'roleplay.feedback.grabMexSoftSkillsGenerating': false,
        },
      });
      console.log(
        `[Grab MEX] Soft skills generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.grabMexSoftSkillsGenerating': false,
        },
      });
      console.log(
        `[Grab MEX] Soft skills generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Grab MEX] Soft skills job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.grabMexSoftSkillsGenerating': false },
    });
    throw error;
  }
}
