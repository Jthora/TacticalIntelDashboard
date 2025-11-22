import React from 'react';

interface SourceStatusSnapshot {
  success: number;
  empty: number;
  failed: number;
}

interface IntelFeedInfoBarProps {
  feedCount: number;
  totalFeeds: number;
  lastUpdated?: Date | null;
  isMonitoring: boolean;
  recentAlertTriggers?: number;
  activeAlerts?: number;
  sourceStatus?: SourceStatusSnapshot | null;
}

const IntelFeedInfoBar: React.FC<IntelFeedInfoBarProps> = ({
  feedCount,
  totalFeeds,
  lastUpdated,
  isMonitoring,
  recentAlertTriggers = 0,
  activeAlerts = 0,
  sourceStatus
}) => {
  const timestampText = lastUpdated ? lastUpdated.toLocaleTimeString() : 'Awaiting update';
  const queueMeta = sourceStatus
    ? `OK: ${sourceStatus.success} • EMPTY: ${sourceStatus.empty} • FAIL: ${sourceStatus.failed}`
    : 'Diagnostics syncing';

  return (
    <div className="intel-feed-info-bar" role="status" aria-label="Intel feed telemetry">
      <TelemetryPill icon="📡" label="Feeds Loaded" value={`${feedCount}/${Math.max(totalFeeds, feedCount)}`} />

      <TelemetryPill icon="🕐" label="Updated" value={timestampText} variant="secondary" />

      <TelemetryPill
        icon={isMonitoring ? '🚨' : '⚪'}
        label="Alert Monitor"
        value={isMonitoring ? 'ON' : 'OFF'}
        variant={isMonitoring ? 'accent' : 'muted'}
      />

      {recentAlertTriggers > 0 && (
        <TelemetryPill
          icon="🔥"
          label="New Alerts"
          value={`${recentAlertTriggers}`}
          variant="warning"
        />
      )}

      {activeAlerts > 0 && (
        <TelemetryPill
          icon="📋"
          label="Active Alerts"
          value={`${activeAlerts}`}
          variant="secondary"
        />
      )}

      {sourceStatus && (
        <TelemetryPill
          icon="🛰️"
          label="Sources"
          value={queueMeta}
          variant="secondary"
        />
      )}

      {!sourceStatus && (
        <TelemetryPill icon="🛰️" label="Sources" value={queueMeta} variant="muted" />
      )}
    </div>
  );
};

interface TelemetryPillProps {
  icon: string;
  label: string;
  value: string;
  variant?: 'default' | 'accent' | 'muted' | 'secondary' | 'warning';
}

const TelemetryPill: React.FC<TelemetryPillProps> = ({ icon, label, value, variant = 'default' }) => {
  return (
    <div className={`intel-feed-info-pill intel-feed-info-pill--${variant}`}>
      <span className="intel-feed-info-pill__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="intel-feed-info-pill__body">
        <span className="intel-feed-info-pill__label">{label}</span>
        <span className="intel-feed-info-pill__value" title={value}>
          {value}
        </span>
      </div>
    </div>
  );
};

export default IntelFeedInfoBar;
