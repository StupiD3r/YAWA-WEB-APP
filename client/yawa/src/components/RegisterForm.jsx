// src/components/RegisterForm.jsx
import React, { useState } from 'react';

const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitForm = (e) => {
    e.preventDefault();
    onRegisterSuccess({ username, password });
  };

  return (
    <div className="auth-card">
      <form onSubmit={submitForm}>
        <h2>Create Account</h2>
        <div className="input-group">
          <label>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="" required />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="" required />
        </div>
        <button type="submit" className="core-button register-button">Register</button>
      </form>
      <div className="switch-panel">
        <button onClick={onSwitchToLogin} className="link-button">Back to Login</button>
      </div>
    </div>
  );
};

export default RegisterForm;