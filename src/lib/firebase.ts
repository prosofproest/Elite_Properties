import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyASYBC99Zne4C_OOIKqNZClK95cnut-ne8",
  authDomain: "elite-properties-948b4.firebaseapp.com",
  projectId: "elite-properties-948b4",
  storageBucket: "elite-properties-948b4.firebasestorage.app",
  messagingSenderId: "990325987436",
  appId: "1:990325987436:web:28f2de6129919bc4e82049",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;