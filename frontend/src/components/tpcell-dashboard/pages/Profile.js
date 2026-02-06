import React, { useState, useEffect } from 'react';
import { tpcellService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await tpcellService.getProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    // TODO: Implement password change API call
    setShowPasswordForm(false);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="tpcell-profile">
      <div className="page-header">
        <h2>👤 Profile</h2>
        <p>Manage your TP Cell staff profile</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {profile && (
        <div className="profile-container">
          {/* Personal Information Section */}
          <section className="profile-section">
            <div className="section-header">
              <h3>👤 Personal Information</h3>
            </div>
            <div className="profile-grid">
              <div className="profile-item">
                <label>First Name</label>
                <p>{profile.first_name}</p>
              </div>
              <div className="profile-item">
                <label>Last Name</label>
                <p>{profile.last_name}</p>
              </div>
              <div className="profile-item">
                <label>Gender</label>
                <p>{profile.gender}</p>
              </div>
              <div className="profile-item">
                <label>Email</label>
                <p>{profile.email}</p>
              </div>
            </div>
          </section>

          {/* Professional Information Section */}
          <section className="profile-section">
            <div className="section-header">
              <h3>💼 Professional Information</h3>
            </div>
            <div className="profile-grid">
              <div className="profile-item">
                <label>Employee ID</label>
                <p>{profile.emp_id}</p>
              </div>
              <div className="profile-item">
                <label>Designation</label>
                <p>{profile.designation}</p>
              </div>
            </div>
          </section>

          {/* Change Password Section */}
          <section className="profile-section">
            <div className="section-header">
              <h3>🔐 Security</h3>
              <button
                className="profile-action-btn"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="password-form">
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">
                  Update Password
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Profile;
