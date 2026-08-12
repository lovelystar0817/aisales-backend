import { FastifyPluginAsync } from 'fastify';
import axios from 'axios';
import OpenAI from 'openai';
import { PassThrough } from 'node:stream';
import { getLanguageHeader } from '../../locale/request.js';
import { CARTESIA_THAI_FEMALE_VOICE_ID } from '../../utils/constants.js';
import { ELEVEN_LABS_TRADITIONAL_CHINESE_OLD_FEMALE_VOICE_ID } from '../../utils/constants.js';

// Configuration for 11labs
// TODO: Ensure ELEVENLABS_API_KEY is set in the environment variables for aisales-backend
const ELEVEN_LABS_CONFIG = {
  baseUrl: 'https://api.elevenlabs.io/v1',
  defaultVoiceId: '21m00Tcm4TlvDq8ikWAM', // Default Rachel voice, can be configured
  // Default voice settings, can be overridden by persona
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.0, // Set to 0 for no style exaggeration unless persona specifies
  useSpeakerBoost: true,
};

// Configuration for Cartesia
const CARTESIA_CONFIG = {
  baseUrl: 'https://api.cartesia.ai',
  defaultVoiceId: '79a125e8-cd45-4c13-8a67-188112f4dd22', // British Lady voice
  model: 'sonic-3', // Latest sonic model
  timeout: 30000, // 30 second timeout
};

// Pronunciation dictionaries for specific companies (Cartesia)
// These help with correct pronunciation of company names and specific terms
const PRONUNCIATION_DICTIONARIES: Record<string, string> = {
  'kt-axa': 'pdict_zwMGT5uegv7bfrvq91xwYV',
};

// Configuration for Qwen (Alibaba DashScope)
const QWEN_CONFIG = {
  baseUrl:
    'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  model: 'qwen3-tts-flash',
  defaultVoiceId: 'Kiki', // Female Cantonese voice
};

// TODO: Define persona-specific settings if needed, similar to ai-backend
const getElevenLabsPersonaSettings = (personaId?: string) => {
  const settings = {
    stability: ELEVEN_LABS_CONFIG.stability,
    similarity_boost: ELEVEN_LABS_CONFIG.similarityBoost,
    style: ELEVEN_LABS_CONFIG.style,
    use_speaker_boost: ELEVEN_LABS_CONFIG.useSpeakerBoost,
  };
  // Example:
  // if (personaId === 'energetic') {
  //   return { ...settings, style: 0.5, stability: 0.4 };
  // }
  return settings;
};

// Uncomment if OpenAI support is needed
const getOpenAIPersonaInstructions = (personaId?: string) => {
  if (!personaId) {
    return 'Speak in a clear, professional tone.';
  }
  // Add persona-specific instructions
  return 'Speak in a clear, professional tone.';
};

const generateOpenAIAudio = async (
  app: any, // Fastify app instance for logging
  openai: OpenAI,
  text: string,
  voice: string, // OpenAI voice ID
  speed: number,
  personaId?: string,
): Promise<Buffer> => {
  const instructions = getOpenAIPersonaInstructions(personaId);
  if (personaId) {
    app.log.info(`Using OpenAI persona ${personaId} for voice styling`);
  }

  // OpenAI valid voices
  const openAIVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const validVoice = openAIVoices.includes(voice) ? voice : 'alloy';
  const validSpeed = Math.max(0.25, Math.min(4.0, speed));

  // OpenAI TTS has a 4096 character limit, so we need to chunk long text
  const MAX_CHARS = 4000; // Slightly under 4096 to be safe

  if (text.length <= MAX_CHARS) {
    // Single request for short text
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: validVoice as any,
      input: text,
      response_format: 'mp3',
      speed: validSpeed,
    });
    return Buffer.from(await mp3Response.arrayBuffer());
  }

  // Chunk long text by sentences to stay under the limit
  app.log.info(
    `Text length ${text.length} exceeds OpenAI limit, chunking into smaller pieces...`,
  );

  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > MAX_CHARS) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        // Single sentence too long, split by character limit
        chunks.push(sentence.substring(0, MAX_CHARS).trim());
        currentChunk = sentence.substring(MAX_CHARS);
      }
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  app.log.info(`Split into ${chunks.length} chunks for OpenAI TTS`);

  // Generate audio for all chunks in parallel for faster processing
  const audioBuffers = await Promise.all(
    chunks.map(async (chunk) => {
      const mp3Response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: validVoice as any,
        input: chunk,
        response_format: 'mp3',
        speed: validSpeed,
      });
      return Buffer.from(await mp3Response.arrayBuffer());
    }),
  );

  // Concatenate all audio buffers
  return Buffer.concat(audioBuffers);
};

const generateElevenLabsAudio = async (
  app: any, // Fastify app instance for logging
  text: string,
  voiceId: string, // ElevenLabs voice ID
  personaId?: string,
): Promise<Buffer> => {
  if (!process.env.ELEVENLABS_API_KEY) {
    app.log.error(
      'ELEVENLABS_API_KEY is not set. Cannot generate ElevenLabs audio.',
    );
    throw new Error('ElevenLabs API key not configured');
  }

  const { stability, similarity_boost, style, use_speaker_boost } =
    getElevenLabsPersonaSettings(personaId);

  if (personaId) {
    app.log.info(
      `Adjusting ElevenLabs voice parameters for ${personaId} persona to voice ${voiceId}`,
    );
  }

  const response = await axios({
    method: 'POST',
    url: `${ELEVEN_LABS_CONFIG.baseUrl}/text-to-speech/${voiceId}`,
    headers: {
      Accept: 'audio/mpeg',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      text,
      model_id: 'eleven_multilingual_v2', // Or other desired model
      voice_settings: {
        stability,
        similarity_boost,
        style,
        use_speaker_boost,
      },
    },
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
};

const generateElevenLabsStreamingAudio = async (
  app: any,
  text: string,
  voiceId: string,
  reply: any,
  personaId?: string,
): Promise<void> => {
  if (!process.env.ELEVENLABS_API_KEY) {
    app.log.error(
      'ELEVENLABS_API_KEY is not set. Cannot generate ElevenLabs streaming audio.',
    );
    throw new Error('ElevenLabs API key not configured');
  }

  const { stability, similarity_boost, style, use_speaker_boost } =
    getElevenLabsPersonaSettings(personaId);

  if (personaId) {
    app.log.info(
      `Streaming TTS: Adjusting ElevenLabs voice parameters for ${personaId} persona to voice ${voiceId}`,
    );
  }

  try {
    const response = await axios({
      method: 'POST',
      url: `${ELEVEN_LABS_CONFIG.baseUrl}/text-to-speech/${voiceId}/stream`,
      headers: {
        Accept: 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability,
          similarity_boost,
          style,
          use_speaker_boost,
        },
        output_format: 'mp3_44100_128',
        // Enable streaming
        enable_timestamps: false,
      },
      responseType: 'stream',
    });

    reply.header('Content-Type', 'audio/mpeg');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('X-Accel-Buffering', 'no');
    // CORS headers typically handled globally; omit here to avoid duplicate header issues

    return reply.send(response.data);
  } catch (error: any) {
    app.log.error('Streaming TTS request error:', error);
    if (!reply.sent) {
      const message =
        error.response?.data?.detail?.message ||
        error.message ||
        'Failed to start streaming TTS';
      const statusCode = error.response?.status || 500;
      reply.code(statusCode).send({ error: message });
    }
  }
};

const generateOpenAIStreamingAudio = async (
  app: any,
  text: string,
  voice: string,
  reply: any,
  speed: number = 1.0,
  personaId?: string,
): Promise<void> => {
  if (!process.env.OPENAI_API_KEY) {
    app.log.error(
      'OPENAI_API_KEY is not set. Cannot generate OpenAI streaming audio.',
    );
    throw new Error('OpenAI API key not configured');
  }

  // Supported OpenAI voices
  const openAIVoices = [
    'alloy',
    'ash',
    'ballad',
    'coral',
    'echo',
    'fable',
    'onyx',
    'nova',
    'sage',
    'shimmer',
    'verse',
  ];
  const validVoice = openAIVoices.includes(voice) ? voice : 'alloy';
  const validSpeed = Math.max(0.25, Math.min(4.0, speed));

  if (personaId) {
    app.log.info(
      `Streaming TTS (OpenAI): persona ${personaId}, voice ${validVoice}, speed ${validSpeed}`,
    );
  }

  try {
    // If the text is short, stream directly from a single OpenAI request
    const MAX_CHARS = 4000; // slightly below the documented 4096
    if (text.length <= MAX_CHARS) {
      const response = await axios({
        method: 'POST',
        url: 'https://api.openai.com/v1/audio/speech',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          Accept: 'application/octet-stream',
          'Content-Type': 'application/json',
        },
        data: {
          model: 'tts-1',
          voice: validVoice,
          input: text,
          response_format: 'mp3',
          speed: validSpeed,
        },
        responseType: 'stream',
      });

      reply.header('Content-Type', 'audio/mpeg');
      reply.header('Cache-Control', 'no-cache');
      reply.header('Connection', 'keep-alive');
      reply.header('X-Accel-Buffering', 'no');
      return reply.send(response.data);
    }

    // Otherwise, chunk text and stream sequentially through a PassThrough
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let current = '';
    for (const sentence of sentences) {
      if ((current + sentence).length > MAX_CHARS) {
        if (current) {
          chunks.push(current.trim());
          current = sentence;
        } else {
          chunks.push(sentence.substring(0, MAX_CHARS).trim());
          current = sentence.substring(MAX_CHARS);
        }
      } else {
        current += sentence;
      }
    }
    if (current) chunks.push(current.trim());

    app.log.info(`OpenAI streaming: split into ${chunks.length} chunks`);

    const pass = new PassThrough();
    reply.header('Content-Type', 'audio/mpeg');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('X-Accel-Buffering', 'no');
    // Send the PassThrough immediately so the client starts receiving data
    reply.send(pass);

    // Stream each chunk sequentially into the PassThrough
    for (const chunk of chunks) {
      const res = await axios({
        method: 'POST',
        url: 'https://api.openai.com/v1/audio/speech',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          Accept: 'application/octet-stream',
          'Content-Type': 'application/json',
        },
        data: {
          model: 'tts-1',
          voice: validVoice,
          input: chunk,
          response_format: 'mp3',
          speed: validSpeed,
        },
        responseType: 'stream',
      });

      await new Promise<void>((resolve, reject) => {
        res.data.on('end', resolve);
        res.data.on('error', reject);
        res.data.pipe(pass, { end: false });
      });
    }

    pass.end();
  } catch (error: any) {
    app.log.error('OpenAI Streaming TTS request error:', error);
    if (!reply.sent) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.detail?.message ||
        error.message ||
        'Failed to start streaming TTS';
      const statusCode = error.response?.status || 500;
      reply.code(statusCode).send({ error: message });
    }
  }
};

const generateCartesiaAudio = async (
  app: any,
  text: string,
  voiceId: string,
  speed: number = 0.9,
  personaId?: string,
  languageCode?: string,
  companyFriendlyId?: string,
): Promise<Buffer> => {
  if (!process.env.CARTESIA_API_KEY) {
    throw new Error('Cartesia API key not configured');
  }

  // Get pronunciation dictionary for company-specific terms
  const pronunciationDictId = companyFriendlyId
    ? PRONUNCIATION_DICTIONARIES[companyFriendlyId]
    : undefined;

  if (personaId || pronunciationDictId) {
    app.log.info(
      `Generating Cartesia TTS for persona ${personaId}, voice ${voiceId}, speed ${speed}, pronunciation dict: ${pronunciationDictId || 'none'}`,
    );
  }

  try {
    const requestBody: Record<string, any> = {
      model_id: CARTESIA_CONFIG.model,
      transcript: text,
      voice: {
        mode: 'id',
        id: voiceId,
      },
      output_format: {
        container: 'mp3',
        sample_rate: 44100,
        bit_rate: 128000,
      },
      language: languageCode || 'en',
    };

    // Use generation_config for speed in sonic-3 (valid range: 0.6-1.5)
    if (speed !== 1.0) {
      requestBody.generation_config = {
        speed: Math.max(0.6, Math.min(1.5, speed)),
      };
    }

    // Add pronunciation dictionary if available
    if (pronunciationDictId) {
      requestBody.pronunciation_dict_id = pronunciationDictId;
    }

    const response = await axios({
      method: 'POST',
      url: `${CARTESIA_CONFIG.baseUrl}/tts/bytes`,
      headers: {
        'X-API-Key': process.env.CARTESIA_API_KEY,
        'Cartesia-Version': '2025-04-16',
        'Content-Type': 'application/json',
      },
      data: requestBody,
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Cartesia TTS error:', error);
    throw error;
  }
};

const generateQwenAudio = async (
  app: any,
  text: string,
  voiceId: string,
  personaId?: string,
): Promise<Buffer> => {
  console.log('🔥🔥🔥 generateQwenAudio called with text length:', text.length);

  if (!process.env.DASHSCOPE_API_KEY) {
    app.log.error('DASHSCOPE_API_KEY is not set. Cannot generate Qwen audio.');
    throw new Error('Qwen TTS API key not configured');
  }

  if (personaId) {
    app.log.info(
      `Generating Qwen TTS for persona ${personaId}, voice ${voiceId}`,
    );
  }

  try {
    // Qwen has a 600 BYTE limit per request (not characters!)
    // Chinese characters are 3 bytes each in UTF-8
    // Using 500 bytes to provide safe 100-byte buffer
    const MAX_BYTES = 500;
    const textBytes = Buffer.byteLength(text, 'utf8');
    console.log('🔥🔥🔥 MAX_BYTES set to:', MAX_BYTES);
    console.log('🔥🔥🔥 Text byte length:', textBytes);
    console.log('🔥🔥🔥 Text character length:', text.length);

    if (textBytes <= MAX_BYTES) {
      // Single request for short text
      const response = await axios({
        method: 'POST',
        url: QWEN_CONFIG.baseUrl,
        headers: {
          Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        data: {
          model: QWEN_CONFIG.model,
          input: {
            text,
            voice: voiceId,
          },
        },
      });

      const audioUrl = response.data?.output?.audio?.url;
      if (!audioUrl) {
        throw new Error('No audio URL in Qwen response');
      }

      const audioResponse = await axios({
        method: 'GET',
        url: audioUrl,
        responseType: 'arraybuffer',
      });

      return Buffer.from(audioResponse.data);
    }

    // Chunk long text by sentences to stay under the BYTE limit
    app.log.info(
      `Text byte length ${textBytes} exceeds Qwen limit (${MAX_BYTES}), chunking into smaller pieces...`,
    );

    const chunks: string[] = [];
    const sentences = text.match(/[^.!?。！？]+[.!?。！？]+/g) || [text];
    let currentChunk = '';

    for (const sentence of sentences) {
      const combinedText = currentChunk + sentence;
      const combinedBytes = Buffer.byteLength(combinedText, 'utf8');

      if (combinedBytes > MAX_BYTES) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          // Single sentence too long, split by byte limit
          // This is tricky - we need to split without breaking multi-byte characters
          let partialText = '';
          for (let i = 0; i < sentence.length; i++) {
            const testText = partialText + sentence[i];
            if (Buffer.byteLength(testText, 'utf8') > MAX_BYTES) {
              chunks.push(partialText.trim());
              partialText = sentence[i];
            } else {
              partialText = testText;
            }
          }
          currentChunk = partialText;
        }
      } else {
        currentChunk = combinedText;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    app.log.info(`Split into ${chunks.length} chunks for Qwen TTS`);
    chunks.forEach((chunk, i) => {
      const chunkBytes = Buffer.byteLength(chunk, 'utf8');
      console.log(
        `🔥 Chunk ${i + 1} - chars: ${chunk.length}, bytes: ${chunkBytes}`,
      );
    });

    // Generate audio in batches of 2 chunks at a time to balance speed and rate limits
    const BATCH_SIZE = 2;
    const audioBuffers: Buffer[] = [];

    const processChunk = async (chunk: string, index: number) => {
      console.log(`🔥 Processing chunk ${index + 1}/${chunks.length}...`);

      const response = await axios({
        method: 'POST',
        url: QWEN_CONFIG.baseUrl,
        headers: {
          Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        data: {
          model: QWEN_CONFIG.model,
          input: {
            text: chunk,
            voice: voiceId,
          },
        },
      });

      const audioUrl = response.data?.output?.audio?.url;
      if (!audioUrl) {
        throw new Error('No audio URL in Qwen response');
      }

      const audioResponse = await axios({
        method: 'GET',
        url: audioUrl,
        responseType: 'arraybuffer',
      });

      return Buffer.from(audioResponse.data);
    };

    // Process chunks in batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((chunk, batchIndex) =>
        processChunk(chunk, i + batchIndex),
      );

      try {
        const batchBuffers = await Promise.all(batchPromises);
        audioBuffers.push(...batchBuffers);

        // Add delay between batches (not after last batch)
        if (i + BATCH_SIZE < chunks.length) {
          await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay between batches
        }
      } catch (error: any) {
        // If we hit rate limit (429), fall back to sequential processing for remaining chunks
        if (error.response?.status === 429) {
          app.log.warn(
            'Rate limit hit, falling back to sequential processing for remaining chunks',
          );

          // Process remaining chunks sequentially
          for (let j = i; j < chunks.length; j++) {
            const buffer = await processChunk(chunks[j], j);
            audioBuffers.push(buffer);

            if (j < chunks.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 500)); // Longer delay for sequential fallback
            }
          }
          break;
        }
        throw error; // Re-throw if not rate limit error
      }
    }

    // Concatenate all audio buffers
    return Buffer.concat(audioBuffers);
  } catch (error) {
    console.error('Qwen TTS error:', error);
    throw error;
  }
};

const generateCartesiaStreamingAudio = async (
  app: any,
  text: string,
  voiceId: string,
  reply: any,
  speed: number = 0.9,
  personaId?: string,
  languageCode?: string,
  companyFriendlyId?: string,
): Promise<void> => {
  if (!process.env.CARTESIA_API_KEY) {
    throw new Error('Cartesia API key not configured');
  }

  // Get pronunciation dictionary for company-specific terms
  const pronunciationDictId = companyFriendlyId
    ? PRONUNCIATION_DICTIONARIES[companyFriendlyId]
    : undefined;

  app.log.info(
    `Streaming TTS (Cartesia SSE): persona ${personaId}, voice ${voiceId}, speed ${speed}, language ${languageCode}, pronunciation dict: ${pronunciationDictId || 'none'}`,
  );

  try {
    const requestBody: Record<string, any> = {
      model_id: CARTESIA_CONFIG.model,
      transcript: text,
      voice: {
        mode: 'id',
        id: voiceId,
      },
      output_format: {
        container: 'mp3',
        sample_rate: 44100,
        bit_rate: 128000,
      },
      language: languageCode || 'en',
    };

    // Use generation_config for speed in sonic-3 (valid range: 0.6-1.5)
    if (speed !== 1.0) {
      requestBody.generation_config = {
        speed: Math.max(0.6, Math.min(1.5, speed)),
      };
    }

    // Add pronunciation dictionary if available
    if (pronunciationDictId) {
      requestBody.pronunciation_dict_id = pronunciationDictId;
    }

    // Use bytes endpoint with streaming for MP3 output (MediaSource compatible)
    const response = await axios({
      method: 'POST',
      url: `${CARTESIA_CONFIG.baseUrl}/tts/bytes`,
      headers: {
        'X-API-Key': process.env.CARTESIA_API_KEY,
        'Cartesia-Version': '2025-04-16',
        'Content-Type': 'application/json',
      },
      data: requestBody,
      responseType: 'stream',
    });

    // Set up response headers for streaming MP3 audio
    // Include CORS headers since we're bypassing Fastify's middleware with raw response
    const origin = reply.request?.headers?.origin || '*';
    reply.raw.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    });

    // Pipe the MP3 stream directly to the response
    response.data.pipe(reply.raw);

    // Return a promise that resolves when the stream ends
    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        app.log.info('Cartesia streaming: TTS generation complete');
        resolve();
      });
      response.data.on('error', (error: Error) => {
        app.log.error('Cartesia stream error:', error);
        if (!reply.raw.writableEnded) {
          reply.raw.end();
        }
        reject(error);
      });
    });
  } catch (error) {
    app.log.error('Cartesia streaming TTS error:', error);
    if (!reply.raw.writableEnded) {
      reply.raw.end();
    }
    throw error;
  }
};

const generateQwenStreamingAudio = async (
  app: any,
  text: string,
  voiceId: string,
  reply: any,
  personaId?: string,
): Promise<void> => {
  if (!process.env.DASHSCOPE_API_KEY) {
    app.log.error(
      'DASHSCOPE_API_KEY is not set. Cannot generate Qwen streaming audio.',
    );
    throw new Error('Qwen TTS API key not configured');
  }

  app.log.info(
    `Qwen TTS: Generating audio (note: Qwen doesn't support true streaming, using non-streaming mode), voice ${voiceId}`,
  );

  try {
    // Qwen doesn't support true streaming like ElevenLabs/Cartesia
    // Their SSE mode returns JSON events with URLs, not direct audio streams
    // So we'll use the non-streaming approach and return the complete audio
    const audioBuffer = await generateQwenAudio(app, text, voiceId, personaId);

    reply.header('Content-Type', 'audio/mpeg');
    reply.header('Cache-Control', 'no-cache');

    return reply.send(audioBuffer);
  } catch (error: any) {
    app.log.error('Qwen TTS request error:', error);
    if (!reply.sent) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to generate Qwen TTS';
      const statusCode = error.response?.status || 500;
      reply.code(statusCode).send({ error: message });
    }
  }
};

const ttsRoutes: FastifyPluginAsync = async (app, _opts) => {
  // Initialize OpenAI client
  let openai: OpenAI | null = null;
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } else {
    app.log.warn(
      'OPENAI_API_KEY is not set. OpenAI TTS will not be available.',
    );
  }

  if (!process.env.CARTESIA_API_KEY) {
    app.log.warn(
      'CARTESIA_API_KEY is not set. Cartesia TTS will not be available.',
    );
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    app.log.warn(
      'ELEVENLABS_API_KEY is not set in aisales-backend. ElevenLabs TTS will not be available.',
    );
  }

  app.post('/generate', async (request, reply) => {
    try {
      const {
        text,
        // sessionId, // sessionId might not be needed if this is a generic TTS endpoint
        voice,
        speed = 1.0, // Speed primarily for OpenAI, ElevenLabs handles speed via voice settings/style
        provider = 'elevenlabs', // Default to elevenlabs
        personaId,
        companyFriendlyId, // For pronunciation dictionary lookup (e.g., 'kt-axa')
      } = request.body as {
        text: string;
        sessionId?: string;
        voice?: string;
        speed?: number;
        provider?: 'elevenlabs' | 'openai' | 'cartesia' | 'qwen';
        personaId?: string;
        companyFriendlyId?: string;
      };

      const languageCode = getLanguageHeader(request);

      if (!text) {
        return reply.code(400).send({ error: 'Text is required' });
      }

      // Set default voice based on provider and language
      let defaultVoice: string;
      if (provider === 'qwen') {
        defaultVoice = QWEN_CONFIG.defaultVoiceId; // Kiki
      } else if (provider === 'cartesia') {
        // Use Thai voice for Thai language, otherwise use default British voice
        defaultVoice =
          languageCode === 'th'
            ? CARTESIA_THAI_FEMALE_VOICE_ID
            : CARTESIA_CONFIG.defaultVoiceId;
      } else {
        defaultVoice = ELEVEN_LABS_CONFIG.defaultVoiceId;
      }
      const effectiveVoice = voice || defaultVoice;

      app.log.info(
        `Generating TTS using ${provider}, voice ${effectiveVoice}, text length: ${text.length}`,
      );

      let audioBuffer: Buffer;

      if (provider === 'elevenlabs') {
        if (!process.env.ELEVENLABS_API_KEY) {
          app.log.error(
            'Attempted to use ElevenLabs TTS, but API key is not configured.',
          );
          return reply
            .code(500)
            .send({ error: 'ElevenLabs TTS not configured' });
        }
        audioBuffer = await generateElevenLabsAudio(
          app,
          text,
          effectiveVoice,
          personaId,
        );
      } else if (provider === 'openai') {
        if (!openai) {
          app.log.error(
            'Attempted to use OpenAI TTS, but API key is not configured.',
          );
          return reply.code(500).send({ error: 'OpenAI TTS not configured' });
        }
        audioBuffer = await generateOpenAIAudio(
          app,
          openai,
          text,
          effectiveVoice,
          speed,
          personaId,
        );
      } else if (provider === 'cartesia') {
        if (!process.env.CARTESIA_API_KEY) {
          app.log.error(
            'Attempted to use Cartesia TTS, but API key is not configured.',
          );
          return reply.code(500).send({ error: 'Cartesia TTS not configured' });
        }
        audioBuffer = await generateCartesiaAudio(
          app,
          text,
          effectiveVoice,
          speed,
          personaId,
          languageCode,
          companyFriendlyId,
        );
      } else if (provider === 'qwen') {
        if (!process.env.DASHSCOPE_API_KEY) {
          app.log.error(
            'Attempted to use Qwen TTS, but API key is not configured.',
          );
          return reply.code(500).send({ error: 'Qwen TTS not configured' });
        }
        audioBuffer = await generateQwenAudio(
          app,
          text,
          effectiveVoice,
          personaId,
        );
      } else {
        return reply
          .code(400)
          .send({ error: `Unsupported TTS provider: ${provider}` });
      }

      reply.header('Content-Type', 'audio/mpeg');
      return reply.send(audioBuffer);
    } catch (error: any) {
      app.log.error('TTS generation error:', error);
      // Avoid sending detailed internal errors to client unless necessary
      const message =
        error.response?.data?.detail?.message ||
        error.message ||
        'Failed to generate speech';
      const statusCode = error.response?.status || 500;
      return reply.code(statusCode).send({ error: message });
    }
  });

  // Streaming endpoint
  app.post('/stream', async (request, reply) => {
    try {
      const {
        text,
        voice,
        provider = 'elevenlabs',
        personaId,
        speed,
        companyFriendlyId, // For pronunciation dictionary lookup (e.g., 'kt-axa')
      } = request.body as {
        text: string;
        voice?: string;
        provider?: 'elevenlabs' | 'openai' | 'cartesia' | 'qwen';
        personaId?: string;
        speed?: number;
        companyFriendlyId?: string;
      };

      const languageCode = getLanguageHeader(request);
      if (!text) {
        return reply.code(400).send({ error: 'Text is required' });
      }

      // Set default voice based on provider and language
      let defaultVoice: string;
      if (provider === 'qwen') {
        defaultVoice = QWEN_CONFIG.defaultVoiceId; // Kiki
      } else if (provider === 'cartesia') {
        defaultVoice =
          languageCode === 'th'
            ? CARTESIA_THAI_FEMALE_VOICE_ID
            : CARTESIA_CONFIG.defaultVoiceId;
      } else if (provider === 'openai') {
        defaultVoice = 'echo';
      } else {
        defaultVoice = ELEVEN_LABS_CONFIG.defaultVoiceId;
      }
      const effectiveVoice = voice || defaultVoice;

      app.log.info(
        `Starting streaming TTS using ${provider}, voice ${effectiveVoice}, text length: ${text.length}`,
      );

      if (provider === 'elevenlabs') {
        if (!process.env.ELEVENLABS_API_KEY) {
          app.log.error(
            'Attempted to use ElevenLabs streaming TTS, but API key is not configured.',
          );
          return reply
            .code(500)
            .send({ error: 'ElevenLabs TTS not configured' });
        }

        let elevenLabsVoiceId = voice;

        if (!elevenLabsVoiceId && languageCode === 'cmn') {
          elevenLabsVoiceId =
            ELEVEN_LABS_TRADITIONAL_CHINESE_OLD_FEMALE_VOICE_ID;
        } else if (!elevenLabsVoiceId) {
          elevenLabsVoiceId = ELEVEN_LABS_CONFIG.defaultVoiceId;
        }

        return generateElevenLabsStreamingAudio(
          app,
          text,
          elevenLabsVoiceId,
          reply,
          personaId,
        );
      } else if (provider === 'openai') {
        if (!process.env.OPENAI_API_KEY) {
          app.log.error(
            'Attempted to use OpenAI streaming TTS, but API key is not configured.',
          );
          return reply.code(500).send({ error: 'OpenAI TTS not configured' });
        }

        return generateOpenAIStreamingAudio(
          app,
          text,
          effectiveVoice,
          reply,
          typeof speed === 'number' ? speed : 1.0,
          personaId,
        );
      } else if (provider === 'cartesia') {
        if (!process.env.CARTESIA_API_KEY) {
          app.log.error(
            'Attempted to use Cartesia streaming TTS, but API key is not configured.',
          );
          return reply.code(500).send({ error: 'Cartesia TTS not configured' });
        }

        return generateCartesiaStreamingAudio(
          app,
          text,
          effectiveVoice,
          reply,
          typeof speed === 'number' ? speed : 0.9,
          personaId,
          languageCode,
          companyFriendlyId,
        );
      } else if (provider === 'qwen') {
        if (!process.env.DASHSCOPE_API_KEY) {
          app.log.error(
            'Attempted to use Qwen streaming TTS, but API key is not configured.',
          );
          return reply.code(500).send({ error: 'Qwen TTS not configured' });
        }

        return generateQwenStreamingAudio(
          app,
          text,
          effectiveVoice,
          reply,
          personaId,
        );
      } else {
        return reply
          .code(400)
          .send({ error: `Unsupported TTS provider: ${provider}` });
      }
    } catch (error: any) {
      app.log.error('Streaming TTS error:', error);
      if (!reply.sent) {
        const message =
          error.response?.data?.detail?.message ||
          error.message ||
          'Failed to start streaming TTS';
        const statusCode = error.response?.status || 500;
        return reply.code(statusCode).send({ error: message });
      }
    }
  });

  app.log.info('[routes/tts/index.ts] TTS routes registered under /tts');
};

export default ttsRoutes;
