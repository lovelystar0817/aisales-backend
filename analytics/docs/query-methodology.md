# Sales AI Usage Analytics - Query Methodology

**Last Updated:** October 7, 2025
**Purpose:** Complete reference for running usage analytics on Sales AI database

---

## Quick Start

### Prerequisites
1. **Database Access:** MongoDB Atlas connection
2. **Credentials:** Available in `.env.local` or provided separately
3. **TLS Certificate:** `/Users/abdik/Projects/ami/api/db-cert.cer`
4. **Node.js:** v18+ with TypeScript support

### Run Analysis (One Command)
```bash
cd /Users/abdik/Projects/ami/ai-sales/aisales-backend
npx tsx analytics/scripts/analyze-usage.ts
```

**Output Files:**
- Console: Formatted report with company breakdowns
- JSON: `analytics/data/usage-data-[DATE].json`

---

## Database Connection

### Connection String
```
mongodb+srv://doadmin:8oyMk67B120Z4vz5@ai-coaching-db-88016a9f.mongo.ondigitalocean.com/aisales?tls=true&authSource=admin&replicaSet=ai-coaching-db
```

### TypeScript Connection Code
```typescript
import mongoose from 'mongoose';

const DATABASE_URL = 'mongodb+srv://doadmin:8oyMk67B120Z4vz5@ai-coaching-db-88016a9f.mongo.ondigitalocean.com/aisales?tls=true&authSource=admin&replicaSet=ai-coaching-db';

await mongoose.connect(DATABASE_URL, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
});
```

**Note:** TLS certificate path is available but connection works without explicit certificate configuration.

---

## Data Models

### Collections Used
1. **users** - User accounts with company references
2. **companies** - Customer organizations
3. **salessessions** - Usage sessions with timing data

### Key Schema Fields

#### Users Collection
```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  company: ObjectId; // Reference to companies
  isDeleted?: boolean;
}
```

#### Companies Collection
```typescript
interface ICompany {
  _id: ObjectId;
  name: string;
}
```

#### SalesSessions Collection
```typescript
interface ISalesSession {
  _id: ObjectId;
  user: ObjectId; // Reference to users
  startedAt: Date;
  endedAt?: Date;
  roleplay?: {
    duration?: number; // In seconds
    title?: string;
  };
  callType?: string;
}
```

---

## Target Companies

### Current Sales AI Customers
```typescript
const TARGET_COMPANIES = [
  'Grab',
  'Prudential',  // Singapore (UOB Group users)
  'Manulife',
  'PLT'          // Prudential Thailand
];
```

### How to Find Company IDs
```bash
npx tsx -e "
import mongoose from 'mongoose';
import { Company } from './src/models/Company.js';

await mongoose.connect('CONNECTION_STRING');
const companies = await Company.find({}).lean();
console.log(companies.map(c => ({ id: c._id, name: c.name })));
await mongoose.disconnect();
"
```

### Company Details
| Name | ID | Market | Email Pattern |
|------|-----|--------|---------------|
| Prudential | 683edc3ffc7dd8560e615750 | Singapore | *@uobgroup.com |
| PLT | 68c2a5193ba842de98a1b32c | Thailand | *@prudential.co.th |
| Manulife | 68accc7c35a46d74e550b719 | Philippines | *@manulife.com |
| Grab | 67f76dea5410cedbd5ae768c | Singapore | *@grabtaxi.com |

---

## Data Filters

### Test User Exclusion
**Rule:** Exclude emails matching pattern `+*@hupo.co`

```typescript
// In query
{
  email: { $not: /\+.*@hupo\.co$/ }
}

// In aggregation
{
  $match: {
    email: { $not: /\+.*@hupo\.co$/ }
  }
}
```

### Date Range (Last 30 Days)
```typescript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

// In query
{
  startedAt: { $gte: thirtyDaysAgo }
}
```

---

## Session Duration Calculation

### Logic Hierarchy
1. **Primary:** Use `roleplay.duration` (if exists and is number)
   - **Normalization:** If > 1800 seconds (30 min), cap at 600 seconds (10 min)
   - **Reason:** Corrupt data can show billions of seconds

2. **Fallback:** Use `endedAt - startedAt` (if endedAt exists)

3. **Default:** 10 seconds (if no duration or endedAt)

### Implementation
```typescript
function calculateSessionDuration(session: any): { minutes: number; usedRoleplay: boolean } {
  // 1. Check roleplay.duration
  if (session.roleplay?.duration && typeof session.roleplay.duration === 'number') {
    let duration = session.roleplay.duration;
    // Normalize if > 30 min, cap at 10 min
    if (duration > 1800) {
      duration = 600;
    }
    return { minutes: duration / 60, usedRoleplay: true };
  }

  // 2. Check timestamp difference
  if (session.endedAt && session.startedAt) {
    const durationMs = session.endedAt.getTime() - session.startedAt.getTime();
    return { minutes: durationMs / 60000, usedRoleplay: false };
  }

  // 3. Default 10 seconds
  return { minutes: 10 / 60, usedRoleplay: false };
}
```

### Why This Matters
- **Accuracy:** Some sessions have corrupt `roleplay.duration` (e.g., 1.7 billion seconds)
- **Consistency:** Ensures comparable metrics across sessions
- **Business Logic:** Discussed with engineering team (Bek) on Oct 7, 2025

---

## Key Metrics Calculated

### Per User
- **Total Sessions:** Count of all sessions
- **Login Days:** Count of unique dates (YYYY-MM-DD)
- **Total Time:** Sum of all session durations
- **Avg Session Duration:** Total time / session count
- **First Login:** Earliest startedAt
- **Last Login:** Latest startedAt

### Per Company
- **Total Users:** Count of distinct users
- **Active Users:** Users with at least 1 session
- **Total Sessions:** Sum of all user sessions
- **Total Time:** Sum of all session durations
- **Avg Sessions per User:** Total sessions / active users
- **Avg Time per User:** Total time / active users
- **Avg Login Days per User:** Average of individual user login days

### Example Calculation
```typescript
// User level
const uniqueDays = new Set(
  sessions.map(s => s.startedAt.toISOString().split('T')[0])
);
const loginDays = uniqueDays.size;

const totalTimeMinutes = sessionDetails.reduce((sum, s) => sum + s.durationMinutes, 0);
const avgDuration = totalTimeMinutes / sessionDetails.length;

// Company level
const avgSessionsPerUser = company.totalSessions / company.activeUsers;
const avgTimePerUser = company.totalTimeMinutes / company.activeUsers;
```

---

## MongoDB Aggregation Queries

### Alternative: Run Queries in MongoDB Compass

See `analytics/docs/mongodb-queries.md` for complete aggregation pipelines that can be run in MongoDB Compass or `mongosh`.

**Advantages:**
- No local setup required
- Visual results
- Easy export to JSON/CSV

**When to Use:**
- GUI preferred over command line
- Need to inspect data visually
- Want to export specific subsets

---

## Output Structure

### Console Output
```
====================================================================================================
SALES AI - COMPANY-LEVEL AGGREGATES (Last 30 Days)
====================================================================================================

────────────────────────────────────────────────────────────────────────────────────────────────────
📊 PRUDENTIAL
────────────────────────────────────────────────────────────────────────────────────────────────────
Total Users: 26
Active Users (with sessions): 26
Total Sessions: 397
Total Time Spent: 45.01 hours (2700 minutes)
Avg Sessions per Active User: 15.27
Avg Time per Active User: 1.73 hours (104 minutes)
Avg Login Days per User: 2.15

Top 5 Users by Time Spent:
  1. Name (email)
     • Total Sessions: X
     • Login Days: X
     ...
```

### JSON Output Structure
```json
{
  "generatedAt": "2025-10-07T...",
  "period": {
    "startDate": "2025-09-07T...",
    "endDate": "2025-10-07T...",
    "description": "Last 30 days"
  },
  "summary": {
    "totalCompanies": 4,
    "totalActiveUsers": 95,
    "totalSessions": 743,
    "totalTimeHours": 64.4
  },
  "companies": [
    {
      "companyId": "...",
      "companyName": "Prudential",
      "totalUsers": 26,
      "activeUsers": 26,
      "totalSessions": 397,
      "totalTimeMinutes": 2700,
      "avgSessionsPerUser": 15.27,
      "avgTimePerUserMinutes": 104,
      "avgLoginDaysPerUser": 2.15,
      "topUsers": [
        {
          "userId": "...",
          "userName": "...",
          "email": "...",
          "totalSessions": 23,
          "loginDays": 3,
          "totalTimeMinutes": 350,
          "sessions": [ /* last 20 sessions */ ]
        }
      ]
    }
  ]
}
```

---

## Report Generation

### Automated Flow
1. Run `npx tsx analytics/scripts/analyze-usage.ts`
2. Script outputs to console and JSON file
3. Review output in `analytics/data/usage-data-[DATE].json`
4. Reports are in `analytics/reports/`

### Manual Report Updates
After running analysis, update:
1. **Investor Report:** `analytics/reports/investor-usage-report.md`
2. **Technical Report:** `analytics/reports/technical-usage-report.md`

### Report Update Checklist
- [ ] Update executive summary numbers
- [ ] Refresh company-level metrics table
- [ ] Update top user sections with new data
- [ ] Add new raw session samples if needed
- [ ] Update date ranges and timestamps
- [ ] Review insights/recommendations for relevance

---

## Troubleshooting

### Connection Issues

**Problem:** `MongoServerSelectionError: connection timed out`
**Solution:**
1. Check IP whitelist in MongoDB Atlas
2. Verify VPN/network connectivity
3. Confirm credentials are current
4. Try increasing `serverSelectionTimeoutMS` to 60000

**Problem:** `SSL/TLS certificate error`
**Solution:**
- Connection should work without explicit cert config
- If needed, cert is at `/Users/abdik/Projects/ami/api/db-cert.cer`

### Data Issues

**Problem:** User count seems low
**Check:**
1. Test user filter is applied: `email: { $not: /\+.*@hupo\.co$/ }`
2. Date range is correct (last 30 days)
3. Company names match exactly (case-sensitive)

**Problem:** Session durations seem wrong
**Check:**
1. Normalization is applied (cap at 10 min if > 30 min)
2. Fallback logic works (timestamp difference)
3. Default 10 sec is applied when needed

**Problem:** Missing company data
**Check:**
1. Company name in `TARGET_COMPANIES` array
2. Run company list query to verify exact name
3. Check if company has users in date range

---

## Common Queries

### Find All Companies
```typescript
import { Company } from './src/models/Company.js';
const companies = await Company.find({}).lean();
console.log(companies.map(c => ({ id: c._id, name: c.name })));
```

### Count Users by Company
```typescript
import { User } from './src/models/User.js';
const users = await User.aggregate([
  { $match: { isDeleted: { $ne: true } } },
  { $group: { _id: '$company', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

### Find Sessions in Date Range
```typescript
import { SalesSession } from './src/models/SalesSession.js';
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const sessions = await SalesSession.find({
  startedAt: { $gte: thirtyDaysAgo }
}).lean();
```

### Check for Test Users
```typescript
import { User } from './src/models/User.js';
const testUsers = await User.find({
  email: /\+.*@hupo\.co$/
}).lean();
console.log(`Found ${testUsers.length} test users`);
```

---

## Performance Tips

1. **Use Indexes:** Queries on `startedAt`, `user`, `company` fields are indexed
2. **Limit Results:** Use `.limit()` when exploring data
3. **Lean Queries:** Always use `.lean()` for read-only operations (faster)
4. **Batch Processing:** Process users in batches if analyzing large datasets
5. **Connection Pooling:** Configure `maxPoolSize` and `minPoolSize` appropriately

---

## Change Log

### 2025-10-07
- Added PLT (Prudential Thailand) to target companies
- Confirmed duration calculation logic with engineering team
- Updated company count to 4 (Prudential operates in 2 markets)
- Refined test user exclusion pattern
- Added comprehensive methodology documentation

### Future Enhancements
- [ ] Add month-over-month comparison
- [ ] Implement cohort analysis (new vs returning users)
- [ ] Add session completion rate metrics
- [ ] Create automated alerting for low engagement
- [ ] Build dashboard visualization

---

## Contact & Support

**Data Questions:** Review with Engineering team
**Business Questions:** Discuss with Product/Growth team
**Access Issues:** Contact DevOps for database credentials

**Related Documentation:**
- MongoDB Queries: `analytics/docs/mongodb-queries.md`
- Investor Report: `analytics/reports/investor-usage-report.md`
- Technical Report: `analytics/reports/technical-usage-report.md`

---

*Last Updated: October 7, 2025*
