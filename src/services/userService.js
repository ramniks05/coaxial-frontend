// User Management API Service
const API_BASE = 'http://localhost:8080';

// Get users (admin only)
export const getUsers = async (token, role = null, search = null, enabled = null, abortSignal = undefined) => {
  const params = new URLSearchParams();
  if (role) params.append('role', role);
  if (search) params.append('search', search);
  if (enabled !== null) params.append('enabled', enabled.toString());
  
  const url = `${API_BASE}/api/admin/users?${params}`;
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    signal: abortSignal
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  
  return response.json();
};

// Get user counts (admin only)
export const getUserCounts = async (token) => {
  const response = await fetch(`${API_BASE}/api/admin/users/count`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user counts: ${response.statusText}`);
  }
  
  return response.json();
};

// Get user by ID (admin only)
export const getUserById = async (token, userId) => {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  
  return response.json();
};

// Update user (admin only)
export const updateUser = async (token, userId, userData) => {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }
  
  return response.json();
};

// Delete user (admin only)
export const deleteUser = async (token, userId) => {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }
  
  return response.json();
};

// Activate user (admin only)
export const activateUser = async (token, userId) => {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/activate`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to activate user: ${response.statusText}`);
  }
  
  return response.json();
};

// Deactivate user (admin only)
export const deactivateUser = async (token, userId) => {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/deactivate`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to deactivate user: ${response.statusText}`);
  }
  
  return response.json();
};
