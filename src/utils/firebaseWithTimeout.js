/**
 * Firebase operations with timeout handling
 * Prevents indefinite loading states when Firebase is slow or unresponsive
 */

import { collection, getDocs, query, where, limit, orderBy, doc, getDoc } from 'firebase/firestore';

/**
 * Execute Firebase query with timeout
 * @param {Function} queryFunction - The Firebase query function to execute
 * @param {number} timeout - Timeout in milliseconds (default: 8000ms)
 * @returns {Promise} Query result or error
 */
export const queryWithTimeout = async (queryFunction, timeout = 8000) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Firebase query timeout - Connection may be slow'));
    }, timeout);
  });
  
  try {
    // Race between the query and timeout
    const result = await Promise.race([
      queryFunction(),
      timeoutPromise
    ]);
    
    return result;
  } catch (error) {
    console.error('Firebase query error:', error);
    
    // Return empty result instead of throwing to prevent app crashes
    if (error.message.includes('timeout')) {
      console.warn('Query timed out, returning empty result');
      return { empty: true, docs: [] };
    }
    
    throw error;
  }
};

/**
 * Get documents with timeout and error handling
 * @param {Query} firestoreQuery - Firestore query object
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Documents array or empty array on error
 */
export const getDocsWithTimeout = async (firestoreQuery, timeout = 8000) => {
  try {
    const snapshot = await queryWithTimeout(
      () => getDocs(firestoreQuery),
      timeout
    );
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

/**
 * Get single document with timeout
 * @param {DocumentReference} docRef - Firestore document reference
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Document data or null
 */
export const getDocWithTimeout = async (docRef, timeout = 5000) => {
  try {
    const docSnap = await queryWithTimeout(
      () => getDoc(docRef),
      timeout
    );
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
};

/**
 * Retry failed Firebase operations
 * @param {Function} operation - The operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} Operation result
 */
export const retryOperation = async (operation, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`Firebase operation attempt ${i + 1} failed:`, error.message);
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Return null instead of throwing to prevent app crashes
  console.warn('All retry attempts failed, returning null');
  return null;
};

/**
 * Check Firebase connectivity
 * @returns {Promise<boolean>} True if connected
 */
export const checkFirebaseConnection = async () => {
  try {
    // Try a simple query to test connection
    const testQuery = query(
      collection(db, 'veiculos'),
      limit(1)
    );
    
    await queryWithTimeout(() => getDocs(testQuery), 3000);
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
};