import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';

import WingCommanderLogo from '../assets/images/WingCommanderLogo-288x162.gif';
import { useSearch } from '../contexts/SearchContext';
import Modal from '../shared/components/Modal';
import FeedManager from './FeedManager';
import NavigationButtons from './navigation/NavigationButtons';
import Web3Button from './web3/Web3Button';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { performSearch, isSearching } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeedManager, setShowFeedManager] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch({ 
        query: searchQuery.trim(),
        operators: 'AND',
        caseSensitive: false 
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="tactical-header-enhanced tactical-header-compact">
      <div className="header-primary-bar">
        {/* Brand section */}
        <div className="brand-micro">
          <img 
            src={WingCommanderLogo} 
            alt="TC" 
            className="brand-icon-micro"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <div className="brand-text-micro">
            <span className="brand-code">TACTICAL INTEL DASHBOARD</span>
          </div>
        </div>
        
        {/* Status indicators - reordered for better spacing */}
        <div className="status-micro-grid">
          <div className="clock-display" title="System Time">
            {currentTime.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className="status-indicator status-online" title="Connection Status">
            ● ONLINE
          </div>
        </div>

        {/* Search */}
        <div className="search-micro">
          <form onSubmit={handleSearch} className="search-form-micro">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="SEARCH INTEL..."
              className="search-input-micro"
              disabled={isSearching}
            />
            <button 
              type="submit" 
              className="search-btn-micro"
              disabled={isSearching || !searchQuery.trim()}
              title="Search"
            >
              {isSearching ? '⟳' : '→'}
            </button>
          </form>
        </div>

        {/* Controls */}
        <div className="controls-micro">
          <NavigationButtons />
          <Web3Button />
          <button 
            className="control-btn-micro"
            onClick={() => {
              document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
              });
            }}
            title="Toggle Fullscreen"
          >
            ⛶
          </button>
        </div>
      </div>
      
      <Modal
        isOpen={showFeedManager}
        onClose={() => setShowFeedManager(false)}
        title="FEED MANAGEMENT CONSOLE"
        size="fullscreen"
      >
        <FeedManager />
      </Modal>
    </header>
  );
};

export default Header;
