/**
 * Fetch utility with timeout and error handling
 * Prevents indefinite loading states
 */

export const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error(`Request timeout after ${timeout}ms:`, url);
      throw new Error('Request timeout - please check your connection');
    }
    
    console.error('Fetch error:', error);
    throw error;
  }
};

/**
 * Firestore query with timeout
 */
export const firestoreWithTimeout = async (queryFunction, timeout = 5000) => {
  return Promise.race([
    queryFunction(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), timeout)
    )
  ]);
};

/**
 * Load data with retry logic
 */
export const loadWithRetry = async (loadFunction, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await loadFunction();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed:`, error.message);
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};