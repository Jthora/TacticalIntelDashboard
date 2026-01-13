import './ProvenanceDetailPanel.css';

import React, { useMemo } from 'react';

import { ProvenanceBundle } from '../../types/Provenance';

export interface ProvenanceDetailPanelProps {
  provenance?: ProvenanceBundle | null;
  className?: string;
}

const fallback = (value?: string | null, emptyLabel: string = 'Not provided') => {
  return value && value.trim().length > 0 ? value : emptyLabel;
};

const formatSignatures = (signatures?: ProvenanceBundle['signatures']) => {
  if (!signatures || signatures.length === 0) return 'None';
  return signatures
    .map(sig => `${sig.scheme}/${sig.algo} (${sig.signerId})`)
    .join(', ');
};

const formatRelayIds = (relayIds?: string[]) => {
  if (!relayIds || relayIds.length === 0) return 'Direct (no relay)';
  return relayIds.join(', ');
};

const formatModelVerdicts = (verdicts?: ProvenanceBundle['modelVerdicts']) => {
  if (!verdicts || verdicts.length === 0) return 'None (model verdicts not yet provided)';
  return `${verdicts.length} verdict${verdicts.length > 1 ? 's' : ''}`;
};

const shortenHash = (hash?: string, front: number = 6, back: number = 4) => {
  if (!hash) return '';
  if (hash.length <= front + back + 1) return hash;
  return `${hash.slice(0, front)}...${hash.slice(-back)}`;
};

const ProvenanceDetailPanel: React.FC<ProvenanceDetailPanelProps> = ({ provenance, className }) => {
  const resolved = useMemo(() => provenance || null, [provenance]);

  const classes = ['prov-detail-panel', className].filter(Boolean).join(' ');

  if (!resolved) {
    return (
      <div className={classes} data-testid="prov-detail-panel">
        <div className="prov-detail-empty" data-testid="prov-detail-empty">
          <span className="prov-detail-empty-label">Provenance not provided</span>
        </div>
      </div>
    );
  }

  return (
    <div className={classes} data-testid="prov-detail-panel">
      <div className="prov-detail-row">
        <span className="prov-detail-label">Content Hash</span>
        <span className="prov-detail-value" data-testid="prov-hash">{fallback(resolved.contentHash)}</span>
      </div>
      <div className="prov-detail-row">
        <span className="prov-detail-label">CID</span>
        <span className="prov-detail-value" data-testid="prov-cid">{fallback(resolved.cid)}</span>
      </div>
      <div className="prov-detail-row">
        <span className="prov-detail-label">Signatures</span>
        <span className="prov-detail-value" data-testid="prov-sigs">{formatSignatures(resolved.signatures)}</span>
      </div>
      <div className="prov-detail-row">
        <span className="prov-detail-label">Anchor</span>
        <span className="prov-detail-value" data-testid="prov-anchor">
          {resolved.chainRef ? `${resolved.chainRef.status} on ${resolved.chainRef.chain}` : fallback(resolved.anchorStatus)}
        </span>
      </div>
      <div className="prov-detail-row">
        <span className="prov-detail-label">Tx Ref</span>
        <span className="prov-detail-value" data-testid="prov-txref">{fallback(resolved.chainRef?.txRef)}</span>
      </div>
      <div className="prov-detail-row">
        <span className="prov-detail-label">Relays</span>
        <span className="prov-detail-value" data-testid="prov-relays">{formatRelayIds(resolved.relayIds)}</span>
      </div>
      <div className="prov-detail-row">
        <span className="prov-detail-label">Model Verdicts</span>
        <div className="prov-detail-value" data-testid="prov-verdicts">
          <span data-testid="prov-verdicts-count">{formatModelVerdicts(resolved.modelVerdicts)}</span>
          {resolved.modelVerdicts && resolved.modelVerdicts.length > 0 && (
            <ul className="prov-detail-sublist" data-testid="prov-verdicts-list">
              {resolved.modelVerdicts.map(verdict => (
                <li key={`${verdict.modelId}-${verdict.summaryHash}`} className="prov-detail-subrow">
                  <span className="prov-sub-label">{verdict.modelId}</span>
                  <span className="prov-sub-value">{shortenHash(verdict.summaryHash)}</span>
                  {typeof verdict.confidence === 'number' && (
                    <span className="prov-sub-value">{`confidence ${Math.round(verdict.confidence * 100)}%`}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="prov-detail-row">
        <span className="prov-detail-label">Version</span>
        <span className="prov-detail-value" data-testid="prov-version">{fallback(resolved.provenanceVersion)}</span>
      </div>
    </div>
  );
};

export default ProvenanceDetailPanel;
