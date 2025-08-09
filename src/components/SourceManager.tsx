import './SourceManager.css';

import React, { useState } from 'react';

import { EarthAllianceCategory, SourceProtocol } from '../constants/EarthAllianceSources';
import FeedService from '../services/FeedService';

interface SourceManagerProps {
  onClose: () => void;
  onSourceAdded: () => void;
}

const SourceManager: React.FC<SourceManagerProps> = ({ onClose, onSourceAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    endpoint: '',
    category: EarthAllianceCategory.INDEPENDENT_INVESTIGATIVE_JOURNALISM,
    protocol: SourceProtocol.RSS,
    trustRating: 75,
    accessMethod: 'direct',
    verificationMethod: 'source-documentation',
    format: 'news'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFeedList = {
      id: `custom-${Date.now()}`,
      name: formData.name
    };

    const newFeed = {
      id: `feed-${Date.now()}`,
      name: formData.name,
      url: formData.endpoint,
      title: formData.name,
      link: formData.url,
      pubDate: new Date().toISOString(),
      description: `Earth Alliance aligned source: ${formData.category}`,
      content: `Trust rating: ${formData.trustRating}%`,
      feedListId: newFeedList.id,
      // Additional Earth Alliance properties
      categories: [formData.category],
      tags: [formData.format, `trust-${formData.trustRating}`, formData.protocol]
    };

    // Add to FeedService
    FeedService.addFeedList(newFeedList);
    FeedService.addFeedToList(newFeedList.id, newFeed);

    onSourceAdded();
    onClose();
  };

  return (
    <div className="source-manager-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New Intel Source</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="source-form">
          <div className="form-group">
            <label>Source Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter source name"
              required
            />
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Feed Endpoint</label>
            <input
              type="url"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              placeholder="https://example.com/feed"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EarthAllianceCategory })}
              >
                {Object.values(EarthAllianceCategory).map(category => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Protocol</label>
              <select
                value={formData.protocol}
                onChange={(e) => setFormData({ ...formData, protocol: e.target.value as SourceProtocol })}
              >
                {Object.values(SourceProtocol).map(protocol => (
                  <option key={protocol} value={protocol}>
                    {protocol.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Trust Rating (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.trustRating}
                onChange={(e) => setFormData({ ...formData, trustRating: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Access Method</label>
              <select
                value={formData.accessMethod}
                onChange={(e) => setFormData({ ...formData, accessMethod: e.target.value })}
              >
                <option value="direct">Direct</option>
                <option value="account-required">Account Required</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Add Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SourceManager;
