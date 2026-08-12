import mongoose from 'mongoose';
import { CallAnalysis } from '../models/CallAnalysis.js';

const DATABASE_URL = process.env.DATABASE_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const USER_ID = process.env.USER_ID;

if (!DATABASE_URL || !COMPANY_ID || !USER_ID) {
  console.error(
    'Required env vars: DATABASE_URL, COMPANY_ID, USER_ID',
  );
  process.exit(1);
}

const completedSteps = {
  transcription: { status: 'completed' as const, startedAt: new Date(), completedAt: new Date() },
  transcriptPIIRemoval: { status: 'completed' as const, startedAt: new Date(), completedAt: new Date() },
  assessment: { status: 'completed' as const, startedAt: new Date(), completedAt: new Date() },
  assessmentPIIRemoval: { status: 'completed' as const, startedAt: new Date(), completedAt: new Date() },
  overview: { status: 'completed' as const, startedAt: new Date(), completedAt: new Date() },
  overviewPIIRemoval: { status: 'completed' as const, startedAt: new Date(), completedAt: new Date() },
};

const failedSteps = {
  transcription: { status: 'failed' as const, startedAt: new Date(), completedAt: new Date(), error: 'Transcription service timeout' },
  transcriptPIIRemoval: { status: 'pending' as const },
  assessment: { status: 'pending' as const },
  assessmentPIIRemoval: { status: 'pending' as const },
  overview: { status: 'pending' as const },
  overviewPIIRemoval: { status: 'pending' as const },
};

function makeTravelEasyAssessment(mandatoryScore: number, softScore: number, knowledgeScore: number) {
  return {
    summary: 'Mock assessment for testing',
    suggestedNextSteps: ['Follow up with customer'],
    mandatory: [
      { criteria: 'Product introduction', evaluation: 'Good', score: mandatoryScore, maxScore: 5, weight: 1 },
      { criteria: 'Needs assessment', evaluation: 'Good', score: Math.min(mandatoryScore + 1, 5), maxScore: 5, weight: 1 },
      { criteria: 'Compliance disclosure', evaluation: 'Good', score: Math.max(mandatoryScore - 1, 0), maxScore: 5, weight: 1 },
    ],
    softSkills: [
      { criteria: 'Active listening', evaluation: 'Good', score: softScore, maxScore: 5, weight: 1 },
      { criteria: 'Empathy', evaluation: 'Good', score: Math.min(softScore + 1, 5), maxScore: 5, weight: 1 },
      { criteria: 'Communication clarity', evaluation: 'Good', score: softScore, maxScore: 5, weight: 1 },
    ],
    knowledgeApplication: [
      { criteria: 'Product knowledge', evaluation: 'Good', score: knowledgeScore, maxScore: 5, weight: 1 },
      { criteria: 'Competitive positioning', evaluation: 'Good', score: Math.max(knowledgeScore - 1, 0), maxScore: 5, weight: 1 },
      { criteria: 'Objection handling', evaluation: 'Good', score: knowledgeScore, maxScore: 5, weight: 1 },
    ],
  };
}

function makeMsigAssessment(overallScore: number, tier: string, hasMandatoryFailures: boolean) {
  return {
    sections: {
      introduction: {
        sectionType: 'introduction',
        sectionWeight: 5,
        description: 'Introduction section',
        evaluations: [
          { criteriaId: 'intro-1', criteriaText: 'Greeting', pass: !hasMandatoryFailures, mandatory: true, evidence: 'Mock evidence' },
        ],
      },
      presentation: {
        sectionType: 'presentation',
        sectionWeight: 40,
        description: 'Presentation section',
        evaluations: [
          { criteriaId: 'pres-1', criteriaText: 'Product explanation', pass: overallScore > 85, mandatory: false, evidence: 'Mock evidence' },
        ],
      },
    },
    overallScore,
    tier,
    hasMandatoryFailures,
    summary: 'Mock MSIG assessment for testing',
    suggestedNextSteps: ['Review mandatory criteria'],
  };
}

function calculateTravelEasyScore(assessment: any): number {
  const allCriteria = [
    ...assessment.mandatory,
    ...assessment.softSkills,
    ...assessment.knowledgeApplication,
  ];
  const totalWeightedScore = allCriteria.reduce((sum: number, c: any) => sum + c.score * c.weight, 0);
  const totalWeightedMax = allCriteria.reduce((sum: number, c: any) => sum + c.maxScore * c.weight, 0);
  return totalWeightedMax > 0 ? Math.round((totalWeightedScore / totalWeightedMax) * 100 * 10) / 10 : 0;
}

const seedData = [
  // --- TravelEasy: various score bands ---
  // L5 Exceptional (>=95)
  { product: undefined, mandatory: 5, soft: 5, knowledge: 5 },
  { product: undefined, mandatory: 5, soft: 4, knowledge: 5 },
  // L4 Excellent (85-94)
  { product: undefined, mandatory: 4, soft: 5, knowledge: 4 },
  { product: undefined, mandatory: 4, soft: 4, knowledge: 4 },
  { product: undefined, mandatory: 5, soft: 4, knowledge: 4 },
  // L3 Good (80-84)
  { product: undefined, mandatory: 4, soft: 4, knowledge: 3 },
  { product: undefined, mandatory: 3, soft: 4, knowledge: 4 },
  // L2 Developing (75-79)
  { product: undefined, mandatory: 3, soft: 4, knowledge: 3 },
  { product: undefined, mandatory: 4, soft: 3, knowledge: 3 },
  // L1 Unsatisfactory (<75)
  { product: undefined, mandatory: 2, soft: 3, knowledge: 2 },
  { product: undefined, mandatory: 1, soft: 2, knowledge: 1 },
  { product: undefined, mandatory: 3, soft: 2, knowledge: 2 },

  // --- PARecovery Plus: various tiers ---
  // Excellent (>=95)
  { product: 'parecoveryplus' as const, msigScore: 97, tier: 'Excellent', mandatory: false },
  { product: 'parecoveryplus' as const, msigScore: 96, tier: 'Excellent', mandatory: false },
  // Good (90-94)
  { product: 'parecoveryplus' as const, msigScore: 92, tier: 'Good', mandatory: false },
  { product: 'parecoveryplus' as const, msigScore: 91, tier: 'Good', mandatory: false },
  // Pass (85-89)
  { product: 'parecoveryplus' as const, msigScore: 87, tier: 'Pass', mandatory: false },
  { product: 'parecoveryplus' as const, msigScore: 86, tier: 'Pass', mandatory: false },
  // Fail (<85)
  { product: 'parecoveryplus' as const, msigScore: 78, tier: 'Fail', mandatory: false },
  // Mandatory failure (no result)
  { product: 'parecoveryplus' as const, msigScore: 60, tier: 'Fail', mandatory: true },
  { product: 'parecoveryplus' as const, msigScore: 45, tier: 'Fail', mandatory: true },

  // --- DentiPlus: various tiers ---
  // Excellent
  { product: 'dentiplus' as const, msigScore: 98, tier: 'Excellent', mandatory: false },
  // Good
  { product: 'dentiplus' as const, msigScore: 93, tier: 'Good', mandatory: false },
  // Pass
  { product: 'dentiplus' as const, msigScore: 88, tier: 'Pass', mandatory: false },
  // Fail
  { product: 'dentiplus' as const, msigScore: 72, tier: 'Fail', mandatory: false },
  // Mandatory failure
  { product: 'dentiplus' as const, msigScore: 50, tier: 'Fail', mandatory: true },
];

async function seed() {
  await mongoose.connect(DATABASE_URL!);
  console.log('Connected to database');

  const records = [];
  const now = new Date();

  for (let i = 0; i < seedData.length; i++) {
    const item = seedData[i];
    const createdAt = new Date(now.getTime() - i * 3600 * 1000); // space out by 1 hour

    if ('msigScore' in item) {
      // MSIG product (PARecovery Plus / DentiPlus)
      const msigAssessment = makeMsigAssessment(item.msigScore!, item.tier!, !!item.mandatory);
      records.push({
        user: new mongoose.Types.ObjectId(USER_ID),
        company: new mongoose.Types.ObjectId(COMPANY_ID),
        audioFileUrl: `https://mock-s3.amazonaws.com/call-analysis/mock-${item.product}-${i}.mp3`,
        fileHash: `mock-hash-${item.product}-${i}`,
        featureVersion: 3,
        product: item.product,
        status: 'completed',
        overallScore: item.mandatory ? null : item.msigScore,
        msigAssessment,
        rawMsigAssessment: msigAssessment,
        processingSteps: completedSteps,
        completedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
    } else {
      // TravelEasy
      const assessment = makeTravelEasyAssessment(item.mandatory!, item.soft!, item.knowledge!);
      const score = calculateTravelEasyScore(assessment);
      records.push({
        user: new mongoose.Types.ObjectId(USER_ID),
        company: new mongoose.Types.ObjectId(COMPANY_ID),
        audioFileUrl: `https://mock-s3.amazonaws.com/call-analysis/mock-traveleasy-${i}.mp3`,
        fileHash: `mock-hash-traveleasy-${i}`,
        featureVersion: 3,
        status: 'completed',
        overallScore: score,
        assessment,
        rawAssessment: assessment,
        overview: {
          keyTakeaways: ['Mock takeaway'],
          callHealth: { positiveSignals: ['Good tone'], risksObserved: [], recommendations: [] },
          actionableNextSteps: { keyActions: ['Follow up'], nextCall: 'Schedule next week' },
        },
        rawOverview: {
          keyTakeaways: ['Mock takeaway'],
          callHealth: { positiveSignals: ['Good tone'], risksObserved: [], recommendations: [] },
          actionableNextSteps: { keyActions: ['Follow up'], nextCall: 'Schedule next week' },
        },
        processingSteps: completedSteps,
        completedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  // Add 2 failed records and 1 processing record
  records.push({
    user: new mongoose.Types.ObjectId(USER_ID),
    company: new mongoose.Types.ObjectId(COMPANY_ID),
    audioFileUrl: 'https://mock-s3.amazonaws.com/call-analysis/mock-failed-1.mp3',
    fileHash: 'mock-hash-failed-1',
    featureVersion: 3,
    product: 'traveleasy',
    status: 'failed',
    processingSteps: failedSteps,
    error: { step: 'transcription', message: 'Transcription service timeout', timestamp: new Date() },
  });

  records.push({
    user: new mongoose.Types.ObjectId(USER_ID),
    company: new mongoose.Types.ObjectId(COMPANY_ID),
    audioFileUrl: 'https://mock-s3.amazonaws.com/call-analysis/mock-failed-2.mp3',
    fileHash: 'mock-hash-failed-2',
    featureVersion: 3,
    product: 'parecoveryplus',
    status: 'failed',
    processingSteps: failedSteps,
    error: { step: 'transcription', message: 'API rate limit', timestamp: new Date() },
  });

  records.push({
    user: new mongoose.Types.ObjectId(USER_ID),
    company: new mongoose.Types.ObjectId(COMPANY_ID),
    audioFileUrl: 'https://mock-s3.amazonaws.com/call-analysis/mock-processing-1.mp3',
    fileHash: 'mock-hash-processing-1',
    featureVersion: 3,
    product: 'dentiplus',
    status: 'processing',
    processingSteps: {
      transcription: { status: 'completed' as const, startedAt: new Date(), completedAt: new Date() },
      transcriptPIIRemoval: { status: 'completed' as const, startedAt: new Date(), completedAt: new Date() },
      assessment: { status: 'in_progress' as const, startedAt: new Date() },
      assessmentPIIRemoval: { status: 'pending' as const },
      overview: { status: 'in_progress' as const, startedAt: new Date() },
      overviewPIIRemoval: { status: 'pending' as const },
    },
  });

  const result = await CallAnalysis.insertMany(records);
  console.log(`Inserted ${result.length} mock call analysis records:`);

  // Summary
  const products: Record<string, number> = {};
  const statuses: Record<string, number> = {};
  let mandatoryFailures = 0;

  for (const r of records) {
    const prod = (r as any).product || 'traveleasy';
    products[prod] = (products[prod] || 0) + 1;
    statuses[r.status] = (statuses[r.status] || 0) + 1;
    if ((r as any).msigAssessment?.hasMandatoryFailures) mandatoryFailures++;
  }

  console.log('\nBy product:', products);
  console.log('By status:', statuses);
  console.log('Mandatory failures:', mandatoryFailures);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
