import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Common.css';
import '../styles/Settings.css';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="faculty-settings">
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p className="page-subtitle">Manage your account</p>
      </div>

      {/* ACCOUNT SETTINGS */}
      <section className="settings-section">
        <h2 className="section-title">Account Settings</h2>
        <div className="settings-options">
          <button className="settings-option">
            <span className="option-icon">🔐</span>
            <div className="option-content">
              <h3>Change Password</h3>
              <p>Update your account password</p>
            </div>
            <span className="option-arrow">→</span>
          </button>

          <button className="settings-option">
            <span className="option-icon">🔔</span>
            <div className="option-content">
              <h3>Notifications</h3>
              <p>Manage notification preferences</p>
            </div>
            <span className="option-arrow">→</span>
          </button>

          <button className="settings-option">
            <span className="option-icon">🌙</span>
            <div className="option-content">
              <h3>Appearance</h3>
              <p>Theme and display settings</p>
            </div>
            <span className="option-arrow">→</span>
          </button>
        </div>
      </section>

      {/* SUPPORT SECTION */}
      <section className="settings-section">
        <h2 className="section-title">Support</h2>
        <div className="settings-options">
          <button className="settings-option">
            <span className="option-icon">❓</span>
            <div className="option-content">
              <h3>Help & Support</h3>
              <p>Get help with common issues</p>
            </div>
            <span className="option-arrow">→</span>
          </button>

          <button className="settings-option">
            <span className="option-icon">ℹ️</span>
            <div className="option-content">
              <h3>About</h3>
              <p>About Faculty Portal</p>
            </div>
            <span className="option-arrow">→</span>
          </button>
        </div>
      </section>

      {/* LOGOUT SECTION */}
      <section className="settings-section danger-section">
        <h2 className="section-title">Session</h2>
        <button onClick={handleLogout} className="logout-btn-large">
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </section>
    </div>
  );
};

export default Settings;





