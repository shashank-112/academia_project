import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { studentService, notificationService } from '../../../services/api';
import '../styles/Home.css';

const Home = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [backlogs, setBacklogs] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, academicsData, backlogsData, notifData] = await Promise.all([
        studentService.getProfile(),
        studentService.getAcademics(),
        studentService.getBacklogs(),
        notificationService.getNotifications(),
      ]);
      
      setProfile(profileData);
      setAcademics(academicsData);
      setBacklogs(backlogsData);
      setNotifications(Array.isArray(notifData) ? notifData.slice(0, 5) : []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCGPA = () => {
    if (!academics || academics.length === 0) return 0;
    const totalMarks = academics.reduce((sum, a) => sum + (a.marks || 0), 0);
    return (totalMarks / academics.length).toFixed(2);
  };

  const backlogCount = backlogs?.length || 0;
  const feeStatus = { due: 0, amount: 0 }; // You'll update this with fee data
  const notificationCount = notifications.length;

  return (
    <div className="home-page">
      {error && <div className="error-banner">{error}</div>}

      {/* STUDENT SUMMARY CARD */}
      <section className="summary-section">
        <div className="summary-card">
          <div style={{marginBottom: '0px'}} className="summary-header">
            <h1 className="welcome-title">Welcome back, {profile?.first_name}! 👋</h1>
            <p className="summary-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          

          <div className="student-details-grid">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{profile?.first_name} {profile?.last_name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Roll Number</span>
              <span className="detail-value">{profile?.roll_no}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Branch</span>
              <span className="detail-value">{profile?.branch || 'CSE'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Year</span>
              <span className="detail-value">Year {profile?.year_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Section</span>
              <span className="detail-value">{profile?.section_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Semester</span>
              <span className="detail-value">{profile?.year_id * 2 || 1}</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS CARDS */}
      <section className="stats-section">
        <h2 className="section-title">Quick Stats</h2>
        <div className="stats-grid">
          <div className="stat-card cgpa-card">
            <span className="stat-icon">📊</span>
            <h3 className="stat-title">CURRENT CGPA</h3>
            <div className="stat-value">{calculateCGPA()}</div>
            <p className="stat-subtitle">Out of 10.0</p>
          </div>

          <div className="stat-card backlogs-card">
            <span className="stat-icon">⚠️</span>
            <h3 className="stat-title">BACKLOGS</h3>
            <div className="stat-value">{backlogCount}</div>
            <p className="stat-subtitle">{backlogCount === 0 ? 'All clear!' : 'Courses pending'}</p>
          </div>

          <div className="stat-card fee-card">
            <span className="stat-icon">💰</span>
            <h3 className="stat-title">FEE STATUS</h3>
            <div className="stat-value">₹{feeStatus.amount}</div>
            <p className="stat-subtitle">Due amount</p>
          </div>

          <div className="stat-card notification-card">
            <span className="stat-icon">🔔</span>
            <h3 className="stat-title">NOTIFICATIONS</h3>
            <div className="stat-value">{notificationCount}</div>
            <p className="stat-subtitle">Unread messages</p>
          </div>
        </div>
      </section>

      {/* ALERTS & WARNINGS */}
      {backlogCount > 0 && (
        <section className="alerts-section">
          <h2 className="section-title">Alerts & Warnings</h2>
          <div className="alert-container">
            <div className="alert alert-warning">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <h4>Active Backlogs</h4>
                <p>You have {backlogCount} pending course(s). Contact your faculty advisor for guidance.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RECENT NOTIFICATIONS */}
      <section className="recent-notifications-section">
        <h2 className="section-title">Recent Notifications</h2>
        <div className="notifications-container">
          {notifications.length > 0 ? (
            notifications.map((notif, idx) => (
              <div key={idx} className="notification-item">
                <div className="notification-header">
                  <h4>{notif.title || 'Notification'}</h4>
                  <span className={`priority-badge priority-${(notif.priority || 'medium').toLowerCase()}`}>
                    {notif.priority || 'Medium'}
                  </span>
                </div>
                <p className="notification-description">{notif.description || notif.message}</p>
                <p className="notification-time">
                  {new Date(notif.created_at || new Date()).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No new notifications</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
