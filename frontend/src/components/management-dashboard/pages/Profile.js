import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { managementService } from '../../../services/api';
import '../styles/Profile.css';
import '../styles/Common.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await managementService.getProfile();
      setProfile(data);
      setEditData(data);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
      // Demo data
      setProfile({
        first_name: user?.first_name || 'John',
        last_name: user?.last_name || 'Doe',
        email: user?.email || 'john.doe@college.edu',
        gender: 'Male',
        designation: user?.designation || 'Administrator',
        emp_id: 'MGT001'
      });
      setEditData({
        first_name: user?.first_name || 'John',
        last_name: user?.last_name || 'Doe',
        email: user?.email || 'john.doe@college.edu',
        gender: 'Male',
        designation: user?.designation || 'Administrator',
        emp_id: 'MGT001'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData({...editData, [field]: value});
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await managementService.updateProfile(editData);
      setProfile(editData);
      setIsEditing(false);
      // Show success message
      setTimeout(() => {
        alert('Profile updated successfully!');
      }, 500);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  return (
    <div className="mgmt-profile-container">
      {error && <div className="mgmt-error-banner">{error}</div>}

      {/* Profile Header */}
      <div className="mgmt-profile-header">
        <div className="mgmt-profile-avatar">
          {profile?.first_name?.charAt(0).toUpperCase()}{profile?.last_name?.charAt(0).toUpperCase()}
        </div>
        <div className="mgmt-profile-header-info">
          <h2>{profile?.first_name} {profile?.last_name}</h2>
          <p>{profile?.designation}</p>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="mgmt-profile-section">
        <h3>👤 Personal Information</h3>
        
        {!isEditing ? (
          <>
            <div className="mgmt-profile-info-grid">
              <div className="mgmt-info-box">
                <label className="mgmt-info-label">First Name</label>
                <div className="mgmt-info-value">{profile?.first_name}</div>
              </div>
              <div className="mgmt-info-box">
                <label className="mgmt-info-label">Last Name</label>
                <div className="mgmt-info-value">{profile?.last_name}</div>
              </div>
              <div className="mgmt-info-box">
                <label className="mgmt-info-label">Gender</label>
                <div className="mgmt-info-value">{profile?.gender}</div>
              </div>
              <div className="mgmt-info-box">
                <label className="mgmt-info-label">Email</label>
                <div className="mgmt-info-value read-only">{profile?.email}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="mgmt-editable-form">
            <div className="mgmt-form-group">
              <label>First Name</label>
              <input
                type="text"
                value={editData.first_name}
                onChange={(e) => handleEditChange('first_name', e.target.value)}
              />
            </div>
            <div className="mgmt-form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={editData.last_name}
                onChange={(e) => handleEditChange('last_name', e.target.value)}
              />
            </div>
            <div className="mgmt-form-group">
              <label>Gender</label>
              <select value={editData.gender || ''} onChange={(e) => handleEditChange('gender', e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mgmt-form-group">
              <label>Email (Read-only)</label>
              <input type="email" value={editData.email} disabled />
            </div>
          </div>
        )}
      </div>

      {/* Professional Information Section */}
      <div className="mgmt-profile-section">
        <h3>💼 Professional Information</h3>

        {!isEditing ? (
          <div className="mgmt-profile-info-grid">
            <div className="mgmt-info-box">
              <label className="mgmt-info-label">Employee ID</label>
              <div className="mgmt-info-value">{profile?.emp_id}</div>
            </div>
            <div className="mgmt-info-box">
              <label className="mgmt-info-label">Designation</label>
              <div className="mgmt-info-value">{profile?.designation}</div>
            </div>
          </div>
        ) : (
          <div className="mgmt-editable-form">
            <div className="mgmt-form-group">
              <label>Employee ID</label>
              <input
                type="text"
                value={editData.emp_id || ''}
                onChange={(e) => handleEditChange('emp_id', e.target.value)}
              />
            </div>
            <div className="mgmt-form-group">
              <label>Designation</label>
              <select value={editData.designation || ''} onChange={(e) => handleEditChange('designation', e.target.value)}>
                <option value="">Select Designation</option>
                <option value="Administrator">Administrator</option>
                <option value="Finance Officer">Finance Officer</option>
                <option value="Academic Officer">Academic Officer</option>
                <option value="Registrar">Registrar</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mgmt-profile-actions">
          {!isEditing ? (
            <button className="mgmt-btn-edit" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button className="mgmt-btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="mgmt-btn-save" onClick={handleSaveProfile} disabled={loading}>
                {loading ? 'Saving...' : '✓ Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
