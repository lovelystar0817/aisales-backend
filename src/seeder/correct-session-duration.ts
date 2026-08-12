import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../env.js';
import { connect, disconnect } from 'mongoose';
import { SalesSession } from '../models/SalesSession.js';
import * as readline from 'readline';

dotenv.config({ path: join(process.cwd(), envExtension()) });

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Calculate duration from messages: latest message timestamp - first message timestamp (in seconds)
 */
function calculateDurationFromMessages(messages: any[]): number {
  if (messages.length === 0) {
    return 0;
  }

  // Sort messages by timestamp to ensure correct order
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.sent).getTime() - new Date(b.sent).getTime(),
  );

  const firstMessageTime = new Date(sortedMessages[0].sent).getTime();
  const lastMessageTime = new Date(
    sortedMessages[sortedMessages.length - 1].sent,
  ).getTime();

  return Math.max(0, (lastMessageTime - firstMessageTime) / 1000);
}

async function analyzeSessions() {
  console.log('🔍 Analyzing sales sessions with abnormal durations...\n');

  // Find sessions where roleplay.duration >= 3600 seconds (1 hour)
  const sessions = await SalesSession.find({
    'roleplay.duration': { $gte: 3600 },
    endedAt: { $exists: true }, // Only process ended sessions
  })
    .select('_id roleplay.duration messages endedAt')
    .populate('messages')
    .lean();

  console.log(`📊 Found ${sessions.length} sessions with duration >= 1 hour\n`);

  if (sessions.length === 0) {
    return { sessions: [], stats: null };
  }

  // Show some statistics
  const durations = sessions.map((s) => s.roleplay?.duration ?? 0);
  const maxDuration = Math.max(...durations);
  const minDuration = Math.min(...durations);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  console.log('📈 Duration Statistics:');
  console.log(
    `   Max: ${maxDuration.toFixed(2)} seconds (${(maxDuration / 3600).toFixed(2)} hours)`,
  );
  console.log(
    `   Min: ${minDuration.toFixed(2)} seconds (${(minDuration / 3600).toFixed(2)} hours)`,
  );
  console.log(
    `   Avg: ${avgDuration.toFixed(2)} seconds (${(avgDuration / 3600).toFixed(2)} hours)\n`,
  );

  return {
    sessions,
    stats: {
      count: sessions.length,
      maxDuration,
      minDuration,
      avgDuration,
    },
  };
}

export async function correctSessionDurations() {
  console.log('🔧 Starting session duration correction...\n');

  const analysisResult = await analyzeSessions();

  if (!analysisResult.sessions || analysisResult.sessions.length === 0) {
    console.log('✅ No sessions found with abnormal durations');
    return;
  }

  const { sessions, stats } = analysisResult;

  console.log(
    `⚠️  WARNING: This will update ${sessions.length} sales sessions with corrected durations calculated from message timestamps.`,
  );

  const confirmed = await askConfirmation(
    '\n❓ Do you want to proceed with the correction? (yes/no): ',
  );

  if (!confirmed) {
    console.log('❌ Correction cancelled by user');
    return;
  }

  console.log('\n🔄 Starting correction process...\n');

  let correctedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const corrections: Array<{
    sessionId: string;
    oldDuration: number;
    newDuration: number;
  }> = [];

  for (const session of sessions) {
    try {
      const sessionId = session._id.toString();
      const oldDuration = session.roleplay?.duration ?? 0;

      // Messages are already populated
      const messages = session.messages || [];

      if (messages.length === 0) {
        // If no messages, unset duration (set to null) to match unfinished sessions pattern
        await SalesSession.findByIdAndUpdate(sessionId, {
          $unset: { 'roleplay.duration': '' },
        });

        corrections.push({
          sessionId,
          oldDuration,
          newDuration: 0, // Using 0 for display purposes, but actually unset in DB
        });

        correctedCount++;
        console.log(
          `🔧 Session ${sessionId}: No messages found, unsetting duration (was ${oldDuration.toFixed(2)}s)`,
        );
        continue;
      }

      // Calculate correct duration
      const newDuration = calculateDurationFromMessages(messages);

      // Update session if duration changed
      if (Math.abs(oldDuration - newDuration) > 1) {
        // Only update if difference is more than 1 second
        await SalesSession.findByIdAndUpdate(sessionId, {
          $set: { 'roleplay.duration': newDuration },
        });

        corrections.push({
          sessionId,
          oldDuration,
          newDuration,
        });

        correctedCount++;
        console.log(
          `✅ Session ${sessionId}: ${oldDuration.toFixed(2)}s → ${newDuration.toFixed(2)}s (${((oldDuration - newDuration) / 60).toFixed(2)} min difference)`,
        );
      } else {
        skippedCount++;
        console.log(
          `⏭️  Session ${sessionId}: Duration difference < 1s, skipping...`,
        );
      }
    } catch (error) {
      errorCount++;
      console.error(
        `❌ Error processing session ${session._id}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log('\n📊 Correction Summary:');
  console.log(`✅ Sessions corrected: ${correctedCount}`);
  console.log(`⏭️  Sessions skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  if (corrections.length > 0) {
    console.log('\n📋 Sample corrections (first 10):');
    corrections.slice(0, 10).forEach((correction) => {
      console.log(
        `   ${correction.sessionId}: ${correction.oldDuration.toFixed(2)}s → ${correction.newDuration.toFixed(2)}s`,
      );
    });
    if (corrections.length > 10) {
      console.log(`   ... and ${corrections.length - 10} more`);
    }
  }

  console.log('\n🎉 Session duration correction completed!');
}

async function main() {
  try {
    await connect(process.env.DATABASE_URL!);
    console.log('✅ Connected to MongoDB');
    await correctSessionDurations();
  } catch (error) {
    console.error('❌ Error during correction:', error);
    process.exit(1);
  } finally {
    rl.close();
    await disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
