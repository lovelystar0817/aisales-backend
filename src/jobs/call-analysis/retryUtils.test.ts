import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry } from './retryUtils.js';

// Mock CallAnalysis
vi.mock('../../models/CallAnalysis.js', () => ({
  CallAnalysis: {
    findByIdAndUpdate: vi.fn(),
  },
}));

import { CallAnalysis } from '../../models/CallAnalysis.js';

function createMockJob(data: Record<string, any> = {}) {
  return {
    attrs: { data },
    agenda: {
      schedule: vi.fn(),
    },
  } as any;
}

describe('withRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call fn and succeed without retrying', async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const job = createMockJob({ analysisId: '123' });

    await withRetry({
      job,
      jobType: 'test-job',
      analysisId: '123',
      stepKeys: ['transcription'],
      fn,
    });

    expect(fn).toHaveBeenCalledOnce();
    expect(job.agenda.schedule).not.toHaveBeenCalled();
    expect(CallAnalysis.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should schedule retry on first failure with 30s delay', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('API timeout'));
    const job = createMockJob({ analysisId: '123', retryCount: 0 });

    await withRetry({
      job,
      jobType: 'test-job',
      analysisId: '123',
      stepKeys: ['transcription'],
      fn,
    });

    expect(job.agenda.schedule).toHaveBeenCalledOnce();
    const [retryAt, jobType, data] = job.agenda.schedule.mock.calls[0];
    expect(jobType).toBe('test-job');
    expect(data.retryCount).toBe(1);
    expect(data.analysisId).toBe('123');
    // Should be ~30 seconds from now
    expect(retryAt.getTime() - Date.now()).toBeGreaterThan(29_000);
    expect(retryAt.getTime() - Date.now()).toBeLessThan(31_000);

    // Should NOT mark as failed during retry
    expect(CallAnalysis.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should schedule retry on second failure with 2min delay', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('API timeout'));
    const job = createMockJob({ analysisId: '123', retryCount: 1 });

    await withRetry({
      job,
      jobType: 'test-job',
      analysisId: '123',
      stepKeys: ['transcription'],
      fn,
    });

    const [retryAt, , data] = job.agenda.schedule.mock.calls[0];
    expect(data.retryCount).toBe(2);
    // Should be ~2 minutes from now
    expect(retryAt.getTime() - Date.now()).toBeGreaterThan(119_000);
    expect(retryAt.getTime() - Date.now()).toBeLessThan(121_000);
  });

  it('should schedule retry on third failure with 5min delay', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('API timeout'));
    const job = createMockJob({ analysisId: '123', retryCount: 2 });

    await withRetry({
      job,
      jobType: 'test-job',
      analysisId: '123',
      stepKeys: ['transcription'],
      fn,
    });

    const [retryAt, , data] = job.agenda.schedule.mock.calls[0];
    expect(data.retryCount).toBe(3);
    // Should be ~5 minutes from now
    expect(retryAt.getTime() - Date.now()).toBeGreaterThan(299_000);
    expect(retryAt.getTime() - Date.now()).toBeLessThan(301_000);
  });

  it('should mark as permanently failed after max retries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Permanent failure'));
    const job = createMockJob({ analysisId: '123', retryCount: 3 });

    await expect(
      withRetry({
        job,
        jobType: 'test-job',
        analysisId: '123',
        stepKeys: ['transcription'],
        fn,
      }),
    ).rejects.toThrow('Permanent failure');

    // Should NOT schedule another retry
    expect(job.agenda.schedule).not.toHaveBeenCalled();

    // Should mark as failed in DB
    expect(CallAnalysis.findByIdAndUpdate).toHaveBeenCalledWith('123', {
      status: 'failed',
      error: {
        step: 'transcription',
        message: 'Permanent failure',
        timestamp: expect.any(Date),
      },
      'processingSteps.transcription.status': 'failed',
      'processingSteps.transcription.completedAt': expect.any(Date),
      'processingSteps.transcription.error': 'Permanent failure',
    });
  });

  it('should mark multiple step keys as failed', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('LLM error'));
    const job = createMockJob({ analysisId: '456', retryCount: 3 });

    await expect(
      withRetry({
        job,
        jobType: 'assess-call',
        analysisId: '456',
        stepKeys: ['assessment', 'overview'],
        fn,
      }),
    ).rejects.toThrow('LLM error');

    const updateArg = (CallAnalysis.findByIdAndUpdate as any).mock.calls[0][1];
    expect(updateArg.status).toBe('failed');
    expect(updateArg.error.step).toBe('assessment');
    expect(updateArg['processingSteps.assessment.status']).toBe('failed');
    expect(updateArg['processingSteps.assessment.error']).toBe('LLM error');
    expect(updateArg['processingSteps.overview.status']).toBe('failed');
    expect(updateArg['processingSteps.overview.error']).toBe('LLM error');
  });

  it('should default retryCount to 0 when not present in job data', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const job = createMockJob({ analysisId: '123' }); // no retryCount

    await withRetry({
      job,
      jobType: 'test-job',
      analysisId: '123',
      stepKeys: ['transcription'],
      fn,
    });

    // Should schedule retry (retryCount 0 < MAX_RETRIES 3)
    expect(job.agenda.schedule).toHaveBeenCalledOnce();
    const [, , data] = job.agenda.schedule.mock.calls[0];
    expect(data.retryCount).toBe(1);
  });

  it('should preserve existing job data when scheduling retry', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const job = createMockJob({
      analysisId: '123',
      product: 'dentiplus',
      retryCount: 0,
    });

    await withRetry({
      job,
      jobType: 'test-job',
      analysisId: '123',
      stepKeys: ['assessment'],
      fn,
    });

    const [, , data] = job.agenda.schedule.mock.calls[0];
    expect(data.analysisId).toBe('123');
    expect(data.product).toBe('dentiplus');
    expect(data.retryCount).toBe(1);
  });

  it('should handle non-Error thrown values', async () => {
    const fn = vi.fn().mockRejectedValue('string error');
    const job = createMockJob({ analysisId: '123', retryCount: 3 });

    await expect(
      withRetry({
        job,
        jobType: 'test-job',
        analysisId: '123',
        stepKeys: ['transcription'],
        fn,
      }),
    ).rejects.toBe('string error');

    const updateArg = (CallAnalysis.findByIdAndUpdate as any).mock.calls[0][1];
    expect(updateArg.error.message).toBe('Unknown error');
    expect(updateArg['processingSteps.transcription.error']).toBe(
      'Unknown error',
    );
  });
});
