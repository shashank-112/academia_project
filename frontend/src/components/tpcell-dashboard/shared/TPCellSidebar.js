import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Common.css';
import '../styles/TPCellSidebar.css';

const TPCellSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/tpcell' },
    { id: 'students', label: 'Students', icon: '👥', path: '/tpcell/students' },
    { id: 'notifications', label: 'Notifications', icon: '📢', path: '/tpcell/notifications' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/tpcell/profile' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/tpcell/settings' },
  ];

  const isActive = (path) => {
    if (path === '/tpcell') {
      return location.pathname === '/tpcell' || location.pathname === '/tpcell/';
    }
    return location.pathname === path;
  };

  return (
    <aside className="tpcell-sidebar">
      <div className="tpcell-sidebar-content">
        <nav className="tpcell-menu">
          {menuItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`tpcell-menu-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="tpcell-menu-icon">{item.icon}</span>
              <span className="tpcell-menu-label">{item.label}</span>
              {isActive(item.path) && <span className="tpcell-menu-indicator"></span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default TPCellSidebar;
