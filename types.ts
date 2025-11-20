export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export enum ActivityLevel {
  Sedentary = 'Sedentary',
  LightlyActive = 'Lightly Active',
  ModeratelyActive = 'Moderately Active',
  VeryActive = 'Very Active'
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  username?: string; // Added username
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: Gender;
  country: string;
  activityLevel: ActivityLevel;
  goals: string[]; // e.g., "Lose Weight", "Build Muscle"
  createdAt: number;
}

export interface DailyMetric {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  waterIntake: number; // ml
  steps: number;
  heartRate?: number;
  mood: number; // 1-10
  stressLevel: number; // 1-10
  nutritionScore: number; // 1-10
  exerciseMinutes: number;
  notes?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AIRecommendation {
  category: 'Sleep' | 'Exercise' | 'Diet' | 'Stress' | 'General';
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface HealthAnalysis {
  score: number;
  summary: string;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: AIRecommendation[];
}

// Community & Gamification Types
export type AchievementType = 'Hydration Hero' | 'Sleep Master' | 'Stress Slayer' | 'Activity Champion' | 'Consistency King';

export interface Achievement {
  id: string; // e.g., 'hydration_hero'
  title: AchievementType | string;
  description: string;
  icon: string; // Lucide icon name
  unlockedAt: number; // timestamp
  isUnlocked: boolean;
}
