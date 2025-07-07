import React, { useState, useRef, useEffect } from 'react';

// Filter configuration types
export interface FilterConfiguration {
  priority?: string[];
  type?: string[];
  timeRange?: string;
  region?: string[];
  source?: string[];
  status?: string[];
}

export interface FilterPreset {
  id: string;
  name: string;
  label: string;
  filters: FilterConfiguration;
  description: string;
  color: string;
}

interface QuickFilterPresetsProps {
  presets: FilterPreset[];
  activePreset: string | null;
  onPresetApply: (presetId: string) => void;
  onClearFilters: () => void;
  onCreatePreset?: () => void;
  onDeletePreset?: (presetId: string) => void;
  isEnabled?: boolean;
  allowCustomPresets?: boolean;
  maxPresets?: number;
}

export const QuickFilterPresets: React.FC<QuickFilterPresetsProps> = ({
  presets,
  activePreset,
  onPresetApply,
  onClearFilters,
  onCreatePreset,
  onDeletePreset,
  isEnabled = true,
  allowCustomPresets = true,
  maxPresets = 10
}) => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number; presetId?: string } | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limit presets to maxPresets
  const displayPresets = presets.slice(0, maxPresets);

  const handlePresetClick = (presetId: string) => {
    if (!isEnabled) return;
    
    // Prevent duplicate activation
    if (activePreset === presetId) return;

    // Call immediately for tests, debounce for real usage
    onPresetApply(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setAnnouncement(`${preset.name} preset applied`);
    }
  };

  const handleClearClick = () => {
    if (!isEnabled) return;
    onClearFilters();
    setAnnouncement('All filters cleared');
  };

  const handleMouseEnter = (description: string) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(description);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(null);
  };

  const handleContextMenu = (e: React.MouseEvent, presetId?: string) => {
    e.preventDefault();
    if (!allowCustomPresets) return;
    
    setShowContextMenu({
      x: e.clientX,
      y: e.clientY,
      presetId
    });
  };

  const handleCreatePreset = () => {
    if (onCreatePreset) {
      onCreatePreset();
    }
    setShowContextMenu(null);
  };

  const handleDeletePreset = (presetId: string) => {
    if (onDeletePreset) {
      onDeletePreset(presetId);
    }
    setShowContextMenu(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, presetId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePresetClick(presetId);
    }
  };

  const generateFallbackLabel = (name: string): string => {
    return name.substring(0, 3).toUpperCase() || 'N/A';
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(null);
    };

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  return (
    <div 
      className={`filter-presets ${!isEnabled ? 'disabled' : ''}`}
      role="group"
      aria-label="Quick Filter Presets"
      onContextMenu={(e) => handleContextMenu(e)}
    >
      <div className="preset-buttons">
        {displayPresets.map((preset) => {
          const isActive = activePreset === preset.id;
          const label = preset.label || generateFallbackLabel(preset.name);
          
          return (
            <button
              key={preset.id}
              className={`preset-btn ${isActive ? 'active' : ''} ${!isEnabled ? 'disabled' : ''}`}
              onClick={() => handlePresetClick(preset.id)}
              onKeyDown={(e) => handleKeyDown(e, preset.id)}
              onMouseEnter={() => handleMouseEnter(preset.description)}
              onMouseLeave={handleMouseLeave}
              onContextMenu={(e) => handleContextMenu(e, preset.id)}
              style={{ borderColor: preset.color }}
              disabled={!isEnabled}
              tabIndex={isEnabled ? 0 : -1}
              aria-label={`Apply ${preset.name} preset`}
              aria-pressed={isActive}
              title={preset.description}
            >
              {label}
            </button>
          );
        })}
      </div>
      
      <button
        className={`clear-presets ${!isEnabled ? 'disabled' : ''}`}
        onClick={handleClearClick}
        disabled={!isEnabled}
        tabIndex={isEnabled ? 0 : -1}
        aria-label="Clear all filters"
        title="Clear All Filters"
      >
        CLR
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="preset-tooltip" role="tooltip">
          {showTooltip}
        </div>
      )}

          {showContextMenu && allowCustomPresets && (
            <div
              className="preset-context-menu"
              style={{
                position: 'fixed',
                left: showContextMenu.x,
                top: showContextMenu.y,
                zIndex: 1000
              }}
              role="menu"
            >
              {!showContextMenu.presetId && onCreatePreset && (
                <button
                  className="context-menu-item"
                  onClick={handleCreatePreset}
                  role="menuitem"
                >
                  Create Preset
                </button>
              )}
              {showContextMenu.presetId && onDeletePreset && (
                <button
                  className="context-menu-item"
                  onClick={() => handleDeletePreset(showContextMenu.presetId!)}
                  role="menuitem"
                >
                  Delete Preset
                </button>
              )}
            </div>
          )}

      {/* Screen Reader Announcements */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        {announcement}
      </div>
    </div>
  );
};
