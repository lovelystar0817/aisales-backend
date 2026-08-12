/**
 * Regular assessment product knowledge component
 * Also used for BBL Process Adherence and HSBC Communication and Presence
 */
import React from 'react';
import { getScoreRating } from '../../utils/scoreRating.js';
import { Circle } from '../shared/Circle.js';
import { WarningIcon, IncorrectIcon, CorrectIcon } from '../../utils/icon.js';
import type { BaseProductKnowledgeProps } from '../shared/types.js';

interface ToImproveItem {
  text: string;
  correction: string | null;
  status?: string;
}

interface Section {
  title: string;
  score: number;
  maxScore: number;
  strengths: string[];
  toImprove: ToImproveItem[];
}

interface RegularProductKnowledgeProps extends BaseProductKnowledgeProps {
  sections: Section[];
}

const RegularProductKnowledge: React.FC<RegularProductKnowledgeProps> = ({
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
              {translations.productKnowledge}
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
                  margin: '0 0 1rem 0',
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
                    key={strengthIndex}
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
                {item.toImprove.map((toImprove, toImproveIndex) => (
                  <div key={toImproveIndex} style={{ marginBottom: '1rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ flexShrink: 0, marginTop: '2px' }}>
                        {toImprove.correction ? (
                          <IncorrectIcon />
                        ) : (
                          <WarningIcon />
                        )}
                      </div>
                      <div style={{ lineHeight: '1.6' }}>{toImprove.text}</div>
                    </div>
                    {toImprove.correction && (
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
                          {translations.correction}: {toImprove.correction}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegularProductKnowledge;
