/**
 * Reusable summary section component
 */
import React from 'react';

interface SummarySectionProps {
  title: string;
  content: string;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  title,
  content,
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#161618',
          marginBottom: '0.5rem',
        }}
      >
        {title}
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
        {content}
      </div>
    </div>
  );
};
