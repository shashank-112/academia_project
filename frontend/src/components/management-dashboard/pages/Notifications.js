import React, { useState, useEffect, useCallback } from 'react';
import { managementService, notificationService } from '../../../services/api';
import '../styles/Notifications.css';
import '../styles/Common.css';

const BRANCH_NAMES = {
  '1': 'CSE',
  '2': 'ECE',
  '3': 'CSM',
  '4': 'CSD',
  '5': 'EEE',
  '6': 'CV',
  '7': 'ME'
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    type: 'General',
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium'
  });

  // Filter UI state
  const years = ['1', '2', '3', '4'];
  const branchNames = BRANCH_NAMES;
  const [selectedYear, setSelectedYear] = useState('1');
  const [selectedBranch, setSelectedBranch] = useState('1');
  const [selectedSection, setSelectedSection] = useState('1');
  const [branchSections, setBranchSections] = useState({});
  const [feeNotPaid, setFeeNotPaid] = useState('no');

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

  const loadStudentsForFilters = useCallback(async () => {
    try {
      const students = await managementService.getAllStudents();
      const sectionsMap = {};
      (students || []).forEach((s) => {
        const b = String(s.branch || s.branch_id || s.branchId || s.branch);
        const sec = String(s.section || s.sec_id || s.sec || s.section_id);
        if (!b) return;
        sectionsMap[b] = sectionsMap[b] || new Set();
        sectionsMap[b].add(sec || '1');
      });
      const out = {};
      Object.keys(sectionsMap).forEach(k => { out[k] = Array.from(sectionsMap[k]).filter(Boolean).sort(); });
      Object.keys(branchNames).forEach(bk => { if (!out[bk]) out[bk] = ['1']; });
      setBranchSections(out);
      setSelectedSection((out[selectedBranch] && out[selectedBranch][0]) || '1');
    } catch (err) {
      console.warn('Failed to load students for management filters', err);
      const fallback = {};
      Object.keys(branchNames).forEach(bk => { fallback[bk] = ['1']; });
      setBranchSections(fallback);
    }
  }, [selectedBranch, branchNames]);

  useEffect(() => {
    // populate branchSections for management filters
    loadStudentsForFilters();
  }, [loadStudentsForFilters]);
  

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

      let targets = [];

      if (feeNotPaid === 'unpaid') {
        // Fetch fee details for selected filters and send to students with Pending status
        const feeDetails = await managementService.getStudentFeeDetails({ year_id: Number(selectedYear), branch_id: Number(selectedBranch), section_id: Number(selectedSection) });
        const unpaid = (feeDetails || []).filter(s => (s.status || s.fee_status || '').toString().toLowerCase() === 'pending');
        if (!unpaid.length) {
          setError('No students with pending fees found for the selected class');
          setLoading(false);
          return;
        }
        targets = unpaid.map(s => ({ student_id: s.student_id || s.studentId || s.id }));
      } else {
        // Build class-level target
        targets = [{ year_id: Number(selectedYear), branch_id: Number(selectedBranch), section_id: Number(selectedSection) }];
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type || 'General',
        priority: formData.priority || 'Medium',
        dueDate: formData.dueDate,
        targets,
      };
      await notificationService.createNotification(payload);
      
      setSuccess('Notification sent successfully!');
      setFormData({
        type: 'General',
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium'
      });

      // reset fee filter
      setFeeNotPaid('no');

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
      type: 'General',
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium'
    });
    setSelectedYear('1');
    setSelectedBranch('1');
    setSelectedSection('1');
    setFeeNotPaid('no');
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
            {/* Target: Year / Branch / Section for Management */}
            <div className="mgmt-form-group">
              <label>Year *</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {years.map(y => (<option key={y} value={y}>{y} Year</option>))}
              </select>
            </div>

            <div className="mgmt-form-group">
              <label>Branch *</label>
              <select value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); setSelectedSection((branchSections[e.target.value] && branchSections[e.target.value][0]) || '1'); }}>
                {Object.keys(branchNames).map(b => (<option key={b} value={b}>{branchNames[b]}</option>))}
              </select>
            </div>

            <div className="mgmt-form-group">
              <label>Section *</label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                {(branchSections[selectedBranch] || ['1']).map(s => (<option key={s} value={s}>Section {s}</option>))}
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

            <div className="mgmt-form-group mgmt-fee-filter">
              <label>Fee Filter</label>
              <select value={feeNotPaid} onChange={(e) => setFeeNotPaid(e.target.value)}>
                <option value="no">All students (default)</option>
                <option value="unpaid">Only students with unpaid fees</option>
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
