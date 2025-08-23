// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 🚨 MANTENHA este objeto exatamente como já está no seu projeto.
// Se você tem variáveis import.meta.env, mantenha-as iguais.
// Apenas garanta que o nome da constante continue sendo firebaseConfig.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "1073104197604",
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let db;

// Inicialização SÍNCRONA e única (idempotente)
export function ensureFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  return { app, db };
}

// Garante que app/db existam assim que o módulo é importado
ensureFirebase();

// Exports para código antigo e novo
export { app, db };
export default ensureFirebase;