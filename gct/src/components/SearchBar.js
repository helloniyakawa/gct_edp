// src/components/SearchBar.js
import React, { useState, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, onClear, searchResults, initialOptions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOptions, setSearchOptions] = useState({
    searchTitles: true,
    searchDescriptions: true,
    searchLabels: true,
    ...initialOptions
  });

  // Listen for Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  // Update search options when a checkbox is toggled
  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setSearchOptions(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Perform the search
  const performSearch = () => {
    onSearch(searchTerm, searchOptions);
  };

  // Clear the search
  const clearSearch = () => {
    setSearchTerm('');
    onClear();
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          id="searchInput"
          className="search-input"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="search-actions">
          <button 
            id="searchButton" 
            className="search-button"
            onClick={performSearch}
          >
            Search
          </button>
          <button 
            id="clearButton" 
            className="clear-button"
            onClick={clearSearch}
          >
            Clear
          </button>
        </div>
        
        {searchResults && (
          <div className="search-result-count">
            {searchResults.count === 0 
              ? 'No cards found' 
              : `Found ${searchResults.count} card${searchResults.count === 1 ? '' : 's'}`}
          </div>
        )}
      </div>
      
      <div className="search-options">
        <label className="search-option">
          <input
            type="checkbox"
            name="searchTitles"
            checked={searchOptions.searchTitles}
            onChange={handleOptionChange}
          />
          Search in titles
        </label>
        <label className="search-option">
          <input
            type="checkbox"
            name="searchDescriptions"
            checked={searchOptions.searchDescriptions}
            onChange={handleOptionChange}
          />
          Search in descriptions
        </label>
        <label className="search-option">
          <input
            type="checkbox"
            name="searchLabels"
            checked={searchOptions.searchLabels}
            onChange={handleOptionChange}
          />
          Search in labels
        </label>
      </div>
    </div>
  );
};

export default SearchBar;