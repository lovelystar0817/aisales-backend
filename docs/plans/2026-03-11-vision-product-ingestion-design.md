# Vision-Based Product Ingestion Design

## Problem

The current product ingestion pipeline uses `officeparser` for text extraction from PDFs, which only extracts raw text and misses all visual content (charts, diagrams, screenshots, infographics). For image-heavy product decks (e.g. 103-page Grab Product Deck where many pages are graphics-only), this results in:

1. **Lost content** — image-only pages produce empty or near-empty text
2. **Flat summaries** — the LLM sees incomplete input and generates generic bullet lists instead of rich structured output
3. **8000 char truncation** — only a fraction of extracted text reaches the LLM

### Current vs Expected Output

**Current:** Generic "Test Product" with flat bullet list of features from the first few text-heavy pages.

**Expected:** Rich product overview ("OneGrab") with structured sub-product breakdowns (GrabFood, Dineout Deals, Scan to Order, Chope, Loans), each with detailed descriptions, pricing, and key metrics.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Vision LLM | `gpt-5.4` | User-specified |
| PDF handling | Vision pipeline (page images) | Only way to capture visual content |
| Non-PDF handling | Keep `officeparser` text extraction | DOCX/TXT/CSV are inherently text-based |
| Summarization strategy | Map-reduce with parallel batches | Full coverage without content loss, parallelizable |
| Product name | User-provided if meaningful, LLM-extracted if generic | Avoids "Test Product" while respecting intentional names |
| Rich output target | `featureHighlight.description` as rich markdown | No schema changes, works with existing downstream consumers |
| Call criteria | Also generate rich `callCriteria.markdown` | Already processing all pages, minimal extra cost |
| Schema changes | None | Existing fields support rich markdown, no migration needed |

## Architecture

### Pipeline Flow

```
PDF Upload → Page-by-page vision extraction (gpt-5.4, parallel)
                     ↓
Non-PDF Upload → Text extraction (officeparser, as-is)
                     ↓
         Combined extracted content
                     ↓
     Map phase (parallel): batch summaries
                     ↓
     Reduce phase: final structured output
                     ↓
     Rich product fields populated
                     ↓
     Auto-publish → SalesProduct (unchanged)
     Queue embeddings (unchanged)
```

### Phase 1: PDF Vision Extraction

**New file:** `src/jobs/products/extractPdfPages.ts`

- Convert each PDF page to a PNG image using `pdf2pic` (poppler-based)
- Resize images to ~1500px width via `sharp` to optimize token usage (~800 tokens/page vs 2000+ at full res)
- Send pages to `gpt-5.4` vision in parallel batches:
  - Batch size: 10 pages per request
  - Concurrency: 10 parallel requests
  - Prompt instructs: extract ALL text, describe ALL visual content (charts, diagrams, tables), preserve structure/numbers/pricing
- Returns array of `{ pageRange, extractedContent }`

### Phase 2: Map-Reduce Summarization

**New file:** `src/jobs/products/mapReduceSummarize.ts`

**Map (parallel):**
- Split extracted content into batches (~15-20 pages worth)
- Each batch → `gpt-5.4` call to summarize, capturing: product names, features, pricing, commission rates, technical details, partnerships, target audience, competitive advantages
- All batches run concurrently via `Promise.all()`

**Reduce (single call):**
- Concatenate all batch summaries
- Single `gpt-5.4` call with structured output to produce:
  - `name` — product name (used if user input is generic)
  - `featureHighlight.title` — main product/solution name
  - `featureHighlight.description` — rich markdown with overall overview paragraph, sub-product breakdowns, pricing/metrics
  - `callCriteria` — detailed sales-ready criteria with markdown
  - `keyFeatures[]`, `evaluationFocus[]`, `suggestedModules[]`

### Phase 3: Name Detection

Generic name patterns: "Test Product", "New Product", "Untitled", "Product", empty, or < 3 chars.

- If user-provided name matches generic → use LLM-extracted name
- Otherwise → keep user-provided name

### Integration

Replaces internals of existing `extractFieldsJob` in `src/jobs/products/extractFields.ts`. Same job name (`PRODUCT_EXTRACT_FIELDS`), same entry point. No API or model changes.

## Files

### Modified
- `src/jobs/products/extractFields.ts` — replace extraction + LLM logic with vision + map-reduce pipeline
- `src/utils/constants.ts` — add `OPENAI_MODEL_GPT_5_4 = 'gpt-5.4'`

### New
- `src/jobs/products/extractPdfPages.ts` — PDF page → image → vision extraction
- `src/jobs/products/mapReduceSummarize.ts` — map-reduce summarization pipeline

### Unchanged
- All API endpoints (routes)
- `ProductIngestion` model
- `SalesProduct` model
- `generateEmbeddings.ts`
- `generateCompetitiveIntelligence.ts`
- Frontend

## Dependencies

### New
- `pdf2pic` — PDF page to PNG conversion (uses poppler)

### Existing (already installed)
- `openai` — for `gpt-5.4` vision API calls
- `sharp` — for image resizing (check if installed, may need to add)

## Performance

For a 103-page PDF:
- ~10 parallel vision calls (10 pages each) → concurrent
- ~10 parallel map calls → concurrent
- 1 reduce call → sequential

**Wall-clock time:** ~3 sequential LLM round-trips (~30-60 seconds)
**Cost:** ~$1-3 per ingestion (vs ~$0.01 current)
