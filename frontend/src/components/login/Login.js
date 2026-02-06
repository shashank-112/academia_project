import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleEmailClick = (emailText) => {
    navigator.clipboard.writeText(emailText);
  };

  const roles = [
    { id: 'student', label: 'Student', icon: '👨‍🎓' },
    { id: 'management', label: 'Management', icon: '👔' },
    { id: 'tpcell', label: 'TP Cell', icon: '💼' },
    { id: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
    { id: 'admin', label: 'Admin', icon: '⚙️' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !selectedRole || !password) {
      setError('Please enter email, password and select a role');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, selectedRole, password);
      login(data.user, { access: data.access, refresh: data.refresh });
      navigate(`/dashboard/${selectedRole}`);
    } catch (err) {
      const resp = err.response?.data;
      const message = resp?.error || resp?.detail || JSON.stringify(resp) || err.message || 'Login failed. Please try again.';
      setError(message);
      console.error('Login error:', err, resp);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="demo-section">
        <h3 className="demo-heading">Demo Emails</h3>
        <div className="demo-emails">
          <span className="demo-email-btn" onClick={() => handleEmailClick('4ycsea1@college.edu')}>
            4ycsea1@college.edu (Student)
          </span>
          <span className="demo-email-btn" onClick={() => handleEmailClick('lyon.bonellie@college.edu')}>
            lyon.bonellie@college.edu (Faculty)
          </span>
          <span className="demo-email-btn" onClick={() => handleEmailClick('anny.gartery@tpcell.edu')}>
            anny.gartery@tpcell.edu (TP Cell)
          </span>
          <span className="demo-email-btn" onClick={() => handleEmailClick('amberly.carryer@management.edu')}>
            amberly.carryer@management.edu (Management)
          </span>
        </div>
      </div>
      <div className="login-card">
        <h1 className="login-title">Academia</h1>
        <h2>College Management System</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group input-with-icon">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                aria-label="Password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L21 21" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.58 10.58A3 3 0 0113.42 13.42" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.88 5.13A11 11 0 0121 12a11 11 0 01-9.13 7.86" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12a11 11 0 014.73-6.87" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="role-section">
            <label>Select Your Role</label>
            <div className="role-buttons">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`role-btn ${selectedRole === role.id ? 'active' : ''}`}
                  onClick={() => setSelectedRole(role.id)}
                  disabled={loading}
                >
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-label">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
