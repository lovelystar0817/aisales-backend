/**
 * Manulife GoalReady Skills Section Component
 * Shared component for rendering sales skills, soft skills, and product knowledge sections
 * Supports two feedback formats:
 * 1. why-suggestion: subsections with why and suggestion fields
 * 2. strengths-improvements: subsections with strengths and toImprove arrays
 */
import React from 'react';
import { getScoreRating } from '../../utils/scoreRating.js';
import { Circle } from '../shared/Circle.js';

interface WhySuggestionSubsection {
  title: string;
  score: number;
  maxScore: number;
  why: string;
  suggestion: string;
}

interface StrengthsImprovementsSubsection {
  title: string;
  score: number;
  maxScore: number;
  strengths: string[];
  toImprove:
    | string[]
    | Array<{
        text: string;
        status: 'warning' | 'error';
        correction: string;
      }>;
}

// Legacy format from older sessions (before schema was updated to strengths/toImprove)
interface StatementsSubsection {
  title: string;
  score: number;
  maxScore: number;
  statements: Array<{
    text: string;
    category: 'CORRECT' | 'WARNING' | 'INCORRECT';
    correction: string;
  }>;
}

type Subsection =
  | WhySuggestionSubsection
  | StrengthsImprovementsSubsection
  | StatementsSubsection;

interface ManulifeGoalReadySkillsSectionProps {
  title: string;
  overallScore: number;
  maxScore: number;
  subsections: Subsection[];
  translations: any;
  type: 'why-suggestion' | 'strengths-improvements';
}

const ManulifeGoalReadySkillsSection: React.FC<
  ManulifeGoalReadySkillsSectionProps
> = ({ title, overallScore, maxScore, subsections, translations, type }) => {
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
        {/* Left Column - Title and Overall Score */}
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

            {/* Overall Score Circle */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '1rem',
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

        {/* Right Column - Subsections */}
        <div style={{ flex: 1, minWidth: 0, padding: '0 40px 0 20px' }}>
          {subsections.map((subsection, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem 0',
                borderBottom:
                  idx < subsections.length - 1 ? '1px solid #EFEFEF' : 'none',
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
              }}
            >
              {/* Subsection Header */}
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
                  {subsection.title}
                </h4>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#161618',
                  }}
                >
                  {subsection.score}{' '}
                  <span style={{ fontWeight: 400, color: '#58595A' }}>
                    / {subsection.maxScore}
                  </span>
                </div>
              </div>

              {/* Feedback Content */}
              <div
                style={{
                  fontSize: '14px',
                  color: '#58595A',
                  lineHeight: '1.6',
                }}
              >
                {type === 'why-suggestion' &&
                  'why' in subsection &&
                  'suggestion' in subsection && (
                    <>
                      {subsection.why && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <span
                            style={{ marginRight: '0.5rem', color: '#58595A' }}
                          >
                            •
                          </span>
                          <div>
                            <strong style={{ fontWeight: 700 }}>
                              {translations.why}:
                            </strong>{' '}
                            {subsection.why}
                          </div>
                        </div>
                      )}
                      {subsection.suggestion && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{ marginRight: '0.5rem', color: '#58595A' }}
                          >
                            •
                          </span>
                          <div>
                            <strong style={{ fontWeight: 700 }}>
                              {translations.suggestion}:
                            </strong>{' '}
                            {subsection.suggestion}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                {type === 'strengths-improvements' && (() => {
                  // Normalize legacy statements format to strengths/toImprove
                  let strengths: string[] = [];
                  let toImprove: Array<{
                    text: string;
                    status?: string;
                    correction?: string;
                  }> = [];

                  if ('statements' in subsection && subsection.statements) {
                    strengths = subsection.statements
                      .filter((s) => s.category === 'CORRECT')
                      .map((s) => s.text);
                    toImprove = subsection.statements
                      .filter((s) => s.category !== 'CORRECT')
                      .map((s) => ({
                        text: s.text,
                        correction: s.category === 'INCORRECT' ? s.correction : undefined,
                      }));
                  } else if ('strengths' in subsection && 'toImprove' in subsection) {
                    strengths = subsection.strengths;
                    toImprove = subsection.toImprove.map((item) => {
                      if (typeof item === 'string') return { text: item };
                      return {
                        text: item.text,
                        correction: item.status === 'error' ? item.correction : undefined,
                      };
                    });
                  }

                  return (
                    <>
                      {strengths.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div
                            style={{
                              fontWeight: 700,
                              marginBottom: '0.25rem',
                              color: '#161618',
                            }}
                          >
                            {translations.strengths || 'Strengths'}:
                          </div>
                          {strengths.map((strength, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                marginBottom: '0.25rem',
                              }}
                            >
                              <span
                                style={{
                                  marginRight: '0.5rem',
                                  color: '#58595A',
                                }}
                              >
                                •
                              </span>
                              <span>{strength}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {toImprove.length > 0 && (
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              marginBottom: '0.25rem',
                              color: '#161618',
                            }}
                          >
                            {translations.toImprove || 'To Improve'}:
                          </div>
                          {toImprove.map((improvement, i) => (
                            <div
                              key={i}
                              style={{
                                marginBottom: '0.5rem',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                <span
                                  style={{
                                    marginRight: '0.5rem',
                                    color: '#58595A',
                                  }}
                                >
                                  •
                                </span>
                                <span>{improvement.text}</span>
                              </div>
                              {improvement.correction && (
                                <div
                                  style={{
                                    marginLeft: '1rem',
                                    fontSize: '0.9rem',
                                    color: '#0066CC',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  {improvement.correction}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManulifeGoalReadySkillsSection;
