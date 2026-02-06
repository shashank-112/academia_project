import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getProfile();
      setProfile(data);
      setPhone(data.phone_number || '');
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <h1>My Profile</h1>
        <p className="page-subtitle">Manage your personal details</p>
      </div>

      {/* PROFILE HEADER */}
      <section className="profile-header-section">
        <div className="profile-card-header">
          <div className="avatar-large">
            {profile?.first_name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-name-section">
            <h2>{profile?.first_name} {profile?.last_name}</h2>
            <p className="profile-id">ID: {profile?.student_id}</p>
          </div>
        </div>
      </section>

      {/* PERSONAL INFORMATION */}
      <section className="info-section">
        <h2 className="section-title">Personal Information</h2>
        <div className="info-grid">
          <div className="info-card">
            <label className="info-label">First Name</label>
            <p className="info-value">{profile?.first_name}</p>
          </div>
          <div className="info-card">
            <label className="info-label">Last Name</label>
            <p className="info-value">{profile?.last_name}</p>
          </div>
          <div className="info-card">
            <label className="info-label">Gender</label>
            <p className="info-value">{profile?.gender || 'Not specified'}</p>
          </div>
          <div className="info-card">
            <label className="info-label">Email (Read-only)</label>
            <p className="info-value">{profile?.email}</p>
          </div>

          <div className="info-card editable">
            <label className="info-label">Phone Number</label>
            {!editingPhone ? (
              <div className="editable-value">
                <p className="info-value">{phone || 'Not added'}</p>
                <button 
                  className="edit-btn"
                  onClick={() => setEditingPhone(true)}
                >
                  ✏️ Edit
                </button>
              </div>
            ) : (
              <div className="edit-input-wrap">
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button className="save-btn">Save</button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setEditingPhone(false);
                      setPhone(profile?.phone_number || '');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ACADEMIC INFORMATION */}
      <section className="info-section">
        <h2 className="section-title">Academic Information</h2>
        <div className="info-grid">
          <div className="info-card">
            <label className="info-label">Roll Number</label>
            <p className="info-value">{profile?.roll_no}</p>
          </div>
          <div className="info-card">
            <label className="info-label">Branch</label>
            <p className="info-value">{profile?.branch || 'CSE'}</p>
          </div>
          <div className="info-card">
            <label className="info-label">Year</label>
            <p className="info-value">Year {profile?.year_id}</p>
          </div>
          <div className="info-card">
            <label className="info-label">Section</label>
            <p className="info-value">{profile?.section_id}</p>
          </div>
          <div className="info-card">
            <label className="info-label">SSC Marks</label>
            <p className="info-value">{profile?.ssc_marks || 'Not available'}</p>
          </div>
          <div className="info-card">
            <label className="info-label">Inter Marks</label>
            <p className="info-value">{profile?.inter_marks || 'Not available'}</p>
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section className="security-section">
        <h2 className="section-title">Security</h2>
        <div className="security-card">
          <h3>Change Password</h3>
          <p className="security-desc">Update your password regularly to keep your account secure</p>
          <button 
            className="action-btn change-password-btn"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
        </div>
      </section>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Change Password</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Confirm new password" />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button className="btn-primary">Update Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
