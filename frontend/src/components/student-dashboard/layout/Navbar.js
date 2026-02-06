import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { studentService } from '../../../services/api';
import '../styles/Navbar.css';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [studentName, setStudentName] = useState('Student');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const profile = await studentService.getProfile();
        setStudentName(`${profile.first_name} ${profile.last_name}`);
      } catch (err) {
        console.error('Failed to load student name:', err);
      }
    };
    loadStudentData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="navbar-brand">
          <div className="brand-logo">🎓</div>
          <div className="brand-text">
            <h1>Academia</h1>
            <p>Student Portal</p>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-badge">3</span>
        </div>

        <div 
          className="profile-menu-trigger"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="student-info">
            <p className="student-name">{studentName}</p>
            <p className="student-role">Student</p>
          </div>
          <div className="avatar">
            {studentName.charAt(0).toUpperCase()}
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
            <div className="dropdown-item logout" onClick={handleLogout}>
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

export default Navbar;
