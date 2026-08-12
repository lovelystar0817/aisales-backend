/**
 * HSBC assessment overview component
 * Calculates equal-weighted combined score
 */
import React from 'react';
import { getScoreRating } from '../../utils/scoreRating.js';
import { Circle } from '../shared/Circle.js';
import { ScoreIndicator } from '../shared/ScoreIndicator.js';
import type { BaseOverallProps } from '../shared/types.js';

interface HSBCOverallProps extends BaseOverallProps {
  relationshipManagementScore?: number;
  hsbcProcessAdherenceScore?: number;
  representationScore?: number;
  communicationAndPresenceScore?: number;
}

const HSBCOverall: React.FC<HSBCOverallProps> = ({
  relationshipManagementScore,
  hsbcProcessAdherenceScore,
  representationScore,
  communicationAndPresenceScore,
  assessmentIdentifiers,
  summary,
  nextSteps,
  translations,
}) => {
  // HSBC uses equal weighting for all four scores
  const overallScore = (() => {
    const scoreList = [
      relationshipManagementScore,
      hsbcProcessAdherenceScore,
      representationScore,
      communicationAndPresenceScore,
    ];

    const validScores = scoreList.filter(
      (score): score is number => score != null && score !== undefined,
    );

    if (validScores.length === 0) return 0;

    return Math.round(
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length,
    );
  })();

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
          {/* Single circle with overall score */}
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
              value={overallScore}
              color={
                getScoreRating(overallScore, false, translations.ratings).color
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
                {overallScore}
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
              {getScoreRating(overallScore, false, translations.ratings).rating}
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
              {relationshipManagementScore != null && (
                <ScoreIndicator
                  score={relationshipManagementScore}
                  label={
                    translations.relationshipManagement ||
                    'Relationship Management'
                  }
                  translations={translations.ratings}
                />
              )}
              {hsbcProcessAdherenceScore != null && (
                <ScoreIndicator
                  score={hsbcProcessAdherenceScore}
                  label={translations.processAdherence || 'Process Adherence'}
                  translations={translations.ratings}
                />
              )}
              {representationScore != null && (
                <ScoreIndicator
                  score={representationScore}
                  label={
                    translations.hsbcRepresentation || 'HSBC Representation'
                  }
                  translations={translations.ratings}
                />
              )}
              {communicationAndPresenceScore != null && (
                <ScoreIndicator
                  score={communicationAndPresenceScore}
                  label={
                    translations.communicationAndPresence ||
                    'Communication and Presence'
                  }
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
                key={index}
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
                  key={index}
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

export default HSBCOverall;
