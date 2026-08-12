/**
 * MSIG Travel Easy Skills Section Component
 * Shared component for rendering soft skills, knowledge skills, and product knowledge sections
 */
import React from 'react';
import { getScoreRating } from '../../utils/scoreRating.js';
import { Circle } from '../shared/Circle.js';

interface SkillSection {
  title: string;
  score: number;
  maxScore: number;
  why: string;
  suggestion: string;
}

interface MSIGTravelEasySkillsSectionProps {
  title: string;
  description: string;
  overallScore: number;
  maxScore: number;
  sections: SkillSection[];
  translations: any;
}

const MSIGTravelEasySkillsSection: React.FC<
  MSIGTravelEasySkillsSectionProps
> = ({
  title,
  description,
  overallScore,
  maxScore,
  sections,
  translations,
}) => {
  const scoreRating = getScoreRating(overallScore, false, translations.ratings);

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
        {/* Left Column - Title and Description */}
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '18px',
                fontWeight: 700,
                color: '#161618',
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#58595A',
                margin: '0 0 1rem 0',
              }}
            >
              {description}
            </p>

            {/* Overall Score Circle */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '0.5rem',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#58595A',
                  margin: '0 0 0.5rem 0',
                }}
              >
                {translations.overallScore}
              </p>
              <div style={{ position: 'relative' }}>
                <Circle
                  size={66}
                  value={overallScore}
                  maxValue={maxScore}
                  color={scoreRating.color}
                  bgColor="#E5E7EB"
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>
                    {overallScore}
                    <span
                      style={{
                        fontSize: '8px',
                        fontWeight: 400,
                        color: '#58595A',
                      }}
                    >
                      /{maxScore}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sections */}
        <div style={{ flex: 1, minWidth: 0, padding: '0 40px 0 20px' }}>
          {sections.map((section, idx) => (
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
              {/* Section Header */}
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
                  {section.title}
                </h4>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#161618',
                  }}
                >
                  {section.score}{' '}
                  <span style={{ fontWeight: 400, color: '#58595A' }}>
                    / {section.maxScore}
                  </span>
                </div>
              </div>

              {/* Why and Suggestion */}
              <div
                style={{
                  fontSize: '14px',
                  color: '#58595A',
                  lineHeight: '1.6',
                }}
              >
                {section.why && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ marginRight: '0.5rem', color: '#58595A' }}>
                      •
                    </span>
                    <div>
                      <strong style={{ fontWeight: 700 }}>
                        {translations.why}:
                      </strong>{' '}
                      {section.why}
                    </div>
                  </div>
                )}
                {section.suggestion && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ marginRight: '0.5rem', color: '#58595A' }}>
                      •
                    </span>
                    <div>
                      <strong style={{ fontWeight: 700 }}>
                        {translations.suggestion}:
                      </strong>{' '}
                      {section.suggestion}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MSIGTravelEasySkillsSection;
