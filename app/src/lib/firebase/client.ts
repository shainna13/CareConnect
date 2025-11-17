// lib/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBM_5ip1Vs5eZNB4lu3YbTWmyi_8kTvf58",
  authDomain: "doctor-app-b2371.firebaseapp.com",
  projectId: "doctor-app-b2371",
  storageBucket: "doctor-app-b2371.firebasestorage.app",
  messagingSenderId: "420005704423",
  appId: "1:420005704423:web:904a776f5e5daaef762842",
  measurementId: "G-6ENK5F2BWW"
};

// Prevent Next.js from initializing Firebase multiple times
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth must be initialized only once
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };