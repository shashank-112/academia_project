import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/DashboardLayout.css';

const DashboardLayout = ({ children, activePage, onPageChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dashboard-layout">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-container">
        <Sidebar 
          isOpen={sidebarOpen} 
          activePage={activePage} 
          onPageChange={onPageChange}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
