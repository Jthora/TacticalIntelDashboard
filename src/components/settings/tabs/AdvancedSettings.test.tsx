import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AdvancedSettings from './AdvancedSettings';
import { CORSStrategy, Settings, SettingsTab, useSettings } from '../../../contexts/SettingsContext';
import { logTelemetryEvent } from '../../../utils/TelemetryService';

jest.mock('../../../contexts/SettingsContext', () => {
  const actual = jest.requireActual('../../../contexts/SettingsContext');
  return {
    ...actual,
    useSettings: jest.fn()
  };
});

jest.mock('../../../utils/TelemetryService', () => ({
  logTelemetryEvent: jest.fn()
}));

const mockUseSettings = useSettings as jest.Mock;
const mockTelemetry = logTelemetryEvent as jest.Mock;

const makeSettings = (overrides: Partial<Settings['infrastructure']> = {}) => ({
  version: '1.0.0',
  lastTab: SettingsTab.ADVANCED,
  cors: { defaultStrategy: CORSStrategy.DIRECT, protocolStrategies: {}, services: { rss2json: [], corsProxies: [] }, fallbackChain: [] },
  protocols: { priority: [], settings: {}, autoDetect: true, fallbackEnabled: true },
  verification: { minimumTrustRating: 0, preferredMethods: [], warningThreshold: 0 },
  display: { theme: 'light', density: 'comfortable', fontSize: 14 },
  infrastructure: {
    relayEnabled: true,
    anchoringEnabled: true,
    pqcEnabled: false,
    ipfsPinningEnabled: false,
    diagnosticsEnabled: false,
    ...overrides
  }
}) as Settings;

describe('AdvancedSettings', () => {
  const originalClipboard = { ...navigator.clipboard };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (Object.keys(originalClipboard).length === 0) {
      // Restore to undefined when the environment had no clipboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (navigator as any).clipboard;
    } else {
      Object.assign(navigator, { clipboard: originalClipboard });
    }
  });

  it('emits telemetry when applying infrastructure changes', async () => {
    const updateSettings = jest.fn();
    const resetSettings = jest.fn();

    mockUseSettings.mockReturnValue({
      settings: makeSettings(),
      updateSettings,
      resetSettings
    });

    const user = userEvent.setup();
    render(<AdvancedSettings />);

    await user.click(screen.getByLabelText(/enable relay client/i));
    await user.click(await screen.findByText('Apply'));

    expect(updateSettings).toHaveBeenCalledWith({
      infrastructure: expect.objectContaining({
        relayEnabled: false,
        anchoringEnabled: true,
        pqcEnabled: false,
        ipfsPinningEnabled: false,
        diagnosticsEnabled: false
      })
    });
    expect(mockTelemetry).toHaveBeenCalledWith(
      'settings.infrastructure.updated',
      expect.objectContaining({ relayEnabled: false })
    );
  });

  it('shows warnings for risky infrastructure combinations', () => {
    mockUseSettings.mockReturnValue({
      settings: makeSettings({ relayEnabled: false, anchoringEnabled: true, ipfsPinningEnabled: false, diagnosticsEnabled: true }),
      updateSettings: jest.fn(),
      resetSettings: jest.fn()
    });

    render(<AdvancedSettings />);

    const warnings = screen.getByRole('alert');
    expect(warnings).toHaveTextContent('Relays disabled: publish/subscribe flows will be offline.');
    expect(warnings).toHaveTextContent('Anchoring enabled without IPFS pinning may lose content availability.');
    expect(warnings).toHaveTextContent('Verbose diagnostics enabled: ensure payload redaction remains enforced.');
  });

  it('prompts to copy when clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true
    });

    const promptSpy = jest.spyOn(window, 'prompt').mockImplementation(() => null);

    mockUseSettings.mockReturnValue({
      settings: makeSettings(),
      updateSettings: jest.fn(),
      resetSettings: jest.fn()
    });

    render(<AdvancedSettings />);

    fireEvent.click(screen.getByRole('button', { name: /copy summary/i }));

    expect(promptSpy).toHaveBeenCalledWith(
      'Copy summary with Ctrl/Cmd+C, then Enter',
      expect.stringContaining('"relay"')
    );
  });
});
