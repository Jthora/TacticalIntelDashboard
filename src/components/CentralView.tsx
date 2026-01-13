import React, { useEffect, useMemo, useState } from 'react';

import FeedVisualizer from './FeedVisualizer';
import BottomStatusBar from './BottomStatusBar';
import useInferenceRequest from '../hooks/useInferenceRequest';
import { InferenceFeature, InferenceResult } from '../types/InferenceTypes';

interface CentralViewProps {
  selectedFeedList: string | null;
}

const CentralView: React.FC<CentralViewProps> = ({ selectedFeedList }) => {
  console.log('🔍 TDD_SUCCESS_070: CentralView rendered with selectedFeedList:', selectedFeedList);

  const { state, runInference, payloadMeta } = useInferenceRequest({ selectedFeedList });
  const [resultsByFeature, setResultsByFeature] = useState<Record<InferenceFeature, InferenceResult | undefined>>({
    summary: undefined,
    risk: undefined,
    sourceHealth: undefined
  });

  const hasFeeds = payloadMeta.totalFeeds > 0;
  const isLoading = state.status === 'loading';

  useEffect(() => {
    if (state.status === 'success' && state.result) {
      const result = state.result;
      setResultsByFeature(prev => ({ ...prev, [result.feature]: result }));
    }
  }, [state]);

  const featureLabel = (feature: InferenceFeature | null) => {
    if (feature === 'risk') return 'Risk & Alerts';
    if (feature === 'sourceHealth') return 'Source Health';
    return 'Summary';
  };

  const formatTimestamp = (value?: string | null) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString();
    } catch (err) {
      return String(value);
    }
  };

  const actionButtons = useMemo(() => ([
    { label: 'Summarize Intel', feature: 'summary' as InferenceFeature },
    { label: 'Risk & Alerts', feature: 'risk' as InferenceFeature },
    { label: 'Source Health', feature: 'sourceHealth' as InferenceFeature }
  ]), []);

  const renderResultCard = (feature: InferenceFeature, title: string, description: string) => {
    const result = resultsByFeature[feature];
    const loadingThis = isLoading && state.feature === feature;
    return (
      <div className="inference-card">
        <div className="inference-card__header">
          <div>
            <div className="inference-card__title">{title}</div>
            <div className="inference-card__description">{description}</div>
          </div>
          <div className="inference-card__status">
            {loadingThis && <span className="pill">Working…</span>}
            {result?.truncated && <span className="pill">Truncated</span>}
          </div>
        </div>
        {result ? (
          <>
            <div className="inference-card__meta">
              <span>Generated: {formatTimestamp(result.generatedAt)}</span>
              <span>Request: {result.requestId}</span>
              {result.truncationNote && <span className="pill">{result.truncationNote}</span>}
            </div>
            <pre className="inference-card__body">{result.text}</pre>
          </>
        ) : (
          <div className="inference-card__placeholder">No {featureLabel(feature)} yet. Run the CTA to generate.</div>
        )}
      </div>
    );
  };
  
  return (
    <div className="tactical-module module-intelligence animate-fade-in-up">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">📡</span>
          <h3 className="intelligence-feed-title">INTELLIGENCE FEED</h3>
        </div>
        <div className="header-status">
          <span className={`status-dot ${selectedFeedList ? 'active' : 'idle'}`}></span>
          <span className="status-text">{selectedFeedList ? 'ACTIVE' : 'STANDBY'}</span>
        </div>
        <div className="header-actions">
          {actionButtons.map(action => (
            <button
              key={action.feature}
              className="cta-button"
              disabled={isLoading || !hasFeeds}
              onClick={() => runInference(action.feature)}
            >
              {isLoading && state.feature === action.feature ? 'Working…' : action.label}
            </button>
          ))}
        </div>
      </div>
      <div className="tactical-content central-view-shell">
        <div className="central-view-main">
          <FeedVisualizer selectedFeedList={selectedFeedList} />
          <div className="inference-panel">
            <div className="inference-panel__meta">
              <span>Feeds used: {payloadMeta.feedCount}/{payloadMeta.totalFeeds}</span>
              <span>Alerts: {payloadMeta.alerts}</span>
              <span>Last updated: {formatTimestamp(payloadMeta.lastUpdated)}</span>
            </div>
            {!hasFeeds && (
              <div className="inference-panel__placeholder">No feeds available for inference right now. Add feeds to proceed.</div>
            )}
            {hasFeeds && state.status === 'idle' && (
              <div className="inference-panel__placeholder">Select a CTA to generate intel.</div>
            )}
            {state.status === 'loading' && (
              <div className="inference-panel__loading">Generating {featureLabel(state.feature)}…</div>
            )}
            {state.status === 'error' && (
              <div className="inference-panel__error">{state.errorMessage ?? 'Unable to process inference request.'}</div>
            )}
            {state.status === 'success' && state.result && (
              <div className="inference-panel__result">
                <div className="inference-panel__header">
                  <div className="inference-panel__title">{featureLabel(state.result.feature)}</div>
                  <div className="inference-panel__meta-row">
                    <span>Generated: {formatTimestamp(state.result.generatedAt)}</span>
                    <span>Request: {state.result.requestId}</span>
                    {state.result.truncated && <span className="pill">Truncated</span>}
                    {state.result.truncationNote && <span className="pill">{state.result.truncationNote}</span>}
                  </div>
                </div>
                <pre className="inference-panel__body">{state.result.text}</pre>
              </div>
            )}
          </div>
          <div className="inference-grid">
            {renderResultCard('summary', 'Summary', 'Mission-aware summary of selected intel')}
            {renderResultCard('risk', 'Risk & Alerts', 'Threats, anomalies, and alerts extracted from feeds')}
            {renderResultCard('sourceHealth', 'Source Health', 'Source availability and quality notes')}
          </div>
        </div>
        <BottomStatusBar />
      </div>
    </div>
  );
};

export default CentralView;