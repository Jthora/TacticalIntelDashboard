import './ProvenanceBadges.css';

import React, { useMemo } from 'react';

import { ProvenanceBundle } from '../../types/Provenance';

type BadgeVariant = 'positive' | 'warning' | 'neutral' | 'negative';

interface Badge {
  key: string;
  label: string;
  detail?: string;
  title: string;
  variant: BadgeVariant;
}

export interface ProvenanceBadgesProps {
  provenance?: ProvenanceBundle | null | undefined;
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}

const shorten = (value: string, front: number = 4, back: number = 4) => {
  if (!value || value.length <= front + back + 1) return value;
  return `${value.slice(0, front)}...${value.slice(-back)}`;
};

const resolveAnchor = (prov?: ProvenanceBundle | null): Badge => {
  const anchorState = prov?.anchorStatus || prov?.chainRef?.status;
  const chain = prov?.chainRef?.chain;
  const txRef = prov?.chainRef?.txRef;

  if (!anchorState || anchorState === 'not-requested') {
    return {
      key: 'anchor',
      label: 'Not anchored',
      detail: chain || 'none',
      title: 'Anchoring not requested',
      variant: 'neutral'
    };
  }

  if (anchorState === 'failed') {
    return {
      key: 'anchor',
      label: 'Anchor failed',
      detail: chain || 'chain',
      title: txRef ? `Anchor failed for ${txRef}` : 'Anchoring failed',
      variant: 'negative'
    };
  }

  if (anchorState === 'pending' || anchorState === 'submitted') {
    return {
      key: 'anchor',
      label: 'Anchoring',
      detail: chain || 'chain',
      title: txRef ? `Anchoring in progress: ${txRef}` : 'Anchoring pending',
      variant: 'warning'
    };
  }

  return {
    key: 'anchor',
    label: 'Anchored',
    detail: chain || 'chain',
    title: txRef ? `Anchored on ${chain || 'chain'} (${txRef})` : 'Anchored',
    variant: 'positive'
  };
};

const buildBadges = (prov?: ProvenanceBundle | null): Badge[] => {
  if (!prov) return [];

  const signatureCount = prov.signatures?.length || 0;
  const uniqueSchemes = prov.signatures ? Array.from(new Set(prov.signatures.map(s => s.scheme))).join(', ') : 'none';
  const anchorBadge = resolveAnchor(prov);
  const cid = prov.cid;
  const relayCount = prov.relayIds?.length || 0;

  const badges: Badge[] = [
    {
      key: 'signature',
      label: signatureCount > 0 ? 'Signed' : 'Unsigned',
      detail: signatureCount > 0 ? `${signatureCount} sig${signatureCount > 1 ? 's' : ''}` : 'no signatures',
      title: signatureCount > 0 ? `Signatures present via ${uniqueSchemes}` : 'No signatures attached',
      variant: signatureCount > 0 ? 'positive' : 'neutral'
    },
    anchorBadge,
    {
      key: 'cid',
      label: cid ? 'CID' : 'No CID',
      detail: cid ? shorten(cid, 6, 6) : 'missing',
      title: cid ? `Content stored at ${cid}` : 'Content not pinned to IPFS',
      variant: cid ? 'positive' : 'neutral'
    },
    {
      key: 'relay',
      label: relayCount > 0 ? 'Relayed' : 'No relay',
      detail: relayCount > 0 ? `${relayCount} hop${relayCount > 1 ? 's' : ''}` : 'direct',
      title: relayCount > 0 ? `Relayed via ${relayCount} endpoint${relayCount > 1 ? 's' : ''}` : 'No relay origin provided',
      variant: relayCount > 0 ? 'positive' : 'neutral'
    }
  ];

  return badges;
};

const ProvenanceBadges: React.FC<ProvenanceBadgesProps> = ({ provenance, compact = false, showLabels = true, className }) => {
  const badges = useMemo(() => buildBadges(provenance), [provenance]);

  const classes = ['prov-badges', compact ? 'compact' : '', className].filter(Boolean).join(' ');

  if (!provenance) {
    return (
      <div className={classes} data-testid="provenance-badges">
        <span
          className="prov-badge neutral"
          title="Provenance not provided"
          aria-label="Provenance unavailable"
          data-testid="prov-badge-empty"
        >
          <span className="prov-dot" aria-hidden="true" />
          <span className="prov-label">Provenance unavailable</span>
        </span>
      </div>
    );
  }

  return (
    <div className={classes} data-testid="provenance-badges">
      {badges.map(badge => (
        <span
          key={badge.key}
          className={`prov-badge ${badge.variant}`}
          title={badge.title}
          aria-label={`${badge.label}${badge.detail ? `: ${badge.detail}` : ''}. ${badge.title}`}
          data-testid={`prov-badge-${badge.key}`}
        >
          <span className="prov-dot" aria-hidden="true" />
          <span className="prov-label">{badge.label}</span>
          {showLabels && badge.detail && <span className="prov-detail">{badge.detail}</span>}
        </span>
      ))}
    </div>
  );
};

export default ProvenanceBadges;
