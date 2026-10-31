import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore on default database
export const db = getFirestore(app);

// Initialize Realtime Database
export const rtdb = getDatabase(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
