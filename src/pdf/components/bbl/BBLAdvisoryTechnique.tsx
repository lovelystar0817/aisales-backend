/**
 * BBL Advisory Technique component
 * Dedicated component - no conditionals!
 */
import React from 'react';
import { getScoreRating } from '../../utils/scoreRating.js';
import { Circle } from '../shared/Circle.js';
import type { BaseSalesTechniqueProps } from '../shared/types.js';

interface Section {
  title: string;
  score: number;
  maxScore: number;
  why: string;
  suggestion: string;
}

interface BBLAdvisoryTechniqueProps extends BaseSalesTechniqueProps {
  sections: Section[];
}

const BBLAdvisoryTechnique: React.FC<BBLAdvisoryTechniqueProps> = ({
  overallScore,
  maxScore,
  description,
  sections,
  translations,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        padding: '1rem',
        margin: '0 auto',
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
        {/* Left Column */}
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
              width: '60px',
              height: '60px',
            }}
          >
            <Circle
              strokeWidth={5}
              size={60}
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
                  fontSize: '1rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#000',
                }}
              >
                {overallScore}
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    lineHeight: 1,
                    color: '#58595A',
                  }}
                >
                  /{maxScore}
                </span>
              </span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '18px',
                fontWeight: 700,
                color: '#161618',
              }}
            >
              {translations.advisoryTechnique || 'Advisory Technique'}
            </h3>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#58595A',
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, minWidth: 0, padding: '0 40px 0 20px' }}>
          {sections.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem 0',
                borderBottom:
                  idx < sections.length - 1 ? '1px solid #EFEFEF' : 'none',
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#161618',
                  }}
                >
                  {item.title}
                </h4>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#161618',
                  }}
                >
                  {item.score}
                  <span style={{ fontWeight: 400, color: '#58595A' }}>
                    {' '}
                    / {item.maxScore}
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: '#58595A',
                  lineHeight: '1.6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      color: '#58595A',
                      marginRight: '0.25rem',
                      fontWeight: 700,
                    }}
                  >
                    •
                  </div>
                  <div style={{ lineHeight: '1.6' }}>
                    <span style={{ fontWeight: 600, color: '#58595A' }}>
                      {translations.why}:
                    </span>{' '}
                    {item.why}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      color: '#58595A',
                      marginRight: '0.25rem',
                      fontWeight: 700,
                    }}
                  >
                    •
                  </div>
                  <div style={{ lineHeight: '1.6' }}>
                    <span style={{ fontWeight: 600, color: '#58595A' }}>
                      {translations.suggestion}:
                    </span>{' '}
                    {item.suggestion}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BBLAdvisoryTechnique;
