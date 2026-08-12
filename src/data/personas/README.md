# Co-located Persona System

This directory contains the co-located persona system where each persona's definition and all its translations are stored in a single file.

## Structure

```
src/data/personas/
├── README.md           # This documentation
├── types.ts           # TypeScript interfaces and utilities
├── localization.ts    # Localization utilities
├── index.ts           # Main exports and persona management
├── marc.ts            # Marc persona with all translations
├── angeline.ts        # Angeline persona with all translations
├── elaine.ts          # Elaine persona with all translations
├── grace.ts           # Grace persona with all translations
├── yvonne.ts          # Yvonne persona with all translations
├── amit.ts            # Amit persona with all translations
├── ravi.ts            # Ravi persona with all translations
├── michael.ts         # Michael persona with all translations
├── natalie.ts         # Natalie persona with all translations
└── prakash.ts         # Prakash persona with all translations
```

## Benefits

✅ **Co-located**: All persona data (base + translations) in one file  
✅ **Maintainable**: Single file per persona to update  
✅ **Type-safe**: Full TypeScript compilation checks  
✅ **Discoverable**: Easy to find all persona-related code  
✅ **Scalable**: Easy to add new languages or personas

## Usage

### Get personas in a specific language

```typescript
import { getPersonas } from './personas/index.js';

const personas = getPersonas('en'); // English
const personasId = getPersonas('id'); // Indonesian
const personasMs = getPersonas('ms'); // Malaysian
```

### Get a specific persona

```typescript
import { getPersonaByFriendlyId } from './personas/index.js';

const marc = getPersonaByFriendlyId(
  'marketing-executive-first-job-impatient',
  'en',
);
```

### Access persona configuration directly

```typescript
import { marcPersona } from './personas/marc.js';

// Get English version
const marcEn = buildPersonaDocument(marcPersona, 'en');

// Get Indonesian version
const marcId = buildPersonaDocument(marcPersona, 'id');

// Access all languages
const allLanguages = marcPersona.localized; // { en: {}, id: {}, ms: {} }
```

## Creating New Personas

1. **Create persona file**: `src/data/personas/[name].ts`
2. **Define configuration**: Use `PersonaConfiguration` interface
3. **Add all translations**: Include `en`, `id`, `ms` localized content
4. **Export persona**: Add to `index.ts` exports
5. **Update configurations**: Add to `PERSONA_CONFIGURATIONS` array

Example:

```typescript
// src/data/personas/newpersona.ts
import { PersonaConfiguration } from './types.js';

export const newPersona: PersonaConfiguration = {
  base: {
    id: 'unique-id',
    friendlyId: 'new-persona-friendly-id',
    name: 'PersonaName',
    // ... other base fields
  },
  localized: {
    en: {
      /* English content */
    },
    id: {
      /* Indonesian content */
    },
    ms: {
      /* Malaysian content */
    },
  },
};
```

## Migration Status

✅ **All personas fully migrated and legacy files cleaned up:**

1. **Marc** - Marketing Executive (First Job, Impatient)
2. **Angeline** - Doctor Resident (Analytical)
3. **Elaine** - Teacher (Practical, Nurturing)
4. **Grace** - HR Manager (Sandwich Generation)
5. **Yvonne** - Senior Finance Manager (Legacy)
6. **Amit** - Retired Engineer (Prudent)
7. **Ravi** - Logistics Founder (Affluent)
8. **Michael** - CEO MNC Real Estate (Skeptical)
9. **Natalie** - Aesthetic Doctor (Partner-driven)
10. **Prakash** - Head Admin TCS (Prospect)

## Supported Languages

- `en`: English (default)
- `id`: Indonesian (Bahasa Indonesia)
- `ms`: Malaysian (Bahasa Melayu)

## Legacy Cleanup

✅ **Cleanup completed:**

- Removed old `src/data/personas.ts` (476 lines)
- Removed `src/utils/personaLocalization.ts` utility
- Cleaned persona translations from all i18n files (~270 lines each)
- Updated route handlers to use new persona system
- All tests pass and system verified working
