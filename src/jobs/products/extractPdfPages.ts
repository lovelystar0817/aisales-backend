import {
  createCanvas,
  Path2D as CanvasPath2D,
  ImageData as CanvasImageData,
} from '@napi-rs/canvas';
import DOMMatrixPolyfill from '@thednp/dommatrix';
import { getDocument, type PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import OpenAI from 'openai';
import { OPENAI_MODEL_GPT_5_4 } from '../../utils/constants.js';

// pdfjs-dist rendering requires browser globals — provide real implementations
// from @napi-rs/canvas instead of the stubs in pdfjs-polyfills.ts
if (typeof globalThis.Path2D === 'undefined' || !(globalThis.Path2D as any).prototype?.moveTo) {
  (globalThis as any).Path2D = CanvasPath2D;
}
if (typeof globalThis.ImageData === 'undefined' || !(globalThis.ImageData as any).prototype) {
  (globalThis as any).ImageData = CanvasImageData;
}
if (typeof globalThis.DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
}

export const VISION_BATCH_SIZE = 10;
export const VISION_CONCURRENCY = 3;

export interface PageContent {
  pageRange: string;
  extractedContent: string;
}

interface PageImage {
  page: number;
  base64: string;
}

/**
 * Render a single PDF page to a PNG buffer using pdfjs-dist + @napi-rs/canvas.
 * Scale targets ~1500px width for optimal vision API token usage.
 */
async function renderPageToPng(page: PDFPageProxy): Promise<Buffer> {
  const targetWidth = 1500;
  const unscaledViewport = page.getViewport({ scale: 1.0 });
  const scale = targetWidth / unscaledViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(
    Math.floor(viewport.width),
    Math.floor(viewport.height),
  );
  const context = canvas.getContext('2d');

  await page.render({
    canvas: canvas as any,
    canvasContext: context as any,
    viewport,
  }).promise;

  return canvas.toBuffer('image/png');
}

/**
 * Converts a PDF buffer into an array of base64-encoded page images.
 * Uses pdfjs-dist for rendering + @napi-rs/canvas as the canvas backend.
 * Pure Node.js — no system dependencies required.
 */
export async function pdfToImages(pdfBuffer: Buffer): Promise<PageImage[]> {
  const uint8 = new Uint8Array(pdfBuffer);
  const pdf = await getDocument({ data: uint8, useSystemFonts: true }).promise;
  const totalPages = pdf.numPages;

  console.log(`[pdfToImages] PDF has ${totalPages} pages, rendering...`);

  const pageImages: PageImage[] = [];

  for (let i = 1; i <= totalPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const pngBuffer = await renderPageToPng(page);

      if (pngBuffer.length === 0) {
        console.warn(`[pdfToImages] Page ${i} rendered as empty, skipping`);
        continue;
      }

      pageImages.push({
        page: i,
        base64: pngBuffer.toString('base64'),
      });
    } catch (err) {
      console.warn(
        `[pdfToImages] Failed to render page ${i}: ${(err as Error).message}`,
      );
    }
  }

  console.log(
    `[pdfToImages] Rendered ${pageImages.length}/${totalPages} pages successfully`,
  );
  return pageImages;
}

const VISION_SYSTEM_PROMPT = `You are a document content extraction specialist. Your job is to extract ALL content from the provided document page images with maximum fidelity.

Instructions:
- Extract ALL visible text exactly as written, preserving formatting and structure
- Describe ALL visual elements including charts, diagrams, tables, screenshots, logos, and images
- For tables: extract data preserving rows and columns using markdown table format
- Note ALL pricing, percentages, statistics, and numerical data shown visually
- Preserve ALL specific numbers, brand names, product names, technical specifications, and proper nouns exactly as they appear
- For charts and graphs: describe the type of chart, axes labels, data points, trends, and any legends
- For diagrams: describe the structure, connections, labels, and flow
- Maintain the reading order of the document (top to bottom, left to right)
- Use markdown formatting for structure (headers, lists, tables, etc.)
- Do NOT summarize or interpret - extract content as faithfully as possible`;

/**
 * Sends a batch of page images to gpt-5.4 vision for content extraction.
 */
export async function extractBatchWithVision(
  openai: OpenAI,
  pages: PageImage[],
): Promise<string> {
  const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] =
    pages.map((page) => ({
      type: 'image_url' as const,
      image_url: {
        url: `data:image/png;base64,${page.base64}`,
        detail: 'high' as const,
      },
    }));

  const pageRangeLabel =
    pages.length === 1
      ? `page ${pages[0].page}`
      : `pages ${pages[0].page}-${pages[pages.length - 1].page}`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL_GPT_5_4,
    messages: [
      {
        role: 'system',
        content: VISION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Extract ALL content from the following document ${pageRangeLabel}. Be thorough and precise.`,
          },
          ...imageContent,
        ],
      },
    ],
  });

  const choice = response.choices[0];
  if (choice?.finish_reason === 'length') {
    console.warn(`[extractBatchWithVision] Response truncated for ${pageRangeLabel}`);
  }
  return choice?.message?.content || '';
}

/**
 * Generic concurrency limiter that processes items in batches with a maximum
 * number of concurrent batch operations.
 */
export async function processBatchesWithConcurrency<T, R>(
  items: T[],
  batchSize: number,
  concurrency: number,
  processor: (batch: T[]) => Promise<R>,
): Promise<R[]> {
  // Split items into batches
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  const results: R[] = new Array(batches.length);
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    while (nextIndex < batches.length) {
      const currentIndex = nextIndex;
      nextIndex++;
      results[currentIndex] = await processor(batches[currentIndex]);
    }
  }

  // Start up to `concurrency` workers
  const workers = Array.from(
    { length: Math.min(concurrency, batches.length) },
    () => runNext(),
  );

  await Promise.all(workers);

  return results;
}

/**
 * Main exported function: extracts content from a PDF by converting pages to images
 * and processing them through gpt-5.4 vision in concurrent batches.
 *
 * Returns an array of PageContent objects, each containing a page range string
 * and the extracted content for those pages.
 */
export async function extractPdfWithVision(
  pdfBuffer: Buffer,
): Promise<PageContent[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  const openai = new OpenAI({ apiKey });

  // Convert PDF pages to images
  const pageImages = await pdfToImages(pdfBuffer);

  if (pageImages.length === 0) {
    return [];
  }

  // Process page images in batches with concurrency
  const results = await processBatchesWithConcurrency(
    pageImages,
    VISION_BATCH_SIZE,
    VISION_CONCURRENCY,
    async (batch) => {
      const extractedContent = await extractBatchWithVision(openai, batch);

      const pageRange =
        batch.length === 1
          ? `${batch[0].page}`
          : `${batch[0].page}-${batch[batch.length - 1].page}`;

      return {
        pageRange,
        extractedContent,
      } satisfies PageContent;
    },
  );

  return results;
}
