import { ChatOpenAI } from '@langchain/openai';
import { Message } from '../../models/Message.js';
import { SalesSession } from '../../models/SalesSession.js';
import {
  getPrudentialPHAppointmentSettingAssessmentPrompt,
  prudentialPHAppointmentSettingSchema,
} from '../../prompts/prudential-ph/prudential-ph-appointment-setting-assessment.js';
import { OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { isSessionTooBrief } from '../session.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

/**
 * Generate the Appointment Setting assessment for Prudential PH
 */
export async function generatePrudentialPHAppointmentSettingJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Prudential PH] Starting Appointment Setting generation for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.prudentialPHAppointmentSetting) {
      console.log(
        `[Prudential PH] Appointment Setting already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHAppointmentSettingGenerating': false,
        },
      });
      return;
    }

    await session.updateOne({
      $set: {
        'roleplay.feedback.prudentialPHAppointmentSettingGenerating': true,
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
        `[Prudential PH] Session too brief for Appointment Setting assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHAppointmentSettingGenerating': false,
        },
      });
      return;
    }

    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const characterName = session.persona?.name || 'Prospect';
    const prompt = getPrudentialPHAppointmentSettingAssessmentPrompt(
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
      .withStructuredOutput(prudentialPHAppointmentSettingSchema)
      .invoke(formattedPrompt);

    if (data?.appointmentSetting) {
      // Recalculate overall score from scored sections (exclude mandatory pass/fail)
      const calculatedScore = data.appointmentSetting.sections
        .filter((section) => !section.isMandatory)
        .reduce((sum, section) => sum + section.score, 0);

      console.log(
        `[Prudential PH] Appointment Setting score comparison for session ${sessionId}: ` +
          `LLM=${data.appointmentSetting.overallScore} Calculated=${calculatedScore}`,
      );

      const appointmentSettingWithScore = {
        ...data.appointmentSetting,
        overallScore: calculatedScore,
      };

      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHAppointmentSetting': JSON.stringify(
            appointmentSettingWithScore,
          ),
          'roleplay.feedback.prudentialPHAppointmentSettingGenerating': false,
        },
      });

      console.log(
        `[Prudential PH] Appointment Setting generation completed for session: ${sessionId}`,
      );

      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.prudentialPHAppointmentSettingGenerating': false,
        },
      });
      console.log(
        `[Prudential PH] Appointment Setting generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Prudential PH] Appointment Setting job failed for session ${sessionId}:`,
      error,
    );
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.prudentialPHAppointmentSettingGenerating': false,
      },
    });
    throw error;
  }
}
