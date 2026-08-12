/**
 * Prudential PH Appointment Setting - Section PDF Component
 * Displays a section with progress bar and Why/Suggestion feedback
 * Layout matches PrudentialSalesTechnique pattern
 */
import React from 'react';
import type { BaseSalesTechniqueProps } from '../shared/types.js';

interface Section {
  title: string;
  score: number;
  maxScore: number;
  status: string;
  why: string;
  suggestion: string;
}

interface PrudentialPHAppointmentSettingSectionProps
  extends BaseSalesTechniqueProps {
  sectionTitle: string;
  sections: Section[];
}

const ProgressBar = ({ value, status }: { value: number; status: string }) => {
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
      {/* <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: statusColor,
          minWidth: 80,
        }}
      >
        {status}
      </span> */}
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

const PrudentialPHAppointmentSettingSection: React.FC<
  PrudentialPHAppointmentSettingSectionProps
> = ({ description, sectionTitle, sections, translations }) => {
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
            {sectionTitle}
          </h3>
          {description && (
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
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, minWidth: 0, padding: '0 40px 0 20px' }}>
          {sections.map((item, idx) => (
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
                  {item.title}
                </h4>
                <ProgressBar
                  value={item.score}
                  status={translateStatus(item.status)}
                />
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: '#58595A',
                  lineHeight: '1.6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      color: '#58595A',
                      marginRight: '0.25rem',
                      fontWeight: 700,
                    }}
                  >
                    •
                  </div>
                  <div style={{ lineHeight: '1.6' }}>
                    <span style={{ fontWeight: 600, color: '#58595A' }}>
                      {translations.why || 'Why'}:
                    </span>{' '}
                    {item.why}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      color: '#58595A',
                      marginRight: '0.25rem',
                      fontWeight: 700,
                    }}
                  >
                    •
                  </div>
                  <div style={{ lineHeight: '1.6' }}>
                    <span style={{ fontWeight: 600, color: '#58595A' }}>
                      {translations.suggestion || 'Suggestion'}:
                    </span>{' '}
                    {item.suggestion}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrudentialPHAppointmentSettingSection;
