import '../../../assets/styles/components/general-settings.css';
import React, { useMemo, useState } from 'react';

import { SettingsTab, useSettings } from '../../../contexts/SettingsContext';
import { loadConfigMatrix } from '../../../config/configMatrix';
import { logTelemetryEvent } from '../../../utils/TelemetryService';
import SettingsChangeIndicator from '../SettingsChangeIndicator';

const AdvancedSettings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const infra = settings.infrastructure;

  const [relayEnabled, setRelayEnabled] = useState(infra.relayEnabled);
  const [anchoringEnabled, setAnchoringEnabled] = useState(infra.anchoringEnabled);
  const [pqcEnabled, setPqcEnabled] = useState(infra.pqcEnabled);
  const [ipfsPinningEnabled, setIpfsPinningEnabled] = useState(infra.ipfsPinningEnabled);
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(infra.diagnosticsEnabled);
  const [hasChanges, setHasChanges] = useState(false);

  const warnings = useMemo(() => {
    const items: string[] = [];
    if (!relayEnabled) items.push('Relays disabled: publish/subscribe flows will be offline.');
    if (!anchoringEnabled) items.push('Anchoring disabled: provenance anchor status will stay mock/disabled.');
    if (diagnosticsEnabled) items.push('Verbose diagnostics enabled: ensure payload redaction remains enforced.');
    if (anchoringEnabled && !ipfsPinningEnabled) items.push('Anchoring enabled without IPFS pinning may lose content availability.');
    return items;
  }, [relayEnabled, anchoringEnabled, ipfsPinningEnabled, diagnosticsEnabled]);

  const configSummary = useMemo(() => {
    return loadConfigMatrix(process.env, {
      relay: { enabled: relayEnabled, primary: 'https://relay.local', fallbacks: [] },
      anchoring: { ...loadConfigMatrix().anchoring, enabled: anchoringEnabled },
      pqc: { enabled: pqcEnabled, preferredScheme: 'falcon' },
      ipfs: { gatewayPrimary: 'https://ipfs.io/ipfs/', gatewayFallback: 'https://cloudflare-ipfs.com/ipfs/', pinningEnabled: ipfsPinningEnabled },
      logging: { level: 'info', verboseEvents: diagnosticsEnabled }
    });
  }, [relayEnabled, anchoringEnabled, pqcEnabled, ipfsPinningEnabled, diagnosticsEnabled]);

  const apply = () => {
    updateSettings({
      infrastructure: {
        relayEnabled,
        anchoringEnabled,
        pqcEnabled,
        ipfsPinningEnabled,
        diagnosticsEnabled
      }
    });
    logTelemetryEvent('settings.infrastructure.updated', {
      relayEnabled,
      anchoringEnabled,
      pqcEnabled,
      ipfsPinningEnabled,
      diagnosticsEnabled
    });
    setHasChanges(false);
  };

  const copySummary = () => {
    const payload = JSON.stringify(configSummary, null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(payload).catch(() => {
        window.prompt('Copy summary with Ctrl/Cmd+C, then Enter', payload);
      });
    } else {
      window.prompt('Copy summary with Ctrl/Cmd+C, then Enter', payload);
    }
  };

  return (
    <div className="settings-form">
      <h2>Infrastructure & Trust Toggles</h2>
      <SettingsChangeIndicator hasChanges={hasChanges} isApplying={false} onApply={apply} onDiscard={() => resetSettings(SettingsTab.ADVANCED)} />

      <div className="settings-grid">
        <div className="settings-section">
          <h3>Relays & Anchoring</h3>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={relayEnabled} onChange={e => { setRelayEnabled(e.target.checked); setHasChanges(true); }} /> Enable Relay Client
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={anchoringEnabled} onChange={e => { setAnchoringEnabled(e.target.checked); setHasChanges(true); }} /> Enable Anchoring (mock by default)
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Crypto & Storage</h3>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={pqcEnabled} onChange={e => { setPqcEnabled(e.target.checked); setHasChanges(true); }} /> Enable PQC signer (stub)
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={ipfsPinningEnabled} onChange={e => { setIpfsPinningEnabled(e.target.checked); setHasChanges(true); }} /> Enable IPFS pinning
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Diagnostics</h3>
          <p className="settings-helper-text">Toggle verbose event logging for relay/anchor/sign flows (redacted payloads only).</p>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={diagnosticsEnabled} onChange={e => { setDiagnosticsEnabled(e.target.checked); setHasChanges(true); }} /> Enable verbose diagnostics
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Config Summary</h3>
        <pre className="settings-summary" aria-label="config-summary">{JSON.stringify(configSummary, null, 2)}</pre>
        {warnings.length > 0 && (
          <div className="settings-warning" role="alert">
            <strong>Warnings:</strong>
            <ul>
              {warnings.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="settings-actions">
          <button className="btn-secondary" onClick={copySummary}>Copy Summary</button>
          <button className="btn-secondary" onClick={() => resetSettings(SettingsTab.ADVANCED)}>Reset Advanced</button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;
