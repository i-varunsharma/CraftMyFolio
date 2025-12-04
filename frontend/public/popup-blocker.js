// Block localhost popups globally
(function() {
  'use strict';
  
  // Override window.open
  const originalOpen = window.open;
  window.open = function(url, name, specs) {
    // Allow logout, auth, and same-origin URLs
    if (!url || url.includes('/logout') || url.includes('/auth') || url.startsWith('/') || url.startsWith(window.location.origin)) {
      return originalOpen.call(window, url, name, specs);
    }
    
    // Block localhost popups
    if (url && (url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('http://localhost') || url.startsWith('https://localhost'))) {
      console.log('Localhost popup blocked:', url);
      return null;
    }
    
    return originalOpen.call(window, url, name, specs);
  };
})();