# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start development server with hot reload (tsx watch)
- `npm run dev:nowatch` - Start development server without file watching
- `npm run build` - Compile TypeScript to JavaScript (output in `dist/`)
- `npm run start` - Start production server (runs `npm run serve`)

### Code Quality
- `npm run lint` - Check code formatting with Prettier
- `npm run format` - Auto-format code with Prettier  
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Architecture Overview

This is an AI-powered sales training platform backend built with Fastify and TypeScript. The system provides real-time sales roleplay sessions, feedback, and assessments.

### Core Technologies
- **Fastify 5** with TypeScript and ES modules
- **MongoDB** with Mongoose ODM
- **Auth0** for authentication (JWT Bearer tokens + Guest support)
- **LangChain** with Anthropic/OpenAI for AI features
- **LiveKit** for real-time communication
- **AdminJS** for admin panel at `/admin`
- **Agenda** for background job processing
- **Socket.io** for real-time updates

### Key Architectural Patterns

1. **Route Organization** (`src/routes/`):
   - Each route module exports a Fastify plugin using `FastifyPluginAsyncZod`
   - Uses Zod for request/response validation
   - Authentication via `setupUniversalAuth` (supports both Auth0 and guest tokens)
   - Organized by feature: sessions, auth, manage, feedback, livekit, etc.

2. **AI Integration** (`src/prompts/`):
   - Prompts organized by feature (sales techniques, product knowledge, roleplay)
   - Each prompt module exports formatted prompt strings
   - Sales frameworks: MEDDPICC, 4C, 3F, Strategic Pitch, Verify Plus 4C
   - Company-specific prompts (e.g., Prudential in `src/prompts/prudential/`)

3. **Models** (`src/models/`):
   - User, Company, SalesSession, Message, Module, Persona, SalesProduct
   - Mongoose schemas with TypeScript interfaces
   - Timestamp interface for createdAt/updatedAt consistency

4. **Background Jobs** (`src/jobs/`):
   - Uses Agenda for job scheduling
   - Jobs: calculateUserStanding, uploadAudioToS3, calculateDashboardSummary, postSlackReport

5. **Multi-Company Support**:
   - Competitive intelligence system (`src/competitive-intelligence/`)
   - Company-specific products (`src/products/`)
   - Company-specific standings (`src/data/standings/`)

### Environment Configuration
- Validated with Zod schema in `src/env.ts`
- Key configs: AUTH0_*, DATABASE_URL, ADMIN_*, POSTHOG_*, SENTRY_*, AWS_*

## Implementation Best Practices

### 1 - Before Coding
- **BP-1 (MUST)** Understand existing patterns by examining similar code
- **BP-2 (MUST)** Check if functionality already exists before creating new files
- **BP-3 (SHOULD)** Follow established naming conventions and file organization

### 2 - While Coding

#### TypeScript & Imports
- **TS-1 (MUST)** Use ES module imports with `.js` extensions even in TypeScript files
- **TS-2 (MUST)** Define interfaces for all Mongoose schemas extending appropriate base interfaces
- **TS-3 (MUST)** Use Zod for all request/response validation in routes
- **TS-4 (SHOULD)** Prefer `export const` over `export default` for better tree-shaking

#### Function & Variable Naming
- **FN-1 (MUST)** Use existing domain vocabulary (e.g., `SalesSession`, `Persona`, `Module`)
- **FN-2 (MUST)** Prefix utility functions with their domain (e.g., `getProductById`, `getModuleById`)
- **FN-3 (SHOULD)** Keep functions small and focused on a single responsibility

#### Route Development
- **RT-1 (MUST)** Export routes as Fastify plugins using `FastifyPluginAsyncZod`
- **RT-2 (MUST)** Use Zod schemas for validation in route definitions
- **RT-3 (MUST)** Use `setupUniversalAuth(app)` for routes requiring authentication
- **RT-4 (SHOULD)** Group related endpoints within the same router file

#### Error Handling
- **EH-1 (MUST)** Use custom error classes extending base Error
- **EH-2 (MUST)** Handle errors consistently within try-catch blocks
- **EH-3 (SHOULD)** Log errors appropriately using the app logger

### 3 - Code Organization

- **O-1 (MUST)** Keep related functionality together (e.g., all Prudential-specific code in dedicated folders)
- **O-2 (MUST)** Place shared utilities in `src/utils/`
- **O-3 (MUST)** Keep prompts in `src/prompts/` organized by feature
- **O-4 (SHOULD)** Avoid deep nesting - prefer flat structure where possible

### 4 - Testing

- **T-1 (MUST)** Use Vitest for testing
- **T-2 (SHOULD)** Place test files next to source files (not in separate test directory)
- **T-3 (SHOULD)** Use descriptive test names that explain the expected behavior
- **T-4 (SHOULD)** Mock external dependencies appropriately

### 5 - Code Style

- **CS-1 (MUST)** Follow Prettier configuration (single quotes, trailing commas, semicolons)
- **CS-2 (MUST)** Run `npm run format` before committing
- **CS-3 (SHOULD NOT)** Add comments unless explaining complex business logic
- **CS-4 (SHOULD)** Use meaningful variable and function names instead of comments

### 6 - Security

- **S-1 (MUST NOT)** Commit secrets or API keys
- **S-2 (MUST)** Validate all user inputs with Zod
- **S-3 (MUST)** Use parameterized queries with Mongoose
- **S-4 (MUST)** Check user permissions before allowing access to resources

### 7 - Database

- **DB-1 (MUST)** Define TypeScript interfaces for all Mongoose schemas
- **DB-2 (MUST)** Use proper Mongoose references between documents
- **DB-3 (SHOULD)** Add appropriate indexes for frequently queried fields
- **DB-4 (SHOULD)** Use transactions for operations that modify multiple documents

### 8 - AI/LLM Integration

- **AI-1 (MUST)** Keep prompts in separate files in `src/prompts/`
- **AI-2 (MUST)** Version prompts and test changes thoroughly
- **AI-3 (SHOULD)** Use structured output (JSON) when possible
- **AI-4 (SHOULD)** Include clear examples in prompts

## Common Patterns

### Creating a New Route
```typescript
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { setupUniversalAuth } from '../../middleware/conditionalAuth.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  setupUniversalAuth(app);
  
  app.post('/', {
    schema: {
      body: z.object({
        // Define request body schema
      }),
    },
    async handler(req, reply) {
      // Implementation
    }
  });
};

export default router;
```

### Creating a Model
```typescript
import { Schema, Types, model } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';

export interface IModelName extends Timestamp {
  _id: Types.ObjectId;
  // Define fields
}

const schema = new Schema<IModelName>(
  {
    // Define schema
  },
  {
    timestamps: true,
  }
);

export const ModelName = model<IModelName>('ModelName', schema);
```

## Important Notes

- Always use ES module imports with `.js` extensions in TypeScript files
- The admin panel is available at `/admin` with credentials from env vars
- Guest authentication is supported alongside Auth0
- Multi-language support: EN, ID, MS, TH, TL, VI
- Company-specific features are implemented for Prudential, Grab, and MSIG
- Background jobs are processed using Agenda
- Real-time features use Socket.io and LiveKit