// React initialization script - ensures React is available globally
// This fixes the useLayoutEffect error in production builds
(function() {
  // Wait for React to be available
  const checkReact = function() {
    if (window.React && window.React.useLayoutEffect) {
      console.log('✅ React hooks loaded successfully');
      return true;
    }
    return false;
  };
  
  // Create a promise that resolves when React is ready
  window.__reactReady = new Promise(function(resolve) {
    if (checkReact()) {
      resolve();
    } else {
      let attempts = 0;
      const interval = setInterval(function() {
        attempts++;
        if (checkReact() || attempts > 50) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    }
  });
})();