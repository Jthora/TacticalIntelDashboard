import React, { useEffect, useMemo, useState } from 'react';

import { useStatusMessages } from '../contexts/StatusMessageContext';

const levelIconMap = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '⛔'
} as const;

const priorityRank = { high: 3, medium: 2, low: 1 } as const;

const BottomStatusBar: React.FC = () => {
  const { messages, dismissMessage } = useStatusMessages();

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => priorityRank[b.priority] - priorityRank[a.priority] || b.timestamp - a.timestamp
    );
  }, [messages]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [sortedMessages.length]);

  const activeMessage = sortedMessages[activeIndex] ?? null;

  const handlePrev = () => {
    if (sortedMessages.length === 0) {
      return;
    }
    setActiveIndex(prev => (prev - 1 + sortedMessages.length) % sortedMessages.length);
  };

  const handleNext = () => {
    if (sortedMessages.length === 0) {
      return;
    }
    setActiveIndex(prev => (prev + 1) % sortedMessages.length);
  };

  const queueCount = Math.max(sortedMessages.length - 1, 0);
  const navDisabled = sortedMessages.length <= 1;
  const isIdle = !activeMessage;

  const fallbackMessage = {
    id: 'status-idle',
    level: 'info' as const,
    message: 'Channel clear. Awaiting mission telemetry.',
    timestamp: Date.now(),
    source: undefined
  };

  const displayMessage = activeMessage ?? fallbackMessage;
  const { id, level, message, timestamp, source } = displayMessage;

  const metaParts: string[] = [];

  if (!isIdle) {
    metaParts.push(new Date(timestamp).toLocaleTimeString());
  } else {
    metaParts.push('Standby');
  }

  if (source) {
    metaParts.push(source);
  }

  if (!isIdle && queueCount > 0) {
    metaParts.push(`+${queueCount} queued`);
  }

  const metaText = metaParts.length > 0 ? metaParts.join(' • ') : null;

  return (
    <div className={`bottom-status-bar level-${level}`} role="status" aria-live="polite">
      <div className="status-accent" aria-hidden="true" />
      <div className="status-core">
        <StatusTicker
          level={level}
          message={message}
          meta={metaText}
          isIdle={isIdle}
        />

        <div className="status-controls">
          <span
            className={`status-queue-chip ${queueCount > 0 ? 'has-queue' : ''}`}
            title={queueCount > 0 ? `${queueCount} additional message(s)` : 'Queue clear'}
          >
            {queueCount > 0 ? `+${queueCount}` : 'Q·0'}
          </span>

          <div className="status-nav" aria-label="Status message navigation">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous status message"
              className={navDisabled ? 'nav-disabled' : ''}
            >
              ◂
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next status message"
              className={navDisabled ? 'nav-disabled' : ''}
            >
              ▸
            </button>
          </div>

          <button
            type="button"
            className="status-dismiss"
            onClick={() => {
              if (!isIdle) {
                dismissMessage(id);
              }
            }}
            aria-label="Dismiss status message"
            disabled={isIdle}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

type StatusTickerProps = {
  level: keyof typeof levelIconMap;
  message: string;
  meta: string | null;
  isIdle: boolean;
};

const StatusTicker: React.FC<StatusTickerProps> = ({ level, message, meta, isIdle }) => {
  return (
    <div className={`status-ticker ${isIdle ? 'status-ticker--idle' : ''}`}>
      <div className="ticker-pulse" aria-hidden="true">
        <span className="status-pulse" />
      </div>
      <div className="ticker-icon" aria-hidden="true">{levelIconMap[level]}</div>
      <div className="ticker-window">
        <span className="ticker-message" title={message}>
          {message}
        </span>
        {meta && (
          <span className="ticker-meta" title={meta}>
            {meta}
          </span>
        )}
      </div>
    </div>
  );
};

export default BottomStatusBar;
