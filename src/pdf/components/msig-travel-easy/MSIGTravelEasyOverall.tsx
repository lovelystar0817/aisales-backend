/**
 * MSIG Travel Easy Overall Component
 * Displays the overview section with summary and next steps
 */
import React from 'react';
import { getScoreRating } from '../../utils/scoreRating.js';
import { OverallScoreCircle } from '../shared/OverallScoreCircle.js';
import { ScoreIndicator } from '../shared/ScoreIndicator.js';
import type {
  AssessmentIdentifier,
  BaseTranslations,
} from '../shared/types.js';

// Badge images by tier level for MSIG TravelEasy
function getBadgeIconByTierLevel(
  tierLevel: number | undefined,
  tierName: string | undefined,
) {
  const badges = [
    'https://dopmo1eihgbgm.cloudfront.net/aisales/prudential-badges/newbie-sales-badge.png', // tier 1
    'https://dopmo1eihgbgm.cloudfront.net/aisales/prudential-badges/emerging-sales-badge.png', // tier 2
    'https://dopmo1eihgbgm.cloudfront.net/aisales/prudential-badges/intermediate-sales-badge.png', // tier 3
    'https://dopmo1eihgbgm.cloudfront.net/aisales/prudential-badges/expert-sales-badge.png', // tier 4
  ];

  // Derive tier level from tier name if not set properly
  let level = tierLevel;
  if (!level || level === 0) {
    if (tierName === 'Sales Novice') level = 1;
    else if (tierName === 'Emerging Seller') level = 2;
    else if (tierName === 'Skilled Advisor') level = 3;
    else if (tierName === 'Strategic Consultant') level = 4;
  }

  const index = (level ?? 0) - 1;
  if (index < 0 || index >= badges.length) {
    return 'https://dopmo1eihgbgm.cloudfront.net/aisales/prudential-badges/not-available-sales-badge.png';
  }

  return badges[index];
}

interface MSIGTravelEasyOverallProps {
  softSkillsScore?: number;
  knowledgeSkillsScore?: number;
  productKnowledgeScore?: number;
  assessmentIdentifiers: AssessmentIdentifier[];
  summary: string;
  nextSteps: string[];
  translations: BaseTranslations;
  standing?: {
    tierName?: string;
    tierLevel?: number;
  } | null;
}

const MSIGTravelEasyOverall: React.FC<MSIGTravelEasyOverallProps> = ({
  softSkillsScore,
  knowledgeSkillsScore,
  productKnowledgeScore,
  assessmentIdentifiers,
  summary,
  nextSteps,
  translations,
  standing,
}) => {
  // Calculate overall score as sum of all three scores
  // Soft Skills: 30 points, Knowledge Skills: 30 points, Product Knowledge: 40 points = 100 total
  const validScores = [
    softSkillsScore,
    knowledgeSkillsScore,
    productKnowledgeScore,
  ].filter((score) => score != null);

  const overallScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce((sum, score) => sum + (score || 0), 0) * 10,
        ) / 10
      : 0;

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
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Standing Badge and Tier Name */}
            {standing && (
              <div
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    marginBottom: '0.5rem',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={getBadgeIconByTierLevel(
                      standing?.tierLevel,
                      standing?.tierName,
                    )}
                    alt={`${standing?.tierName || 'Not Available'} badge`}
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: '14px',
                    color: '#58595A',
                    marginBottom: '0.25rem',
                  }}
                >
                  {(translations as any).sessionStanding ||
                    translations.overallScore}
                </div>

                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#161618',
                  }}
                >
                  {standing?.tierName ||
                    (translations as any).notAvailable ||
                    'Not Available'}
                </div>
              </div>
            )}

            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                rowGap: '1rem',
                paddingLeft: '1rem',
              }}
            >
              {softSkillsScore != null && (
                <ScoreIndicator
                  score={softSkillsScore}
                  label={(translations as any).softSkills || 'Soft Skills'}
                  maxScore={30}
                  translations={translations.ratings}
                />
              )}
              {knowledgeSkillsScore != null && (
                <ScoreIndicator
                  score={knowledgeSkillsScore}
                  label={
                    (translations as any).knowledgeSkills || 'Knowledge Skills'
                  }
                  maxScore={30}
                  isSecondary
                  translations={translations.ratings}
                />
              )}
              {productKnowledgeScore != null && (
                <ScoreIndicator
                  score={productKnowledgeScore}
                  label={
                    (translations as any).productKnowledge ||
                    'Product Knowledge'
                  }
                  maxScore={40}
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
                key={`identifier-${identifier.label}-${index}`}
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
          {nextSteps && nextSteps.length > 0 && (
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
                    key={`step-${index}`}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default MSIGTravelEasyOverall;
