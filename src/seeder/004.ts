import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../env.js';
import { connect, disconnect } from 'mongoose';
import { Scorecard } from '../models/Scorecard.js';
import { ALL_SCORECARDS } from './scorecards.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

export async function seedScorecards() {
  await connect(process.env.DATABASE_URL!);

  try {
    // Prepare operations to upsert scorecards
    const operations = ALL_SCORECARDS.map((scorecard: any) => ({
      updateOne: {
        filter: { friendlyId: scorecard.friendlyId },
        update: {
          $set: {
            name: scorecard.name,
            friendlyId: scorecard.friendlyId,
            company: scorecard.company,
            assessmentType: scorecard.assessmentType,
            enabledAssessments: scorecard.enabledAssessments,
            salesTechniqueFramework: scorecard.salesTechniqueFramework,
            technicalKnowledgeVariant: scorecard.technicalKnowledgeVariant,
            scormPolicy: scorecard.scormPolicy,
            salesTechniqueSections: scorecard.salesTechniqueSections,
            technicalKnowledgeSections: scorecard.technicalKnowledgeSections,
            localizations: scorecard.localizations,
          },
        },
        upsert: true,
      },
    }));

    const result = await Scorecard.bulkWrite(operations, { ordered: false });
    console.log('Scorecards seeding completed:', {
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    });
  } catch (error) {
    console.error('Error seeding scorecards:', error);
  } finally {
    await disconnect();
  }
}

void seedScorecards();
