export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export enum HabitCategory {
  HEALTH = 'Health',
  STUDY = 'Study',
  PERSONAL = 'Personal',
  WORK = 'Work',
  FITNESS = 'Fitness',
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: HabitCategory;
  streakCount: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  createdAt: string;
  reminderTime?: string; // e.g. "08:00"
  duration?: number; // Minimum duration in minutes to enable check-in
  checkInQuestion?: string; // e.g. "How many pages did you read?"
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'missed';
  answer?: string; // User's answer to the check-in question
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}