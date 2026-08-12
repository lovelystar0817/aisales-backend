import React from 'react';
import { getScoreRating } from '../../utils/scoreRating.js';
import { Circle } from '../shared/Circle.js';
import { ScoreIndicator } from '../shared/ScoreIndicator.js';
import type { BaseOverallProps } from '../shared/types.js';

interface AIAKOOverallProps extends BaseOverallProps {
  score1?: number;
  score2?: number;
  score3?: number;
  maxScore1?: number;
  maxScore2?: number;
  maxScore3?: number;
  label1?: string;
  label2?: string;
  label3?: string;
  isOpeningObjectionCall?: boolean;
}

const AIAKOOverall: React.FC<AIAKOOverallProps> = ({
  score1,
  score2,
  score3,
  maxScore1 = 100,
  maxScore2 = 100,
  maxScore3 = 100,
  label1,
  label2,
  label3,
  assessmentIdentifiers,
  summary,
  nextSteps,
  translations,
  isOpeningObjectionCall,
}) => {
  // Section weights:
  // S1 (Opening Objection Call): Intro 20%, Objection Handling 50%, Needs Exploration 30%
  // S2 (Product Pitch): Needs Analysis 20%, Product Pitch 40%, Objection Handling 40%
  const weights = isOpeningObjectionCall
    ? [0.2, 0.5, 0.3]
    : [0.2, 0.4, 0.4];

  const scores = [
    { score: score1, maxScore: maxScore1, weight: weights[0] },
    { score: score2, maxScore: maxScore2, weight: weights[1] },
    { score: score3, maxScore: maxScore3, weight: weights[2] },
  ].filter(({ score }) => score != null);

  // Weighted percentage: sum of (score/maxScore * weight) for available sections
  const totalWeight = scores.reduce((sum, { weight }) => sum + weight, 0);
  const weightedSum = scores.reduce(
    (sum, { score, maxScore, weight }) =>
      sum + ((score || 0) / maxScore) * weight,
    0,
  );
  const percentage =
    totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        padding: '1rem',
        borderBottom: '12px solid #EFEFEF',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          paddingTop: '1rem',
        }}
      >
        {/* Left Column - Score Circle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 20%',
            minWidth: 0,
            paddingLeft: '1rem',
          }}
        >
          <div
            style={{
              position: 'relative',
              marginBottom: '1.5rem',
              width: '100px',
              height: '100px',
            }}
          >
            <Circle
              strokeWidth={5}
              size={100}
              value={percentage}
              color={
                getScoreRating(percentage, false, translations.ratings).color
              }
              bgColor="var(--color-gray-100)"
            />
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
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#000',
                }}
              >
                {percentage}
              </span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '16px',
                lineHeight: '1.4',
                letterSpacing: '-0.006em',
                color: '#58595A',
                margin: 0,
              }}
            >
              {translations.overallScore}
            </p>

            <h3
              style={{
                margin: '0.5rem 0',
                fontSize: '18px',
                fontWeight: 700,
                color: '#161618',
              }}
            >
              {getScoreRating(percentage, false, translations.ratings).rating}
            </h3>

            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                rowGap: '1rem',
              }}
            >
              {score1 != null && label1 && (
                <ScoreIndicator
                  score={score1}
                  maxScore={maxScore1}
                  label={`${label1} (${Math.round(weights[0] * 100)}%)`}
                  translations={translations.ratings}
                />
              )}
              {score2 != null && label2 && (
                <ScoreIndicator
                  score={score2}
                  maxScore={maxScore2}
                  label={`${label2} (${Math.round(weights[1] * 100)}%)`}
                  isSecondary
                  translations={translations.ratings}
                />
              )}
              {score3 != null && label3 && (
                <ScoreIndicator
                  score={score3}
                  maxScore={maxScore3}
                  label={`${label3} (${Math.round(weights[2] * 100)}%)`}
                  isSecondary
                  translations={translations.ratings}
                />
              )}
            </ul>
          </div>
        </div>

        {/* Right Column - Summary & Next Steps */}
        <div style={{ flex: 1, minWidth: 0, padding: '0 40px 0 20px' }}>
          {/* Module Info */}
          <div
            style={{
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              borderBottom: '1px solid #EFEFEF',
              paddingBottom: '1rem',
            }}
          >
            {assessmentIdentifiers.map((identifier, index) => (
              <div
                key={`identifier-${identifier.label}-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#58595A',
                    width: '80px',
                    flexShrink: 0,
                  }}
                >
                  {identifier.label}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#000',
                    marginLeft: '1.5rem',
                  }}
                >
                  {identifier.text}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#161618',
                marginBottom: '0.5rem',
              }}
            >
              {translations.summary}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#58595A',
                lineHeight: '1.6',
                margin: 0,
                fontWeight: 450,
              }}
            >
              {summary}
            </div>
          </div>

          {/* Next Steps */}
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#161618',
                marginBottom: '0.5rem',
              }}
            >
              {translations.suggestedNextSteps}
            </div>
            <div>
              {nextSteps.map((step, index) => (
                <div
                  key={`step-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#FF4B0A',
                      marginRight: 8,
                      marginTop: 4,
                    }}
                  />
                  <div
                    style={{
                      margin: 0,
                      color: '#58595A',
                      fontSize: '14px',
                      lineHeight: '1.6',
                    }}
                  >
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAKOOverall;
