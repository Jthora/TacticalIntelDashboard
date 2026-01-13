import { useMemo } from 'react';

import { useFilters } from '../contexts/FilterContext';
import { useFeedData } from '../contexts/FeedDataContext';
import { useMissionMode } from '../contexts/MissionModeContext';
import useAlerts from './alerts/useAlerts';
import { mapFeedToIntel } from '../intel/export/FeedIntelAdapter';
import { Feed } from '../models/Feed';
import { IntelExportRecord } from '../intel/export/IntelExportTypes';
import { FeedFetchDiagnostic } from '../types/FeedTypes';

export interface IntelLLMPayloadOptions {
  maxFeeds?: number;
  maxAlerts?: number;
  includeRawFeeds?: boolean;
  diagnostics?: FeedFetchDiagnostic[];
  selectedFeedList?: string | null;
}

export interface IntelLLMPayload {
  mission: {
    mode: string;
    profileLabel: string;
    selectedFeedList?: string | null;
  };
  filters: {
    activeFilters: string[];
    timeRange: {
      start: string;
      end: string;
      label: string;
    } | null;
    searchQuery: string;
    sortBy: {
      field: string;
      direction: string;
    };
  };
  feeds: {
    intel: IntelExportRecord[];
    count: number;
    total: number;
    raw?: Feed[];
  };
  diagnostics: {
    summary: {
      success: number;
      empty: number;
      failed: number;
    };
    entries: FeedFetchDiagnostic[];
  };
  alerts: {
    triggers: any[];
    count: number;
  };
  timestamps: {
    lastUpdated?: string | null;
    generatedAt: string;
  };
  limits: {
    maxFeeds?: number;
    maxAlerts?: number;
  };
}

export const useIntelLLMPayload = (options: IntelLLMPayloadOptions = {}): IntelLLMPayload => {
  const { filteredFeeds, feeds, lastUpdated } = useFeedData();
  const { filterState } = useFilters();
  const { mode, profile } = useMissionMode();
  const { alertHistory } = useAlerts();

  const maxFeeds = options.maxFeeds ?? 50;
  const maxAlerts = options.maxAlerts ?? 10;
  const diagnostics = options.diagnostics ?? [];
  const selectedFeedList = options.selectedFeedList ?? null;

  const feedsForPayload = filteredFeeds.length > 0 ? filteredFeeds : feeds;

  const limitedFeeds = useMemo(
    () => feedsForPayload.slice(0, maxFeeds),
    [feedsForPayload, maxFeeds]
  );

  const intelRecords = useMemo(() => limitedFeeds.map(mapFeedToIntel), [limitedFeeds]);

  const limitedAlerts = useMemo(
    () => alertHistory.slice(0, maxAlerts),
    [alertHistory, maxAlerts]
  );

  const diagnosticsSummary = useMemo(() => {
    return diagnostics.reduce(
      (acc, diagnostic) => {
        acc[diagnostic.status] += 1;
        return acc;
      },
      { success: 0, empty: 0, failed: 0 }
    );
  }, [diagnostics]);

  return {
    mission: {
      mode,
      profileLabel: profile.label,
      selectedFeedList
    },
    filters: {
      activeFilters: Array.from(filterState.activeFilters),
      timeRange: filterState.timeRange
        ? {
            start: filterState.timeRange.start.toISOString(),
            end: filterState.timeRange.end.toISOString(),
            label: filterState.timeRange.label
          }
        : null,
      searchQuery: filterState.searchQuery,
      sortBy: filterState.sortBy
    },
    feeds: {
      intel: intelRecords,
      count: intelRecords.length,
      total: feedsForPayload.length,
      ...(options.includeRawFeeds ? { raw: limitedFeeds } : {})
    },
    diagnostics: {
      summary: diagnosticsSummary,
      entries: diagnostics
    },
    alerts: {
      triggers: limitedAlerts,
      count: limitedAlerts.length
    },
    timestamps: {
      lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
      generatedAt: new Date().toISOString()
    },
    limits: {
      maxFeeds,
      maxAlerts
    }
  };
};

export default useIntelLLMPayload;
