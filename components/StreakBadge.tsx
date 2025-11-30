import React from 'react';

interface StreakBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ count, size = 'md' }) => {
  let colorClass = "text-slate-400 bg-slate-800 border-slate-700"; // 0-2
  let icon = "🌱";
  let label = "Starter";

  if (count >= 3 && count < 7) {
    colorClass = "text-blue-400 bg-blue-900/30 border-blue-800";
    icon = "🔥";
    label = "Heating Up";
  } else if (count >= 7 && count < 30) {
    colorClass = "text-orange-400 bg-orange-900/30 border-orange-800";
    icon = "⚡";
    label = "Consistent";
  } else if (count >= 30) {
    colorClass = "text-purple-400 bg-purple-900/30 border-purple-800";
    icon = "👑";
    label = "Legend";
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border ${colorClass} ${sizeClasses[size]} font-semibold transition-all hover:scale-105 cursor-default`}>
      <span>{icon}</span>
      <span>{count} Day Streak</span>
      {size !== 'sm' && <span className="opacity-50 border-l border-current pl-2 ml-1">{label}</span>}
    </div>
  );
};

export default StreakBadge;