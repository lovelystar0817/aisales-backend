import OpenAI from 'openai';
import LanguageDetect from 'languagedetect';
import { DEFAULT_OPENAI_MODEL } from './constants.js';
import { getLanguageName } from './languages.js';

type FeedbackResponse = {
  question: string;
  answer: string;
};

const MIN_TEXT_LENGTH = 3;
const ENGLISH_DETECTION_THRESHOLD = 0.3; // Minimum confidence score to consider text as English
let openaiClient: OpenAI | null = null;
let languageDetector: LanguageDetect | null = null;
let missingKeyLogged = false;

const getLanguageDetector = () => {
  if (!languageDetector) {
    languageDetector = new LanguageDetect();
  }
  return languageDetector;
};

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    if (!missingKeyLogged) {
      console.warn(
        'OPENAI_API_KEY is not set. Skipping English translation for feedback.',
      );
      missingKeyLogged = true;
    }
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openaiClient;
};

const extractTranslationText = (response: any): string | null => {
  if (!response) {
    return null;
  }

  // Primary path: Responses API returns output_text as a string
  if (typeof response.output_text === 'string') {
    const trimmed = response.output_text.trim();
    return trimmed || null;
  }

  // Fallback: Handle array format if API returns it that way
  if (Array.isArray(response.output_text) && response.output_text.length > 0) {
    const joined = response.output_text.join('\n').trim();
    if (joined) {
      return joined;
    }
  }

  // Additional fallback: Handle potential alternate response formats
  if (Array.isArray(response.output)) {
    const text = response.output
      .flatMap((item: any) => item?.content || [])
      .filter((content: any) => content?.type === 'text')
      .map((content: any) => content?.text?.value || content?.text || '')
      .filter(Boolean)
      .join('\n')
      .trim();

    if (text) {
      return text;
    }
  }

  return null;
};

const translateToEnglish = async (
  text: string,
  language?: string,
): Promise<string | null> => {
  const client = getOpenAIClient();

  if (!client) {
    console.log('[Translation] No OpenAI client available (API key missing?)');
    return null;
  }

  try {
    console.log('[Translation] Calling OpenAI for translation:', {
      text: text.substring(0, 50),
      language,
    });

    const languageName = getLanguageName(language) || language || 'the text';
    const response = await client.responses.create({
      model: DEFAULT_OPENAI_MODEL,
      input: `You are a world-class business translator for user feedback responses.

Instructions:
1. If the text is already in English, return it exactly as-is without any changes
2. If the text is in another language (${languageName} or any language), translate it to natural English
3. Preserve the tone, intent, and meaning
4. Keep the translation concise
5. Only respond with the text itself - no explanations or meta-commentary

Text:
${text}`,
      temperature: 0.2, // Low temperature for consistent translations
    });

    console.log('[Translation] OpenAI response received:', {
      hasOutputText: !!response?.output_text,
      outputTextType: typeof response?.output_text,
    });

    const translation = extractTranslationText(response);
    console.log('[Translation] Extracted translation:', {
      original: text.substring(0, 30),
      translation: translation?.substring(0, 30),
    });

    return translation || null;
  } catch (error) {
    console.error('[Translation] Error calling OpenAI:', error);
    return null;
  }
};

export const addEnglishTranslationsToResponses = async (
  responses: FeedbackResponse[],
  language?: string,
): Promise<FeedbackResponse[]> => {
  console.log('[Translation] Starting translation for responses:', {
    responseCount: responses?.length,
    language,
    responses: responses?.map((r) => ({
      question: r.question?.substring(0, 30),
      answer: r.answer?.substring(0, 30),
    })),
  });

  if (!responses?.length) {
    console.log('[Translation] No responses to translate');
    return responses;
  }

  const normalizedLanguage = language?.toLowerCase();

  // Always check each response - don't skip based on session language
  // Users might write in a different language than the session language
  const enrichedResponses = await Promise.all(
    responses.map(async (response) => {
      if (!response?.answer) {
        return response;
      }

      const answerWithTranslation = await maybeAppendEnglishTranslation({
        answer: response.answer,
        language: normalizedLanguage,
      });

      if (answerWithTranslation === response.answer) {
        return response;
      }

      return { ...response, answer: answerWithTranslation };
    }),
  );

  console.log('[Translation] Completed translations:', {
    enrichedResponses: enrichedResponses?.map((r) => ({
      question: r.question?.substring(0, 30),
      answer: r.answer?.substring(0, 50),
    })),
  });

  return enrichedResponses;
};

const isEnglishText = (text: string): boolean => {
  try {
    const detector = getLanguageDetector();
    const results = detector.detect(text, 1);

    console.log('[Translation] Language detection:', {
      text: text.substring(0, 50),
      results,
    });

    if (!results || results.length === 0) {
      console.log(
        '[Translation] No detection results, will attempt translation',
      );
      return false;
    }

    const [topLanguage, confidence] = results[0];
    const isEnglish =
      topLanguage === 'english' && confidence >= ENGLISH_DETECTION_THRESHOLD;

    console.log('[Translation] Detection result:', {
      topLanguage,
      confidence,
      threshold: ENGLISH_DETECTION_THRESHOLD,
      isEnglish,
    });

    return isEnglish;
  } catch (error) {
    console.error('[Translation] Error detecting language:', error);
    return false;
  }
};

export const maybeAppendEnglishTranslation = async ({
  answer,
  language,
}: {
  answer: string;
  language?: string;
}): Promise<string> => {
  const trimmed = answer?.trim();
  if (!trimmed) {
    return answer;
  }

  // Skip very short responses
  if (trimmed.length <= MIN_TEXT_LENGTH) {
    return answer;
  }

  // Skip if already translated
  if (answer.toLowerCase().includes('(english:')) {
    return answer;
  }

  // Use fast language detection to check if text is already English
  // This saves OpenAI API calls and reduces latency
  if (isEnglishText(trimmed)) {
    return answer;
  }

  // Text is likely non-English, translate it
  const normalizedLanguage = language?.toLowerCase();
  const translation = await translateToEnglish(trimmed, normalizedLanguage);
  if (!translation) {
    return answer;
  }

  // If translation is identical to original, it was already English (backup check)
  if (translation.toLowerCase().trim() === trimmed.toLowerCase()) {
    return answer;
  }

  return `${answer} (English: ${translation})`;
};
