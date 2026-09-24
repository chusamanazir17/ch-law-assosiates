import React, { useState } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface DonutChartProps {
  title?: string;
  centerPrimaryText: string;
  centerSecondaryText?: string;
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  centerPrimaryText,
  centerSecondaryText = 'Total Revenue',
  segments,
  size = 140,
  strokeWidth = 22,
  showLegend = true
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = segments.reduce((acc, curr) => acc + curr.value, 0);

  // SVG calculations for donut slices
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
      {/* Circle Canvas */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {segments.map((segment, idx) => {
            const percent = segment.percentage !== undefined ? segment.percentage : (segment.value / (total || 1)) * 100;
            const strokeDashoffset = circumference - (percent / 100) * circumference;
            const rotationOffset = (accumulatedPercent / 100) * 360;
            accumulatedPercent += percent;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${rotationOffset}deg)`,
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
          <span className="text-[12px] font-bold text-[#0D2344] dark:text-slate-100 leading-tight tracking-tight">
            {hoveredIdx !== null ? `${segments[hoveredIdx].percentage || Math.round((segments[hoveredIdx].value / total) * 100)}%` : centerPrimaryText}
          </span>
          <span className="text-[9px] text-[#60728D] dark:text-slate-400 font-medium leading-none mt-0.5 max-w-[70px] truncate">
            {hoveredIdx !== null ? segments[hoveredIdx].label : centerSecondaryText}
          </span>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex-1 w-full flex flex-col justify-center gap-1.5 text-[11px]">
          {segments.map((segment, idx) => {
            const percent = segment.percentage !== undefined ? segment.percentage : Math.round((segment.value / (total || 1)) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={segment.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between py-0.5 px-1 rounded-sm cursor-pointer transition-colors ${
                  isHovered ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: segment.color }}
                  ></span>
                  <span className="truncate">{segment.label}</span>
                </div>
                <span className="font-bold text-[#0D2344] dark:text-slate-100 shrink-0">{percent}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
