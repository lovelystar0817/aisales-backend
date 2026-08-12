# Backend Architecture

The backend is the brain of the operation, built with **Fastify** and **TypeScript**.

## Directory Structure (`aisales-backend/src`)

*   `routes/`: Contains the API endpoint definitions. Each file typically exports a Fastify plugin.
    *   `sessions/`: Managing roleplay sessions.
    *   `manage/`: Admin endpoints.
    *   `auth/`: Auth0 webhooks and handlers.
*   `models/`: MongoDB schemas using Mongoose.
    *   `User`, `SalesSession`, `Company`, `Product`.
*   `services/`: Business logic layers.
*   `prompts/`: The "secret sauce" – the system prompts that define the AI personas and assessment criteria.
*   `jobs/`: Background jobs managed by `agenda` (e.g., cleanup, email notifications).

## Key Technologies

*   **Fastify:** Used for its speed and plugin architecture.
*   **Zod:** Used extensively for request/response validation and type safety.
*   **LangChain:** Abstraction layer for switching between LLM providers (OpenAI, Anthropic).
*   **Agenda:** Lightweight job scheduling for Node.js.

## Security

*   **Authentication:** JWT-based (JSON Web Tokens) validation via Auth0.
*   **Middleware:** Custom middleware for role-based access control (`verifyAdmin`).
*   **Validation:** All inputs are strictly validated against Zod schemas to prevent injection attacks.
