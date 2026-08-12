import React from 'react';
import { getScoreRating } from '../../utils/scoreRating.js';
import { Circle } from '../shared/Circle.js';
import type { BaseProductKnowledgeProps } from '../shared/types.js';

interface Section {
  title: string;
  score: number;
  maxScore: number;
  why: string;
  suggestion: string;
}

interface AIAKOSectionProps extends BaseProductKnowledgeProps {
  sectionTitle: string;
  sections: Section[];
}

const AIAKOSection: React.FC<AIAKOSectionProps> = ({
  overallScore,
  maxScore,
  description,
  sectionTitle,
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
              value={(overallScore / maxScore) * 100}
              color={
                getScoreRating(
                  (overallScore / maxScore) * 100,
                  false,
                  translations.ratings,
                ).color
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
              {sectionTitle}
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
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '14px',
                  color: '#58595A',
                  lineHeight: '1.6',
                }}
              >
                {item.why && (
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem',
                      paddingLeft: '0.5rem',
                    }}
                  >
                    <span style={{ marginRight: '0.5rem', color: '#58595A' }}>
                      •
                    </span>
                    <div style={{ lineHeight: '1.6' }}>
                      <strong style={{ fontWeight: 700 }}>
                        {translations.why}:
                      </strong>{' '}
                      {item.why}
                    </div>
                  </li>
                )}
                {item.suggestion && (
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      paddingLeft: '0.5rem',
                    }}
                  >
                    <span style={{ marginRight: '0.5rem', color: '#58595A' }}>
                      •
                    </span>
                    <div style={{ lineHeight: '1.6' }}>
                      <strong style={{ fontWeight: 700 }}>
                        {translations.suggestion}:
                      </strong>{' '}
                      {item.suggestion}
                    </div>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAKOSection;
