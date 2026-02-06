import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { managementService } from '../../../services/api';
import '../styles/Settings.css';
import '../styles/Common.css';

const Settings = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (field, value) => {
    setPasswordData({...passwordData, [field]: value});
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await managementService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to change password. Please check your current password.');
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="mgmt-settings-container">
      <div className="mgmt-page-header">
        <h1>Settings</h1>
        <p className="mgmt-page-subtitle">Account and security management</p>
      </div>

      {/* Change Password Section */}
      <div className="mgmt-settings-section">
        <h3>
          <span className="mgmt-settings-icon">🔐</span>
          Change Password
        </h3>

        {error && <div className="mgmt-error-message">{error}</div>}
        {success && <div className="mgmt-success-message">{success}</div>}

        <form onSubmit={handleChangePassword}>
          <div className="mgmt-password-form">
            <div className="mgmt-form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Enter your current password"
              />
              <span className="mgmt-password-helper">For security verification</span>
            </div>

            <div className="mgmt-form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
              <span className="mgmt-password-helper">At least 6 characters</span>
            </div>

            <div className="mgmt-form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Re-enter new password"
              />
              <span className="mgmt-password-helper">Must match new password</span>
            </div>

            <div className="mgmt-form-actions">
              <button type="button" className="mgmt-btn-secondary" onClick={() => setPasswordData({currentPassword: '', newPassword: '', confirmPassword: ''})}>
                Clear
              </button>
              <button type="submit" className="mgmt-btn-primary" disabled={loading}>
                {loading ? 'Updating...' : '🔒 Change Password'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Notification Preferences Section */}
      <div className="mgmt-settings-section">
        <h3>
          <span className="mgmt-settings-icon">🔔</span>
          Notification Preferences
        </h3>

        <div className="mgmt-settings-option">
          <div className="mgmt-settings-option-left">
            <h4>Email Notifications</h4>
            <p>Receive important updates via email</p>
          </div>
          <input type="checkbox" defaultChecked style={{cursor: 'pointer', width: '20px', height: '20px'}} />
        </div>

        <div className="mgmt-settings-option">
          <div className="mgmt-settings-option-left">
            <h4>Fee-related Alerts</h4>
            <p>Get notified about fee collection and pending fees</p>
          </div>
          <input type="checkbox" defaultChecked style={{cursor: 'pointer', width: '20px', height: '20px'}} />
        </div>

        <div className="mgmt-settings-option">
          <div className="mgmt-settings-option-left">
            <h4>System Updates</h4>
            <p>Receive notifications about system maintenance and updates</p>
          </div>
          <input type="checkbox" style={{cursor: 'pointer', width: '20px', height: '20px'}} />
        </div>
      </div>

      {/* Help & Support Section */}
      <div className="mgmt-settings-section">
        <h3>
          <span className="mgmt-settings-icon">❓</span>
          Help & Support
        </h3>

        <div className="mgmt-settings-option">
          <div className="mgmt-settings-option-left">
            <h4>View Documentation</h4>
            <p>Access the complete user guide and documentation</p>
          </div>
          <a href="#" style={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}>→</a>
        </div>

        <div className="mgmt-settings-option">
          <div className="mgmt-settings-option-left">
            <h4>Report an Issue</h4>
            <p>Report bugs or technical issues to our support team</p>
          </div>
          <a href="#" style={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}>→</a>
        </div>

        <div className="mgmt-settings-option">
          <div className="mgmt-settings-option-left">
            <h4>Contact Support</h4>
            <p>Email: support@academia.edu | Phone: +91-9876543210</p>
          </div>
          <a href="mailto:support@academia.edu" style={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}>→</a>
        </div>
      </div>

      {/* Logout Section - Highlighted */}
      <div className="mgmt-settings-section mgmt-logout-section">
        <h3>
          <span className="mgmt-settings-icon">🚪</span>
          Logout
        </h3>

        <p className="mgmt-logout-description">
          You are currently logged in. Click the button below to logout from your account. 
          You will need to log in again to access the management dashboard.
        </p>

        <button className="mgmt-logout-btn-primary" onClick={handleLogout}>
          🚪 Logout from Account
        </button>
      </div>

      {/* Account Information */}
      <div className="mgmt-settings-section">
        <h3>
          <span className="mgmt-settings-icon">ℹ️</span>
          System Information
        </h3>

        <div className="mgmt-settings-option">
          <div className="mgmt-settings-option-left">
            <h4>Application Version</h4>
            <p>Academia Management System v1.0</p>
          </div>
        </div>

        <div className="mgmt-settings-option">
          <div className="mgmt-settings-option-left">
            <h4>Last Updated</h4>
            <p>February 6, 2025</p>
          </div>
        </div>

        <div className="mgmt-settings-option">
          <div className="mgmt-settings-option-left">
            <h4>Privacy Policy</h4>
            <p>Read our privacy policy and terms of service</p>
          </div>
          <a href="#" style={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}>→</a>
        </div>
      </div>
    </div>
  );
};

export default Settings;
