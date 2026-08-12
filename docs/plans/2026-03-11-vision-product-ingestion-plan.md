# Vision-Based Product Ingestion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the text-only product ingestion pipeline with a vision-based map-reduce pipeline that extracts content from PDF images and produces rich markdown product summaries.

**Architecture:** PDFs are converted page-by-page to images, sent to `gpt-5.4` vision in parallel batches for content extraction, then a map-reduce pipeline summarizes all content into structured product fields with rich markdown descriptions. Non-PDF files continue using `officeparser` text extraction.

**Tech Stack:** OpenAI `gpt-5.4` (vision + chat), `pdf2pic` (already installed), `sharp` (already installed), `zod` (structured output)

**Design doc:** `docs/plans/2026-03-11-vision-product-ingestion-design.md`

---

### Task 1: Add GPT-5.4 constant

**Files:**
- Modify: `src/utils/constants.ts:1-3`

**Step 1: Add the constant**

Add after line 2 (`export const OPENAI_MODEL_GPT_4_1 = 'gpt-4.1';`):

```typescript
export const OPENAI_MODEL_GPT_5_4 = 'gpt-5.4';
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/utils/constants.ts
git commit -m "feat: add gpt-5.4 model constant for vision ingestion"
```

---

### Task 2: Create PDF vision extraction module

**Files:**
- Create: `src/jobs/products/extractPdfPages.ts`

**Step 1: Write the test**

Create `src/jobs/products/extractPdfPages.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';

// We'll test the helper functions, not the full pipeline (requires S3 + OpenAI)
describe('extractPdfPages', () => {
  it('should export extractPdfWithVision function', async () => {
    const mod = await import('./extractPdfPages.js');
    expect(mod.extractPdfWithVision).toBeDefined();
    expect(typeof mod.extractPdfWithVision).toBe('function');
  });

  it('should export VISION_BATCH_SIZE and VISION_CONCURRENCY constants', async () => {
    const mod = await import('./extractPdfPages.js');
    expect(mod.VISION_BATCH_SIZE).toBe(10);
    expect(mod.VISION_CONCURRENCY).toBe(10);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/jobs/products/extractPdfPages.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

Create `src/jobs/products/extractPdfPages.ts`:

```typescript
import { fromBuffer } from 'pdf2pic';
import sharp from 'sharp';
import OpenAI from 'openai';
import { OPENAI_MODEL_GPT_5_4 } from '../../utils/constants.js';

export const VISION_BATCH_SIZE = 10;
export const VISION_CONCURRENCY = 10;

interface PageContent {
  pageRange: string;
  extractedContent: string;
}

/**
 * Convert a PDF buffer to an array of base64-encoded PNG images.
 * Each image is resized to ~1500px width to optimize token usage.
 */
const pdfToImages = async (
  pdfBuffer: Buffer,
): Promise<{ page: number; base64: string }[]> => {
  const converter = fromBuffer(pdfBuffer, {
    density: 150,
    format: 'png',
    width: 1500,
    preserveAspectRatio: true,
  });

  // Get page count by attempting conversion of all pages
  // pdf2pic uses 1-based page indexing
  const results: { page: number; base64: string }[] = [];

  // Convert all pages — pdf2pic.bulk returns all pages
  const bulkResult = await converter.bulk(-1, { responseType: 'base64' });

  for (const result of bulkResult) {
    if (result.base64) {
      // Resize with sharp to ensure consistent width and reduce size
      const resizedBuffer = await sharp(Buffer.from(result.base64, 'base64'))
        .resize({ width: 1500, withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 6 })
        .toBuffer();

      results.push({
        page: result.page || results.length + 1,
        base64: resizedBuffer.toString('base64'),
      });
    }
  }

  return results;
};

/**
 * Send a batch of page images to gpt-5.4 vision and extract content.
 */
const extractBatchWithVision = async (
  openai: OpenAI,
  pages: { page: number; base64: string }[],
): Promise<string> => {
  const imageMessages: OpenAI.Chat.Completions.ChatCompletionContentPart[] =
    pages.map((p) => ({
      type: 'image_url' as const,
      image_url: {
        url: `data:image/png;base64,${p.base64}`,
        detail: 'high' as const,
      },
    }));

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL_GPT_5_4,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Extract ALL content from these product document pages (pages ${pages[0].page}-${pages[pages.length - 1].page}).

For each page:
1. Extract ALL visible text exactly as written
2. Describe ALL visual elements (charts, diagrams, tables, screenshots, infographics)
3. Extract data from tables preserving rows/columns
4. Note any pricing, percentages, statistics, or metrics shown visually
5. Describe the layout and what information each section conveys

Preserve ALL specific numbers, percentages, pricing details, brand names, and technical specifications.
Output the content in order, clearly indicating which page each section comes from.`,
          },
          ...imageMessages,
        ],
      },
    ],
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || '';
};

/**
 * Process a batch with concurrency limiting.
 */
const processBatchesWithConcurrency = async <T, R>(
  items: T[],
  batchSize: number,
  concurrency: number,
  processor: (batch: T[]) => Promise<R>,
): Promise<R[]> => {
  // Split items into batches
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  // Process batches with concurrency limit
  const results: R[] = [];
  for (let i = 0; i < batches.length; i += concurrency) {
    const concurrentBatches = batches.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      concurrentBatches.map((batch) => processor(batch)),
    );
    results.push(...batchResults);
  }

  return results;
};

/**
 * Extract content from a PDF using gpt-5.4 vision.
 * Converts pages to images and processes them in parallel batches.
 */
export const extractPdfWithVision = async (
  pdfBuffer: Buffer,
): Promise<PageContent[]> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Convert PDF to images
  console.log('[extractPdfWithVision] Converting PDF to images...');
  const pageImages = await pdfToImages(pdfBuffer);
  console.log(
    `[extractPdfWithVision] Converted ${pageImages.length} pages to images`,
  );

  // Process pages in parallel batches
  const results = await processBatchesWithConcurrency(
    pageImages,
    VISION_BATCH_SIZE,
    VISION_CONCURRENCY,
    async (batch) => {
      const startPage = batch[0].page;
      const endPage = batch[batch.length - 1].page;
      console.log(
        `[extractPdfWithVision] Processing pages ${startPage}-${endPage}...`,
      );

      const content = await extractBatchWithVision(openai, batch);

      return {
        pageRange: `${startPage}-${endPage}`,
        extractedContent: content,
      };
    },
  );

  console.log(
    `[extractPdfWithVision] Extracted content from ${results.length} batches`,
  );
  return results;
};
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/jobs/products/extractPdfPages.test.ts`
Expected: PASS

**Step 5: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/jobs/products/extractPdfPages.ts src/jobs/products/extractPdfPages.test.ts
git commit -m "feat: add PDF vision extraction module using gpt-5.4"
```

---

### Task 3: Create map-reduce summarization module

**Files:**
- Create: `src/jobs/products/mapReduceSummarize.ts`

**Step 1: Write the test**

Create `src/jobs/products/mapReduceSummarize.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { isGenericProductName } from './mapReduceSummarize.js';

describe('mapReduceSummarize', () => {
  describe('isGenericProductName', () => {
    it('should detect generic names', () => {
      expect(isGenericProductName('Test Product')).toBe(true);
      expect(isGenericProductName('New Product')).toBe(true);
      expect(isGenericProductName('Untitled')).toBe(true);
      expect(isGenericProductName('Product')).toBe(true);
      expect(isGenericProductName('')).toBe(true);
      expect(isGenericProductName('ab')).toBe(true);
      expect(isGenericProductName('test product')).toBe(true);
    });

    it('should not flag real product names', () => {
      expect(isGenericProductName('GrabFood')).toBe(false);
      expect(isGenericProductName('OneGrab Solution')).toBe(false);
      expect(isGenericProductName('Prudential Life Insurance')).toBe(false);
    });
  });

  it('should export mapReduceSummarize function', async () => {
    const mod = await import('./mapReduceSummarize.js');
    expect(mod.mapReduceSummarize).toBeDefined();
    expect(typeof mod.mapReduceSummarize).toBe('function');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/jobs/products/mapReduceSummarize.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

Create `src/jobs/products/mapReduceSummarize.ts`:

```typescript
import OpenAI from 'openai';
import { OPENAI_MODEL_GPT_5_4 } from '../../utils/constants.js';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';

const MAP_BATCH_CHAR_LIMIT = 12000;
const MAP_CONCURRENCY = 10;

// Zod schema for the final reduce output (same shape as existing extractedFields)
const reducedOutputSchema = z.object({
  name: z.string().nullable().optional(),
  friendlyId: z.string().nullable().optional(),
  productCategory: z.string().nullable().optional(),
  salesTarget: z.enum(['individual', 'corporate']).nullable().optional(),
  keyFeatures: z.array(z.string()).nullable().optional(),
  featureHighlight: z
    .object({
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  evaluationFocus: z.array(z.string()).nullable().optional(),
  callCriteria: z
    .object({
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      criteria: z.array(z.string()).nullable().optional(),
      markdown: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  suggestedModules: z.array(z.string()).nullable().optional(),
  localizations: z.record(z.string(), z.string()).nullable().optional(),
});

export type ReducedOutput = z.infer<typeof reducedOutputSchema>;

const GENERIC_NAMES = [
  'test product',
  'new product',
  'untitled',
  'product',
  'my product',
  'sample product',
  'demo product',
];

export const isGenericProductName = (name: string | undefined): boolean => {
  if (!name || name.trim().length < 3) return true;
  return GENERIC_NAMES.includes(name.trim().toLowerCase());
};

/**
 * Split extracted content into batches for the map phase.
 */
const splitIntoBatches = (
  contents: { pageRange: string; extractedContent: string }[],
): string[] => {
  const batches: string[] = [];
  let currentBatch = '';

  for (const content of contents) {
    const section = `\n--- Pages ${content.pageRange} ---\n${content.extractedContent}`;

    if (
      currentBatch.length + section.length > MAP_BATCH_CHAR_LIMIT &&
      currentBatch.length > 0
    ) {
      batches.push(currentBatch);
      currentBatch = section;
    } else {
      currentBatch += section;
    }
  }

  if (currentBatch.trim()) {
    batches.push(currentBatch);
  }

  return batches;
};

/**
 * Map phase: summarize a batch of content.
 */
const summarizeBatch = async (
  openai: OpenAI,
  batch: string,
  batchIndex: number,
): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL_GPT_5_4,
    messages: [
      {
        role: 'system',
        content: `You are a product analyst extracting comprehensive product information from a document section. Capture EVERYTHING relevant for a sales representative to understand and sell this product.`,
      },
      {
        role: 'user',
        content: `Summarize this section of a product document. Capture ALL of the following:

- Product and sub-product names
- Features and capabilities (with specific details)
- Pricing, commission rates, fees, costs
- Technical specifications and integrations
- Target audience and use cases
- Key metrics and statistics (downloads, users, conversion rates, etc.)
- Competitive advantages and unique selling points
- Partnerships, programs, and tiers
- Onboarding process and requirements

Preserve ALL specific numbers, percentages, and pricing. Do not generalize.

Document section:
${batch}`,
      },
    ],
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || '';
};

/**
 * Reduce phase: combine all batch summaries into structured output.
 */
const reduceToStructuredOutput = async (
  summaries: string[],
  userInput: { name?: string; friendlyId?: string },
): Promise<ReducedOutput> => {
  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_5_4,
    temperature: 0.2,
  });

  const combinedSummaries = summaries
    .map((s, i) => `--- Section ${i + 1} ---\n${s}`)
    .join('\n\n');

  const prompt = `You are creating a comprehensive product knowledge base for sales training. Synthesize these document summaries into a structured product profile.

IMPORTANT GUIDELINES FOR featureHighlight.description:
- Write a rich, detailed markdown description
- Start with an overview paragraph explaining what the product/solution is and its value proposition
- Then break down each sub-product or major feature as a bullet point with:
  - The sub-product name in bold (e.g. "**GrabFood**")
  - A detailed description including: what it does, key features, pricing/commission, key metrics, unique selling points
- Include ALL specific numbers: prices, percentages, user counts, conversion rates
- This description will be used by AI sales coaches to train sales reps — completeness is critical

IMPORTANT GUIDELINES FOR callCriteria:
- title: A descriptive title for the sales criteria section
- description: Brief overview of what reps need to know
- criteria: Array of specific, actionable criteria a sales rep should cover in a call
- markdown: Detailed markdown with objection handling, pricing justification, competitive positioning, and key talking points

Available modules for suggestedModules: competitive-proposal, objection-handling, closing, review-renewal, product-positioning, discovery, cold-call

User provided name: "${userInput.name || ''}"
User provided friendlyId: "${userInput.friendlyId || ''}"

Document summaries:
${combinedSummaries}`;

  const extracted = await model
    .withStructuredOutput(reducedOutputSchema)
    .invoke(prompt);

  // Apply user overrides (only if not generic)
  if (userInput.name && !isGenericProductName(userInput.name)) {
    extracted.name = userInput.name;
  }
  if (userInput.friendlyId) {
    extracted.friendlyId = userInput.friendlyId;
  }

  // Generate friendlyId from name if missing
  if (!extracted.friendlyId && extracted.name) {
    extracted.friendlyId = extracted.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  return extracted;
};

/**
 * Full map-reduce pipeline: takes extracted page content,
 * produces structured product fields.
 */
export const mapReduceSummarize = async (
  pageContents: { pageRange: string; extractedContent: string }[],
  userInput: { name?: string; friendlyId?: string },
): Promise<ReducedOutput> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Split into map batches
  const batches = splitIntoBatches(pageContents);
  console.log(
    `[mapReduceSummarize] Split content into ${batches.length} batches for map phase`,
  );

  // Map phase: parallel batch summarization
  const summaryPromises: Promise<string>[] = [];
  for (let i = 0; i < batches.length; i += MAP_CONCURRENCY) {
    const concurrentBatch = batches.slice(i, i + MAP_CONCURRENCY);
    const results = await Promise.all(
      concurrentBatch.map((batch, j) =>
        summarizeBatch(openai, batch, i + j),
      ),
    );
    summaryPromises.push(
      ...results.map((r) => Promise.resolve(r)),
    );
  }

  const summaries = await Promise.all(summaryPromises);
  console.log(
    `[mapReduceSummarize] Completed map phase: ${summaries.length} summaries`,
  );

  // Reduce phase: structured output
  console.log('[mapReduceSummarize] Starting reduce phase...');
  const result = await reduceToStructuredOutput(summaries, userInput);
  console.log(
    `[mapReduceSummarize] Reduce complete: product name = "${result.name}"`,
  );

  return result;
};
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/jobs/products/mapReduceSummarize.test.ts`
Expected: PASS

**Step 5: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/jobs/products/mapReduceSummarize.ts src/jobs/products/mapReduceSummarize.test.ts
git commit -m "feat: add map-reduce summarization module for product ingestion"
```

---

### Task 4: Refactor extractFields.ts to use vision + map-reduce pipeline

**Files:**
- Modify: `src/jobs/products/extractFields.ts:1-175` (extraction and LLM logic)

This is the main integration task. We replace the text extraction and single-LLM-call approach with the new pipeline while keeping the auto-publish, competitive intelligence, and embeddings logic unchanged.

**Step 1: Write the test**

Create `src/jobs/products/extractFields.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('extractFields pipeline', () => {
  it('should export extractFieldsJob', async () => {
    const mod = await import('./extractFields.js');
    expect(mod.extractFieldsJob).toBeDefined();
    expect(typeof mod.extractFieldsJob).toBe('function');
  });
});
```

**Step 2: Run test to verify it passes (module already exists)**

Run: `npm run test -- src/jobs/products/extractFields.test.ts`
Expected: PASS

**Step 3: Refactor extractFields.ts**

Replace the file content. Key changes:
1. Replace `extractTextFromFile` to route PDFs through vision pipeline
2. Replace `extractFieldsWithLLM` with map-reduce pipeline call
3. Add generic name detection
4. Keep all auto-publish, competitive intelligence, and embeddings logic as-is

The new flow in `extractFieldsJob`:

```typescript
// --- PHASE 1: EXTRACT CONTENT ---
// For each file in ingestion:
//   if PDF → extractPdfWithVision(buffer) → array of {pageRange, extractedContent}
//   if other → extractTextFromFile(buffer, mimeType) → single {pageRange: 'all', extractedContent}
// Combine all into pageContents array

// --- PHASE 2: MAP-REDUCE SUMMARIZE ---
// mapReduceSummarize(pageContents, userInput) → extractedFields

// --- PHASE 3: REST IS UNCHANGED ---
// processingMeta, auto-publish, competitive intelligence, embeddings
```

The full refactored file replaces lines 1-175 (everything up to and including `extractFieldsWithLLM`). The `extractFieldsJob` function body changes its extraction section but the auto-publish block (lines 281-560) stays identical.

Changes to `extractFieldsJob` specifically:
- Lines 199-233: Replace file loop to use `extractPdfWithVision` for PDFs
- Lines 236-237: Replace `extractFieldsWithLLM` call with `mapReduceSummarize`
- Lines 157-159: Name override now uses `isGenericProductName` check
- Remove: `MAX_TEXT_LENGTH`, `extractFieldsWithLLM`, `countTokens`, `extractedFieldsSchema` (moved to mapReduceSummarize.ts)
- Keep: `extractTextFromFile` for non-PDF files (still needed for DOCX/TXT/CSV)

**Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Run all product job tests**

Run: `npm run test -- src/jobs/products/`
Expected: All PASS

**Step 6: Format**

Run: `npm run format`

**Step 7: Commit**

```bash
git add src/jobs/products/extractFields.ts src/jobs/products/extractFields.test.ts
git commit -m "feat: integrate vision + map-reduce pipeline into extractFields job"
```

---

### Task 5: Manual integration test with Grab PDF

**Files:**
- None (testing only)

**Step 1: Start dev server**

Run: `npm run dev`
Expected: Server starts without errors

**Step 2: Test with a small PDF first**

Create a simple 2-page test PDF or use a small product document to verify the pipeline works end-to-end before testing with the full 103-page Grab deck.

**Step 3: Test with Grab Product Deck**

Upload `/Users/praze/Downloads/Grab Product Deck.pdf` through the self-serve product upload flow. Verify:
- [ ] Vision extraction processes all 103 pages
- [ ] Map-reduce produces rich structured output
- [ ] `featureHighlight.description` contains markdown with sub-product breakdowns
- [ ] `callCriteria.markdown` contains detailed sales criteria
- [ ] Product name is LLM-extracted (not "Test Product")
- [ ] Auto-publish creates SalesProduct successfully
- [ ] Embeddings are generated from the rich content

**Step 4: Compare output to expected result**

The output `featureHighlight.description` should resemble the "Expected Result" screenshot:
- Overall product overview paragraph
- Sub-product breakdowns (GrabFood, Dineout Deals, Scan to Order, Chope, etc.)
- Specific pricing, commission rates, metrics included

**Step 5: Commit any adjustments**

If prompt tuning or batch size adjustments are needed, commit those changes.

```bash
git add -A
git commit -m "fix: tune vision ingestion prompts based on integration testing"
```
