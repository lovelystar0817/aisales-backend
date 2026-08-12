# SCORM Integration Guide

How Hupo Sales AI behaves differently when running inside an LMS (SCORM mode) vs. a normal browser.

> For SCORM package configuration, building, and deployment, see [SCORM-SETUP.md](./SCORM-SETUP.md).

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Authentication](#2-authentication)
3. [UI Differences](#3-ui-differences)
4. [Module Whitelisting](#4-module-whitelisting)
5. [Assessment & Scoring Pipeline](#5-assessment--scoring-pipeline)
6. [The `scormCompletionReady` End-to-End Flow](#6-the-scormcompletionready-end-to-end-flow)
7. [Configurable Passing Score](#7-configurable-passing-score)
8. [Key Files Reference](#8-key-files-reference)
9. [Gotchas & Lessons Learned](#9-gotchas--lessons-learned)
10. [Future Work](#10-future-work)

---

## 1. High-Level Architecture

```
+---------------------------+
|    LMS (e.g. Seismic)     |
|  +---------------------+  |
|  |  SCORM Wrapper       |  |
|  |  (index.html +       |  |
|  |   app.js + scorm-    |  |
|  |   api.js)            |  |
|  |  +----------------+  |  |
|  |  |  <iframe>       |  |  |
|  |  |  train.hupo.co  |  |  |
|  |  |  (the actual    |  |  |
|  |  |   React app)    |  |  |
|  |  +----------------+  |  |
|  +---------------------+  |
+---------------------------+
```

- The LMS loads a SCORM zip package containing `index.html`, `app.js`, `scorm-api.js`, `config.js`, etc.
- The SCORM wrapper creates an `<iframe>` pointing to the Hupo Sales AI frontend (e.g. `https://train.hupo.co/guest/grab/auth?scorm=true&modules=...&passingScore=75`).
- The frontend app runs inside the iframe, communicates with the SCORM wrapper via `postMessage`.
- The SCORM wrapper communicates with the LMS via the SCORM 1.2 API.

### What makes SCORM mode different

| Aspect            | Normal Browser                            | SCORM Mode                                  |
| ----------------- | ----------------------------------------- | ------------------------------------------- |
| Authentication    | Auth0 (email/password, SSO)               | Guest auth (name + optional email)          |
| Navigation        | Full sidebar (Home, Past Practices, etc.) | Home only                                   |
| Session polling   | No polling on assessment page             | Polls every 3s until `scormCompletionReady` |
| Completion        | No popup                                  | Pass/fail popup + `postMessage` to LMS      |
| Feedback modal    | Shown                                     | Hidden                                      |
| Module list       | All modules for the company               | Filtered by whitelist (if configured)       |
| Passing threshold | N/A                                       | Configurable (default: 80)                  |

---

## 2. Authentication

### Normal browser

Users log in via Auth0 (email/password or SSO). Tokens are managed by the Auth0 SDK.

### SCORM mode

Users authenticate via the **guest auth** route: `/guest/:companyFriendlyId/auth`.

**URL parameters:**

| Param | Required | Example | Description |
|---|---|---|---|
| scorm | Yes | true | Enables SCORM mode |
| email | No | user@company.com | Pre-fills user identity |
| modules | No | pitching-basics,objection-handling | Module whitelist |
| passingScore | No | 75 | Pass threshold (0-100, default: 80) |

**Auto-login flow (when `email` is provided):**

1. Frontend calls `GET /auth/guest/:companyFriendlyId/check?email=...`
2. If user exists -> auto-login (no name form shown)
3. If user doesn't exist -> show name-entry form

**Backend routes:**

- `POST /auth/guest/:companyFriendlyId` — Creates or finds guest user, returns JWT
- `GET /auth/guest/:companyFriendlyId/check?email=...` — Checks if user exists

**Frontend files:**

- `app/routes/guest/auth.tsx` — Guest auth page, reads SCORM params, stores in auth store

**Auth store fields set during guest auth:**

```
scorm: true/false          — Whether app is in SCORM mode
guestMode: true            — Always true for guest users
modulesWhitelist: string   — Comma-separated module friendlyIds
scormPassingScore: number  — Passing threshold (default: 80)
```

> These values are persisted to `localStorage` via Zustand's `persist` middleware. The guest auth page always resets `modulesWhitelist` (even to empty string) to prevent stale values from previous sessions.

---

## 3. UI Differences

### Sidebar navigation

**File:** `aisales-frontend/app/layouts/sidebar.tsx`

Guest/SCORM users see only the "Home" link. Hidden items:

- Past Practices
- Call Analysis

This is controlled by `guestMode` (which is always `true` for SCORM users).

### Feedback modal

**File:** `aisales-frontend/app/assessment/BaseAssessment.tsx`

The floating feedback button and feedback modal are completely hidden when `isScormMode` is `true`.

### SCORM completion popup

**File:** `aisales-frontend/app/components/ScormCompletionDialog.tsx`

Only shown in SCORM mode after all assessments are complete. Displays:

- **Passed** (score >= threshold): Green check, "Congratulations!", "Continue" button
- **Failed** (score < threshold): Red warning, "Keep Practicing!", "Practice Again" + "Close" buttons
- Circular score visualization
- The threshold value

### Session polling

**File:** `aisales-frontend/app/assessment/shared/useAssessmentData.ts`

In SCORM mode, the assessment page polls `GET /sessions/:id` every 3 seconds. Polling stops once `session.roleplay.scormCompletionReady` becomes `true`. In normal mode, there is no polling.

---

## 4. Module Whitelisting

Restricts which modules a SCORM user can see.

### How it works

1. SCORM `config.js` sets `modules: 'module-a,module-b'`
2. SCORM wrapper passes this as `?modules=module-a,module-b` in the iframe URL
3. Frontend `auth.tsx` stores it in `useAuthStore().modulesWhitelist`
4. `SelectModule.tsx` passes it as a query param: `GET /sessions/home?modules=module-a,module-b`
5. Backend `basic.ts` filters modules by `friendlyId`

### Configuration

- **Empty string** (`modules: ''`) = show ALL modules for the company
- **Comma-separated** (`modules: 'pitching-basics,objection-handling'`) = show only those modules

### Important

The `modulesWhitelist` is persisted in `localStorage`. The guest auth page always resets it (even to empty) to prevent stale values from a previous SCORM session carrying over.

**Backend file:** `aisales-backend/src/routes/sessions/basic.ts` (the `GET /sessions/home` endpoint)
**Frontend file:** `aisales-frontend/app/practice/SelectModule.tsx`

---

## 5. Assessment & Scoring Pipeline

### How assessments work (same in both modes)

1. User completes a roleplay session
2. Backend queues assessment jobs via Agenda (e.g., `GENERATE_SALES_TECHNIQUE`, `EVALUATE_SCORECARDS`)
3. Each job runs an LLM call, parses the response, and saves results to `session.roleplay.feedback`
4. Each job sets a "generating" flag to `true` before starting and `false` when done

### Assessment types and their flags

| Assessment Type          | Generating Flags                                          | Job Handler File                       |
| ------------------------ | --------------------------------------------------------- | -------------------------------------- |
| Regular (MEDDPICC, etc.) | `salesTechniquesGenerating`, `productKnowledgeGenerating` | `utils/assessment/regular.ts`          |
| Scorecard                | `scorecards[].isGenerating`                               | `utils/assessment/scorecard.ts`        |
| Grab-MEX                 | `grabMexSoftSkillsGenerating`                             | `utils/assessment/grab-mex.ts`         |
| MSIG Travel Easy         | `msigTravelEasy*Generating` (3 flags)                     | `utils/assessment/msig-travel-easy.ts` |
| AXA PH                   | `axaPh*Generating` (2 flags)                              | `utils/assessment/axa-ph.ts`           |
| KT AXA                   | `ktAxa*Generating` (3 flags)                              | `utils/assessment/kt-axa.ts`           |
| Prudential OH            | `prudentialOH*Generating` (2 flags)                       | `utils/assessment/prudential-oh.ts`    |
| Prudential PH            | `prudentialPH*Generating` (3 flags)                       | `utils/assessment/prudential-ph.ts`    |
| AIA KO                   | `aiaKo*Generating` (3 flags)                              | `utils/assessment/aia-ko.ts`           |

### SCORM-specific: what happens after jobs complete

After saving its own results, every assessment job calls:

```typescript
await triggerSCORMCompletionIfReady(sessionId);
```

This is the SCORM-specific addition. In normal mode this function is still called but has no effect (the `scormCompletionReady` flag is only consumed by the frontend in SCORM mode).

---

## 6. The `scormCompletionReady` End-to-End Flow

This is the core mechanism that ensures the pass/fail popup only shows after ALL assessment jobs are done.

### Backend: `triggerSCORMCompletionIfReady`

**File:** `aisales-backend/src/utils/assessment/regular.ts`

```
1. Re-fetch session from DB (to avoid stale data)
2. Check ALL generating flags (salesTechniquesGenerating, productKnowledgeGenerating,
   scorecards[].isGenerating, grabMexSoftSkillsGenerating, etc.)
3. If ANY flag is still true -> return early (not ready yet)
4. Calculate overallScore using parseGrabFeedbackScores()
5. Write to MongoDB:
   - roleplay.overallScore = <calculated score>
   - roleplay.scormCompletionReady = true
   - roleplay.scormCompletionTriggeredAt = new Date()
```

### Frontend: polling and popup

```
1. Assessment page polls GET /sessions/:id every 3 seconds (SCORM mode only)
2. When session.roleplay.scormCompletionReady === true:
   a. Polling stops
   b. isScormReady = true is passed to useScormCompletion hook
   c. Hook reads roleplay.overallScore from backend (not locally-computed score)
   d. Hook compares overallScore against scormPassingScore threshold
   e. Hook posts message to parent iframe: { type: 'scorm-completion-ready', data: { overallScore, sessionTime, sessionId } }
   f. ScormCompletionDialog is rendered (pass or fail)
3. SCORM wrapper receives postMessage, calls LMS SCORM API (SetScore, SetCompletionStatus)
```

### Sequence diagram

```
User          Frontend            Backend              LMS
  |               |                   |                  |
  |-- finishes -->|                   |                  |
  |               |-- end session --->|                  |
  |               |                   |-- queue jobs --->|
  |               |                   |                  |
  |               |<-- poll /session -|                  |
  |               |   (every 3s)      |                  |
  |               |                   |<-- job 1 done    |
  |               |                   |   triggerSCORM() |
  |               |                   |   (not ready)    |
  |               |                   |                  |
  |               |<-- poll /session -|                  |
  |               |                   |<-- job 2 done    |
  |               |                   |   triggerSCORM() |
  |               |                   |   ALL done!      |
  |               |                   |   set scormCompletionReady=true
  |               |                   |                  |
  |               |<-- poll /session -|                  |
  |               |   scormCompletionReady=true          |
  |               |   stop polling    |                  |
  |               |                   |                  |
  |<-- popup -----|                   |                  |
  |               |-- postMessage ----|----------------->|
  |               |   scorm-completion-ready             |
  |               |                   |                  |
```

### MongoDB fields (inside `roleplay`)

```
roleplay.overallScore: number              — Final calculated score
roleplay.scormCompletionReady: boolean     — true when all jobs done
roleplay.scormCompletionTriggeredAt: Date  — Timestamp
```

**Model file:** `aisales-backend/src/models/SalesSession.ts`

---

## 7. Configurable Passing Score

The passing threshold can be set per SCORM package.

### How it flows

1. `config.js` in the SCORM zip: `passingScore: 75`
2. SCORM wrapper adds `?passingScore=75` to iframe URL
3. Frontend `auth.tsx` reads it and calls `setScormPassingScore(75)`
4. Stored in Zustand auth store (persisted to localStorage)
5. `useScormCompletion` hook reads `scormPassingScore` from auth store
6. Compares: `passed = overallScore >= scormPassingScore`
7. `ScormCompletionDialog` displays the threshold

### SCORM manifest

The passing score is also set in `imsmanifest.xml` for LMS-level tracking:

```xml
<adlcp:masteryscore>75</adlcp:masteryscore>
```

This should match the `passingScore` in `config.js`.

### Default

If no `passingScore` param is provided, the default is **80**.

---

## 8. Key Files Reference

### Backend

| File                                       | What it does (SCORM-related)                                                |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `src/utils/assessment/regular.ts`          | `triggerSCORMCompletionIfReady()` — the gate function                       |
| `src/utils/assessment/scorecard.ts`        | Scorecard job — calls `triggerSCORMCompletionIfReady` after completion      |
| `src/utils/assessment/grab-mex.ts`         | Grab-MEX job — calls `triggerSCORMCompletionIfReady`                        |
| `src/utils/assessment/msig-travel-easy.ts` | MSIG job — calls `triggerSCORMCompletionIfReady`                            |
| `src/utils/manage/shared.ts`               | `parseFeedbackScores()` / `parseGrabFeedbackScores()` — score calculation   |
| `src/models/SalesSession.ts`               | `scormCompletionReady`, `overallScore`, `scormCompletionTriggeredAt` fields |
| `src/routes/sessions/basic.ts`             | `GET /sessions/home` — module whitelist filtering                           |
| `src/routes/auth/guest.ts`                 | Guest auth endpoints                                                        |
| `src/routes/sessions/roleplay.ts`          | Assessment type routing, generating flag management                         |

### Frontend

| File                                                | What it does (SCORM-related)                                          |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `app/routes/guest/auth.tsx`                         | Reads SCORM URL params, stores in auth store                          |
| `app/store/auth.ts`                                 | `scorm`, `modulesWhitelist`, `scormPassingScore` state                |
| `app/hooks/useScormCompletion.ts`                   | Core hook: fires `postMessage` when ready, returns `completionStatus` |
| `app/components/ScormCompletionDialog.tsx`          | Pass/fail popup modal                                                 |
| `app/assessment/shared/useAssessmentData.ts`        | SCORM polling (every 3s until `scormCompletionReady`)                 |
| `app/assessment/BaseAssessment.tsx`                 | Hides feedback modal in SCORM mode                                    |
| `app/layouts/sidebar.tsx`                           | Hides nav items in guest/SCORM mode                                   |
| `app/practice/SelectModule.tsx`                     | Passes `modules` query param to backend                               |
| `app/assessment/regular/SessionCard.tsx`            | Uses `useScormCompletion` with `isReady` guard                        |
| `app/assessment/scorecard/ScorecardSessionCard.tsx` | Uses `useScormCompletion` with `isReady` guard                        |
| `app/assessment/grab-mex/GrabMexSessionCard.tsx`    | Uses `useScormCompletion` with `isReady` guard                        |
| `app/assessment/msig/MSIGTravelEasySessionCard.tsx` | Uses `useScormCompletion` (no `isReady` guard)                        |

### SCORM package

| File                    | What it does                                                          |
| ----------------------- | --------------------------------------------------------------------- |
| `scorm/index.html`      | Entry point, creates iframe with permissions                          |
| `scorm/app.js`          | Main logic: builds iframe URL, handles `postMessage`, calls SCORM API |
| `scorm/scorm-api.js`    | SCORM 1.2 API discovery with cross-origin fallbacks                   |
| `scorm/config.js`       | Per-package configuration (baseUrl, modules, passingScore)            |
| `scorm/imsmanifest.xml` | SCORM manifest with course metadata and mastery score                 |
| `scorm/styles.css`      | Styling for the SCORM wrapper page                                    |

---

## 9. Gotchas & Lessons Learned

### Stale Zustand state from localStorage

The auth store uses `persist` middleware. Values like `modulesWhitelist` survive across sessions. If a user opens SCORM package A (modules: `grab-mex`) then later opens SCORM package B (modules: empty), the stale `grab-mex` value would carry over. **Fix:** The guest auth page always resets `modulesWhitelist` (even to empty string).

### Stale in-memory Mongoose objects

Assessment jobs fetch the session at the start, then run for a while. By the time they finish, the in-memory session object is stale (other jobs may have updated it). Always **re-fetch from DB** before reading scores or writing completion flags.

### Assessment type vs. call type

A session's `callType` (e.g., `grab-mex`) determines the product/scenario. Its `assessmentType` (e.g., `scorecard`) determines which assessment code path runs. These are independent. The SCORM completion logic must account for the actual assessment type, not the call type.

### Generating flags must match assessment type

Each assessment type manages its own set of generating flags. The blanket code in `roleplay.ts` must NOT set flags for types that manage their own (like `scorecard`, `msig`, `grab-mex`). Otherwise the flag is never cleared, and `triggerSCORMCompletionIfReady` blocks forever.

### `isReady` guard in `useScormCompletion`

The hook's `isReady` param defaults to `true`. If a session card doesn't explicitly pass `isReady: scormCompletionReady === true`, the popup will fire as soon as a locally-computed `overallScore > 0` — which can happen before all jobs are done. Always pass the `isReady` guard.

### `overallScore` source: backend vs. frontend

Session cards compute an `overallScore` locally from available data. In SCORM mode, the popup should use `session.roleplay.overallScore` (set by the backend after all jobs complete) rather than the locally-computed score, which may be based on partial data.

### iframe detection

`useScormCompletion` checks `window.parent !== window` to detect iframe context. This means the popup and `postMessage` will never fire in a normal browser tab, even if `scorm=true` is in the URL — a useful safety net for testing.

### `passingScore` in two places

The passing score must be set in both `config.js` (for the frontend threshold) and `imsmanifest.xml` `<adlcp:masteryscore>` (for the LMS). If they don't match, the LMS and the app may disagree on pass/fail.

---

## 10. Future Work

### User identity from LMS

Currently, SCORM users authenticate as guests. The LMS provides `student_id` and `student_name` via the SCORM API, but we don't use these to create real user accounts. Future work:

- Map LMS `student_id` to a real user account
- Get user email from the LMS (if available)
- Skip the guest name-entry form entirely
- This would allow SCORM users to see their past sessions and track progress over time

### SCORM 2004 support

Currently using SCORM 1.2. SCORM 2004 provides richer data model (detailed interactions, sequencing). Consider upgrading if LMS customers require it.

### Multiple attempts tracking

Currently each SCORM session is independent. The LMS tracks attempts, but the app doesn't correlate them. Could add attempt tracking to show improvement over time.
