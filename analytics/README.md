# Sales AI Usage Analytics

**Purpose:** Comprehensive usage analytics for Sales AI platform
**Last Updated:** October 7, 2025

---

## Quick Start

```bash
# Run complete analysis (one command)
npx tsx analytics/scripts/analyze-usage.ts

# Output: Console report + JSON data file
```

---

## Folder Structure

```
analytics/
├── README.md                          # This file
├── reports/                          # Final reports
│   ├── investor-usage-report.md     # Investor-facing report
│   └── technical-usage-report.md    # Detailed technical report
├── data/                            # Raw data exports
│   └── usage-data-2025-10-07.json  # Latest data export (timestamped)
├── scripts/                         # Analysis scripts
│   └── analyze-usage.ts            # Main analysis script
└── docs/                           # Documentation
    ├── query-methodology.md        # Complete query guide (START HERE)
    └── mongodb-queries.md          # Alternative: MongoDB Compass queries
```

---

## What's Inside

### 📊 Reports (`/reports`)

**investor-usage-report.md**
- Executive summary for investors
- Product-market fit evidence
- Revenue expansion opportunities
- Customer health scoring
- Financial implications
- Risk factors & mitigation

**technical-usage-report.md**
- Detailed metrics breakdown
- Company-level analysis
- Top user profiles
- Raw session data samples
- Usage patterns
- Data quality notes

### 📈 Data (`/data`)

**usage-data-YYYY-MM-DD.json**
- Timestamped data exports
- Complete user and session data
- Ready for further analysis
- Machine-readable format

### 🔧 Scripts (`/scripts`)

**analyze-usage.ts**
- Main analysis script
- Connects to MongoDB
- Filters test users
- Calculates all metrics
- Outputs console + JSON

### 📚 Documentation (`/docs`)

**query-methodology.md** ⭐ **START HERE**
- Complete query guide
- Connection details
- Data models
- Calculation logic
- Troubleshooting

**mongodb-queries.md**
- Alternative aggregation queries
- For use in MongoDB Compass
- GUI-friendly approach

---

## Common Tasks

### 1. Run Monthly Analysis
```bash
cd /Users/abdik/Projects/ami/ai-sales/aisales-backend
npx tsx analytics/scripts/analyze-usage.ts > analytics/data/report-$(date +%Y-%m-%d).txt
```

### 2. Update Investor Report
1. Run analysis script
2. Open `analytics/reports/investor-usage-report.md`
3. Update numbers in Executive Summary
4. Update company tables in Part 2
5. Refresh top user sections
6. Update date ranges

### 3. Add New Company
1. Edit `analytics/scripts/analyze-usage.ts`
2. Add company name to `TARGET_COMPANIES` array
3. Run analysis
4. Update both reports with new company data

### 4. Export Data for Stakeholders
```bash
# Console output to text file
npx tsx analytics/scripts/analyze-usage.ts > report.txt

# JSON already saved automatically to analytics/data/
```

---

## Key Metrics Tracked

### User Level
- Total sessions
- Login days (unique dates)
- Total time spent
- Avg session duration
- First & last login dates

### Company Level
- Total users
- Active users (with sessions)
- Total sessions
- Total time
- Avg sessions per user
- Avg time per user
- Avg login days per user

### Platform Level
- Cross-app comparison (People AI vs Sales AI)
- Customer health scores
- Engagement tiers
- Growth projections

---

## Data Quality

### Test User Exclusion
Emails matching `+*@hupo.co` are automatically excluded from all analysis.

### Session Duration Logic
1. Use `roleplay.duration` (capped at 10 min if > 30 min)
2. Fallback to timestamp difference (`endedAt - startedAt`)
3. Default to 10 seconds if no data

### Why Normalization?
Some sessions have corrupt data (e.g., 1.7 billion seconds). Normalization ensures accurate metrics.

---

## Current Coverage

### Sales AI Companies
- **Prudential (UOB)** - Singapore - 26 users
- **Prudential Thailand (PLT)** - Thailand - 7 users
- **Manulife** - Philippines - 22 users
- **Grab** - Singapore - 40 users

**Total:** 95 active users, 743 sessions, 64.4 hours (last 30 days)

### People AI Companies
9 companies, 94 users (separate analysis)

---

## Next Steps After Running Analysis

1. **Review Output**
   - Check console for company breakdowns
   - Verify JSON data looks correct

2. **Update Reports**
   - Investor report: High-level numbers
   - Technical report: Detailed metrics

3. **Share with Stakeholders**
   - Investor report → Board/Investors
   - Technical report → Internal teams
   - JSON data → Data science team

4. **Take Action**
   - Identify low-engagement customers
   - Reach out to power users
   - Plan activation campaigns

---

## Troubleshooting

**Connection Issues?**
→ See `docs/query-methodology.md` → Troubleshooting section

**Wrong Numbers?**
→ Check test user filter and date range

**Missing Company?**
→ Verify exact company name (case-sensitive)

**Need Help?**
→ Read `docs/query-methodology.md` (comprehensive guide)

---

## Version History

**v1.0 - Oct 7, 2025**
- Initial structured analytics setup
- Investor + Technical reports
- Complete methodology documentation
- PLT (Prudential Thailand) support
- 30-day rolling analysis

---

## Related Resources

- **Main Codebase:** `/Users/abdik/Projects/ami/ai-sales/aisales-backend`
- **People AI Analysis:** `/Users/abdik/Projects/ami/ai-webapp/ai-backend/`
- **Database:** MongoDB Atlas (aisales database)
- **Models:** `src/models/User.ts`, `SalesSession.ts`, `Company.ts`

---

**For detailed query instructions, always start with:** `docs/query-methodology.md`
