/**
 * Manulife Sales Technique Component
 * Criteria-based evaluation with checkmarks
 */
import React from 'react';
import { CorrectIcon, IncorrectIcon } from '../../utils/icon.js';
import type { SalesTechniqueSection } from '../../services/types.js';

interface ManulifeSalesTechniqueProps {
  overallScore: number;
  maxScore: number;
  description: string;
  sections: SalesTechniqueSection[];
  translations: any;
}

const ManulifeSalesTechnique: React.FC<ManulifeSalesTechniqueProps> = ({
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
            marginTop: '14px',
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
            {translations.salesTechnique}
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

        {/* Right Column */}
        <div style={{ flex: 1, minWidth: 0, padding: '0 40px 0 20px' }}>
          {sections.map((section, idx) => {
            if (section.notApplicable) {
              return (
                <div
                  key={idx}
                  style={{
                    padding: '1rem 0',
                    borderBottom:
                      idx < sections.length - 1 ? '1px solid #EFEFEF' : 'none',
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
                      {section.title}
                    </h4>
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#9ca3af',
                      fontStyle: 'italic',
                    }}
                  >
                    {(translations as any).notApplicable || 'Not Applicable'}
                  </div>
                </div>
              );
            }

            return (
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

                {/* Evaluations */}
                {section.evaluations && section.evaluations.length > 0 && (
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#58595A',
                      lineHeight: '1.6',
                    }}
                  >
                    {section.evaluations.map(
                      (evaluation: any, evalIdx: number) => (
                        <div
                          key={evalIdx}
                          style={{
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ flexShrink: 0, marginTop: '2px' }}>
                            {evaluation.pass ? (
                              <CorrectIcon />
                            ) : (
                              <IncorrectIcon />
                            )}
                          </div>
                          <div style={{ lineHeight: '1.6' }}>
                            {evaluation.criteria}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ManulifeSalesTechnique;
