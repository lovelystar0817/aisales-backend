import mongoose from 'mongoose';
import { CallAnalysis } from '../models/CallAnalysis.js';
import { calculateOverallScore } from '../services/call-analysis/assessment/scoring.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL env var is required');
  process.exit(1);
}

const BATCH_SIZE = 100;

async function backfill() {
  await mongoose.connect(DATABASE_URL!);
  console.log('Connected to database');

  const total = await CallAnalysis.countDocuments({
    status: 'completed',
  });

  console.log(`Found ${total} records to backfill`);

  let processed = 0;
  let updated = 0;

  while (processed < total) {
    const records = await CallAnalysis.find({
      status: 'completed',
    })
      .select('_id assessment msigAssessment')
      .skip(processed)
      .limit(BATCH_SIZE)
      .lean();

    if (records.length === 0) {
      break;
    }

    const operations = records.map((record) => {
      let score: number | null = null;
      if (record.msigAssessment) {
        score = record.msigAssessment.hasMandatoryFailures
          ? null
          : record.msigAssessment.overallScore;
      } else if (record.assessment) {
        const { percentage } = calculateOverallScore(record.assessment);
        score = Math.round(percentage * 10) / 10;
      }

      return {
        updateOne: {
          filter: { _id: record._id },
          update: { $set: { overallScore: score } },
        },
      };
    });

    await CallAnalysis.bulkWrite(operations);
    updated += operations.length;

    processed += records.length;
    console.log(`Processed ${processed}/${total} (updated ${updated})`);
  }

  console.log(`Done. Updated ${updated} records.`);
  await mongoose.disconnect();
}



backfill().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
});