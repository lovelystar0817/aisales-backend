# Onboarding Guide for New Engineers

> A structured approach to getting productive in the AISales Backend codebase.

## Quick Start (Day 1)

### 1. Environment Setup

```bash
# Clone and install
git clone <repo-url>
cd aisales-backend
npm install

# Copy environment template
cp .env.example .env.local
# Fill in required values (ask team lead for credentials)

# Start development server
npm run dev

# Visit admin panel
open http://localhost:5000/admin
```

### 2. Essential Reading (30 min)

| Order | File | Time | Why |
|-------|------|------|-----|
| 1 | `CLAUDE.md` | 10 min | Coding patterns and conventions |
| 2 | `docs/ARCHITECTURE.md` | 15 min | System overview with diagrams |
| 3 | `docs/architecture-explorer.html` | 5 min | Interactive exploration |

### 3. First Code Trace

Open these files in order and trace the flow:

```
src/server.ts → src/app.ts → src/routes/sessions/basic.ts
```

## Week 1 Checklist

### Day 1-2: Understand the Foundation
- [ ] Run the dev server successfully
- [ ] Access the admin panel at `/admin`
- [ ] Read `server.ts` and understand startup flow
- [ ] Read `app.ts` and identify all registered routes
- [ ] Trace one API request end-to-end

### Day 3-4: Understand Data Layer
- [ ] Read core models: `User.ts`, `Company.ts`, `SalesSession.ts`
- [ ] Understand the Scenario pattern (module + persona + product)
- [ ] Create a test session via admin panel
- [ ] Query data using MongoDB Compass

### Day 5: Understand AI Integration
- [ ] Read 2-3 prompt files in `src/prompts/`
- [ ] Understand how LangChain is used
- [ ] Trace a feedback generation request
- [ ] Review company-specific prompt variations

## Key Concepts to Master

### 1. Authentication Pattern
Every protected route uses this pattern:

```typescript
import { setupUniversalAuth } from '../../middleware/conditionalAuth.js';

const router: FastifyPluginAsyncZod = async (app) => {
  setupUniversalAuth(app);  // Enables both Auth0 and guest tokens

  app.get('/', { /* ... */ });
};
```

### 2. Route Structure
All routes follow this pattern:

```typescript
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

const router: FastifyPluginAsyncZod = async (app) => {
  app.post('/', {
    schema: {
      body: z.object({ /* validation */ }),
      response: { 200: z.object({ /* response shape */ }) }
    },
    async handler(req, reply) {
      // Implementation
    }
  });
};

export default router;
```

### 3. Model Pattern
All Mongoose models follow this pattern:

```typescript
import { Schema, Types, model } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';

export interface IModelName extends Timestamp {
  _id: Types.ObjectId;
  // fields
}

const schema = new Schema<IModelName>({ /* ... */ }, { timestamps: true });
export const ModelName = model<IModelName>('ModelName', schema);
```

### 4. Multi-Tenancy
Everything is scoped by Company:
- Users belong to Companies
- Modules, Personas, Products, Scenarios belong to Companies
- Sessions are created by Users (implicitly scoped to Company)

### 5. Assessment Types
Different companies have different assessment logic:
- `regular` - Default assessment
- `prudential` - Prudential-specific rubrics
- `msig`, `manulife`, `bbl`, `hsbc` - Company-specific

## Common Tasks

### Adding a New Route

1. Create file in appropriate `src/routes/` directory
2. Export as `FastifyPluginAsyncZod`
3. Register in `src/app.ts`
4. Add Zod validation schemas
5. Use `setupUniversalAuth` if protected

### Adding a New Model

1. Create file in `src/models/`
2. Define TypeScript interface extending `Timestamp`
3. Create Mongoose schema
4. Export model and interface
5. Add to AdminJS resources if needed (`src/utils/adminjs.ts`)

### Adding a New Background Job

1. Create file in appropriate `src/jobs/` subdirectory
2. Define job handler function
3. Register job in `src/jobs/agenda.ts`
4. Trigger from route or other job

### Modifying AI Prompts

1. Find prompt in `src/prompts/`
2. Check for company-specific overrides
3. Test changes thoroughly
4. Consider multi-language implications

## Debugging Tips

### Server Not Starting
```bash
# Check for port conflicts
lsof -i :5000

# Check MongoDB connection
mongosh $DATABASE_URL

# Check environment variables
node -e "console.log(require('dotenv').config({path:'.env.local'}))"
```

### Request Failures
```bash
# Enable verbose logging
NODE_ENV=development npm run dev

# Check Sentry for errors
# Visit Sentry dashboard
```

### AI/LLM Issues
- Check API keys in `.env.local`
- Review prompt files for syntax errors
- Check LangChain debug logs

## Resources

| Resource | Purpose |
|----------|---------|
| `docs/ARCHITECTURE.md` | System diagrams (Mermaid) |
| `docs/architecture-explorer.html` | Interactive explorer |
| `CLAUDE.md` | Coding conventions |
| `/admin` | Visual data exploration |
| Team Slack | Ask questions! |

## Questions to Ask Your Team Lead

1. Which company-specific features should I understand first?
2. What are the current priority areas/features?
3. Are there any known technical debt areas to be aware of?
4. What's the deployment process?
5. Who should I reach out to for different areas of the codebase?

## First Contribution Ideas

Good first issues for getting familiar with the codebase:

1. **Add a new validation rule** - Simple Zod schema change
2. **Add a field to an existing model** - Learn model patterns
3. **Create a simple utility function** - Understand utils structure
4. **Add a test** - Learn testing patterns
5. **Improve error messages** - Explore error handling

---

*Remember: It's okay to not understand everything immediately. This codebase is complex and production-grade. Take your time, ask questions, and trace code flows when confused.*
