import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, Gender, ActivityLevel } from '../types';
import { getUserProfile, createDefaultUser, createUserDocument } from '../services/dataService';
import { auth, googleProvider } from '../services/firebaseConfig';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  username: string;
  age: number;
  weight: number;
  height: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>; // Google Sign In (legacy/alt)
  login: (email: string, password: string) => Promise<void>; // Email Login
  register: (data: SignUpData) => Promise<void>; // Email Register
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  login: async () => {},
  register: async () => {},
  signOut: async () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in, fetch profile from Firestore
          let profile = await getUserProfile(firebaseUser.uid);
          
          // If no profile exists in Firestore (and not currently registering manually), 
          // create a default one (handles Google Auth cases)
          if (!profile) {
            // Wait a brief moment in case the manual registration is creating it
            // This is a simple race condition handler
            await new Promise(r => setTimeout(r, 1000));
            profile = await getUserProfile(firebaseUser.uid);
            
            if (!profile) {
               profile = await createDefaultUser(
                firebaseUser.uid, 
                firebaseUser.email, 
                firebaseUser.displayName
              );
            }
          }
          setUser(profile);
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Email Login
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login Error:", error);
      setError(parseAuthError(error));
      throw error;
    }
  };

  // Email Registration
  const register = async (data: SignUpData) => {
    setError(null);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const { user: firebaseUser } = userCredential;

      // 2. Update Auth Profile (Display Name)
      await updateProfile(firebaseUser, {
        displayName: data.fullName
      });

      // 3. Create Firestore Document
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: data.email,
        displayName: data.fullName,
        username: data.username,
        age: data.age,
        weight: data.weight,
        height: data.height,
        gender: Gender.Other, // Default, user can change in profile
        country: 'Unknown',
        activityLevel: ActivityLevel.ModeratelyActive,
        goals: ['Health Optimization'],
        createdAt: Date.now()
      };

      await createUserDocument(newProfile);
      
      // Set user state immediately to avoid loading flash
      setUser(newProfile);

    } catch (error: any) {
      console.error("Registration Error:", error);
      setError(parseAuthError(error));
      throw error;
    }
  };

  // Google Sign In
  const signIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      setError(parseAuthError(error));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // Helper to parse Firebase errors
  const parseAuthError = (error: any): string => {
    if (error?.code === 'auth/unauthorized-domain') {
      return `DOMAIN_ERROR: ${window.location.hostname}`;
    }
    if (error?.code === 'auth/invalid-credential') return "Invalid email or password.";
    if (error?.code === 'auth/invalid-email') return "Invalid email address.";
    if (error?.code === 'auth/user-disabled') return "User account is disabled.";
    if (error?.code === 'auth/user-not-found') return "No account found with this email.";
    if (error?.code === 'auth/wrong-password') return "Incorrect password.";
    if (error?.code === 'auth/email-already-in-use') return "Email is already in use.";
    if (error?.code === 'auth/weak-password') return "Password is too weak.";
    
    return error.message || "An authentication error occurred.";
  };
  
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, login, register, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};