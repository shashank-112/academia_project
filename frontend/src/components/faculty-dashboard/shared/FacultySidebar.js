import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Common.css';
import '../styles/FacultySidebar.css';

const FacultySidebar = () => {
  const location = useLocation();

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/faculty' },
    { id: 'courses', label: 'Courses', icon: '📚', path: '/faculty/courses' },
    { id: 'students', label: 'Students', icon: '👥', path: '/faculty/students' },
    { id: 'assessments', label: 'Assessments', icon: '📊', path: '/faculty/assessments' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/faculty/notifications' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/faculty/profile' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/faculty/settings' },
  ];

  const isActive = (path) => {
    if (path === '/faculty') {
      return location.pathname === '/faculty';
    }
    return location.pathname === path;
  };

  return (
    <aside className="faculty-sidebar">
      <div className="faculty-sidebar-content">
        <nav className="faculty-menu">
          {menuItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`faculty-menu-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="faculty-menu-icon">{item.icon}</span>
              <span className="faculty-menu-label">{item.label}</span>
              {isActive(item.path) && <span className="faculty-menu-indicator"></span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default FacultySidebar;
