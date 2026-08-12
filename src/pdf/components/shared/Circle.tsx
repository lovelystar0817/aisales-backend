import React from 'react';

interface CircleProps {
  size?: number;
  strokeWidth?: number;
  value: number;
  maxValue?: number;
  color: string;
  bgColor: string;
}

export const Circle = ({
  size = 86,
  strokeWidth = 6,
  value,
  maxValue = 100,
  color,
}: CircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / maxValue);

  return (
    <svg
      width={size}
      height={size}
      style={{
        transform: 'rotate(-90deg)', // start at 12 o'clock
        transformOrigin: '50% 50%', // center of the circle
      }}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#EFEFEF"
        strokeWidth={strokeWidth}
        fill="transparent"
      />

      {/* Progress indicator */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="transparent"
      />
    </svg>
  );
};
