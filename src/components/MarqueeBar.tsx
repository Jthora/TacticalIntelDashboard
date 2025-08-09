import React, { useMemo } from 'react';
import { useIntelligence } from '../contexts/IntelligenceContext';

// Simple infinite scrolling marquee for enabled sources
// Displays source name and latest update timestamp placeholder

const MarqueeBar: React.FC = () => {
  const { state } = useIntelligence();

  const marqueeSources = useMemo(() => state.sources.filter(s => s.marqueeEnabled), [state.sources]);

  if (marqueeSources.length === 0) {
    return null; // Nothing to show
  }

  return (
    <div className="marquee-bar" role="marquee" aria-label="Active intelligence sources marquee">
      <div className="marquee-track">
        {marqueeSources.map(src => (
          <div key={src.id} className="marquee-item" data-source-id={src.id}>
            <span className="marquee-source-name">{src.name}</span>
            <span className={`marquee-health status-${src.healthStatus}`}>{src.healthStatus.toUpperCase()}</span>
            {src.lastUpdated && <span className="marquee-updated">{new Date(src.lastUpdated).toLocaleTimeString()}</span>}
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {marqueeSources.map(src => (
          <div key={src.id + '-dup'} className="marquee-item" data-source-id={src.id}>
            <span className="marquee-source-name">{src.name}</span>
            <span className={`marquee-health status-${src.healthStatus}`}>{src.healthStatus.toUpperCase()}</span>
            {src.lastUpdated && <span className="marquee-updated">{new Date(src.lastUpdated).toLocaleTimeString()}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBar;
