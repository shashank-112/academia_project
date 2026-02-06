import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import '../../student-dashboard/styles/Navbar.css';

const TPCellNavbar = ({ user: propUser }) => {
  const { user: authUser, logout } = useAuth();
  const user = propUser || authUser || {};
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="brand-logo">🎯</div>
          <div className="brand-text">
            <h1>Academia</h1>
            <p>TP Cell</p>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-badge">0</span>
        </div>

        <div 
          className="profile-menu-trigger"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="student-info">
            <p className="student-name">{user?.first_name || 'User'}</p>
            <p className="student-role">{user?.designation || 'Staff'}</p>
          </div>
          <div className="avatar">
            {user?.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>

        {showProfileMenu && (
          <div className="profile-dropdown">
            <div className="dropdown-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              View Profile
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item logout" onClick={logout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TPCellNavbar;
