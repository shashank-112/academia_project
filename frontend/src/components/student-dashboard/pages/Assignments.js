import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/api';
import AssignmentDetailModal from '../shared/AssignmentDetailModal';
import '../styles/Assignments.css';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await studentService.getAssignmentCards();
      setAssignments(data || []);
    } catch (err) {
      setError('Failed to load assignments - showing demo data');
      console.error(err);

      // Demo fallback assignments
      const demoAssignments = [
        { assignment_id: 1, course_id: 'CS101', faculty_name: 'Prof. Rao', faculty_email: 'rao@college.edu', status: 'not_submitted', is_submitted: false, is_graded: false },
        { assignment_id: 2, course_id: 'CS102', faculty_name: 'Dr. Iyer', faculty_email: 'iyer@college.edu', status: 'submitted', is_submitted: true, is_graded: false, submitted_at: '2024-02-01' },
        { assignment_id: 3, course_id: 'EC101', faculty_name: 'Prof. Singh', faculty_email: 'singh@college.edu', status: 'graded', is_submitted: true, is_graded: true, marks_awarded: 8, submitted_at: '2024-01-28' },
      ];
      setAssignments(demoAssignments);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailModal(true);
  };

  const handleRefresh = async () => {
    await loadAssignments();
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'not_submitted': return 'badge-not-submitted';
      case 'submitted': return 'badge-submitted';
      case 'graded': return 'badge-graded';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'not_submitted': return '⏳';
      case 'submitted': return '✅';
      case 'graded': return '⭐';
      default: return '❓';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'not_submitted': return 'Not Submitted';
      case 'submitted': return 'Not Graded';
      case 'graded': return 'Graded';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="assignments-page">
      <div className="page-header">
        <div className="header-top">
          <h1>Assignments</h1>
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            title="Refresh assignments"
          >
            🔄
          </button>
        </div>
        <p className="page-subtitle">
          Manage and submit your course assignments
        </p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Assignments Yet</h3>
          <p>You'll see your course assignments here once they are assigned by faculty.</p>
        </div>
      ) : (
        <div className="assignments-container">
          <div className="assignments-grid">
            {assignments.map((assignment, index) => (
              <div 
                key={assignment.assignment_id}
                className="assignment-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="card-header">
                  <div className="card-title-section">
                    <h3 className="course-id">{assignment.course_id}</h3>
                    <p className="faculty-name">{assignment.faculty_name}</p>
                  </div>
                  <div className={`status-badge ${getStatusBadgeClass(assignment.status)}`}>
                    <span className="status-icon">{getStatusIcon(assignment.status)}</span>
                    <span className="status-label">{getStatusText(assignment.status)}</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="assignment-info">
                    {!assignment.is_submitted && (
                      <>
                        <div className="info-item">
                          <span className="info-label">Faculty Email</span>
                          <span className="info-value email">{assignment.faculty_email || '-'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Deadline</span>
                          <span className="info-value">-</span>
                        </div>
                      </>
                    )}

                    {assignment.is_submitted && !assignment.is_graded && (
                      <>
                        <div className="info-item">
                          <span className="info-label">Submitted On</span>
                          <span className="info-value">
                            {assignment.submitted_at ? (
                              new Date(assignment.submitted_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            ) : '-'}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Faculty Email</span>
                          <span className="info-value email">{assignment.faculty_email || '-'}</span>
                        </div>
                      </>
                    )}

                    {assignment.is_graded && assignment.marks_awarded !== null && (
                      <>
                        <div className="info-item">
                          <span className="info-label">Submitted On</span>
                          <span className="info-value">
                            {assignment.submitted_at ? (
                              new Date(assignment.submitted_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            ) : '-'}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Marks Awarded</span>
                          <span className="marks-value">{assignment.marks_awarded}/10</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="card-action-btn"
                    onClick={() => handleCardClick(assignment)}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDetailModal && selectedAssignment && (
        <AssignmentDetailModal 
          assignment={selectedAssignment}
          onClose={() => setShowDetailModal(false)}
          onAssignmentUpdated={loadAssignments}
        />
      )}
    </div>
  );
};

export default Assignments;
