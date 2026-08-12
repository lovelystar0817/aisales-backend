import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../env.js';
import { connect, disconnect } from 'mongoose';
import { Voice } from '../models/Voice.js';
import { ALL_VOICES } from './voices.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

export async function seedVoices() {
  await connect(process.env.DATABASE_URL!);

  try {
    const operations = ALL_VOICES.map((voice) => ({
      updateOne: {
        filter: { friendlyId: voice.friendlyId },
        update: {
          $set: {
            friendlyId: voice.friendlyId,
            provider: voice.provider,
            providerId: voice.providerId,
            name: voice.name,
            language: voice.language,
            accent: voice.accent,
            gender: voice.gender,
            ageGroup: voice.ageGroup,
            region: voice.region,
            description: voice.description,
            isActive: voice.isActive,
          },
        },
        upsert: true,
      },
    }));

    const result = await Voice.bulkWrite(operations, { ordered: false });
    console.log('Voices seeding completed:', {
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    });
  } catch (error) {
    console.error('Error seeding voices:', error);
  } finally {
    await disconnect();
  }
}

void seedVoices();
