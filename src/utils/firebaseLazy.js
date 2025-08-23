let firebaseInitialized = false;

export const firebaseLazy = {
  init({ eager } = {}) {
    if (firebaseInitialized) return;
    
    const initFn = () => import('@/firebase/config').then(m => m.default());
    
    if (eager === true) {
      initFn();
    } else if ('requestIdleCallback' in window) {
      requestIdleCallback(initFn);
    } else {
      window.addEventListener('load', initFn);
    }
    firebaseInitialized = true;
  }
};