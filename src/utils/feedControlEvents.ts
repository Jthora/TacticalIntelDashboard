export const FEED_MANUAL_REFRESH_EVENT = 'feed-control:manual-refresh';
export const FEED_AUTO_REFRESH_CHANGE_EVENT = 'feed-control:auto-refresh-change';

export interface FeedRefreshEventDetail {
  reason?: string;
  showLoading?: boolean;
}

export interface FeedAutoRefreshChangeDetail {
  autoRefresh: boolean;
  source?: string;
}

const safeDispatch = <T>(eventName: string, detail: T) => {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
};

export const emitFeedManualRefresh = (detail: FeedRefreshEventDetail = {}) => {
  safeDispatch(FEED_MANUAL_REFRESH_EVENT, detail);
};

export const emitFeedAutoRefreshChange = (autoRefresh: boolean, source?: string) => {
  safeDispatch(FEED_AUTO_REFRESH_CHANGE_EVENT, { autoRefresh, source });
};
