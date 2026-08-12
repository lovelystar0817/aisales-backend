// Product localization types (similar to frameworks and personas)

export type LocalizedProduct = {
  name: string;
  keyFeatures: string[];
  featureHighlight?: {
    title: string;
    description: string;
  };
  evaluationFocus: string[];
  callCriteria?: {
    title: string;
    description: string;
    criteria: string[];
    markdown?: string;
  };
  markdown?: string; // Markdown formatted product information
};

/**
 * Product configuration with base metadata and localized content
 */
export type ProductConfiguration = {
  base: {
    id: string;
    friendlyId: string;
    category: 'insurance' | 'transport' | 'business-services' | 'all';
    // Any other non-localizable properties
  };
  localized: {
    en: LocalizedProduct;
    id?: LocalizedProduct;
    ms?: LocalizedProduct;
    tl?: LocalizedProduct;
    vi?: LocalizedProduct;
    th?: LocalizedProduct;
    ceb?: LocalizedProduct;
    cmn?: LocalizedProduct;
    [key: string]: LocalizedProduct | undefined;
  };
};

export type LocalizedProductData = {
  id: string;
  friendlyId: string;
  category: string;
  name: string;
  keyFeatures: string[];
  featureHighlight?: {
    title: string;
    description: string;
  };
  evaluationFocus: string[];
  callCriteria?: {
    title: string;
    description: string;
    criteria: string[];
  };
  markdown?: string; // Markdown formatted product information
};
