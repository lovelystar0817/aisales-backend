import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../../env.js';
import { connect, disconnect } from 'mongoose';
import { Persona } from '../../models/Persona.js';
import { Voice } from '../../models/Voice.js';

import type {
  PersonaConfiguration,
  SupportedLanguage,
} from '../../data/personas/types.js';
import {
  GRAB_DEFAULT_PERSONA_CONFIGURATIONS,
  GRAB_MEX_PERSONA_CONFIGURATIONS,
} from '../../data/personas/index.js';
import {
  GRAB_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
  SUPPORTED_LANGUAGES,
} from '../../utils/constants.js';
import { Company } from '../../models/Company.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

// Parse company argument
const VALID_COMPANIES = ['grab', 'grab-test'] as const;
type CompanyArg = (typeof VALID_COMPANIES)[number];

function parseCompanyArg(): CompanyArg {
  const companyArg = process.argv.find((arg) => arg.startsWith('--company='));

  if (!companyArg) {
    console.error('Error: --company argument is required');
    console.error('Usage: npx tsx script.ts --company=grab|grab-test');
    process.exit(1);
  }

  const value = companyArg.split('=')[1] as CompanyArg;

  if (!VALID_COMPANIES.includes(value)) {
    console.error(
      `Error: Invalid company "${value}". Must be one of: ${VALID_COMPANIES.join(', ')}`,
    );
    process.exit(1);
  }

  return value;
}

const companyArg = parseCompanyArg();
const TARGET_COMPANY_ID =
  companyArg === 'grab' ? GRAB_COMPANY_ID : GRAB_TEST_COMPANY_ID;
const GRAB_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  ...GRAB_MEX_PERSONA_CONFIGURATIONS,
  ...GRAB_DEFAULT_PERSONA_CONFIGURATIONS,
];

function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8);
}

function generateFriendlyId(name: string, companyFriendlyId?: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const shortId = generateShortId();

  if (!companyFriendlyId) {
    return `${slug}-${shortId}`;
  }

  return `${companyFriendlyId}-${slug}-${shortId}`;
}

export async function seedGrabPersonas() {
  await connect(process.env.DATABASE_URL!);

  try {
    const operations: any[] = [];

    for (const config of GRAB_PERSONA_CONFIGURATIONS) {
      const baseVoice = await Voice.findOne({ providerId: config.base.voiceId })
        .select('_id')
        .lean();

      const company = await Company.findOne({ _id: TARGET_COMPANY_ID })
        .select('_id friendlyId ')
        .orFail();

      const friendlyId = generateFriendlyId(
        config.base.name,
        company.friendlyId,
      );

      const localizations: Record<string, any> = {};
      for (const lang of SUPPORTED_LANGUAGES as SupportedLanguage[]) {
        const localized = config.localized[lang];
        if (!localized || lang === 'en') continue;

        localizations[lang] = {
          occupation: localized.occupation,
          description: localized.description,
          details: localized.details,
          personalityDetails: localized.personalityDetails,
          voiceId: localized.voiceId || config.base.voiceId,
        };
      }

      operations.push({
        updateOne: {
          filter: { name: config.base.name, company: TARGET_COMPANY_ID },
          update: {
            $setOnInsert: { friendlyId },
            $set: {
              company: TARGET_COMPANY_ID,
              name: config.base.name,
              age: config.base.age,
              occupation: config.localized.en.occupation,
              image: config.base.image,
              gender: config.base.gender,
              description: config.localized.en.description,
              details: config.localized.en.details,
              annualIncome: config.base.annualIncome,
              voice: baseVoice?._id ?? undefined,
              voiceId: config.base.voiceId,
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
      console.log('Grab personas seeding completed:', {
        company: companyArg,
        companyId: TARGET_COMPANY_ID,
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        matched: result.matchedCount,
      });
    } else {
      console.log('No Grab persona operations to execute.');
    }
  } catch (error) {
    console.error('Error seeding Grab personas:', error);
  } finally {
    await disconnect();
  }
}

void seedGrabPersonas();
