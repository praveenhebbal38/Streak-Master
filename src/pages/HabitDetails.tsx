import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHabits, getHabitLogs, getSession, checkInHabit } from '../services/dbService';
import { Habit, HabitLog } from '../types';
import Layout from '../components/Layout';
import Button from '../components/Button';
import CalendarHeatmap from '../components/CalendarHeatmap';
import StreakBadge from '../components/StreakBadge';
import { getTodayString } from '../utils';

const HabitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Question Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const session = getSession();
    if (!session || !id) {
      navigate('/login');
      return;
    }

    try {
      const habits = await getHabits(session.user.id);
      const found = habits.find(h => h.id === id);
      if (!found) {
        navigate('/');
        return;
      }
      setHabit(found);
      
      const habitLogs = await getHabitLogs(id);
      setLogs(habitLogs);

      // Check for active timer in localStorage
      checkActiveTimer(found);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const checkActiveTimer = (currentHabit: Habit) => {
      const storedStart = localStorage.getItem(`timer_start_${currentHabit.id}`);
      if (storedStart && currentHabit.duration) {
          const startTime = parseInt(storedStart, 10);
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - startTime) / 1000);
          const totalSeconds = currentHabit.duration * 60;
          const remaining = totalSeconds - elapsedSeconds;

          if (remaining <= 0) {
              setIsSessionComplete(true);
              setIsTimerActive(false);
              localStorage.removeItem(`timer_start_${currentHabit.id}`);
          } else {
              setTimeLeft(remaining);
              setIsTimerActive(true);
              startTicker();
          }
      }
  };

  const startTicker = () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
          setTimeLeft((prev) => {
              if (prev <= 1) {
                  clearInterval(timerInterval.current!);
                  setIsSessionComplete(true);
                  setIsTimerActive(false);
                  if (id) localStorage.removeItem(`timer_start_${id}`);
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
  };

  const handleStartTimer = () => {
      if (!habit || !habit.duration) return;
      
      const now = Date.now();
      localStorage.setItem(`timer_start_${habit.id}`, now.toString());
      setTimeLeft(habit.duration * 60);
      setIsTimerActive(true);
      setIsSessionComplete(false);
      startTicker();
  };

  const handleCancelTimer = () => {
      if (!habit) return;
      if (window.confirm('Stop the timer? Progress will be lost.')) {
        clearInterval(timerInterval.current!);
        setIsTimerActive(false);
        setTimeLeft(0);
        localStorage.removeItem(`timer_start_${habit.id}`);
      }
  };

  // Triggered when user clicks "Check In" or "Confirm & Check In" (after timer)
  const handleInitiateCheckIn = () => {
      if (!habit) return;

      // If habit has a specific question, show modal first
      if (habit.checkInQuestion) {
          setShowQuestionModal(true);
      } else {
          // No question, proceed directly
          processCheckIn();
      }
  };

  const processCheckIn = async (userAnswer?: string) => {
    if (!habit) return;
    setSubmitting(true);
    try {
      await checkInHabit(habit.id, userAnswer);
      // Clean up timer if it was used
      localStorage.removeItem(`timer_start_${habit.id}`);
      setIsSessionComplete(false);
      setShowQuestionModal(false);
      setAnswer('');
      await loadData();
    } catch (error) {
      alert('Already checked in today!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!answer.trim()) return;
      processCheckIn(answer);
  };

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Circular Progress Calculation
  const calculateProgress = () => {
    if (!habit?.duration) return 0;
    const totalSeconds = habit.duration * 60;
    if (totalSeconds === 0) return 0;
    return Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));
  };

  const radius = 80;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (calculateProgress() / 100) * circumference;

  if (loading || !habit) return (
    <Layout>
      <div className="text-center py-20 text-slate-500">Loading details...</div>
    </Layout>
  );

  const isCompletedToday = habit.lastCompletedDate === getTodayString();
  const hasDuration = habit.duration && habit.duration > 0;

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 pl-0 gap-2 flex items-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">
                        {habit.category}
                    </span>
                    <Link to={`/edit/${habit.id}`} className="text-xs text-brand-400 hover:text-brand-300 underline">
                        Edit Habit
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{habit.title}</h1>
                <div className="flex flex-col gap-1">
                    {hasDuration && (
                        <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {habit.duration} mins per session
                        </div>
                    )}
                    {habit.description && (
                        <p className="text-slate-400 mb-2 max-w-2xl text-sm italic border-l-2 border-slate-700 pl-3">
                            {habit.description}
                        </p>
                    )}
                    {habit.checkInQuestion && (
                        <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-1 mt-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Reflection required
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs mt-2">
                    Created on {new Date(habit.createdAt).toLocaleDateString()}
                </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
                 <StreakBadge count={habit.streakCount} size="lg" />
                 
                 {isCompletedToday ? (
                     <div className="w-full md:w-auto p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center gap-3 text-green-400 font-bold">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Habit Completed for Today!
                     </div>
                 ) : (
                    <div className="w-full md:w-auto">
                        {!hasDuration ? (
                            <Button onClick={handleInitiateCheckIn} variant='primary' className="w-full md:w-auto text-lg py-3 px-8 shadow-xl shadow-brand-500/20">
                                Check In Now
                            </Button>
                        ) : (
                            <div className="flex flex-col items-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 w-full md:w-[280px]">
                                {isTimerActive ? (
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-4">
                                            {/* Circular Progress SVG */}
                                            <svg
                                                height={radius * 2}
                                                width={radius * 2}
                                                className="transform -rotate-90"
                                            >
                                                <circle
                                                    stroke="#1e293b"
                                                    strokeWidth={stroke}
                                                    fill="transparent"
                                                    r={normalizedRadius}
                                                    cx={radius}
                                                    cy={radius}
                                                />
                                                <circle
                                                    stroke="#3b82f6"
                                                    strokeWidth={stroke}
                                                    strokeDasharray={circumference + ' ' + circumference}
                                                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
                                                    strokeLinecap="round"
                                                    fill="transparent"
                                                    r={normalizedRadius}
                                                    cx={radius}
                                                    cy={radius}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-3xl font-mono font-bold text-white tabular-nums">
                                                    {formatTime(timeLeft)}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Remaining</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-xs text-brand-400 font-bold uppercase tracking-wider animate-pulse mb-3">Session in Progress</div>
                                        
                                        <Button 
                                            onClick={handleCancelTimer}
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs py-1 h-auto w-full"
                                        >
                                            Cancel Session
                                        </Button>
                                    </div>
                                ) : isSessionComplete ? (
                                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 w-full">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-3 shadow-lg shadow-green-500/40 animate-bounce">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="text-white text-lg font-bold mb-1">Session Complete!</div>
                                        <div className="text-slate-400 text-xs mb-4">Great job sticking to it.</div>
                                        
                                        <Button onClick={handleInitiateCheckIn} variant="primary" className="w-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/30">
                                            Confirm & Check In
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center w-full">
                                        <div className="text-slate-400 text-sm mb-4 text-center">
                                            This habit requires a <strong>{habit.duration} minute</strong> session.
                                        </div>
                                        <Button onClick={handleStartTimer} variant="primary" className="w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 py-3">
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Start Timer
                                            </span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                 )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Column */}
        <div className="md:col-span-1 space-y-6">
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                        <span className="text-xl">🔥</span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Current Streak</h3>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{habit.streakCount}</div>
                <div className="text-sm text-slate-500">Consecutive days</div>
             </div>

             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-slate-700/50 rounded-lg">
                        <span className="text-xl">✅</span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Total Check-ins</h3>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{logs.length}</div>
                <div className="text-sm text-slate-500">Lifetime completions</div>
             </div>
        </div>

        {/* Calendar Column */}
        <div className="md:col-span-2">
            <CalendarHeatmap logs={logs} />
        </div>
      </div>

      {/* Check-in Question Modal */}
      {showQuestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
                  <h3 className="text-xl font-bold text-white mb-2">Check-in Reflection</h3>
                  <p className="text-slate-400 text-sm mb-6">Answer this simple question to complete your check-in.</p>
                  
                  <form onSubmit={handleQuestionSubmit}>
                      <div className="mb-6">
                          <label className="block text-brand-400 font-medium mb-2">
                              {habit.checkInQuestion}
                          </label>
                          <input 
                              type="text" 
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              placeholder="Type your answer here..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                              autoFocus
                              required
                          />
                      </div>
                      
                      <div className="flex gap-3">
                          <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={() => { setShowQuestionModal(false); setAnswer(''); }}
                              className="flex-1"
                          >
                              Cancel
                          </Button>
                          <Button 
                              type="submit" 
                              variant="primary" 
                              className="flex-1"
                              isLoading={submitting}
                              disabled={!answer.trim()}
                          >
                              Complete Check-in
                          </Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default HabitDetails;