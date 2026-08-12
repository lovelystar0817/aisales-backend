/**
 * Reusable next steps list component
 */
import React from 'react';

interface NextStepsListProps {
  title: string;
  steps: string[];
}

export const NextStepsList: React.FC<NextStepsListProps> = ({
  title,
  steps,
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
      <div>
        {steps.map((step, index) => (
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
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
