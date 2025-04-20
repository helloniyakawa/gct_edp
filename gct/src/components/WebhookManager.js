// src/components/WebhookManager.js
import React, { useState, useEffect } from 'react';
import { trelloService } from '../services/api';
import './WebhookManager.css';

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit'
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await trelloService.getWebhooks();
      setWebhooks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load webhooks: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'add') {
        await trelloService.createWebhook(formData);
      } else if (formMode === 'edit' && editingId) {
        await trelloService.updateWebhook(editingId, formData);
      }
      
      // Reset form and refresh webhooks
      resetForm();
      fetchWebhooks();
    } catch (err) {
      setError(`Failed to ${formMode} webhook: ` + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleEdit = (webhook) => {
    setFormMode('edit');
    setEditingId(webhook._id);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      description: webhook.description || ''
    });
  };

  const handleDelete = async (webhookId) => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
      await trelloService.deleteWebhook(webhookId);
      fetchWebhooks();
    } catch (err) {
      setError('Failed to delete webhook: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormMode('add');
    setEditingId(null);
    setFormData({
      name: '',
      url: '',
      description: ''
    });
  };

  return (
    <div className="webhook-manager">
      <div className="webhook-manager-header">
        <h2>Webhook Management</h2>
        <p>Manage Google Chat webhook configurations for sending card notifications</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="webhook-form">
        <h3>{formMode === 'add' ? 'Add New Webhook' : 'Edit Webhook'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Webhook Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Eduprima Tutoring Notifications"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="url">Webhook URL</label>
            <input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://chat.googleapis.com/v1/spaces/..."
              required
            />
            <div className="field-hint">
              Get this URL from Google Chat: Space name → Apps & integrations → Manage webhooks
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What is this webhook used for?"
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="primary-button">
              {formMode === 'add' ? 'Add Webhook' : 'Save Changes'}
            </button>
            
            {formMode === 'edit' && (
              <button 
                type="button" 
                className="secondary-button" 
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="webhook-list-container">
        <h3>Configured Webhooks</h3>
        {loading ? (
          <div className="loading-indicator">Loading webhooks...</div>
        ) : webhooks.length > 0 ? (
          <div className="webhook-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map(webhook => (
                  <tr key={webhook._id}>
                    <td>{webhook.name}</td>
                    <td className="webhook-url">{webhook.url}</td>
                    <td>{webhook.description}</td>
                    <td className="webhook-actions">
                      <button 
                        onClick={() => handleEdit(webhook)}
                        className="edit-button"
                        title="Edit webhook"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(webhook._id)}
                        className="delete-button"
                        title="Delete webhook"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No webhooks configured yet. Add your first webhook above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookManager;