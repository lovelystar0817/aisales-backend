import { describe, it, expect } from 'vitest';
import { getLocalizedProduct } from './common.js';

describe('Manulife GoalReady Localization', () => {
  const productId = 'manulife-goalready';

  describe('English (en)', () => {
    it('should return English localization', () => {
      const result = getLocalizedProduct(productId, 'en');

      expect(result).toBeTruthy();
      expect(result?.name).toBe('GoalReady');
      expect(result?.id).toBe('manulife-goalready');
      expect(result?.category).toBe('insurance');
    });

    it('should have all required English fields', () => {
      const result = getLocalizedProduct(productId, 'en');

      expect(result?.keyFeatures).toBeDefined();
      expect(result?.keyFeatures.length).toBeGreaterThan(0);
      expect(result?.featureHighlight).toBeDefined();
      expect(result?.featureHighlight?.title).toContain(
        'Goal-based wealth accumulation',
      );
      expect(result?.evaluationFocus).toBeDefined();
      expect(result?.evaluationFocus.length).toBeGreaterThan(0);
    });

    it('should include key product features in English', () => {
      const result = getLocalizedProduct(productId, 'en');

      expect(
        result?.keyFeatures.some((f) => f.includes('life and savings')),
      ).toBeTruthy();
      expect(
        result?.keyFeatures.some((f) => f.includes('loyalty bonus')),
      ).toBeTruthy();
      expect(
        result?.keyFeatures.some((f) => f.includes('PHP 60,000')),
      ).toBeTruthy();
    });
  });

  describe('Tagalog (tl)', () => {
    it('should return Tagalog localization', () => {
      const result = getLocalizedProduct(productId, 'tl');

      expect(result).toBeTruthy();
      expect(result?.name).toBe('GoalReady');
      expect(result?.id).toBe('manulife-goalready');
      expect(result?.category).toBe('insurance');
    });

    it('should have all required Tagalog fields', () => {
      const result = getLocalizedProduct(productId, 'tl');

      expect(result?.keyFeatures).toBeDefined();
      expect(result?.keyFeatures.length).toBeGreaterThan(0);
      expect(result?.featureHighlight).toBeDefined();
      expect(result?.featureHighlight?.title).toContain('yaman');
      expect(result?.evaluationFocus).toBeDefined();
      expect(result?.evaluationFocus.length).toBeGreaterThan(0);
    });

    it('should include key product features in Tagalog', () => {
      const result = getLocalizedProduct(productId, 'tl');

      expect(
        result?.keyFeatures.some((f) => f.includes('plano sa buhay')),
      ).toBeTruthy();
      expect(
        result?.keyFeatures.some((f) => f.includes('loyalty bonus')),
      ).toBeTruthy();
      expect(
        result?.keyFeatures.some((f) => f.includes('PHP 60,000')),
      ).toBeTruthy();
    });
  });

  describe('Cebuano (ceb)', () => {
    it('should return Cebuano localization', () => {
      const result = getLocalizedProduct(productId, 'ceb');

      expect(result).toBeTruthy();
      expect(result?.name).toBe('GoalReady');
      expect(result?.id).toBe('manulife-goalready');
      expect(result?.category).toBe('insurance');
    });

    it('should have all required Cebuano fields', () => {
      const result = getLocalizedProduct(productId, 'ceb');

      expect(result?.keyFeatures).toBeDefined();
      expect(result?.keyFeatures.length).toBeGreaterThan(0);
      expect(result?.featureHighlight).toBeDefined();
      expect(result?.featureHighlight?.title).toContain('bahandi');
      expect(result?.evaluationFocus).toBeDefined();
      expect(result?.evaluationFocus.length).toBeGreaterThan(0);
    });

    it('should include key product features in Cebuano', () => {
      const result = getLocalizedProduct(productId, 'ceb');

      expect(
        result?.keyFeatures.some((f) => f.includes('plano sa kinabuhi')),
      ).toBeTruthy();
      expect(
        result?.keyFeatures.some((f) => f.includes('loyalty bonus')),
      ).toBeTruthy();
      expect(
        result?.keyFeatures.some((f) => f.includes('PHP 60,000')),
      ).toBeTruthy();
    });
  });

  describe('Fallback behavior', () => {
    it('should fallback to English for unsupported language', () => {
      const result = getLocalizedProduct(productId, 'unsupported-lang');

      expect(result).toBeTruthy();
      expect(result?.name).toBe('GoalReady');
      // Should return English version as fallback
      expect(result?.featureHighlight?.title).toContain(
        'Goal-based wealth accumulation',
      );
    });
  });

  describe('Markdown generation', () => {
    it('should auto-generate markdown for all languages', () => {
      const enResult = getLocalizedProduct(productId, 'en');
      const tlResult = getLocalizedProduct(productId, 'tl');
      const cebResult = getLocalizedProduct(productId, 'ceb');

      expect(enResult?.markdown).toBeDefined();
      expect(tlResult?.markdown).toBeDefined();
      expect(cebResult?.markdown).toBeDefined();

      // Markdown should contain product name
      expect(enResult?.markdown).toContain('GoalReady');
      expect(tlResult?.markdown).toContain('GoalReady');
      expect(cebResult?.markdown).toContain('GoalReady');
    });
  });
});
