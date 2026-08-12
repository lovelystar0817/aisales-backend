import mongoose from 'mongoose';
import { writeFile } from 'fs/promises';

import { User } from '../../src/models/User.js';
import { SalesSession } from '../../src/models/SalesSession.js';
import { Company } from '../../src/models/Company.js';

const DATABASE_URL =
  process.env.AISALES_MONGODB_URI ??
  'mongodb+srv://doadmin:8oyMk67B120Z4vz5@ai-coaching-db-88016a9f.mongo.ondigitalocean.com/aisales?tls=true&authSource=admin&replicaSet=ai-coaching-db';

const TARGET_COMPANIES = ['Grab', 'Prudential', 'Manulife', 'PLT'];

const TRAFFIC_LIGHT_THRESHOLDS = {
  minSessions: 12,
  minTotalMinutes: 120,
  minLoginDays: 3,
  minAvgDurationMinutes: 6,
};

const ANALYSIS_WINDOW_DAYS = parseInt(
  process.env.TRAFFIC_LIGHT_WINDOW_DAYS ?? '30',
  10,
);

type ThresholdKeys = keyof typeof TRAFFIC_LIGHT_THRESHOLDS;
const THRESHOLD_KEYS = Object.keys(
  TRAFFIC_LIGHT_THRESHOLDS,
) as ThresholdKeys[];

type TrafficBand = 'green' | 'yellow' | 'red';

interface RepMetrics {
  totalSessions: number;
  totalTimeMinutes: number;
  loginDays: number;
  avgSessionDurationMinutes: number;
  firstSessionAt: Date | null;
  lastSessionAt: Date | null;
}

interface RepClassification {
  band: TrafficBand;
  score: number;
  metThresholds: Record<ThresholdKeys, boolean>;
}

interface RepRecord {
  userId: string;
  name: string;
  email: string;
  status: string;
  companyId: string;
  companyName: string;
  metrics: RepMetrics;
  classification: RepClassification;
}

function calculateSessionDuration(session: any): {
  minutes: number;
  usedRoleplay: boolean;
} {
  if (session.roleplay?.duration && typeof session.roleplay.duration === 'number') {
    let duration = session.roleplay.duration;
    if (duration > 1800) {
      duration = 600;
    }
    return { minutes: duration / 60, usedRoleplay: true };
  }

  if (session.endedAt && session.startedAt) {
    const durationMs =
      new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
    return { minutes: durationMs / 60000, usedRoleplay: false };
  }

  return { minutes: 10 / 60, usedRoleplay: false };
}

function classifyRep(metrics: RepMetrics): RepClassification {
  const metThresholds: Record<ThresholdKeys, boolean> = {
    minSessions: metrics.totalSessions >= TRAFFIC_LIGHT_THRESHOLDS.minSessions,
    minTotalMinutes:
      metrics.totalTimeMinutes >= TRAFFIC_LIGHT_THRESHOLDS.minTotalMinutes,
    minLoginDays: metrics.loginDays >= TRAFFIC_LIGHT_THRESHOLDS.minLoginDays,
    minAvgDurationMinutes:
      metrics.avgSessionDurationMinutes >=
      TRAFFIC_LIGHT_THRESHOLDS.minAvgDurationMinutes,
  };

  const score = THRESHOLD_KEYS.reduce(
    (acc, key) => acc + (metThresholds[key] ? 1 : 0),
    0,
  );

  let band: TrafficBand = 'red';
  if (score >= 3) {
    band = 'green';
  } else if (score === 2) {
    band = 'yellow';
  }

  return { band, score, metThresholds };
}

async function buildTrafficLightData() {
  const windowEnd = new Date();
  const windowStart = new Date(windowEnd.getTime());
  windowStart.setDate(windowEnd.getDate() - ANALYSIS_WINDOW_DAYS);

  console.log(
    `Traffic light export window: ${windowStart.toISOString()} → ${windowEnd.toISOString()}`,
  );

  console.log('Fetching target companies...');
  const companies = await Company.find({
    name: { $in: TARGET_COMPANIES },
  })
    .lean()
    .exec();

  if (!companies.length) {
    throw new Error('No target companies found for traffic light export.');
  }

  const companyIdMap = new Map<string, (typeof companies)[number]>();
  for (const company of companies) {
    companyIdMap.set(company._id.toString(), company);
  }

  console.log(`Found ${companies.length} companies.`);

  console.log('Fetching users (excluding test/deleted accounts)...');
  const users = await User.find({
    company: { $in: companies.map((c) => c._id) },
    email: { $not: /\+.*@hupo\.co$/ },
    isDeleted: { $ne: true },
  })
    .lean()
    .exec();

  console.log(`Processing ${users.length} users...`);

  const reps: RepRecord[] = [];

  for (const user of users) {
    const sessions = await SalesSession.find({
      user: user._id,
      startedAt: { $exists: true, $gte: windowStart, $lte: windowEnd },
    })
      .sort({ startedAt: 1 })
      .lean()
      .exec();

    const sessionMetrics = sessions.map((session) => {
      const { minutes } = calculateSessionDuration(session);
      return {
        startedAt: session.startedAt ? new Date(session.startedAt) : null,
        endedAt: session.endedAt ? new Date(session.endedAt) : null,
        durationMinutes: Math.round(minutes * 100) / 100,
      };
    });

    const uniqueDays = new Set(
      sessionMetrics
        .map((s) => (s.startedAt ? s.startedAt.toISOString().split('T')[0] : null))
        .filter(Boolean),
    );

    const totalTimeMinutes = sessionMetrics.reduce(
      (sum, s) => sum + s.durationMinutes,
      0,
    );
    const avgSessionDuration =
      sessionMetrics.length > 0 ? totalTimeMinutes / sessionMetrics.length : 0;

    const metrics: RepMetrics = {
      totalSessions: sessionMetrics.length,
      totalTimeMinutes: Math.round(totalTimeMinutes * 100) / 100,
      loginDays: uniqueDays.size,
      avgSessionDurationMinutes: Math.round(avgSessionDuration * 100) / 100,
      firstSessionAt:
        sessionMetrics.length > 0 ? sessionMetrics[0].startedAt ?? null : null,
      lastSessionAt:
        sessionMetrics.length > 0
          ? sessionMetrics[sessionMetrics.length - 1].startedAt ?? null
          : null,
    };

    const classification = classifyRep(metrics);
    const company = companyIdMap.get(user.company.toString());

    reps.push({
      userId: user._id.toString(),
      name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      email: user.email,
      status: user.status ?? 'unknown',
      companyId: user.company.toString(),
      companyName: company?.name ?? 'Unknown',
      metrics,
      classification,
    });
  }

  const companiesSummary = Array.from(companyIdMap.values()).map((company) => {
    const companyReps = reps
      .filter((rep) => rep.companyId === company._id.toString())
      .sort((a, b) => b.metrics.totalSessions - a.metrics.totalSessions);

    const totals = companyReps.reduce(
      (acc, rep) => {
        acc.totalSessions += rep.metrics.totalSessions;
        acc.totalTimeMinutes += rep.metrics.totalTimeMinutes;
        acc.totalLoginDays += rep.metrics.loginDays;
        acc.bandCounts[rep.classification.band] += 1;
        acc.scoreHistogram[rep.classification.score] =
          (acc.scoreHistogram[rep.classification.score] ?? 0) + 1;
        return acc;
      },
      {
        totalSessions: 0,
        totalTimeMinutes: 0,
        totalLoginDays: 0,
        bandCounts: { green: 0, yellow: 0, red: 0 },
        scoreHistogram: {} as Record<number, number>,
      },
    );

    const avgSessionsPerRep =
      companyReps.length > 0
        ? Math.round((totals.totalSessions / companyReps.length) * 100) / 100
        : 0;
    const avgMinutesPerRep =
      companyReps.length > 0
        ? Math.round((totals.totalTimeMinutes / companyReps.length) * 100) / 100
        : 0;

    const exemplars: Record<TrafficBand, RepRecord[]> = {
      green: [],
      yellow: [],
      red: [],
    };

    for (const band of ['green', 'yellow', 'red'] as TrafficBand[]) {
      exemplars[band] = companyReps
        .filter((rep) => rep.classification.band === band)
        .slice(0, 5);
    }

    return {
      companyId: company._id.toString(),
      companyName: company.name,
      repCount: companyReps.length,
      bandCounts: totals.bandCounts,
      scoreHistogram: totals.scoreHistogram,
      totals: {
        sessions: totals.totalSessions,
        timeMinutes: Math.round(totals.totalTimeMinutes * 100) / 100,
        loginDays: totals.totalLoginDays,
      },
      averages: {
        sessionsPerRep: avgSessionsPerRep,
        minutesPerRep: avgMinutesPerRep,
      },
      exemplars: {
        green: exemplars.green.map((rep) => rep.userId),
        yellow: exemplars.yellow.map((rep) => rep.userId),
        red: exemplars.red.map((rep) => rep.userId),
      },
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    product: 'Sales AI',
    analysisWindowDays: ANALYSIS_WINDOW_DAYS,
    thresholds: TRAFFIC_LIGHT_THRESHOLDS,
    totals: {
      reps: reps.length,
      green: reps.filter((rep) => rep.classification.band === 'green').length,
      yellow: reps.filter((rep) => rep.classification.band === 'yellow').length,
      red: reps.filter((rep) => rep.classification.band === 'red').length,
    },
    companies: companiesSummary,
    reps: reps.map((rep) => ({
      ...rep,
      metrics: {
        ...rep.metrics,
        firstSessionAt: rep.metrics.firstSessionAt
          ? rep.metrics.firstSessionAt.toISOString()
          : null,
        lastSessionAt: rep.metrics.lastSessionAt
          ? rep.metrics.lastSessionAt.toISOString()
          : null,
      },
    })),
  };

  await writeFile(
    'analytics/data/traffic-light-sales-ai.json',
    JSON.stringify(payload, null, 2),
  );

  return payload;
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 30_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });
    console.log('✓ Connected');

    const payload = await buildTrafficLightData();
    console.log(
      `Traffic light export complete. Reps processed: ${payload.reps.length}.`,
    );
    console.log(
      `Output saved to analytics/data/traffic-light-sales-ai.json (green: ${payload.totals.green}, yellow: ${payload.totals.yellow}, red: ${payload.totals.red}).`,
    );
  } catch (error) {
    console.error('Failed to export traffic light data:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {
      // no-op
    });
    console.log('Disconnected from MongoDB');
  }
}

main();
