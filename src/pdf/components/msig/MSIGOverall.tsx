/**
 * MSIG assessment overview component
 * Shows different summary/next steps if mandatory criteria failed
 */
import React from 'react';
import type { BaseOverallProps } from '../shared/types.js';
import { SummarySection } from '../shared/SummarySection.js';
import { NextStepsList } from '../shared/NextStepsList.js';

interface MSIGOverallProps extends BaseOverallProps {
  mandatoryNotMet?: boolean;
}

const MSIGOverall: React.FC<MSIGOverallProps> = ({
  assessmentIdentifiers,
  summary,
  nextSteps,
  translations,
  mandatoryNotMet = false,
}) => {
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
        {/* Module Info */}
        <div style={{ flex: 1, minWidth: 0, padding: '0 40px 0 20px' }}>
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
          <SummarySection
            title={translations.summary}
            content={
              mandatoryNotMet
                ? (translations as any).msigMandatoryNotMetSummary
                : summary
            }
          />

          {/* Next Steps */}
          <NextStepsList
            title={
              mandatoryNotMet
                ? (translations as any).msigNextStepsTitle
                : translations.suggestedNextSteps
            }
            steps={
              mandatoryNotMet
                ? [(translations as any).msigMandatoryNotMetNextStep]
                : nextSteps
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MSIGOverall;
