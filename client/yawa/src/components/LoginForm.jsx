// src/components/LoginForm.jsx
import React, { useState } from 'react';

const LoginForm = ({ onLoginAttempt, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitForm = (e) => {
    e.preventDefault();
    onLoginAttempt({ username, password });
  };

  return (
    <div className="auth-card">
      <form onSubmit={submitForm}>
        <h2>Control Panel Login</h2>
        <div className="input-group">
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="" 
            required 
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="" 
            required 
          />
        </div>
        <button type="submit" className="core-button login-button">Log In</button>
      </form>
      <div className="switch-panel">
        <button onClick={onSwitchToRegister} className="link-button">Create Account</button>
      </div>
    </div>
  );
};

export default LoginForm;