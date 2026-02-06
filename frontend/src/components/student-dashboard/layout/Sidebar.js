import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, activePage, onPageChange, onClose }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'performance', label: 'Performance', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handlePageChange = (pageId) => {
    onPageChange(pageId);
    onClose(); // Close sidebar on mobile after selection
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-close-btn" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handlePageChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {activePage === item.id && <div className="nav-indicator"></div>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
