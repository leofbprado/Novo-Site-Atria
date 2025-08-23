// ⚡ FIREBASE LAZY LOADER - Reduces initial bundle by ~85KB
let firebaseApp = null;
let firestore = null;
let analytics = null;
let auth = null;

// Firebase config (lightweight)
const firebaseConfig = {
  apiKey: "AIzaSyDcFSQK-3vPdX44ZvXDTFN3Soi52aM5l6s",
  authDomain: "atria-veiculos-a1c21.firebaseapp.com",
  projectId: "atria-veiculos-a1c21",
  storageBucket: "atria-veiculos-a1c21.appspot.com",
  messagingSenderId: "6318792",
  appId: "1:6318792:web:8aa91189a4274b5a8c9b7b01d46ea360",
  measurementId: "G-MWQTH6YLQ4"
};

// Lazy Firebase initialization
export const initializeFirebase = async () => {
  if (firebaseApp) return firebaseApp;
  
  try {
    const { initializeApp } = await import('firebase/app');
    firebaseApp = initializeApp(firebaseConfig);
    
    console.log('✅ Firebase app inicializado');
    
    if (window.ATRIA_PERF) {
      window.ATRIA_PERF.mark('Firebase Initialized');
    }
    
    return firebaseApp;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    throw error;
  }
};

// Lazy Firestore loader
export const getFirestore = async () => {
  if (firestore) return firestore;
  
  try {
    await initializeFirebase();
    const { getFirestore: getFS } = await import('firebase/firestore');
    firestore = getFS(firebaseApp);
    
    console.log('✅ Firestore carregado');
    return firestore;
  } catch (error) {
    console.error('❌ Erro ao carregar Firestore:', error);
    throw error;
  }
};

// Lazy Analytics loader
export const getAnalytics = async () => {
  if (analytics) return analytics;
  
  try {
    await initializeFirebase();
    const { getAnalytics: getGA } = await import('firebase/analytics');
    analytics = getGA(firebaseApp);
    
    console.log('✅ Analytics carregado');
    return analytics;
  } catch (error) {
    console.warn('⚠️ Analytics não pôde ser carregado:', error);
    return null;
  }
};

// Lazy Auth loader
export const getAuth = async () => {
  if (auth) return auth;
  
  try {
    await initializeFirebase();
    const { getAuth: getAuthentication } = await import('firebase/auth');
    auth = getAuthentication(firebaseApp);
    
    console.log('✅ Auth carregado');
    return auth;
  } catch (error) {
    console.error('❌ Erro ao carregar Auth:', error);
    throw error;
  }
};

// Lazy Firestore operations
export const loadFirestoreOperations = async () => {
  const operations = await import('firebase/firestore');
  return {
    collection: operations.collection,
    doc: operations.doc,
    getDocs: operations.getDocs,
    getDoc: operations.getDoc,
    addDoc: operations.addDoc,
    updateDoc: operations.updateDoc,
    deleteDoc: operations.deleteDoc,
    query: operations.query,
    where: operations.where,
    orderBy: operations.orderBy,
    limit: operations.limit,
    onSnapshot: operations.onSnapshot,
    Timestamp: operations.Timestamp
  };
};

// Utility to preload Firebase for critical operations
export const preloadFirebase = () => {
  // Preload only if user is likely to interact with the app
  const preloadTriggers = ['scroll', 'click', 'touchstart', 'keydown'];
  
  const preload = () => {
    initializeFirebase().catch(err => console.warn('⚠️ Preload Firebase falhou:', err));
    preloadTriggers.forEach(event => 
      document.removeEventListener(event, preload, { passive: true })
    );
  };
  
  preloadTriggers.forEach(event => 
    document.addEventListener(event, preload, { passive: true, once: true })
  );
  
  // Fallback timeout
  setTimeout(preload, 5000);
};

// Analytics tracking helpers
export const trackEvent = async (eventName, parameters = {}) => {
  try {
    const analytics = await getAnalytics();
    if (analytics) {
      const { logEvent } = await import('firebase/analytics');
      logEvent(analytics, eventName, parameters);
    }
  } catch (error) {
    console.warn('⚠️ Erro ao track evento:', error);
  }
};

// Performance monitoring
export const trackPerformance = async (metricName, value) => {
  try {
    const analytics = await getAnalytics();
    if (analytics) {
      const { logEvent } = await import('firebase/analytics');
      logEvent(analytics, 'custom_performance', {
        metric_name: metricName,
        value: value,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.warn('⚠️ Erro ao track performance:', error);
  }
};

// Initialize Firebase only when needed
if (typeof window !== 'undefined') {
  // Only preload in production or when user shows intent
  if (import.meta.env.PROD) {
    preloadFirebase();
  }
}

export default {
  initializeFirebase,
  getFirestore,
  getAnalytics,
  getAuth,
  loadFirestoreOperations,
  trackEvent,
  trackPerformance
};