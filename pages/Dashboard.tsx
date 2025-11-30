import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHabits, getSession, checkInHabit, deleteHabit } from '../services/dbService';
import { Habit } from '../types';
import HabitCard from '../components/HabitCard';
import Layout from '../components/Layout';
import Button from '../components/Button';

const Dashboard: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    const session = getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUser(session.user);
    try {
      const data = await getHabits(session.user.id);
      // Sort: Not completed today first, then by streak high to low
      const sorted = data.sort((a, b) => {
          if (a.lastCompletedDate !== b.lastCompletedDate) {
              // nulls (never done) or old dates first
              return (a.lastCompletedDate || '') < (b.lastCompletedDate || '') ? -1 : 1; 
          }
          return b.streakCount - a.streakCount;
      });
      setHabits(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckIn = async (id: string) => {
    try {
      await checkInHabit(id);
      // Optimistic update or reload
      await loadData();
    } catch (error) {
      console.error(error);
      alert('Failed to check in');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 text-slate-500">
           <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hello, {user?.name} 👋</h1>
          <p className="text-slate-400">You have {habits.length} active habits. Keep the streaks alive!</p>
        </div>
        <Link to="/create">
            <Button>+ New Habit</Button>
        </Link>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-800 border-dashed">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-xl font-semibold text-white mb-2">No habits yet</h2>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">Start small. Create your first habit today and begin building your streak.</p>
          <Link to="/create">
            <Button variant="secondary">Create First Habit</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onCheckIn={handleCheckIn}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;