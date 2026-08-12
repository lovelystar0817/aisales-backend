import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../env.js';
import { connect, disconnect, Types } from 'mongoose';
import { Persona } from '../models/Persona.js';
import { Voice } from '../models/Voice.js';
import { ALL_PERSONA_CONFIGURATIONS } from '../data/personas/index.js';
import type { SupportedLanguage } from '../data/personas/types.js';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

export async function seedPersonas() {
  await connect(process.env.DATABASE_URL!);

  try {
    const operations: any[] = [];

    for (const config of ALL_PERSONA_CONFIGURATIONS) {
      // Resolve base voice for default language (en)
      const baseVoice = await Voice.findOne({ providerId: config.base.voiceId })
        .select('_id')
        .lean();

      const personaId = config.base.id; // stored as string in model

      // Build localizations map
      const localizations: Record<string, any> = {};
      for (const lang of SUPPORTED_LANGUAGES as SupportedLanguage[]) {
        const localized = config.localized[lang];
        if (!localized || lang === 'en') continue;

        localizations[lang] = {
          ...(localized.name ? { name: localized.name } : {}),
          occupation: localized.occupation,
          description: localized.description,
          details: localized.details,
          personalityDetails: localized.personalityDetails,
          voiceId: localized.voiceId || config.base.voiceId,
        };
      }

      operations.push({
        updateOne: {
          filter: { friendlyId: config.base.friendlyId },
          update: {
            $setOnInsert: { _id: personaId },
            $set: {
              friendlyId: config.base.friendlyId,
              name: config.base.name,
              age: config.base.age,
              occupation: config.localized.en.occupation,
              image: config.base.image,
              gender: config.base.gender,
              details: config.localized.en.details,
              annualIncome: config.base.annualIncome,
              monthlyIncome: config.base.monthlyIncome ?? null,
              voice: baseVoice?._id ?? undefined,
              localizations,
              personalityDetails: config.localized.en.personalityDetails,
            },
          },
          upsert: true,
        },
      });
    }

    if (operations.length > 0) {
      const result = await Persona.bulkWrite(operations, { ordered: false });
      console.log('Personas seeding completed:', {
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        matched: result.matchedCount,
      });
    } else {
      console.log('No persona operations to execute.');
    }
  } catch (error) {
    console.error('Error seeding personas:', error);
  } finally {
    await disconnect();
  }
}

void seedPersonas();
