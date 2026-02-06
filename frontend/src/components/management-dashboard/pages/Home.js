import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { managementService } from '../../../services/api';
import '../styles/Home.css';
import '../styles/Common.css';

const Home = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch multiple data sources
      const profileData = await managementService.getProfile();
      const studentCount = await managementService.getStudentCount();
      const facultyCount = await managementService.getFacultyCount();
      const feeData = await managementService.getFeeStats();
      const notifications = await managementService.getRecentNotifications();

      setData({
        profile: profileData,
        studentCount,
        facultyCount,
        feeCollected: feeData?.collected || 0,
        feePending: feeData?.pending || 0,
        notifications: notifications || []
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
      // Set dummy data for demo
      setData({
        profile: {
          first_name: user?.first_name || 'Management',
          last_name: user?.last_name || 'User',
          designation: user?.designation || 'Admin'
        },
        studentCount: 450,
        facultyCount: 35,
        feeCollected: 2500000,
        feePending: 850000,
        notifications: [
          {
            id: 1,
            title: 'Fee Collection Reminder',
            message: 'Kindly collect remaining fees from pending students',
            type: 'fee',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 2,
            title: 'Academic Update',
            message: 'Mid-semester exam scores have been uploaded',
            type: 'academic',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mgmt-home-container">
      {error && <div className="mgmt-error-banner">{error}</div>}

      {/* Management Summary Card */}
      <div className="mgmt-summary-card">
        <h2>Welcome, {data?.profile?.first_name}!</h2>
        <div className="mgmt-summary-info">
          <div className="mgmt-summary-item">
            <label>Designation</label>
            <span>{data?.profile?.designation}</span>
          </div>
          <div className="mgmt-summary-item">
            <label>Email</label>
            <span>{user?.email}</span>
          </div>
          <div className="mgmt-summary-item">
            <label>Staff ID</label>
            <span>{user?.id}</span>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="mgmt-stats-grid">
        <div className="mgmt-stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <h3>Total Students</h3>
          <p className="stat-value">{data?.studentCount?.toLocaleString() || 0}</p>
          <span className="stat-change">Active students in system</span>
        </div>

        <div className="mgmt-stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <h3>Total Faculty</h3>
          <p className="stat-value">{data?.facultyCount || 0}</p>
          <span className="stat-change">Across all departments</span>
        </div>

        <div className="mgmt-stat-card">
          <div className="stat-icon">✅</div>
          <h3>Fee Collected</h3>
          <p className="stat-value">₹{(data?.feeCollected / 100000).toFixed(1)}L</p>
          <span className="stat-change">Total collected this year</span>
        </div>

        <div className="mgmt-stat-card">
          <div className="stat-icon">⏳</div>
          <h3>Pending Fees</h3>
          <p className="stat-value">₹{(data?.feePending / 100000).toFixed(1)}L</p>
          <span className="stat-change">Awaiting collection</span>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="mgmt-recent-notifications">
        <h2 className="mgmt-section-title">📢 Recent Notifications</h2>
        {data?.notifications && data.notifications.length > 0 ? (
          <div className="mgmt-notifications-list">
            {data.notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className="mgmt-notification-item">
                <div className="mgmt-notification-header">
                  <h4 className="mgmt-notification-title">{notif.title}</h4>
                  <span className="mgmt-notification-time">
                    {notif.timestamp ? new Date(notif.timestamp).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                <p className="mgmt-notification-message">{notif.message}</p>
                <span className={`mgmt-badge mgmt-badge-${
                  notif.type === 'fee' ? 'warning' : 
                  notif.type === 'academic' ? 'info' : 
                  'success'
                }`}>
                  {notif.type?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{color: '#999'}}>No recent notifications</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mgmt-quick-actions">
        <h2 className="mgmt-section-title">⚡ Quick Actions</h2>
        <div className="mgmt-actions-grid">
          <button className="mgmt-quick-action-btn">
            <div className="mgmt-quick-action-icon">👨‍🎓</div>
            <div>View All Students</div>
          </button>
          <button className="mgmt-quick-action-btn">
            <div className="mgmt-quick-action-icon">💰</div>
            <div>Manage Fees</div>
          </button>
          <button className="mgmt-quick-action-btn">
            <div className="mgmt-quick-action-icon">👨‍🏫</div>
            <div>View Faculty</div>
          </button>
          <button className="mgmt-quick-action-btn">
            <div className="mgmt-quick-action-icon">🔔</div>
            <div>Send Notifications</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
