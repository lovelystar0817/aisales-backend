/**
 * Manual script to regenerate GoalReady assessment for a specific session
 * Usage: node scripts/regenerate-goalready-assessment.js <sessionId>
 */

import { config } from 'dotenv';
import { connect, disconnect } from 'mongoose';
import { SalesSession } from '../dist/models/SalesSession.js';
import { Message } from '../dist/models/Message.js';
import { assessGoalReadySession } from '../dist/utils/assessment/manulife.js';
import { DEFAULT_FRAMEWORK } from '../dist/frameworks/common.js';

// Load environment variables
config({ path: '.env.local' });

const sessionId = process.argv[2];

if (!sessionId) {
  console.error('Usage: node scripts/regenerate-goalready-assessment.js <sessionId>');
  process.exit(1);
}

async function regenerateGoalReadyAssessment(sessionId) {
  try {
    console.log(`Connecting to database...`);
    await connect(process.env.DATABASE_URL);

    console.log(`Fetching session ${sessionId}...`);
    const session = await SalesSession.findById(sessionId)
      .populate({
        path: 'scenario',
        populate: [{ path: 'persona' }],
      })
      .select('roleplay messages callType assessmentType scenario')
      .orFail();

    if (session.assessmentType !== 'manulife-goalready') {
      console.error(`Error: Session ${sessionId} is not a manulife-goalready session`);
      process.exit(1);
    }

    if (!session.roleplay) {
      console.error(`Error: Session ${sessionId} has no roleplay data`);
      process.exit(1);
    }

    console.log(`Fetching messages...`);
    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (messages.length === 0) {
      console.error(`Error: Session ${sessionId} has no messages`);
      process.exit(1);
    }

    const transcript = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const characterName = session.scenario?.persona?.name || 'Prospect';

    console.log(`Generating GoalReady assessment...`);
    console.log(`- Framework: ${framework}`);
    console.log(`- Call Type: ${session.callType}`);
    console.log(`- Character Name: ${characterName}`);
    console.log(`- Messages: ${messages.length}`);

    const assessmentResult = await assessGoalReadySession(
      transcript,
      session.callType,
      session.roleplay.title || '',
      session.roleplay.objectives || [],
      framework,
      characterName,
      'en', // language
    );

    console.log(`\nAssessment generated successfully!`);
    console.log(`- Overall Score: ${assessmentResult.goalReadyAssessment.overallScore}`);
    console.log(`- Sales & Negotiation: ${assessmentResult.goalReadyAssessment.salesAndNegotiationSkills.score}/100`);
    console.log(`- Soft Skills: ${assessmentResult.goalReadyAssessment.softSkills.score}/100`);
    console.log(`- Product Knowledge: ${assessmentResult.goalReadyAssessment.productKnowledge.score}/100`);

    console.log(`\nSaving to database...`);
    await session.updateOne({
      $set: {
        'roleplay.feedback.salesTechniques': JSON.stringify(assessmentResult),
        'roleplay.feedback.salesTechniquesGenerating': false,
      },
    });

    console.log(`✅ Assessment saved successfully for session ${sessionId}`);

    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error regenerating assessment:', error);
    await disconnect();
    process.exit(1);
  }
}

regenerateGoalReadyAssessment(sessionId);
