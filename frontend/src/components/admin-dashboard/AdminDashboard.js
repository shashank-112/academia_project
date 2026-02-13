import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>⚙️ Admin Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-section">
          <h2>Admin Control Panel</h2>
          <div className="admin-info">
            <p>Welcome to the Admin Dashboard. Use this panel to manage all system components.</p>
          </div>1
        </section>

        <section className="dashboard-section">
          <h2>Admin Functions</h2>
          <div className="actions-grid">
            <button className="action-btn">👥 Manage Users</button>
            <button className="action-btn">📊 System Analytics</button>
            <button className="action-btn">⚙️ System Settings</button>
            <button className="action-btn">📋 View Logs</button>
            <button className="action-btn">🔒 Security Settings</button>
            <button className="action-btn">📧 Send Notifications</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;