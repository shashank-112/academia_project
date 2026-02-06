import React from 'react';
import '../styles/Common.css';
import '../styles/TPCellNavbar.css';

const TPCellNavbar = ({ user }) => {
  return (
    <nav className="tpcell-navbar">
      <div className="tpcell-navbar-container">
        {/* Left: App Name */}
        <div className="tpcell-navbar-brand">
          <span className="tpcell-app-icon">🎯</span>
          <h1 className="tpcell-app-name">TP Cell</h1>
        </div>

        {/* Right: User Profile */}
        <div className="tpcell-navbar-profile">
          <div className="tpcell-user-info">
            <p className="tpcell-user-name">{user?.first_name || 'User'}</p>
            <p className="tpcell-user-role">{user?.designation || 'Staff'}</p>
          </div>
          <div className="tpcell-avatar">
            {user?.first_name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TPCellNavbar;
