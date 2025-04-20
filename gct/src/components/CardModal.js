// src/components/CardModal.js
import React, { useState, useEffect } from 'react';
import { trelloService } from '../services/api';
import './CardModal.css';

const CardModal = ({ card, onClose }) => {
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [webhooks, setWebhooks] = useState([]);
  const [selectedWebhook, setSelectedWebhook] = useState('');
  
  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const response = await trelloService.getWebhooks();
        setWebhooks(response.data);
        
        // Set default webhook if available
        if (response.data.length > 0) {
          setSelectedWebhook(response.data[0]._id); // Make sure this is using _id
        }
      } catch (error) {
        console.error('Failed to load webhooks:', error);
      }
    };
    
    fetchWebhooks();
  }, []);
  
  if (!card) return null;
  
  const { name, desc, labels, due, dueComplete, url } = card;
  
  // Extract link from description
  const extractLink = (description, label) => {
    if (!description || !label) return null;
    
    // Remove colon at end of label if present
    const cleanLabel = label.replace(/:$/, '');
    
    // Match full markdown format: [text](url)
    let match = description.match(new RegExp(`${cleanLabel}:\\s*\\[(.*?)\\]\\((https?:\\/\\/[^\\s)]+)`, 'i'));
    if (match && match[2]) {
      return {
        text: match[1].trim(),
        url: match[2].trim()
      };
    }
    
    // Match short format: [url]
    match = description.match(new RegExp(`${cleanLabel}:\\s*\\[(https?:\\/\\/[^\\]\\s]+)\\]`, 'i'));
    if (match && match[1]) {
      return {
        text: match[1].trim(),
        url: match[1].trim()
      };
    }
    
    return null;
  };
  
  // Get attendance link if available
  const presensiLink = extractLink(desc, 'Link Presensi');
  
  // Format due date
  const formatDueDate = () => {
    if (!due) return null;
    
    const dueDate = new Date(due);
    const formattedDate = dueDate.toLocaleDateString();
    
    return (
      <div className="popup-meta">
        <span>📅 {formattedDate}</span>
        {dueComplete && <span className="due-complete">✓ Complete</span>}
      </div>
    );
  };
  
  // Get color for label based on Trello color names
  const getLabelColor = (colorName) => {
    const colors = {
      'green': '#61bd4f',
      'yellow': '#f2d600',
      'orange': '#ff9f1a',
      'red': '#eb5a46',
      'purple': '#c377e0',
      'blue': '#0079bf',
      'sky': '#00c2e0',
      'lime': '#51e898',
      'pink': '#ff78cb',
      'black': '#344563'
    };
    
    return colors[colorName] || '#b3bac5';
  };
  
  // Send card to Google Chat
  const sendToGoogleChat = async () => {
    if (!selectedWebhook) {
      setSendStatus({
        success: false,
        message: 'Please select a destination'
      });
      return;
    }
    
    setSending(true);
    setSendStatus(null);
    
    try {
      const response = await trelloService.sendToGoogleChat(card.id, {
        caption: caption,
        webhookId: selectedWebhook
      });
      
      setSendStatus({
        success: true,
        message: `Successfully sent to ${webhooks.find(w => w.id === selectedWebhook)?.name || 'Google Chat'}`
      });
    } catch (error) {
      setSendStatus({
        success: false,
        message: error.response?.data?.message || 'Failed to send message'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <div className="popup-title">{name}</div>
          <div className="popup-close" onClick={onClose}>×</div>
        </div>
        
        <div className="popup-body">
          {/* Labels */}
          {labels && labels.length > 0 && (
            <div className="popup-labels">
              {labels.map((label, index) => (
                label.color && (
                  <div 
                    key={index}
                    className="popup-label"
                    style={{ backgroundColor: getLabelColor(label.color) }}
                    title={label.name || label.color}
                  />
                )
              ))}
            </div>
          )}
          
          {/* Description */}
          {desc && (
            <div className="popup-description">
              {desc}
            </div>
          )}
          
          {/* Due date */}
          {formatDueDate()}
        </div>
        
        <div className="popup-actions">
          <label className="webhook-selector-label">
            Add Caption:
          </label>
          <textarea
            className="popup-caption"
            placeholder="Enter message to send to Google Chat..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          
          <label className="webhook-selector-label">
            Select Google Chat Destination:
          </label>
          <select 
            className="webhook-selector"
            value={selectedWebhook}
            onChange={e => setSelectedWebhook(e.target.value)}
          >
            <option value="">Select destination</option>
            {webhooks.map(webhook => (
              <option key={webhook._id} value={webhook._id}>
                {webhook.name}
              </option>
            ))}
          </select>
          
          <div className="popup-buttons">
            <button 
              className="popup-open-trello" 
              onClick={() => window.open(url, '_blank')}
            >
              Open in Trello
            </button>
            <button 
              className="popup-send-to-chat"
              onClick={sendToGoogleChat}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send to Google Chat'}
            </button>
          </div>
          
          {sendStatus && (
            <div className={`popup-send-status ${sendStatus.success ? 'status-success' : 'status-error'}`}>
              {sendStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardModal;