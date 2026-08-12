# Roleplay Playground — Design Document

**Date:** 2026-03-07
**Status:** Approved
**Repo:** `/Users/praze/projects/hupo/roleplay-playground`

## Problem

Creating a new roleplay experience (assessment type) currently requires editing ~10 files across backend and frontend: model enums, framework configs, evaluation prompts, voice prompts, router logic, job registration, assessment routes, frontend session cards, and assessment display components. This makes the feedback loop for experimenting with prompts, voices, and evaluation criteria painfully slow.

## Solution

A self-contained, config-driven roleplay playground where the team can assemble and test complete roleplay experiences — voice, persona prompt, real-time feedback, and post-session evaluation — without touching the production codebase. The playground should be flexible enough to replicate what both `aisales-backend` and the demo app (`aicoach-backend` / `role-play-frontend`) do.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Users | Internal team only | No public auth, rate limiting, or billing needed |
| Core loop | Full end-to-end | Configure -> roleplay -> evaluate -> tweak -> repeat |
| Architecture | Separate standalone app | Own repo, own DB, own LLM/voice integration. No dependency on existing backends |
| Stack | TanStack Start + MongoDB | Fullstack TS in one repo. Server functions for LLM/ElevenLabs API calls. MongoDB for persistence (same as main projects) |
| Voice | Full ElevenLabs voice sessions | Real TTS, not text-only. Test the actual experience |
| Persistence | MongoDB with export | Configs saved to DB, exportable as JSON for promoting to production |
| Repo location | `../roleplay-playground` | Sibling to aisales-backend, aisales-frontend, aicoach-backend, role-play-frontend |

## Architecture

### Data Model

Two core entities: **Blocks** (reusable components) and **Configs** (assembled experiences).

```
Block {
  _id: ObjectId
  type: "voice" | "persona" | "feedback" | "evaluation"
  name: string                    // "Korean Elderly Female", "AIA KO Intro Eval"
  content: object                 // Type-specific content (see below)
  createdAt: Date
  updatedAt: Date
}

Config {
  _id: ObjectId
  name: string                    // "AIA KO Opening Call v3"
  description?: string
  voice: BlockRef | VoiceContent          // Reference a block OR inline
  persona: BlockRef | PersonaContent
  feedback: BlockRef | FeedbackContent | null
  evaluation: (BlockRef | EvaluationContent)[]
  lastRunAt?: Date
  createdAt: Date
  updatedAt: Date
}

BlockRef {
  $ref: ObjectId                  // Points to a Block document
}

Session {
  _id: ObjectId
  configId: ObjectId              // Which config was used
  configSnapshot: object          // Frozen copy of the config at run time
  transcript: TranscriptEntry[]
  evaluationResults: object[]     // One per evaluation section
  duration: number
  createdAt: Date
}
```

### Block Content Types

**VoiceContent:**
```
{
  provider: "elevenlabs"
  voiceId: string               // ElevenLabs voice ID
  model: string                 // "eleven_turbo_v2_5", etc.
  stability: number             // 0-1
  similarityBoost: number       // 0-1
  style?: number
  useSpeakerBoost?: boolean
}
```

**PersonaContent:**
```
{
  systemPrompt: string          // The full system prompt with {{variables}}
  variables: Record<string, string>  // { name: "Mr. Choi", age: "60", ... }
  firstMessage?: string         // Optional AI greeting (e.g., "Hello?")
  language?: string             // "ko", "en", etc.
}
```

**FeedbackContent:**
```
{
  prompt: string                // Real-time feedback system prompt
  enabled: boolean
}
```

**EvaluationContent:**
```
{
  name: string                  // "Introduction", "Objection Handling"
  prompt: string                // Full evaluation prompt with {{characterName}}, etc.
  outputKey: string             // JSON key in LLM response: "introduction", "objectionHandling"
  maxScore: number              // 100
  model?: string                // "gpt-4o", "claude-sonnet-4-20250514", etc. Default: gpt-4o
}
```

### Tech Architecture

```
roleplay-playground/
  app/
    routes/
      index.tsx                 # Dashboard: configs list + blocks library
      configs/
        $configId.tsx           # Config editor (4 tabs: voice, persona, eval, feedback)
        $configId.run.tsx       # Live roleplay session
        $configId.sessions/
          $sessionId.tsx        # Session results + transcript
    server/
      functions/                # TanStack Start server functions
        configs.ts              # CRUD for configs
        blocks.ts               # CRUD for blocks
        sessions.ts             # Create/end session, store transcript
        elevenlabs.ts           # List voices, get voice preview
        evaluate.ts             # Run evaluation prompts against transcript (LLM call)
        feedback.ts             # Real-time feedback LLM call
    lib/
      db.ts                     # MongoDB/Mongoose connection
      models/                   # Mongoose schemas (Block, Config, Session)
      llm.ts                    # LLM client (Anthropic/OpenAI)
      elevenlabs.ts             # ElevenLabs API client
  .env                          # MONGODB_URI, ELEVENLABS_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY
  package.json
  tsconfig.json
  app.config.ts                 # TanStack Start config
```

### Roleplay Session Flow

```
1. User clicks [Run] on a config
2. Frontend loads config, resolves any block references
3. Frontend connects to ElevenLabs Conversational AI (WebSocket)
   - Sends: voice settings + persona system prompt (with variables interpolated)
   - AI speaks first message (if configured)
4. User speaks, AI responds (loop)
5. If real-time feedback enabled:
   - Every N turns, frontend sends transcript to server function
   - Server function calls LLM with feedback prompt + transcript
   - Returns feedback bubble to display in UI
6. User clicks [End Session]
7. Frontend sends full transcript to server function
8. Server function:
   a. Saves transcript to Session document (with configSnapshot)
   b. For each evaluation section in config:
      - Calls LLM with evaluation prompt + transcript
      - Parses JSON response
      - Stores in Session.evaluationResults[]
9. Frontend navigates to results page
```

## UI Screens

### 1. Dashboard (`/`)

- **Configs section**: Card grid of saved configs. Each card shows name, last run time, [Run] and [Edit] buttons. [+ New] to create.
- **Blocks Library section**: Tab bar for block types (Voices, Personas, Evaluations, Feedback). Shows count per type. Click to browse/edit individual blocks.

### 2. Config Editor (`/configs/:id`)

Four tabs:

**Voice tab:**
- Toggle: "Pick from library" (dropdown of saved voice blocks) or "Configure here" (inline)
- ElevenLabs voice picker with search and audio preview
- Sliders for stability, similarity boost, style
- Model selector dropdown

**Persona tab:**
- Toggle: library or inline
- Template variables section: key-value pairs, [+ Add variable] button
- Full-height code editor (Monaco/CodeMirror) for the system prompt
- Variables like `{{name}}`, `{{age}}` auto-highlighted in editor
- Optional: first message field, language selector

**Evaluation tab:**
- List of evaluation sections, [+ Add Section] button
- Each section: collapsible card with name, prompt editor (expandable), output key, max score, model selector
- Drag to reorder sections

**Feedback tab:**
- Toggle: enabled/disabled
- Prompt editor for real-time feedback system prompt
- Library or inline toggle

**Top bar:** Config name (editable), [Run] button, [Export JSON] button

### 3. Run Session (`/configs/:id/run`)

- Minimal UI focused on the conversation
- Live transcript with speaker labels (AI / You)
- Real-time feedback bubbles (if enabled)
- Microphone indicator / speaking state
- [End Session] button
- Timer showing session duration

### 4. Session Results (`/configs/:id/sessions/:sessionId`)

- Per-section evaluation scores with expandable criteria breakdown
- Each criterion shows: score, max score, why (explanation), suggestion
- Full transcript below scores
- Action buttons: [Run Again], [Edit Config], [Export JSON], [Copy Transcript]

### 5. Block Library (modal or sub-page)

- Browse blocks by type
- Click to view/edit a block
- See which configs reference a block
- [+ New Block] button per type

## Block Library Behavior

- Blocks are optional. You can inline everything in a config.
- When you "Pick from library" in a config editor, the config stores a `$ref` to the block.
- Editing a shared block updates all configs that reference it.
- Inlining a block copies its content into the config (no reference).
- From any inline content in a config, you can "Save as block" to extract it to the library.

## Export / Promote to Production

The [Export JSON] button on a config produces a self-contained JSON document with all blocks resolved (no references). This JSON contains everything needed to recreate the experience:

```json
{
  "name": "AIA KO Opening Call v3",
  "voice": { "provider": "elevenlabs", "voiceId": "...", ... },
  "persona": { "systemPrompt": "...", "variables": { ... }, ... },
  "feedback": { "prompt": "...", "enabled": true },
  "evaluation": [
    { "name": "Introduction", "prompt": "...", "outputKey": "introduction", "maxScore": 100 },
    { "name": "Objection Handling", "prompt": "...", ... }
  ]
}
```

A developer then uses this as the source of truth to wire up a real assessment type in whichever backend (aisales, aicoach, demo) needs it.

## MVP Scope

**Must-have (v1):**
- Config CRUD (create, edit, list, delete)
- Voice tab: ElevenLabs voice picker with preview and settings
- Persona tab: system prompt editor with template variables
- Evaluation tab: multiple evaluation sections with prompt editors
- Feedback tab: real-time feedback prompt editor with enable/disable
- Run session: full ElevenLabs voice roleplay
- Session results: evaluation scores + transcript
- Export config as JSON
- MongoDB persistence

**Nice-to-have (v2):**
- Block library (reusable components)
- Session history per config
- Side-by-side comparison of session results
- Import config from JSON
- Duplicate/fork configs
- Collaborative editing (multiple team members)
- LiveKit provider option (alongside ElevenLabs)

## Environment Variables

```
MONGODB_URI=mongodb+srv://...        # Separate DB or same cluster, different database
ELEVENLABS_API_KEY=...               # For voice sessions + voice listing
ANTHROPIC_API_KEY=...                # For evaluation + feedback LLM calls
OPENAI_API_KEY=...                   # Alternative LLM provider for evaluation
```
