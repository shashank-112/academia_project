import React, { useState, useEffect } from 'react';
import { notificationService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  const [formData, setFormData] = useState({
    target_type: 'all',
    target_value: '',
    notification_type: 'general',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      await notificationService.createNotification(formData);
      setFormData({
        target_type: 'all',
        target_value: '',
        notification_type: 'general',
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
      });
      setActiveTab('view');
      loadNotifications();
    } catch (err) {
      setError('Failed to create notification');
      console.error(err);
    }
  };

  return (
    <div className="tpcell-notifications">
      <div className="page-header">
        <h2>📢 Notifications</h2>
        <p>Create and manage placement-related notifications</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Tabs */}
      <div className="notification-tabs">
        <button
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Notification
        </button>
        <button
          className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          📋 View Notifications ({notifications.length})
        </button>
      </div>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <section className="create-notification-section">
          <div className="form-card">
            <h3>Create New Notification</h3>
            <form onSubmit={handleCreateNotification}>
              <div className="form-group">
                <label htmlFor="target">Target</label>
                <select
                  id="target"
                  name="target_type"
                  value={formData.target_type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="all">All Students</option>
                  <option value="year">By Year</option>
                  <option value="branch">By Branch</option>
                  <option value="section">By Section</option>
                  <option value="student">Individual Student</option>
                </select>
              </div>

              {formData.target_type !== 'all' && (
                <div className="form-group">
                  <label htmlFor="target-value">Specify Target</label>
                  <input
                    id="target-value"
                    type="text"
                    name="target_value"
                    value={formData.target_value}
                    onChange={handleFormChange}
                    placeholder={`Enter ${formData.target_type}`}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="type">Notification Type</label>
                <select
                  id="type"
                  name="notification_type"
                  value={formData.notification_type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="general">General</option>
                  <option value="placement">Placement</option>
                  <option value="training">Training</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Notification title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Notification description"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="due-date">Due Date</label>
                  <input
                    id="due-date"
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Create Notification
              </button>
            </form>
          </div>
        </section>
      )}

      {/* View Tab */}
      {activeTab === 'view' && (
        <section className="view-notifications-section">
          {loading ? (
            <div className="page-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div key={notif.id} className="notification-card">
                  <div className="notification-header">
                    <h4>{notif.title}</h4>
                    <span className={`priority-badge priority-${notif.priority}`}>
                      {notif.priority}
                    </span>
                  </div>
                  <p className="notification-description">{notif.description}</p>
                  <div className="notification-meta">
                    <span className="type-badge">{notif.notification_type}</span>
                    <span className="date">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h2>No Notifications Yet</h2>
              <p>Create your first notification to get started</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Notifications;
