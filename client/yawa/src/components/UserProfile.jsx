// src/components/UserProfile.jsx
import React from 'react';

const UserProfile = ({ onLogout }) => {
  return (
    <div className="dashboard-container">
      <h1>Welcome Back!</h1>
      <p>This panel is perfectly centered on your screen.</p>
      <button onClick={onLogout} className="logout-button">Log Out</button>
    </div>
  );
};

export default UserProfile;