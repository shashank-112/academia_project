import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/DashboardLayout.css';

const DashboardLayout = ({ activePage, onPageChange, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mgmt-dashboard-wrapper">
      <Sidebar 
        activePage={activePage} 
        onPageChange={onPageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="mgmt-main-content">
        <Navbar 
          page={activePage}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="mgmt-page-container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
