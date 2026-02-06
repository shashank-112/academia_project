import React, { useState, useEffect } from 'react';
import { managementService } from '../../../services/api';
import '../styles/Notifications.css';
import '../styles/Common.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    target: 'All Students',
    type: 'General',
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium'
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await managementService.getSentNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      // Demo data
      setNotifications([
        {
          id: 1,
          title: 'Fee Submission Deadline',
          description: 'Please submit your fees by the end of this semester. Late submissions will attract penalties.',
          type: 'Fee',
          target: 'All Students',
          sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          dueDate: '2025-02-28',
          priority: 'High'
        },
        {
          id: 2,
          title: 'Mid-Semester Exam Schedule Released',
          description: 'The mid-semester examination schedule has been released. Check the academic calendar for details.',
          type: 'Academic',
          target: '3rd Year',
          sentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          dueDate: '2025-02-20',
          priority: 'Medium'
        },
        {
          id: 3,
          title: 'Campus Maintenance Notice',
          description: 'The college will undergo maintenance from Feb 15-17. Some facilities may be temporarily unavailable.',
          type: 'Administrative',
          target: 'All Students',
          sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dueDate: null,
          priority: 'Low'
        }
      ]);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // API call would go here
      await managementService.createNotification(formData);
      
      setSuccess('Notification sent successfully!');
      setFormData({
        target: 'All Students',
        type: 'General',
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium'
      });

      // Reload notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadNotifications();
    } catch (err) {
      setError('Failed to send notification');
      console.error('Error sending notification:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      target: 'All Students',
      type: 'General',
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium'
    });
    setError('');
    setSuccess('');
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Fee': return 'fee';
      case 'General': return 'general';
      case 'Academic': return 'academic';
      case 'Administrative': return 'administrative';
      default: return 'general';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'medium';
    }
  };

  return (
    <div className="mgmt-notifications-container">
      {error && <div className="mgmt-error-banner">{error}</div>}
      {success && <div className="mgmt-success-message" style={{background: '#e8f5e9', color: '#2e7d32', borderLeft: '4px solid #2e7d32'}}>✓ {success}</div>}

      <div className="mgmt-page-header">
        <h1>Notification Management</h1>
        <p className="mgmt-page-subtitle">Create and manage official management-level notifications</p>
      </div>

      {/* Create Notification Form */}
      <div className="mgmt-create-notification">
        <h2>📢 Create New Notification</h2>
        <form onSubmit={handleSubmit}>
          <div className="mgmt-notification-form-grid">
            {/* Target */}
            <div className="mgmt-form-group">
              <label>Target *</label>
              <select name="target" value={formData.target} onChange={handleFormChange}>
                <option>All Students</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>CSE Branch</option>
                <option>ECE Branch</option>
                <option>Mechanical Branch</option>
                <option>Civil Branch</option>
              </select>
            </div>

            {/* Type */}
            <div className="mgmt-form-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleFormChange}>
                <option>Fee</option>
                <option>General</option>
                <option>Academic</option>
                <option>Administrative</option>
              </select>
            </div>

            {/* Priority */}
            <div className="mgmt-form-group">
              <label>Priority *</label>
              <select name="priority" value={formData.priority} onChange={handleFormChange}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="mgmt-form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleFormChange}
              />
            </div>

            {/* Title */}
            <div className="mgmt-form-group mgmt-notification-form-full">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Notification title"
              />
            </div>

            {/* Description */}
            <div className="mgmt-form-group mgmt-notification-form-full">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Detailed notification message"
              ></textarea>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mgmt-form-actions">
            <button type="button" className="mgmt-btn-reset" onClick={handleReset}>
              Clear
            </button>
            <button type="submit" className="mgmt-btn-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>

      {/* Sent Notifications List */}
      <div>
        <h2 className="mgmt-section-title">📋 Sent Notifications</h2>
        <div className="mgmt-notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className="mgmt-notification-card">
                <div className="mgmt-notification-card-header">
                  <h3 className="mgmt-notification-title">{notif.title}</h3>
                  <span className="mgmt-notification-sent-time">
                    {notif.sentDate ? new Date(notif.sentDate).toLocaleDateString() : 'Today'}
                  </span>
                </div>

                <div className="mgmt-notification-meta">
                  <span className={`mgmt-notification-type ${getTypeColor(notif.type)}`}>
                    {notif.type}
                  </span>
                  <span className="mgmt-notification-target">
                    👥 Target: {notif.target}
                  </span>
                  <span className={`mgmt-priority ${getPriorityColor(notif.priority)}`}>
                    {notif.priority} Priority
                  </span>
                </div>

                <p className="mgmt-notification-description">{notif.description}</p>

                <div className="mgmt-notification-footer">
                  <span className="mgmt-due-date">
                    {notif.dueDate ? `Due: ${new Date(notif.dueDate).toLocaleDateString()}` : 'No due date'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{color: '#999', textAlign: 'center', padding: '2rem'}}>
              No notifications sent yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
