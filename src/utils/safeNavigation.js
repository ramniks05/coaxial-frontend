import { useNavigate } from 'react-router-dom';

// Navigation queue to prevent multiple simultaneous navigations
let navigationQueue = [];
let isNavigating = false;

// Safe navigation utility to prevent "insecure operation" errors
export const safeNavigate = (navigate, path, options = {}) => {
  return new Promise((resolve) => {
    // Add to navigation queue
    navigationQueue.push({ navigate, path, options, resolve });
    
    // Process queue if not already processing
    if (!isNavigating) {
      processNavigationQueue();
    }
  });
};

// Process navigation queue with proper timing
const processNavigationQueue = () => {
  if (navigationQueue.length === 0) {
    isNavigating = false;
    return;
  }
  
  isNavigating = true;
  const { navigate, path, options, resolve } = navigationQueue.shift();
  
  // Use requestAnimationFrame to ensure we're outside the render cycle
  requestAnimationFrame(() => {
    // Use another setTimeout to be extra safe
    setTimeout(() => {
      try {
        // Use window.location as the primary method to avoid React Router issues
        if (options.replace !== false) {
          window.location.replace(path);
        } else {
          window.location.href = path;
        }
        resolve();
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to window.location
        window.location.href = path;
        resolve();
      }
      
      // Process next item in queue
      setTimeout(() => {
        processNavigationQueue();
      }, 50);
    }, 100);
  });
};

// Hook for safe navigation
export const useSafeNavigate = () => {
  const navigate = useNavigate();
  
  return (path, options = {}) => {
    return safeNavigate(navigate, path, options);
  };
};
