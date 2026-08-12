import OpenAI from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { OPENAI_MODEL_GPT_5_4 } from '../../utils/constants.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const MAP_BATCH_CHAR_LIMIT = 12000;
export const MAP_CONCURRENCY = 10;

// ---------------------------------------------------------------------------
// Generic-name detection
// ---------------------------------------------------------------------------
const GENERIC_NAMES = [
  'test product',
  'new product',
  'untitled',
  'product',
  'my product',
  'sample product',
  'demo product',
];

export function isGenericProductName(name: string | null | undefined): boolean {
  if (!name || name.trim().length < 3) return true;
  return GENERIC_NAMES.includes(name.trim().toLowerCase());
}

// ---------------------------------------------------------------------------
// Zod schema – mirrors extractedFieldsSchema in extractFields.ts
// ---------------------------------------------------------------------------
export const reducedOutputSchema = z.object({
  name: z
    .string()
    .describe('The main product/solution/brand name — the umbrella name, not a sub-product')
    .nullable()
    .optional(),
  friendlyId: z
    .string()
    .describe('Kebab-case slug derived from the name (e.g. "onegrab-solution")')
    .nullable()
    .optional(),
  productCategory: z
    .string()
    .describe('Concise market category (e.g. "Corporate Transportation Platform", "Life Insurance")')
    .nullable()
    .optional(),
  salesTarget: z
    .enum(['individual', 'corporate'])
    .describe('"individual" for B2C, "corporate" for B2B')
    .nullable()
    .optional(),
  keyFeatures: z
    .array(
      z
        .string()
        .describe(
          'A rich sub-product or feature breakdown. Format: "**Feature/Sub-product Name** — detailed description with specific metrics, pricing, commission rates, settlement terms, target audiences (2-4 sentences). Example: "GrabFood — Grab\'s #1 food delivery platform in SEA with 219M app downloads, connecting merchants to millions of customers for delivery and self pick-up at 30% commission with T+1 settlement. Includes self-serve ads, spotlight campaigns, and an exclusive Grab Signatures tier (28% commission)..."',
        ),
    )
    .describe(
      'The main sub-products or feature pillars of the product. Each entry is a DETAILED paragraph (2-4 sentences) with the sub-product name followed by a dash and rich description including specific metrics, pricing, and data. NOT generic bullet points.',
    )
    .nullable()
    .optional(),
  featureHighlight: z
    .object({
      title: z
        .string()
        .describe('The solution/product name used as the overview title (e.g. "OneGrab Solution")')
        .nullable()
        .optional(),
      description: z
        .string()
        .describe(
          'A concise overview paragraph (2-4 sentences) describing what the product/solution is, its value proposition, and how its sub-products work together. Do NOT list sub-products here — those go in keyFeatures.',
        )
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  evaluationFocus: z
    .array(z.string().describe('An area a sales rep should focus on when assessing their pitch'))
    .describe('3-6 areas for sales pitch assessment')
    .nullable()
    .optional(),
  callCriteria: z
    .object({
      title: z
        .string()
        .describe('e.g. "Sales Call Evaluation Criteria"')
        .nullable()
        .optional(),
      description: z
        .string()
        .describe('A brief paragraph explaining what makes a successful sales call for this product')
        .nullable()
        .optional(),
      criteria: z
        .array(z.string().describe('A specific evaluation criterion'))
        .describe('5-10 specific evaluation criteria covering product knowledge, objection handling, pricing justification, discovery quality')
        .nullable()
        .optional(),
      markdown: z
        .string()
        .describe(
          'RICH MARKDOWN (500+ words). Must include sections: ## Opening and Rapport, ## Needs Discovery (with product-specific discovery questions), ## Product Presentation (with key talking points and metrics), ## Objection Handling (with specific objections and recommended responses), ## Pricing Discussion and Justification (with ROI frameworks and specific numbers), ## Closing Techniques. Include product-specific examples throughout.',
        )
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  suggestedModules: z
    .array(z.string())
    .describe('Select ALL relevant from: competitive-proposal, objection-handling, closing, review-renewal, product-positioning, discovery, cold-call')
    .nullable()
    .optional(),
  localizations: z
    .record(z.string(), z.string())
    .describe('Language codes to localized product names if non-English names found (e.g. {"th": "โซลูชัน OneGrab"})')
    .nullable()
    .optional(),
});

export type ReducedOutput = z.infer<typeof reducedOutputSchema>;

// ---------------------------------------------------------------------------
// Batch splitting (MAP phase input)
// ---------------------------------------------------------------------------
export function splitIntoBatches(contents: string[]): string[][] {
  const batches: string[][] = [];
  let currentBatch: string[] = [];
  let currentLen = 0;

  for (const page of contents) {
    if (
      currentLen + page.length > MAP_BATCH_CHAR_LIMIT &&
      currentBatch.length > 0
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentLen = 0;
    }
    currentBatch.push(page);
    currentLen += page.length;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

// ---------------------------------------------------------------------------
// MAP phase – summarise a single batch
// ---------------------------------------------------------------------------
export async function summarizeBatch(
  openai: OpenAI,
  batch: string[],
  batchIndex: number,
): Promise<string> {
  const batchText = batch.join('\n\n---\n\n');

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL_GPT_5_4,
    messages: [
      {
        role: 'system',
        content: `You are a meticulous product analyst. Summarise the following document pages into a structured, information-dense summary. Your summary MUST capture:

1. Product names (including sub-products and brand names)
2. Features and benefits — be specific, not generic
3. Pricing, fees, and commission rates — preserve ALL specific numbers
4. Technical specifications (settlement windows, API endpoints, integration methods)
5. Target audience and ideal customer profiles
6. Competitive advantages and unique selling propositions
7. Partnerships, certifications, and ecosystem integrations
8. Onboarding flow, requirements, and timelines

IMPORTANT: Preserve ALL specific numbers, percentages, monetary values, and metrics exactly as stated. Do NOT round, estimate, or generalise numerical data.

Output a clear, well-organised summary in plain text. Use bullet points for structured data.`,
      },
      {
        role: 'user',
        content: `Batch ${batchIndex + 1} — summarise these pages:\n\n${batchText}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`OpenAI returned empty response for batch ${batchIndex + 1}`);
  }
  return content;
}

// ---------------------------------------------------------------------------
// REDUCE phase – merge summaries into structured output
// ---------------------------------------------------------------------------
export async function reduceToStructuredOutput(
  summaries: string[],
  userInput: { name?: string; friendlyId?: string; [key: string]: unknown },
): Promise<ReducedOutput> {
  const combinedSummaries = summaries
    .map((s, i) => `--- Summary ${i + 1} ---\n${s}`)
    .join('\n\n');

  const nameOverride =
    userInput.name && !isGenericProductName(userInput.name)
      ? userInput.name
      : null;

  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_5_4,
    temperature: 0.3,
  });

  const prompt = `You are an expert product analyst creating a comprehensive product profile from extracted document summaries.

${nameOverride ? `The user has specified the product name: "${nameOverride}". Use this as the product name.` : 'Determine the best product name from the summaries — look for the main brand/solution name mentioned most prominently.'}
${userInput.friendlyId ? `Use friendlyId: "${userInput.friendlyId}"` : 'Generate a friendlyId (kebab-case slug) from the product name.'}

SUMMARIES:
${combinedSummaries}

INSTRUCTIONS — follow these precisely:

1. **name**: The product or solution name. ${nameOverride ? `Use "${nameOverride}".` : 'Pick the most prominent umbrella brand/solution name from the summaries — not a sub-product.'}

2. **friendlyId**: A kebab-case slug derived from the name (e.g. "onegrab-solution"). ${userInput.friendlyId ? `Use "${userInput.friendlyId}".` : ''}

3. **productCategory**: A concise category describing the product's primary market/industry (e.g. "Corporate Transportation Platform", "Expense Management Software", "Life Insurance").

4. **salesTarget**: "individual" if sold to end consumers, "corporate" if sold B2B.

5. **keyFeatures**: THIS IS THE MOST IMPORTANT FIELD. Each entry is a DETAILED sub-product or feature breakdown (2-4 sentences), NOT a short bullet point. Format each as:
   \`Sub-product Name — rich description with specific metrics, pricing, commission rates, settlement terms, and data from the summaries.\`
   Examples:
   - \`GrabFood — Grab's #1 food delivery platform in SEA with 219M app downloads, connecting merchants to millions of customers for delivery and self pick-up at 30% commission with T+1 settlement. Includes self-serve ads, spotlight campaigns, and an exclusive Grab Signatures tier (28% commission) for brands committing to a 2-year sole delivery partnership, driving 15–60% sales uplift.\`
   - \`Dineout Deals — Drives foot traffic to physical restaurants by channelling 500K+ monthly browsers with frictionless discounts applied automatically at payment. Merchants pay a 6% commission with no upfront costs, choose from multiple deal formats, and benefit from Grab's 5% co-funding for the first 3 months.\`
   Group related sub-features under their parent sub-product rather than listing every minor feature separately. Aim for 4-8 entries covering the main pillars.

6. **featureHighlight**:
   - **title**: The solution/product name (e.g. "OneGrab Solution").
   - **description**: A concise overview paragraph (2-4 sentences) describing what the product/solution is, its value proposition, and how the sub-products work together as an ecosystem. Do NOT repeat the sub-product breakdowns here — those belong in keyFeatures.

7. **evaluationFocus**: 3-6 areas a sales rep should focus on when assessing their pitch (e.g. "product knowledge accuracy", "handling pricing objections", "needs discovery depth").

8. **callCriteria**:
   - **title**: e.g. "Sales Call Evaluation Criteria"
   - **description**: A brief paragraph explaining what makes a successful sales call for this product.
   - **criteria**: 5-10 specific evaluation criteria. Include product knowledge verification points, objection handling scenarios, pricing justification, discovery quality.
   - **markdown**: RICH, DETAILED markdown (500+ words minimum) with sections:
     * ## Opening and Rapport
     * ## Needs Discovery (with product-specific discovery questions)
     * ## Product Presentation (with key talking points and metrics)
     * ## Objection Handling (with specific objections and recommended responses)
     * ## Pricing Discussion and Justification (with ROI frameworks and specific numbers)
     * ## Closing Techniques

9. **suggestedModules**: Select ALL relevant modules from: competitive-proposal, objection-handling, closing, review-renewal, product-positioning, discovery, cold-call. Most products benefit from at least 4-5 modules.

10. **localizations**: A record of language codes to localised product names if any non-English names are found in the summaries (e.g. {"th": "โซลูชัน OneGrab"}).

Be EXHAUSTIVE and specific. Use ALL real numbers from the summaries. Never invent data. Never write generic placeholder text.`;

  const result = await model
    .withStructuredOutput(reducedOutputSchema)
    .invoke(prompt);

  return result;
}

// ---------------------------------------------------------------------------
// Concurrency helper
// ---------------------------------------------------------------------------
async function runWithConcurrency<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const idx = nextIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------
export async function mapReduceSummarize(
  pageContents: string[],
  userInput: { name?: string; friendlyId?: string; [key: string]: unknown },
): Promise<ReducedOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({ apiKey });

  // Split into batches
  const batches = splitIntoBatches(pageContents);

  console.log(
    `[mapReduceSummarize] Processing ${pageContents.length} pages in ${batches.length} batches (concurrency=${MAP_CONCURRENCY})`,
  );

  // MAP phase with concurrency control
  const summaries = await runWithConcurrency(
    batches,
    (batch, idx) => summarizeBatch(openai, batch, idx),
    MAP_CONCURRENCY,
  );

  // Filter out empty summaries
  const validSummaries = summaries.filter((s: string) => s.trim().length > 0);

  if (validSummaries.length === 0) {
    console.warn('[mapReduceSummarize] All batch summaries were empty');
    return {
      name: userInput.name ?? null,
      friendlyId: userInput.friendlyId ?? null,
    };
  }

  console.log(
    `[mapReduceSummarize] MAP complete — ${validSummaries.length}/${batches.length} non-empty summaries`,
  );

  // REDUCE phase
  const result = await reduceToStructuredOutput(validSummaries, userInput);

  console.log(
    `[mapReduceSummarize] REDUCE complete — product: ${result.name ?? '(unnamed)'}`,
  );

  return result;
}
