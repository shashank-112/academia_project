import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* ACCOUNT SETTINGS */}
      <section className="settings-section">
        <h2 className="section-title">Account Settings</h2>
        
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Change Password</h3>
              <p>Update your password to keep your account secure</p>
            </div>
            <button className="setting-btn">→</button>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Update Phone Number</h3>
              <p>Change your contact phone number</p>
            </div>
            <button className="setting-btn">→</button>
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS SETTINGS */}
      <section className="settings-section">
        <h2 className="section-title">Notification Preferences</h2>
        
        <div className="settings-card toggle-card">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Email Notifications</h3>
              <p>Receive updates via email</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-card toggle-card">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Academic Alerts</h3>
              <p>Get notified about grades and exams</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-card toggle-card">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Fee Reminders</h3>
              <p>Get notified about pending fees</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      {/* HELP & SUPPORT */}
      <section className="settings-section">
        <h2 className="section-title">Help & Support</h2>
        
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Help Center</h3>
              <p>View FAQs and troubleshooting guides</p>
            </div>
            <button className="setting-btn">→</button>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Contact Support</h3>
              <p>Get in touch with our support team</p>
            </div>
            <button className="setting-btn">→</button>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Privacy Policy</h3>
              <p>Read our privacy and data protection policy</p>
            </div>
            <button className="setting-btn">→</button>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Terms of Service</h3>
              <p>View our terms and conditions</p>
            </div>
            <button className="setting-btn">→</button>
          </div>
        </div>
      </section>

      {/* LOGOUT SECTION */}
      <section className="settings-section logout-section">
        <div className="logout-card">
          <div className="logout-content">
            <h3>Logout</h3>
            <p>Sign out from your account</p>
          </div>
          <button 
            className="logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
          >
            Logout
          </button>
        </div>
      </section>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content confirmation-modal">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary logout-confirm"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
