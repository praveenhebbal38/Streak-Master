import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateHabit, getHabits, getSession } from '../services/dbService';
import { Habit, HabitCategory } from '../types';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';

const EditHabit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>(HabitCategory.PERSONAL);
  const [duration, setDuration] = useState('');
  const [reminder, setReminder] = useState('');
  const [checkInQuestion, setCheckInQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHabit = async () => {
        const session = getSession();
        if (!session || !id) {
            navigate('/login');
            return;
        }
        try {
            const habits = await getHabits(session.user.id);
            const found = habits.find(h => h.id === id);
            if (found) {
                setTitle(found.title);
                setDescription(found.description || '');
                setCategory(found.category);
                setDuration(found.duration ? found.duration.toString() : '');
                setReminder(found.reminderTime || '');
                setCheckInQuestion(found.checkInQuestion || '');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    loadHabit();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!id) return;
    setSaving(true);

    try {
      await updateHabit(id, { 
          title, 
          category, 
          description, 
          duration: duration ? parseInt(duration, 10) : 0,
          reminderTime: reminder,
          checkInQuestion
        });
      navigate(`/habit/${id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to update habit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <Layout>
            <div className="text-center py-10 text-slate-500">Loading...</div>
        </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Habit</h1>
        
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
          <form onSubmit={handleSubmit}>
            <Input 
              label="Habit Title"
              placeholder="e.g. Read for 20 minutes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={40}
            />
            
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm font-medium text-slate-300 pl-1">Description / Notes</label>
              <textarea 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors h-24 resize-none"
                placeholder="Add some motivation or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input 
                    label="Minimum Duration (minutes)"
                    type="number"
                    min="0"
                    placeholder="e.g. 30 (0 for none)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                <Input 
                    label="Daily Reminder Time"
                    type="time"
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                />
            </div>

            <Input 
                label="Check-in Question (Optional)"
                placeholder="e.g. How many pages did you read?"
                value={checkInQuestion}
                onChange={(e) => setCheckInQuestion(e.target.value)}
                className="border-amber-500/30 focus:border-amber-500 focus:ring-amber-500"
            />
            <p className="text-xs text-slate-500 -mt-3 mb-6 ml-1">If set, you must answer this before checking in.</p>

            <div className="mb-6">
              <label className="text-sm font-medium text-slate-300 pl-1 mb-2 block">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(HabitCategory).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      category === cat 
                        ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <Button type="button" variant="ghost" onClick={() => navigate(`/habit/${id}`)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" isLoading={saving} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditHabit;