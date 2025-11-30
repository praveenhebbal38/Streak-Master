import React, { useState } from 'react';
import { Habit, HabitCategory } from '../types';
import StreakBadge from './StreakBadge';
import { getTodayString } from '../utils';
import Button from './Button';
import { Link, useNavigate } from 'react-router-dom';

interface HabitCardProps {
  habit: Habit;
  onCheckIn: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onCheckIn, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isCompletedToday = habit.lastCompletedDate === getTodayString();
  // Check if habit has a mandatory duration or a question
  const hasTimer = (habit.duration || 0) > 0;
  const hasQuestion = !!habit.checkInQuestion;
  const requiresDetails = hasTimer || hasQuestion;

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if clicking checkin
    if (loading || isCompletedToday) return;

    // CRITICAL UPDATE: If habit has a timer or question, redirect to details page
    if (requiresDetails) {
        navigate(`/habit/${habit.id}`);
        return;
    }

    setLoading(true);
    await onCheckIn(habit.id);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this habit?')) {
        await onDelete(habit.id);
    }
  }

  const categoryColors: Record<HabitCategory, string> = {
    [HabitCategory.HEALTH]: 'text-green-400 bg-green-900/20 border-green-900',
    [HabitCategory.STUDY]: 'text-blue-400 bg-blue-900/20 border-blue-900',
    [HabitCategory.PERSONAL]: 'text-pink-400 bg-pink-900/20 border-pink-900',
    [HabitCategory.WORK]: 'text-amber-400 bg-amber-900/20 border-amber-900',
    [HabitCategory.FITNESS]: 'text-cyan-400 bg-cyan-900/20 border-cyan-900',
  };

  const renderFires = () => {
    if (habit.streakCount === 0) return <span className="text-slate-600 text-[10px] italic">Start streak!</span>;
    const count = Math.min(habit.streakCount, 3);
    return (
      <div className="flex items-center gap-0.5" title={`${habit.streakCount} day streak`}>
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="text-sm filter drop-shadow-md animate-pulse">🔥</span>
        ))}
        {habit.streakCount > 3 && <span className="text-[10px] text-brand-400 font-bold ml-1">+{habit.streakCount - 3}</span>}
      </div>
    );
  };

  return (
    <Link to={`/habit/${habit.id}`} className="block h-full">
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-brand-500 transition-all duration-200 group relative overflow-hidden h-full flex flex-col shadow-sm hover:shadow-brand-500/10">
        
        {/* Background glow for completed habits */}
        {isCompletedToday && (
           <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>
        )}

        <div className="flex justify-between items-start mb-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border inline-block ${categoryColors[habit.category]}`}>
                {habit.category}
                </span>
                {hasTimer && (
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600 flex items-center gap-1 font-mono">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {habit.duration}m
                    </span>
                )}
                {hasQuestion && !hasTimer && (
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600 flex items-center gap-1 font-mono">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Q
                    </span>
                )}
            </div>
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-brand-400 transition-colors">
              {habit.title}
            </h3>
          </div>
          <button 
            onClick={handleDelete}
            className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/50 rounded"
            title="Delete Habit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Streak Info */}
        <div className="mb-4 flex items-center gap-2">
             {renderFires()}
             {habit.streakCount > 0 && <span className="text-xs text-slate-500 font-medium">{habit.streakCount} day streak</span>}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 relative z-10 pt-2 border-t border-slate-700/50">
          <Button 
            onClick={handleAction}
            disabled={isCompletedToday}
            variant={isCompletedToday ? 'secondary' : 'primary'}
            isLoading={loading}
            className={`w-full text-sm py-2 ${isCompletedToday ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default' : requiresDetails ? 'bg-blue-600 hover:bg-blue-500' : ''}`}
          >
            {isCompletedToday ? (
              <span className="flex items-center gap-1.5 justify-center font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Done
              </span>
            ) : hasTimer ? (
                <span className="flex items-center gap-1.5 justify-center font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Start Timer
                </span>
            ) : hasQuestion ? (
                <span className="flex items-center gap-1.5 justify-center font-medium">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Check In
                </span>
            ) : (
                <span className="flex items-center gap-1.5 justify-center font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Check In
                </span>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default HabitCard;