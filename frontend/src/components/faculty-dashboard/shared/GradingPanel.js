import React, { useState } from 'react';
import { facultyService } from '../../../services/api';
import './GradingPanel.css';

const GradingPanel = ({ assignment, onClose, onGradeSubmit }) => {
  const [marks, setMarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleMarksChange = (e) => {
    const value = e.target.value;
    // Only allow numbers 0-10
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 10)) {
      setMarks(value);
      setError('');
    }
  };

  const handleSubmitGrade = async () => {
    if (marks === '') {
      setError('Please enter marks');
      return;
    }

    if (parseInt(marks) < 0 || parseInt(marks) > 10) {
      setError('Marks must be between 0 and 10');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await facultyService.gradeAssignment(assignment.assignment_id, parseInt(marks));
      
      setSuccess(true);
      setTimeout(() => {
        onGradeSubmit();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to submit grade');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content grading-modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h2>Grade Submitted Successfully!</h2>
            <p>{marks} / 10</p>
            <button 
              className="btn btn-primary full-width"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content grading-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        {/* Modal Header */}
        <div className="modal-header grading-header">
          <div className="modal-header-content">
            <div className="grading-icon">⭐</div>
            <div className="header-text">
              <h2>Grade Assignment</h2>
              <p className="subheader">Enter marks for {assignment.course_id}</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Student Information */}
          <section className="modal-section">
            <h3 className="section-header">Student Information</h3>
            <div className="info-grid">
              <div className="info-block">
                <span className="info-label">Name</span>
                <span className="info-value">{assignment.student_name}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Roll No</span>
                <span className="info-value">{assignment.student_roll_no}</span>
              </div>
            </div>
          </section>

          {/* Submission Information */}
          <section className="modal-section">
            <h3 className="section-header">Submission Information</h3>
            <div className="info-grid">
              <div className="info-block">
                <span className="info-label">Course</span>
                <span className="info-value">{assignment.course_id}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Submitted At</span>
                <span className="info-value">
                  {assignment.submitted_at ? (
                    new Date(assignment.submitted_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  ) : 'N/A'}
                </span>
              </div>
              {assignment.file_name && (
                <div className="info-block">
                  <span className="info-label">File Name</span>
                  <span className="info-value">{assignment.file_name}</span>
                </div>
              )}
              {assignment.file_size && (
                <div className="info-block">
                  <span className="info-label">File Size</span>
                  <span className="info-value">{assignment.file_size} KB</span>
                </div>
              )}
            </div>
          </section>

          {/* Grading Section */}
          <section className="modal-section grading-input-section">
            <h3 className="section-header">Enter Marks</h3>
            <div className="marks-input-container">
              <div className="marks-input-wrapper">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={marks}
                  onChange={handleMarksChange}
                  placeholder="Enter marks (0-10)"
                  className="marks-input"
                  disabled={loading}
                  autoFocus
                />
                <span className="marks-suffix">/10</span>
              </div>
              
              {marks !== '' && (
                <div className="marks-feedback">
                  <div className="feedback-bar">
                    <div 
                      className="feedback-fill"
                      style={{ width: `${(parseInt(marks) / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="feedback-labels">
                    <span className="feedback-min">0 - Poor</span>
                    <span className="feedback-mid">{marks} - {getGradeLabel(parseInt(marks))}</span>
                    <span className="feedback-max">10 - Excellent</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Grade Scale Info */}
          <section className="modal-section">
            <h3 className="section-header">Grade Scale</h3>
            <div className="grade-scale">
              <div className="scale-item excellent">
                <span className="scale-range">9-10</span>
                <span className="scale-label">Excellent</span>
              </div>
              <div className="scale-item good">
                <span className="scale-range">7-8</span>
                <span className="scale-label">Good</span>
              </div>
              <div className="scale-item average">
                <span className="scale-range">5-6</span>
                <span className="scale-label">Average</span>
              </div>
              <div className="scale-item poor">
                <span className="scale-range">0-4</span>
                <span className="scale-label">Poor</span>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSubmitGrade}
            disabled={loading || marks === ''}
          >
            {loading ? 'Submitting...' : 'Submit Grade'}
          </button>
        </div>
      </div>
    </div>
  );
};

const getGradeLabel = (marks) => {
  if (marks >= 9) return 'Excellent';
  if (marks >= 7) return 'Good';
  if (marks >= 5) return 'Average';
  return 'Poor';
};

export default GradingPanel;
