# Self-Serve Migration Plan

Migrating from the hardcoded (legacy) architecture to the self-serve (DB-driven) architecture.

---

## 1. The Two Architectures

### Legacy Architecture (hardcoded)

Every entity — module, product, persona, competitive intelligence, framework, standing — is defined as a static TypeScript constant in the codebase. Adding a new company means adding new files in `src/products/`, `src/constants/modules.ts`, `src/data/personas/`, `src/competitive-intelligence/`, `src/data/standings/`, `src/frameworks/`, and then wiring them in via switch/case blocks in the utility functions.

**How it resolves data at runtime:**
```
companyId → switch/case → static array → filter by moduleId/productId → return
```

**Key files:**
| Entity | Static source | Lookup function |
|---|---|---|
| Modules | `src/constants/modules.ts` (ALL_SALES_MODULES, 30 entries) | `getModules()`, `getModuleById()`, `getModuleByFriendlyId()` |
| Products | `src/products/*.ts` (14 company files) | `getProducts()`, `getProductById()`, `getProductByFriendlyId()` |
| Personas | `src/data/personas/` (76+ configs across 30+ files) | `getPersonas()`, `getPersonaById()` |
| Frameworks | `src/frameworks/` (25 configs) | `getTranslatedFramework()`, `getLocalizedFramework()` |
| Competitive Intel | `src/competitive-intelligence/` (4 companies) | `getCompetitiveIntelligence()` |
| Standings | `src/data/standings/` (3 company files) | `getStandingConfigurationByModuleAndProduct()` |
| Localization | `src/locale/*.json` (6 language files) | `loadTranslations()` |

### Self-Serve Architecture (DB-driven)

Entities are stored as MongoDB documents and managed via the admin dashboard (`/manage/*` routes) or AdminJS (`/admin`). The **Scenario** model is the central join table linking Module + Persona + Product + Scorecard + Company.

**How it resolves data at runtime:**
```
companyId → Scenario.find({company, isActive: true}).populate(...) → transform → return
```

**Key models:**
| Model | Purpose | Admin UI |
|---|---|---|
| Module | Training module definition | `/manage/scenario/create-module` |
| SalesProduct | Product knowledge & features | `/manage/products/import` (document ingestion pipeline) |
| Persona | Roleplay character with personality, voice, avatar | `/manage/persona/create` |
| Scorecard | Assessment criteria (sections with AI-generated prompts) | `/manage/scorecard/create` |
| Scenario | Join table: Module + Persona + Product + Scorecard + Company | `/manage/scenario/create-scenario` |
| Voice | TTS voice configuration | AdminJS only |
| Company | Organization config, `selfServiceEnabled` gate | AdminJS only |

---

## 2. Current State of Migration

### The gate: `selfServiceEnabled` and `dataMigrated`

Two boolean flags on the Company model control which path is used:

```typescript
// Company model
selfServiceEnabled: boolean;  // Full self-serve: admin creates everything via UI
dataMigrated: boolean;        // Seeder has created Scenario docs from legacy data
```

### What is already migrated

| Area | Status | Notes |
|---|---|---|
| Module listing | Dual-path | `getModulesV2()` queries Scenarios. Used when `selfServiceEnabled \|\| dataMigrated` |
| Persona listing | Dual-path | `getPersonasV2()` queries Scenarios. Used when `selfServiceEnabled && scenarioId` |
| Session creation | Dual-path | Tries Scenario lookup first if `selfServiceEnabled`, falls back to static |
| Scorecard assessment | Fully self-serve | Reads prompts from `ScorecardSection.prompt` in MongoDB |
| Product ingestion | Self-serve only | Document upload → extraction → SalesProduct in DB |
| Module creation | Self-serve only | AI-generated icons, auto-translation |
| Persona creation | Self-serve only | AI-generated personality, avatar, voice auto-selection |
| Scenario preview | Self-serve only | AI-generated scenario from module+persona+product+scorecard |
| Seeder (006.ts) | Bridge | Creates Scenario docs from legacy static data for 6 companies |

### What is NOT migrated (still fully hardcoded)

| Area | Why it matters | Files |
|---|---|---|
| **Frameworks** | 25 static configs. Used in roleplay prompts and session display. No DB model exists. | `src/frameworks/` |
| **Competitive Intelligence** | 4 company configs. Used in roleplay voice prompts. Partial DB support (`SalesProductCompetitor`) but legacy CI still used. | `src/competitive-intelligence/` |
| **Standings** | 3 company configs (Prudential, MSIG, Manulife). Tier-based progression system. No DB model for configuration. | `src/data/standings/` |
| **Difficulty-specific persona overlays** | Per-persona difficulty levels, objections, UI descriptions. Used by 8+ companies. Injected at session creation. | `src/data/personas/difficulty-specific.ts` |
| **Voice prompts** | The 5,647-line `sales-voice.ts` with company-specific branches. `Scenario.voicePrompt` exists but is not used in roleplay. | `src/prompts/sales-voice/` |
| **Assessment handlers** | 15 handler files with company-specific logic. Only scorecard type reads from DB. | `src/utils/assessment/` |
| **BBL/MSIG objections** | Static objection banks selected randomly per session. | `src/data/bbl-objections.ts`, `src/data/msig-objections.ts` |
| **Module disclaimers** | Prudential-specific module disclaimers. | `src/data/disclaimers/` |
| **Product knowledge prompts** | Massive inline prompts (Prudential products: 500+ lines each). | `src/products/prudential.ts` |
| **Dashboard** | Uses `getModules()` (static only) even for self-serve companies. | `src/routes/manage/dashboard.ts` |
| **Report route** | Uses `getModuleByFriendlyId()` (static only). | `src/routes/sessions/report.ts` |
| **Standings routes** | Use `getStandingConfigurationByModuleAndProduct()` and `getProductById()` (static only). | `src/routes/standings/` |

---

## 3. The Core Problem: Dual-Path Maintenance

The codebase currently maintains **both architectures simultaneously**. This creates a matrix of problems:

### 3.1 Every route has if/else branching

```typescript
// Session creation (basic.ts:117)
if (companyId && company?.selfServiceEnabled) {
  matchingScenario = await Scenario.findById(scenarioId)...
  // DB path
} else {
  let foundProduct = getProductById(companyId, productId);  // static path
  let foundModule = getModuleById(moduleId!);               // static path
  const foundPersona = getPersonaById(personaId);           // static path
}
```

This pattern repeats in `persona.ts`, `roleplay.ts`, and `basic.ts` module listing.

### 3.2 Static functions consume 18 company switch/case blocks each

`getModules()`, `getProducts()`, and `getPersonas()` each have a switch/case with 18+ branches. Adding a company means adding a case to all three. `getPersonas()` further branches on moduleId and productId within each company case.

### 3.3 The seeder is a one-way bridge, not a sync mechanism

`seeder/006.ts` reads from static data and creates Scenario documents. But:
- It only covers 6 of 18 companies
- It doesn't handle updates (upsert by key, but doesn't delete stale scenarios)
- Modules, Products, and Personas must already exist in DB before the seeder runs
- It runs manually, not as part of deployment

### 3.4 Some routes bypass the self-serve path entirely

`dashboard.ts` always calls `getModules()` (static). `report.ts` calls `getModuleByFriendlyId()` (static). `standings/` routes call `getProductById()` and `getStandingConfigurationByModuleAndProduct()` (static). These routes break for self-serve companies whose data exists only in MongoDB.

---

## 4. Inventory: What Needs to Move to DB

### Tier 1: Already has a DB model, just needs full adoption

| Entity | DB Model | What's missing |
|---|---|---|
| Module | `Module` | Dashboard and report routes still use static `getModules()` |
| Product | `SalesProduct` | Roleplay still calls `getProductByFriendlyId()` for legacy companies. `knowledgePrompt` is inline in static files, not in DB model. |
| Persona | `Persona` | `getPersonaById()` still used in session creation fallback. Voice mapping hardcoded in `getDefaultLanguageVoiceProviderIds()`. |
| Scorecard | `Scorecard` | Fully adopted for scorecard assessment type. Not adopted for other assessment types. |
| Scenario | `Scenario` | `voicePrompt` field exists but unused. `contextPrompt` exists but unused in roleplay. |

### Tier 2: No DB model yet, needs one

| Entity | Current location | Proposed approach |
|---|---|---|
| Framework | `src/frameworks/` (25 configs) | Add fields to Module or create Framework model. Store evaluation structure. |
| Standing Config | `src/data/standings/` (Prudential, MSIG, Manulife) | Create StandingConfiguration model or embed in Scorecard. |
| Competitive Intel | `src/competitive-intelligence/` (4 companies) | `SalesProductCompetitor` model already partially exists. Extend to cover company-level CI. |
| Difficulty Overlay | `src/data/personas/difficulty-specific.ts` | Already handled by Scenario model (difficultyLevel, scenarioDetails). Just need to fully use it. |

### Tier 3: Can be absorbed into existing DB models

| Entity | Absorb into | How |
|---|---|---|
| Product knowledge prompts | `SalesProduct.knowledgeBase` or similar field | Move inline `knowledgePrompt` strings from static files to DB |
| Module disclaimers | `Module.disclaimer` field | Already localization-aware |
| BBL/MSIG objections | `Scenario.contextPrompt` or Persona details | Inject into the scenario context at creation time |
| Localization JSON files | Model `localizations` field (already exists on all models) | Already working for self-serve entities. Legacy entities still use JSON files. |

---

## 5. Migration Strategy

### Guiding Principles

1. **No big bang** — Migrate one entity type at a time. Each migration should be independently deployable.
2. **Seed first, switch later** — For each entity, first ensure all legacy data exists in MongoDB (via seeders), then switch the runtime to read from DB, then remove the static data.
3. **Use `dataMigrated` as the progressive gate** — Set `dataMigrated: true` for companies whose data has been seeded. Eventually, when all companies are migrated, remove the legacy path.
4. **Self-serve companies are already done** — Focus migration effort on the ~12 legacy companies.
5. **The Scenario model is the anchor** — All entity resolution should flow through Scenario. Don't create new direct-lookup paths.

---

### Phase 0: Stop the Bleeding (Immediate)

**Goal:** No more hardcoded additions. All new companies go through self-serve.

| Task | Effort | Impact |
|---|---|---|
| Enforce self-serve for all new companies | Policy | No more switch/case growth |
| Fix `dashboard.ts` to use `getModulesV2()` when `selfServiceEnabled \|\| dataMigrated` | Small | Dashboard works for self-serve companies |
| Fix `report.ts` to resolve module from session's stored data instead of static lookup | Small | Reports work for self-serve sessions |
| Add `scenarioId` to SalesSession schema (store at creation time) | Small | Enables looking up all scenario config at any point in the session lifecycle |

---

### Phase 1: Complete the Seeder Coverage (1-2 weeks)

**Goal:** All legacy companies have their data in MongoDB and `dataMigrated: true`.

| Task | Details |
|---|---|
| Extend `seeder/006.ts` to cover all 18 companies | Currently only covers 6. Add BBL, HSBC, HSBC-Yue, Manulife, PLT, Prudential-ID, Prudential-TW, Prudential-PH, Alibaba, AIA-KO, Research, Hupo Demo. |
| Create `seeder/salesProducts-full.ts` | Ensure ALL static products from all 14 company files are seeded into the SalesProduct collection with localized content. |
| Create `seeder/personas-full.ts` | Ensure ALL 76+ persona configurations are seeded into the Persona collection with localizations and voice references. |
| Create `seeder/modules-full.ts` | Ensure ALL 30 modules from `ALL_SALES_MODULES` are seeded into the Module collection with localizations. |
| Seed difficulty overlays | Convert `difficulty-specific.ts` data into Scenario.difficultyLevel and Scenario.scenarioDetails during seeding. |
| Validate seeder output | Script that compares static `getModules()` / `getPersonas()` output with `getModulesV2()` / `getPersonasV2()` for each company. |
| Set `dataMigrated: true` | For each company after validation passes. |

**Rollback:** If a seeded company has issues, set `dataMigrated: false` to revert to static path.

---

### Phase 2: Unify Runtime Resolution (2-3 weeks)

**Goal:** All runtime lookups go through Scenario/DB. Static functions become thin fallbacks that are only hit if DB data is missing.

#### 2a. Module resolution

```typescript
// Before (getModules):
switch (companyId) {
  case PRUDENTIAL_COMPANY_ID: return PRUDENTIAL_SALES_MODULES;
  case GRAB_COMPANY_ID: return GRAB_SALES_MODULES;
  // ... 16 more cases
}

// After:
async function getModulesUnified(companyId, languageCode) {
  const dbModules = await getModulesV2(companyId, languageCode);
  if (dbModules.length > 0) return dbModules;
  // Fallback to static (temporary, until all companies seeded)
  return getModules(companyId, languageCode);
}
```

| Task | Details |
|---|---|
| Make `getModules()` async-compatible or create `getModulesUnified()` | Wrapper that tries DB first, falls back to static |
| Update all callers of `getModules()` | `basic.ts` (4 calls), `roleplay.ts` (1 call), `dashboard.ts` (2 calls), `basic.ts` module listing (1 call) |
| Update all callers of `getModuleById()` / `getModuleByFriendlyId()` | Replace with `Module.findOne()` or `Module.findById()`. Falls back to static. |

#### 2b. Product resolution

| Task | Details |
|---|---|
| Create `getProductUnified()` | Tries `SalesProduct.findById()` then `SalesProduct.findOne({friendlyId})`, falls back to static `getProductById()` |
| Migrate `knowledgePrompt` to DB | For products with inline knowledge prompts (Prudential: 4 products with 500+ line prompts), store in `SalesProduct.knowledgeBase` or a dedicated field |
| Update all callers | `basic.ts` (3 calls), `roleplay.ts` (1 call), `standings/configuration.ts` (1 call) |

#### 2c. Persona resolution

| Task | Details |
|---|---|
| Create `getPersonaUnified()` | Tries `Persona.findById()`, falls back to static `getPersonaById()` |
| Remove `getPersonas()` switch/case | The 42-branch switch can be replaced by `getPersonasV2()` once all companies are seeded |
| Update all callers | `basic.ts` (2 calls), `persona.ts` (2 calls) |

#### 2d. Session creation unification

The session creation route (`POST /sessions/`) is the most critical path. After Phases 1 and 2a-2c:

```typescript
// Unified session creation (no if/else on selfServiceEnabled)
const scenario = await Scenario.findOne({
  company: companyId,
  module: moduleId,
  persona: personaId,
  product: productId,
  isActive: true,
}).populate('module persona product scorecard');

if (!scenario) {
  // Try default scenarios (no company)
  scenario = await Scenario.findOne({
    company: { $exists: false },
    module: moduleId,
    persona: personaId,
    product: productId,
  }).populate('module persona product scorecard');
}

if (!scenario) {
  return reply.status(404).send({ error: 'Scenario not found' });
}
```

No more `selfServiceEnabled` check needed. All companies use the same path.

---

### Phase 3: Migrate Remaining Entities to DB (3-4 weeks)

#### 3a. Frameworks

Frameworks define how the assessment is structured (e.g., 4C Model, MEDDPICC, Strategic Pitch). Currently 25 static configs.

**Option A: Embed in Scorecard** — Since frameworks determine assessment structure, store them as part of the Scorecard model. The Scorecard already has `sections` with `sectionType`. The framework is effectively the set of sections.

**Option B: Create Framework model** — Separate model with `friendlyId`, `type`, `localizations`. Referenced by Scorecard or Module.

**Recommendation:** Option A. The self-serve Scorecard already defines assessment structure through sections. Legacy frameworks can be converted to Scorecard sections. No new model needed.

| Task | Details |
|---|---|
| Map each framework to scorecard sections | 25 frameworks → 25 scorecard configs in DB |
| Update `getTranslatedFramework()` callers | `roleplay.ts`, `basic.ts`, `report.ts`, `livekit/roleplay.ts` — resolve from Scenario.scorecard instead of static lookup |
| Seed framework-based scorecards | For companies that don't have scorecards yet, create them from framework definitions |

#### 3b. Competitive Intelligence

**Current state:** Partially migrated. `SalesProductCompetitor` model exists for product-level CI. Company-level CI is still static.

| Task | Details |
|---|---|
| Seed existing static CI into `SalesProductCompetitor` | Grab (6 competitors), MSIG, Prudential, default CI |
| Update `getCompetitiveIntelligence()` | Check DB first (already partially done), remove static fallback when DB is complete |
| Add CI management to admin UI | Allow admins to add/edit competitors per product via manage routes |

#### 3c. Standings

Standings are the most complex entity to migrate. They define tier-based progression with scoring criteria.

**Options:**
- **Option A: Create StandingConfiguration model** — Mirror the current `StandingConfiguration` type as a MongoDB model.
- **Option B: Embed in Scorecard** — Since standings are essentially "how do you grade a scorecard result", they could be metadata on the Scorecard model.

**Recommendation:** Option A initially. Standings have their own lifecycle (progression tracking, tier comparisons) that's distinct from scorecards. Create a `StandingConfiguration` model.

| Task | Details |
|---|---|
| Create `StandingConfiguration` Mongoose model | Fields: company, module, product, type (tier-based/score-based), tiers, sharedCriteria, localizations |
| Seed existing standing configs | Prudential (1), MSIG (5), Manulife (1) |
| Update `getStandingConfigurationByModuleAndProduct()` | Query DB instead of static array |
| Add standing config to admin UI | AdminJS resource or manage route |

#### 3d. Voice Prompts (links to prompt-defragmentation.md)

The `Scenario.voicePrompt` field exists but is unused. This is the bridge for moving voice prompts from the `sales-voice.ts` monolith to DB.

| Task | Details |
|---|---|
| Implement `Scenario.voicePrompt` consumption in roleplay | When `voicePrompt` is set, use it instead of `getSalesVoicePrompt()` |
| Generate voice prompts for self-serve scenarios | Use AI to generate voice prompts from persona + module + product at scenario creation time (similar to how scorecard prompts are auto-generated) |
| Migrate legacy voice prompts gradually | See `docs/plans/prompt-defragmentation.md` for detailed plan |

---

### Phase 4: Cleanup (2-3 weeks, after validation period)

**Goal:** Remove all legacy static data and dual-path code.

| Task | Condition |
|---|---|
| Remove `selfServiceEnabled` / `dataMigrated` checks | All companies use DB path successfully for 2+ weeks |
| Delete `src/constants/modules.ts` | All modules in DB |
| Delete `src/products/*.ts` (14 files) | All products in DB |
| Delete `src/data/personas/` (30+ files) | All personas in DB |
| Delete `src/frameworks/` (25 configs) | Absorbed into Scorecard |
| Delete `src/competitive-intelligence/` configs | All CI in DB |
| Delete `src/data/standings/` configs | All standings in DB |
| Delete `src/data/personas/difficulty-specific.ts` | Absorbed into Scenario |
| Delete `src/data/bbl-objections.ts`, `src/data/msig-objections.ts` | Absorbed into Scenario.contextPrompt |
| Remove switch/case blocks from `getModules()`, `getProducts()`, `getPersonas()` | Replace with DB queries |
| Remove `LegacySalesProduct` interface | Use `ISalesProduct` only |
| Remove seeder scripts | Data is managed via admin UI |
| Delete company ID constants | `PRUDENTIAL_COMPANY_ID`, etc. — look up by friendlyId |

**Estimated static code removal:** ~15,000+ lines across 80+ files.

---

## 6. Dependency Graph

```
Phase 0: Stop the bleeding
    │
    ├── No new hardcoded companies (policy)
    ├── Fix dashboard.ts
    ├── Fix report.ts
    └── Store scenarioId on SalesSession
         │
Phase 1: Seed all legacy data into DB
    │
    ├── Seed modules → Module collection
    ├── Seed products → SalesProduct collection
    ├── Seed personas → Persona collection
    ├── Seed scorecards → Scorecard collection (done for 6 companies)
    ├── Seed scenarios → Scenario collection (extend from 6 to 18 companies)
    └── Set dataMigrated: true per company
         │
Phase 2: Unify runtime resolution
    │    (requires Phase 1 complete for each company)
    │
    ├── 2a: Module resolution → DB-first
    ├── 2b: Product resolution → DB-first
    ├── 2c: Persona resolution → DB-first
    └── 2d: Session creation → always Scenario-based
         │
Phase 3: Migrate remaining entities
    │    (can run in parallel with Phase 2)
    │
    ├── 3a: Frameworks → embed in Scorecard
    ├── 3b: Competitive Intel → SalesProductCompetitor
    ├── 3c: Standings → StandingConfiguration model
    └── 3d: Voice Prompts → Scenario.voicePrompt
         │
Phase 4: Cleanup
         (requires Phase 2 + Phase 3 complete, after validation)
```

---

## 7. Quick Wins (Can Do Now)

### 7.1 Fix dashboard to support self-serve companies

`src/routes/manage/dashboard.ts` calls `getModules(companyId)` which only returns static modules. Add the same `selfServiceEnabled || dataMigrated` check used in `basic.ts`:

```typescript
// dashboard.ts
if (company?.selfServiceEnabled || company?.dataMigrated) {
  modules = await getModulesV2(companyId, 'en');
} else {
  modules = getModules(companyId);
}
```

### 7.2 Store scenarioId on SalesSession

When creating a session, save the matched `scenario._id` on the SalesSession document. This enables:
- Looking up scorecard, framework, CI, standings from the scenario at any later point
- Removing the need to re-resolve module+product+persona at assessment time
- Tracing which scenario configuration produced which session

### 7.3 Use Scenario.voicePrompt when available

In `roleplay.ts` and `livekit/roleplay.ts`, before calling `getSalesVoicePrompt()`:

```typescript
if (session.scenario?.voicePrompt) {
  voicePrompt = session.scenario.voicePrompt;
} else {
  voicePrompt = getSalesVoicePrompt(companyId, ...);
}
```

This enables self-serve scenarios to have fully custom voice prompts without touching `sales-voice.ts`.

### 7.4 Resolve product from session data, not static lookup

In `roleplay.ts:1502`, the product is resolved via `getProductByFriendlyId()` even for self-serve sessions. Instead, if the session has a populated scenario, use `scenario.product` directly.

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Seeded data doesn't match static data exactly | High | Medium | Validation script comparing outputs. Keep `dataMigrated` flag for per-company rollback. |
| Performance regression from DB queries vs static | Low | Medium | Scenario queries are indexed (`company+product`). Add `module+company+isActive` compound index. Cache frequently accessed modules. |
| Admin accidentally modifies seeded data | Medium | High | Add `isLegacy` flag to seeded entities. Show warning in AdminJS for legacy entities. |
| Breaking changes to self-serve manage routes during migration | Low | High | Keep manage routes independent of migration. They only create new entities, don't modify legacy ones. |
| Localization gaps in seeded data | Medium | Medium | Seeder copies localization from static `localizations` field + JSON translation files. Validate all languages have content. |
| Some companies have deeply custom logic (BBL portfolio triggers, MSIG mandatory disclosures) | High | High | These must be captured in Scenario.contextPrompt or model fields. Requires manual review per company. |

---

## 9. Relationship to Other Plans

### Assessment Defragmentation (`assessment-defragmentation.md`)

The self-serve migration and assessment defragmentation are complementary:
- **Self-serve migration** moves the *input configuration* (what modules/products/personas exist) from static to DB
- **Assessment defragmentation** moves the *output pipeline* (how assessments are calculated, stored, rendered) from company-specific to generic
- Both converge on the Scorecard model as the unified assessment configuration
- Phase 3a (Frameworks → Scorecard) in this plan directly enables the "unified sections model" from the assessment plan

### Prompt Defragmentation (`prompt-defragmentation.md`)

- Phase 3d (Voice Prompts → Scenario.voicePrompt) directly depends on the voice prompt decomposition plan
- Self-serve scenarios already support `voicePrompt` field; the prompt plan provides the content migration strategy
- Assessment prompts are already migrated for the scorecard type (DB-stored, AI-generated from criteria)

### Recommended Execution Order

1. **Self-serve Phase 0 + Assessment quick wins** — Stop the bleeding in both areas simultaneously
2. **Self-serve Phase 1** — Seed all data. This is a prerequisite for removing legacy code.
3. **Self-serve Phase 2 + Assessment Phase 1** — Unify runtime resolution while building the unified sections model
4. **Self-serve Phase 3** — Migrate remaining entities (frameworks, CI, standings) to DB
5. **Assessment Phase 2-3 + Prompt Phase 1-2** — Migrate existing assessment types and decompose voice prompts
6. **Self-serve Phase 4 + Assessment Phase 4** — Final cleanup of all legacy code

---

## 10. Metrics to Track

| Metric | Current | Target |
|---|---|---|
| Companies on self-serve | ~2-3 | All (18+) |
| Companies with `dataMigrated: true` | ~6 | All |
| Static switch/case blocks in utility functions | 4 functions x 18 cases = 72 | 0 |
| Static entity files (products, personas, modules, etc.) | 80+ | 0 |
| Lines of static configuration code | ~15,000+ | 0 |
| Routes with dual-path if/else | 6+ | 0 |
| Time to onboard a new company | 2-3 days (dev work + deploy) | 30 minutes (admin UI) |
