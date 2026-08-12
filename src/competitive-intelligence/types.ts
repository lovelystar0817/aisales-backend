// Competitive Intelligence localization types (similar to frameworks and products)

export interface Competitor {
  name: string;
  company: string;
  type: string;
  keyFeatures: string[];
  strengths: string[];
  limitations: string[];
  positioningStrategy: string;
}

export interface CompetitiveIntelligence {
  competitors: Competitor[];
}

// Base configuration for competitive intelligence (non-localized fields)
export interface CompetitiveIntelligenceBase {
  id: string;
  company: string; // Company ID this CI is for
  targetMarket?: string; // Optional market focus
  productId?: string; // Optional product ID for product-specific CI
  moduleId?: string; // Optional module ID for module-specific CI
}

// Localized competitive intelligence data
export interface LocalizedCompetitiveIntelligenceData
  extends CompetitiveIntelligence {
  // Extends the base CompetitiveIntelligence interface
}

// Configuration structure with co-located translations
export interface CompetitiveIntelligenceConfiguration {
  base: CompetitiveIntelligenceBase;
  localized: {
    [languageCode: string]: LocalizedCompetitiveIntelligenceData;
  };
}

// Product-specific CI configuration for companies with multiple products
export interface ProductCompetitiveIntelligenceConfiguration {
  base: {
    id: string;
    company: string;
    targetMarket?: string;
  };
  products: {
    [productId: string]: CompetitiveIntelligenceConfiguration;
  };
}
