// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { initializeFirestore, getFirestore, memoryLocalCache } from 'firebase/firestore';

// ⚠️ Mantemos as envs do Vite (opção A)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // storageBucket correto para Firebase Storage (não afeta Firestore, mas padroniza)
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "1073104197604",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let db;

/**
 * Inicializa Firebase uma única vez.
 * 🔧 Firestore com ajustes para ambientes restritos:
 *  - experimentalForceLongPolling: força long-polling (evita HTTP/2/streams).
 *  - useFetchStreams: desliga fetch streaming (melhora compatibilidade em proxies).
 *  - localCache: usa memória (evita IndexedDB em ambientes bloqueados).
 */
export function ensureFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        useFetchStreams: false,
        localCache: memoryLocalCache(),
      });
    } catch (_err) {
      // Fallback seguro
      db = getFirestore(app);
    }
  }
  return { app, db };
}

// Garante app/db disponíveis ao importar o módulo
ensureFirebase();

// Exports compatíveis
export { app, db };
export default ensureFirebase;
