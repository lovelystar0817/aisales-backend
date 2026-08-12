# Analytics Quick Start Guide

**One-Page Reference for Running Usage Analytics**

---

## 🚀 Run Analysis (One Command)

```bash
cd /Users/abdik/Projects/ami/ai-sales/aisales-backend
npx tsx analytics/scripts/analyze-usage.ts
```

**Done!** Console output + JSON saved to `analytics/data/usage-data-[DATE].json`

---

## 📁 What's Where

```
analytics/
├── reports/          → investor-usage-report.md, technical-usage-report.md
├── data/            → usage-data-2025-10-07.json (timestamped exports)
├── scripts/         → analyze-usage.ts (main script)
└── docs/            → query-methodology.md (COMPLETE GUIDE)
```

---

## 🎯 Current Setup

**Database:** MongoDB Atlas `aisales` database
**Companies:** Prudential (UOB), PLT (Thailand), Manulife, Grab
**Users:** 95 active (last 30 days)
**Test Users:** Auto-filtered (emails with `+*@hupo.co`)

---

## 🔄 Common Tasks

### Run Monthly Analysis
```bash
npx tsx analytics/scripts/analyze-usage.ts
```

### Add New Company
1. Edit `analytics/scripts/analyze-usage.ts`
2. Add company name to `TARGET_COMPANIES` array
3. Run analysis

### Update Reports
1. Run analysis
2. Copy numbers from console output
3. Update `analytics/reports/investor-usage-report.md`

---

## 📊 Key Metrics

**Per User:**
- Total sessions, Login days, Total time, Avg session duration

**Per Company:**
- Total users, Sessions, Time, Avg per user

**Duration Logic:**
1. Use `roleplay.duration` (cap at 10 min if > 30 min)
2. Fallback to `endedAt - startedAt`
3. Default: 10 seconds

---

## 🆘 Need Help?

**Full Documentation:** `analytics/docs/query-methodology.md`
**Troubleshooting:** See methodology doc → Troubleshooting section
**Questions:** Review README.md or methodology doc

---

## ✅ Saved to Memory

All query details, company IDs, and calculation logic are saved to Claude's memory.

**Next time you need this:** Just ask "run the usage analytics" and I'll know exactly what to do!

---

**Version:** 1.0 | **Last Updated:** Oct 7, 2025
