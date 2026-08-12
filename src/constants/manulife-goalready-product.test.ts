import { describe, it, expect } from 'vitest';
import { getGoalReadyProductInfoForPrompt } from './manulife-goalready-product.js';

describe('getGoalReadyProductInfoForPrompt', () => {
  it('should return formatted product reference string', () => {
    const result = getGoalReadyProductInfoForPrompt();

    expect(result).toContain('[GOALREADY PRODUCT REFERENCE');
    expect(result).toContain('GoalReady');
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(1000); // Substantial content
  });

  it('should include critical product details', () => {
    const result = getGoalReadyProductInfoForPrompt();

    // Check for key sections
    expect(result).toContain('PREMIUM STRUCTURE');
    expect(result).toContain('LOYALTY BONUS');
    expect(result).toContain('BENEFITS BY CATEGORY');
    expect(result).toContain('COMMON MISCONCEPTIONS');

    // Check for specific values
    expect(result).toContain('PHP 60,000'); // 5-Pay minimum
    expect(result).toContain('PHP 24,000'); // Pay-to-Goal minimum
    expect(result).toContain('1.75%'); // Loyalty bonus
    expect(result).toContain('5x to 60x'); // Face amount multipliers
  });

  it('should include categorization guidelines', () => {
    const result = getGoalReadyProductInfoForPrompt();

    expect(result).toContain('CORRECT');
    expect(result).toContain('WARNING');
    expect(result).toContain('INCORRECT');
    expect(result).toContain('ASSESSMENT GUIDELINES');
  });
});
