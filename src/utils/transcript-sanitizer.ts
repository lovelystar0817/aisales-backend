import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { OPENAI_MODEL_GPT_4_1_MINI } from './constants.js';

const UNCLEAR_AUDIO_MARKER = '[audio unclear]';

const sanitizedTranscriptSchema = z.object({
  messages: z.array(
    z.object({
      index: z.number(),
      content: z.string(),
      replaced: z.boolean(),
    }),
  ),
});

const GPT_REALTIME_ASSESSMENT_TYPES = [
  'bbl',
  'kt-axa-recruitment',
  'kt-axa-fna',
  'kt-axa-wealthplus',
];

export const isGptRealtimeSession = (
  languageCode: string,
  assessmentType?: string,
): boolean => {
  return (
    languageCode === 'th' &&
    !!assessmentType &&
    GPT_REALTIME_ASSESSMENT_TYPES.includes(assessmentType)
  );
};

export const sanitizeTranscriptLanguage = async (
  transcript: {
    role: string;
    content: string;
    sent: string;
    feedback?: any;
  }[],
  languageCode: string,
  assessmentType?: string,
): Promise<typeof transcript> => {
  if (
    !isGptRealtimeSession(languageCode, assessmentType) ||
    !transcript.length
  ) {
    return transcript;
  }

  try {
    const model = new ChatOpenAI({
      modelName: OPENAI_MODEL_GPT_4_1_MINI,
      temperature: 0,
    });

    const prompt = `You are a transcript language validator. The following transcript is from a voice session conducted in "${languageCode}".

Your task: Check each message. If a message's content is clearly in the WRONG language (not "${languageCode}"), mark it as replaced and set its content to "${UNCLEAR_AUDIO_MARKER}".

Rules:
- A message is wrong if it's entirely in a different language (e.g., Chinese characters in a Thai session)
- Keep messages that are in the correct language, even if they contain some foreign words (e.g., product names, technical terms)
- Keep messages that are empty or very short
- When in doubt, keep the original content

Messages:
${transcript.map((msg, i) => `[${i}] (${msg.role}): ${msg.content}`).join('\n')}

Return the result for each message.`;

    const response = await model
      .withStructuredOutput(sanitizedTranscriptSchema)
      .invoke(prompt);

    return transcript.map((msg, i) => {
      const result = response.messages.find((m) => m.index === i);
      if (result?.replaced) {
        return { ...msg, content: UNCLEAR_AUDIO_MARKER };
      }
      return msg;
    });
  } catch (error) {
    console.error(
      'Transcript language sanitization failed, using original:',
      error,
    );
    return transcript;
  }
};
