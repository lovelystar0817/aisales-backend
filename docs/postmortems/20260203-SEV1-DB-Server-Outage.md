🔴 **Post-Incident Report — DB Server Outage (Feb 3, 2026)**

**Date:** Feb 3, 2026
**Severity:** SEV-1 (Critical — client-facing)
**Duration:** ~40 min (1:23 PM initial, 4:07–4:50 PM second occurrence)
**Affected:** Sales AI Platform — all client-facing services
**Impacted Clients:** Prudential (active call), KT AXA (launch in progress)
**Author:** Aziz
**Status:** ✅ Resolved — Monitoring

---

## TL;DR

DB server CPU hit 100% twice today. We had extensive alerting on our backend servers but **zero alerts on the DB tier** — so we didn't catch it until it caused real client impact. Second spike happened during a live Prudential call and the KT AXA launch. We've since doubled DB capacity and added alerting.

---

## Impact

- **Prudential:** Live call disrupted at 4:25 PM — Hairin reported the app going unresponsive mid-session.
- **KT AXA:** Launch was happening at the same time. Direct impact still being assessed.
- All client-facing services were down during both CPU saturation windows.

---

## Timeline (SGT)

- `~1:23 PM` 🖥️ DB CPU hits 100%. App starts going in and out. No alerts fire — none were configured.
- `  1:10 PM` 🔍 Team notices the app is down internally. Starts investigating. First spike appears to self-resolve.
- `  2:33 PM` 🎯 Root cause identified: DB CPU saturation. Capacity increase planned for EOD to avoid mid-day risk.
- `  3:15 PM` 🔔 CPU + memory alerts added to DB servers.
- `  4:07 PM` 🚨 **New alert fires — DB CPU spiking again (second occurrence).**
- `  4:25 PM` 📞 Hairin reports app is unresponsive during live Prudential call.
- `  4:27 PM` ⚡ On-call escalates in eng channel. KT AXA launch also in progress.
- `  4:50 PM` ✅ Resolved. All services back up.

---

## Root Cause

DB server hit 100% CPU. The CPU chart shows a steady climb from ~50% to 100% over Jan 28 – Feb 3 — it was building up for days.

**Why we missed it:**

1. **No DB alerting.** We had solid monitoring on backend app servers, but the DB tier was completely uncovered. This is the core failure.
2. **Resource colocation.** Prod DB, staging DB, and other backends all shared the same infra — staging load contributed to prod CPU pressure.
3. **Deferred fix.** We identified the root cause at 2:33 PM but chose to wait until EOD for the capacity bump. Second spike hit at 4:07 PM.
4. **No pre-launch checks.** KT AXA launch went ahead without an infra health check that would've surfaced the elevated DB load.

---

## What we did immediately

- ✅ Killed staging links and non-essential services to reduce load
- ✅ Doubled DB server capacity (2x CPU + memory)
- ✅ Added CPU and memory threshold alerts on all DB servers

---

## Action Items

### 🏗️ Infrastructure

- `P0` Isolate Sales AI backend + DB from other apps — no more colocation with staging
- `P1` Document all potential infra bottlenecks
- `P1` Allocate 20% eng capacity for long-term infra work *(Kelly / Aziz)*
- `P1` Create prioritized infra improvement list *(Aziz)*

### 📡 Observability

- `P0` Set up proper alerting with high signal quality (minimize noise)
- `P0` Alerts must tag both on-call and product team
- `P1` Tag on-call on all Sentry errors
- `P1` Invest in observability tooling (Checkly, structured alerting)
- `P2` Add voice latency instrumentation

### ⚙️ Process

- `P0` Mandatory infra sanity check 3 hours before any client launch *(CSAM + On-Call)*
- `P1` Hire QA engineer for pre-launch testing
- `P1` Evaluate voice provider reliability (Typhoon → enterprise-grade)
- `P2` Implement LLM evals for AI QA
- `P2` Migrate AI demo to new codebase

### 🚀 CI/CD

- `P1` Remove auto-deploy — move to once-a-day EOD deploys with zero-downtime
- `P1` Define exception process for critical daytime deploys

---

## Lessons Learned

### ✅ What went well

- Once we found the root cause, mitigation was fast — 25 min from second alert to resolution.
- On-call escalated quickly (2 min after client report).
- The alerts we added at 3:15 PM actually caught the second spike at 4:07 PM — so the approach works.

### ❌ What went wrong

- Backend had solid alerting. DB had none. **That's the whole story.**
- We should've bumped capacity immediately at 2:33 PM instead of waiting for EOD.
- No infra health check before KT AXA launch on a day we already knew the DB was stressed.
- Prod/staging colocation gave us an unnecessarily large blast radius.

### 🍀 Where we got lucky

- First spike self-resolved before clients noticed.
- The alerts we added just 52 min earlier caught the second spike — without them we'd have relied entirely on client reports.

---

*Aziz, Engineering Lead · Feb 3, 2026 · Distribution: Engineering, Product, Leadership*
