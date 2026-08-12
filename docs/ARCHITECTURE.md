# Architecture Overview

> Interactive architecture diagrams for the AISales Backend. These diagrams render automatically on GitHub and in VS Code with Mermaid extensions.

## Table of Contents
- [System Overview](#system-overview)
- [Startup Flow](#startup-flow)
- [Request Lifecycle](#request-lifecycle)
- [Route Structure](#route-structure)
- [Data Models](#data-models)
- [Background Jobs](#background-jobs)
- [AI/LLM Integration](#aillm-integration)
- [Authentication Flow](#authentication-flow)
- [Key File Reference](#key-file-reference)

---

## System Overview

```mermaid
flowchart TB
    subgraph Clients["Clients"]
        Web["Web App"]
        Mobile["Mobile App"]
        Admin["Admin Panel"]
    end

    subgraph Gateway["API Gateway"]
        Fastify["Fastify Server<br/>src/server.ts"]
    end

    subgraph Core["Core Services"]
        Auth["Authentication<br/>Auth0 + Guest"]
        Routes["Route Handlers<br/>src/routes/"]
        Middleware["Middleware<br/>src/middleware/"]
    end

    subgraph AI["AI Services"]
        LangChain["LangChain"]
        Anthropic["Anthropic Claude"]
        OpenAI["OpenAI GPT"]
        ElevenLabs["ElevenLabs TTS"]
    end

    subgraph Data["Data Layer"]
        MongoDB[(MongoDB)]
        S3["AWS S3<br/>Audio Storage"]
        Redis["Session Store"]
    end

    subgraph Background["Background Jobs"]
        Agenda["Agenda Scheduler<br/>src/jobs/"]
    end

    subgraph External["External Services"]
        Auth0["Auth0"]
        LiveKit["LiveKit<br/>Real-time Voice"]
        SendGrid["SendGrid<br/>Email"]
        Sentry["Sentry<br/>Error Tracking"]
        PostHog["PostHog<br/>Analytics"]
    end

    Clients --> Gateway
    Gateway --> Core
    Core --> AI
    Core --> Data
    Core --> Background
    Core --> External
    Background --> Data
    Background --> AI
```

---

## Startup Flow

The application boots in a specific sequence. Click through to understand each step.

```mermaid
flowchart TD
    Start([npm run dev]) --> Server["server.ts<br/>Entry Point"]

    Server --> Polyfills["Import Polyfills<br/>pdfjs-polyfills.js"]
    Polyfills --> AdminJS["Register AdminJS<br/>Mongoose Adapter"]
    AdminJS --> CreateApp["createApp()<br/>app.ts"]

    subgraph AppSetup["App Configuration (app.ts)"]
        CreateApp --> Fastify["Create Fastify Instance<br/>with Zod Type Provider"]
        Fastify --> CorePlugins["Register Core Plugins"]

        subgraph Plugins["Plugins (in order)"]
            CorePlugins --> CORS["@fastify/cors"]
            CORS --> FormBody["@fastify/formbody"]
            FormBody --> Multipart["@fastify/multipart<br/>600MB limit"]
            Multipart --> Env["@fastify/env<br/>Load .env"]
            Env --> Cookie["@fastify/cookie"]
            Cookie --> Session["@fastify/session<br/>MongoStore"]
            Session --> Helmet["@fastify/helmet"]
            Helmet --> Sentry["Sentry Error Handler"]
            Sentry --> AutoLoad["Autoload Plugins<br/>src/plugins/"]
        end

        AutoLoad --> Routes["Register Routes<br/>25+ endpoints"]
        Routes --> AgendaInit["Initialize Agenda<br/>Background Jobs"]
        AgendaInit --> Hooks["Add Hooks<br/>Email Verification"]
    end

    AppSetup --> Ready["app.ready()"]
    Ready --> Email["configureEmail()<br/>SendGrid"]
    Email --> MongoDB["mongoose.connect()<br/>Connection Pool"]
    MongoDB --> Listen["app.listen()<br/>HOST:PORT"]
    Listen --> Running([Server Running])

    style Start fill:#90EE90
    style Running fill:#90EE90
    style Server fill:#FFB6C1
    style CreateApp fill:#FFB6C1
```

### Key Files in Startup

| Order | File | Purpose |
|-------|------|---------|
| 1 | `src/server.ts` | Entry point, MongoDB connection, shutdown handlers |
| 2 | `src/app.ts` | Fastify app creation, plugin & route registration |
| 3 | `src/env.ts` | Environment validation with Zod |
| 4 | `src/plugins/*.ts` | Custom Fastify plugins (auth, s3, admin, etc.) |
| 5 | `src/jobs/agenda.ts` | Background job scheduler initialization |

---

## Request Lifecycle

Every HTTP request flows through this pipeline:

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Fastify
    participant M as Middleware
    participant A as Auth
    participant H as Handler
    participant DB as MongoDB
    participant AI as LLM

    C->>F: HTTP Request
    F->>F: CORS Check
    F->>F: Helmet Security
    F->>M: onRequest Hook
    M->>M: checkEmailVerification
    F->>A: Authentication

    alt Auth0 Token
        A->>A: Verify JWT
        A->>DB: Fetch User
    else Guest Token
        A->>A: Verify Guest Token
    end

    A->>F: User Context
    F->>F: Zod Validation
    F->>H: Route Handler

    alt Database Operation
        H->>DB: Query/Mutation
        DB->>H: Result
    end

    alt AI Operation
        H->>AI: LLM Request
        AI->>H: Response
    end

    H->>F: Response
    F->>C: HTTP Response
```

---

## Route Structure

```mermaid
flowchart LR
    subgraph Auth["/auth"]
        A1["POST /company"]
        A2["GET /success"]
        A3["GET /error"]
        A4["POST /guest"]
        A5["POST /revoke"]
        A6["GET /check-status"]
    end

    subgraph Sessions["/sessions"]
        S1["GET/POST / (CRUD)"]
        S2["POST /:id/roleplay"]
        S3["POST /:id/assessment"]
        S4["GET /:id/persona"]
        S5["GET /:id/report"]
    end

    subgraph Feedback["/feedback"]
        F1["POST /generate"]
        F2["GET /:sessionId"]
    end

    subgraph CallAnalysis["/call-analysis"]
        CA1["POST /upload"]
        CA2["GET /:id"]
        CA3["POST /:id/assess"]
    end

    subgraph LiveKit["/livekit"]
        L1["POST /token"]
        L2["POST /roleplay"]
    end

    subgraph Standings["/standings"]
        ST1["GET /configuration"]
        ST2["GET /summary"]
    end

    subgraph Manage["/manage"]
        M1["Users CRUD"]
        M2["Modules CRUD"]
        M3["Products CRUD"]
        M4["Scenarios CRUD"]
    end

    subgraph AdminAPI["/api/admin"]
        AD1["Dashboard Stats"]
        AD2["Reports"]
    end

    Root["Fastify App"] --> Auth
    Root --> Sessions
    Root --> Feedback
    Root --> CallAnalysis
    Root --> LiveKit
    Root --> Standings
    Root --> Manage
    Root --> AdminAPI
```

---

## Data Models

### Entity Relationship Diagram

```mermaid
erDiagram
    Company ||--o{ User : has
    Company ||--o{ Module : has
    Company ||--o{ Persona : has
    Company ||--o{ SalesProduct : has
    Company ||--o{ Scenario : has
    Company ||--o{ Scorecard : has

    User ||--o{ SalesSession : creates
    User }o--o{ Team : belongs_to

    Scenario ||--o| Module : references
    Scenario ||--o| Persona : references
    Scenario ||--o| SalesProduct : references
    Scenario ||--o| Scorecard : references

    SalesSession ||--o| Scenario : uses
    SalesSession ||--o{ Message : contains
    SalesSession ||--o| UserStanding : generates

    Persona ||--o| Voice : has

    CallAnalysis ||--o| User : belongs_to
    CallAnalysis ||--o| Company : belongs_to

    Company {
        ObjectId _id
        string name
        string auth0OrgId
        string[] languages
        boolean trial
    }

    User {
        ObjectId _id
        string email
        string name
        string role
        ObjectId company
    }

    SalesSession {
        ObjectId _id
        ObjectId user
        ObjectId scenario
        object roleplay
        object feedback
        string status
    }

    Scenario {
        ObjectId _id
        ObjectId module
        ObjectId persona
        ObjectId product
        ObjectId scorecard
        string difficulty
    }

    Persona {
        ObjectId _id
        string name
        number age
        string occupation
        object localizations
    }

    Module {
        ObjectId _id
        string title
        string description
        object objectives
    }

    SalesProduct {
        ObjectId _id
        string name
        object keyFeatures
        object localizations
    }
```

### Core Model Files

| Model | File | Key Fields |
|-------|------|------------|
| User | `src/models/User.ts` | email, role, company, teams |
| Company | `src/models/Company.ts` | name, auth0OrgId, languages |
| SalesSession | `src/models/SalesSession.ts` | user, scenario, roleplay, feedback |
| Scenario | `src/models/Scenario.ts` | module, persona, product, scorecard |
| Persona | `src/models/Persona.ts` | name, age, occupation, voice |
| Module | `src/models/Module.ts` | title, description, objectives |
| SalesProduct | `src/models/SalesProduct.ts` | name, keyFeatures, callCriteria |
| Message | `src/models/Message.ts` | session, role, content |

---

## Background Jobs

```mermaid
flowchart TB
    subgraph Triggers["Triggers"]
        API["API Request"]
        Schedule["Scheduled"]
        Event["Event"]
    end

    subgraph Agenda["Agenda Scheduler"]
        Queue["Job Queue"]
    end

    subgraph Jobs["Job Types"]
        subgraph Assessment["Assessment Jobs"]
            J1["calculateUserStanding"]
            J2["uploadAudioToS3"]
        end

        subgraph CallAnalysis["Call Analysis Jobs"]
            J3["transcribeWithSpeakers"]
            J4["assessCall"]
            J5["removePIIFromTranscript"]
            J6["removePIIFromAssessment"]
            J7["removePIIFromOverview"]
        end

        subgraph Products["Product Jobs"]
            J8["generateEmbeddings"]
            J9["extractFields"]
            J10["generateCompetitiveIntelligence"]
        end

        subgraph Other["Other Jobs"]
            J11["calculateDashboardSummary"]
            J12["postSlackReport"]
            J13["inviteUser"]
        end
    end

    subgraph Services["External Services"]
        S3["AWS S3"]
        LLM["LLM APIs"]
        Slack["Slack"]
        Email["SendGrid"]
    end

    Triggers --> Queue
    Queue --> Jobs
    Jobs --> Services
```

### Job Files

| Job | File | Purpose |
|-----|------|---------|
| calculateUserStanding | `src/jobs/assessment/calculateUserStanding.ts` | Update user performance metrics |
| uploadAudioToS3 | `src/jobs/assessment/uploadAudioToS3.ts` | Store session audio |
| transcribeWithSpeakers | `src/jobs/call-analysis/transcribeWithSpeakers.ts` | Speech-to-text with diarization |
| assessCall | `src/jobs/call-analysis/assessCall.ts` | AI analysis of call |
| postSlackReport | `src/jobs/report/postSlackReport.ts` | Daily Slack reports |

---

## AI/LLM Integration

```mermaid
flowchart TB
    subgraph Prompts["Prompt Templates (src/prompts/)"]
        P1["sales-technique.ts"]
        P2["product-knowledge.ts"]
        P3["roleplay-overview.ts"]
        P4["scorecard-assessment.ts"]
        P5["persona.ts"]

        subgraph Company["Company-Specific"]
            PC1["prudential/"]
            PC2["bbl/"]
            PC3["hsbc/"]
            PC4["msig-assessment.ts"]
            PC5["manulife-fna-assessment.ts"]
        end
    end

    subgraph LangChain["LangChain Layer"]
        Chain["Prompt + Model + Parser"]
    end

    subgraph Models["LLM Providers"]
        Claude["Anthropic Claude"]
        GPT["OpenAI GPT"]
    end

    subgraph Features["AI Features"]
        F1["Roleplay Conversations"]
        F2["Session Feedback"]
        F3["Assessment Scoring"]
        F4["Call Analysis"]
        F5["Competitive Intelligence"]
    end

    Prompts --> LangChain
    LangChain --> Models
    Models --> Features
```

### Prompt Organization

```
src/prompts/
├── sales-technique.ts      # Sales technique assessment
├── product-knowledge.ts    # Product knowledge evaluation
├── roleplay-overview.ts    # Roleplay session summary
├── scorecard-assessment.ts # Scorecard-based evaluation
├── persona.ts              # Persona generation
├── sales-voice.ts          # AI voice personality
│
├── prudential/             # Prudential-specific prompts
├── bbl/                    # BBL-specific prompts
├── hsbc/                   # HSBC-specific prompts
└── realtime-feedback/      # Live feedback prompts
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant A0 as Auth0
    participant DB as MongoDB

    alt Auth0 Login
        U->>F: Click Login
        F->>A0: Redirect to Auth0
        A0->>U: Show Login Form
        U->>A0: Enter Credentials
        A0->>A0: Validate
        A0->>F: Redirect with Code
        F->>A0: Exchange Code for Token
        A0->>F: JWT Token
        F->>B: API Request + JWT
        B->>B: Verify JWT (auth0 plugin)
        B->>DB: Find/Create User
        B->>F: Response + User Data
    end

    alt Guest Login
        U->>F: Start as Guest
        F->>B: POST /auth/guest
        B->>B: Generate Guest Token
        B->>DB: Create Guest User
        B->>F: Guest Token
        F->>B: API Request + Guest Token
        B->>B: Verify Guest Token
        B->>F: Response
    end
```

### Auth Files

| File | Purpose |
|------|---------|
| `src/plugins/auth0.ts` | Auth0 JWT verification plugin |
| `src/middleware/conditionalAuth.ts` | Universal auth setup (Auth0 + Guest) |
| `src/routes/auth/guest.ts` | Guest token generation |
| `src/routes/auth/success.ts` | OAuth callback handler |

---

## Key File Reference

### Entry Points
| File | Purpose | Link |
|------|---------|------|
| `src/server.ts` | Application entry point | [View](../src/server.ts) |
| `src/app.ts` | Fastify app configuration | [View](../src/app.ts) |
| `src/env.ts` | Environment configuration | [View](../src/env.ts) |

### Core Directories
| Directory | Purpose |
|-----------|---------|
| `src/models/` | MongoDB schemas (24 models) |
| `src/routes/` | API endpoints (14 modules) |
| `src/plugins/` | Fastify plugins (5 plugins) |
| `src/middleware/` | Request middleware |
| `src/jobs/` | Background jobs (15 jobs) |
| `src/prompts/` | LLM prompt templates |
| `src/utils/` | Shared utilities |
| `src/pdf/` | PDF report generation |

### Configuration Files
| File | Purpose |
|------|---------|
| `CLAUDE.md` | AI assistant guidelines |
| `package.json` | Dependencies & scripts |
| `tsconfig.json` | TypeScript config |
| `.prettierrc` | Code formatting |
| `pm2.config.cjs` | Production process manager |

---

## Quick Start for New Engineers

1. **Read First**: `CLAUDE.md` for coding patterns
2. **Run Locally**: `npm install && npm run dev`
3. **Explore Admin**: Visit `http://localhost:5000/admin`
4. **Trace a Request**: Follow `server.ts` → `app.ts` → any route
5. **Understand Models**: Start with `User.ts` → `SalesSession.ts`
6. **Check Tests**: Run `npm test` to see expected behavior

---

*Last updated: Generated automatically*
