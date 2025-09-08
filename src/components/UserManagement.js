import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { activateUser, deactivateUser, deleteUser, getUsers } from '../services/userService';
import './UserManagement.css';

const UserManagement = ({ onBackToDashboard }) => {
  const { token, addNotification } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    enabled: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users when component mounts or filters change
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const enabledFilter = filters.enabled === '' ? null : filters.enabled === 'true';
      const userData = await getUsers(token, filters.role || null, filters.search || null, enabledFilter);
      setUsers(userData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      addNotification({
        type: 'error',
        message: 'Failed to fetch users',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(token, userId);
      setUsers(users.filter(user => user.id !== userId));
      setShowDeleteModal(false);
      setUserToDelete(null);
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

  if (loading && users.length === 0) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div className="header-content">
          <div className="header-text">
            <h2>User Management</h2>
            <p>Manage all users in the system</p>
          </div>
          {onBackToDashboard && (
            <button 
              className="btn btn-outline btn-sm"
              onClick={onBackToDashboard}
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
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
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {filters.role || filters.search ? 'No users found matching your criteria' : 'No users found'}
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
  );
};

export default UserManagement;
