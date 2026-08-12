# Assessment System Defragmentation

Analysis of the current fragmentation in the assessment/scoring pipeline and a plan to consolidate it.

---

## 1. The Problem

Every new company or assessment type has been implemented by copy-pasting the previous one and modifying it. Over time this created **16 parallel codepaths** that all do essentially the same thing: run LLM-based assessments on a roleplay transcript, save scores with generating flags, compute an overall score, render results in a card, and generate a PDF.

### Fragmentation by the numbers

| Dimension | Count |
|---|---|
| Assessment handler files (`src/utils/assessment/`) | 15 |
| Named `*Generating` boolean flags in SalesSession schema | 27 |
| if/else branches in `roleplay.ts` POST `/end` | 16 |
| `parse*FeedbackScores` function variants | 9 |
| Agenda job type constants (`GENERATE_*`) | 30 |
| Frontend SessionCard components | 19 |
| PDF component directories | 14 |
| if/else branches in PDF report route | 13 |
| Static product list files | 16 |
| Product resolution paths (static vs DB vs seeder) | 3 |

### What this costs us

- **Every new company requires changes in 8+ files** across both repos — a new assessment handler, new generating flags, new job definitions, new if/else branches in roleplay.ts, new parse function, new frontend SessionCard, new PDF components, new product list.
- **Bugs multiply** — the SCORM popup regression happened because `triggerSCORMCompletionIfReady` checks 20 flags but `roleplay.ts` has 16 branches that set different flags, and they were out of sync.
- **Shared improvements don't propagate** — fixing "Practice Again" in one card doesn't fix it in the other 18. Only 3 of 19 cards pass `isReady` to `useScormCompletion`.
- **The schema is bloated** — 27 boolean generating flags, each company's feedback stored in separate named fields.

---

## 2. Root Cause: How We Got Here

The core pattern for every assessment type is identical:

```
1. Session ends → set generating flags → queue background jobs
2. Each job: run LLM prompt → parse response → save to session.roleplay.feedback → clear flag
3. After last job: compute overall score
4. Frontend: render scores in a card, offer PDF download, practice again
```

But instead of parameterizing this pattern, each company was implemented as a **hardcoded fork**:

- **Generating flags**: Instead of a generic `jobs[].isGenerating` array (like scorecard does), each type got named booleans: `grabMexSoftSkillsGenerating`, `axaPhSoftSkillsGenerating`, `ktAxaSoftSkillsGenerating`, etc.
- **Score storage**: Instead of a normalized `sections[]` array, each type stores scores in named fields: `salesTechniques`, `productKnowledge`, `grabMexSoftSkills`, `axaPhSoftSkills`, etc.
- **Score parsing**: Each type needs its own `parse*FeedbackScores` because the data lives in different named fields.
- **Frontend cards**: Each card re-implements the same UI (score circles, practice info, action buttons, PDF download) because the data shapes differ.

The `scorecard` type is the closest to a generic solution — it uses a dynamic `scorecards[]` array with per-item `isGenerating` flags and a generic prompt system. But it was added late and doesn't cover the existing types.

---

## 3. Fragmentation Map

### 3.1 Backend: Assessment Handlers

All 15 files in `src/utils/assessment/` follow the same pattern but with different field names:

| Type | Jobs | Generating Flags | Score Storage Fields |
|---|---|---|---|
| regular | 2 (salesTechnique + productKnowledge) | `salesTechniquesGenerating`, `productKnowledgeGenerating` | `feedback.salesTechniques`, `feedback.productKnowledge` |
| grab-mex | 3 (softSkills + salesTechnique + productKnowledge) | `grabMexSoftSkillsGenerating` + regular's 2 | `feedback.grabMexSoftSkills` + regular's fields |
| axa-ph | 2 (softSkills + knowledgeSkills) | `axaPhSoftSkillsGenerating`, `axaPhKnowledgeSkillsGenerating` | `feedback.axaPhSoftSkills`, `feedback.axaPhKnowledgeSkills` |
| kt-axa | 2-3 (soft + knowledge + optional productKnowledge) | `ktAxaSoftSkillsGenerating`, `ktAxaKnowledgeSkillsGenerating`, `ktAxaProductKnowledgeGenerating` | `feedback.ktAxaSoftSkills`, etc. |
| msig-travel-easy | 3 (soft + knowledge + product) | `msigTravelEasy*Generating` x3 | `feedback.msigTravelEasy*` x3 |
| prudential-oh | 2 (salesTechnique + objectionHandling) | `prudentialOH*Generating` x2 | `feedback.prudentialOH*` x2 |
| prudential-ph-ff | 2 (factFinding + productKnowledge) | `prudentialPH*Generating` x2 | `feedback.prudentialPH*` x2 |
| prudential-ph-as | 1 (appointmentSetting) | `prudentialPHAppointmentSettingGenerating` | `feedback.prudentialPHAppointmentSetting` |
| aia-ko | 3 (introduction + objection + needs) | `aiaKo*Generating` x3 | `feedback.aiaKo*` x3 |
| scorecard | 1 (dynamic N sections) | `scorecards[].isGenerating` | `feedback.scorecards[]` |
| bbl | 2 (advisory + process) | `advisoryTechniqueGenerating`, `processAdherenceGenerating` | `feedback.advisoryTechnique`, etc. |
| hsbc | 4 (relationship + process + representation + communication) | 4 named flags | 4 named fields |
| msig | N sections (dynamic) | Section-based model | `feedback.msig` (custom structure) |
| manulife | N sections (dynamic) | Section-based model | `feedback.manulife` (custom structure) |
| prudential | 1 | `technicalKnowledgeGenerating` | `feedback.technicalKnowledge` |

**Observation**: Types like axa-ph, kt-axa, msig-travel-easy, prudential-oh, aia-ko are structurally identical — they all run 2-3 parallel LLM jobs, store results in named fields, and average the scores. The only differences are the prompt, the number of jobs, and the field names.

### 3.2 Backend: `roleplay.ts` Routing

The POST `/:sessionId/end` handler has a 16-branch if/else chain. Each branch:
1. Sets generating flags (inline, not via a helper)
2. Queues Agenda jobs with `agenda.now(JOB_NAME, { sessionId, ... })`

No two branches share a helper for flag-setting or job-queuing. The flag names, job names, and job data are all hardcoded per branch.

### 3.3 Backend: Score Parsing

9 separate `parse*FeedbackScores` functions, each reading different named fields:

| Function | File | Reads |
|---|---|---|
| `parseFeedbackScores` | `shared.ts` | scorecards[], salesTechniques, productKnowledge, prudentialPH* |
| `parseGrabFeedbackScores` | `grab.ts` | Delegates to parseGrabMexFeedbackScores or parseFeedbackScores |
| `parseGrabMexFeedbackScores` | `grab-mex.ts` | grabMexSoftSkills + salesTechniques + productKnowledge |
| `parseBBLFeedbackScores` | `bbl.ts` | advisoryTechnique + processAdherence |
| `parseHSBCFeedbackScores` | `hsbc.ts` | 4 HSBC-specific fields |
| `parseAxaPhFeedbackScores` | `axa-ph.ts` | axaPhSoftSkills + axaPhKnowledgeSkills |
| `parseKtAxaFeedbackScores` | `kt-axa.ts` | ktAxaSoftSkills + ktAxaKnowledgeSkills + ktAxaProductKnowledge |
| `parseMTLFeedbackScores` | `mtl.ts` | MTL-specific fields |
| `parseMSIGSessionTier` | `msig.ts` | MSIG sections (tier-based, not score-average) |

### 3.4 Backend: SCORM Completion

`triggerSCORMCompletionIfReady` checks 20 flags but there are 27 in the schema. BBL and HSBC flags are not checked and those assessment types don't call the function at all. Adding a new type requires:
1. Adding new generating flags to the schema
2. Adding the flag check to `triggerSCORMCompletionIfReady`
3. Calling the function at the end of the new job handler

Any of these 3 steps can be missed (and have been).

### 3.5 Frontend: Session Cards

19 cards, each duplicating:
- `PracticeInfoItem` component (verbatim copy in 15+ cards)
- `ActionButton` component (verbatim copy in 15+ cards)
- `ScoreIndicator` component (divergent copies)
- PDF download mutation (identical `useMutation` + blob-to-anchor logic)
- "Practice Again" mutation (nearly identical, but 2 cards use scenarioId, rest use callType)
- "Listen to Feedback" audio logic
- Overall score computation (each card does it differently based on available data fields)

Only 3 of 19 cards pass `isReady` to `useScormCompletion`. The other 16 fire immediately when any score is available, which can cause premature SCORM popups.

### 3.6 Frontend: Assessment Routing

`BaseAssessment.tsx` has 20 conditional renders, one per card type. Each condition is a separate boolean flag from `useAssessmentData`. No dynamic dispatch, no component registry.

### 3.7 PDF Generation

14 component directories, each rendering the same layout (header, scores, sections, transcript) but reading from different named fields. The report route (`report.ts`) has its own 13-branch if/else chain for pre-processing data per type.

---

## 4. Target Architecture

The goal is a **sections-based model** where every assessment type is described by configuration, not by code forks. The `scorecard` type is the closest existing example.

### 4.1 Unified Assessment Model

Replace all named feedback fields with a generic structure:

```typescript
// Current (27 named flags, N named score fields):
roleplay.feedback.salesTechniquesGenerating: boolean
roleplay.feedback.productKnowledgeGenerating: boolean
roleplay.feedback.grabMexSoftSkillsGenerating: boolean
// ...27 more...
roleplay.feedback.salesTechniques: { overallScore, sections[] }
roleplay.feedback.productKnowledge: { overallScore, sections[] }
roleplay.feedback.grabMexSoftSkills: { overallScore, sections[] }
// ...N more...

// Target (1 array):
roleplay.feedback.assessments: [{
  name: string,           // e.g. "Sales Technique", "Product Knowledge", "Soft Skills"
  sectionType: string,    // e.g. "sales-technique", "product-knowledge", "custom"
  isGenerating: boolean,
  overallScore: number,
  maxScore: number,
  criteria: [{
    title: string,
    score: number,
    maxScore: number,
    reason: string,
    suggestion: string,
  }],
  error?: string,
}]
```

This is essentially what `scorecard` already does with `roleplay.feedback.scorecards[]`. The proposal is to make ALL assessment types use this same structure.

### 4.2 Assessment Type Configuration

Replace the 16-branch if/else chain with a config-driven registry:

```typescript
// src/config/assessment-types.ts
const ASSESSMENT_CONFIGS: Record<string, AssessmentConfig> = {
  'regular': {
    sections: [
      { name: 'Sales Technique', type: 'sales-technique', promptKey: 'meddpicc' },
      { name: 'Product Knowledge', type: 'product-knowledge', promptKey: 'product-knowledge' },
    ],
  },
  'grab-mex': {
    sections: [
      { name: 'Soft Skills', type: 'custom', promptKey: 'grab-mex-soft-skills' },
      { name: 'Sales Technique', type: 'sales-technique', promptKey: 'meddpicc' },
      { name: 'Product Knowledge', type: 'product-knowledge', promptKey: 'product-knowledge' },
    ],
  },
  'axa-ph-recruitment': {
    sections: [
      { name: 'Soft Skills', type: 'custom', promptKey: 'axa-ph-soft-skills' },
      { name: 'Knowledge Skills', type: 'custom', promptKey: 'axa-ph-knowledge' },
    ],
  },
  // ...each type is just a list of sections with prompt references
};
```

### 4.3 Unified Job Handler

Replace 30 job types with 1:

```typescript
// Instead of GENERATE_SALES_TECHNIQUE, GENERATE_PRODUCT_KNOWLEDGE,
// GENERATE_GRAB_MEX_SOFT_SKILLS, GENERATE_AXA_PH_SOFT_SKILLS, etc.
// → One job: GENERATE_ASSESSMENT_SECTION

agenda.define('GENERATE_ASSESSMENT_SECTION', async (job) => {
  const { sessionId, sectionIndex, sectionConfig } = job.attrs.data;

  // 1. Mark section as generating
  await markSectionGenerating(sessionId, sectionIndex, true);

  // 2. Run LLM with the appropriate prompt
  const result = await generateAssessment(sectionConfig);

  // 3. Save results
  await saveSectionResult(sessionId, sectionIndex, result);

  // 4. Check if all sections are done
  await triggerCompletionIfReady(sessionId);
});
```

### 4.4 Unified Score Parsing

Replace 9 `parse*FeedbackScores` functions with 1:

```typescript
function parseOverallScore(session: SalesSession): number {
  const assessments = session.roleplay.feedback.assessments;
  const completed = assessments.filter(a => !a.isGenerating && a.overallScore != null);
  if (completed.length === 0) return 0;
  return completed.reduce((sum, a) => sum + a.overallScore, 0) / completed.length;
}
```

### 4.5 Unified SCORM Completion Check

Replace the 20-flag check with:

```typescript
function isAllAssessmentsComplete(session: SalesSession): boolean {
  const assessments = session.roleplay.feedback.assessments;
  return assessments.length > 0 && assessments.every(a => !a.isGenerating);
}
```

### 4.6 Unified Frontend Card

Replace 19 SessionCard components with 1 generic one that reads from the `assessments[]` array:

```tsx
// GenericSessionCard.tsx
const GenericSessionCard = () => {
  const { session, assessments } = useAssessmentContext();

  const overallScore = useMemo(() =>
    assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length,
    [assessments]
  );

  return (
    <article>
      <ScoreDisplay scores={assessments} overallScore={overallScore} />
      <PracticeInfo session={session} />
      <ActionButtons
        onPracticeAgain={handlePracticeAgain}
        onViewTranscript={onViewTranscript}
        onListenToFeedback={handleListenToFeedback}
        onDownloadPDF={downloadPDF}
      />
      <ScormCompletion overallScore={overallScore} sessionId={sessionId} />
    </article>
  );
};
```

Shared sub-components extracted:
- `ScoreDisplay` — renders the score circles/indicators for any number of sections
- `PracticeInfo` — always the same (type, product, client, date, duration)
- `ActionButtons` — always the same 4 buttons
- `useDownloadPDF` — shared hook for PDF download
- `usePracticeAgain` — shared hook using scenarioId when available

---

## 5. Migration Strategy

The key constraint: **don't break existing types while migrating**. Migrate incrementally, newest types first.

### Phase 0: Stop the Bleeding (immediate)

**Goal**: No new company-specific forks. Any new assessment type must use the generic system.

Actions:
- [ ] Extract shared frontend components (`PracticeInfoItem`, `ActionButton`, `useDownloadPDF` hook, `usePracticeAgain` hook) into `app/assessment/shared/`
- [ ] Make all 19 cards use the shared components (trivial refactor — they're verbatim copies)
- [ ] Fix all cards to pass `isReady` to `useScormCompletion` (only 3 of 19 do this today)
- [ ] Document that new assessment types must use the `scorecard` pattern (dynamic sections array) instead of adding new named fields

### Phase 1: Backend — Unified Sections Model

**Goal**: New `assessments[]` array alongside legacy fields. Both coexist during migration.

Actions:
- [ ] Add `roleplay.feedback.assessments` array to the SalesSession schema
- [ ] Create a generic `GENERATE_ASSESSMENT_SECTION` job that reads section config and runs the appropriate prompt
- [ ] Create `src/config/assessment-types.ts` registry mapping assessment types to their section configs
- [ ] Write a `parseUnifiedScore` function that reads from the `assessments[]` array
- [ ] Write a `isAllComplete` function that checks the `assessments[]` array
- [ ] For NEW assessment types, use only the unified system

### Phase 2: Backend — Migrate Existing Types

**Goal**: Move existing types from named fields to the `assessments[]` array, one at a time.

Migration order (simplest first):
1. `prudential-ph-appointment-setting` (1 job, simplest)
2. `prudential-oh` (2 jobs)
3. `axa-ph` (2 jobs)
4. `aia-ko` (3 jobs)
5. `kt-axa` (2-3 jobs)
6. `msig-travel-easy` (3 jobs)
7. `grab-mex` (3 jobs, one reuses regular's salesTechnique)
8. `regular` (2 jobs, the baseline)
9. `prudential` (1 job)
10. `bbl`, `hsbc` (most divergent, last)
11. `msig`, `manulife` (already section-based, need schema alignment)

For each migration:
- [ ] Write results to BOTH old named fields AND new `assessments[]` array (dual-write)
- [ ] Update frontend card to read from `assessments[]` when available, fallback to named fields
- [ ] Once verified, remove old named field writes
- [ ] Remove old generating flag writes
- [ ] Remove old parse function

### Phase 3: Frontend — Unified Card

**Goal**: Replace 19 cards with 1 generic card + optional type-specific overrides.

Actions:
- [ ] Create `GenericSessionCard` that reads from `assessments[]`
- [ ] Migrate cards one by one (match migration order from Phase 2)
- [ ] For types with unique score display (MSIG tiers, BBL), support overrides via config
- [ ] Remove old card components once verified
- [ ] Replace 20-line conditional render in `BaseAssessment.tsx` with a single `<GenericSessionCard />`

### Phase 4: Cleanup

- [ ] Remove old named generating flags from schema
- [ ] Remove old `parse*FeedbackScores` functions
- [ ] Remove 30 individual job type constants (keep 1: `GENERATE_ASSESSMENT_SECTION`)
- [ ] Remove old frontend card components
- [ ] Remove 14 PDF component directories, replace with 1 generic renderer
- [ ] Consolidate product resolution to DB-only (remove static product lists)

---

## 6. Quick Wins (Can Do Now)

These are low-risk improvements that don't require the full migration but immediately reduce pain:

### 6.1 Extract shared frontend components

The following are verbatim-identical across 15+ cards and can be extracted today:

```
PracticeInfoItem  → app/assessment/shared/PracticeInfoItem.tsx
ActionButton      → app/assessment/shared/ActionButton.tsx
useDownloadPDF    → app/assessment/shared/useDownloadPDF.ts
usePracticeAgain  → app/assessment/shared/usePracticeAgain.ts
```

### 6.2 Fix `isReady` in all cards

Only 3 of 19 cards pass `isReady` to `useScormCompletion`. Add it to all cards that currently don't — prevents premature SCORM popups for any assessment type that gets used in SCORM mode.

### 6.3 Unify `handlePracticeAgain`

Currently 2 cards use `scenarioId` + product `_id`, 17 use `callType` + `friendlyId`. The scenario-based path is more correct (works with DB-stored products). Move all cards to the scenario-based path.

### 6.4 Add a flag-setting helper in `roleplay.ts`

Instead of 16 inline flag-setting blocks, create:

```typescript
async function setGeneratingFlags(sessionId: string, flags: Record<string, boolean>) {
  const update: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(flags)) {
    update[`roleplay.feedback.${key}`] = value;
  }
  await SalesSession.findByIdAndUpdate(sessionId, { $set: update });
}
```

This doesn't change the architecture but makes the existing if/else chain less error-prone.

### 6.5 Auto-derive SCORM flag check from schema

Instead of manually listing 20 flags in `triggerSCORMCompletionIfReady`, scan the schema:

```typescript
function getAllGeneratingFlags(feedback: any): string[] {
  const flags: string[] = [];
  for (const [key, value] of Object.entries(feedback)) {
    if (key.endsWith('Generating') && value === true) flags.push(key);
  }
  if (feedback.scorecards?.some((s: any) => s.isGenerating)) flags.push('scorecards');
  return flags;
}
```

This eliminates the bug class where a new flag is added to the schema but not to the check.
