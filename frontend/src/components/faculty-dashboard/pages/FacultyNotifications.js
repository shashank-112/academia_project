import React, { useState, useEffect } from 'react';
import { notificationService, facultyService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/FacultyNotifications.css';
import '../styles/Courses.css';

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
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);

  // Mappings for readable labels
  const yearNames = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year'
  };
  const branchNames = {
    '1': 'CSE',
    '2': 'ECE',
    '3': 'CSM',
    '4': 'CSD',
    '5': 'EEE',
    '6': 'CV',
    '7': 'ME'
  };
  const sectionNames = {
    '1': 'A',
    '2': 'B',
    '3': 'C'
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
      // load faculty assigned classes for targeting
      try {
        const assigned = await facultyService.getAssignments();
        // assigned is expected to be list of {course_id, year_id, branch_id, section_id}
        const uniq = [];
        const seen = new Set();
        (assigned || []).forEach(a => {
          const key = `${a.course_id || ''}-${a.year_id}-${a.branch_id}-${a.section_id}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniq.push({
              course_id: a.course_id,
              year_id: a.year_id,
              branch_id: a.branch_id,
              section_id: a.section_id,
            });
          }
        });
        setAssignedClasses(uniq);
      } catch (e) {
        console.warn('Failed to load faculty assignments for notifications', e);
        setAssignedClasses([]);
      }
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        targets: selectedClasses, // list of {year_id, branch_id, section_id}
      };
      console.log('Sending notification payload:', payload);
      const result = await notificationService.createNotification(payload);
      console.log('Notification created:', result);
      
      // Show success message and reset form
      alert('Notification sent successfully!');
      setFormData({ title: '', description: '', type: 'General', priority: 'Medium', dueDate: '' });
      setSelectedClasses([]);
      
      // Reload notifications to show the new one
      setTimeout(() => {
        loadNotifications();
      }, 500);
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleClassSelection = (cls) => {
    const key = `${cls.course_id}-${cls.year_id}-${cls.branch_id}-${cls.section_id}`;
    const exists = selectedClasses.some(c => `${c.course_id}-${c.year_id}-${c.branch_id}-${c.section_id}` === key);
    if (exists) {
      setSelectedClasses(prev => prev.filter(c => `${c.course_id}-${c.year_id}-${c.branch_id}-${c.section_id}` !== key));
    } else {
      setSelectedClasses(prev => prev.concat(cls));
    }
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
            {/* Class target buttons */}
            <div className="class-buttons">
              <button
                type="button"
                className={`course-action-btn ${selectedClasses.length === 0 ? 'active' : ''}`}
                onClick={() => setSelectedClasses([])}
              >
                All Students
              </button>
              {assignedClasses.map((cls) => {
                const label = `${cls.course_id} — ${yearNames[cls.year_id?.toString()] || cls.year_id} — ${branchNames[cls.branch_id?.toString()] || cls.branch_id} — Sec ${sectionNames[cls.section_id?.toString()] || cls.section_id}`;
                const key = `${cls.course_id}-${cls.year_id}-${cls.branch_id}-${cls.section_id}`;
                const active = selectedClasses.some(c => `${c.course_id}-${c.year_id}-${c.branch_id}-${c.section_id}` === key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`course-action-btn ${active ? 'active' : ''}`}
                    onClick={() => toggleClassSelection(cls)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
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

