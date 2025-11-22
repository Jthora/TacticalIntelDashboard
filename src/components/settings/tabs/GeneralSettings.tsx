import '../../../assets/styles/components/general-settings.css';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { AccessLevel, useWeb3 } from '../../../contexts/Web3Context';
import { DEFAULT_MISSION_MODE } from '../../../constants/MissionMode';
import { SettingsTab, useSettings } from '../../../contexts/SettingsContext';
import { SettingsIntegrationService } from '../../../services/SettingsIntegrationService';
import DebugInfo from '../../debug/DebugInfo';
import SettingsChangeIndicator from '../SettingsChangeIndicator';

const DEFAULT_SHARE_CONFIG = {
  enabled: true,
  defaultHashtags: [] as string[],
  attribution: 'via Tactical Intel Dashboard'
};

const GeneralSettings: React.FC = memo(() => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { accessLevel, isConnected } = useWeb3();
  const [hasChanges, setHasChanges] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>((settings.general?.refreshInterval ?? 300000) / 1000);
  const [cacheEnabled, setCacheEnabled] = useState(settings.general?.cacheSettings.enabled ?? true);
  const [cacheDuration, setCacheDuration] = useState((settings.general?.cacheSettings.duration || 300000) / 1000);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.general?.notifications.enabled ?? true);
  const [notificationSound, setNotificationSound] = useState(settings.general?.notifications.sound ? 'ping' : 'silent');
  const [shareEnabled, setShareEnabled] = useState(settings.general?.share?.enabled ?? DEFAULT_SHARE_CONFIG.enabled);
  const [shareHashtags, setShareHashtags] = useState((settings.general?.share?.defaultHashtags || DEFAULT_SHARE_CONFIG.defaultHashtags).join(', '));
  const [shareAttribution, setShareAttribution] = useState(settings.general?.share?.attribution ?? DEFAULT_SHARE_CONFIG.attribution);

  const hasCommanderAccess = accessLevel >= AccessLevel.COMMANDER;
  const currentAccessLabel = (AccessLevel[accessLevel] as string) ?? 'Unknown';

  useEffect(() => {
    setRefreshInterval((settings.general?.refreshInterval ?? 300000) / 1000);
    setCacheEnabled(settings.general?.cacheSettings.enabled ?? true);
    setCacheDuration((settings.general?.cacheSettings.duration || 300000) / 1000);
    setNotificationsEnabled(settings.general?.notifications.enabled ?? true);
    setNotificationSound(settings.general?.notifications.sound ? 'ping' : 'silent');
    setShareEnabled(settings.general?.share?.enabled ?? DEFAULT_SHARE_CONFIG.enabled);
    setShareHashtags((settings.general?.share?.defaultHashtags || DEFAULT_SHARE_CONFIG.defaultHashtags).join(', '));
    setShareAttribution(settings.general?.share?.attribution ?? DEFAULT_SHARE_CONFIG.attribution);
  }, [settings.general]);

  const applyChanges = useCallback(() => {
    const parsedHashtags = shareHashtags
      .split(',')
      .map(tag => tag.replace(/^#+/, '').trim())
      .filter(Boolean);

    const shareConfig = {
      enabled: shareEnabled,
      defaultHashtags: parsedHashtags,
      attribution: shareAttribution.trim() || 'via Tactical Intel Dashboard'
    };

    updateSettings({
      general: {
        ...(settings.general || {}),
        mode: settings.general?.mode ?? DEFAULT_MISSION_MODE,
        refreshInterval: refreshInterval * 1000,
        cacheSettings: { enabled: cacheEnabled, duration: cacheDuration * 1000 },
        notifications: { enabled: notificationsEnabled, sound: notificationSound !== 'silent' },
        share: shareConfig
      }
    });
    SettingsIntegrationService.resetCache();
    setHasChanges(false);
  }, [settings.general, refreshInterval, cacheEnabled, cacheDuration, notificationsEnabled, notificationSound, shareEnabled, shareHashtags, shareAttribution, updateSettings]);

  return (
    <div className="settings-form">
      <DebugInfo componentName="GeneralSettings" />
      <h2>General Dashboard Configuration</h2>
      <SettingsChangeIndicator hasChanges={hasChanges} isApplying={false} onApply={applyChanges} onDiscard={() => resetSettings(SettingsTab.GENERAL)} />
      <div className="settings-grid">
        <div className="settings-section">
          <h3>Operational Cadence</h3>
          <div className="form-group">
            <label>Auto Refresh Interval</label>
            <select value={refreshInterval} onChange={e => { setRefreshInterval(parseInt(e.target.value,10)); setHasChanges(true); }}>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
              <option value={600}>10m</option>
              <option value={1800}>30m</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={cacheEnabled} onChange={e => { setCacheEnabled(e.target.checked); setHasChanges(true); }} /> Enable Feed Cache
            </label>
          </div>
          <div className="form-group">
            <label>Cache Duration (seconds)</label>
            <input type="number" min={30} value={cacheDuration} onChange={e => { setCacheDuration(parseInt(e.target.value,10)); setHasChanges(true); }} />
          </div>
        </div>
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={notificationsEnabled} onChange={e => { setNotificationsEnabled(e.target.checked); setHasChanges(true); }} /> Enable Notifications
            </label>
          </div>
          <div className="form-group">
            <label>Sound</label>
            <select value={notificationSound} onChange={e => { setNotificationSound(e.target.value); setHasChanges(true); }}>
              <option value="silent">Silent</option>
              <option value="ping">Ping</option>
            </select>
          </div>
        </div>
      </div>
      <div className="settings-section">
        <h3>Social Sharing Controls</h3>
        <p className="settings-helper-text">
          Enable X.com sharing only after verifying content classification. This option is restricted to Commander clearance or higher.
        </p>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={shareEnabled}
              onChange={e => {
                setShareEnabled(e.target.checked);
                setHasChanges(true);
              }}
            />
            Enable Social Sharing
          </label>
          {!hasCommanderAccess && (
            <div className="settings-warning">
              Commander clearance recommended before broadcasting intel (current level: {isConnected ? currentAccessLabel : 'Not Connected'}).
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Default Hashtags (comma separated)</label>
          <input
            type="text"
            value={shareHashtags}
            onChange={e => { setShareHashtags(e.target.value); setHasChanges(true); }}
            placeholder="intelwatch, situationreport"
            disabled={!shareEnabled}
          />
        </div>
        <div className="form-group">
          <label>Attribution Suffix</label>
          <input
            type="text"
            value={shareAttribution}
            onChange={e => { setShareAttribution(e.target.value); setHasChanges(true); }}
            disabled={!shareEnabled}
          />
          <small className="settings-helper-text">Appended to outgoing share text (e.g., "via Tactical Intel Dashboard").</small>
        </div>
        <div className="settings-warning">
          Public dissemination of sensitive intelligence may violate policy. Review classification before enabling sharing.
        </div>
      </div>
    </div>
  );
});
export default GeneralSettings;
