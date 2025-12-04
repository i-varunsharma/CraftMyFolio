'use client';
import { useEffect } from 'react';

const PopupBlocker = () => {
  useEffect(() => {
    const originalOpen = window.open;
    
    window.open = function(url, name, specs) {
      // Allow logout, auth, and same-origin URLs
      if (!url || url.includes('/logout') || url.includes('/auth') || url.startsWith('/') || url.startsWith(window.location.origin)) {
        return originalOpen.call(window, url, name, specs);
      }
      
      // Block localhost popups
      if (url && (url.includes('localhost') || url.includes('127.0.0.1'))) {
        console.log('Localhost popup blocked:', url);
        return null;
      }
      
      // Allow other popups
      return originalOpen.call(window, url, name, specs);
    };

    return () => {
      window.open = originalOpen;
    };
  }, []);

  return null;
};

export default PopupBlocker;