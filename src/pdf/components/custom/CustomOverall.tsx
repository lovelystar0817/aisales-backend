import React from 'react';
import { getScoreRating } from '../../utils/scoreRating.js';
import { ScoreIndicator } from '../shared/ScoreIndicator.js';
import type { BaseOverallProps } from '../shared/types.js';
import { Circle } from '../shared/Circle.js';

interface CustomOverallProps extends BaseOverallProps {
  customSections: any[];
}

const CustomOverall: React.FC<CustomOverallProps> = ({
  customSections,
  assessmentIdentifiers,
  summary,
  nextSteps,
  translations,
}) => {
  const totalScores = customSections.map((section: any) => ({
    score: Math.round(section.overallScore),
    label: section.name,
  }));

  const getOverallScore = () => {
    const validScores = totalScores.filter(
      ({ score }: { score?: number }) => score != null && score !== undefined,
    );

    if (validScores.length === 0) {
      return undefined;
    }

    const score =
      validScores.reduce(
        (acc: number, { score }: { score?: number }) => acc + (score || 0),
        0,
      ) / validScores.length;

    return Math.round(score);
  };

  const overallScore = getOverallScore();

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
            {overallScore && (
              <Circle
                strokeWidth={5}
                size={100}
                value={overallScore}
                color={getScoreRating(overallScore, false).color}
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

          <div style={{ flex: 1 }}>
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
              {totalScores.map((scoreData: any, index: number) => (
                <ScoreIndicator
                  key={index}
                  score={scoreData.score || 0}
                  label={scoreData.label || ''}
                  isSecondary={index > 0}
                  translations={translations.ratings}
                />
              ))}
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
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#58595A',
                        fontWeight: 400,
                      }}
                    >
                      {step}
                    </div>
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

export default CustomOverall;
