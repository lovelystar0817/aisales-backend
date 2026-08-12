import { describe, it, expect } from 'vitest';
import {
  getPerformanceMarking,
  calculateWeightedScore,
  calculateOverallScore,
} from './scoring.js';
import type { IAssessment } from '../../../models/CallAnalysis.js';

function makeEval(
  score: number,
  maxScore: number,
  weight: number,
): { criteria: string; evaluation: string; score: number; maxScore: number; weight: number } {
  return { criteria: 'test', evaluation: 'test', score, maxScore, weight };
}

function makeAssessment(
  mandatory: ReturnType<typeof makeEval>[],
  softSkills: ReturnType<typeof makeEval>[],
  knowledgeApplication: ReturnType<typeof makeEval>[],
): IAssessment {
  return { mandatory, softSkills, knowledgeApplication } as IAssessment;
}

describe('getPerformanceMarking', () => {
  it('returns Exceptional for >= 95', () => {
    expect(getPerformanceMarking(95)).toBe('Exceptional');
    expect(getPerformanceMarking(100)).toBe('Exceptional');
  });

  it('returns Excellent for >= 85 and < 95', () => {
    expect(getPerformanceMarking(85)).toBe('Excellent');
    expect(getPerformanceMarking(94.9)).toBe('Excellent');
  });

  it('returns Good for >= 80 and < 85', () => {
    expect(getPerformanceMarking(80)).toBe('Good');
    expect(getPerformanceMarking(84.9)).toBe('Good');
  });

  it('returns Developing for >= 75 and < 80', () => {
    expect(getPerformanceMarking(75)).toBe('Developing');
    expect(getPerformanceMarking(79.9)).toBe('Developing');
  });

  it('returns Unsatisfactory for < 75', () => {
    expect(getPerformanceMarking(74.9)).toBe('Unsatisfactory');
    expect(getPerformanceMarking(0)).toBe('Unsatisfactory');
  });
});

describe('calculateWeightedScore', () => {
  it('calculates weighted percentage correctly', () => {
    const scores = [
      makeEval(8, 10, 1),
      makeEval(6, 10, 2),
    ];
    // (8*1 + 6*2) / (10*1 + 10*2) * 100 = 20/30 * 100 = 66.67
    expect(calculateWeightedScore(scores)).toBeCloseTo(66.67, 1);
  });

  it('returns 100 for perfect scores', () => {
    const scores = [
      makeEval(10, 10, 1),
      makeEval(5, 5, 3),
    ];
    expect(calculateWeightedScore(scores)).toBe(100);
  });

  it('returns 0 for all zero scores', () => {
    const scores = [
      makeEval(0, 10, 1),
      makeEval(0, 10, 2),
    ];
    expect(calculateWeightedScore(scores)).toBe(0);
  });

  it('returns 0 for empty array', () => {
    expect(calculateWeightedScore([])).toBe(0);
  });

  it('weights higher-weighted criteria more', () => {
    // High score on low weight, low score on high weight
    const scores = [
      makeEval(10, 10, 1), // 100% but weight 1
      makeEval(2, 10, 9),  // 20% but weight 9
    ];
    // (10*1 + 2*9) / (10*1 + 10*9) * 100 = 28/100 * 100 = 28
    expect(calculateWeightedScore(scores)).toBeCloseTo(28, 5);
  });
});

describe('calculateOverallScore', () => {
  it('computes overall as weighted ratio across all criteria', () => {
    const assessment = makeAssessment(
      [makeEval(8, 10, 2)],
      [makeEval(6, 10, 1)],
      [makeEval(9, 10, 1)],
    );
    // (8*2 + 6*1 + 9*1) / (10*2 + 10*1 + 10*1) * 100 = 31/40 * 100 = 77.5
    const result = calculateOverallScore(assessment);
    expect(result.percentage).toBeCloseTo(77.5, 1);
    expect(result.marking).toBe('Developing');
  });

  it('returns correct category scores independently', () => {
    const assessment = makeAssessment(
      [makeEval(10, 10, 1)],
      [makeEval(5, 10, 1)],
      [makeEval(8, 10, 1)],
    );
    const result = calculateOverallScore(assessment);
    expect(result.categoryScores.mandatory).toBe(100);
    expect(result.categoryScores.softSkills).toBe(50);
    expect(result.categoryScores.knowledgeApplication).toBe(80);
  });

  it('matches frontend formula: Σ(score × weight) / Σ(maxScore × weight) × 100', () => {
    const mandatory = [makeEval(7, 10, 2), makeEval(8, 10, 3)];
    const softSkills = [makeEval(9, 10, 1), makeEval(6, 10, 2)];
    const knowledge = [makeEval(5, 10, 1)];
    const assessment = makeAssessment(mandatory, softSkills, knowledge);

    // Manual frontend calculation
    const allCriteria = [...mandatory, ...softSkills, ...knowledge];
    const expectedNumerator = allCriteria.reduce((s, c) => s + c.score * c.weight, 0);
    const expectedDenominator = allCriteria.reduce((s, c) => s + c.maxScore * c.weight, 0);
    const expectedPercentage = (expectedNumerator / expectedDenominator) * 100;

    const result = calculateOverallScore(assessment);
    expect(result.percentage).toBeCloseTo(expectedPercentage, 5);
  });

  it('handles all perfect scores', () => {
    const assessment = makeAssessment(
      [makeEval(10, 10, 1)],
      [makeEval(10, 10, 1)],
      [makeEval(10, 10, 1)],
    );
    const result = calculateOverallScore(assessment);
    expect(result.percentage).toBe(100);
    expect(result.marking).toBe('Exceptional');
  });

  it('handles all zero scores', () => {
    const assessment = makeAssessment(
      [makeEval(0, 10, 1)],
      [makeEval(0, 10, 1)],
      [makeEval(0, 10, 1)],
    );
    const result = calculateOverallScore(assessment);
    expect(result.percentage).toBe(0);
    expect(result.marking).toBe('Unsatisfactory');
  });

  it('handles empty categories', () => {
    const assessment = makeAssessment([], [], []);
    const result = calculateOverallScore(assessment);
    expect(result.percentage).toBe(0);
  });
});
