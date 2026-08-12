import { ChatOpenAI } from '@langchain/openai';
import { S3 } from '../../libs/s3.js';
import {
  Persona,
  PersonaDetails,
  PersonaLocalizations,
} from '../../models/Persona.js';
import {
  CLOUDFRONT_DOMAIN_AI_AVATARS,
  DEFAULT_OPENAI_MODEL,
  SUPPORTED_LANGUAGES_WITH_NAMES,
} from '../constants.js';
import {
  generateDescription,
  getPersonaTranslationPrompt,
} from '../../prompts/persona.js';
import { parseBulletPoints } from '../persona.js';

export interface PersonaTranslationContent {
  occupation: string;
  description?: string;
  details: PersonaDetails;
  personalityDetails?: {
    persona: string;
    communicationStyle: string[];
    decisionMaking: string[];
  };
}

interface TranslatedPersonaContent {
  occupation: string;
  description?: string;
  details: PersonaDetails;
  personalityDetails?: {
    persona: string;
    communicationStyle: string[];
    decisionMaking: string[];
  };
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface UploadAvatarToS3Params {
  base64Data: string;
  companyId: string;
  personaName: string;
}

export function generateDescriptionWithAI(params: {
  personaId: string;
  name: string;
  age: number;
  role: string;
  gender: string;
  personalityTrait: string;
  decisionMakingStyle: string;
  communicationStyle: string;
  details: PersonaDetails;
}): void {
  const {
    personaId,
    name,
    age,
    role,
    gender,
    personalityTrait,
    decisionMakingStyle,
    communicationStyle,
    details,
  } = params;

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 0.7,
    maxRetries: 2,
  });

  generateDescription(
    {
      name,
      age,
      role,
      gender,
      personalityTrait,
      decisionMakingStyle,
      communicationStyle,
      details,
    },
    model,
  )
    .then(async (description) => {
      // Update the persona with the generated description
      await Persona.findByIdAndUpdate(personaId, {
        description,
      });
      console.log(`✓ Description generated for persona ${personaId}`);

      // Now trigger translation with the generated description
      const decisionMakingArray = parseBulletPoints(decisionMakingStyle);
      const communicationStyleArray = parseBulletPoints(communicationStyle);

      translatePersonaContent({
        personaId,
        occupation: role,
        description, // Include the generated description
        details,
        personalityDetails: {
          persona: personalityTrait,
          communicationStyle: communicationStyleArray,
          decisionMaking: decisionMakingArray,
        },
      });
    })
    .catch((error) => {
      console.error(
        `Error generating description for persona ${personaId}:`,
        error,
      );
    });
}

/**
 * Translates persona content to supported languages asynchronously.
 * This is a fire-and-forget function that updates the persona's localizations field.
 *
 * @param params.targetLanguage - Optional. If provided, only translate to this language.
 *                                Otherwise, translate to all supported languages.
 */
export function translatePersonaContent(params: {
  personaId: string;
  occupation: string;
  description?: string;
  details: PersonaDetails;
  personalityDetails?: {
    persona: string;
    communicationStyle: string[];
    decisionMaking: string[];
  };
  targetLanguage?: string;
}): void {
  const {
    personaId,
    occupation,
    description,
    details,
    personalityDetails,
    targetLanguage,
  } = params;

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 0.3, // Lower temperature for more consistent translations
    maxRetries: 2,
  });

  const content: PersonaTranslationContent = {
    occupation,
    description,
    details,
    personalityDetails,
  };

  translateToAllLanguages(content, model, targetLanguage)
    .then(async (localizations) => {
      // Merge with existing localizations (preserve voice selections)
      const persona = await Persona.findById(personaId);
      if (!persona) {
        console.error(`Persona ${personaId} not found for translation update`);
        return;
      }

      // Convert existing localizations to plain object (avoid Mongoose map internals)
      const existingLocalizations = persona.localizations
        ? JSON.parse(JSON.stringify(persona.localizations))
        : {};

      const mergedLocalizations: PersonaLocalizations = {};

      for (const [langCode, translation] of Object.entries(localizations)) {
        const existing = existingLocalizations[langCode];
        mergedLocalizations[langCode] = {
          occupation: translation.occupation,
          details: translation.details,
          personalityDetails: translation.personalityDetails,
          description: translation.description,
          // Preserve existing voice selection if present
          voice: existing?.voice || persona.voice,
        };
      }

      await Persona.findByIdAndUpdate(personaId, {
        localizations: mergedLocalizations,
      });

      const langCount = Object.keys(localizations).length;
      const langInfo = targetLanguage
        ? `to ${targetLanguage}`
        : `in ${langCount} languages`;
      console.log(
        `✓ Translations completed for persona ${personaId} ${langInfo}`,
      );
    })
    .catch((error) => {
      console.error(`Error translating persona ${personaId}:`, error);
    });
}

/**
 * Translates content to target languages
 * @param targetLanguage - Optional. If provided, only translate to this language.
 */
async function translateToAllLanguages(
  content: PersonaTranslationContent,
  model: ChatOpenAI,
  targetLanguage?: string,
): Promise<Record<string, TranslatedPersonaContent>> {
  const translations: Record<string, TranslatedPersonaContent> = {};
  const targetLanguages = SUPPORTED_LANGUAGES_WITH_NAMES.filter(
    (lang) => lang.code !== 'en',
  );

  // Determine which languages to translate to
  let languagesToTranslate: Language[];

  if (targetLanguage) {
    // Validate and find the specific target language
    const targetLang = targetLanguages.find(
      (lang) => lang.code.toLowerCase() === targetLanguage.toLowerCase(),
    );

    if (!targetLang) {
      // Check if it's English (source language) or unsupported
      if (targetLanguage.toLowerCase() === 'en') {
        console.log('Skipping translation: English is the source language');
        return translations;
      }
      console.error(`Unsupported target language: ${targetLanguage}`);
      return translations;
    }

    languagesToTranslate = [targetLang];
  } else {
    languagesToTranslate = targetLanguages;
  }

  // Process translations in parallel with concurrency limit
  const batchSize = 3;
  for (let i = 0; i < languagesToTranslate.length; i += batchSize) {
    const batch = languagesToTranslate.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((lang) => translateToLanguage(content, lang, model)),
    );

    results.forEach((result, index) => {
      const lang = batch[index];
      if (result.status === 'fulfilled') {
        translations[lang.code] = result.value;
      } else {
        console.error(`Failed to translate to ${lang.name}:`, result.reason);
      }
    });
  }

  return translations;
}

/**
 * Translates content to a specific language
 */
async function translateToLanguage(
  content: PersonaTranslationContent,
  targetLang: Language,
  model: ChatOpenAI,
): Promise<TranslatedPersonaContent> {
  const prompt = getPersonaTranslationPrompt(content, targetLang);

  const response = await model.invoke(prompt);
  const responseText = (response.content as string).trim();

  // Parse the JSON response
  try {
    // Handle potential markdown code blocks in response
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      responseText,
    ];
    const jsonStr = jsonMatch[1]?.trim() || responseText;
    const parsed = JSON.parse(jsonStr) as TranslatedPersonaContent;

    return {
      occupation: parsed.occupation || content.occupation,
      description: parsed.description,
      details: {
        ...content.details,
        ...parsed.details,
      },
      personalityDetails: parsed.personalityDetails,
    };
  } catch (parseError) {
    console.error(
      `Failed to parse translation response for ${targetLang.name}:`,
      parseError,
    );
    throw new Error(
      `Invalid translation response format for ${targetLang.name}`,
    );
  }
}

export async function uploadAvatarToS3({
  base64Data,
  companyId,
  personaName,
}: UploadAvatarToS3Params): Promise<string> {
  try {
    if (!base64Data) throw new Error('Base64 data is required');
    if (!companyId) throw new Error('Company ID is required');
    if (!personaName) throw new Error('Persona name is required');

    const buffer = Buffer.from(base64Data, 'base64');
    const sanitizedName = personaName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const fileName = `${companyId}/${sanitizedName}-${uniqueId}.png`;

    const uploadResult = await S3.uploadAvatarImage(buffer, fileName);

    // Convert to CloudFront
    const cloudFrontUrl = uploadResult.url.replace(
      `https://${process.env.AWS_AVATAR_BUCKET_NAME}.s3.amazonaws.com`,
      CLOUDFRONT_DOMAIN_AI_AVATARS,
    );

    return cloudFrontUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error(
      `Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
