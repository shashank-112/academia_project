import React, { useState, useEffect } from 'react';
import { facultyService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await facultyService.getProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    <div className="faculty-profile">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <h1>👤 Profile</h1>
        <p className="page-subtitle">Your faculty information</p>
      </div>

      {profile && (
        <>
          {/* PERSONAL INFO SECTION */}
          <section className="profile-section">
            <h2 className="section-title">Personal Information</h2>
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
                <label>Email (Read-Only)</label>
                <p>{profile.email}</p>
              </div>
              <div className="profile-item">
                <label>Gender</label>
                <p>{profile.gender || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* PROFESSIONAL INFO SECTION */}
          <section className="profile-section">
            <h2 className="section-title">Professional Information</h2>
            <div className="profile-grid">
              <div className="profile-item">
                <label>Department</label>
                <p>{profile.department || 'N/A'}</p>
              </div>
              <div className="profile-item">
                <label>Designation</label>
                <p>{profile.designation || 'N/A'}</p>
              </div>
              <div className="profile-item full-width">
                <label>Qualifications</label>
                <p>{profile.qualifications || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* CHANGE PASSWORD SECTION */}
          <section className="profile-section">
            <h2 className="section-title">Security</h2>
            <button className="change-password-btn">Change Password</button>
          </section>
        </>
      )}
    </div>
  );
};

export default Profile;
