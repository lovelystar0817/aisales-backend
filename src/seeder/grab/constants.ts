// Pre-generated nanoid suffixes for stable friendlyId generation
// These are deterministic to avoid changing on every seeder run
// Different suffixes per company to avoid duplicate key errors

export const PRODUCT_FRIENDLY_ID_SUFFIXES: Record<
  'grab' | 'grab-test',
  Record<string, string>
> = {
  'grab-test': {
    'grab-for-business': 'Xk9mZp',
    'grab-mex-campaigns': 'Qw3nLr',
  },
  grab: {
    'grab-for-business': 'P7Zm3K',
    'grab-mex-campaigns': 'N2Vx8R',
  },
};

// Maps each product to its valid modules (from src/products/grab.ts)
export const PRODUCT_MODULE_MAPPING: Record<string, string[]> = {
  'grab-for-business': ['discovery-call-meddpicc', 'deal-closure'],
  'grab-mex-campaigns': ['grab-mex'],
};
