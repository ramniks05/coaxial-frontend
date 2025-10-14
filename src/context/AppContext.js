import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  theme: 'light', // light or dark
  notifications: [],
  sidebarOpen: false,
  currentPage: 'home',
  backendConnected: true, // Track backend connectivity
  isOnline: true, // Track network status
  tokenRefreshInProgress: false, // Track token refresh status
};

// Action types
export const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_BACKEND_STATUS: 'SET_BACKEND_STATUS',
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS',
  SET_TOKEN_REFRESH_STATUS: 'SET_TOKEN_REFRESH_STATUS'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        sidebarOpen: false,
        tokenRefreshInProgress: false
      };
    
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case ActionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
    
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
    
    case ActionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload
      };
    
    case ActionTypes.SET_BACKEND_STATUS:
      return {
        ...state,
        backendConnected: action.payload
      };
    
    case ActionTypes.SET_NETWORK_STATUS:
      return {
        ...state,
        isOnline: action.payload
      };
    
    case ActionTypes.SET_TOKEN_REFRESH_STATUS:
      return {
        ...state,
        tokenRefreshInProgress: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [retryCount, setRetryCount] = useState(0);
  const [lastTokenRefresh, setLastTokenRefresh] = useState(null);

  // Load user data from localStorage on app start and check backend connectivity
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Initialize network status
    dispatch({
      type: ActionTypes.SET_NETWORK_STATUS,
      payload: navigator.onLine
    });
    
    // Check backend connectivity
    checkBackendConnectivity();
    
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token expired, attempting refresh...');
          refreshToken(token);
          return;
        }
        
        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: { user: userData, token }
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network is back online');
      dispatch({ type: ActionTypes.SET_NETWORK_STATUS, payload: true });
      // Recheck backend connectivity when back online
      checkBackendConnectivity();
    };
    
    const handleOffline = () => {
      console.log('Network is offline');
      dispatch({ type: ActionTypes.SET_NETWORK_STATUS, payload: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic backend connectivity check with retry logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isOnline) {
        checkBackendConnectivity();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [state.isOnline]);

  // Token refresh monitoring
  useEffect(() => {
    if (state.isAuthenticated && state.token && !state.tokenRefreshInProgress) {
      const tokenExpiry = getTokenExpiry(state.token);
      const timeUntilExpiry = tokenExpiry - Date.now();
      
      // Refresh token 5 minutes before expiry
      if (timeUntilExpiry < 300000 && timeUntilExpiry > 0) {
        console.log('Token expires soon, refreshing...');
        refreshToken(state.token);
      }
    }
  }, [state.isAuthenticated, state.token, state.tokenRefreshInProgress]);

  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If we can't parse the token, consider it expired
    }
  };

  // Helper function to get token expiry time
  const getTokenExpiry = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error getting token expiry:', error);
      return 0;
    }
  };

  // Token refresh function
  const refreshToken = async (currentToken) => {
    if (state.tokenRefreshInProgress) {
      console.log('Token refresh already in progress');
      return;
    }

    dispatch({ type: ActionTypes.SET_TOKEN_REFRESH_STATUS, payload: true });

    try {
      console.log('Refreshing token...');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        signal: AbortSignal.timeout(1000) // 1 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token || data.access_token;
        
        if (newToken) {
          console.log('Token refreshed successfully');
          
          // Update state with new token
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: { user: state.user, token: newToken }
          });
          
          setLastTokenRefresh(Date.now());
          
          // Add success notification
          dispatch({
            type: ActionTypes.ADD_NOTIFICATION,
            payload: {
              type: 'success',
              message: 'Session refreshed successfully',
              autoDismiss: true,
              duration: 3000
            }
          });
        } else {
          throw new Error('No token received from refresh endpoint');
        }
      } else {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, logout user
      dispatch({ type: ActionTypes.LOGOUT });
      
      // Add error notification
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: {
          type: 'error',
          message: 'Session expired. Please log in again.',
          autoDismiss: false
        }
      });
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      dispatch({ type: ActionTypes.SET_TOKEN_REFRESH_STATUS, payload: false });
    }
  };

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [state.user, state.token]);


  // Backend connectivity check function with retry logic
  const checkBackendConnectivity = async (retryAttempt = 0) => {
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      console.log(`Checking backend connectivity... (attempt ${retryAttempt + 1})`);
      
      // Get API base URL from environment
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
      
      // Try multiple endpoints to check connectivity
      const endpoints = [
        `${API_BASE_URL}/api/health`,
        `${API_BASE_URL}/api/auth/me`,
        `${API_BASE_URL}/actuator/health`,
        `${API_BASE_URL}/`,  // Root endpoint
        `${API_BASE_URL}/api/`  // API root
      ];
      
      let isConnected = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });
          
          console.log(`Response from ${endpoint}:`, response.status, response.statusText);
          
          // Consider it connected if we get any response (even 401/403 means server is up)
          if (response.status < 500) {
            isConnected = true;
            console.log('Backend is connected via:', endpoint);
            break;
          }
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
          continue;
        }
      }
      
      clearTimeout(timeoutId);
      
      if (isConnected) {
        console.log('Backend connectivity: Connected');
        setRetryCount(0); // Reset retry count on success
        
        dispatch({
          type: ActionTypes.SET_BACKEND_STATUS,
          payload: true
        });
      } else {
        throw new Error('All endpoints failed');
      }
      
      return isConnected;
    } catch (error) {
      console.log(`Backend connectivity check failed (attempt ${retryAttempt + 1}):`, error.message);
      
      // Retry logic with exponential backoff
      if (retryAttempt < 3) {
        const delay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        
        setTimeout(() => {
          checkBackendConnectivity(retryAttempt + 1);
        }, delay);
        
        return false;
      } else {
        // Final failure after all retries
        console.log('Backend connectivity: Disconnected (all retries exhausted)');
        setRetryCount(0);
        
        dispatch({
          type: ActionTypes.SET_BACKEND_STATUS,
          payload: false
        });
        
        // Add notification for persistent connectivity issues
        if (retryAttempt === 3) {
          dispatch({
            type: ActionTypes.ADD_NOTIFICATION,
            payload: {
              type: 'warning',
              message: 'Backend connection lost. Some features may be unavailable.',
              autoDismiss: false
            }
          });
        }
        
        return false;
      }
    }
  };


  // Action creators
  const actions = useMemo(() => ({
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    
    loginSuccess: (user, token) => dispatch({ 
      type: ActionTypes.LOGIN_SUCCESS, 
      payload: { user, token } 
    }),
    
    logout: () => dispatch({ type: ActionTypes.LOGOUT }),
    
    updateUser: (userData) => dispatch({ 
      type: ActionTypes.UPDATE_USER, 
      payload: userData 
    }),
    
    setTheme: (theme) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }),
    
    addNotification: (notification) => {
      const notificationWithId = { 
        ...notification, 
        id: Date.now(),
        autoDismiss: notification.autoDismiss !== false, // Default to true unless explicitly set to false
        duration: notification.duration || 5000 // Default 5 seconds
      };
      dispatch({ 
        type: ActionTypes.ADD_NOTIFICATION, 
        payload: notificationWithId 
      });
      return notificationWithId.id;
    },
    
    removeNotification: (id) => dispatch({ 
      type: ActionTypes.REMOVE_NOTIFICATION, 
      payload: id 
    }),
    
    toggleSidebar: () => dispatch({ type: ActionTypes.TOGGLE_SIDEBAR }),
    
    setCurrentPage: (page) => dispatch({ 
      type: ActionTypes.SET_CURRENT_PAGE, 
      payload: page 
    }),
    
    checkBackendConnectivity,
    refreshToken
    
  }), []);

  const value = useMemo(() => ({
    ...state,
    ...actions,
    retryCount,
    lastTokenRefresh
  }), [state, actions, retryCount, lastTokenRefresh]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Custom hook for authentication
export const useAuth = () => {
  const { user, token, isAuthenticated, tokenRefreshInProgress } = useApp();
  return { user, token, isAuthenticated, tokenRefreshInProgress };
};

// Custom hook for network status
export const useNetworkStatus = () => {
  const { isOnline, backendConnected } = useApp();
  return { isOnline, backendConnected };
};

export default AppContext;
