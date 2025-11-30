import { User, Habit, HabitLog, HabitCategory, AuthResponse } from '../types';
import { getTodayString, getYesterdayString } from '../utils';

// Keys for LocalStorage
const USERS_KEY = 'streakmaster_users';
const HABITS_KEY = 'streakmaster_habits';
const LOGS_KEY = 'streakmaster_logs';
const SESSION_KEY = 'streakmaster_session';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Services ---

export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  await delay(500);
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto login
  const token = `fake-jwt-token-${newUser.id}`;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user: newUser, token }));
  
  // Seed demo data if this is the demo user
  if (email === 'demo@example.com') {
      await seedDemoData(newUser.id);
  }
  
  return { user: newUser, token };
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  await delay(500);
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find(u => u.email === email);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // In a real app, we would hash and check password. Here we mock it.
  const token = `fake-jwt-token-${user.id}`;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));

  return { user, token };
};

export const logoutUser = async () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): AuthResponse | null => {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  return sessionStr ? JSON.parse(sessionStr) : null;
};

// --- Seed Data Helper ---
const seedDemoData = async (userId: string) => {
    // Check if habits already exist for this user to avoid dupes on re-login
    const existingHabits = await getHabits(userId);
    if (existingHabits.length > 0) return;

    const demoHabits = [
        { title: "Morning Jog", category: HabitCategory.FITNESS, streak: 5, description: "Run 5km every morning before work.", duration: 30, question: "How many km did you run?" },
        { title: "Read 30 Mins", category: HabitCategory.STUDY, streak: 12, description: "Read a non-fiction book.", duration: 30, question: "What did you learn today?" },
        { title: "Drink 3L Water", category: HabitCategory.HEALTH, streak: 2, description: "Stay hydrated!", duration: 0, question: "How many glasses?" },
        { title: "Code Side Project", category: HabitCategory.WORK, streak: 0, description: "Work on the MERN stack app.", duration: 60, question: "What feature did you build?" }
    ];

    const today = new Date();
    
    // Create habits and fake logs
    for (const h of demoHabits) {
        const habit = await createHabit(userId, h.title, h.category, h.description, undefined, h.duration, h.question);
        
        // Update streak manually for demo purposes
        if (h.streak > 0) {
            // Create logs for the past 'streak' days
            const logs: HabitLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
            
            for (let i = 0; i < h.streak; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (i + 1)); // Start from yesterday backwards
                
                // Format YYYY-MM-DD
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                logs.push({
                    id: crypto.randomUUID(),
                    habitId: habit.id,
                    date: dateStr,
                    status: 'completed',
                    answer: 'Seed data entry'
                });
            }
            localStorage.setItem(LOGS_KEY, JSON.stringify(logs));

            // Update habit streak count and lastCompletedDate
            const lastDate = new Date(today);
            lastDate.setDate(lastDate.getDate() - 1); // Yesterday
            const yYear = lastDate.getFullYear();
            const yMonth = String(lastDate.getMonth() + 1).padStart(2, '0');
            const yDay = String(lastDate.getDate()).padStart(2, '0');

            await updateHabit(habit.id, { 
                streakCount: h.streak,
                lastCompletedDate: `${yYear}-${yMonth}-${yDay}`
            });
        }
    }
};

// --- Habit Services ---

export const getHabits = async (userId: string): Promise<Habit[]> => {
  await delay(300);
  const habits: Habit[] = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
  return habits.filter(h => h.userId === userId);
};

export const createHabit = async (
  userId: string, 
  title: string, 
  category: HabitCategory, 
  description?: string,
  reminderTime?: string,
  duration?: number,
  checkInQuestion?: string
): Promise<Habit> => {
  await delay(300);
  const habits: Habit[] = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
  
  const newHabit: Habit = {
    id: crypto.randomUUID(),
    userId,
    title,
    description,
    category,
    streakCount: 0,
    lastCompletedDate: null,
    createdAt: new Date().toISOString(),
    reminderTime,
    duration: duration || 0,
    checkInQuestion
  };

  habits.push(newHabit);
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  return newHabit;
};

export const updateHabit = async (habitId: string, updates: Partial<Habit>): Promise<Habit> => {
  await delay(300);
  const habits: Habit[] = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
  const index = habits.findIndex(h => h.id === habitId);
  
  if (index === -1) throw new Error('Habit not found');
  
  const updatedHabit = { ...habits[index], ...updates };
  habits[index] = updatedHabit;
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  return updatedHabit;
};

export const deleteHabit = async (habitId: string): Promise<void> => {
  await delay(300);
  let habits: Habit[] = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
  habits = habits.filter(h => h.id !== habitId);
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));

  // Clean logs
  let logs: HabitLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  logs = logs.filter(l => l.habitId !== habitId);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

// --- Analytics Services ---

export const getUserStats = async (userId: string) => {
  await delay(300);
  const habits = await getHabits(userId);
  const logs: HabitLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  
  const habitIds = new Set(habits.map(h => h.id));
  const userLogs = logs.filter(l => habitIds.has(l.habitId));
  
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streakCount), 0);
  const totalActiveStreaks = habits.filter(h => h.streakCount > 0).length;

  // Weekly Activity Calculation
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i)); // 6 days ago to today
      return d;
  });

  // Helper to format date key same as logs (YYYY-MM-DD)
  const getDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const activityMap = new Map<string, number>();
  userLogs.forEach(log => {
      activityMap.set(log.date, (activityMap.get(log.date) || 0) + 1);
  });

  const weeklyActivity = last7Days.map(date => {
      const dateKey = getDateKey(date);
      return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
          fullDate: dateKey,
          count: activityMap.get(dateKey) || 0
      };
  });
  
  return {
    totalHabits: habits.length,
    totalCheckins: userLogs.length,
    bestStreak,
    totalActiveStreaks,
    weeklyActivity
  };
};

// --- Check-in Logic ---

export const checkInHabit = async (habitId: string, answer?: string): Promise<{ habit: Habit, log: HabitLog }> => {
  await delay(300);
  const habits: Habit[] = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
  const habitIndex = habits.findIndex(h => h.id === habitId);
  
  if (habitIndex === -1) throw new Error('Habit not found');
  
  const habit = habits[habitIndex];
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // 1. If already checked in today, do nothing (idempotent)
  if (habit.lastCompletedDate === today) {
    throw new Error('Already checked in today');
  }

  // 2. Calculate Streak
  let newStreak = 1; // Default reset
  if (habit.lastCompletedDate === yesterday) {
    newStreak = habit.streakCount + 1;
  } else if (habit.lastCompletedDate === null) {
    newStreak = 1; // First time ever
  } else {
    // Last completed was older than yesterday, streak resets to 1
    newStreak = 1;
  }

  // 3. Update Habit
  const updatedHabit: Habit = {
    ...habit,
    streakCount: newStreak,
    lastCompletedDate: today
  };
  habits[habitIndex] = updatedHabit;
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));

  // 4. Create Log
  const logs: HabitLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  const newLog: HabitLog = {
    id: crypto.randomUUID(),
    habitId,
    date: today,
    status: 'completed',
    answer // Store the answer
  };
  logs.push(newLog);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));

  return { habit: updatedHabit, log: newLog };
};

export const getHabitLogs = async (habitId: string): Promise<HabitLog[]> => {
  await delay(200);
  const logs: HabitLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  return logs.filter(l => l.habitId === habitId);
};