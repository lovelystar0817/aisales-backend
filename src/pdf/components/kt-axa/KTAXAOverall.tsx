/**
 * KT AXA Overall Component
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

interface KTAXAOverallProps {
  softSkillsScore?: number;
  knowledgeSkillsScore?: number;
  productKnowledgeScore?: number;
  assessmentIdentifiers: AssessmentIdentifier[];
  summary: string;
  nextSteps: string[];
  translations: BaseTranslations;
}

const KTAXAOverall: React.FC<KTAXAOverallProps> = ({
  softSkillsScore,
  knowledgeSkillsScore,
  productKnowledgeScore,
  assessmentIdentifiers,
  summary,
  nextSteps,
  translations,
}) => {
  // Calculate overall score as average of all applicable scores
  const validScores = [
    softSkillsScore,
    knowledgeSkillsScore,
    productKnowledgeScore,
  ].filter((score) => score != null);

  const overallScore = Math.round(
    validScores.length > 0
      ? validScores.reduce((sum, score) => sum + (score || 0), 0) /
          validScores.length
      : 0,
  );

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
            paddingLeft: '1rem',
          }}
        >
          <OverallScoreCircle
            overallScore={overallScore}
            salesTechniqueScore={softSkillsScore}
            productKnowledgeScore={knowledgeSkillsScore}
            translations={translations.ratings}
          />

          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '16px',
                lineHeight: '1.4',
                letterSpacing: '-0.006em',
                color: '#58595A',
                margin: 0,
              }}
            >
              {translations.overallScore}
            </p>

            <h3
              style={{
                margin: '0.5rem 0',
                fontSize: '18px',
                fontWeight: 700,
                color: '#161618',
              }}
            >
              {getScoreRating(overallScore, false, translations.ratings).rating}
            </h3>

            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                rowGap: '1rem',
              }}
            >
              {softSkillsScore != null && (
                <ScoreIndicator
                  score={softSkillsScore}
                  label={(translations as any).softSkills || 'Soft Skills'}
                  translations={translations.ratings}
                />
              )}
              {knowledgeSkillsScore != null && (
                <ScoreIndicator
                  score={knowledgeSkillsScore}
                  label={
                    (translations as any).knowledgeSkills || 'Knowledge Skills'
                  }
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
                  isSecondary
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

export default KTAXAOverall;
