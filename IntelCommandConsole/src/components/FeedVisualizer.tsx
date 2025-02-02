import React, { useEffect, useState } from 'react';
import FeedItem from './FeedItem';
import FeedService from '../services/FeedService';
import { FeedItem as FeedItemType } from '../types/FeedTypes';

interface FeedVisualizerProps {
  selectedFeedList: string | null;
}

const FeedVisualizer: React.FC<FeedVisualizerProps> = ({ selectedFeedList }) => {
  const [feeds, setFeeds] = useState<FeedItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeeds = async () => {
      if (selectedFeedList) {
        setLoading(true);
        setError(null);
        try {
          console.log(`Loading feeds for list: ${selectedFeedList}`);
          const feedResults = FeedService.getFeedResults(selectedFeedList);
          if (feedResults) {
            setFeeds(feedResults.feeds);
            console.log(`Loaded feeds: ${JSON.stringify(feedResults.feeds)}`);
          } else {
            const feedsByList = FeedService.getFeedsByList(selectedFeedList);
            setFeeds(feedsByList);
            console.log(`Loaded feeds by list: ${JSON.stringify(feedsByList)}`);
          }
        } catch (err) {
          console.error('Failed to load feeds:', err);
          setError('Failed to load feeds');
        } finally {
          setLoading(false);
        }
      } else {
        setFeeds([]);
        setLoading(false);
      }
    };
    loadFeeds();
  }, [selectedFeedList]);

  useEffect(() => {
    const updateFeeds = async () => {
      setLoading(true);
      setError(null);
      try {
        await FeedService.updateFeedsFromServer();
        const feedResults = FeedService.getFeedResults(selectedFeedList || '');
        if (feedResults) {
          setFeeds(feedResults.feeds);
          console.log(`Updated feeds: ${JSON.stringify(feedResults.feeds)}`);
        }
      } catch (err) {
        console.error('Failed to update feeds:', err);
        setError('Failed to update feeds');
      } finally {
        setLoading(false);
      }
    };
    updateFeeds();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="feed-visualizer">
      {feeds.length === 0 ? (
        <div>No feeds available</div>
      ) : (
        feeds.map((feed, index) => (
          <FeedItem key={index} title={feed.title} link={feed.link} pubDate={feed.pubDate} />
        ))
      )}
    </div>
  );
};

export default FeedVisualizer;