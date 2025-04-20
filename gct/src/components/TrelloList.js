// src/components/TrelloList.js
import React from 'react';
import TrelloCard from './TrelloCard';
import './TrelloList.css';

const TrelloList = ({ list, onCardClick, searchTerm }) => {
  if (!list) return null;
  
  const { id, name, cards, isEmpty } = list;
  
  // Don't display lists with no cards when filtering
  if (searchTerm && isEmpty) {
    return null;
  }

  return (
    <div className="trello-list" data-list-id={id}>
      <div className="list-header">{name}</div>
      
      {cards.length > 0 ? (
        cards.map(card => (
          <TrelloCard 
            key={card.id} 
            card={card} 
            onClick={() => onCardClick(card)}
            searchTerm={searchTerm}
          />
        ))
      ) : (
        <div className="list-empty-message">
          {searchTerm ? 'No matching cards' : 'No cards'}
        </div>
      )}
    </div>
  );
};

export default TrelloList;