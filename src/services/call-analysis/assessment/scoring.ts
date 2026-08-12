import type { IAssessment } from '../../../models/CallAnalysis.js';
import type { EvaluationResult } from './index.js';

// Calculate performance marking from score percentage
export function getPerformanceMarking(percentage: number): string {
  if (percentage >= 95) return 'Exceptional';
  if (percentage >= 85) return 'Excellent';
  if (percentage >= 80) return 'Good';
  if (percentage >= 75) return 'Developing';
  return 'Unsatisfactory';
}

// Calculate weighted score for a category
export function calculateWeightedScore(
  scores: Array<{ score: number; maxScore: number; weight: number }>,
): number {
  const totalWeightedScore = scores.reduce(
    (sum, s) => sum + s.score * s.weight,
    0,
  );
  const totalMaxWeightedScore = scores.reduce(
    (sum, s) => sum + s.maxScore * s.weight,
    0,
  );
  return totalMaxWeightedScore > 0
    ? (totalWeightedScore / totalMaxWeightedScore) * 100
    : 0;
}

// Calculate overall score from assessment
// Weighted ratio across all criteria: Σ(score × weight) / Σ(maxScore × weight) × 100
// Matches frontend getOverallScore() in shared.ts
export function calculateOverallScore(assessment: IAssessment): {
  percentage: number;
  marking: string;
  categoryScores: {
    mandatory: number;
    softSkills: number;
    knowledgeApplication: number;
  };
} {
  const mandatoryWithWeight = assessment.mandatory as EvaluationResult[];
  const softSkillsWithWeight = assessment.softSkills as EvaluationResult[];
  const knowledgeWithWeight =
    assessment.knowledgeApplication as EvaluationResult[];

  const mandatoryScore = calculateWeightedScore(mandatoryWithWeight);
  const softSkillsScore = calculateWeightedScore(softSkillsWithWeight);
  const knowledgeScore = calculateWeightedScore(knowledgeWithWeight);

  const allScores = [
    ...mandatoryWithWeight,
    ...softSkillsWithWeight,
    ...knowledgeWithWeight,
  ];
  const totalWeightedScore = allScores.reduce(
    (sum, s) => sum + s.score * s.weight,
    0,
  );
  const totalMaxWeightedScore = allScores.reduce(
    (sum, s) => sum + s.maxScore * s.weight,
    0,
  );
  const overallPercentage =
    totalMaxWeightedScore > 0
      ? (totalWeightedScore / totalMaxWeightedScore) * 100
      : 0;

  return {
    percentage: overallPercentage,
    marking: getPerformanceMarking(overallPercentage),
    categoryScores: {
      mandatory: mandatoryScore,
      softSkills: softSkillsScore,
      knowledgeApplication: knowledgeScore,
    },
  };
}
