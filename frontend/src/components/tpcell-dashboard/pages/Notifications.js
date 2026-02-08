import React, { useState, useEffect } from 'react';
import { notificationService, managementService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  const [formData, setFormData] = useState({
    notification_type: 'general',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
  });

  // Filter UI state for TP Cell
  const years = ['1', '2', '3', '4'];
  const branchNames = {
    '1': 'CSE',
    '2': 'ECE',
    '3': 'CSM',
    '4': 'CSD',
    '5': 'EEE',
    '6': 'CV',
    '7': 'ME'
  };
  const [selectedYear, setSelectedYear] = useState('1');
  const [selectedBranch, setSelectedBranch] = useState('1');
  const [selectedSection, setSelectedSection] = useState('1');
  const [branchSections, setBranchSections] = useState({});

  useEffect(() => {
    loadNotifications();
    loadStudentsForFilters();
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

  const loadStudentsForFilters = async () => {
    try {
      // Fetch students (management endpoint) and compute available sections per branch
      const students = await managementService.getAllStudents();
      const sectionsMap = {};
      (students || []).forEach((s) => {
        const b = String(s.branch || s.branch_id || s.branchId || s.branch_id);
        const sec = String(s.section || s.sec_id || s.sec_id || s.section_id || s.section);
        if (!b) return;
        sectionsMap[b] = sectionsMap[b] || new Set();
        sectionsMap[b].add(sec || '1');
      });
      // convert sets to sorted arrays
      const out = {};
      Object.keys(sectionsMap).forEach((k) => {
        out[k] = Array.from(sectionsMap[k]).filter(Boolean).sort();
      });
      // ensure defaults exist for all branches
      Object.keys(branchNames).forEach((bk) => { if (!out[bk]) out[bk] = ['1']; });
      setBranchSections(out);
      // set selectedSection to first available for default branch
      setSelectedSection((out[selectedBranch] && out[selectedBranch][0]) || '1');
    } catch (err) {
      console.warn('Failed to load students for TP filters', err);
      // fallback: single section per branch
      const fallback = {};
      Object.keys(branchNames).forEach((bk) => { fallback[bk] = ['1']; });
      setBranchSections(fallback);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      // Build targets payload: single class target
      const targets = [
        {
          year_id: Number(selectedYear),
          branch_id: Number(selectedBranch),
          section_id: Number(selectedSection),
        },
      ];

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.notification_type || 'General',
        priority: formData.priority || 'Medium',
        dueDate: formData.due_date,
        targets,
      };

      await notificationService.createNotification(payload);
      setFormData({ notification_type: 'general', title: '', description: '', due_date: '', priority: 'medium' });
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
              <div className="form-row">
                <div className="form-group">
                  <label>Year</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    {years.map(y => (<option key={y} value={y}>{y} Year</option>))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Branch</label>
                  <select value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); setSelectedSection((branchSections[e.target.value] && branchSections[e.target.value][0]) || '1'); }}>
                    {Object.keys(branchNames).map(b => (<option key={b} value={b}>{branchNames[b]}</option>))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Section</label>
                  <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                    {(branchSections[selectedBranch] || ['1']).map(s => (<option key={s} value={s}>Section {s}</option>))}
                  </select>
                </div>
              </div>

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
