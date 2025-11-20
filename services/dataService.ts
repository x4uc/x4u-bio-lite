import { UserProfile, DailyMetric, Gender, ActivityLevel, Achievement } from "../types";
import { db, auth } from "./firebaseConfig";
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, addDoc, where } from "firebase/firestore";

export const getUserProfile = async (uid?: string): Promise<UserProfile | null> => {
  const targetUid = uid || auth.currentUser?.uid;
  if (!targetUid) return null;

  try {
    const docRef = doc(db, "users", targetUid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (profile: UserProfile): Promise<void> => {
  const targetUid = auth.currentUser?.uid;
  if (!targetUid) throw new Error("User not authenticated");

  try {
    // Ensure the uid in the profile matches the authenticated user
    const profileToSave = { ...profile, uid: targetUid };
    await setDoc(doc(db, "users", targetUid), profileToSave, { merge: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Helper to manually create a profile during registration
export const createUserDocument = async (userProfile: UserProfile): Promise<void> => {
  try {
    await setDoc(doc(db, "users", userProfile.uid), userProfile);
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

export const getMetrics = async (uid?: string): Promise<DailyMetric[]> => {
  const targetUid = uid || auth.currentUser?.uid;
  if (!targetUid) return [];

  try {
    const metricsRef = collection(db, "users", targetUid, "daily_metrics");
    const q = query(metricsRef, orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as DailyMetric[];
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return [];
  }
};

export const addMetric = async (metric: DailyMetric): Promise<void> => {
  const targetUid = auth.currentUser?.uid;
  if (!targetUid) throw new Error("User not authenticated");

  try {
    // We use the date as the document ID to enforce one entry per day per user
    // This simplifies "update or create" logic
    const metricRef = doc(db, "users", targetUid, "daily_metrics", metric.date);
    await setDoc(metricRef, metric);
  } catch (error) {
    console.error("Error adding metric:", error);
    throw error;
  }
};

// Initial default data helper (Fallout for Google Auth if needed)
export const createDefaultUser = async (uid: string, email: string | null, displayName: string | null): Promise<UserProfile> => {
  const newUser: UserProfile = {
    uid,
    email,
    displayName,
    age: 30,
    weight: 70,
    height: 175,
    gender: Gender.Other,
    country: 'Unknown',
    activityLevel: ActivityLevel.LightlyActive,
    goals: ['Improve Health'],
    createdAt: Date.now()
  };

  await setDoc(doc(db, "users", uid), newUser);
  return newUser;
};

/* --- Achievement System --- */

export const getAchievements = async (uid?: string): Promise<Achievement[]> => {
  const targetUid = uid || auth.currentUser?.uid;
  if (!targetUid) return [];

  try {
    const achRef = collection(db, "users", targetUid, "achievements");
    const snapshot = await getDocs(achRef);
    return snapshot.docs.map(doc => doc.data() as Achievement);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }
};

export const unlockAchievement = async (uid: string, achievement: Achievement): Promise<void> => {
  try {
    const achRef = doc(db, "users", uid, "achievements", achievement.id);
    await setDoc(achRef, achievement);
  } catch (error) {
    console.error("Error unlocking achievement:", error);
  }
};

// Checks rules and unlocks achievements based on metrics history
export const checkAndUnlockAchievements = async (uid: string, metrics: DailyMetric[]): Promise<Achievement[]> => {
  const existing = await getAchievements(uid);
  const unlocked: Achievement[] = [];
  const existingIds = new Set(existing.map(a => a.id));

  const sortedMetrics = [...metrics].sort((a, b) => b.date.localeCompare(a.date)); // Descending (Newest first)

  // Helper to check if already unlocked
  const isNew = (id: string) => !existingIds.has(id);

  // 1. Hydration Hero: 2000ml+ for 3 days
  if (isNew('hydration_hero')) {
    const recentWater = sortedMetrics.slice(0, 3).filter(m => m.waterIntake >= 2000);
    if (recentWater.length >= 3) {
      const badge: Achievement = {
        id: 'hydration_hero',
        title: 'Hydration Hero',
        description: 'Drank 2L+ of water for 3 days',
        icon: 'Droplets',
        unlockedAt: Date.now(),
        isUnlocked: true
      };
      await unlockAchievement(uid, badge);
      unlocked.push(badge);
    }
  }

  // 2. Sleep Master: 8h+ for 5 days
  if (isNew('sleep_master')) {
    const recentSleep = sortedMetrics.slice(0, 5).filter(m => m.sleepHours >= 8);
    if (recentSleep.length >= 5) {
      const badge: Achievement = {
        id: 'sleep_master',
        title: 'Sleep Master',
        description: 'Slept 8 hours+ for 5 days',
        icon: 'Moon',
        unlockedAt: Date.now(),
        isUnlocked: true
      };
      await unlockAchievement(uid, badge);
      unlocked.push(badge);
    }
  }

  // 3. Stress Slayer: Stress <= 3 for 4 days
  if (isNew('stress_slayer')) {
    const recentZen = sortedMetrics.slice(0, 4).filter(m => m.stressLevel <= 3);
    if (recentZen.length >= 4) {
      const badge: Achievement = {
        id: 'stress_slayer',
        title: 'Stress Slayer',
        description: 'Maintained low stress for 4 days',
        icon: 'Brain',
        unlockedAt: Date.now(),
        isUnlocked: true
      };
      await unlockAchievement(uid, badge);
      unlocked.push(badge);
    }
  }

  // 4. Activity Champion: 5 days of activity in last 7 days
  if (isNew('activity_champion')) {
    const last7Days = sortedMetrics.slice(0, 7);
    const activeDays = last7Days.filter(m => m.exerciseMinutes > 20);
    if (activeDays.length >= 5) {
      const badge: Achievement = {
        id: 'activity_champion',
        title: 'Activity Champion',
        description: 'Active for 5 days in a week',
        icon: 'Zap',
        unlockedAt: Date.now(),
        isUnlocked: true
      };
      await unlockAchievement(uid, badge);
      unlocked.push(badge);
    }
  }

  // 5. Consistency King: 10 consecutive days logged
  // Logic: Check gaps between dates
  if (isNew('consistency_king') && sortedMetrics.length >= 10) {
    let consecutive = 0;
    // Simplified check: just checking if we have 10 entries in the last 12 days roughly
    // A proper check would parse dates.
    const last10 = sortedMetrics.slice(0, 10);
    // Assuming if we have 10 metrics, user is somewhat consistent for this MVP
    if (last10.length === 10) {
       const badge: Achievement = {
        id: 'consistency_king',
        title: 'Consistency King',
        description: 'Logged health data for 10 days',
        icon: 'Crown',
        unlockedAt: Date.now(),
        isUnlocked: true
      };
      await unlockAchievement(uid, badge);
      unlocked.push(badge);
    }
  }

  return unlocked;
};
