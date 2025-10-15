import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { activateUser, deactivateUser, deleteUser, getUserCounts, getUsers } from '../services/userService';
import './UserManagementPage.css';
import AdminPageHeader from './common/AdminPageHeader';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const UserManagementPage = ({ onBackToDashboard }) => {
  const { addNotification, isAuthenticated, token } = useApp();
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    instructors: 0,
    students: 0,
    active: 0,
    inactive: 0
  });
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    enabled: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Debounce filters to prevent multiple API calls
  const debouncedFilters = useDebounce(filters, 300);
  
  // Track if data has been fetched to prevent duplicate calls
  const hasFetchedData = useRef(false);
  const isFetching = useRef(false);
  const isFetchingUsers = useRef(false);
  const lastUsersQueryKey = useRef('');
  const lastUsersFetchAt = useRef(0);
  const usersAbortController = useRef(null);
  const usersCache = useRef(new Map()); // queryKey -> { data, ts }

  // Optimized fetch functions with authentication awareness
  const fetchUserStats = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      setError(null);
      const userStats = await getUserCounts(token);
      
      // Ensure we have valid data structure
      const safeStats = {
        total: userStats?.total || 0,
        admins: userStats?.admins || 0,
        instructors: userStats?.instructors || 0,
        students: userStats?.students || 0,
        active: userStats?.active || 0,
        inactive: userStats?.inactive || 0
      };
      
      setStats(safeStats);
    } catch (err) {
      console.error('Error fetching user statistics:', err);
      setError(err.message);
      addNotification({
        type: 'error',
        message: 'Failed to fetch user statistics',
        duration: 5000
      });
    }
  }, [isAuthenticated, token, addNotification]);

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || !token || isFetchingUsers.current) return;
    
    const enabledFilter = debouncedFilters.enabled === '' ? null : debouncedFilters.enabled === 'true';
    const queryKey = `${debouncedFilters.role || ''}|${debouncedFilters.search || ''}|${enabledFilter ?? ''}`;

    // Serve from short-lived cache (5s) or skip if the exact same query was just fetched recently
    const now = Date.now();
    const cached = usersCache.current.get(queryKey);
    if (cached && now - cached.ts < 5000) {
      setUsers(cached.data || []);
      return;
    }
    if (queryKey === lastUsersQueryKey.current && now - lastUsersFetchAt.current < 1500) {
      return;
    }

    // Abort any in-flight request
    if (usersAbortController.current) {
      try { usersAbortController.current.abort(); } catch (_) {}
    }
    usersAbortController.current = new AbortController();
    isFetchingUsers.current = true;
    try {
      setError(null);
      const userData = await getUsers(
        token,
        debouncedFilters.role || null,
        debouncedFilters.search || null,
        enabledFilter,
        usersAbortController.current.signal
      );
      setUsers(userData || []);
      lastUsersQueryKey.current = queryKey;
      lastUsersFetchAt.current = now;
      usersCache.current.set(queryKey, { data: userData || [], ts: now });
    } catch (err) {
      if (err?.name === 'AbortError') {
        return;
      }
      console.error('Error fetching users:', err);
      setError(err.message);
      addNotification({
        type: 'error',
        message: 'Failed to fetch users',
        duration: 5000
      });
    } finally {
      isFetchingUsers.current = false;
    }
  }, [isAuthenticated, token, debouncedFilters.role, debouncedFilters.search, debouncedFilters.enabled, addNotification]);

  // Single data fetch function
  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated || !token || hasFetchedData.current || isFetching.current) return;
    
    isFetching.current = true;
    hasFetchedData.current = true;
    setLoading(true);
    
    try {
      // Fetch user statistics
      const userStats = await getUserCounts(token);
      const safeStats = {
        total: userStats?.total || 0,
        admins: userStats?.admins || 0,
        instructors: userStats?.instructors || 0,
        students: userStats?.students || 0,
        active: userStats?.active || 0,
        inactive: userStats?.inactive || 0
      };
      setStats(safeStats);

      // Fetch users (initial, no filters)
      const userData = await getUsers(token, null, null, null);
      setUsers(userData || []);
      // Record this fetch to avoid immediate duplicate by filter effect
      const initialKey = `||`;
      const now = Date.now();
      lastUsersQueryKey.current = initialKey;
      lastUsersFetchAt.current = now;
      usersCache.current.set(initialKey, { data: userData || [], ts: now });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      addNotification({
        type: 'error',
        message: 'Failed to fetch data',
        duration: 5000
      });
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [isAuthenticated, token, addNotification]);

  // Single useEffect for initial data fetch - only when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasFetchedData.current) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Intentionally exclude fetchAllData to prevent multiple calls

  // Separate useEffect for filter changes - only fetch users, not stats
  useEffect(() => {
    if (isAuthenticated && hasFetchedData.current) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters.role, debouncedFilters.search, debouncedFilters.enabled, isAuthenticated]); // Use debounced filters

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      if (prev[key] === value) return prev; // no-op if unchanged
      return {
        ...prev,
        [key]: value
      };
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(token, userId);
      setUsers(users.filter(user => user.id !== userId));
      setShowDeleteModal(false);
      setUserToDelete(null);
      // Refresh statistics after deletion
      await fetchUserStats();
      addNotification({
        type: 'success',
        message: response.message || 'User deleted successfully',
        duration: 3000
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      addNotification({
        type: 'error',
        message: 'Failed to delete user',
        duration: 5000
      });
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const response = await activateUser(token, userId);
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, enabled: true }
          : user
      ));
      // Refresh statistics after activation
      await fetchUserStats();
      addNotification({
        type: 'success',
        message: response.message || 'User activated successfully',
        duration: 3000
      });
    } catch (err) {
      console.error('Error activating user:', err);
      addNotification({
        type: 'error',
        message: 'Failed to activate user',
        duration: 5000
      });
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      const response = await deactivateUser(token, userId);
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, enabled: false }
          : user
      ));
      // Refresh statistics after deactivation
      await fetchUserStats();
      addNotification({
        type: 'success',
        message: response.message || 'User deactivated successfully',
        duration: 3000
      });
    } catch (err) {
      console.error('Error deactivating user:', err);
      addNotification({
        type: 'error',
        message: 'Failed to deactivate user',
        duration: 5000
      });
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'role-badge admin';
      case 'INSTRUCTOR':
        return 'role-badge instructor';
      case 'STUDENT':
        return 'role-badge student';
      default:
        return 'role-badge';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPercentage = (value, total) => {
    // Handle edge cases to prevent NaN
    if (!value || !total || total === 0 || isNaN(value) || isNaN(total)) {
      return 0;
    }
    
    const percentage = Math.round((value / total) * 100);
    return isNaN(percentage) ? 0 : percentage;
  };

  const safeNumber = (num) => {
    return (num && !isNaN(num)) ? num : 0;
  };

  const formatPercentage = (value, total) => {
    const percentage = getPercentage(value, total);
    return percentage > 0 ? `${percentage}% of total` : '0% of total';
  };

  // Show loading state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="user-management-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      <AdminPageHeader
        title="User Management"
        subtitle="Manage all users and view system statistics"
        onBackToDashboard={onBackToDashboard}
        actions={(
          <button
            onClick={fetchAllData}
            className="btn btn-primary btn-sm"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh All'}
          </button>
        )}
      />

      <div className="user-management-page-content">
        {/* User Statistics */}
        <div className="stats-section">
        <h2>User Statistics</h2>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading statistics...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchUserStats} className="btn btn-outline btn-sm">
              Retry
            </button>
          </div>
        ) : (
          <div className="stats-grid">
            {/* Total Users */}
            <div className="stat-card total">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5l-1.5-2c-.47-.62-1.21-.99-2.01-.99H9.46c-.8 0-1.54.37-2.01.99L5 10.5l-1.5-2C3.03 8.37 2.29 8 1.5 8H.46c-.8 0-1.54.37-2.01.99L-2 10.5v11.5h2v-6h2.5l2.54 7.63A1.5 1.5 0 0 0 5.46 24H7c.8 0 1.54-.37 2.01-.99L10 20.5l1.5 2c.47.62 1.21.99 2.01.99h1.54c.8 0 1.54-.37 2.01-.99L18 20.5l1.5 2c.47.62 1.21.99 2.01.99h1.54c.8 0 1.54-.37 2.01-.99L26 20.5v-6h2v6z"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{safeNumber(stats.total)}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>

            {/* Active Users */}
            <div className="stat-card active">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{safeNumber(stats.active)}</div>
                <div className="stat-label">Active Users</div>
                <div className="stat-percentage">
                  {formatPercentage(stats.active, stats.total)}
                </div>
              </div>
            </div>

            {/* Inactive Users */}
            <div className="stat-card inactive">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{safeNumber(stats.inactive)}</div>
                <div className="stat-label">Inactive Users</div>
                <div className="stat-percentage">
                  {formatPercentage(stats.inactive, stats.total)}
                </div>
              </div>
            </div>

            {/* Admins */}
            <div className="stat-card admin">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{safeNumber(stats.admins)}</div>
                <div className="stat-label">Administrators</div>
                <div className="stat-percentage">
                  {formatPercentage(stats.admins, stats.total)}
                </div>
              </div>
            </div>

            {/* Instructors */}
            <div className="stat-card instructor">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{safeNumber(stats.instructors)}</div>
                <div className="stat-label">Instructors</div>
                <div className="stat-percentage">
                  {formatPercentage(stats.instructors, stats.total)}
                </div>
              </div>
            </div>

            {/* Students */}
            <div className="stat-card student">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{safeNumber(stats.students)}</div>
                <div className="stat-label">Students</div>
                <div className="stat-percentage">
                  {formatPercentage(stats.students, stats.total)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="management-section">
        <h2>User Management</h2>
        
        {/* Filters */}
        <div className="filters-section">
          <div className="filters-header">
            <h3>Filters</h3>
            {(filters.role || filters.search || filters.enabled) && (
              <div className="active-filters">
                <span>Active filters:</span>
                {filters.role && <span className="filter-tag">Role: {filters.role}</span>}
                {filters.enabled && <span className="filter-tag">Status: {filters.enabled === 'true' ? 'Active' : 'Inactive'}</span>}
                {filters.search && <span className="filter-tag">Search: "{filters.search}"</span>}
                <button 
                  className="btn btn-outline btn-xs"
                  onClick={() => setFilters({ role: '', search: '', enabled: '' })}
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="role-filter">Filter by Role:</label>
              <select
                id="role-filter"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="filter-select"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="enabled-filter">Filter by Status:</label>
              <select
                id="enabled-filter"
                value={filters.enabled}
                onChange={(e) => handleFilterChange('enabled', e.target.value)}
                className="filter-select"
              >
                <option value="">All Users</option>
                <option value="true">Active Users</option>
                <option value="false">Inactive Users</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="search-filter">Search:</label>
              <input
                id="search-filter"
                type="text"
                placeholder="Search by name, email, or username..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />
            </div>

            <button 
              onClick={fetchUsers}
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchUsers} className="btn btn-outline btn-sm">
              Try Again
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="loading-row">
                    <div className="loading-spinner"></div>
                    <span>Loading users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    {filters.role || filters.search || filters.enabled ? 'No users found matching your criteria' : 'No users found'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={!user.enabled ? 'disabled-user' : ''}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.firstName && user.lastName 
                            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                            : user.username[0].toUpperCase()
                          }
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.username
                            }
                          </div>
                          <div className="user-username">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${user.enabled ? 'enabled' : 'disabled'}`}>
                        {user.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {user.enabled ? (
                          <button
                            onClick={() => handleDeactivateUser(user.id)}
                            className="btn btn-sm btn-warning"
                            title="Deactivate User"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            className="btn btn-sm btn-success"
                            title="Activate User"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="btn btn-sm btn-danger"
                          title="Delete User"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button onClick={closeDeleteModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete user{' '}
                <strong>
                  {userToDelete.firstName && userToDelete.lastName
                    ? `${userToDelete.firstName} ${userToDelete.lastName}`
                    : userToDelete.username
                  }
                </strong>?
              </p>
              <p className="warning-text">
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={closeDeleteModal} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(userToDelete.id)}
                className="btn btn-danger"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserManagementPage;
