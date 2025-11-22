import React, { useMemo, useState } from 'react';

import type { FeedFetchDiagnostic } from '../types/FeedTypes';

interface FeedDiagnosticsPanelProps {
  diagnostics: FeedFetchDiagnostic[];
  lastUpdated: Date | null;
}

type StatusKey = FeedFetchDiagnostic['status'];

const statusOrder: StatusKey[] = ['failed', 'empty', 'success'];

const FeedDiagnosticsPanel: React.FC<FeedDiagnosticsPanelProps> = ({ diagnostics, lastUpdated }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const summary = useMemo(() => {
    if (!diagnostics || diagnostics.length === 0) {
      return { success: 0, failed: 0, empty: 0 };
    }

    return diagnostics.reduce(
      (acc, diagnostic) => {
        acc[diagnostic.status] += 1;
        return acc;
      },
      { success: 0, failed: 0, empty: 0 }
    );
  }, [diagnostics]);

  const sortedDiagnostics = useMemo(() => {
    if (!diagnostics || diagnostics.length === 0) {
      return [];
    }

    return [...diagnostics].sort((a, b) => {
      const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      if (statusDiff !== 0) {
        return statusDiff;
      }
      return a.sourceName.localeCompare(b.sourceName);
    });
  }, [diagnostics]);

  if (!diagnostics || diagnostics.length === 0) {
    return null;
  }

  return (
    <div className={`feed-diagnostics-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        type="button"
        className="diagnostics-toggle"
        onClick={() => setIsExpanded(prev => !prev)}
        aria-expanded={isExpanded}
      >
        <div className="diagnostics-summary">
          <span className="diagnostics-title">Source diagnostics</span>
          <span className="diagnostics-metrics">
            ✅ {summary.success} ok · ⚠️ {summary.empty} empty · 🔥 {summary.failed} failing
          </span>
        </div>
        <span className="diagnostics-toggle-icon" aria-hidden="true">
          {isExpanded ? '▾' : '▸'}
        </span>
      </button>

      {isExpanded && (
        <div className="diagnostics-body">
          {lastUpdated && (
            <div className="diagnostics-timestamp">
              Last fetch window: {lastUpdated.toLocaleTimeString()} ({diagnostics.length} sources)
            </div>
          )}
          <div className="diagnostics-table-wrapper">
            <table className="diagnostics-table">
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col">Status</th>
                  <th scope="col">Items</th>
                  <th scope="col">Latency</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sortedDiagnostics.map(diagnostic => (
                  <tr key={diagnostic.sourceId}>
                    <td>{diagnostic.sourceName}</td>
                    <td>
                      <span className={`status-pill status-${diagnostic.status}`}>
                        {diagnostic.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{diagnostic.itemsFetched}</td>
                    <td>{Math.round(diagnostic.durationMs)} ms</td>
                    <td className="diagnostics-notes">
                      {diagnostic.error || diagnostic.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedDiagnosticsPanel;
