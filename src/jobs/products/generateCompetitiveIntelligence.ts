import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { CompetitorProductData } from '../../models/SalesProductCompetitor.js';
import { DEFAULT_OPENAI_MODEL } from '../../utils/constants.js';

interface GenerateCompetitiveIntelligenceParams {
  productName: string;
  productFeatures: string[];
  productDescription?: string;
  productType?: string;
  languageCode?: string;
}

/**
 * Generate competitive intelligence using OpenAI's Responses API with web search
 */
export async function generateCompetitiveIntelligence({
  productName,
  productFeatures,
  productDescription,
  productType,
  languageCode = 'en',
}: GenerateCompetitiveIntelligenceParams): Promise<CompetitorProductData[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build prompt for competitive intelligence generation
  const prompt = `You are a competitive intelligence analyst. Research and analyze competitor products for the following product:

Product Name: ${productName}
${productType ? `Product Type: ${productType}` : ''}
${productDescription ? `Description: ${productDescription}` : ''}

Key Features:
${productFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

IMPORTANT: Your task is to identify DIRECT COMPETITORS - products that compete for the same primary use case and buyer persona.

Step 1: Analyze the product to understand its PRIMARY use case, market category, and core value proposition.
- What is the main problem this product solves?
- What is the primary industry/category (e.g., transportation, expense management, CRM, etc.)?
- Who is the target buyer/user?

Step 2: Search the web for products that:
- Serve the SAME primary use case and market category
- Target the SAME buyer persona  
- Are direct substitutes (customers would evaluate these products side-by-side)

Step 3: AVOID products that only share secondary features or capabilities. For example:
- If this is primarily a "ride-hailing platform", don't match to generic "expense management" tools
- If this is primarily a "CRM", don't match to generic "email marketing" tools
- Focus on functional competitors, not just feature overlap

For each competitor product you find, provide:

1. Product name
2. Company name  
3. Product type/category
4. Key features (3-5 main features)
5. Strengths (3-5 competitive advantages)
6. Limitations (3-5 weaknesses or areas where our product may be superior)
7. Positioning strategy (how to position our product against this competitor)

Return the results as a JSON array of competitor objects with this exact structure:
[
  {
    "name": "Competitor Product Name",
    "company": "Company Name",
    "type": "Product Type/Category",
    "keyFeatures": ["feature1", "feature2", "feature3"],
    "strengths": ["strength1", "strength2", "strength3"],
    "limitations": ["limitation1", "limitation2", "limitation3"],
    "positioningStrategy": "How to position our product against this competitor"
  }
]

Find 2-4 main DIRECT competitors. Prioritize products that compete on the primary function over products that merely share some features.`;

  // Define JSON schema for structured output
  const CompetitorsResultSchema = z.object({
    items: z.array(
      z.object({
        name: z.string(),
        company: z.string(),
        type: z.string(),
        keyFeatures: z.array(z.string()),
        strengths: z.array(z.string()),
        limitations: z.array(z.string()),
        positioningStrategy: z.string(),
      }),
    ),
  });

  try {
    // Use the Responses API with web search
    const response = await openai.responses.parse({
      model: DEFAULT_OPENAI_MODEL,
      input: prompt,
      tools: [{ type: 'web_search_preview' }],
      temperature: 0.2,
      text: {
        format: zodTextFormat(CompetitorsResultSchema, 'competitors'),
      },
    });

    return response.output_parsed?.items ?? [];
  } catch (error) {
    console.error('Error generating competitive intelligence:', error);
    throw error;
  }
}
