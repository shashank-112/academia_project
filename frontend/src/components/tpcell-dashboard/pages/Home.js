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

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading TP Cell portal...</p>
      </div>
    );
  }

  return (
    <div className="tpcell-home">
      {error && <div className="error-banner">{error}</div>}

      {/* TP Cell Staff Summary */}
      <section className="home-summary">
        <div className="summary-card">
          <div className="summary-icon">👨‍💼</div>
          <div className="summary-content">
            <h3>TP Cell Officer</h3>
            <p className="summary-name">{profile?.first_name} {profile?.last_name}</p>
            <p className="summary-designation">{profile?.designation}</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="home-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">👥</div>
          <div className="stat-content">
            <p className="stat-label">Total Students</p>
            <h2 className="stat-number">{stats?.total_students || 0}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">⚠️</div>
          <div className="stat-content">
            <p className="stat-label">Students with Backlogs</p>
            <h2 className="stat-number">{stats?.students_with_backlogs || 0}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">✅</div>
          <div className="stat-content">
            <p className="stat-label">Eligible for Placement</p>
            <h2 className="stat-number">{stats?.eligible_students || 0}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-info">📊</div>
          <div className="stat-content">
            <p className="stat-label">Avg. CGPA</p>
            <h2 className="stat-number">{stats?.avg_cgpa?.toFixed(2) || 0}</h2>
          </div>
        </div>
      </section>

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
