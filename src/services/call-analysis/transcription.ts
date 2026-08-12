import { createClient, PrerecordedSchema } from '@deepgram/sdk';
import { ChatAnthropic } from '@langchain/anthropic';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import type { ITranscriptSegment } from '../../models/CallAnalysis.js';
import { CLAUDE_MODEL_SONNET } from '../../utils/constants.js';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

interface ElevenLabsWord {
  text: string;
  start: number;
  end: number;
  speaker_id: string;
}

interface ElevenLabsTranscriptResponse {
  status: string;
  text: string;
  words: ElevenLabsWord[];
  speakers: number;
}

export async function transcribeWithSpeakers(
  audioBuffer: Buffer,
  keyterms?: string[]
): Promise<ITranscriptSegment[]> {
  try {
    // Step 1: Upload audio to ElevenLabs for transcription with diarization
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg',
    });

    // Configure diarization settings
    formData.append('model_id', keyterms?.length ? 'scribe_v2' : 'scribe_v1');
    formData.append('diarize', 'True');
    // formData.append('diarization_threshold', '0.22'); // Default value for balanced speaker separation
    formData.append('num_speakers', '2'); // We expect 2 speakers (agent and customer)

    if (keyterms?.length) {
      for (const term of keyterms) {
        formData.append('keyterms', term);
      }
    }

    console.log('ElevenLabs ::: formData', formData);
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/speech-to-text`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'xi-api-key': process.env.ELEVENLABS_API_KEY_STT_ONLY!,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
    );

    const transcriptData: ElevenLabsTranscriptResponse = response.data;

    if (!transcriptData.text || !transcriptData.words) {
      throw new Error('Invalid response from ElevenLabs transcription');
    }

    // Step 2: Group words by speaker and time proximity to create segments
    const segments = groupWordsIntoSegments(transcriptData.words);
    console.log('ElevenLabs ::: segments:', segments);

    // Step 3: Use LLM to identify which speaker is agent vs customer
    const speakerRoleMapping = await identifySpeakerRoles(segments);
    console.log('ElevenLabs ::: speakerRoleMapping:', speakerRoleMapping);

    // Step 4: Convert to final format
    const transcriptSegments: ITranscriptSegment[] = segments.map((segment) => {
      let speakerId = segment.speaker as 0 | 1;
      let role = speakerRoleMapping[segment.speaker];

      if (!role) {
        // it's possible that the speakerId is not 0 or 1, but we need to make it one of 0 or 1
        role = 'customer';
        speakerId = speakerRoleMapping['0'] === 'agent' ? 1 : 0;
      }

      return {
        speaker: speakerId,
        role,
        timestamp: Math.round(segment.start),
        content: segment.text.trim(),
      };
    });
    console.log('ElevenLabs ::: transcriptSegments:', transcriptSegments);

    return transcriptSegments;
  } catch (error) {
    console.error('Error in ElevenLabs transcription with speakers:', error);
    if (error instanceof AxiosError) {
      console.error('ElevenLabs API error response:', error.response?.data);
    }
    throw new Error('Failed to transcribe audio with speaker diarization');
  }
}

export async function transcribeWithSpeakersAlt(
  audioBuffer: Buffer,
  keyterms?: string[],
): Promise<ITranscriptSegment[]> {
  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    const options: PrerecordedSchema = {
      model: 'nova-3',
      diarize: true,
      smart_format: true,
      detect_language: true,
    };

    if (keyterms?.length) {
      options.keyterm = keyterms;
    }

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      options,
    );

    if (error) throw error;

    const paragraphs =
      result?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs
        ?.paragraphs;
    const words =
      result?.results?.channels?.[0]?.alternatives?.[0]?.words ?? [];

    if (!paragraphs?.length && !words.length) {
      throw new Error('Invalid response from Deepgram transcription');
    }

    const segments = paragraphs?.length
      ? paragraphs
          .filter(
            (p: any): p is typeof p & { speaker: number } =>
              p.speaker !== undefined,
          )
          .map((p: any) => ({
            speaker: p.speaker,
            start: p.start,
            end: p.end,
            text: p.sentences.map((s: any) => s.text).join(' '),
          }))
      : groupDeepgramWordsIntoSegments(
          words.filter((w: any) => w.speaker !== undefined) as Array<{
            punctuated_word: string;
            start: number;
            end: number;
            speaker: number;
          }>,
        );
    console.log('Deepgram ::: segments:', segments);

    const speakerRoleMapping = await identifySpeakerRoles(segments);
    console.log('Deepgram ::: speakerRoleMapping:', speakerRoleMapping);

    const transcriptSegments: ITranscriptSegment[] = segments.map(
      (segment: any) => {
        let speakerId = segment.speaker as 0 | 1;
        let role = speakerRoleMapping[segment.speaker as number];

        if (!role) {
          role = 'customer';
          speakerId = speakerRoleMapping['0'] === 'agent' ? 1 : 0;
        }

        return {
          speaker: speakerId,
          role,
          timestamp: Math.round(segment.start),
          content: segment.text.trim(),
        };
      },
    );
    console.log('Deepgram ::: transcriptSegments:', transcriptSegments);

    return transcriptSegments;
  } catch (error) {
    console.error('Error in Deepgram transcription with speakers:', error);
    throw new Error('Failed to transcribe audio with speaker diarization');
  }
}

function groupDeepgramWordsIntoSegments(
  words: Array<{ punctuated_word: string; start: number; end: number; speaker: number }>,
): Array<{ speaker: number; start: number; end: number; text: string }> {
  const segments: Array<{
    speaker: number;
    start: number;
    end: number;
    text: string;
  }> = [];

  let currentSegment: {
    speaker: number;
    start: number;
    end: number;
    words: string[];
  } | null = null;

  for (const word of words) {
    if (
      !currentSegment ||
      currentSegment.speaker !== word.speaker ||
      word.start - currentSegment.end > 2.0
    ) {
      if (currentSegment) {
        segments.push({
          speaker: currentSegment.speaker,
          start: currentSegment.start,
          end: currentSegment.end,
          text: currentSegment.words.join(' '),
        });
      }
      currentSegment = {
        speaker: word.speaker,
        start: word.start,
        end: word.end,
        words: [word.punctuated_word],
      };
    } else {
      currentSegment.end = word.end;
      currentSegment.words.push(word.punctuated_word);
    }
  }

  if (currentSegment) {
    segments.push({
      speaker: currentSegment.speaker,
      start: currentSegment.start,
      end: currentSegment.end,
      text: currentSegment.words.join(' '),
    });
  }

  return segments;
}

function groupWordsIntoSegments(words: ElevenLabsWord[]): Array<{
  speaker: number;
  start: number;
  end: number;
  text: string;
}> {
  const segments: Array<{
    speaker: number;
    start: number;
    end: number;
    text: string;
  }> = [];

  let currentSegment: {
    speaker: number;
    start: number;
    end: number;
    words: string[];
  } | null = null;

  // Group words by speaker and time proximity (max 2 second gap between words)
  for (const word of words) {
    const speakerId = Number(word.speaker_id.replace('speaker_', ''));

    if (
      !currentSegment ||
      currentSegment.speaker !== speakerId ||
      word.start - currentSegment.end > 2.0
    ) {
      // Save previous segment
      if (currentSegment) {
        segments.push({
          speaker: currentSegment.speaker,
          start: currentSegment.start,
          end: currentSegment.end,
          text: currentSegment.words.join(' '),
        });
      }
      // Start new segment
      currentSegment = {
        speaker: speakerId,
        start: word.start,
        end: word.end,
        words: [word.text],
      };
    } else {
      // Continue current segment
      currentSegment.end = word.end;
      currentSegment.words.push(word.text);
    }
  }

  // Add final segment
  if (currentSegment) {
    segments.push({
      speaker: currentSegment.speaker,
      start: currentSegment.start,
      end: currentSegment.end,
      text: currentSegment.words.join(' '),
    });
  }

  return segments;
}

async function identifySpeakerRoles(
  segments: Array<{ speaker: number; start: number; text: string }>,
): Promise<{ [key: number]: 'agent' | 'customer' }> {
  const prompt = `
Analyze this sales conversation transcript and determine which speaker is the agent and which is the customer.

Key indicators:
- Agent usually greets first and introduces themselves/company
- Agent asks discovery questions about needs
- Customer states their problems, needs, or objections
- Agent presents solutions and handles objections
- Agent typically drives the conversation structure

Transcript segments:
${segments.map((s, i) => `Speaker ${s.speaker} (${s.start}s): "${s.text}"`).join('\n')}

Based on the conversation patterns, determine the roles.
Return ONLY a JSON object with this exact structure:
{
  "0": "agent" or "customer",
  "1": "agent" or "customer"
}`;

  const anthropic = new ChatAnthropic({
    modelName: CLAUDE_MODEL_SONNET,
    apiKey: process.env.ANTHROPIC_API_KEY!,
    temperature: 0,
  });

  const response = await anthropic.invoke(prompt);
  const content = response.content as string;

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Default fallback: assume speaker 1 is agent
    return { 0: 'agent', 1: 'customer' };
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    // Default fallback if parsing fails
    return { 0: 'agent', 1: 'customer' };
  }
}
