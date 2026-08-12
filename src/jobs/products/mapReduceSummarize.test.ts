import { describe, it, expect } from 'vitest';
import { isGenericProductName } from './mapReduceSummarize.js';

describe('mapReduceSummarize', () => {
  describe('isGenericProductName', () => {
    it('should detect generic names', () => {
      expect(isGenericProductName('Test Product')).toBe(true);
      expect(isGenericProductName('New Product')).toBe(true);
      expect(isGenericProductName('Untitled')).toBe(true);
      expect(isGenericProductName('Product')).toBe(true);
      expect(isGenericProductName('')).toBe(true);
      expect(isGenericProductName('ab')).toBe(true);
      expect(isGenericProductName('test product')).toBe(true);
    });

    it('should not flag real product names', () => {
      expect(isGenericProductName('GrabFood')).toBe(false);
      expect(isGenericProductName('OneGrab Solution')).toBe(false);
      expect(isGenericProductName('Prudential Life Insurance')).toBe(false);
    });
  });

  it('should export mapReduceSummarize function', async () => {
    const mod = await import('./mapReduceSummarize.js');
    expect(mod.mapReduceSummarize).toBeDefined();
    expect(typeof mod.mapReduceSummarize).toBe('function');
  });
});
