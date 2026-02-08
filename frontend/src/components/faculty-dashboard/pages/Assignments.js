import React, { useState, useEffect, useMemo } from 'react';
import { facultyService } from '../../../services/api';
import GradingPanel from '../shared/GradingPanel';
import '../styles/FacultyAssignments.css';

const Assignments = () => {
  const [overview, setOverview] = useState(null);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [gradedAssignments, setGradedAssignments] = useState([]);
  const [facultyAssignedCourses, setFacultyAssignedCourses] = useState([]);
  const [filteredPendingAssignments, setFilteredPendingAssignments] = useState([]);
  const [filteredGradedAssignments, setFilteredGradedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showGradingPanel, setShowGradingPanel] = useState(false);
  const [filters, setFilters] = useState({
    year: 'all',
    branch: 'all',
    section: 'all',
  });

  // Year ID to display mapping
  const yearNames = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year'
  };

  // Map branch codes to internal numeric IDs (as strings)
  const branchMap = {
    'CSE': '1', 'ECE': '2', 'CSM': '3', 'CSD': '4',
    'EEE': '5', 'CE': '6', 'ME': '7'
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

  // Define available sections per branch
  const branchSections = {
    '1': ['1', '2', '3'],
    '2': ['1', '2'],
    '3': ['1', '2'],
    '4': ['1'],
    '5': ['1'],
    '6': ['1'],
    '7': ['1']
  };

  // Combine all assignments and faculty-assigned courses for filtering options
  const allAssignments = [
    ...pendingAssignments,
    ...gradedAssignments,
    // include assigned courses so filters reflect taught years/branches/sections
    ...facultyAssignedCourses,
  ];

  // Compute available filter options based on assignments data
  const availableOptions = useMemo(() => {
    const matches = (a, { year = filters.year, branch = filters.branch, section = filters.section } = {}) => {
      if (year !== 'all' && year !== undefined && a.year_id?.toString() !== year) return false;
      if (branch !== 'all' && branch !== undefined && a.branch_id?.toString() !== branch) return false;
      if (section !== 'all' && section !== undefined && a.section_id?.toString() !== section) return false;
      return true;
    };

    const yearsSet = new Set(
      allAssignments
        .filter(a => matches(a, { branch: filters.branch, section: filters.section }))
        .map(a => a.year_id?.toString())
        .filter(Boolean)
    );

    const branchesSet = new Set(
      allAssignments
        .filter(a => matches(a, { year: filters.year, section: filters.section }))
        .map(a => a.branch_id?.toString())
        .filter(Boolean)
    );

    const sectionsPerBranch = {};
    allAssignments.forEach(a => {
      const b = a.branch_id?.toString();
      const sec = a.section_id?.toString() || '1';
      if (!b) return;
      if (filters.year !== 'all' && a.year_id?.toString() !== filters.year) return;
      sectionsPerBranch[b] = sectionsPerBranch[b] || new Set();
      sectionsPerBranch[b].add(sec);
    });

    return {
      years: Array.from(yearsSet).sort((a, b) => Number(a) - Number(b)),
      branches: Array.from(branchesSet).sort((a, b) => Number(a) - Number(b)),
      sections: Object.fromEntries(
        Object.entries(sectionsPerBranch).map(([k, v]) => [k, Array.from(v).sort((a, b) => Number(a) - Number(b))])
      ),
    };
  }, [allAssignments, filters.year, filters.branch, filters.section]);

  // Validate and reset invalid filter selections
  useEffect(() => {
    if (filters.branch !== 'all' && !availableOptions.branches.includes(filters.branch)) {
      setFilters(prev => ({ ...prev, branch: 'all' }));
    }
    if (filters.year !== 'all' && !availableOptions.years.includes(filters.year)) {
      setFilters(prev => ({ ...prev, year: 'all' }));
    }
    const secsForBranch = availableOptions.sections[filters.branch] || [];
    if (filters.section !== 'all' && !secsForBranch.includes(filters.section)) {
      setFilters(prev => ({ ...prev, section: 'all' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableOptions.years.join(','), availableOptions.branches.join(','), JSON.stringify(availableOptions.sections)]);

  // Reset section when branch changes
  useEffect(() => {
    const branch = filters.branch;
    if (!branch || branch === 'all') return;
    const allowed = branchSections[branch] || ['1'];
    if (filters.section !== 'all' && !allowed.includes(filters.section)) {
      setFilters(prev => ({ ...prev, section: 'all' }));
    }
  }, [filters.branch]);

  // Helper to get section options for a branch
  const getDynamicSectionOptions = (branchValue) => {
    const base = [{ value: 'all', label: 'All Sections' }];
    if (!branchValue || branchValue === 'all') {
      const combined = new Set();
      Object.values(availableOptions.sections || {}).forEach(arr => arr.forEach(x => combined.add(x)));
      const list = Array.from(combined).sort((a, b) => Number(a) - Number(b));
      if (list.length === 0) {
        return base.concat(Object.keys(sectionNames).map(k => ({ value: k, label: `Section ${sectionNames[k]}` })));
      }
      return base.concat(list.map(k => ({ value: k, label: `Section ${sectionNames[k] || k}` })));
    }

    const allowed = (availableOptions.sections && availableOptions.sections[branchValue]) || [];
    if (allowed.length === 0) {
      const fall = branchSections[branchValue] || ['1'];
      return base.concat(fall.map(k => ({ value: k, label: `Section ${sectionNames[k] || k}` })));
    }
    return base.concat(allowed.map(k => ({ value: k, label: `Section ${sectionNames[k] || k}` })));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pendingAssignments, gradedAssignments, filters]);

  const applyFilters = () => {
    let filteredPending = pendingAssignments;
    let filteredGraded = gradedAssignments;

    if (filters.year !== 'all') {
      filteredPending = filteredPending.filter(a => a.year_id?.toString() === filters.year);
      filteredGraded = filteredGraded.filter(a => a.year_id?.toString() === filters.year);
    }

    if (filters.branch !== 'all') {
      filteredPending = filteredPending.filter(a => a.branch_id?.toString() === filters.branch);
      filteredGraded = filteredGraded.filter(a => a.branch_id?.toString() === filters.branch);
    }

    if (filters.section !== 'all') {
      filteredPending = filteredPending.filter(a => a.section_id?.toString() === filters.section);
      filteredGraded = filteredGraded.filter(a => a.section_id?.toString() === filters.section);
    }

    setFilteredPendingAssignments(filteredPending);
    setFilteredGradedAssignments(filteredGraded);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [overviewData, pending, graded] = await Promise.all([
        facultyService.getAssignmentsOverview(),
        facultyService.getPendingAssignments(),
        facultyService.getGradedAssignments(),
      ]);

      // Also fetch faculty assigned courses (used to populate filter options)
      let facultyAssign = [];
      try {
        facultyAssign = await facultyService.getAssignments();
      } catch (e) {
        // ignore - not critical
        facultyAssign = [];
      }

      // Normalize assignments data to include year_id, branch_id, section_id
      const normalizeAssignment = (a) => {
        return {
          ...a,
          year_id: a.year_id || 4,
          branch_id: a.branch_id || 1,
          section_id: a.section_id || 1,
        };
      };

      let normalizedPending = (pending || []).map(normalizeAssignment);
      let normalizedGraded = (graded || []).map(normalizeAssignment);

      // Normalize faculty assigned courses for filter usage
      const normalizedFacultyAssign = (facultyAssign || []).map((a) => ({
        year_id: a.year_id || null,
        branch_id: a.branch_id || null,
        section_id: a.section_id || null,
      }));

      // If no assignment submissions and no assigned courses, use demo data
      if (normalizedPending.length === 0 && normalizedGraded.length === 0 && normalizedFacultyAssign.length === 0) {
        const demoAssignments = [
          { assignment_id: 1, student_name: 'Aditya Kumar', student_roll_no: '4YCS001', course_id: 'CS101', submitted_at: '2024-02-01', year_id: 4, branch_id: 1, section_id: 1 },
          { assignment_id: 2, student_name: 'Priya Singh', student_roll_no: '4YCS002', course_id: 'CS102', submitted_at: '2024-02-02', year_id: 4, branch_id: 1, section_id: 1 },
          { assignment_id: 3, student_name: 'Rajesh Patel', student_roll_no: '4YCS003', course_id: 'CS101', submitted_at: '2024-02-03', year_id: 4, branch_id: 1, section_id: 2 },
          { assignment_id: 4, student_name: 'Sneha Gupta', student_roll_no: '3ECE001', course_id: 'EC101', submitted_at: '2024-02-04', year_id: 3, branch_id: 2, section_id: 1 },
          { assignment_id: 5, student_name: 'Vikram Nair', student_roll_no: '2CSM001', course_id: 'ME101', submitted_at: '2024-02-05', year_id: 2, branch_id: 3, section_id: 1 },
        ];
        normalizedPending = demoAssignments;
        normalizedGraded = [];
        setError('Using demo data - please ensure API endpoints return year_id, branch_id, and section_id');
      } else {
        // We have either submissions or assigned courses — populate filters from assigned courses
        setError('');
      }

      setOverview(overviewData);
      setPendingAssignments(normalizedPending);
      setGradedAssignments(normalizedGraded);
      setFacultyAssignedCourses(normalizedFacultyAssign);
      setFacultyAssignedCourses(normalizedFacultyAssign);
    } catch (err) {
      setError('Failed to load assignments - using demo data');
      console.error(err);

      // Demo data fallback
      const demoAssignments = [
        { assignment_id: 1, student_name: 'Aditya Kumar', student_roll_no: '4YCS001', course_id: 'CS101', submitted_at: '2024-02-01', year_id: 4, branch_id: 1, section_id: 1 },
        { assignment_id: 2, student_name: 'Priya Singh', student_roll_no: '4YCS002', course_id: 'CS102', submitted_at: '2024-02-02', year_id: 4, branch_id: 1, section_id: 1 },
        { assignment_id: 3, student_name: 'Rajesh Patel', student_roll_no: '4YCS003', course_id: 'CS101', submitted_at: '2024-02-03', year_id: 4, branch_id: 1, section_id: 2 },
        { assignment_id: 4, student_name: 'Sneha Gupta', student_roll_no: '3ECE001', course_id: 'EC101', submitted_at: '2024-02-04', year_id: 3, branch_id: 2, section_id: 1 },
        { assignment_id: 5, student_name: 'Vikram Nair', student_roll_no: '2CSM001', course_id: 'ME101', submitted_at: '2024-02-05', year_id: 2, branch_id: 3, section_id: 1 },
      ];
      setPendingAssignments(demoAssignments);
      setGradedAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowGradingPanel(true);
  };

  const handleGradeSubmit = async () => {
    await loadData();
    setShowGradingPanel(false);
    setSelectedAssignment(null);
  };

  const handleRefresh = async () => {
    await loadData();
  };

  // Loading handled inline; render page immediately and show any error banner below

  return (
    <div className="faculty-assignments-page">
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
          Manage and grade student assignments
        </p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      {overview && (
        <div className="overview-section">
          <div className="overview-grid">
            <div className="overview-card total">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <span className="card-label">Total Assignments</span>
                <span className="card-value">{overview.total_assignments}</span>
              </div>
            </div>
            <div className="overview-card pending">
              <div className="card-icon">⏳</div>
              <div className="card-content">
                <span className="card-label">Pending Grading</span>
                <span className="card-value">{overview.pending_grading}</span>
              </div>
            </div>
            <div className="overview-card graded">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <span className="card-label">Graded</span>
                <span className="card-value">{overview.graded}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="assignments-tabs">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span className="tab-icon">⏳</span>
          <span className="tab-label">Pending Grading ({pendingAssignments.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'graded' ? 'active' : ''}`}
          onClick={() => setActiveTab('graded')}
        >
          <span className="tab-icon">✅</span>
          <span className="tab-label">Graded ({gradedAssignments.length})</span>
        </button>
      </div>

      {/* FILTERS SECTION */}
      <section className="filters-section">
        <div className="filter-group">
          <label>Year</label>
          <select value={filters.year} onChange={(e) => setFilters({...filters, year: e.target.value})}>
            <option value="all">All Years</option>
            {(availableOptions.years || []).map(y => (
              <option key={y} value={y}>{yearNames[y] || `${y}th Year`}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Branch</label>
          <select value={filters.branch} onChange={(e) => setFilters({...filters, branch: e.target.value})}>
            <option value="all">All Branches</option>
            {(availableOptions.branches || []).map(b => (
              <option key={b} value={b}>{branchNames[b] || `Branch ${b}`}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Section</label>
          <select value={filters.section} onChange={(e) => setFilters({...filters, section: e.target.value})}>
            {getDynamicSectionOptions(filters.branch).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Content */}
      <div className="assignments-content">
        {activeTab === 'pending' && (
          <div className="tab-content">
            {filteredPendingAssignments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <h3>All Caught Up!</h3>
                <p>No pending assignments to grade.</p>
              </div>
            ) : (
              <div className="assignments-list">
                {filteredPendingAssignments.map((assignment, index) => (
                  <div 
                    key={assignment.assignment_id}
                    className="assignment-row"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="row-info">
                      <div className="student-info">
                        <h4 className="student-name">{assignment.student_name}</h4>
                        <p className="student-roll">Roll No: {assignment.student_roll_no}</p>
                      </div>
                      <div className="course-info">
                        <span className="course-label">Course</span>
                        <span className="course-id">{assignment.course_id}</span>
                      </div>
                      <div className="submission-info">
                        <span className="submitted-label">Submitted</span>
                        <span className="submitted-date">
                          {assignment.submitted_at ? (
                            new Date(assignment.submitted_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          ) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="row-actions">
                      <button 
                        className="action-btn download-btn"
                        onClick={() => {/* TODO: Implement download */}}
                        title="Download PDF"
                      >
                        📥
                      </button>
                      <button 
                        className="action-btn grade-btn"
                        onClick={() => handleGradeClick(assignment)}
                      >
                        Grade →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'graded' && (
          <div className="tab-content">
            {filteredGradedAssignments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No Graded Assignments Yet</h3>
                <p>Grade some assignments to see them here.</p>
              </div>
            ) : (
              <div className="assignments-list">
                {filteredGradedAssignments.map((assignment, index) => (
                  <div 
                    key={assignment.assignment_id}
                    className="assignment-row graded-row"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="row-info">
                      <div className="student-info">
                        <h4 className="student-name">{assignment.student_name}</h4>
                        <p className="student-roll">Roll No: {assignment.student_roll_no}</p>
                      </div>
                      <div className="course-info">
                        <span className="course-label">Course</span>
                        <span className="course-id">{assignment.course_id}</span>
                      </div>
                      <div className="grade-info">
                        <span className="marks-label">Marks</span>
                        <span className="marks-value">{assignment.marks_awarded}/10</span>
                      </div>
                      <div className="graded-info">
                        <span className="graded-label">Graded At</span>
                        <span className="graded-date">
                          {assignment.graded_at ? (
                            new Date(assignment.graded_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          ) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="row-actions">
                      <button 
                        className="action-btn download-btn"
                        onClick={() => {/* TODO: Implement download */}}
                        title="Download PDF"
                      >
                        📥
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showGradingPanel && selectedAssignment && (
        <GradingPanel 
          assignment={selectedAssignment}
          onClose={() => setShowGradingPanel(false)}
          onGradeSubmit={handleGradeSubmit}
        />
      )}
    </div>
  );
};

export default Assignments;
