import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './UserManager.css';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedWebhooks, setSelectedWebhooks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, webhooksResponse] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/google/chat/webhooks')
      ]);
      
      setUsers(usersResponse.data);
      setWebhooks(webhooksResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to load data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedWebhooks(user.accessibleWebhooks || []);
  };

  const handleWebhookToggle = (webhookId) => {
    setSelectedWebhooks(prev => {
      if (prev.includes(webhookId)) {
        return prev.filter(id => id !== webhookId);
      } else {
        return [...prev, webhookId];
      }
    });
  };

  const handleSaveAccess = async () => {
    try {
      await api.put(`/api/users/${selectedUser._id}/webhooks`, {
        webhookIds: selectedWebhooks
      });
      
      // Update local state
      setUsers(users.map(user => 
        user._id === selectedUser._id
          ? { ...user, accessibleWebhooks: selectedWebhooks }
          : user
      ));
      
      setError('');
      alert('Webhook access updated successfully');
    } catch (err) {
      setError('Failed to update access: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="loading-indicator">Loading...</div>;

  return (
    <div className="user-manager">
      <h2>User Webhook Access Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="user-manager-content">
        <div className="user-list">
          <h3>Users</h3>
          <ul>
            {users.map(user => (
              <li 
                key={user._id} 
                className={selectedUser?._id === user._id ? 'selected' : ''}
                onClick={() => handleUserSelect(user)}
              >
                {user.name} ({user.email})
                <span className="user-role">{user.role}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {selectedUser && (
          <div className="webhook-access">
            <h3>Webhook Access for {selectedUser.name}</h3>
            
            <div className="webhook-checkboxes">
              {webhooks.map(webhook => (
                <div key={webhook._id} className="webhook-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedWebhooks.includes(webhook._id)}
                      onChange={() => handleWebhookToggle(webhook._id)}
                    />
                    {webhook.name}
                  </label>
                </div>
              ))}
            </div>
            
            <button 
              className="save-access-button"
              onClick={handleSaveAccess}
            >
              Save Access Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;