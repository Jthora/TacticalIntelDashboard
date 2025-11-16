import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import WingCommanderLogo from '../assets/images/WingCommanderLogo-288x162.gif';
import { MissionMode, missionModeProfiles } from '../constants/MissionMode';
import { useMissionMode } from '../contexts/MissionModeContext';
import { useSearch } from '../contexts/SearchContext';
import NavigationButtons from './navigation/NavigationButtons';
import Web3Button from './web3/Web3Button';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { performSearch, isSearching } = useSearch();
  let missionContext: ReturnType<typeof useMissionMode> | null = null;
  try {
    missionContext = useMissionMode();
  } catch {
    missionContext = null;
  }

  const activeMode = missionContext?.mode ?? MissionMode.MILTECH;
  const activeProfile = missionContext?.profile ?? missionModeProfiles[MissionMode.MILTECH];
  const updateMode = missionContext?.setMode;
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const modeSwitcherButtonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!logoRef.current || typeof window === 'undefined' || !import.meta.env.DEV) {
      return;
    }

    const styles = window.getComputedStyle(logoRef.current);
    console.table({
      mode: activeMode,
      backgroundColor: styles.backgroundColor,
      mixBlendMode: styles.mixBlendMode,
      filter: styles.filter,
      boxShadow: styles.boxShadow,
      isolation: styles.isolation,
      opacity: styles.opacity
    });
  }, [activeMode]);

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

  const updatePopoverPosition = useCallback(() => {
    if (!showModeSwitcher || !modeSwitcherButtonRef.current) {
      return;
    }
    const triggerRect = modeSwitcherButtonRef.current.getBoundingClientRect();
    const popoverWidth = 300;
    const gutter = 12;
    const top = triggerRect.bottom + 10 + window.scrollY;
    const preferredLeft = triggerRect.right - popoverWidth;
    const minLeft = gutter + window.scrollX;
    const maxLeft = window.innerWidth - popoverWidth - gutter;
    const left = Math.min(Math.max(preferredLeft, minLeft), maxLeft);
    setPopoverPosition({ top, left });
  }, [showModeSwitcher]);

  useEffect(() => {
    if (!showModeSwitcher) {
      return;
    }

    updatePopoverPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        modeSwitcherButtonRef.current?.contains(target)
      ) {
        return;
      }
      setShowModeSwitcher(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModeSwitcher(false);
      }
    };

    const handleViewportChange = () => updatePopoverPosition();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [showModeSwitcher, updatePopoverPosition]);

  const handleModeSelect = (nextMode: MissionMode) => {
    if (nextMode !== activeMode && updateMode) {
      updateMode(nextMode, { reason: 'header-mode-switch' });
    }
    setShowModeSwitcher(false);
  };

  const modeOptions = [missionModeProfiles[MissionMode.MILTECH], missionModeProfiles[MissionMode.SPACEFORCE]];

  return (
    <header className="tactical-header-enhanced tactical-header-compact">
      <div className="header-primary-bar">
        {/* Brand section */}
        <div
          className="brand-micro"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <span
            style={{
              display: 'inline-block',
              mixBlendMode: 'screen',
              lineHeight: 0
            }}
          >
            <img
              src={WingCommanderLogo}
              alt="TC"
              ref={logoRef}
              style={{
                height: 36,
                width: 'auto',
                display: 'block',
                objectFit: 'contain'
              }}
            />
          </span>
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
              aria-label="Search intelligence"
            />
            <button 
              type="submit" 
              className="search-btn-micro"
              disabled={isSearching || !searchQuery.trim()}
              title="Search"
              aria-label="Execute search"
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
            aria-label="Toggle fullscreen"
          >
            ⛶
          </button>
          <div className="mode-switcher-control">
            <button
              type="button"
              className={`control-btn-micro mode-switcher-btn ${showModeSwitcher ? 'active' : ''}`}
              onClick={() => setShowModeSwitcher(prev => !prev)}
              aria-haspopup="dialog"
              aria-expanded={showModeSwitcher}
              aria-label="Switch mission mode"
              title="Switch mission mode"
              ref={modeSwitcherButtonRef}
            >
              {activeProfile.badge}
            </button>
          </div>
        </div>
      </div>
      {showModeSwitcher && typeof document !== 'undefined' && createPortal(
        <div className="mode-switcher-layer" role="presentation">
          <div
            className="mode-switcher-popover"
            role="dialog"
            aria-label="Mission mode selection"
            ref={popoverRef}
            style={{ top: popoverPosition.top, left: popoverPosition.left }}
          >
            <div className="mode-switcher-header">
              <p className="mode-switcher-title">Mission Mode</p>
              <span className="mode-switcher-subtitle">Choose operational profile</span>
            </div>
            <div className="mode-switcher-grid">
              {modeOptions.map(option => {
                const isActive = option.id === activeMode;
                const accentVariable = option.accentColor;
                const buttonStyle = {
                  '--mode-accent': accentVariable,
                  background: isActive
                    ? `linear-gradient(135deg, ${accentVariable}40 0%, rgba(4, 17, 29, 0.9) 80%)`
                    : 'rgba(2, 12, 22, 0.95)'
                } as React.CSSProperties & { '--mode-accent': string };
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`mode-option-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleModeSelect(option.id)}
                    aria-pressed={isActive}
                    style={buttonStyle}
                  >
                    <span className="mode-option-badge" aria-hidden="true">{option.badge}</span>
                    <span className="mode-option-label">{option.label}</span>
                    <span className="mode-option-tagline">{option.tagline}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default Header;
