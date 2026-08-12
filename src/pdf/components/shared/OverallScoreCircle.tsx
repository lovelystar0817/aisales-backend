/**
 * Overall score circle display for regular/BBL assessments
 */
import React from 'react';
import { Circle } from './Circle.js';
import {
  getScoreRating,
  ScoreRatingTranslations,
} from '../../utils/scoreRating.js';

interface OverallScoreCircleProps {
  overallScore: number;
  salesTechniqueScore?: number;
  productKnowledgeScore?: number;
  translations: ScoreRatingTranslations;
}

export const OverallScoreCircle: React.FC<OverallScoreCircleProps> = ({
  overallScore,
  salesTechniqueScore,
  productKnowledgeScore,
  translations,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '1.5rem',
        width: '100px',
        height: '100px',
      }}
    >
      {salesTechniqueScore && (
        <Circle
          strokeWidth={5}
          size={100}
          value={salesTechniqueScore}
          color={getScoreRating(salesTechniqueScore, false, translations).color}
          bgColor="var(--color-gray-100)"
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {productKnowledgeScore && (
          <Circle
            strokeWidth={5}
            size={80}
            value={productKnowledgeScore}
            color={
              getScoreRating(productKnowledgeScore, true, translations).color
            }
            bgColor="var(--color-gray-100)"
          />
        )}
        <span
          style={{
            position: 'absolute',
            fontSize: '1.25rem',
            fontWeight: 700,
            lineHeight: 1,
            color: '#000',
          }}
        >
          {overallScore}
        </span>
      </div>
    </div>
  );
};
