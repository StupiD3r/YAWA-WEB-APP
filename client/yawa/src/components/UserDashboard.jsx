// src/components/UserDashboard.jsx
import React, { useState, useEffect } from 'react';

const UserDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('subject_analytics');
  
  // States to hold your MongoDB data and track system statuses
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigationStructure = [
    { id: 'overview', label: 'Dashboard Overview' },
    { id: 'subject_analytics', label: 'Student Course Analytics' }, // Updated title
    { id: 'student_reports', label: 'Student Reports' },
    { id: 'at_risk', label: 'At-Risk & Trends' },
    { id: 'streams', label: 'Streams' }
  ];

  // Fetch the dataset from your backend server
  useEffect(() => {
    if (activeTab === 'subject_analytics') {
      setLoading(true);
      setError(null);
      
      // NOTE: Replace this URL with your actual backend server address if it is different!
      fetch('http://localhost:5173/api/subjects') 
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch dataset from backend server.');
          return res.json();
        })
        .then((data) => {
          setStudents(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [activeTab]);

  // Dynamically calculate the Class Average Grade from your dataset
  const calculateClassAverage = () => {
    if (students.length === 0) return '0.0';
    const totalGrade = students.reduce((acc, curr) => acc + (Number(curr.grade) || 0), 0);
    return (totalGrade / students.length).toFixed(2);
  };

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
                  <h2>Student Course Records</h2>
                  <p className="pane-desc">Live streaming dataset populated from your MongoDB collection.</p>
                </div>
                <div className="kpi-card">
                  <h3>Overall Grade Average:</h3>
                  <div className="kpi-value">{calculateClassAverage()} GPA</div>
                </div>
              </div>

              {/* The Dark Green Analytical Table Display mapped to your MongoDB Keys */}
              <div className="dataset-showcase-box">
                <div className="showcase-table-header">
                  <div className="header-col-label">ID</div>
                  <div className="header-col-label">Student Name</div>
                  <div className="header-col-label">Department / Course</div>
                  <div className="header-col-label">Semester</div>
                  <div className="header-col-label">Grade</div>
                </div>
                
                {/* Status displays */}
                {loading && (
                  <div className="showcase-empty-state">Loading MongoDB matrices...</div>
                )}
                
                {error && (
                  <div className="showcase-empty-state" style={{ color: '#ff8a8a' }}>Error: {error}</div>
                )}

                {!loading && !error && students.length === 0 && (
                  <div className="showcase-empty-state">No student profiles found in MongoDB.</div>
                )}

                {/* THE MAPPING BLOCK: Notice how the fields match your exact keys now */}
                {!loading && !error && students.map((student, index) => (
                  <div 
                    key={student._id?.$oid || student._id || index} 
                    className="showcase-table-header" 
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}
                  >
                    <div style={{ color: '#c59b27' }}>{student.student_id}</div>
                    <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{student.student_name}</div>
                    <div style={{ color: '#d8e3d8' }}>
                      {student.department} ({student.course_code})
                    </div>
                    <div style={{ color: '#d8e3d8' }}>{student.semester}</div>
                    <div style={{ color: '#c59b27', fontWeight: 'bold' }}>{student.grade}</div>
                  </div>
                ))}
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