import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// Feature #5: Offline-First Architecture & Real-time Sync
// Replace with your config from the Firebase Setup Guide
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Real-time listener for stadium data
 * @param stadiumId Unique identifier for the stadium
 * @param callback Function to handle live updates
 */
export const subscribeToStadium = (stadiumId: string, callback: (data: Record<string, unknown>) => void) => {
  const stadiumDoc = doc(db, 'stadiums', stadiumId);
  return onSnapshot(stadiumDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  }, (error) => {
    console.warn("Firebase sync error (likely missing config):", error);
  });
};
