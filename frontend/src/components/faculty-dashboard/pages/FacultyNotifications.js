import React, { useState, useEffect } from 'react';
import { notificationService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/FacultyNotifications.css';

const FacultyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'General',
    priority: 'Medium',
    dueDate: '',
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement send notification
    console.log('Sending notification:', formData);
    setFormData({ title: '', description: '', type: 'General', priority: 'Medium', dueDate: '' });
  };

  return (
    <div className="faculty-notifications">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <h1>🔔 Notifications</h1>
        <p className="page-subtitle">Send and manage notifications</p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="tab-navigation">
        <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
          ✍️ Create Notification
        </button>
        <button className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
          📋 View Notifications
        </button>
      </div>

      {/* CREATE NOTIFICATION */}
      {activeTab === 'create' && (
        <section className="notification-create-section">
          <form onSubmit={handleSubmit} className="notification-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Notification title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Notification details"
                rows="5"
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option>Academic</option>
                  <option>Fee</option>
                  <option>General</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>

            <button type="submit" className="submit-btn">Send Notification</button>
          </form>
        </section>
      )}

      {/* VIEW NOTIFICATIONS */}
      {activeTab === 'view' && (
        <section className="notification-view-section">
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notif, idx) => (
                <div key={idx} className="notification-item">
                  <div className="notif-header">
                    <h3>{notif.title}</h3>
                    <span className={`priority-badge ${notif.priority?.toLowerCase()}`}>{notif.priority}</span>
                  </div>
                  <p className="notif-description">{notif.description}</p>
                  <div className="notif-footer">
                    <span className="notif-type">{notif.notification_type}</span>
                    <span className="notif-date">📅 {new Date(notif.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No notifications found</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default FacultyNotifications;
