import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { activateUser, deactivateUser, deleteUser, getUserCounts, getUsers, updateUser } from '../services/userService';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userCounts, setUserCounts] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    enabled: true,
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    bio: ''
  });

  // Fetch users when component mounts or filters change
  useEffect(() => {
    fetchUsers();
    fetchUserCounts();
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

  const fetchUserCounts = async () => {
    try {
      const counts = await getUserCounts(token);
      setUserCounts(counts);
    } catch (err) {
      console.error('Error fetching user counts:', err);
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

  const openEditModal = (user) => {
    setUserToEdit(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      enabled: user.enabled,
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      address: user.address || '',
      bio: user.bio || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setUserToEdit(null);
    setEditFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'STUDENT',
      enabled: true,
      phoneNumber: '',
      dateOfBirth: '',
      address: '',
      bio: ''
    });
  };

  const handleEditUser = async () => {
    try {
      setLoading(true);
      const response = await updateUser(token, userToEdit.id, editFormData);
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === userToEdit.id ? { ...user, ...response } : user
      ));
      
      addNotification({
        type: 'success',
        message: 'User updated successfully',
        duration: 3000
      });
      
      closeEditModal();
      fetchUserCounts(); // Refresh counts
    } catch (err) {
      console.error('Error updating user:', err);
      addNotification({
        type: 'error',
        message: 'Failed to update user',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
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
              className="btn btn-primary btn-sm"
              onClick={onBackToDashboard}
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
        
        {/* User Statistics Section */}
        {userCounts && (
          <div className="user-stats-section">
            <div className="user-stats">
              <div className="stat-item">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <span className="stat-number">{userCounts.totalUsers}</span>
                  <span className="stat-label">Total Users</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <span className="stat-number">{userCounts.activeUsers}</span>
                  <span className="stat-label">Active</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">👑</div>
                <div className="stat-content">
                  <span className="stat-number">{userCounts.adminCount}</span>
                  <span className="stat-label">Admins</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">👨‍🏫</div>
                <div className="stat-content">
                  <span className="stat-number">{userCounts.instructorCount}</span>
                  <span className="stat-label">Instructors</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">🎓</div>
                <div className="stat-content">
                  <span className="stat-number">{userCounts.studentCount}</span>
                  <span className="stat-label">Students</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
              <th>Phone</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
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
                  <td>{user.phoneNumber || '-'}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</td>
                  <td>
                    <span className={`status-badge ${user.enabled ? 'enabled' : 'disabled'}`}>
                      {user.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openEditModal(user)}
                        className="btn btn-sm btn-primary"
                        title="Edit User"
                      >
                        Edit
                      </button>
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

      {/* Edit User Modal */}
      {showEditModal && userToEdit && (
        <div className="modal-overlay">
          <div className="modal edit-user-modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={closeEditModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <form className="edit-user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-username">Username *</label>
                    <input
                      type="text"
                      id="edit-username"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-email">Email *</label>
                    <input
                      type="email"
                      id="edit-email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-firstName">First Name *</label>
                    <input
                      type="text"
                      id="edit-firstName"
                      value={editFormData.firstName}
                      onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-lastName">Last Name *</label>
                    <input
                      type="text"
                      id="edit-lastName"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-role">Role *</label>
                    <select
                      id="edit-role"
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                      required
                    >
                      <option value="STUDENT">Student</option>
                      <option value="INSTRUCTOR">Instructor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-enabled">Status</label>
                    <select
                      id="edit-enabled"
                      value={editFormData.enabled}
                      onChange={(e) => setEditFormData({...editFormData, enabled: e.target.value === 'true'})}
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-phone">Phone Number</label>
                    <input
                      type="tel"
                      id="edit-phone"
                      value={editFormData.phoneNumber}
                      onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-dob">Date of Birth</label>
                    <input
                      type="date"
                      id="edit-dob"
                      value={editFormData.dateOfBirth}
                      onChange={(e) => setEditFormData({...editFormData, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-address">Address</label>
                  <textarea
                    id="edit-address"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-bio">Bio</label>
                  <textarea
                    id="edit-bio"
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={closeEditModal} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
