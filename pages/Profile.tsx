import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats, getSession } from '../services/dbService';
import Layout from '../components/Layout';
import StreakBadge from '../components/StreakBadge';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ 
      totalHabits: 0, 
      totalCheckins: 0, 
      bestStreak: 0, 
      totalActiveStreaks: 0,
      weeklyActivity: [] as { day: string, fullDate: string, count: number }[]
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
        const session = getSession();
        if (!session) {
            navigate('/login');
            return;
        }
        setUser(session.user);
        try {
            const data = await getUserStats(session.user.id);
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    loadProfile();
  }, [navigate]);

  if (loading) {
     return <Layout><div className="text-center p-10 text-slate-500">Loading Profile...</div></Layout>
  }

  // Earned badges based on best streak
  const hasStarter = stats.bestStreak >= 3;
  const hasConsistent = stats.bestStreak >= 7;
  const hasLegend = stats.bestStreak >= 30;
  const hasPro = stats.bestStreak >= 60;

  // Max value for chart scaling
  const maxChartValue = Math.max(...stats.weeklyActivity.map(d => d.count), 5);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile & Analytics</h1>
        <p className="text-slate-400">Track your overall progress and achievements.</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-brand-500/20">
            {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <p className="text-slate-500 text-xs mt-1">Member since {new Date(user?.createdAt).getFullYear()}</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Habits" value={stats.totalHabits} />
        <StatCard label="Total Check-ins" value={stats.totalCheckins} />
        <StatCard label="Active Streaks" value={stats.totalActiveStreaks} />
        <StatCard label="Best Streak" value={`${stats.bestStreak} days`} />
      </div>

      {/* Weekly Performance Chart */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 shadow-sm">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Weekly Performance</h3>
        
        <div className="flex items-end justify-between h-40 gap-2 px-2">
            {stats.weeklyActivity.map((day) => {
                const heightPercentage = Math.max((day.count / maxChartValue) * 100, 4); // Min height 4%
                return (
                    <div key={day.fullDate} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full flex items-end justify-center h-full">
                            {/* Tooltip */}
                            <div className="absolute bottom-[calc(100%+8px)] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-10 pointer-events-none">
                                {day.count} check-ins on {day.day}
                            </div>
                            
                            {/* Bar */}
                            <div 
                                style={{ height: `${heightPercentage}%` }} 
                                className={`w-full max-w-[32px] rounded-t-sm transition-all duration-500 ease-out ${day.count > 0 ? 'bg-brand-500 group-hover:bg-brand-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-slate-700/30'}`}
                            ></div>
                        </div>
                        <div className="mt-3 text-xs text-slate-500 font-medium">{day.day}</div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Badges */}
      <h3 className="text-lg font-bold text-white mb-4">Achievements Gallery</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <AchievementCard 
            title="Starter" 
            desc="Reach a 3 day streak" 
            icon="🌱" 
            unlocked={hasStarter} 
         />
         <AchievementCard 
            title="Consistent" 
            desc="Reach a 7 day streak" 
            icon="⚡" 
            unlocked={hasConsistent} 
         />
         <AchievementCard 
            title="Legend" 
            desc="Reach a 30 day streak" 
            icon="👑" 
            unlocked={hasLegend} 
         />
         <AchievementCard 
            title="Pro Master" 
            desc="Reach a 60 day streak" 
            icon="🚀" 
            unlocked={hasPro} 
         />
      </div>

    </Layout>
  );
};

const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm hover:border-slate-600 transition-colors">
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
    </div>
);

const AchievementCard = ({ title, desc, icon, unlocked }: any) => (
    <div className={`p-5 rounded-xl border flex flex-col items-center text-center transition-all duration-300 ${unlocked ? 'bg-gradient-to-br from-brand-900/20 to-slate-900 border-brand-500/30 shadow-lg shadow-brand-500/5' : 'bg-slate-800/50 border-slate-800 opacity-50 grayscale'}`}>
        <div className="text-4xl mb-3 drop-shadow-md">{icon}</div>
        <div className={`font-bold mb-1 ${unlocked ? 'text-white' : 'text-slate-500'}`}>{title}</div>
        <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
        {unlocked && <div className="mt-3 text-[10px] text-brand-400 font-bold uppercase tracking-widest bg-brand-900/30 px-2 py-0.5 rounded border border-brand-500/20">Unlocked</div>}
    </div>
);

export default Profile;