import React from 'react';

const AdminPageHeader = ({ title, subtitle, onBackToDashboard, showAdminBadge = true, actions = null }) => {
  return (
    <div className="master-data-header">
      <div className="header-content">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="header-actions">
        {onBackToDashboard && (
          <button 
            className="btn btn-primary"
            onClick={onBackToDashboard}
            style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: 'white' }}
          >
            ← Back to Dashboard
          </button>
        )}
        {showAdminBadge && (
          <div className="admin-badge">
            <span className="badge-icon">👑</span>
            <span>Admin Access</span>
          </div>
        )}
        {actions}
      </div>
    </div>
  );
};

export default AdminPageHeader;


