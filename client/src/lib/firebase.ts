import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Firebase is optional — if env vars are missing, exports will be null
// and firestore.ts will fall back to mock data.
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (apiKey) {
  app = initializeApp({
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  });
  db = getFirestore(app);
}

export { app, db };
export default app;
