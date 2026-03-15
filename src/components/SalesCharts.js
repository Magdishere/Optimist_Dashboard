import React, { useState } from 'react';
import { useAdminTheme } from '../theme/ThemeContext';
import { TrendingUp, Calendar } from 'lucide-react';

const BarChart = ({ data, maxVal, color, height = 300, isMonthly = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const padding = { top: 40, right: 20, bottom: 50, left: 60 };
  const chartWidth = 1000;
  const chartHeight = height;
  
  const barWidth = (chartWidth - padding.left - padding.right) / data.length;
  const gap = barWidth * 0.2; // 20% gap between bars

  return (
    <div className="relative w-full group/chart">
      <svg 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`barGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid Lines & Y-Axis Labels */}
        {[0, 1, 2, 3, 4].map((step) => {
          const val = Math.round((maxVal / 4) * step);
          const y = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - step / 4);
          return (
            <g key={step}>
              <line 
                x1={padding.left} 
                y1={y} 
                x2={chartWidth - padding.right} 
                y2={y} 
                stroke="currentColor" 
                strokeDasharray="4 4" 
                className="opacity-[0.05]"
              />
              <text 
                x={padding.left - 15} 
                y={y} 
                textAnchor="end" 
                alignmentBaseline="middle" 
                className="text-[24px] font-black opacity-30 fill-current"
              >
                ${val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padding.left + (i * barWidth) + (gap / 2);
          const currentBarWidth = barWidth - gap;
          const barHeight = (d.sales / maxVal) * (chartHeight - padding.top - padding.bottom);
          const y = chartHeight - padding.bottom - barHeight;

          return (
            <g 
              key={i} 
              onMouseEnter={() => setHoveredIndex(i)} 
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Background Bar Track (Subtle) */}
              <rect 
                x={x} 
                y={padding.top} 
                width={currentBarWidth} 
                height={chartHeight - padding.top - padding.bottom} 
                rx={isMonthly ? 12 : 4}
                className="opacity-[0.03] fill-current"
              />

              {/* Actual Bar */}
              <rect 
                x={x} 
                y={y} 
                width={currentBarWidth} 
                height={barHeight} 
                rx={isMonthly ? 12 : 4}
                fill={hoveredIndex === i ? color : `url(#barGradient-${color})`}
                className="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/chart:opacity-50 hover:!opacity-100"
                style={{ filter: hoveredIndex === i ? 'brightness(1.2)' : 'none' }}
              />

              {/* X-Axis Labels */}
              {(!isMonthly && (parseInt(d.name) % 5 === 0 || d.name === "1")) || isMonthly ? (
                <text 
                  x={x + currentBarWidth / 2} 
                  y={chartHeight - 10} 
                  textAnchor="middle" 
                  className="text-[22px] font-black opacity-30 fill-current uppercase"
                >
                  {d.name}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Dynamic Tooltip */}
      {hoveredIndex !== null && (
        <div 
          className="absolute z-50 pointer-events-none bg-white text-gray-900 px-4 py-2 rounded-xl shadow-2xl border border-gray-100 font-black text-xs transition-all duration-200 flex flex-col items-center"
          style={{ 
            left: `${((padding.left + (hoveredIndex * barWidth) + barWidth/2) / chartWidth) * 100}%`,
            top: `${((chartHeight - padding.bottom - (data[hoveredIndex].sales / maxVal) * (chartHeight - padding.top - padding.bottom)) / chartHeight) * 100}%`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <span className="opacity-40 uppercase text-[9px] mb-0.5">
            {isMonthly ? data[hoveredIndex].name : `Day ${data[hoveredIndex].name}`}
          </span>
          <span className="text-sm" style={{ color: color }}>${data[hoveredIndex].sales.toLocaleString()}</span>
          <div className="w-2 h-2 bg-white rotate-45 absolute -bottom-1 border-b border-r border-gray-100"></div>
        </div>
      )}
    </div>
  );
};

const SalesCharts = ({ monthlyData, dailyData }) => {
  const { theme } = useAdminTheme();

  const getRoundedMax = (data) => {
    const maxVal = Math.max(...data.map(d => d.sales), 10);
    return Math.ceil(maxVal / 50) * 50;
  };

  const maxMonthly = getRoundedMax(monthlyData);
  const maxDaily = getRoundedMax(dailyData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
      {/* Monthly Sales */}
      <div 
        className="p-10 rounded-[40px] shadow-2xl border transition-all duration-500 hover:shadow-primary/5 group"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-opacity-10" style={{ backgroundColor: theme.primary }}>
              <TrendingUp size={24} style={{ color: theme.primary }} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: theme.text }}>Monthly Revenue</h2>
              <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-0.5">Yearly Performance</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black opacity-30 uppercase">Total YTD</p>
            <p className="text-xl font-black" style={{ color: theme.primary }}>
              ${monthlyData.reduce((acc, curr) => acc + curr.sales, 0).toLocaleString()}
            </p>
          </div>
        </div>
        
        <BarChart data={monthlyData} maxVal={maxMonthly} color={theme.primary} isMonthly={true} />
      </div>

      {/* Daily Sales */}
      <div 
        className="p-10 rounded-[40px] shadow-2xl border transition-all duration-500 hover:shadow-primary/5 group"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-opacity-10" style={{ backgroundColor: theme.primary }}>
              <Calendar size={24} style={{ color: theme.primary }} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: theme.text }}>Daily Sales</h2>
              <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-0.5">Current Month</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black opacity-30 uppercase">Avg/Day</p>
            <p className="text-xl font-black" style={{ color: theme.primary }}>
              ${(dailyData.reduce((acc, curr) => acc + curr.sales, 0) / dailyData.length).toFixed(0)}
            </p>
          </div>
        </div>

        <BarChart data={dailyData} maxVal={maxDaily} color={theme.primary} />
      </div>
    </div>
  );
};

export default SalesCharts;
