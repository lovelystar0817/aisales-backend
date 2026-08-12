import React from 'react';
import { Circle } from '../shared/Circle.js';
import {
  ScoreRatingTranslations,
  getScoreRating,
} from '../../utils/scoreRating.js';
import { CorrectIcon, WarningIcon } from '../../utils/icon.js';

interface Translations {
  softSkills: string;
  strengths: string;
  toImprove: string;
  example: string;
  ratings: ScoreRatingTranslations;
}

interface GrabMexSoftSkillsProps {
  overallScore: number;
  maxScore: number;
  description: string;
  sections: {
    title: string;
    score: number;
    maxScore: number;
    strengths: string[];
    toImprove: {
      text: string;
      example: string;
    }[];
  }[];
  translations: Translations;
}

const GrabMexSoftSkills: React.FC<GrabMexSoftSkillsProps> = ({
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
                getScoreRating(overallScore, true, translations.ratings).color
              }
              bgColor="var(--color-gray-100)"
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#161618',
              }}
            >
              {overallScore}
            </div>
          </div>

          <div
            style={{
              fontSize: '14px',
              fontWeight: 'normal',
              color: '#58595A',
              marginBottom: '1rem',
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', color: '#161618' }}>
                {overallScore}
              </span>
              <span style={{ color: '#58595A' }}> / {maxScore}</span>
            </div>
            <div style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>
              {translations.softSkills}
            </div>
            <div style={{ fontSize: '12px', color: '#58595A' }}>
              {description}
            </div>
          </div>
        </div>

        {/* Right Column - Soft Skills sections */}
        <div style={{ flex: 1, minWidth: 0, padding: '0 40px 0 20px' }}>
          {sections.map((item, index) => (
            <div
              key={item.title}
              style={{
                marginBottom: '1rem',
                borderBottom:
                  index < sections.length - 1 ? '1px solid #EFEFEF' : 'none',
                paddingBottom: index < sections.length - 1 ? '1rem' : 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#161618',
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#161618',
                  }}
                >
                  {item.score}{' '}
                  <span style={{ fontWeight: 400, color: '#58595A' }}>
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
                {item.strengths && item.strengths.length > 0 && (
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#58595A',
                      lineHeight: '1.6',
                      margin: 0,
                      fontWeight: 450,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#161618',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {translations.strengths}
                    </div>
                    {item.strengths.map((strength, strengthIndex) => (
                      <div
                        key={`${item.title}-strength-${strengthIndex}`}
                        style={{
                          marginBottom: '0.75rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ flexShrink: 0, marginTop: '2px' }}>
                          <CorrectIcon />
                        </div>
                        <div style={{ lineHeight: '1.6' }}>{strength}</div>
                      </div>
                    ))}
                  </div>
                )}
                {item.toImprove && item.toImprove.length > 0 && (
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#58595A',
                      lineHeight: '1.6',
                      margin: 0,
                      fontWeight: 450,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#161618',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {translations.toImprove}
                    </div>
                    {item.toImprove.map((improve, toImproveIndex) => (
                      <div
                        key={`${item.title}-improve-${toImproveIndex}`}
                        style={{ marginBottom: '1rem' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ flexShrink: 0, marginTop: '2px' }}>
                            <WarningIcon />
                          </div>
                          <div style={{ lineHeight: '1.6' }}>
                            {improve.text}
                          </div>
                        </div>
                        {improve.example && (
                          <div
                            style={{
                              marginTop: '0.25rem',
                              paddingLeft: '1.5rem',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'stretch',
                            }}
                          >
                            <div
                              style={{
                                width: '0.25rem',
                                backgroundColor: '#C7CBCE',
                                borderRadius: '0.25rem',
                                marginRight: '0.5rem',
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ lineHeight: '1.6' }}>
                              {translations.example}: {improve.example}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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

export default GrabMexSoftSkills;
