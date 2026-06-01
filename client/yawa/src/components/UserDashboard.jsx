// src/components/UserDashboard.jsx
import React, { useState } from 'react';

const UserDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('subject_analytics');

  const navigationStructure = [
    { id: 'overview', label: 'Dashboard Overview' },
    { id: 'subject_analytics', label: 'Subject Analytics' },
    { id: 'student_reports', label: 'Student Reports' },
    { id: 'at_risk', label: 'At-Risk & Trends' },
    { id: 'streams', label: 'Streams' }
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Navigation */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">
          <div className="logo-svg-icon">C</div>
        </div>
        <nav className="sidebar-nav">
          {navigationStructure.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="logout-button">Log Out</button>
      </aside>

      {/* Main Panel View Area */}
      <main className="dash-main">
        <header className="dash-header">
          <h1>Academic Performance Management</h1>
          <div className="header-profile">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
              alt="Profile" 
              className="avatar-img" 
            />
            <span>{user?.username || 'Guest'}</span>
          </div>
        </header>

        <section className="dash-content">
          {activeTab === 'subject_analytics' && (
            <div className="content-pane">
              <div className="pane-meta-row">
                <div>
                  <h2>Subject Analytics</h2>
                  <p className="pane-desc">Description and active main academic performance in subject metrics for MongoDB population.</p>
                </div>
                <div className="kpi-card">
                  <h3>Overall Pass Rate:</h3>
                  <div className="kpi-value">-- % (Average)</div>
                </div>
              </div>

              {/* The Dark Green Analytical Table Display (Left Empty for MongoDB) */}
              <div className="dataset-showcase-box">
                <div className="showcase-table-header">
                  <div className="header-col-label">Subject Name</div>
                  <div className="header-col-label">Enrollment</div>
                  <div className="header-col-label">Avg. Grade</div>
                  <div className="header-col-label">Pass Rate %</div>
                  <div className="header-col-label">Trend</div>
                </div>
                <div className="showcase-empty-state">
                  No dataset currently connected to MongoDB.
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'subject_analytics' && (
            <div className="content-pane">
              <h2>{navigationStructure.find(n => n.id === activeTab)?.label}</h2>
              <p className="pane-desc">This panel data layout is ready to accept queries from your upcoming database arrays.</p>
              <div className="dataset-showcase-box">
                <div className="showcase-empty-state">
                  Empty Dataset Container
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;