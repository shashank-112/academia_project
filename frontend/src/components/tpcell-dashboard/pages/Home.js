import React, { useState, useEffect } from 'react';
import { tpcellService, notificationService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/Home.css';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData, notificationsData] = await Promise.all([
        tpcellService.getProfile(),
        tpcellService.getStats(),
        notificationService.getNotifications(),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setNotifications(notificationsData.slice(0, 5));
    } catch (err) {
      console.error('ERROR LOADING TP CELL DATA:', err);
      
      let errorMsg = 'Failed to load TP Cell portal data';
      if (err.response && err.response.data && err.response.data.error) {
        errorMsg = err.response.data.error;
      } else if (err.response && err.response.status === 404) {
        errorMsg = 'Employee record not found. Make sure you have a valid TP Cell profile in the system.';
      } else if (err.response && err.response.status === 500) {
        errorMsg = 'Server error. Please check backend logs or contact administrator.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      console.error('Final error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tpcell-home">
      {error && <div className="error-banner">{error}</div>}

      {/* TP Cell Staff Summary */}
      <div className="summary-card">
        <h2>Welcome, {profile?.first_name}!</h2>
        <div className="summary-info">
          <div className="summary-item">
            <label>Full Name</label>
            <span>{profile?.first_name} {profile?.last_name}</span>
          </div>
          <div className="summary-item">
            <label>Designation</label>
            <span>{profile?.designation}</span>
          </div>
          <div className="summary-item">
            <label>Department</label>
            <span>{profile?.department || 'TP Cell'}</span>
          </div>
          <div className="summary-item">
            <label>Status</label>
            <span className="status-badge">Active</span>
          </div>
        </div>
      </div>

      {/* Stats Section (styled like management) */}
      <div className="mgmt-stats-grid">
        <div className="mgmt-stat-card">
          <div className="stat-icon stat-icon-primary">👥</div>
          <h3>Total Students</h3>
          <p className="stat-value">{stats?.total_students || 0}</p>
          <span className="stat-change">Active students in system</span>
        </div>

        <div className="mgmt-stat-card">
          <div className="stat-icon stat-icon-warning">⚠️</div>
          <h3>Students with Backlogs</h3>
          <p className="stat-value">{stats?.students_with_backlogs || 0}</p>
          <span className="stat-change">Requiring academic attention</span>
        </div>

        <div className="mgmt-stat-card">
          <div className="stat-icon stat-icon-success">✅</div>
          <h3>Eligible for Placement</h3>
          <p className="stat-value">{stats?.eligible_students || 0}</p>
          <span className="stat-change">Ready for opportunities</span>
        </div>

        <div className="mgmt-stat-card">
          <div className="stat-icon stat-icon-info">📊</div>
          <h3>Avg. CGPA</h3>
          <p className="stat-value">{stats?.avg_cgpa?.toFixed(2) || 0}</p>
          <span className="stat-change">Class performance metric</span>
        </div>
      </div>

      {/* Recent Notifications */}
      <section className="home-notifications">
        <h3 className="section-title">📢 Recent Notifications</h3>
        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div key={notif.id} className="notification-item">
                <div className="notification-type-badge">{notif.notification_type}</div>
                <div className="notification-content">
                  <h4>{notif.title}</h4>
                  <p>{notif.description}</p>
                </div>
                <span className="notification-date">
                  {new Date(notif.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No Notifications</h2>
            <p>You haven't sent any notifications yet</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
