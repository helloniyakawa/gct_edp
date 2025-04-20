// src/components/TrelloCard.js
import React from 'react';
import './TrelloCard.css';

const TrelloCard = ({ card, onClick, searchTerm }) => {
  if (!card) return null;
  
  const { id, name, labels, due, dueComplete } = card;
  
  // Format card name with highlighting if search term is provided
  const formatCardName = () => {
    if (!searchTerm) return name;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    const parts = name.split(regex);
    
    return parts.map((part, i) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return <span key={i} className="highlight">{part}</span>;
      }
      return part;
    });
  };
  
  // Format due date
  const formatDueDate = () => {
    if (!due) return null;
    
    const dueDate = new Date(due);
    const formattedDate = dueDate.toLocaleDateString();
    
    return (
      <div className="card-meta">
        <span>📅 {formattedDate}</span>
        {dueComplete && <span className="due-complete">✓ Complete</span>}
      </div>
    );
  };
  
  // Helper function to escape special characters in regex
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  return (
    <div 
      className="trello-card" 
      data-card-id={id}
      onClick={onClick}
    >
      {/* Display labels if any */}
      {labels && labels.length > 0 && (
        <div className="card-labels">
          {labels.map((label, index) => (
            label.color && (
              <div 
                key={index}
                className="card-label"
                style={{ backgroundColor: getLabelColor(label.color) }}
                title={label.name || label.color}
              />
            )
          ))}
        </div>
      )}
      
      {/* Card title */}
      <div className="card-title">
        {formatCardName()}
      </div>
      
      {/* Due date if any */}
      {formatDueDate()}
    </div>
  );
};

export default TrelloCard;