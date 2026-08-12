/**
 * Great Eastern Section Component
 * Renders individual assessment sections with feedback, strengths, improvements, and criteria breakdown
 */
import React from 'react';

interface Criterion {
  title: string;
  score: number;
  maxScore: number;
  suggestion: string;
  why: string;
}

interface GreatEasternSectionProps {
  title: string;
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  criteria?: Criterion[];
  translations: any;
}

const GreatEasternSection: React.FC<GreatEasternSectionProps> = ({
  title,
  score,
  maxScore,
  criteria,
}) => {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header with title and score */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: '#1a1a1a',
          }}
        >
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            {percentage}
          </span>
          <span
            style={{
              fontSize: '14px',
              color: '#5f6368',
            }}
          >
            / 100
          </span>
          {/* Progress bar inline */}
          <div
            style={{
              width: '60px',
              height: '6px',
              backgroundColor: '#e8eaed',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: '#1a73e8',
                borderRadius: '3px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Criteria breakdown */}
      {criteria && criteria.length > 0 && (
        <div
          style={{
            marginBottom: '12px',
          }}
        >
          {criteria.map((criterion: Criterion, idx: number) => {
            // Calculate scaled score: each criterion gets an equal share of 100
            // e.g., 4 criteria = 25 max each, 3 criteria = 33 max each
            const scaledMax = Math.round(100 / criteria.length);
            const scaledScore =
              criterion.maxScore > 0
                ? Math.round((criterion.score / criterion.maxScore) * scaledMax)
                : 0;

            return (
              <div
                key={idx}
                style={{
                  marginBottom: idx < criteria.length - 1 ? '16px' : '0',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e8eaed',
                }}
              >
                {/* Criterion header with score */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                    }}
                  >
                    {criterion.title}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#5f6368',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                      {scaledScore}
                    </span>{' '}
                    / {scaledMax}
                  </span>
                </div>
                {/* Why and Suggestion as bullet points */}
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '12px',
                    color: '#3c4043',
                    lineHeight: 1.6,
                  }}
                >
                  {criterion.why && (
                    <li style={{ marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>Why:</span>{' '}
                      {criterion.why}
                    </li>
                  )}
                  {criterion.suggestion && (
                    <li>
                      <span style={{ fontWeight: 600 }}>Suggestion:</span>{' '}
                      {criterion.suggestion}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GreatEasternSection;
