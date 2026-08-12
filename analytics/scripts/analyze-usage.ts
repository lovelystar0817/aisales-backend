import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { SalesSession } from './src/models/SalesSession.js';
import { Company } from './src/models/Company.js';
import { writeFile } from 'fs/promises';

const DATABASE_URL = 'mongodb+srv://doadmin:8oyMk67B120Z4vz5@ai-coaching-db-88016a9f.mongo.ondigitalocean.com/aisales?tls=true&authSource=admin&replicaSet=ai-coaching-db';

// Target companies for Sales AI analysis
const TARGET_COMPANIES = [
  'Grab',
  'Prudential',
  'Manulife',
  'PLT'
];

interface UserActivity {
  userId: string;
  userName: string;
  email: string;
  companyId: string;
  companyName: string;
  totalSessions: number;
  loginDays: number;
  totalTimeMinutes: number;
  avgSessionDurationMinutes: number;
  firstLogin: Date | null;
  lastLogin: Date | null;
  sessions: Array<{
    sessionId: string;
    startedAt: Date;
    endedAt: Date | null;
    durationMinutes: number;
    roleplayDuration?: number;
    usedRoleplayDuration: boolean;
  }>;
}

interface CompanyAggregate {
  companyId: string;
  companyName: string;
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalTimeMinutes: number;
  avgSessionsPerUser: number;
  avgTimePerUserMinutes: number;
  avgLoginDaysPerUser: number;
  topUsers: UserActivity[];
}

function calculateSessionDuration(session: any): { minutes: number; usedRoleplay: boolean } {
  // Logic from discussion with Bek:
  // 1. Use roleplay.duration if available (cap at 600 sec if > 1800 sec)
  // 2. Otherwise use endedAt - startedAt
  // 3. Otherwise default to 10 seconds

  if (session.roleplay?.duration && typeof session.roleplay.duration === 'number') {
    let duration = session.roleplay.duration;
    // If > 30 min (1800 sec), normalize to 10 min (600 sec)
    if (duration > 1800) {
      duration = 600;
    }
    return { minutes: duration / 60, usedRoleplay: true };
  }

  if (session.endedAt && session.startedAt) {
    const durationMs = session.endedAt.getTime() - session.startedAt.getTime();
    return { minutes: durationMs / 60000, usedRoleplay: false };
  }

  // Default 10 seconds
  return { minutes: 10 / 60, usedRoleplay: false };
}

async function analyzeSalesActivity() {
  try {
    console.log('Connecting to Sales AI MongoDB...');
    await mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });
    console.log('✓ Connected!\n');

    // Get 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`Analyzing data from ${thirtyDaysAgo.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}\n`);

    // Find target companies
    console.log('Fetching target companies...');
    const companies = await Company.find({
      name: { $in: TARGET_COMPANIES }
    }).lean();

    console.log(`Found ${companies.length} target companies:`);
    companies.forEach(c => console.log(`  - ${c.name}`));
    console.log();

    const companyIds = companies.map(c => c._id);

    // Find all non-test users in target companies
    console.log('Fetching users (excluding test users)...');
    const users = await User.find({
      company: { $in: companyIds },
      email: { $not: /\+.*@hupo\.co$/ },
      isDeleted: { $ne: true }
    }).lean();

    console.log(`Found ${users.length} non-test users in target companies\n`);

    const userActivities: UserActivity[] = [];
    let processedUsers = 0;

    // Analyze each user
    for (const user of users) {
      processedUsers++;
      if (processedUsers % 10 === 0) {
        console.log(`Processing user ${processedUsers}/${users.length}...`);
      }

      const sessions = await SalesSession.find({
        user: user._id,
        startedAt: { $exists: true, $gte: thirtyDaysAgo }
      }).sort({ startedAt: 1 }).lean();

      if (sessions.length === 0) continue;

      // Calculate metrics
      const sessionDetails = sessions.map(session => {
        const { minutes, usedRoleplay } = calculateSessionDuration(session);

        return {
          sessionId: session._id.toString(),
          startedAt: session.startedAt,
          endedAt: session.endedAt || null,
          durationMinutes: Math.round(minutes * 100) / 100,
          roleplayDuration: session.roleplay?.duration,
          usedRoleplayDuration: usedRoleplay
        };
      });

      // Count unique login days
      const uniqueDays = new Set(
        sessions.map(s => s.startedAt.toISOString().split('T')[0])
      );

      const totalTimeSpent = sessionDetails.reduce((sum, s) => sum + s.durationMinutes, 0);
      const avgDuration = sessionDetails.length > 0
        ? totalTimeSpent / sessionDetails.length
        : 0;

      const company = companies.find(c => c._id.toString() === user.company.toString());

      userActivities.push({
        userId: user._id.toString(),
        userName: user.name || `${user.firstName} ${user.lastName}`,
        email: user.email,
        companyId: user.company.toString(),
        companyName: company?.name || 'Unknown',
        totalSessions: sessions.length,
        loginDays: uniqueDays.size,
        totalTimeMinutes: Math.round(totalTimeSpent * 100) / 100,
        avgSessionDurationMinutes: Math.round(avgDuration * 100) / 100,
        firstLogin: sessions[0].startedAt,
        lastLogin: sessions[sessions.length - 1].startedAt,
        sessions: sessionDetails
      });
    }

    console.log(`\n✓ Processed ${userActivities.length} active users\n`);

    // Aggregate by company
    const companyMap = new Map<string, CompanyAggregate>();

    for (const activity of userActivities) {
      if (!companyMap.has(activity.companyId)) {
        companyMap.set(activity.companyId, {
          companyId: activity.companyId,
          companyName: activity.companyName,
          totalUsers: 0,
          activeUsers: 0,
          totalSessions: 0,
          totalTimeMinutes: 0,
          avgSessionsPerUser: 0,
          avgTimePerUserMinutes: 0,
          avgLoginDaysPerUser: 0,
          topUsers: []
        });
      }

      const company = companyMap.get(activity.companyId)!;
      company.totalUsers++;
      if (activity.totalSessions > 0) company.activeUsers++;
      company.totalSessions += activity.totalSessions;
      company.totalTimeMinutes += activity.totalTimeMinutes;
    }

    // Calculate averages and get top users per company
    for (const [companyId, company] of companyMap) {
      company.avgSessionsPerUser = company.activeUsers > 0
        ? Math.round((company.totalSessions / company.activeUsers) * 100) / 100
        : 0;
      company.avgTimePerUserMinutes = company.activeUsers > 0
        ? Math.round((company.totalTimeMinutes / company.activeUsers) * 100) / 100
        : 0;

      // Calculate average login days
      const companyUsers = userActivities.filter(u => u.companyId === companyId);
      const avgLoginDays = companyUsers.reduce((sum, u) => sum + u.loginDays, 0) / companyUsers.length;
      company.avgLoginDaysPerUser = Math.round(avgLoginDays * 100) / 100;

      // Get top 10 users by total time spent
      company.topUsers = userActivities
        .filter(u => u.companyId === companyId)
        .sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes)
        .slice(0, 10);
    }

    // Sort companies by total sessions
    const sortedCompanies = Array.from(companyMap.values())
      .sort((a, b) => b.totalSessions - a.totalSessions);

    // Print results
    console.log('='.repeat(100));
    console.log('SALES AI - COMPANY-LEVEL AGGREGATES (Last 30 Days)');
    console.log('='.repeat(100));
    console.log();

    for (const company of sortedCompanies) {
      console.log(`\n${'─'.repeat(100)}`);
      console.log(`📊 ${company.companyName.toUpperCase()}`);
      console.log(`${'─'.repeat(100)}`);
      console.log(`Total Users: ${company.totalUsers}`);
      console.log(`Active Users (with sessions): ${company.activeUsers}`);
      console.log(`Total Sessions: ${company.totalSessions}`);
      console.log(`Total Time Spent: ${Math.round(company.totalTimeMinutes / 60 * 100) / 100} hours (${Math.round(company.totalTimeMinutes)} minutes)`);
      console.log(`Avg Sessions per Active User: ${company.avgSessionsPerUser}`);
      console.log(`Avg Time per Active User: ${Math.round(company.avgTimePerUserMinutes / 60 * 100) / 100} hours (${Math.round(company.avgTimePerUserMinutes)} minutes)`);
      console.log(`Avg Login Days per User: ${company.avgLoginDaysPerUser}`);
      console.log();

      // Print top users for this company
      console.log(`Top ${Math.min(5, company.topUsers.length)} Users by Time Spent:`);
      console.log();

      for (let i = 0; i < Math.min(5, company.topUsers.length); i++) {
        const user = company.topUsers[i];
        console.log(`  ${i + 1}. ${user.userName} (${user.email})`);
        console.log(`     • Total Sessions: ${user.totalSessions}`);
        console.log(`     • Login Days: ${user.loginDays}`);
        console.log(`     • Total Time: ${Math.round(user.totalTimeMinutes / 60 * 100) / 100} hours (${Math.round(user.totalTimeMinutes)} min)`);
        console.log(`     • Avg Session Duration: ${user.avgSessionDurationMinutes} minutes`);
        console.log(`     • First Login: ${user.firstLogin?.toISOString().split('T')[0]}`);
        console.log(`     • Last Login: ${user.lastLogin?.toISOString().split('T')[0]}`);
        console.log();
      }
    }

    // Print detailed raw data for top 3 users per company
    console.log('\n\n');
    console.log('='.repeat(100));
    console.log('RAW SESSION DATA - TOP 3 USERS PER COMPANY');
    console.log('='.repeat(100));

    for (const company of sortedCompanies) {
      console.log(`\n\n${'═'.repeat(100)}`);
      console.log(`${company.companyName.toUpperCase()} - RAW SESSION DATA`);
      console.log(`${'═'.repeat(100)}`);

      for (let i = 0; i < Math.min(3, company.topUsers.length); i++) {
        const user = company.topUsers[i];
        console.log(`\n${'─'.repeat(100)}`);
        console.log(`User ${i + 1}: ${user.userName} (${user.email})`);
        console.log(`${'─'.repeat(100)}`);
        console.log();
        console.log(`Recent Sessions (showing last ${Math.min(10, user.sessions.length)}):`);
        console.log();

        const recentSessions = user.sessions.slice(-10);
        for (const session of recentSessions) {
          console.log(`  Session ID: ${session.sessionId}`);
          console.log(`  Started: ${session.startedAt.toISOString()}`);
          console.log(`  Ended: ${session.endedAt ? session.endedAt.toISOString() : 'In Progress/Not Recorded'}`);
          console.log(`  Duration: ${session.durationMinutes} minutes`);
          console.log(`  Duration Source: ${session.usedRoleplayDuration ? 'roleplay.duration' : (session.endedAt ? 'timestamp difference' : 'default (10 sec)')}`);
          if (session.roleplayDuration) {
            console.log(`  Raw Roleplay Duration: ${session.roleplayDuration} seconds`);
          }
          console.log();
        }
      }
    }

    // Save detailed report to file
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: new Date().toISOString(),
        description: 'Last 30 days'
      },
      summary: {
        totalCompanies: sortedCompanies.length,
        totalActiveUsers: userActivities.length,
        totalSessions: userActivities.reduce((sum, u) => sum + u.totalSessions, 0),
        totalTimeHours: Math.round(userActivities.reduce((sum, u) => sum + u.totalTimeMinutes, 0) / 60 * 100) / 100,
        durationCalculationMethod: 'roleplay.duration (capped at 10 min if > 30 min), fallback to timestamp diff, default 10 sec'
      },
      companies: sortedCompanies.map(c => ({
        ...c,
        topUsers: c.topUsers.map(u => ({
          ...u,
          sessions: u.sessions.slice(-20) // Include last 20 sessions
        }))
      }))
    };

    await writeFile(
      'sales-ai-usage-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n\n✅ Sales AI Analysis complete!');
    console.log('📄 Detailed report saved to: sales-ai-usage-report.json');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

analyzeSalesActivity();
