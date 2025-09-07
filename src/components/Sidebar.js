import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const { user, setCurrentPage } = useApp();
  const navigate = useNavigate();

  const handleNavigation = (path, pageName) => {
    setCurrentPage(pageName);
    navigate(path);
  };

  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', path: `/dashboard/${user.role.toLowerCase()}`, icon: '🏠' },
      { name: 'Profile', path: '/profile', icon: '👤' },
      { name: 'Settings', path: '/settings', icon: '⚙️' }
    ];

    switch (user.role) {
      case 'STUDENT':
        return [
          ...baseItems,
          { name: 'My Courses', path: '/courses', icon: '📚' },
          { name: 'Assignments', path: '/assignments', icon: '📝' },
          { name: 'Progress', path: '/progress', icon: '📊' },
          { name: 'Achievements', path: '/achievements', icon: '🏆' },
          { name: 'Forum', path: '/forum', icon: '💬' }
        ];
      
      case 'INSTRUCTOR':
        return [
          ...baseItems,
          { name: 'My Courses', path: '/instructor/courses', icon: '📚' },
          { name: 'Students', path: '/instructor/students', icon: '👥' },
          { name: 'Assignments', path: '/instructor/assignments', icon: '📝' },
          { name: 'Analytics', path: '/instructor/analytics', icon: '📊' },
          { name: 'Forum', path: '/instructor/forum', icon: '💬' }
        ];
      
      case 'ADMIN':
        return [
          ...baseItems,
          { name: 'Users', path: '/admin/users', icon: '👥' },
          { name: 'Courses', path: '/admin/courses', icon: '📚' },
          { name: 'Analytics', path: '/admin/analytics', icon: '📊' },
          { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
          { name: 'Reports', path: '/admin/reports', icon: '📈' }
        ];
      
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h3>Navigation</h3>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  className="sidebar-item"
                  onClick={() => handleNavigation(item.path, item.name)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-text">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
