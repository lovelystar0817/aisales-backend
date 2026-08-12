import { SalesProductDocument } from '../models/SalesProduct.js';

/**
 * Converts a product document to markdown format
 * Format: Product name heading -> Key features list -> Feature highlight blockquote
 *
 * @param product - The product document to convert
 * @returns Markdown formatted string
 */
export function convertProductToMarkdown(product: {
  name: string;
  keyFeatures?: string[];
  featureHighlight?: {
    title: string;
    description: string;
  };
}): string {
  let markdown = `## ${product.name}\n\n`;

  // Add key features as bullet list
  if (product.keyFeatures && product.keyFeatures.length > 0) {
    markdown += product.keyFeatures.map((feature) => `- ${feature}`).join('\n');
    markdown += '\n\n';
  }

  // Add feature highlight as blockquote
  if (product.featureHighlight) {
    markdown += `> **${product.featureHighlight.title}**\n>\n> ${product.featureHighlight.description}\n`;
  }

  return markdown;
}

/**
 * Generates markdown field for all products that have structured data
 * This can be used to auto-generate markdown for existing products
 *
 * @param products - Array of product documents
 * @returns Products with markdown field added
 */
export function generateProductMarkdown<T extends SalesProductDocument>(
  products: T[],
): T[] {
  return products.map((product) => {
    // Only generate if markdown doesn't exist and we have the necessary fields
    if (
      !product.markdown &&
      (product.keyFeatures || product.featureHighlight)
    ) {
      return {
        ...product,
        markdown: convertProductToMarkdown(product),
      };
    }
    return product;
  });
}
