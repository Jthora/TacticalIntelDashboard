import React, { useEffect, useState } from 'react';
import FeedItem from './FeedItem';
import { fetchRSSFeeds } from '../services/FeedService';

interface Feed {
  title: string;
  link: string;
  pubDate: string;
}

const FeedVisualizer: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    const loadFeeds = async () => {
      const rssFeeds = await fetchRSSFeeds();
      setFeeds(rssFeeds);
    };
    loadFeeds();
  }, []);

  return (
    <div className="feed-visualizer">
      {feeds.map((feed, index) => (
        <FeedItem key={index} title={feed.title} link={feed.link} pubDate={feed.pubDate} />
      ))}
    </div>
  );
};

export default FeedVisualizer;