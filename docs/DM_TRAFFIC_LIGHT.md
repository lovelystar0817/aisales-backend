# DM: Sales AI Traffic Light Dashboard

## TL;DR
- Build a colour-coded performance lens in the admin dashboard so revenue leaders can triage coaching needs by product at a glance.
- Classification uses existing Sales AI telemetry (roleplay sessions, time-on-task, login cadence) and mirrors the CEO’s green/yellow/red framing.
- Initial mock leverages the latest usage export (`analytics/data/usage-data-2025-10-07.json`); production implementation should read from `/manage/dashboard` aggregates to stay real-time.

## Objective
Create an executive-ready “traffic light” view that flags sales reps by proficiency per product (starting with **Sales AI**) so leadership can celebrate top performers, target coaching, or trigger replacement workflows.

## Scoring Inputs
- **Data pipeline:** `analytics/scripts/analyze-usage.ts` → `calculateDashboardSummaryDirect` (jobs) → `/manage/dashboard/*` routes.
- **Signals (last 30 days):** total roleplay sessions, total time (roleplay duration preferred), unique login days, average session duration.
- **Bands:**  
  - 🟢 Green (score ≥3) — meets 3+ of: ≥12 sessions, ≥120 mins, ≥3 login days, ≥6 min avg duration.  
  - 🟡 Yellow (score =2) — meets 2 signals; targeted coaching needed.  
  - 🔴 Red (score ≤1) — needs intervention; default to replace/retrain workflow.
- Thresholds can be tuned per product by adjusting the weightings inside a new helper (recommend housing in `src/utils/manage/trafficLight.ts`).

## Dashboard Mockup (Sales AI · Last 30 Days)
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Sales AI Traffic Lights — Last 30 Days                                   │
│ Product: [ Sales AI ▾ ]   Filters: [ Company ▾ ][ Team ▾ ][ Module ▾ ]    │
├──────────────────────────────────────────────────────────────────────────┤
│ Prudential (26 active)                                                   │
│  🟢 7 reps      Jia Xin · 23 sessions · 5.8h · 3 days                    │
│                Ng Chui Yeng · 42 sessions · 5.4h · 4 days               │
│  🟡 3 reps      Jaelyn · 13 sessions · 2 days (short cadence)            │
│                KC · 20 sessions · 2.0h (shorter calls)                  │
│  🔴 Pending    Remaining 16 reps – auto-segment once API wiring is live │
│  Avg Sessions/User 15.3 | Avg Hours/User 1.73                            │
├──────────────────────────────────────────────────────────────────────────┤
│ Manulife (22 active)                                                     │
│  🟢 1 rep       Jenell · 39 sessions · 10 login days · 2.2h              │
│  🟡 2 reps      jf · 18 sessions · 0.9h · 5 days                         │
│                JF · 16 sessions · 0.25h · 4 days                         │
│  🔴 7 reps      <6 sessions or 1 login day → escalation queue            │
│  Avg Sessions/User 6.8 | Avg Hours/User 0.34                             │
├──────────────────────────────────────────────────────────────────────────┤
│ Grab (40 active)                                                         │
│  🟢 0 reps      (no-one hits Sales AI success bar yet)                   │
│  🟡 2 reps      Debbie · 18 sessions · 5 login days                      │
│                Trang Nguyen · 17 sessions · 7 days, low call depth      │
│  🔴 8 reps      One-day bursts (e.g., Zhedrik 9 sessions / 84 min)       │
│  Avg Sessions/User 3.6 | Avg Hours/User 0.22                             │
└──────────────────────────────────────────────────────────────────────────┘
*PLT (Thailand) slot hidden in default view; expose via product/company filter.
```

## Product Snapshots (Top 10 Reps by Time · Export 2025-10-07)
| Product | Active Reps | 🟢 Green | 🟡 Yellow | 🔴 Red* | Key Callout |
|---------|-------------|---------|-----------|---------|-------------|
| Prudential | 26 | 7 | 3 | 0 | High baseline; need classification for long-tail reps |
| Manulife | 22 | 1 | 2 | 7 | Only Jenell is consistently green—target playbooks for mid-tiers |
| Grab | 40 | 0 | 2 | 8 | Heavy yellow/red mix; design activation journey |
| PLT (Prudential TH) | 7 | 0 | 2 | 5 | Regional pilots need structured coaching support |
*Counts sourced from top-ten slice in JSON export; full coverage requires fetching all reps through dashboard APIs.

## Implementation Notes
- **Backend:** Extend `src/utils/manage` with `buildTrafficLightSummary(companyId, teams)` that wraps `getPracticeSummary` + `getProgressData` and returns counts + exemplars.
- **API surface:** Add `GET /manage/dashboard/traffic-lights` (mirrors auth of other manage routes) returning per-product buckets, thresholds, and exemplar reps.
- **Frontend:** Reuse dashboard layout container; render 3-card grid per product with pill badges (🟢/🟡/🔴) and drill-down link to `/manage/users?status=red`.
- **Data freshness:** Hit the new endpoint; fall back to `DashboardCache` if recalculation fails (aligned with `calculateDashboardSummary` TTL).

## Next Steps
1. Finalise thresholds with Sales Leadership (confirm green ≥? hours vs sessions).  
2. Implement helper + API endpoint, seeded by `analytics/scripts/analyze-usage.ts` logic.  
3. Wire frontend mock into actual dashboard module and QA with Prudential + Manulife data slices.
