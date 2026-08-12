import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import axios from 'axios';
import { Voice } from '../../models/Voice.js';
import { VoicePreviewCache } from '../../models/VoicePreviewCache.js';
import { S3 } from '../../libs/s3.js';

// Sample text for voice preview by language
const PREVIEW_TEXT: Record<string, string> = {
  en: 'Hello! This is a preview of how this voice sounds.',
  id: 'Halo! Ini adalah contoh suara yang akan digunakan.',
  ms: 'Hai! Ini adalah contoh bagaimana suara ini kedengaran.',
  th: 'สวัสดี! นี่คือตัวอย่างเสียงที่จะใช้',
  tl: 'Kamusta! Ito ay isang sample ng boses na ito.',
  vi: 'Xin chào! Đây là bản xem trước giọng nói này.',
};

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Apply authentication middleware
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  // ==========================================================================
  // GET /manage/voice/list - Get available voices filtered by gender
  // ==========================================================================
  app.get('/list', {
    schema: {
      querystring: z.object({
        gender: z.enum(['male', 'female']).optional(),
      }),
    },
    handler: async (req, reply) => {
      try {
        const { gender } = req.query as { gender?: 'male' | 'female' };

        const query: Record<string, unknown> = { isActive: true };
        if (gender) {
          query.gender = gender;
        }

        const voices = await Voice.find(query)
          .select(
            '_id friendlyId providerId name language gender ageGroup description',
          )
          .sort({ language: 1, gender: 1, ageGroup: 1 })
          .lean();

        // Group voices by language for UI convenience
        const voicesByLanguage: Record<string, typeof voices> = {};
        voices.forEach((voice) => {
          if (!voicesByLanguage[voice.language]) {
            voicesByLanguage[voice.language] = [];
          }
          voicesByLanguage[voice.language].push(voice);
        });

        return reply.send({
          success: true,
          voices,
          voicesByLanguage,
        });
      } catch (error) {
        console.error('Error fetching voices:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch voices',
        });
      }
    },
  });

  // ==========================================================================
  // GET /manage/voice/preview/:voiceId - Get preview audio for a voice
  // ==========================================================================
  app.get('/preview/:voiceId', {
    schema: {
      params: z.object({
        voiceId: z.string(),
      }),
    },
    handler: async (req, reply) => {
      try {
        const { voiceId } = req.params;

        // Find the voice in the database
        const voice = await Voice.findById(voiceId).lean();
        if (!voice) {
          return reply.status(404).send({
            success: false,
            error: 'Voice not found',
          });
        }

        const { providerId, language } = voice;

        // Check cache first
        const cached = await VoicePreviewCache.findOne({ providerId }).lean();
        if (cached?.s3Url) {
          app.log.info(`Serving cached voice preview for ${providerId}`);
          try {
            const audioBuffer = await S3.getFileBufferFromProductUpload(
              cached.s3Url.replace(
                'https://aisales-product-info.s3.amazonaws.com/',
                '',
              ),
            );
            reply.header('Content-Type', 'audio/mpeg');
            reply.header('Cache-Control', 'public, max-age=86400');
            return reply.send(audioBuffer);
          } catch (err) {
            app.log.warn(`Cached S3 file not found, regenerating: ${err}`);
            // Fall through to regenerate
          }
        }

        // Generate new preview audio via ElevenLabs
        if (!process.env.ELEVENLABS_API_KEY) {
          app.log.error('ELEVENLABS_API_KEY is not set');
          return reply.status(500).send({
            success: false,
            error: 'TTS not configured',
          });
        }

        const previewText = PREVIEW_TEXT[language] || PREVIEW_TEXT['en'];

        app.log.info(
          `Generating voice preview for ${providerId} in language ${language}`,
        );

        const response = await axios({
          method: 'POST',
          url: `https://api.elevenlabs.io/v1/text-to-speech/${providerId}`,
          headers: {
            Accept: 'audio/mpeg',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          data: {
            text: previewText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true,
            },
          },
          responseType: 'arraybuffer',
        });

        const audioBuffer = Buffer.from(response.data);

        // Upload to S3
        const s3Key = `voice-previews/${providerId}.mp3`;
        const s3Url = await S3.uploadToProductBucket(
          audioBuffer,
          s3Key,
          'audio/mpeg',
        );
        app.log.info(`Uploaded voice preview to S3: ${s3Key}`);

        // Cache S3 URL in MongoDB (upsert to handle race conditions)
        await VoicePreviewCache.findOneAndUpdate(
          { providerId },
          { providerId, language, s3Url },
          { upsert: true },
        );
        app.log.info(`Cached voice preview URL for ${providerId}`);

        reply.header('Content-Type', 'audio/mpeg');
        reply.header('Cache-Control', 'public, max-age=86400');
        return reply.send(audioBuffer);
      } catch (error: any) {
        app.log.error('Error generating voice preview:', error);
        const message =
          error.response?.data?.detail?.message ||
          error.message ||
          'Failed to generate voice preview';
        const statusCode = error.response?.status || 500;
        return reply.status(statusCode).send({
          success: false,
          error: message,
        });
      }
    },
  });
};

export default router;
