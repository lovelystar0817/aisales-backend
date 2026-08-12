/**
 * Shared score indicator component for regular assessments
 */
import React from 'react';
import {
  getScoreRating,
  ScoreRatingTranslations,
} from '../../utils/scoreRating.js';

interface ScoreIndicatorProps {
  score: number;
  label: string;
  isSecondary?: boolean;
  maxScore?: number;
  translations: ScoreRatingTranslations;
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  score,
  label,
  isSecondary = false,
  maxScore = 100,
  translations,
}) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const { color } = getScoreRating(percentage, isSecondary, translations);
  return (
    <li style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', columnGap: '0.5rem' }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            height: '0.75rem',
            width: '0.25rem',
            borderRadius: '9999px',
            backgroundColor: color,
          }}
        />
        <span
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 600,
            color: '#161618',
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: '14px',
          lineHeight: '20px',
          color: '#161618',
          marginLeft: '0.25rem',
        }}
      >
        {score} <span style={{ color: '#58595A' }}> / {maxScore}</span>
      </span>
    </li>
  );
};
