import React, { useMemo } from 'react';
import { HabitLog } from '../types';
import { getDaysInMonth, dateToIsoString } from '../utils';

interface CalendarHeatmapProps {
  logs: HabitLog[];
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ logs }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentMonth, currentYear]);

  // Create a map for quick lookup
  const logsMap = useMemo(() => {
    const map = new Set(logs.map(l => l.date));
    return map;
  }, [logs]);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">
        {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h3>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs text-slate-500 font-medium uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for offset */}
        {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {daysInMonth.map(date => {
          const dateStr = dateToIsoString(date);
          const isCompleted = logsMap.has(dateStr);
          const isToday = dateStr === dateToIsoString(today);
          const isFuture = date > today;

          let bgClass = "bg-slate-900 border-slate-800";
          if (isCompleted) bgClass = "bg-green-500 border-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]";
          else if (isToday) bgClass = "bg-slate-700 border-slate-600 ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-800";
          
          return (
            <div 
              key={dateStr}
              className={`aspect-square rounded-md border flex items-center justify-center text-sm font-medium transition-all duration-300 relative group ${bgClass} ${isFuture ? 'opacity-30' : ''}`}
            >
              <span className={isCompleted ? 'text-white font-bold' : 'text-slate-400'}>
                {date.getDate()}
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 border border-slate-700">
                {dateStr} - {isCompleted ? 'Completed' : 'Missed'}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex items-center justify-end gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-900 border border-slate-800 rounded"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeatmap;