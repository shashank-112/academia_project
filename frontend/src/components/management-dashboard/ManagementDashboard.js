import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { managementService } from '../../services/api';
import '../Dashboard.css';

const ManagementDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileData = await managementService.getProfile();
      setProfile(profileData);
    } catch (err) {
      setError('Failed to load management data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>👔 Management Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      {error && <div className="error-alert">{error}</div>}

      <main className="dashboard-content">
        <section className="dashboard-section">
          <h2>Profile Information</h2>
          {profile && (
            <div className="info-grid">
              <div className="info-item">
                <label>Employee ID</label>
                <p>{profile.emp_id}</p>
              </div>
              <div className="info-item">
                <label>Name</label>
                <p>{profile.first_name} {profile.last_name}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{profile.email}</p>
              </div>
              <div className="info-item">
                <label>Designation</label>
                <p>{profile.designation}</p>
              </div>
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">📊 View Reports</button>
            <button className="action-btn">💰 Manage Fees</button>
            <button className="action-btn">📋 View Noifications</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ManagementDashboard;
