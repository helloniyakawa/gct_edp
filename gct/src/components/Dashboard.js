// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { trelloService } from '../services/api';
import { Link } from 'react-router-dom';
import TrelloList from './TrelloList';
import CardModal from './CardModal';
import SearchBar from './SearchBar';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [boardData, setBoardData] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredLists, setFilteredLists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOptions, setSearchOptions] = useState({
    searchTitles: true,
    searchDescriptions: true,
    searchLabels: true
  });
  const [searchResults, setSearchResults] = useState(null);

  // Get board ID from environment or config
  const boardId = process.env.REACT_APP_DEFAULT_BOARD_ID || "";

useEffect(() => {
  // Load the board data when the component mounts
  loadBoard();
}, [boardId]); 

  // Effect for filtering lists when search term changes
  useEffect(() => {
    if (!boardData || !lists.length) return;
    
    if (!searchTerm.trim()) {
      setFilteredLists(lists);
      setSearchResults(null);
      return;
    }

    const { searchTitles, searchDescriptions, searchLabels } = searchOptions;
    const term = searchTerm.toLowerCase().trim();
    let matchCount = 0;
    
    // Clone the lists and filter cards
    const filtered = lists.map(list => {
      const filteredCards = list.cards.filter(card => {
        const titleMatch = searchTitles && card.name.toLowerCase().includes(term);
        const descMatch = searchDescriptions && (card.desc || "").toLowerCase().includes(term);
        
        // Check labels
        let labelMatch = false;
        if (searchLabels && card.labels && card.labels.length > 0) {
          labelMatch = card.labels.some(label => 
            (label.name || "").toLowerCase().includes(term)
          );
        }
        
        const isMatch = titleMatch || descMatch || labelMatch;
        if (isMatch) matchCount++;
        return isMatch;
      });
      
      return {
        ...list,
        cards: filteredCards,
        isEmpty: filteredCards.length === 0
      };
    });
    
    setFilteredLists(filtered);
    setSearchResults({ count: matchCount, term });
  }, [searchTerm, searchOptions, lists, boardData]);

  const loadBoard = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get board info
      const boardResponse = await trelloService.getBoard(boardId);
      setBoardData(boardResponse.data);
      
      // Get lists with cards
      const listsResponse = await trelloService.getLists(boardId);
      setLists(listsResponse.data);
      setFilteredLists(listsResponse.data);
      
      // Update timestamp
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load board data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadBoard();
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleSearch = (term, options) => {
    setSearchTerm(term);
    setSearchOptions(options);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
  };

  return (
    <div className="dashboard">
      <div className="navbar">
        <h1>Trello to Google Chat EDUPRIMA</h1>
        <div className="user-section">
          {/* Add these admin links */}
          {currentUser?.role === 'admin' && (
            <div className="admin-links">
              <Link to="/webhooks" className="admin-link">Manage Webhooks</Link>
              <Link to="/users" className="admin-link">Manage Users</Link>
            </div>
          )}
          <span>{currentUser?.name || currentUser?.email}</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </div>
  
      <div className="container">
        {loading ? (
          <div className="loading-indicator">Loading Tutoring Operation board...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="board-content">
            <h2>{boardData?.name || "Tutoring Operation"}</h2>
            
            <SearchBar 
              onSearch={handleSearch}
              onClear={clearSearch}
              searchResults={searchResults}
              initialOptions={searchOptions}
            />
            
            <button onClick={handleRefresh} className="refresh-button">
              ↻ Refresh Board
            </button>
            
            {lastUpdated && (
              <div className="last-updated">
                Last updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            
            {/* Use filteredLists when searching, otherwise use lists */}
            <div className="lists-container">
              {(searchTerm ? filteredLists : lists).map(list => (
                <TrelloList 
                  key={list.id} 
                  list={list} 
                  onCardClick={handleCardClick}
                  searchTerm={searchTerm}
                />
              ))}
            </div>
          </div>
        )}
      </div>
  
      {isModalOpen && selectedCard && (
        <CardModal 
          card={selectedCard} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default Dashboard;