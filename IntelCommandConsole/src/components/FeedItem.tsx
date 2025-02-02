import React from 'react';
import { Feed } from '../models/Feed';

interface FeedItemProps {
  feed: Feed;
}

const FeedItem: React.FC<FeedItemProps> = ({ feed }) => (
  <div className="feed-item">
    <h3><a href={feed.link} target="_blank" rel="noopener noreferrer">{feed.title}</a></h3>
    <p>{feed.pubDate}</p>
    {feed.description && <p>{feed.description}</p>}
  </div>
);

export default FeedItem;