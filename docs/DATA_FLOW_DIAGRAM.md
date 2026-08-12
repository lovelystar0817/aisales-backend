# Data Flow Diagram

> For GE questionnaire — Section 1: High-Level Hosting & Integration Posture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'lineColor': '#555555', 'primaryColor': '#e3f2fd', 'primaryBorderColor': '#90caf9', 'primaryTextColor': '#1a1a1a', 'actorBkg': '#e3f2fd', 'actorBorder': '#90caf9', 'activationBkgColor': '#f5f5f5', 'noteBkgColor': '#fff8e1', 'noteBorderColor': '#ffc107', 'loopTextColor': '#1a1a1a', 'signalColor': '#555555'}}}%%
sequenceDiagram
    actor User as GE Financial Rep<br/>(Web Browser)
    participant CF as Cloudflare<br/>CDN / WAF
    participant Auth0 as Auth0<br/>(SSO / SAML)
    participant API as Fastify Backend<br/>(DigitalOcean SGP1)
    participant DB as MongoDB<br/>(DigitalOcean SGP1)
    participant LK as LiveKit Cloud<br/>(WebRTC)
    participant Agent as AI Voice Agent<br/>(DigitalOcean SGP1)
    participant STT as Deepgram /<br/>OpenAI Whisper (STT)
    participant LLM as OpenAI GPT-4.1 /<br/>Anthropic Claude (LLM)
    participant 11Labs as ElevenLabs<br/>(TTS)
    participant S3 as AWS S3<br/>(Audio Storage)

    Note over User, S3: === Authentication Flow ===

    User->>CF: Navigate to train.hupo.co
    CF->>User: Serve React SPA
    User->>Auth0: Redirect to SSO Login (SAML/OIDC)
    Auth0->>Auth0: Validate credentials<br/>(GE SSO if integrated)
    Auth0->>User: Return JWT access token
    User->>CF: API call + JWT Bearer token
    CF->>API: Forward request (HTTPS)
    API->>API: Verify JWT signature
    API->>DB: Fetch/create user record
    DB->>API: User profile + company config
    API->>User: Authenticated session data

    Note over User, S3: === Roleplay Session Flow ===

    User->>API: Start roleplay session
    API->>DB: Create SalesSession record<br/>(linked to Scenario, Persona, Module)

    alt Alt A: LiveKit Voice Provider (select languages)
        API->>User: Return session + LiveKit token
        User->>LK: Connect WebRTC (audio stream)
        Agent->>LK: AI Agent joins voice room

        loop Conversation Loop
            User->>LK: Speak (audio)
            LK->>Agent: Forward audio stream
            Agent->>STT: Transcribe audio
            STT->>Agent: Text transcript
            Agent->>LLM: Send transcript + persona prompt
            LLM->>Agent: AI response text
            Agent->>11Labs: Convert response to speech (TTS)
            11Labs->>Agent: Audio stream
            Agent->>LK: Send AI audio
            LK->>User: Hear AI response
        end

    else Alt B: ElevenLabs Conversational AI (default)
        API->>11Labs: Get signed URL
        11Labs->>API: Return signed URL
        API->>User: Return session + signed URL
        User->>11Labs: Connect WebRTC (direct)

        loop Conversation Loop
            User->>11Labs: Speak (audio)
            Note right of 11Labs: Handles ASR, LLM<br/>& TTS internally
            11Labs->>User: Hear AI response
        end
    end

    Note over User, S3: === Post-Session Processing ===

    User->>API: End session
    API-->>LLM: [Optional] PII mask transcript
    API->>DB: Save conversation transcript
    API->>LLM: Generate feedback & assessment<br/>(scorecard-based evaluation)
    LLM->>API: Structured feedback JSON
    API->>DB: Store feedback + scores
    API-->>S3: [Optional] Upload session audio (encrypted)
    API->>User: Return session report

    Note over User, S3: === Data at Rest ===
    Note over DB: All data encrypted at rest (AES-256)<br/>User data isolated per Company
    Note over S3: Audio files encrypted (SSE-S3)<br/>Pre-signed URLs for access
```

## Data Flow Summary

### Authentication
1. User opens `train.hupo.co` in browser (HTTPS only)
2. Redirected to Auth0 for SSO login (supports SAML for GE IdP integration)
3. JWT token issued and used for all subsequent API calls
4. Backend verifies JWT on every request; user record fetched from MongoDB

### Roleplay Session (Two Voice Providers)

**Alt A: LiveKit Voice Provider** (used for select languages: Thai, Tagalog, Cebuano, Cantonese)
1. User starts a session — backend creates a `SalesSession` record in MongoDB
2. Backend generates a LiveKit access token and dispatches AI Voice Agent
3. User connects to LiveKit Cloud via WebRTC (audio only)
4. AI Agent (Python, hosted on DigitalOcean) joins the same voice room
5. **Conversation loop (3-stage pipeline):**
   - **STT:** User speaks → audio forwarded to Agent → Deepgram/OpenAI Whisper transcribes to text
   - **LLM:** Agent sends transcript + persona prompt → OpenAI GPT-4.1 / Anthropic Claude generates response
   - **TTS:** Agent sends response to ElevenLabs → text-to-speech → audio streamed back to user

**Alt B: ElevenLabs Conversational AI** (default provider)
1. User starts a session — backend creates a `SalesSession` record in MongoDB
2. Backend requests a signed URL from ElevenLabs
3. User connects directly to ElevenLabs via WebRTC
4. **Conversation loop:** User speaks → ElevenLabs handles ASR, LLM & TTS internally → User hears AI
5. No AI Voice Agent hosted on our infrastructure — everything runs on ElevenLabs servers

### Post-Session
1. *(Optional)* PII mask transcript via LLM before saving
2. Transcript saved to MongoDB
3. LLM generates structured feedback and scorecard assessment
4. Feedback and scores stored in MongoDB
5. *(Optional)* Audio uploaded to AWS S3 (encrypted at rest with SSE-S3)
6. User receives a session report

### Data Isolation
- All records are scoped to a `company_id` field
- GE users only see GE data; no cross-tenant data access
- Auth0 Organization feature enforces company-level login isolation
