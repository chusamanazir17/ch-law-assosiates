import React, { useState } from 'react';

interface BarDataPoint {
  label: string;
  income: number;
  expense: number;
}

interface IncomeExpenseBarChartProps {
  data?: BarDataPoint[];
  height?: number;
}

const defaultData: BarDataPoint[] = [
  { label: '1 Sep', income: 28000, expense: 8000 },
  { label: '4 Sep', income: 32000, expense: 12000 },
  { label: '7 Sep', income: 22000, expense: 9500 },
  { label: '10 Sep', income: 38000, expense: 18000 },
  { label: '13 Sep', income: 29000, expense: 11000 },
  { label: '16 Sep', income: 39500, expense: 14000 },
  { label: '19 Sep', income: 34000, expense: 16500 },
  { label: '22 Sep', income: 42500, expense: 8200 }
];

export const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  data = defaultData,
  height = 200
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = 50000;
  const chartHeight = height - 40;

  return (
    <div className="w-full">
      {/* Legend & Controls */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="font-bold text-[#0D2344] text-[13px]">Income vs Expenses</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]"></span>
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#F43F5E]"></span>
            <span>Expenses</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
          {[50, 40, 30, 20, 10, 0].map(val => (
            <div key={val} className="w-full flex items-center">
              <span className="w-7 text-right pr-1 shrink-0 font-medium">{val > 0 ? `${val}K` : '0K'}</span>
              <div className="w-full border-b border-slate-100 h-0"></div>
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="absolute inset-0 left-8 flex items-end justify-between px-2 pt-2 pb-6">
          {data.map((item, idx) => {
            const incHeight = (item.income / maxVal) * chartHeight;
            const expHeight = (item.expense / maxVal) * chartHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group px-0.5"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-30 bg-[#0D2344] dark:bg-[#060D1A] dark:border dark:border-slate-700 text-white text-[11px] py-1 px-2 rounded-md shadow-md pointer-events-none whitespace-nowrap">
                    <div className="font-semibold text-center mb-0.5">{item.label}</div>
                    <div className="text-emerald-400">In: Rs. {item.income.toLocaleString()}</div>
                    <div className="text-rose-400">Out: Rs. {item.expense.toLocaleString()}</div>
                  </div>
                )}

                <div className="flex items-end gap-1">
                  {/* Income Bar */}
                  <div
                    style={{ height: `${incHeight}px` }}
                    className={`w-2.5 md:w-3 bg-[#10B981] rounded-t-sm transition-all duration-200 ${
                      isHovered ? 'brightness-110 shadow-xs' : 'opacity-90'
                    }`}
                  ></div>
                  {/* Expense Bar */}
                  <div
                    style={{ height: `${expHeight}px` }}
                    className={`w-2.5 md:w-3 bg-[#F43F5E] rounded-t-sm transition-all duration-200 ${
                      isHovered ? 'brightness-110 shadow-xs' : 'opacity-90'
                    }`}
                  ></div>
                </div>

                {/* X Axis Label */}
                <span className="absolute -bottom-5 text-[10px] text-slate-500 font-medium truncate max-w-[40px] text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
