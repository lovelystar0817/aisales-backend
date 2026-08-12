# Voice AI Prompt Defragmentation

Analysis of the prompt fragmentation in `src/prompts/` and approaches to consolidate.

---

## 1. The Problem

The `src/prompts/` directory contains **50+ files** across 8 subdirectories. Each new company gets its own set of prompt files, even when the underlying patterns are nearly identical. The main voice file (`sales-voice.ts`) is a **5,647-line monolith** with 10+ internal routing paths.

### By the numbers

| Dimension | Count |
|---|---|
| Total prompt files | 50+ |
| Company subdirectories | 8 (aia-ko, alibaba, bbl, hsbc, prudential, prudential-ph, sales-voice/axa-ph, sales-voice/kt-axa) |
| Voice prompt paths in `getSalesVoicePrompt` | 10 top-level + ~12 sub-paths |
| Assessment prompt files (Pattern A: Framework Evaluation) | ~25 |
| Near-duplicate recruitment dynamics builders | 3 |
| Near-duplicate soft skills schemas (4 sections x 25) | 5+ |
| Lines in `sales-voice.ts` | 5,647 |

---

## 2. Two Distinct Prompt Categories

The prompts fall into two fundamentally different categories that should be analyzed separately:

### Category A: Voice Persona Prompts (roleplay system prompts)

These define how the AI prospect behaves during a live voice call. They are consumed by `getSalesVoicePrompt()` and sent to the LLM as the system prompt for real-time conversation.

**Key properties:**
- Run in real-time (latency-sensitive)
- Define persona personality, conversation dynamics, difficulty progression, engagement triggers
- Company-specific behavioral rules (e.g., BBL asset portfolio display in Thai, HSBC Cantonese sentence particles, KT-AXA agent ID enforcement)
- Language-specific rules (Thai, Cantonese, Traditional Chinese)

### Category B: Assessment Prompts (post-session scoring)

These define how a completed roleplay transcript is evaluated/scored. They run as batch jobs after the session ends.

**Key properties:**
- Run offline (no latency constraint)
- Follow an extremely uniform template: system instruction + framework definition + JSON output schema
- Differ primarily in: framework name, section names, section count, max scores, company context
- The `scorecard` type already moves these to the DB

---

## 3. Fragmentation Map

### 3.1 Voice Prompts: The `sales-voice.ts` Monolith

`getSalesVoicePrompt` is a routing dispatcher with 10 top-level paths:

| Path | Trigger | Builder | Unique Behavior |
|---|---|---|---|
| Scenario override | `params.scenario` exists | `getScenarioVoicePrompt` | DB-stored prompt, bypasses all code-based logic |
| AIA KO | `moduleFriendlyId` match | External file | 3-phase outbound cold call dynamics |
| Prudential PH | `assessmentType` match | External file | Philippines cold call with permission protocol |
| Prudential OH | `assessmentType` match | Inline function | Singapore objection handling |
| MTL Prospect Practice | `moduleFriendlyId` match | Inline function | Inverted roles (AI = agent, user = prospect) |
| BBL | `assessmentType` match | Inline function | Thai wealth mgmt, DISC personality, asset portfolios |
| HSBC | `assessmentType` match | Inline function | Cantonese language rules, HK wealth mgmt |
| Cold call | `callType` match | Inline function | Routes to 4 sub-paths (Prudential, generic, MSIG telesales, MSIG 3F) |
| Manulife FNA | `callType` match | Inline function | Philippines FNA |
| Regular/follow-up | Default | `getRegularCallPrompt` | Routes to 6+ sub-paths (KT-AXA, AXA-PH, MTL, MSIG, deal closure, default) |

**What's shared (composable layers):**
Every non-scenario prompt is assembled from these shared building blocks inside `sales-voice.ts`:

1. `buildPersonalityAndVoice` — DISC-based personality, age profile, risk appetite, emotional expression
2. `buildConversationDynamics` — Multi-phase progression with difficulty scaling
3. `buildEngagementAndTriggers` — What moves the prospect forward/backward
4. Language rules (Thai, Cantonese, Traditional Chinese, English)
5. Product name phonetic recognition rules
6. `SALES_COMMON_RULES` — Universal ground rules for all personas

**What's NOT shared (duplicated across paths):**
- Recruitment dynamics: `buildMTLRecruitmentDynamics`, `buildAxaPhUnitManagerRecruitmentDynamics`, `buildKTAxaAgentRecruitmentDynamics` — structurally identical 5-phase referral flows with company name swapped
- FNA dynamics: AXA-PH FNA and KT-AXA FNA both build a "Facebook lead / referral contact" scenario with phase-based progression
- Cold call dynamics: Prudential cold call, generic cold call, and MSIG telesales all follow the same conviction-tracking state machine (4 states, same modifiers) with different opening framing

### 3.2 Assessment Prompts: Uniform Pattern, Separate Files

Nearly all assessment prompts follow **Pattern A** (Framework Evaluation):

```
SYSTEM: You are an expert sales coach for [COMPANY].
  FOCUS EXCLUSIVELY ON USER MESSAGES.
  - Messages labeled "user:" = salesperson (ANALYZE THESE)
  - Messages labeled "ai:" = prospect (IGNORE THESE)

  [FRAMEWORK NAME]:
  Section 1: [Title] (0-[max_score])
  - criteria...
  Section 2: [Title] (0-[max_score])
  - criteria...

  Return STRICTLY valid JSON: { sections: [...], overallScore: N }

USER: Scenario: {scenario}
  Transcript: {transcript}
  Output ONLY valid JSON.
```

**Files following this exact pattern** (only company name, framework, and section definitions differ):

| Company | Files | Framework | Sections |
|---|---|---|---|
| Generic | `sales-technique.ts` (dispatcher) | MEDDPICC, 4C, 3F, Strategic Pitch, etc. | Varies by framework |
| Generic | `product-knowledge.ts` | Product Knowledge | Product Pitch (50) + Competitor Diff (50) |
| Grab MEX | `grab-mex-soft-skills.ts` | LAER | Listen/Acknowledge/Explore/Respond x25 |
| AXA-PH (4 files) | `axa-ph-*-soft-skills.ts`, `axa-ph-*-knowledge-skills.ts` | Soft Skills / Knowledge | 4 sections x 25 or 2 sections x 50 |
| KT-AXA (9 files) | `kt-axa-*-soft-skills.ts`, `kt-axa-*-knowledge-skills.ts`, `kt-axa-*-product-knowledge.ts` | Soft Skills / Knowledge / Product | 4 sections x 25 |
| MSIG Travel Easy (3 files) | `msig-travel-easy-*.ts` | Soft Skills / Knowledge / Product | 4 sections x 7.5 or 3 sections x 10 |
| Prudential OH (2 files) | `prudential-oh-*.ts` | LAPR / 3F | 4 sections x 25 or 3 sections |
| Prudential PH (3 files) | `prudential-ph-*.ts` | SPIN / Product Pitch / Verification+OH | Varies |
| BBL (2 files) | `bbl-advisory-technique.ts`, `bbl-process-adherence.ts` | Advisory Model / Process Steps | Framework-dependent |
| HSBC (4 files) | `hsbc-*.ts` | Advisory / Communication / Process / Representation | Framework-dependent |
| AIA KO | (uses scorecard — prompts in DB) | Dynamic | Dynamic |

**Near-duplicate groups:**

1. **Soft skills 4x25**: KT-AXA FNA, KT-AXA recruitment, KT-AXA WealthPlus, AXA-PH recruitment, AXA-PH objection handling all evaluate the same 4 dimensions (Communication 25, Relationship Building 25, Adaptability 25, Customer Orientation 25) with only company context changed.

2. **Knowledge skills**: KT-AXA and AXA-PH knowledge prompts follow the same template with different domain topics.

3. **LAER/LAPR**: Grab MEX soft skills (LAER) and Prudential OH objection handling (LAPR) use the same listen-acknowledge-explore/probe-respond structure with cosmetic naming differences.

4. **Roleplay overview**: `roleplay-overview.ts` (generic) and `prudential/prudential-roleplay-overview.ts` serve the same purpose. Prudential's adds ~30 lines of cold-call context.

### 3.3 Two Special Assessment Architectures

**Checklist-based** (MSIG + Manulife):
- Define criteria as code objects (not prose), iterate them into a prompt string
- Score per-criterion as pass/fail or percentage
- Different from all other assessments

**DB-stored** (Scorecard):
- `scorecard-assessment.ts` reads the prompt from `ScorecardSection.prompt` in MongoDB
- The most flexible approach — no code changes needed for new scorecards
- Currently used by Grab MEX (via scenarios) and new self-service companies

---

## 4. Why Prompt Defragmentation Is Trickier

Unlike the assessment pipeline (which is pure infrastructure), prompts contain **domain knowledge** that genuinely differs per company:

- BBL needs Thai baht formatting, portfolio display rules, DISC personality mapping to Thai cultural norms
- HSBC needs Cantonese sentence particles, Traditional Chinese formatting, HK regulatory compliance
- Prudential needs product-specific progressive questioning across 4 insurance products
- KT-AXA needs agent ID verification protocol in Thai
- AIA KO needs specific marketing-consent outbound call dynamics

These aren't arbitrary differences — they reflect real business requirements. The goal isn't to eliminate all company-specific content, but to **separate the reusable structure from the company-specific content**.

---

## 5. Target Architecture

### 5.1 Voice Prompts: Composable Builder with Company Plugins

**Current**: One 5,647-line file with 10+ inline paths.
**Target**: A structured builder that assembles prompts from composable layers + company-specific plugins.

```
VoicePromptBuilder
  ├── Core layers (always applied):
  │   ├── persona personality (DISC traits, age, risk appetite)
  │   ├── universal ground rules (SALES_COMMON_RULES)
  │   └── language rules (selected by language code)
  │
  ├── Conversation dynamics (selected by call type / module):
  │   ├── cold-call dynamics
  │   ├── product-positioning dynamics
  │   ├── recruitment dynamics       ← one implementation, not 3 copies
  │   ├── fna dynamics               ← one implementation
  │   ├── objection-handling dynamics
  │   └── close-call dynamics
  │
  ├── Company plugins (optional overlays):
  │   ├── bbl: asset portfolio display, Thai cultural norms
  │   ├── hsbc: Cantonese particles, HK compliance
  │   ├── prudential: progressive questioning per product
  │   ├── kt-axa: agent ID enforcement
  │   └── aia-ko: marketing-consent outbound dynamics
  │
  └── Difficulty scaling (Easy/Medium/Hard)
```

**Key change**: Conversation dynamics like "recruitment" become one parameterized template instead of 3 copies. Company-specific rules are applied as overlays on top, not as entirely separate codepaths.

```typescript
// Instead of:
//   buildMTLRecruitmentDynamics(...)
//   buildAxaPhUnitManagerRecruitmentDynamics(...)
//   buildKTAxaAgentRecruitmentDynamics(...)
// →
buildRecruitmentDynamics({
  companyName: 'KT-AXA',
  language: 'th',
  extras: [ktAxaAgentIdEnforcement],  // company-specific overlay
})
```

### 5.2 Assessment Prompts: Parameterized Template + DB Migration

**Current**: 25+ separate files, each hardcoding the same template with different section names and scores.
**Target**: One parameterized assessment prompt builder + company-specific configs that can live in DB or code.

```typescript
// src/prompts/assessment-template.ts
function buildAssessmentPrompt(config: {
  frameworkName: string;
  sections: { title: string; maxScore: number; criteria: string }[];
  companyContext?: string;
  languageCode?: string;
}): ChatPromptTemplate {
  // Assemble the standard template with the given sections
}

// Usage for KT-AXA FNA Soft Skills (currently its own file):
buildAssessmentPrompt({
  frameworkName: 'Soft Skills Assessment',
  sections: [
    { title: 'Communication Skills', maxScore: 25, criteria: '...' },
    { title: 'Relationship Building', maxScore: 25, criteria: '...' },
    { title: 'Adaptability', maxScore: 25, criteria: '...' },
    { title: 'Customer Orientation', maxScore: 25, criteria: '...' },
  ],
  companyContext: 'KT-AXA Thailand FNA session',
});
```

**The scorecard approach takes this further**: Store the entire prompt config in MongoDB, eliminating code changes entirely for new assessments. The `scorecard-assessment.ts` already does this — the assessment prompt text lives in `ScorecardSection.prompt`.

### 5.3 `sales-voice.ts` Decomposition

Break the 5,647-line monolith into focused modules:

```
src/prompts/voice/
├── index.ts                    ← getSalesVoicePrompt (thin dispatcher)
├── builder.ts                  ← VoicePromptBuilder class
├── core/
│   ├── personality.ts          ← buildPersonalityAndVoice
│   ├── ground-rules.ts         ← SALES_COMMON_RULES
│   ├── engagement.ts           ← buildEngagementAndTriggers
│   └── language-rules.ts       ← Thai, Cantonese, Chinese, English
├── dynamics/
│   ├── cold-call.ts            ← cold call progression (parameterized)
│   ├── product-positioning.ts  ← follow-up / positioning progression
│   ├── recruitment.ts          ← unified recruitment dynamics (replaces 3 copies)
│   ├── fna.ts                  ← unified FNA dynamics
│   ├── objection-handling.ts   ← objection handling progression
│   ├── close-call.ts           ← close call progression
│   └── scenario.ts             ← DB-stored scenario prompts
├── company/
│   ├── bbl.ts                  ← BBL-specific: portfolio display, Thai formatting
│   ├── hsbc.ts                 ← HSBC-specific: Cantonese rules, HK compliance
│   ├── prudential.ts           ← progressive questioning per product
│   ├── prudential-ph.ts        ← PH appointment setting dynamics
│   ├── kt-axa.ts               ← agent ID enforcement
│   ├── aia-ko.ts               ← marketing-consent outbound
│   └── msig.ts                 ← MSIG telesales/product positioning specifics
└── difficulty.ts               ← Easy/Medium/Hard scaling
```

### 5.4 Assessment Prompt Consolidation

Group the 25+ Pattern A files into parameterized configs:

```
src/prompts/assessment/
├── template.ts                 ← buildAssessmentPrompt (parameterized base)
├── overview.ts                 ← getRoleplayOverviewPrompt (one version, not two)
├── product-knowledge.ts        ← product knowledge template (parameterized)
├── scorecard.ts                ← DB-prompt runner (already exists)
├── frameworks/
│   ├── meddpicc.ts             ← MEDDPICC section definitions
│   ├── four-c.ts               ← 4C section definitions
│   ├── three-f.ts              ← 3F section definitions
│   ├── spin.ts                 ← SPIN section definitions
│   ├── laer.ts                 ← LAER section definitions (Grab MEX, others)
│   ├── lapr.ts                 ← LAPR section definitions (Prudential OH)
│   └── strategic-pitch.ts      ← Strategic Pitch section definitions
├── skills/
│   ├── soft-skills.ts          ← Generic 4-section soft skills (parameterized by company)
│   └── knowledge-skills.ts     ← Generic knowledge skills (parameterized)
└── company/
    ├── bbl.ts                  ← BBL advisory technique + process adherence configs
    ├── hsbc.ts                 ← HSBC 4-assessment configs
    ├── prudential.ts           ← Prudential technical knowledge (product sections)
    ├── prudential-ph.ts        ← PH appointment setting + fact finding configs
    ├── msig.ts                 ← MSIG checklist criteria
    └── manulife.ts             ← Manulife checklist criteria
```

This reduces 25+ files to ~20 focused files, but more importantly, the **template is shared** — new companies add a config, not a new copy of the template.

---

## 6. Migration Strategy

### Phase 0: Stop the Bleeding (immediate)

**Goal**: No new company prompt files that duplicate existing patterns.

Actions:
- [ ] Document that new assessment types should use `scorecard-assessment.ts` (DB-stored prompts) or the parameterized template (when built)
- [ ] New voice dynamics should be added as parameterized calls to existing builders (e.g., recruitment, FNA), not as new copy-pasted files
- [ ] New soft skills assessments must reuse the generic 4-section pattern with company context, not create new files

### Phase 1: Extract and Decompose `sales-voice.ts`

**Goal**: Break the 5,647-line monolith into the module structure described in 5.3.

This is the highest-impact change because:
- It makes the voice prompt system navigable for new engineers
- It identifies shared building blocks vs. company-specific overlays
- It doesn't change behavior — just reorganizes code

Actions:
- [ ] Extract `buildPersonalityAndVoice`, `SALES_COMMON_RULES`, language rules into `voice/core/`
- [ ] Extract each conversation dynamics builder into `voice/dynamics/`
- [ ] **Unify recruitment dynamics**: Merge the 3 copies into one parameterized `buildRecruitmentDynamics`
- [ ] **Unify FNA dynamics**: Merge AXA-PH FNA and KT-AXA FNA into one parameterized builder
- [ ] Extract BBL, HSBC, Prudential, MSIG-specific logic into `voice/company/`
- [ ] Keep `getSalesVoicePrompt` as a thin dispatcher that assembles the right combination

### Phase 2: Create Assessment Prompt Template

**Goal**: One parameterized template that covers Pattern A assessments.

Actions:
- [ ] Create `buildAssessmentPrompt(config)` in `src/prompts/assessment/template.ts`
- [ ] Define framework configs (MEDDPICC sections, LAER sections, etc.) as data objects
- [ ] Define soft skills config as a parameterized template (company name, section count, max score)
- [ ] Migrate simplest assessments first: KT-AXA soft skills (5 near-identical files → 1 parameterized call each)
- [ ] Then AXA-PH soft/knowledge skills (4 files → parameterized calls)
- [ ] Then MSIG Travel Easy (3 files → parameterized calls)
- [ ] Then Prudential OH (2 files → parameterized calls)

### Phase 3: DB-Stored Assessment Prompts

**Goal**: New assessments are defined in MongoDB, not in code.

The `scorecard` system already does this. Extend it to cover all Pattern A assessments:
- [ ] Store framework section definitions (title, maxScore, criteria text) in a `AssessmentTemplate` collection
- [ ] `buildAssessmentPrompt` can load from DB instead of code configs
- [ ] New company assessments become admin operations, not code deployments

### Phase 4: Merge Overview Prompts

**Goal**: One overview prompt, not two.

Actions:
- [ ] Merge `roleplay-overview.ts` and `prudential/prudential-roleplay-overview.ts` into one prompt that conditionally includes Prudential-specific context (cold call vs product positioning, verification compliance) when relevant
- [ ] This is low-risk since the prompts are nearly identical

---

## 7. Quick Wins (Can Do Now)

### 7.1 Unify recruitment dynamics (3 copies → 1)

`buildMTLRecruitmentDynamics`, `buildAxaPhUnitManagerRecruitmentDynamics`, and `buildKTAxaAgentRecruitmentDynamics` are structurally identical 5-phase flows. Merge into one:

```typescript
function buildRecruitmentDynamics(params: {
  companyName: string;
  recruiterRole: string;
  language: string;
  extras?: string[];  // e.g., KT-AXA agent ID enforcement
}): string
```

**Risk**: Low. The behavioral differences are cosmetic (company name, role title). KT-AXA's agent ID enforcement can be an `extras` overlay.

### 7.2 Unify soft skills assessment prompts (5+ copies → 1 parameterized)

KT-AXA FNA/recruitment/WealthPlus soft skills + AXA-PH recruitment/objection-handling soft skills all evaluate the same 4 dimensions (Communication, Relationship Building, Adaptability, Customer Orientation) at 25 points each. Create:

```typescript
function getSoftSkillsAssessmentPrompt(params: {
  companyName: string;
  moduleContext: string;
  sections?: { title: string; maxScore: number; criteria: string }[];
}): ChatPromptTemplate
```

Default sections are the standard 4x25. MSIG Travel Easy overrides with 4x7.5.

**Risk**: Low. The prompt text is nearly identical. Only company framing differs.

### 7.3 Move company-specific voice logic out of `sales-voice.ts`

BBL (asset portfolio display, Thai number words), HSBC (Cantonese particles), and Prudential (progressive questioning) logic is currently inline in the monolith. Extract to separate files without changing any behavior:

- `sales-voice.ts` line ~2800-3200: BBL → `src/prompts/sales-voice/bbl.ts`
- `sales-voice.ts` line ~3200-3600: HSBC → `src/prompts/sales-voice/hsbc.ts`

**Risk**: Very low. Pure code organization, no behavioral change.

### 7.4 Merge the two overview prompts

`roleplay-overview.ts` and `prudential/prudential-roleplay-overview.ts` can be merged into one prompt with an optional `isPrudential` flag that adds the cold-call/verification context. The Prudential version is a superset of the generic one.

**Risk**: Low. Same LLM call, just ~30 extra lines of context for Prudential.

---

## 8. What Stays Company-Specific (and that's OK)

Some things genuinely need to be per-company and should NOT be forced into a generic template:

| Company | What's Unique | Why It Can't Be Generic |
|---|---|---|
| BBL | Asset portfolio display rules, Thai baht formatting, Thai number words, portfolio review scenario | Wealth management with concrete financial data display |
| HSBC | Cantonese sentence particles, Traditional Chinese formatting, HK regulatory compliance | Language-specific NLP rules for natural Cantonese conversation |
| Prudential SG | Progressive questioning per product (4 products x 3 phases x 2 questions), product-specific knowledge at 3 levels | Deep product-specific evaluation rubrics |
| MSIG/Manulife | Checklist-based assessment with specific compliance scripts | Regulatory compliance scripts (must match exact wording) |
| AIA KO | Marketing-consent outbound call dynamics | Unique call type (outbound, not inbound) |
| MTL Prospect Practice | Inverted roles (AI = agent, user = prospect) | Completely different conversation structure |

These should remain as **company plugins** that overlay onto the shared infrastructure, not as entirely separate codepaths.

---

## 9. Relationship to Assessment Defragmentation

This prompt defragmentation is a **prerequisite** for the assessment pipeline defragmentation described in `assessment-defragmentation.md`. The two plans are complementary:

| Assessment Plan | Prompt Plan | Dependency |
|---|---|---|
| Phase 1: Unified sections model | Phase 2: Assessment prompt template | The unified sections model needs parameterized prompts to work |
| Phase 2: Migrate existing types | Phase 2-3: Migrate prompt files | Each type migration requires its prompts to be parameterized |
| Phase 3: Unified frontend card | (independent) | Frontend doesn't depend on prompt structure |
| (independent) | Phase 1: Decompose sales-voice.ts | Voice decomposition is independent of the assessment pipeline |

**Recommended order**: Start with the voice decomposition (Phase 1 of this plan) since it's independent and high-impact. Then do the assessment prompt template (Phase 2 of this plan) alongside the assessment pipeline migration (Phase 1-2 of the assessment plan).
