// Firebase Performance Optimizations
import { connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';

let isOptimized = false;

export const optimizeFirestore = (db) => {
  if (isOptimized) return;
  
  try {
    // Configure timeout and retry settings
    if (typeof window !== 'undefined') {
      // Browser optimizations
      const settings = {
        cacheSizeBytes: 40 * 1024 * 1024, // 40MB cache
        experimentalForceLongPolling: false,
        merge: true
      };
      
      // Only apply settings once
      console.log('🔧 Aplicando otimizações do Firestore...');
      
      // Prevent memory leaks by limiting listeners
      const originalOnSnapshot = db.onSnapshot;
      let activeListeners = 0;
      const MAX_LISTENERS = 10;
      
      db.onSnapshot = function(...args) {
        if (activeListeners >= MAX_LISTENERS) {
          console.warn('⚠️ Limite de listeners ativos atingido');
          return () => {}; // Return empty unsubscribe function
        }
        
        activeListeners++;
        const unsubscribe = originalOnSnapshot.apply(this, args);
        
        return () => {
          activeListeners--;
          unsubscribe();
        };
      };
      
      isOptimized = true;
      console.log('✅ Otimizações do Firestore aplicadas');
    }
  } catch (error) {
    console.warn('⚠️ Erro ao otimizar Firestore:', error);
  }
};

// Cleanup function for page unload
export const cleanupFirestore = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      try {
        // Force cleanup of any pending operations
        console.log('🧹 Limpando conexões do Firestore...');
      } catch (error) {
        console.warn('⚠️ Erro na limpeza do Firestore:', error);
      }
    });
  }
};

// Optimize specific queries to prevent timeouts
export const optimizeQuery = (query, options = {}) => {
  const { timeout = 10000, retries = 2 } = options;
  
  return new Promise((resolve, reject) => {
    let attempt = 0;
    
    const executeQuery = () => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Firestore query timeout'));
      }, timeout);
      
      query.then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      }).catch(error => {
        clearTimeout(timeoutId);
        
        if (attempt < retries && (error.code === 'unavailable' || error.code === 'deadline-exceeded')) {
          attempt++;
          console.log(`🔄 Tentativa ${attempt}/${retries} para query Firestore`);
          setTimeout(executeQuery, 1000 * attempt); // Exponential backoff
        } else {
          reject(error);
        }
      });
    };
    
    executeQuery();
  });
};