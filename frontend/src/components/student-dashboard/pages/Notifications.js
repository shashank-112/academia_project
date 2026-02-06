import React, { useState, useEffect } from 'react';
import { notificationService } from '../../../services/api';
import '../styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && typeof data === 'object') {
        setNotifications(Array.isArray(data.results) ? data.results : []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Notifications API Error:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = (filter) => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => {
      const notifType = (n.notification_type || n.type || '').toLowerCase();
      return notifType === filter.toLowerCase();
    });
  };

  const filteredNotifications = filterNotifications(activeFilter);

  const filters = [
    { id: 'all', label: 'All', icon: '📋', count: notifications.length },
    { id: 'academic', label: 'Academic', icon: '📚', count: notifications.filter(n => (n.notification_type || n.type || '').toLowerCase() === 'academic').length },
    { id: 'fee', label: 'Fee', icon: '💰', count: notifications.filter(n => (n.notification_type || n.type || '').toLowerCase() === 'fee').length },
    { id: 'general', label: 'General', icon: '📢', count: notifications.filter(n => (n.notification_type || n.type || '').toLowerCase() === 'general').length },
  ];

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <h1>🔔 Notifications</h1>
        <p className="page-subtitle">Stay updated with important announcements and reminders</p>
      </div>

      {/* FILTER TABS */}
      <section className="filters-section">
        <div className="filter-tabs">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              <span className="filter-icon">{filter.icon}</span>
              <span className="filter-label">{filter.label}</span>
              {filter.count > 0 && <span className="filter-count">{filter.count}</span>}
            </button>
          ))}
        </div>
      </section>

      {/* NOTIFICATIONS LIST */}
      <section className="notifications-list-section">
        {filteredNotifications.length > 0 ? (
          <div className="notifications-list">
            {filteredNotifications.map((notif, idx) => (
              <div key={idx} className="notification-card">
                <div className="card-header">
                  <h3 className="card-title">{notif.title || 'Notification'}</h3>
                  <span className={`priority-badge priority-${(notif.priority || 'medium').toLowerCase()}`}>
                    {notif.priority || 'Medium'}
                  </span>
                </div>
                <p className="card-description">{notif.description || notif.message}</p>
                <div className="card-footer">
                  <div className="card-meta">
                    <p className="card-date">
                      📅 {new Date(notif.due_date || notif.created_at || new Date()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="card-type">
                      {notif.notification_type || notif.type || 'General'} 
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h2>No notifications yet</h2>
            <p>You're all caught up!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Notifications;
