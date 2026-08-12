/**
 * Export a SalesSession and its Messages to JSON files for local import.
 *
 * Usage:
 *   node scripts/export-session.js <sessionId>
 *
 * Connects to the database configured in .env.prod (DATABASE_URL),
 * fetches the session + messages, and writes two JSON files.
 *
 * To import into local MongoDB:
 *   mongoimport --uri "mongodb://localhost:27017/<dbname>" --collection salessessions --file export-session-<id>.json
 *   mongoimport --uri "mongodb://localhost:27017/<dbname>" --collection messages --jsonArray --file export-messages-<id>.json
 */

import { config } from 'dotenv';
import { connect, disconnect } from 'mongoose';
import { writeFileSync } from 'fs';
import { EJSON } from 'bson';
import { SalesSession } from '../src/models/SalesSession.js';
import { Message } from '../src/models/Message.js';

config({ path: '.env.prod' });

const sessionId = process.argv[2];

if (!sessionId) {
  console.error('Usage: node scripts/export-session.js <sessionId>');
  process.exit(1);
}

async function exportSession(sessionId) {
  try {
    console.log('Connecting to database...');
    await connect(process.env.DATABASE_URL);

    console.log(`Fetching session ${sessionId}...`);
    const session = await SalesSession.findById(sessionId).lean().orFail();

    console.log(`Fetching ${session.messages.length} messages...`);
    const messages = await Message.find({
      _id: { $in: session.messages },
    })
      .lean()
      .sort({ sent: 1 });

    console.log(`Found ${messages.length} messages.`);

    const sessionFile = `export-session-${sessionId}.json`;
    const messagesFile = `export-messages-${sessionId}.json`;

    writeFileSync(sessionFile, EJSON.stringify(session, undefined, 2, { relaxed: false }));
    writeFileSync(messagesFile, EJSON.stringify(messages, undefined, 2, { relaxed: false }));

    console.log(`\nExported:`);
    console.log(`  Session: ${sessionFile}`);
    console.log(`  Messages: ${messagesFile}`);
    console.log(`\nTo import into local MongoDB:`);
    console.log(
      `  mongoimport --uri "mongodb://localhost:27017/<dbname>" --collection salessessions --file ${sessionFile}`,
    );
    console.log(
      `  mongoimport --uri "mongodb://localhost:27017/<dbname>" --collection messages --jsonArray --file ${messagesFile}`,
    );

    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error exporting session:', error);
    await disconnect();
    process.exit(1);
  }
}

exportSession(sessionId);
