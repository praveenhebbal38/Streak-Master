import React, { useEffect } from 'react';
import { getHabits, getSession } from '../services/dbService';

const NotificationHandler: React.FC = () => {
  useEffect(() => {
    // Request permission on mount
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      if (Notification.permission !== 'granted') return;

      const session = getSession();
      if (!session) return;

      try {
        const habits = await getHabits(session.user.id);
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        habits.forEach(habit => {
          if (habit.reminderTime === currentTime) {
            // Check if already notified this minute to avoid spam (simple debounce)
            const lastNotified = sessionStorage.getItem(`notified_${habit.id}_${currentTime}`);
            
            if (!lastNotified) {
              new Notification(`Time to ${habit.title}!`, {
                body: `Don't break your ${habit.streakCount} day streak!`,
                icon: '/vite.svg' // Fallback icon
              });
              sessionStorage.setItem(`notified_${habit.id}_${currentTime}`, 'true');
            }
          }
        });
      } catch (error) {
        console.error('Error checking reminders', error);
      }
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    // Initial check
    checkReminders();

    return () => clearInterval(interval);
  }, []);

  return null; // Component renders nothing visibly
};

export default NotificationHandler;