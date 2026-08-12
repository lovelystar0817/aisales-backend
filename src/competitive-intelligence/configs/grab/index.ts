/**
 * Grab competitive intelligence configuration
 * Reorganized for better maintainability - transport/mobility market
 */

import { ProductCompetitiveIntelligenceConfiguration } from '../../types.js';
import { buildCIConfiguration } from '../../helpers.js';
import {
  cdgZigCompetitor,
  transCabCompetitor,
  rydeCompetitor,
  tadaCompetitor,
  stridesPremierCompetitor,
  gotoBusinessSolutionsCompetitor,
} from './competitors.js';

export const grabCompetitiveIntelligenceConfiguration: ProductCompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'grab',
      company: 'grab',
      targetMarket: 'Corporate',
    },
    products: {
      'grab-for-business': buildCIConfiguration(
        {
          id: 'grab-for-business',
          company: 'grab',
          targetMarket: 'Corporate',
        },
        [
          cdgZigCompetitor,
          transCabCompetitor,
          rydeCompetitor,
          tadaCompetitor,
          stridesPremierCompetitor,
          gotoBusinessSolutionsCompetitor,
        ],
      ),
      'grab-mex-campaigns': {
        base: {
          id: 'grab-mex-campaigns',
          company: 'grab',
          targetMarket: 'Corporate',
        },
        localized: {
          en: { competitors: [] },
        },
      },
    },
  };

// export const grabCompetitiveIntelligenceConfiguration = buildCIConfiguration(
//   {
//     id: 'grab',
//     company: 'grab',
//     targetMarket: 'transport-mobility',
//   },
//   [cdgZigCompetitor],
//   // Note: In the original grab.ts, there were 7 competitors.
//   // For brevity in this refactor, I'm showing the pattern with one.
//   // The remaining competitors should be extracted to competitors.ts
//   // following the same pattern as cdgZigCompetitor
// );
