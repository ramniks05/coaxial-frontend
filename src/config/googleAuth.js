// Google OAuth Configuration for Spring Security OAuth2
export const GOOGLE_CONFIG = {
  clientId: "299753241373-pf94e1unr3cgk6vmu1fh5c6bpgvm9752.apps.googleusercontent.com",
  projectId: "coaxis-academy",
  backendBaseUrl: "http://localhost:8080"
};

// Function to initiate Google OAuth through Spring Security
export const initiateGoogleAuth = () => {
  // Spring Security OAuth2 will handle the entire OAuth flow
  window.location.href = `${GOOGLE_CONFIG.backendBaseUrl}/oauth2/authorization/google`;
};

// Function to check if user is authenticated after OAuth callback
export const checkAuthStatus = async () => {
  try {
    const response = await fetch(`${GOOGLE_CONFIG.backendBaseUrl}/api/auth/me`, {
      method: 'GET',
      credentials: 'include', // Include cookies for session-based auth
      headers: {
        'accept': '*/*'
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return null;
  }
};
