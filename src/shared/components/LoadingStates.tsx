import './LoadingStates.css';

import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = ''
}) => (
  <div 
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
  />
);

export const FeedItemSkeleton: React.FC = () => (
  <div className="feed-item-skeleton">
    <div className="skeleton-header">
      <Skeleton width="60%" height="24px" />
      <Skeleton width="80px" height="16px" />
    </div>
    <Skeleton width="100%" height="16px" className="skeleton-description" />
    <Skeleton width="90%" height="16px" className="skeleton-description" />
    <Skeleton width="70%" height="16px" className="skeleton-description" />
    <div className="skeleton-footer">
      <Skeleton width="120px" height="14px" />
      <Skeleton width="80px" height="14px" />
    </div>
  </div>
);

export const FeedListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="feed-list-skeleton">
    {Array.from({ length: count }).map((_, index) => (
      <FeedItemSkeleton key={index} />
    ))}
  </div>
);

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#00bfff',
  text 
}) => (
  <div className={`loading-spinner ${size}`}>
    <div className="spinner" style={{ borderTopColor: color }} />
    {text && <span className="spinner-text">{text}</span>}
  </div>
);

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  color?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  color = '#00bfff',
  showPercentage = true 
}) => (
  <div className="progress-bar-container">
    {label && <div className="progress-label">{label}</div>}
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ 
          width: `${Math.min(100, Math.max(0, progress))}%`,
          backgroundColor: color 
        }} 
      />
    </div>
    {showPercentage && (
      <div className="progress-percentage">{Math.round(progress)}%</div>
    )}
  </div>
);

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Loading...', 
  progress,
  onCancel 
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <LoadingSpinner size="large" />
        <div className="loading-message">{message}</div>
        {typeof progress === 'number' && (
          <ProgressBar progress={progress} showPercentage />
        )}
        {onCancel && (
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

interface PulsePlaceholderProps {
  children: React.ReactNode;
  isLoading: boolean;
  fallback?: React.ReactNode;
}

export const PulsePlaceholder: React.FC<PulsePlaceholderProps> = ({ 
  children, 
  isLoading, 
  fallback 
}) => {
  if (isLoading) {
    return <div className="pulse-placeholder">{fallback || <Skeleton />}</div>;
  }
  return <>{children}</>;
};

export const FeedVisualizerSkeleton: React.FC = () => (
  <div className="feed-visualizer-skeleton">
    {/* Header skeleton */}
    <div className="feed-controls-skeleton">
      <div className="status-bar-skeleton">
        <Skeleton width="120px" height="20px" />
        <Skeleton width="140px" height="16px" />
        <Skeleton width="160px" height="16px" />
      </div>
      <div className="control-buttons-skeleton">
        <Skeleton width="80px" height="32px" borderRadius="6px" />
        <Skeleton width="100px" height="32px" borderRadius="6px" />
      </div>
    </div>
    
    {/* Search and filter skeleton */}
    <div className="search-filter-skeleton">
      <div className="filter-header-skeleton">
        <Skeleton width="150px" height="24px" />
        <Skeleton width="60px" height="20px" />
      </div>
      <div className="search-section-skeleton">
        <Skeleton width="100%" height="40px" borderRadius="6px" />
      </div>
      <div className="filter-controls-skeleton">
        <Skeleton width="120px" height="36px" borderRadius="6px" />
        <Skeleton width="120px" height="36px" borderRadius="6px" />
        <Skeleton width="120px" height="36px" borderRadius="6px" />
      </div>
      <div className="filter-results-skeleton">
        <Skeleton width="100px" height="16px" />
        <Skeleton width="80px" height="16px" />
      </div>
    </div>
    
    {/* Feed items skeleton */}
    <FeedListSkeleton count={6} />
  </div>
);

interface ErrorOverlayProps {
  title: string;
  message: string;
  onRetry?: () => void;
  suggestions?: string[];
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ 
  title, 
  message, 
  onRetry, 
  suggestions = [] 
}) => (
  <div className="error-overlay">
    <div className="error-content">
      <h3 className="error-title">{title}</h3>
      <p className="error-message">{message}</p>
      
      {suggestions.length > 0 && (
        <div className="error-suggestions">
          <h4>💡 Suggestions:</h4>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      {onRetry && (
        <button onClick={onRetry} className="error-retry-btn">
          🔄 Try Again
        </button>
      )}
    </div>
  </div>
);

export default {
  Skeleton,
  FeedItemSkeleton,
  FeedListSkeleton,
  LoadingSpinner,
  ProgressBar,
  LoadingOverlay,
  PulsePlaceholder,
  FeedVisualizerSkeleton,
  ErrorOverlay
};
