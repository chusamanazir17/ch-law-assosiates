import React, { useState } from 'react';

interface TrendDay {
  date: string;
  cashIn: number;
  cashOut: number;
}

interface CashFlowTrendChartProps {
  data?: TrendDay[];
  height?: number;
}

export const CashFlowTrendChart: React.FC<CashFlowTrendChartProps> = ({
  data = [],
  height = 140
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // No fabricated demo data: an empty dataset renders an honest empty state.
  if (data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-xs text-slate-400" style={{ height: `${height}px` }}>
        No data yet — figures will chart here from live records
      </div>
    );
  }

  // Scale from the live dataset, never a hardcoded ceiling.
  const maxVal = Math.max(...data.flatMap(d => [d.cashIn, d.cashOut]), 1);
  const chartHeight = height - 25;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 text-xs">
        <div className="text-[11px] font-bold text-[#0D2344]">Cash Flow Trend (Last 7 Days)</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-2 h-2 rounded-xs bg-[#10B981]"></span>
            <span>Cash In</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-2 h-2 rounded-xs bg-[#F43F5E]"></span>
            <span>Cash Out</span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between px-1 pb-5">
          {data.map((item, idx) => {
            const inH = (item.cashIn / maxVal) * chartHeight;
            const outH = (item.cashOut / maxVal) * chartHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.date}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer px-0.5"
              >
                {isHovered && (
                  <div className="absolute -top-10 z-30 bg-[#0D2344] dark:bg-[#060D1A] dark:border dark:border-slate-700 text-white text-[10px] py-1 px-1.5 rounded-sm shadow-md pointer-events-none whitespace-nowrap">
                    <div className="font-semibold text-center">{item.date}</div>
                    <div className="text-emerald-400">In: Rs. {item.cashIn.toLocaleString()}</div>
                    <div className="text-rose-400">Out: Rs. {item.cashOut.toLocaleString()}</div>
                  </div>
                )}

                <div className="flex items-end gap-1">
                  <div
                    style={{ height: `${inH}px` }}
                    className="w-2 md:w-2.5 bg-[#10B981] rounded-t-xs opacity-90 hover:opacity-100 transition-all"
                  ></div>
                  <div
                    style={{ height: `${outH}px` }}
                    className="w-2 md:w-2.5 bg-[#F43F5E] rounded-t-xs opacity-90 hover:opacity-100 transition-all"
                  ></div>
                </div>

                <span className="absolute -bottom-4 text-[9px] text-slate-500 font-medium truncate">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
