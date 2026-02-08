import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/api';
import './AssignmentDetailModal.css';

const AssignmentDetailModal = ({ assignment, onClose, onAssignmentUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUploadProgress(0);

      let assignmentId = assignment.assignment_id;

      // If assignment_id is null, create the assignment first
      if (!assignmentId) {
        const createResponse = await studentService.createAssignment(
          assignment.faculty_id,
          assignment.course_id
        );
        assignmentId = createResponse.data?.assignment_id;
        if (!assignmentId) {
          setError('Failed to create assignment record');
          setLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('assignment_pdf', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 200);

      await studentService.uploadAssignment(assignmentId, formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setLoading(false);
        setUploadProgress(0);
        onAssignmentUpdated();
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to upload assignment');
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async () => {
    try {
      await studentService.downloadAssignment(assignment.assignment_id);
    } catch (err) {
      setError('Failed to download assignment');
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'not_submitted': {
        icon: '⏳',
        title: 'Not Submitted',
        description: 'You have not submitted this assignment yet'
      },
      'submitted': {
        icon: '✅',
        title: 'Submitted (Pending Grading)',
        description: 'Your assignment has been submitted and is awaiting grading'
      },
      'graded': {
        icon: '⭐',
        title: 'Graded',
        description: 'Your assignment has been graded by the faculty'
      }
    };
    return statusMap[status] || statusMap['not_submitted'];
  };

  const statusInfo = getStatusInfo(assignment.status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assignment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="status-icon-large">{statusInfo.icon}</div>
            <div className="header-text">
              <h2>{assignment.course_id}</h2>
              <p className="subheader">{statusInfo.title}</p>
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

          {/* Faculty Information */}
          <section className="modal-section">
            <h3 className="section-header">Faculty Information</h3>
            <div className="assignment-info">
              <div className="info-item">
                <span className="info-label">Faculty Name</span>
                <span className="info-value">{assignment.faculty_name || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value email">{assignment.faculty_email || '-'}</span>
              </div>
            </div>
          </section>

          {/* Submission Details */}
          {assignment.is_submitted && (
            <section className="modal-section">
              <h3 className="section-header">Submission Details</h3>
              <div className="assignment-info">
                <div className="info-item">
                  <span className="info-label">Submitted At</span>
                  <span className="info-value">
                    {assignment.submitted_at ? (
                      <>
                        <span className="date">
                          {new Date(assignment.submitted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="time">
                          {new Date(assignment.submitted_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </>
                    ) : 'Not submitted'}
                  </span>
                </div>
                {assignment.file_name && (
                  <div className="info-item">
                    <span className="info-label">File Name</span>
                    <span className="info-value">{assignment.file_name}</span>
                  </div>
                )}
                {assignment.file_size && (
                  <div className="info-item">
                    <span className="info-label">File Size</span>
                    <span className="info-value">{assignment.file_size} KB</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Grading Details */}
          {assignment.is_graded && assignment.marks_awarded !== null && (
            <section className="modal-section grading-section">
              <h3 className="section-header">Grading Details</h3>
              <div className="grading-content">
                <div className="marks-display">
                  <span className="marks-label">Marks Awarded</span>
                  <span className="marks-score">{assignment.marks_awarded}/10</span>
                </div>
                {assignment.graded_at && (
                  <div className="grading-date">
                    <span className="grade-label">Graded At</span>
                    <span className="grade-value">
                      {new Date(assignment.graded_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Upload Section */}
          {assignment.status !== 'graded' && (
            <section className="modal-section upload-section">
              <h3 className="section-header">
                {assignment.is_submitted ? 'Re-upload Assignment' : 'Upload Assignment'}
              </h3>
              <div className="upload-area">
                <label htmlFor="file-input" className="upload-label">
                  <div className="upload-icon">📤</div>
                  <p className="upload-text">
                    {assignment.is_submitted ? 'Click or drag to re-upload PDF' : 'Click or drag to upload PDF'}
                  </p>
                  <p className="upload-hint">(Max 10MB)</p>
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="file-input"
                />
                {loading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{Math.round(uploadProgress)}%</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {assignment.is_submitted && (
            <button 
              className="btn btn-secondary"
              onClick={handleDownload}
              disabled={loading}
            >
              📥 Download PDF
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailModal;
