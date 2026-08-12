/**
 * Default competitive intelligence configuration
 * Reorganized for better maintainability
 */

import { buildCIConfiguration } from '../../helpers.js';
import { proAchieverCompetitor } from './competitors.js';

export const defaultCompetitiveIntelligenceConfiguration = buildCIConfiguration(
  {
    id: 'default',
    company: 'default',
    targetMarket: 'general',
  },
  [proAchieverCompetitor],
);
