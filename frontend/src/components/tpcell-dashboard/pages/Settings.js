import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Common.css';
import '../styles/Settings.css';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="tpcell-settings">
      <div className="page-header">
        <h2>⚙️ Settings</h2>
        <p>Manage your account and preferences</p>
      </div>

      {/* Account Settings Section */}
      <section className="settings-section">
        <h3>🔑 Account Settings</h3>
        <div className="settings-option">
          <div className="option-info">
            <h4>Password Management</h4>
            <p>Update your password to keep your account secure</p>
          </div>
          <button className="settings-action-btn">Change Password</button>
        </div>
      </section>

      {/* Notification Settings Section */}
      <section className="settings-section">
        <h3>🔔 Notification Preferences</h3>
        <div className="settings-option">
          <div className="option-info">
            <h4>Email Notifications</h4>
            <p>Receive email updates for important TP Cell events</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </section>

      {/* Support Section */}
      <section className="settings-section">
        <h3>❓ Support & Help</h3>
        <div className="settings-option">
          <div className="option-info">
            <h4>Help & Support</h4>
            <p>Need help? Contact support team</p>
          </div>
          <button className="settings-action-btn secondary">View Help</button>
        </div>
        <div className="settings-option">
          <div className="option-info">
            <h4>About TP Cell Portal</h4>
            <p>Learn more about the TP Cell management system</p>
          </div>
          <button className="settings-action-btn secondary">About</button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-section danger-zone">
        <h3>⚠️ Danger Zone</h3>
        <div className="settings-option">
          <div className="option-info">
            <h4>Logout</h4>
            <p>Sign out from TP Cell Portal</p>
          </div>
          <button className="settings-action-btn danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
