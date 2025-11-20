import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Access environment variables injected via window.process.env in index.html
const env = process.env;

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

console.log("Firebase initialized with project:", firebaseConfig.projectId);