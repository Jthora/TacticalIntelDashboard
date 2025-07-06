import React, { useState, useEffect } from 'react';
import HealthDashboard from './HealthDashboard';
import ExportPanel from './ExportPanel';
import PerformanceMonitor from './PerformanceMonitor';
import FeedService from '../features/feeds/services/FeedService';
import { Feed } from '../models/Feed';

const RightSidebar: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const feedData = await FeedService.getFeeds();
        setFeeds(feedData);
      } catch (error) {
        console.error('Failed to load feeds for export:', error);
      }
    };
    loadFeeds();
  }, []);

  return (
    <div className="right-sidebar">
      <PerformanceMonitor />
      <HealthDashboard />
      <ExportPanel 
        feeds={feeds} 
        onExportComplete={(format, filename) => {
          console.log(`Export completed: ${filename} (${format})`);
        }}
      />
      <h2>Filters</h2>
      {/* Add filter options here */}
    </div>
  );
};

export default RightSidebar;