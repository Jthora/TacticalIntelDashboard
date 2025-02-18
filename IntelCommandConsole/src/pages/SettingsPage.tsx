import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeedService from '../services/FeedService';
import { FeedItem, FeedList } from '../types/FeedTypes';
import { LocalStorageUtil } from '../utils/LocalStorageUtil';
import { convertFeedItemToFeed, convertFeedsToFeedItems } from '../utils/feedConversion';

const SettingsPage: React.FC = () => {
  const [feedLists, setFeedLists] = useState<FeedList[]>([]);
  const [selectedFeedList, setSelectedFeedList] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [newFeed, setNewFeed] = useState<Partial<FeedItem>>({});
  const [newFeedList, setNewFeedList] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedLists = async () => {
      try {
        const lists = FeedService.getFeedLists();
        setFeedLists(lists);
      } catch (err) {
        console.error(err);
        setError('Failed to load feed lists');
      } finally {
        setLoading(false);
      }
    };
    loadFeedLists();
  }, []);

  useEffect(() => {
    if (selectedFeedList) {
      const loadFeeds = async () => {
        try {
          const rssFeeds = FeedService.getFeedsByList(selectedFeedList);
          const convertedFeeds = convertFeedsToFeedItems(rssFeeds);
          setFeeds(convertedFeeds);
        } catch (err) {
          console.error(err);
          setError('Failed to load feeds');
        }
      };
      loadFeeds();
    }
  }, [selectedFeedList]);

  const handleAddFeed = () => {
    if (!newFeed.title || !newFeed.link) {
      alert('Please provide both a title and a link for the feed.');
      return;
    }

    if (!selectedFeedList) {
      alert('Please select a feed list.');
      return;
    }

    const feed: FeedItem = {
      id: (feeds.length + 1).toString(),
      title: newFeed.title,
      link: newFeed.link,
      pubDate: new Date().toISOString(),
      description: newFeed.description || '',
      content: newFeed.content || '',
      feedListId: selectedFeedList, // Assigning feedListId from selectedFeedList
    };

    const feedToAdd = convertFeedItemToFeed(feed);
    FeedService.addFeedToList(selectedFeedList, feedToAdd);
    setFeeds([...feeds, feed]);
    setNewFeed({ title: '', link: '', description: '', content: '' });
  };

  const handleRemoveFeed = (feedId: string) => {
    if (selectedFeedList) {
      FeedService.removeFeedFromList(selectedFeedList, feedId);
      setFeeds(feeds.filter(feed => feed.id !== feedId));
    }
  };

  const handleAddFeedList = () => {
    if (newFeedList) {
      const feedList: FeedList = {
        id: (feedLists.length + 1).toString(),
        name: newFeedList,
      };
      FeedService.addFeedList(feedList);
      setFeedLists([...feedLists, feedList]);
      setNewFeedList('');
    }
  };

  const handleRemoveFeedList = (feedListId: string) => {
    FeedService.removeFeedList(feedListId);
    setFeedLists(feedLists.filter(list => list.id !== feedListId));
    if (selectedFeedList === feedListId) {
      setSelectedFeedList(null);
      setFeeds([]);
    }
  };

  const handleResetToDefault = () => {
    FeedService.resetToDefault();
    setFeedLists(FeedService.getFeedLists());
    setFeeds([]);
    setSelectedFeedList(null);
  };

  const handleClearLocalStorage = () => {
    LocalStorageUtil.clear();
    setFeedLists([]);
    setFeeds([]);
    setSelectedFeedList(null);
    console.log('Local storage cleared');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="settings-page">
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <div className="settings-content">
        <div className="sidebar">
          <h2>Manage Feed Lists</h2>
          <div className="add-feed-list-form">
            <input
              type="text"
              placeholder="Feed List Name"
              value={newFeedList}
              onChange={(e) => setNewFeedList(e.target.value)}
            />
            <button onClick={handleAddFeedList}>Add Feed List</button>
            <button onClick={handleResetToDefault}>Reset to Default</button>
            <button onClick={handleClearLocalStorage}>Clear Local Storage</button>
          </div>
          <div className="feed-list">
            {feedLists.map((list) => (
              <div key={list.id} className="feed-list-item">
                <h3 onClick={() => setSelectedFeedList(list.id)}>{list.name}</h3>
                <button onClick={() => handleRemoveFeedList(list.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
        <div className="feed-details">
          {selectedFeedList && (
            <>
              <h2>Manage Feeds in {feedLists.find(list => list.id === selectedFeedList)?.name}</h2>
              <div className="add-feed-form">
                <input
                  type="text"
                  placeholder="Feed Title"
                  value={newFeed.title || ''}
                  onChange={(e) => setNewFeed({ ...newFeed, title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Feed Link"
                  value={newFeed.link || ''}
                  onChange={(e) => setNewFeed({ ...newFeed, link: e.target.value })}
                />
                <button onClick={handleAddFeed}>Add Feed</button>
              </div>
              <div className="feed-list">
                {feeds.map((feed) => (
                  <div key={feed.id} className="feed-item">
                    <h3>{feed.title}</h3>
                    <p>{feed.description}</p>
                    <button onClick={() => handleRemoveFeed(feed.id)}>Remove</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;