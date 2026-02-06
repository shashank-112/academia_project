import React from 'react';
import '../styles/Common.css';
import '../styles/FacultyNavbar.css';

const FacultyNavbar = ({ user }) => {
  return (
    <nav className="faculty-navbar">
      <div className="faculty-navbar-container">
        {/* Left: App Name */}
        <div className="faculty-navbar-brand">
          <span className="faculty-app-icon">👨‍🏫</span>
          <span className="faculty-app-name">Faculty Portal</span>
        </div>

        {/* Right: User Profile */}
        <div className="faculty-navbar-user">
          <div className="faculty-user-info">
            <span className="faculty-user-name">{user?.first_name} {user?.last_name}</span>
            <span className="faculty-user-role">{user?.role || 'Faculty'}</span>
          </div>
          <div className="faculty-user-avatar">
            {user?.first_name?.charAt(0)}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FacultyNavbar;
