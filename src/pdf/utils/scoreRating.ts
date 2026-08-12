export interface ScoreRatingTranslations {
  poor: string;
  fair: string;
  good: string;
  excellent: string;
}

export enum ScoreRating {
  Poor = 'Poor', // 0-39
  Fair = 'Fair', // 40-59
  Good = 'Good', // 60-79
  Excellent = 'Excellent', // 80-100
}

export function getScoreRating(
  score: number,
  secondary: boolean = false,
  translations?: ScoreRatingTranslations,
): { rating: string; color: string } {
  const defaultTranslations: ScoreRatingTranslations = {
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',
  };

  const t = translations || defaultTranslations;

  if (score >= 80)
    return {
      rating: t.excellent,
      color: !secondary ? '#38A383' : '#A5E0CE',
    };
  if (score >= 60)
    return {
      rating: t.good,
      color: !secondary ? '#1C7AEB' : '#ABCEF8',
    };
  if (score >= 40)
    return {
      rating: t.fair,
      color: !secondary ? '#FF7E0D' : '#FFBE85',
    };
  return {
    rating: t.poor,
    color: !secondary ? '#E60D00' : '#FF9F99',
  };
}
