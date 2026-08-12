# Repository Guidelines

## Project Structure & Module Organization
The codebase is TypeScript-first. `src/server.ts` bootstraps the Fastify API and wires plugins from `src/plugins`. Domain logic lives in `src/services` and `src/routes`, with schemas and utility helpers under `src/models`, `src/types`, and `src/utils`. Background automation uses Agenda jobs inside `src/jobs`, while LLM prompts and assets live in `src/prompts` and `src/views`. Generated artifacts land in `dist/`; never edit them directly. Supporting assets reside in `public/`, analytics workflows sit under `analytics/`, deployment automation (Docker, shell, nginx) in `deployment/`, and the Python-based LiveKit agent stack in `livekit-service/`.

## Build, Test, and Development Commands
- `npm run dev` — start the Fastify server with `tsx` watch reload in development.
- `npm run dev:nowatch` — run the server once with local `.env` resolution (helpful in Docker).
- `npm run build` — compile TypeScript via `tsc` into `dist/`.
- `npm run start` — execute the compiled server with instrumentation for production-like runs.
- `npm run lint` / `npm run lint:fix` / `npm run format` — enforce Prettier formatting across `src/`.
- `npm run test`, `npm run test:watch`, `npm run test:coverage` — run Vitest suites, optionally with watch or coverage.
- `npm run sentry:sourcemaps` — inject and upload source maps for releases; run as part of deploys.

## Coding Style & Naming Conventions
Stick to TypeScript ESM modules and 2-space indentation. Prettier is the source of truth; let it decide semicolons, quote style, and wrapping. Prefer descriptive filenames in lowercase with dashes (for example `competitive-intelligence/summary.service.ts`). Use PascalCase for classes, camelCase for functions and variables, and SCREAMING_SNAKE_CASE for environment keys. Keep shared contracts inside `src/types` and re-export domain schemas from `src/models` to avoid deep import paths.

## Testing Guidelines
Vitest powers unit and integration tests. Co-locate new tests near their subjects using `*.test.ts` naming to stay discoverable. Stub third-party APIs with Vitest mocks rather than hitting the network. Aim for coverage on new modules and document gaps in the PR if a path cannot be exercised. Use `NODE_ENV=test npm run test` when debugging environment-specific logic.

## Commit & Pull Request Guidelines
Follow the existing imperative, sentence-case commit style (e.g., `Add Analytics Quick Start Guide`). Each commit should bundle a focused change and reference issue IDs when relevant. Pull requests need: a concise summary, testing notes (`npm run test` output, manual QA), screenshots or cURL examples for API changes, and updated docs or config diffs. Ensure CI passes and link any dependent deployment steps before requesting review.

## Security & Configuration Tips
Configuration lives in layered `.env` files resolved by `src/env.ts`; never commit secrets. Validate new variables with the Ajv schema before use. Review `deployment/` scripts before executing locally, and keep `livekit-service/requirements.txt` pinned to avoid supply-chain surprises.
