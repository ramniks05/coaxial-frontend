import React, { createContext, useContext, useEffect, useReducer } from 'react';

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
  lastBackendCheck: null
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
  SET_BACKEND_STATUS: 'SET_BACKEND_STATUS'
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
        sidebarOpen: false
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
        backendConnected: action.payload.connected,
        lastBackendCheck: action.payload.timestamp
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

  // Load user data from localStorage on app start and check backend connectivity
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Check backend connectivity first
    checkBackendConnectivity();
    
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token expired, clearing localStorage');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
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

  // Periodic backend connectivity check
  useEffect(() => {
    const interval = setInterval(() => {
      checkBackendConnectivity();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

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

  // Backend connectivity check function
  const checkBackendConnectivity = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });
      
      const isConnected = response.ok;
      dispatch({
        type: ActionTypes.SET_BACKEND_STATUS,
        payload: {
          connected: isConnected,
          timestamp: new Date().toISOString()
        }
      });
      
      return isConnected;
    } catch (error) {
      console.log('Backend connectivity check failed:', error.message);
      dispatch({
        type: ActionTypes.SET_BACKEND_STATUS,
        payload: {
          connected: false,
          timestamp: new Date().toISOString()
        }
      });
      return false;
    }
  };

  // Action creators
  const actions = {
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
    
    checkBackendConnectivity
  };

  const value = {
    ...state,
    ...actions
  };

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
  const { user, token, isAuthenticated } = useApp();
  return { user, token, isAuthenticated };
};

export default AppContext;
