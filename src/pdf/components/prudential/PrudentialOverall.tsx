/**
 * Prudential assessment overview component
 * Shows badge, standing, and section status dots
 */
import React from 'react';
import type { BaseOverallProps } from '../shared/types.js';
import { SummarySection } from '../shared/SummarySection.js';
import { NextStepsList } from '../shared/NextStepsList.js';

interface PrudentialSection {
  title: string;
  score: number;
  status: string;
}

interface PrudentialOverallProps extends BaseOverallProps {
  standing?: {
    tierName?: string;
    tierLevel?: number;
  } | null;
  mandatoryNotMet?: boolean;
  prudentialSections?: PrudentialSection[];
  hideBadge?: boolean;
}

// Badge images by tier level
function getBadgeIconByIndex(
  tierLevel: number | undefined,
  tierName: string | undefined,
) {
  const badges = [
    'https://dopmo1eihgbgm.cloudfront.net/aisales/prudential-badges/newbie-sales-badge.png', // index 0 = tier 1
    'https://dopmo1eihgbgm.cloudfront.net/aisales/prudential-badges/intermediate-sales-badge.png', // index 1 = tier 2
    'https://dopmo1eihgbgm.cloudfront.net/aisales/prudential-badges/expert-sales-badge.png', // index 2 = tier 3
  ];

  // Derive tier level from tier name if not set properly
  let level = tierLevel;
  if (!level || level === 0) {
    if (tierName === 'Sales Novice') level = 1;
    else if (tierName === 'Skilled Advisor') level = 2;
    else if (tierName === 'Strategic Consultant') level = 3;
  }

  const index = (level ?? 0) - 1;
  if (index < 0 || index >= badges.length) {
    return 'https://dopmo1eihgbgm.cloudfront.net/aisales/prudential-badges/not-available-sales-badge.png';
  }

  return badges[index];
}

const PrudentialOverall: React.FC<PrudentialOverallProps> = ({
  assessmentIdentifiers,
  summary,
  nextSteps,
  translations,
  standing,
  mandatoryNotMet = false,
  prudentialSections = [],
  hideBadge = false,
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
        {/* Left Column - Badge & Standing */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 20%',
            minWidth: 0,
            paddingLeft: '1rem',
          }}
        >
          {!hideBadge && (
            <>
              {/* Badge display */}
              <div
                style={{
                  marginBottom: '0.5rem',
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={getBadgeIconByIndex(
                    standing?.tierLevel,
                    standing?.tierName,
                  )}
                  alt={`${standing?.tierName || 'Not Available'} badge`}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: '#58595A',
                  // lineHeight: '1.4',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {(translations as any).sessionStanding || 'Session standing'}
              </div>

              <div
                style={{
                  margin: '0 0 2rem 0',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#161618',
                }}
              >
                {standing?.tierName ||
                  (translations as any).notAvailable ||
                  'Not Available'}
              </div>
            </>
          )}

          {/* Standing Criteria Dots */}
          <div style={{ marginBottom: '1.5rem' }}>
            {prudentialSections.map((section, idx) => {
              let color = '#A3A3A3'; // gray
              if (section.score >= 67) {
                color = '#22C55E'; // green
              } else if (section.score >= 34) {
                color = '#155dfc'; // blue
              } else if (section.score > 0) {
                color = '#f04e23'; // orange
              }

              return (
                <div key={idx}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 12,
                        borderRadius: '9999px',
                        backgroundColor: '#A3A3A3',
                        marginRight: 8,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        color: '#58595A',
                        marginRight: 8,
                      }}
                    >
                      {section.title}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 8,
                      marginLeft: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: color,
                        marginRight: 8,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#161618',
                      }}
                    >
                      {section.status}
                    </span>
                  </div>
                </div>
              );
            })}
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
          <SummarySection
            title={translations.summary}
            content={
              mandatoryNotMet
                ? (translations as any).prudentialMandatoryNotMet
                : summary
            }
          />

          {/* Next Steps */}
          <NextStepsList
            title={
              mandatoryNotMet
                ? (translations as any).prudentialNextStepsTitle
                : translations.suggestedNextSteps
            }
            steps={
              mandatoryNotMet
                ? [(translations as any).prudentialSuggestedNextStep]
                : nextSteps
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PrudentialOverall;
