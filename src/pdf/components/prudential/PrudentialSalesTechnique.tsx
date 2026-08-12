/**
 * Prudential assessment sales technique component
 * Shows sections with progress bars and completed/to-improve lists
 */
import React from 'react';
import { CorrectIcon, IncorrectIcon } from '../../utils/icon.js';
import type { BaseSalesTechniqueProps } from '../shared/types.js';

interface PrudentialSection {
  title: string;
  score: number;
  maxScore: number;
  status: string;
  isMandatory?: boolean;
  completed?: string[];
  toImprove?: string[];
}

interface PrudentialSalesTechniqueProps extends BaseSalesTechniqueProps {
  sections: PrudentialSection[];
}

const ProgressBar = ({
  value,
  status,
  isClientVerification = false,
}: {
  value: number;
  status: string;
  isClientVerification?: boolean;
}) => {
  if (isClientVerification) {
    const isComplete = status === 'Completed';
    const fillColor = isComplete ? '#16a34a' : '#ef4444';
    const statusColor = isComplete ? '#374151' : '#ef4444';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: statusColor,
            minWidth: 80,
          }}
        >
          {status}
        </span>
        <div
          style={{
            position: 'relative',
            height: 8,
            width: 80,
            borderRadius: 2,
            background: '#fee2e2',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${Math.max(0, Math.min(100, value))}%`,
              background: fillColor,
            }}
          />
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#6b7280',
            minWidth: 32,
          }}
        >
          {value}%
        </span>
      </div>
    );
  }

  // Segmented bar logic
  const levels = [
    { name: 'Beginner', start: 0, end: 34 },
    { name: 'Intermediate', start: 34, end: 67 },
    { name: 'Completed', start: 67, end: 100 },
  ];

  let color = '#d1d5db';
  let statusColor = '#6b7280';

  if (status === 'Beginner') {
    color = '#f59e42';
    statusColor = '#374151';
  } else if (status === 'Intermediate') {
    color = '#2563eb';
    statusColor = '#374151';
  } else if (status === 'Expert' || status === 'Completed') {
    color = '#16a34a';
    statusColor = '#374151';
  }

  const getFillPercent = (start: number, end: number) => {
    if (value <= start) return 0;
    if (value >= end) return 100;
    return ((value - start) / (end - start)) * 100;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: statusColor,
          minWidth: 80,
        }}
      >
        {status}
      </span>
      <div style={{ display: 'flex', height: 8, width: 80, gap: 2 }}>
        {levels.map((level, index) => {
          const fillPercent = getFillPercent(level.start, level.end);
          return (
            <div
              key={index}
              style={{
                position: 'relative',
                height: '100%',
                flex: 1,
                overflow: 'hidden',
                background: '#e5e7eb',
                borderTopLeftRadius: index === 0 ? 2 : 0,
                borderBottomLeftRadius: index === 0 ? 2 : 0,
                borderTopRightRadius: index === levels.length - 1 ? 2 : 0,
                borderBottomRightRadius: index === levels.length - 1 ? 2 : 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${fillPercent}%`,
                  background: color,
                }}
              />
            </div>
          );
        })}
      </div>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#6b7280',
          minWidth: 32,
        }}
      >
        {value}%
      </span>
    </div>
  );
};

const PrudentialSalesTechnique: React.FC<PrudentialSalesTechniqueProps> = ({
  description,
  sections,
  translations,
}) => {
  // Helper function to translate status labels
  const translateStatus = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return translations.completed || status;
    if (statusLower === 'incomplete') return translations.incomplete || status;
    if (statusLower === 'expert') return translations.expert || status;
    if (statusLower === 'intermediate')
      return translations.intermediate || status;
    if (statusLower === 'beginner') return translations.beginner || status;
    return status;
  };

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
          {sections.map((item, idx) => {
            const isClientVerification = item.title === 'Client Verification';
            const isIncomplete =
              isClientVerification && item.status === 'Incomplete';

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
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
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
                      {item.title}
                    </h4>
                    {item.isMandatory && (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '12px',
                          color: '#E60D00',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '16px',
                          backgroundColor: '#FFD9D6',
                        }}
                      >
                        {(translations as any).mandatory || 'Mandatory'}
                      </span>
                    )}
                  </div>
                  <ProgressBar
                    value={item.score}
                    status={translateStatus(item.status)}
                    isClientVerification={isClientVerification}
                  />
                </div>

                <div
                  style={{
                    fontSize: '14px',
                    color: '#58595A',
                    lineHeight: '1.6',
                  }}
                >
                  {/* To improve items */}
                  {item.toImprove && item.toImprove.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#161618',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {(translations as any).toImprove || 'To Improve'}
                      </div>
                      {item.toImprove.map((improveItem, impIdx) => (
                        <div
                          key={impIdx}
                          style={{
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ flexShrink: 0, marginTop: '2px' }}>
                            <IncorrectIcon />
                          </div>
                          <div style={{ lineHeight: '1.6' }}>{improveItem}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Completed items */}
                  {item.completed && item.completed.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#161618',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {(translations as any).completed || 'Completed'}
                      </div>
                      {item.completed.map((completedItem, compIdx) => (
                        <div
                          key={compIdx}
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
                          <div style={{ lineHeight: '1.6' }}>
                            {completedItem}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PrudentialSalesTechnique;
