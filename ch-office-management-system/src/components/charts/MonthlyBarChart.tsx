import React, { useState } from 'react';

interface MonthlyDataPoint {
  month: string;
  value: number;
}

interface MonthlyBarChartProps {
  data?: MonthlyDataPoint[];
  barColor?: string;
  height?: number;
  valuePrefix?: string;
  title?: string;
}

const defaultStampData: MonthlyDataPoint[] = [
  { month: 'Apr', value: 28000 },
  { month: 'May', value: 32000 },
  { month: 'Jun', value: 45000 },
  { month: 'Jul', value: 38000 },
  { month: 'Aug', value: 52000 },
  { month: 'Sep', value: 34300 }
];

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({
  data = defaultStampData,
  barColor = '#3B82F6',
  height = 140,
  valuePrefix = 'Rs. '
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map(d => d.value), 60000);
  const chartHeight = height - 25;

  return (
    <div className="w-full">
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Bars Container */}
        <div className="absolute inset-0 flex items-end justify-between gap-1.5 px-2 pb-5">
          {data.map((item, idx) => {
            const barH = (item.value / maxValue) * chartHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.month}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-8 z-30 bg-[#0D2344] dark:bg-[#060D1A] dark:border dark:border-slate-700 text-white text-[10px] py-0.5 px-1.5 rounded-sm shadow-sm pointer-events-none whitespace-nowrap">
                    {valuePrefix}{item.value.toLocaleString()}
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{
                    height: `${barH}px`,
                    backgroundColor: barColor
                  }}
                  className={`w-full max-w-[28px] rounded-t-sm transition-all duration-200 ${
                    isHovered ? 'brightness-110 shadow-xs' : 'opacity-90'
                  }`}
                ></div>

                {/* Month Label */}
                <span className="absolute -bottom-4 text-[10px] text-slate-500 font-medium">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
