// File: src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFOtBQcdSFDQ4tPGVZ86fYNjwzc3ZBZvA",
  authDomain: "sk8-or-die-111e0.firebaseapp.com",
  projectId: "sk8-or-die-111e0",
  storageBucket: "sk8-or-die-111e0.firebasestorage.app",
  messagingSenderId: "202001384898",
  appId: "1:202001384898:web:6cede09fe3eda67e93025b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
