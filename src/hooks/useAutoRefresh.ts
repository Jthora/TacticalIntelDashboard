import { useEffect } from 'react';

import { SettingsIntegrationService } from '../services/SettingsIntegrationService';
import { log } from '../utils/LoggerService';

interface UseAutoRefreshParams {
  autoRefresh: boolean;
  selectedFeedList: string | null;
  loadFeeds: (showLoading?: boolean, reason?: string) => void | Promise<void>;
}

interface GeneralSettingsLike {
  refreshInterval: number;
  [key: string]: unknown;
}

type GetGeneralSettingsFn = () => GeneralSettingsLike | undefined;

type LogDebugFn = (category: string, message: string, data?: unknown) => void;

type IntervalHandle = ReturnType<typeof setInterval>;

type SetIntervalFn = (
  ...args: Parameters<typeof setInterval>
) => IntervalHandle;

type ClearIntervalFn = (handle: IntervalHandle) => void;

interface UseAutoRefreshDependencies {
  getGeneralSettings?: GetGeneralSettingsFn;
  logDebug?: LogDebugFn;
  setIntervalFn?: SetIntervalFn;
  clearIntervalFn?: ClearIntervalFn;
}

const DEFAULT_REFRESH_INTERVAL_SECONDS = 300;

export const useAutoRefresh = (
  { autoRefresh, selectedFeedList, loadFeeds }: UseAutoRefreshParams,
  dependencies: UseAutoRefreshDependencies = {}
) => {
  const {
    getGeneralSettings = SettingsIntegrationService.getGeneralSettings,
    logDebug = log.debug,
    setIntervalFn = setInterval,
    clearIntervalFn = clearInterval
  } = dependencies;

  useEffect(() => {
    if (!autoRefresh || !selectedFeedList) {
      logDebug?.('Component', 'Auto-refresh disabled or no feed list selected; skipping interval setup', {
        autoRefresh,
        selectedFeedList
      });
      return;
    }

    let refreshIntervalSeconds = DEFAULT_REFRESH_INTERVAL_SECONDS;

    try {
      const settings = getGeneralSettings?.();
      if (settings && Number.isFinite(Number(settings.refreshInterval))) {
        refreshIntervalSeconds = Math.max(Number(settings.refreshInterval), 1);
      }
    } catch (error) {
      logDebug?.(
        'Component',
        'Failed to load general settings for auto-refresh. Falling back to default interval.',
        error instanceof Error ? { message: error.message } : { error }
      );
    }

    const refreshIntervalMs = refreshIntervalSeconds * 1000;

    logDebug?.('Component', 'Configuring auto-refresh interval', {
      selectedFeedList,
      refreshIntervalSeconds,
      refreshIntervalMs
    });

    const intervalId = setIntervalFn(() => {
      logDebug?.(
        'Component',
        `Auto-refreshing feeds every ${refreshIntervalSeconds} seconds...`
      );
      loadFeeds(false, 'auto-refresh');
    }, refreshIntervalMs);

    return () => {
      clearIntervalFn(intervalId);
      logDebug?.('Component', 'Auto-refresh interval cleared', { selectedFeedList });
    };
  }, [
    autoRefresh,
    selectedFeedList,
    loadFeeds,
    getGeneralSettings,
    logDebug,
    setIntervalFn,
    clearIntervalFn
  ]);
};
