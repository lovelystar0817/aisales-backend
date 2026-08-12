export interface ProcessStep {
  title: string;
  items: ProcessItem[];
  markdown?: string; // Markdown formatted content (takes precedence over items if provided)
}

export interface ProcessItem {
  title: string;
  description?: string;
  subItems?: string[];
}

export interface ProcessReference {
  title: string;
  description?: string;
  steps: ProcessStep[];
}

// Base configuration for process reference (non-localized fields)
export interface ProcessReferenceBase {
  id: string;
  company: string; // Company ID this process reference is for
  moduleId?: string; // Optional module ID for module-specific processes
  productId?: string; // Optional product ID for product-specific processes
}

// Localized process reference data
export interface LocalizedProcessReferenceData extends ProcessReference {}

// Configuration structure with co-located translations
export interface ProcessReferenceConfiguration {
  base: ProcessReferenceBase;
  localized: {
    [languageCode: string]: LocalizedProcessReferenceData;
  };
}

// Module-specific process reference configuration for companies with multiple modules
export interface ModuleProcessReferenceConfiguration {
  base: {
    id: string;
    company: string;
  };
  modules: {
    [moduleId: string]: ProcessReferenceConfiguration;
  };
}
