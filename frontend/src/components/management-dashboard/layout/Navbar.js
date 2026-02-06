import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import '../styles/DashboardLayout.css';

const Navbar = ({ page, onMenuClick }) => {
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const titles = {
      'home': '📊 Dashboard',
      'students': '👨‍🎓 Students',
      'faculty': '👨‍🏫 Faculty',
      'fees': '💰 Fee Management',
      'notifications': '🔔 Notifications',
      'profile': '👤 Profile',
      'settings': '⚙️ Settings',
    };
    return titles[page] || 'Dashboard';
  };

  return (
    <nav className="mgmt-navbar">
      <h1 className="mgmt-navbar-title">{getPageTitle()}</h1>
      
      <div className="mgmt-navbar-right">
        <div className="mgmt-user-section">
          <div className="mgmt-user-info">
            <h4>{user?.first_name} {user?.last_name}</h4>
            <p>{user?.designation || 'Management'}</p>
          </div>
          <div className="mgmt-avatar">
            {user?.first_name?.charAt(0).toUpperCase()}{user?.last_name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <button onClick={logout} className="mgmt-logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
