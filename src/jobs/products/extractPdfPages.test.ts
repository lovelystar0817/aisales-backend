import { describe, it, expect } from 'vitest';

describe('extractPdfPages', () => {
  it('should export extractPdfWithVision function', async () => {
    const mod = await import('./extractPdfPages.js');
    expect(mod.extractPdfWithVision).toBeDefined();
    expect(typeof mod.extractPdfWithVision).toBe('function');
  });

  it('should export VISION_BATCH_SIZE and VISION_CONCURRENCY constants', async () => {
    const mod = await import('./extractPdfPages.js');
    expect(mod.VISION_BATCH_SIZE).toBe(10);
    expect(mod.VISION_CONCURRENCY).toBe(3);
  });
});
