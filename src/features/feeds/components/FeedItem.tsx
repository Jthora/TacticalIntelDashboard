import React, { useEffect, useRef, useState } from 'react';

// Removed unused FeedHealthIndicator import
import ProvenanceBadges from '../../../components/verification/ProvenanceBadges';
import ProvenanceDetailPanel from '../../../components/verification/ProvenanceDetailPanel';
import { useSettings } from '../../../contexts/SettingsContext';
import { Feed } from '../../../models/Feed';
import useSocialShare from '../../../hooks/useSocialShare';
import { withProvenanceDefaults } from '../../../utils/provenanceDefaults';
import { log } from '../../../utils/LoggerService';

interface FeedItemProps { feed: Feed; }

const FeedItem: React.FC<FeedItemProps> = ({ feed }) => {
  const { settings } = useSettings();
  const shareSettings = settings.general?.share;
  const sharingEnabled = !!shareSettings?.enabled;
  const [expanded, setExpanded] = useState(false);
  const [showProvenanceDetails, setShowProvenanceDetails] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'error'>('idle');
  const [shareFeedback, setShareFeedback] = useState('');
  const feedbackTimeoutRef = useRef<number | null>(null);

  const { share } = useSocialShare({
    defaultHashtags: shareSettings?.defaultHashtags
  });

  useEffect(() => () => {
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!sharingEnabled) {
      setShareState('idle');
      setShareFeedback('');
    }
  }, [sharingEnabled]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleExpanded = () => setExpanded(!expanded);
  const toggleProvenance = () => setShowProvenanceDetails(prev => !prev);

  const getSourceFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0].toUpperCase();
    } catch {
      return 'UNKNOWN';
    }
  };

  const renderPriorityBadge = () => {
    if (!feed.priority) return null;
    const level = feed.priority.toLowerCase(); // e.g. HIGH -> high
    return (
      <span className={`feed-badge priority-${level}`} data-testid="feed-priority-badge">
        {feed.priority}
      </span>
    );
  };

  const renderContentTypeBadge = () => {
    if (!feed.contentType) return null;
    return (
      <span className={`feed-badge type-${feed.contentType.toLowerCase()}`} data-testid="feed-type-badge">
        {feed.contentType}
      </span>
    );
  };

  const provenance = withProvenanceDefaults(feed.provenance || { anchorStatus: 'not-requested', relayIds: [] });

  const renderTags = () => {
    if (!feed.tags || feed.tags.length === 0) return null;
    const visible = feed.tags.slice(0, 4);
    const extra = feed.tags.length - visible.length;
    return (
      <div className="feed-tags">
        {visible.map((tag, i) => (
          <span key={i} className="feed-tag" data-testid="feed-tag">{tag}</span>
        ))}
        {extra > 0 && <span className="feed-tag more" data-testid="feed-tag-more">+{extra} more</span>}
      </div>
    );
  };

  const sanitizeSummary = () => {
    const source = feed.description || feed.content;
    if (!source) return undefined;
    const text = source
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text || undefined;
  };

  const scheduleFeedbackReset = () => {
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setShareFeedback('');
      setShareState('idle');
    }, 2500);
  };

  const handleShare = async () => {
    if (!feed.link || shareState === 'sharing' || !sharingEnabled) return;

    setShareState('sharing');
    setShareFeedback('');
    log.info('SocialShare', 'Initiating share from feed item', {
      feedId: feed.id,
      link: feed.link
    });

    try {
      const rawSummary = sanitizeSummary();
      const summaryWithAttribution = shareSettings?.attribution
        ? [rawSummary, shareSettings.attribution].filter(Boolean).join(' ')
        : rawSummary;

      const result = await share({
        url: feed.link,
        title: feed.title,
        summary: summaryWithAttribution,
        hashtags: feed.tags
      });

      log.info('SocialShare', 'Share workflow completed', {
        feedId: feed.id,
        method: result?.method || 'intent'
      });
      setShareFeedback('Share opened in new window');
      setShareState('idle');
      scheduleFeedbackReset();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      log.error('SocialShare', 'Share workflow failed', {
        feedId: feed.id,
        link: feed.link
      }, err);
      setShareState('error');
      setShareFeedback('Unable to share');
      scheduleFeedbackReset();
    }
  };

  return (
    <div className={`feed-item ${expanded ? 'expanded' : ''}`} data-testid="feed-item">
      <div className="feed-item-header">
        <div className="feed-header-left">
          <div className="feed-source-badge" data-testid="feed-source">{getSourceFromUrl(feed.link)}</div>
          {renderPriorityBadge()}
          {renderContentTypeBadge()}
        </div>
        <div className="feed-header-right">
          <div className="feed-timestamp" data-testid="feed-timestamp">{formatDate(feed.pubDate)}</div>
        </div>
      </div>

      <div className="feed-provenance-row">
        <ProvenanceBadges provenance={provenance} compact />
        <button
          className="btn feed-btn"
          data-testid="feed-prov-toggle"
          onClick={toggleProvenance}
        >
          {showProvenanceDetails ? 'Hide details' : 'Provenance details'}
        </button>
      </div>

      {showProvenanceDetails && (
        <div className="feed-provenance-detail" data-testid="feed-prov-detail">
          <ProvenanceDetailPanel provenance={provenance} />
        </div>
      )}

      <h3 className="feed-title" data-testid="feed-item-title">
        <a href={feed.link} target="_blank" rel="noopener noreferrer" className="feed-link">
          {feed.title}
        </a>
      </h3>

      {feed.description && (
        <div className="feed-description" data-testid="feed-description">
          <p>{expanded ? feed.description : truncateText(feed.description)}</p>
          {feed.description.length > 150 && (
            <button onClick={toggleExpanded} className="btn feed-btn" data-testid="feed-expand-btn">
              {expanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      )}

      <div className="feed-bottom-row">
        <div className="feed-actions">
          <button onClick={() => window.open(feed.link, '_blank')} className="btn feed-btn feed-btn-primary" data-testid="feed-open-btn">Open</button>
          <button onClick={() => navigator.clipboard?.writeText(feed.link)} className="btn feed-btn" data-testid="feed-copy-btn">Copy</button>
          <button onClick={() => { log.debug('Component', 'Bookmark:', feed.title); }} className="btn feed-btn" data-testid="feed-bookmark-btn">Bookmark</button>
          {sharingEnabled && (
            <button
              onClick={handleShare}
              className="btn feed-btn"
              data-testid="feed-share-btn"
              disabled={!feed.link || shareState === 'sharing'}
            >
              {shareState === 'sharing' ? 'Sharing…' : 'Share'}
            </button>
          )}
          {shareFeedback && (
            <span className="feed-share-feedback" role="status" aria-live="polite">
              {shareFeedback}
            </span>
          )}
        </div>
        {renderTags()}
      </div>
    </div>
  );
};

export default FeedItem;
