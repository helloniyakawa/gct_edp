// src/components/TestLogin.js
import React, { useState } from 'react';

function TestLogin() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('admin123');
  const [status, setStatus] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('Attempting to log in...');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Full response:', { status: response.status, data });

      if (response.ok) {
        setStatus('Login successful! Token: ' + data.token.substring(0, 10) + '...');
        localStorage.setItem('token', data.token);
      } else {
        setStatus('Login failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus('Error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Test Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        <button
          type="submit"
          style={{ padding: '10px 15px', backgroundColor: '#0079bf', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          Login
        </button>
      </form>
      {status && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '3px' }}>
          {status}
        </div>
      )}
    </div>
  );
}

export default TestLogin;