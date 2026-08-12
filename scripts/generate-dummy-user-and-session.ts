/**
 * Generate Dummy User and SalesSession CLI
 *
 * This script allows you to:
 * - Insert dummy users
 * - Insert dummy SalesSession with legacy template
 * - Insert dummy SalesSession with new template
 *
 * Usage:
 *   npx tsx scripts/generate-dummy-user-and-session.ts --local
 *   npx tsx scripts/generate-dummy-user-and-session.ts --staging
 *   npx tsx scripts/generate-dummy-user-and-session.ts --prod
 *   npx tsx scripts/generate-dummy-user-and-session.ts --local --company=acme-corp
 *   npx tsx scripts/generate-dummy-user-and-session.ts --staging --company=acme-corp
 *   npx tsx scripts/generate-dummy-user-and-session.ts --prod --company=acme-corp
 */

import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';
import readline from 'readline';

// Determine which env file to load
const args = process.argv.slice(2);
const isLocal = args.includes('--local');
const isStaging = args.includes('--staging');
const isProd = args.includes('--prod');

// Get optional company parameter
const companyArg = args.find((arg) => arg.startsWith('--company='));
const companyFriendlyId = companyArg ? companyArg.split('=')[1] : null;

if (!isLocal && !isStaging && !isProd) {
  console.error('ERROR: Must specify --local, --staging, or --prod');
  console.error('  --local    Use .env.local (for local development)');
  console.error('  --staging  Use .env.staging (for staging environment)');
  console.error('  --prod     Use .env.prod (for production)');
  process.exit(1);
}

const envFlags = [isLocal, isStaging, isProd].filter(Boolean);
if (envFlags.length > 1) {
  console.error('ERROR: Cannot specify multiple environment flags');
  console.error('Choose only one: --local, --staging, or --prod');
  process.exit(1);
}

const envFile = isLocal ? '.env.local' : isStaging ? '.env.staging' : '.env.prod';
dotenv.config({ path: envFile });
console.log(`Loaded environment from ${envFile}`);

import { User } from '../src/models/User.js';
import { SalesSession } from '../src/models/SalesSession.js';
import { Company } from '../src/models/Company.js';
import { Module } from '../src/models/Module.js';
import { Scenario } from '../src/models/Scenario.js';
import { Persona } from '../src/models/Persona.js';
import { SalesProduct } from '../src/models/SalesProduct.js';
import { Scorecard } from '../src/models/Scorecard.js';
import { Voice } from '../src/models/Voice.js';
import { ManageUser } from '../src/models/ManageUser.js';
import { Message } from '../src/models/Message.js';
import { getModules } from '../src/utils/module.js';
import { formatCallTypeName } from '../src/utils/manage/shared.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('Ensure .env file contains DATABASE_URL');
  process.exit(1);
}

// Create readline interface for prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Generate random email
function generateRandomEmail(): string {
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `dummy+${randomStr}@hupo.co`;
}

// Generate random auth0Id
function generateRandomAuth0Id(): string {
  const randomHex = new Types.ObjectId().toString();
  return `auth0|${randomHex}`;
}

// Generate random date within a month
function generateRandomDateInMonth(year: number, month: number): Date {
  const day = Math.floor(Math.random() * 28) + 1; // Safe day range
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return new Date(year, month - 1, day, hour, minute, second);
}

// Generate random date in last 6 months
function generateRandomDateInLast6Months(): Date {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const timeDiff = now.getTime() - sixMonthsAgo.getTime();
  const randomTime = Math.random() * timeDiff;

  return new Date(sixMonthsAgo.getTime() + randomTime);
}

// Insert dummy messages for a session
async function insertDummyMessages(sessionStartTime: Date): Promise<Types.ObjectId[]> {
  const messageIds: Types.ObjectId[] = [];

  // Generate 4 pairs of messages (8 total)
  const conversationPairs = [
    { user: 'Hello, I\'m interested in learning more about your product.', ai: 'Hi! I\'d be happy to help you understand our product better. What specific aspects are you most curious about?' },
    { user: 'What are the key features that set this apart from competitors?', ai: 'Great question! Our product offers unique benefits including advanced analytics, seamless integration, and 24/7 customer support. Let me walk you through each feature.' },
    { user: 'That sounds interesting. Can you tell me more about the pricing options?', ai: 'Absolutely! We have flexible pricing plans to suit different needs. We offer starter, professional, and enterprise tiers. Which option would work best for your requirements?' },
    { user: 'I think the professional tier might work. What\'s included in that?', ai: 'The professional tier includes all core features plus priority support, advanced reporting, and custom integrations. Would you like me to send you detailed pricing information?' }
  ];

  let currentTime = new Date(sessionStartTime.getTime());

  for (let i = 0; i < conversationPairs.length; i++) {
    const pair = conversationPairs[i];

    // User message (30-60 seconds after previous)
    currentTime = new Date(currentTime.getTime() + (30 + Math.random() * 30) * 1000);
    const userMessage = await Message.create({
      role: 'user',
      content: pair.user,
      sent: new Date(currentTime),
      createdAt: new Date(currentTime),
      updatedAt: new Date(currentTime),
    });
    messageIds.push(userMessage._id);

    // AI message (5-15 seconds after user message)
    currentTime = new Date(currentTime.getTime() + (5 + Math.random() * 10) * 1000);
    const aiMessage = await Message.create({
      role: 'ai',
      content: pair.ai,
      sent: new Date(currentTime),
      createdAt: new Date(currentTime),
      updatedAt: new Date(currentTime),
      responseTimeSec: 2 + Math.random() * 3, // Random response time between 2-5 seconds
    });
    messageIds.push(aiMessage._id);
  }

  return messageIds;
}

// Insert dummy user
async function insertDummyUser(companyId: string, count: number): Promise<Types.ObjectId[]> {
  console.log(`\n📝 Creating ${count} dummy user(s)...`);
  const userIds: Types.ObjectId[] = [];

  for (let i = 0; i < count; i++) {
    const email = generateRandomEmail();
    const auth0Id = generateRandomAuth0Id();

    const user = new User({
      name: 'Dummy User',
      firstName: 'Dummy',
      lastName: 'User',
      email,
      auth0Id,
      company: new Types.ObjectId(companyId),
      isGuest: false,
      isTester: false,
      isDeleted: false,
      emailVerified: true,
      hasChangedPassword: false,
      teams: [],
      role: 'user',
      status: 'active',
    });

    await user.save();

    console.log(`   ✅ User ${i + 1}/${count} created (ID: ${user._id}, Email: ${email})`);
    userIds.push(user._id);
  }

  return userIds;
}

// Insert dummy SalesSession with legacy template
async function insertLegacySessions(
  companyId: string,
  callType: string,
  count: number,
  dateOption: 'last6months' | string,
  scoreOption: 'manual' | 'random',
  manualScores?: { productKnowledge: number; salesTechnique: number }
) {
  // Get random user from company
  const users = await User.find({ company: companyId, isDeleted: { $ne: true } }).lean();

  if (users.length === 0) {
    throw new Error('No users found for this company');
  }

  console.log(`\n📝 Creating ${count} legacy SalesSession(s)...`);

  for (let i = 0; i < count; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];

    // Generate dates
    let createdAt: Date;
    let updatedAt: Date;
    let endedAt: Date;

    if (dateOption === 'last6months') {
      createdAt = generateRandomDateInLast6Months();
    } else {
      // Parse specific month (format: YYYY-MM)
      const [year, month] = dateOption.split('-').map(Number);
      createdAt = generateRandomDateInMonth(year, month);
    }

    // endedAt is 5-15 minutes after createdAt
    const sessionDuration = (5 + Math.random() * 10) * 60 * 1000;
    endedAt = new Date(createdAt.getTime() + sessionDuration);
    updatedAt = endedAt;

    // Generate scores
    let productKnowledge: number;
    let salesTechnique: number;

    if (scoreOption === 'manual' && manualScores) {
      productKnowledge = manualScores.productKnowledge;
      salesTechnique = manualScores.salesTechnique;
    } else {
      productKnowledge = Math.floor(Math.random() * 41) + 60; // 60-100
      salesTechnique = Math.floor(Math.random() * 41) + 60; // 60-100
    }

    const session = new SalesSession({
      user: randomUser._id,
      callType,
      assessmentType: 'regular',
      product: {
        _id: '1758269873774',
        friendlyId: 'grab-mex-campaigns',
        name: 'GrabFood',
        promptName: 'Grab Mega Sales campaign',
        knowledgePrompt: '\n## Dummy knowledge prompt.',
        productType: 'own',
        modules: ['grab-mex'],
        keyFeatures: ['Dummy key feature'],
        featureHighlight: {
          title: 'Dummy title',
          description: 'Dummy description.',
        },
        evaluationFocus: ['**Dummy Evaluation Focus**: Dummy'],
        callCriteria: {
          title: 'Dummy Hupo Campaign',
          description: 'Dummy description',
          criteria: ['**Dummy Criteria**: dummy criteria'],
          markdown: '\n## Dummy markdown',
        },
      },
      persona: {
        id: '67f76dea5410cedbd5ae7693',
        friendlyId: 'rachel-owner-acai-indulgence',
        name: 'Rachel',
        gender: 'female',
        image: 'https://dopmo1eihgbgm.cloudfront.net/67f76dea5410cedbd5ae7693/sq-rachel.png',
        voiceId: 'ljEOxtzNoGEa58anWyea',
        occupation: 'Dummy occupation',
        description: 'Dummy description.',
        details: {
          location: 'Singapore',
          education: 'Dummy education',
          occupation: 'Dummy occupation',
          financialSituation: 'Dummy financial situation.',
          keyPriorities: ['Dummy key priority'],
          productKnowledge: 'Dummy product knowledge.',
          mainObjection: 'Dummy main objection.',
          salesDescription: 'Dummy sales description.',
          salesGoal: 'Dummy sales goal.',
        },
        personalityDetails: {
          persona: 'Dummy persona',
          communicationStyle: ['Dummy communication style'],
          decisionMaking: ['Dummy decision making'],
        },
      },
      startedAt: createdAt,
      endedAt,
      roleplay: {
        objectives: ['Dummy objective'],
        framework: 'GRAB_MEX_MEDDPICC',
        feedback: {
          salesTechniquesGenerating: false,
          productKnowledgeGenerating: false,
          technicalKnowledgeGenerating: false,
          isStandingGenerating: false,
          overview: JSON.stringify({
            summary: 'Dummy summary',
            suggestedNextSteps: ['Dummy next step'],
          }),
          productKnowledge: JSON.stringify({
            description: 'Dummy description',
            overallScore: productKnowledge,
            maxScore: 100,
          }),
          salesTechniques: JSON.stringify({
            description: 'Dummy description',
            overallScore: salesTechnique,
            maxScore: 100,
          }),
        },
        scormCompletionReady: true,
        conversation: 'https://elevenlabs.io/app/conversational-ai/history/conv_dummy',
        duration: sessionDuration / 1000,
        overallScore: Math.floor((productKnowledge + salesTechnique) / 2),
        scormCompletionTriggeredAt: updatedAt,
      },
      actionTracking: {
        progressPercentage: 0,
        completedActions: [],
        lastUpdated: createdAt,
      },
      scores: {
        productKnowledge,
        salesTechnique,
      },
      messages: [],
      createdAt,
      updatedAt,
    });

    await session.save();

    // Insert messages for this session
    const messageIds = await insertDummyMessages(createdAt);
    session.messages = messageIds;
    await session.save();

    console.log(`   ✅ Session ${i + 1}/${count} created (ID: ${session._id}, User: ${randomUser.email}, Scores: PK=${productKnowledge}, ST=${salesTechnique}, Messages: ${messageIds.length})`);
  }
}

// Insert dummy SalesSession with new template
async function insertNewSessions(
  companyId: string,
  scenarioId: string,
  callType: string,
  count: number,
  dateOption: 'last6months' | string,
  scoreOption: 'manual' | 'random',
  manualScores?: number[]
) {
  // Get random user from company
  const users = await User.find({ company: companyId, isDeleted: { $ne: true } }).lean();

  if (users.length === 0) {
    throw new Error('No users found for this company');
  }

  // Get scenario details
  const scenario = await Scenario.findById(scenarioId)
    .populate('product')
    .populate('persona')
    .populate('scorecard')
    .lean();

  if (!scenario) {
    throw new Error('Scenario not found');
  }

  // Validate scorecard
  const scorecard = scenario.scorecard as any;
  if (!scorecard || !scorecard.sections || scorecard.sections.length === 0) {
    throw new Error('Scenario does not have a valid scorecard with sections');
  }

  console.log(`\n📝 Creating ${count} new SalesSession(s)...`);

  for (let i = 0; i < count; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];

    // Generate dates
    let createdAt: Date;
    let updatedAt: Date;
    let endedAt: Date;

    if (dateOption === 'last6months') {
      createdAt = generateRandomDateInLast6Months();
    } else {
      // Parse specific month (format: YYYY-MM)
      const [year, month] = dateOption.split('-').map(Number);
      createdAt = generateRandomDateInMonth(year, month);
    }

    // endedAt is 5-15 minutes after createdAt
    const sessionDuration = (5 + Math.random() * 10) * 60 * 1000;
    endedAt = new Date(createdAt.getTime() + sessionDuration);
    updatedAt = endedAt;

    // Generate scorecards dynamically based on scorecard sections
    const scorecards = scorecard.sections.map((section: any, index: number) => {
      const overallScore = scoreOption === 'manual' && manualScores && manualScores[index] !== undefined
        ? manualScores[index]
        : Math.floor(Math.random() * 41) + 60; // 60-100

      // Generate dummy criteria based on section's criteria
      const criteria = section.criteria.map((criterion: any) => ({
        title: criterion.title,
        score: Math.floor(Math.random() * 51), // 0-50
        maxScore: 50,
        reason: criterion.description || 'Dummy reason',
        suggestion: 'Dummy suggestion',
        strengths: ['Dummy strength'],
        toImprove: [
          {
            text: 'Dummy improvement',
            status: 'warning',
            correction: 'Dummy correction',
          },
        ],
      }));

      return {
        name: section.name,
        isGenerating: false,
        overallScore,
        maxScore: 100,
        sectionType: section.sectionType,
        criteria,
      };
    });

    // Calculate overall score as average of all scorecard sections
    const overallScore = scorecards.length > 0
      ? Math.floor(scorecards.reduce((sum: number, sc: any) => sum + sc.overallScore, 0) / scorecards.length)
      : 0;

    const session = new SalesSession({
      user: randomUser._id,
      teams: [],
      callType,
      assessmentType: 'scorecard',
      scenario: new Types.ObjectId(scenarioId),
      product: scenario.product,
      persona: scenario.persona,
      startedAt: createdAt,
      endedAt,
      roleplay: {
        objectives: ['• Dummy objective'],
        framework: 'THREE_F_MODEL',
        selectedObjections: [],
        feedback: {
          salesTechniquesGenerating: false,
          productKnowledgeGenerating: false,
          technicalKnowledgeGenerating: false,
          advisoryTechniqueGenerating: false,
          processAdherenceGenerating: false,
          communicationAndPresenceGenerating: false,
          isStandingGenerating: false,
          scorecards,
          overview: JSON.stringify({
            summary: 'Dummy summary',
            suggestedNextSteps: ['Dummy next step'],
          }),
        },
        scormCompletionReady: true,
        conversation: 'https://elevenlabs.io/app/conversational-ai/history/conv_dummy',
        duration: sessionDuration / 1000,
        overallScore,
        scormCompletionTriggeredAt: updatedAt,
      },
      actionTracking: {
        progressPercentage: 0,
        completedActions: [],
        lastUpdated: createdAt,
      },
      messages: [],
      createdAt,
      updatedAt,
    });

    await session.save();

    // Insert messages for this session
    const messageIds = await insertDummyMessages(createdAt);
    session.messages = messageIds;
    await session.save();

    console.log(`   ✅ Session ${i + 1}/${count} created (ID: ${session._id}, User: ${randomUser.email}, Overall: ${overallScore}, Messages: ${messageIds.length})`);
  }
}

// Main function
async function main() {
  await mongoose.connect(DATABASE_URL!);
  console.log('Connected to database\n');

  // Ensure all models are registered (needed for populate to work)
  // This forces Mongoose to register the models before we use them
  [User, SalesSession, Company, Module, Scenario, Persona, SalesProduct, Scorecard, Voice, ManageUser, Message].forEach(
    (model) => model.modelName,
  );

  // Get or validate company
  let companyId: string;

  if (companyFriendlyId) {
    const company = await Company.findOne({ friendlyId: companyFriendlyId }).lean();
    if (!company) {
      console.error(`ERROR: Company with friendlyId "${companyFriendlyId}" not found`);
      await mongoose.disconnect();
      process.exit(1);
    }
    companyId = company._id.toString();
    console.log(`🏢 Using company: ${company.name} (${companyFriendlyId})`);
    console.log(`   Company ID: ${companyId}\n`);
  } else {
    // Ask for company friendlyId
    const inputCompanyId = await question('Enter company friendlyId: ');
    const company = await Company.findOne({ friendlyId: inputCompanyId.trim() }).lean();

    if (!company) {
      console.error(`ERROR: Company with friendlyId "${inputCompanyId}" not found`);
      await mongoose.disconnect();
      rl.close();
      process.exit(1);
    }

    companyId = company._id.toString();
    console.log(`\n🏢 Using company: ${company.name} (${inputCompanyId})`);
    console.log(`   Company ID: ${companyId}\n`);
  }

  // Ask what to do
  console.log('What would you like to do?');
  console.log('1. Insert dummy user');
  console.log('2. Insert dummy SalesSession with legacy template');
  console.log('3. Insert dummy SalesSession with new template');
  console.log('4. Exit');

  const choice = await question('\nEnter choice (1-4): ');

  switch (choice.trim()) {
    case '1': {
      const countStr = await question('How many users to insert? ');
      const count = parseInt(countStr.trim());
      await insertDummyUser(companyId, count);
      break;
    }

    case '2': {
      // Legacy session
      // Get available modules
      const modules = getModules(companyId).map((module) => ({
        id: module.friendlyId,
        name: formatCallTypeName(module.friendlyId),
      }));

      if (modules.length === 0) {
        console.error('ERROR: No modules found for this company');
        break;
      }

      console.log('\nAvailable modules:');
      modules.forEach((m, idx) => {
        console.log(`${idx + 1}. ${m.name} (${m.id})`);
      });

      const moduleChoice = await question(`\nSelect module (1-${modules.length}): `);
      const selectedModule = modules[parseInt(moduleChoice.trim()) - 1];

      if (!selectedModule) {
        console.error('ERROR: Invalid module selection');
        break;
      }

      const callType = selectedModule.id;
      console.log(`\nSelected module: ${selectedModule.name} (${callType})`);

      const countStr = await question('How many sessions to insert? ');
      const count = parseInt(countStr.trim());

      const dateChoice = await question('Date range? (1=last 6 months, 2=specific month): ');
      let dateOption: 'last6months' | string;

      if (dateChoice.trim() === '1') {
        dateOption = 'last6months';
      } else {
        const monthInput = await question('Enter month (YYYY-MM): ');
        dateOption = monthInput.trim();
      }

      const scoreChoice = await question('Scores? (1=manual, 2=random): ');
      let scoreOption: 'manual' | 'random';
      let manualScores: { productKnowledge: number; salesTechnique: number } | undefined;

      if (scoreChoice.trim() === '1') {
        scoreOption = 'manual';
        const pkStr = await question('Product Knowledge score (0-100): ');
        const stStr = await question('Sales Technique score (0-100): ');
        manualScores = {
          productKnowledge: parseInt(pkStr.trim()),
          salesTechnique: parseInt(stStr.trim()),
        };
      } else {
        scoreOption = 'random';
      }

      await insertLegacySessions(companyId, callType, count, dateOption, scoreOption, manualScores);
      break;
    }

    case '3': {
      // New session
      // Get scenarios for company
      const scenarios = await Scenario.find({ company: companyId })
        .populate('module')
        .populate('product')
        .lean();

      if (scenarios.length === 0) {
        console.error('ERROR: No scenarios found for this company');
        break;
      }

      console.log('\nAvailable scenarios:');
      scenarios.forEach((s, idx) => {
        const status = s.isActive ? 'active' : 'inactive';
        console.log(`${idx + 1}. ${(s.module as any)?.title || 'UnknownModule'} - ${(s.product as any)?.name || 'NoProduct'} - ${status}`);
      });

      const scenarioChoice = await question(`\nSelect scenario (1-${scenarios.length}): `);
      const selectedScenario = scenarios[parseInt(scenarioChoice.trim()) - 1];

      if (!selectedScenario) {
        console.error('ERROR: Invalid scenario selection');
        break;
      }

      // Get callType from module
      const module = selectedScenario.module as any;
      const callType = module?.friendlyId || 'discovery-call';

      console.log(`\nSelected scenario with callType: ${callType}`);

      const countStr = await question('How many sessions to insert? ');
      const count = parseInt(countStr.trim());

      const dateChoice = await question('Date range? (1=last 6 months, 2=specific month): ');
      let dateOption: 'last6months' | string;

      if (dateChoice.trim() === '1') {
        dateOption = 'last6months';
      } else {
        const monthInput = await question('Enter month (YYYY-MM): ');
        dateOption = monthInput.trim();
      }

      // Get scorecard to know how many scores to ask for
      const tempScenario = await Scenario.findById(selectedScenario._id).populate('scorecard').lean();
      const tempScorecard = tempScenario?.scorecard as any;

      const scoreChoice = await question('Scores? (1=manual, 2=random): ');
      let scoreOption: 'manual' | 'random';
      let manualScores: number[] | undefined;

      if (scoreChoice.trim() === '1') {
        scoreOption = 'manual';
        manualScores = [];

        if (tempScorecard?.sections) {
          console.log(`\nThis scenario has ${tempScorecard.sections.length} scorecard section(s):`);
          for (let i = 0; i < tempScorecard.sections.length; i++) {
            const section = tempScorecard.sections[i];
            console.log(`  ${i + 1}. ${section.name}`);
            const scoreStr = await question(`     Score for "${section.name}" (0-100): `);
            manualScores.push(parseInt(scoreStr.trim()));
          }
        } else {
          console.log('Warning: No scorecard sections found, using random scores');
          scoreOption = 'random';
        }
      } else {
        scoreOption = 'random';
      }

      await insertNewSessions(
        companyId,
        selectedScenario._id.toString(),
        callType,
        count,
        dateOption,
        scoreOption,
        manualScores
      );
      break;
    }

    case '4':
      console.log('Exiting...');
      break;

    default:
      console.log('Invalid choice');
  }

  await mongoose.disconnect();
  rl.close();
  console.log('\n✅ Done!');
}

main().catch(async (err) => {
  console.error('Failed:', err);
  await mongoose.disconnect();
  rl.close();
  process.exit(1);
});
