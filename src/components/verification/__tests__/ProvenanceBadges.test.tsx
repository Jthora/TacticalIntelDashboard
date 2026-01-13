import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import ProvenanceBadges from '../ProvenanceBadges';
import {
  makeFailedProvenance,
  makeHybridProvenance,
  makeMissingCidProvenance,
  makeMultiRelayProvenance,
  makePendingProvenance,
  makeUnsignedProvenance
} from '../../../tests/provenanceFixtures';
import { ProvenanceBundle } from '../../../types/Provenance';

describe('ProvenanceBadges', () => {
  const base: ProvenanceBundle = {
    signatures: [
      { scheme: 'PQC', algo: 'falcon', signerId: 'sig-1', signature: 'deadbeef', createdAt: '2024-01-01T00:00:00Z' },
      { scheme: 'EVM', algo: 'secp256k1', signerId: 'sig-2', signature: 'cafebabe', createdAt: '2024-01-02T00:00:00Z' }
    ],
    chainRef: { chain: 'QAN-mock', txRef: 'tx-abcdef', status: 'confirmed', anchoredAt: '2024-01-03T00:00:00Z' },
    anchorStatus: 'anchored',
    cid: 'bafybeigdyrandomcidvalueforproofs',
    relayIds: ['relay-1', 'relay-2']
  };

  it('renders signed, anchored, cid, and relay badges', () => {
    render(<ProvenanceBadges provenance={base} />);

    expect(screen.getByText('Signed')).toBeInTheDocument();
    expect(screen.getByText('Anchored')).toBeInTheDocument();
    expect(screen.getByText('CID')).toBeInTheDocument();
    expect(screen.getByText('Relayed')).toBeInTheDocument();
    expect(screen.getByText('2 sigs')).toBeInTheDocument();
    expect(screen.getByText(/relay/i)).toBeInTheDocument();
  });

  it('shows warning variant for pending anchor', () => {
    const pending: ProvenanceBundle = makePendingProvenance();

    render(<ProvenanceBadges provenance={pending} />);

    const anchorBadge = screen.getByTestId('prov-badge-anchor');
    expect(anchorBadge).toHaveClass('warning');
    expect(anchorBadge).toHaveTextContent('Anchoring');
    expect(anchorBadge).toHaveAttribute('aria-label', expect.stringContaining('Anchoring'));
  });

  it('renders neutral CID badge when CID missing', () => {
    const missingCid = makeMissingCidProvenance();
    render(<ProvenanceBadges provenance={missingCid} />);

    const cidBadge = screen.getByTestId('prov-badge-cid');
    expect(cidBadge).toHaveTextContent('No CID');
    expect(cidBadge).toHaveTextContent('missing');
    expect(cidBadge).toHaveClass('neutral');
  });

  it('renders multi-relay detail text', () => {
    const multiRelay = makeMultiRelayProvenance();
    render(<ProvenanceBadges provenance={multiRelay} />);

    const relayBadge = screen.getByTestId('prov-badge-relay');
    expect(relayBadge).toHaveTextContent('Relayed');
    expect(relayBadge).toHaveTextContent('3 hops');
  });

  it('shows failed anchor as negative variant', () => {
    const failed = makeFailedProvenance();
    render(<ProvenanceBadges provenance={failed} />);

    const anchorBadge = screen.getByTestId('prov-badge-anchor');
    expect(anchorBadge).toHaveClass('negative');
    expect(anchorBadge).toHaveTextContent('Anchor failed');
    expect(anchorBadge).toHaveAttribute('title', expect.stringContaining('failed'));
  });

  it('shows unsigned and direct relay as neutral', () => {
    const { chainRef: _c, ...unsignedBase } = makeUnsignedProvenance();
    const unsignedDirect: ProvenanceBundle = { ...unsignedBase, relayIds: [], anchorStatus: 'not-requested' as const };
    render(<ProvenanceBadges provenance={unsignedDirect} />);

    const signatureBadge = screen.getByTestId('prov-badge-signature');
    expect(signatureBadge).toHaveTextContent('Unsigned');
    expect(signatureBadge).toHaveClass('neutral');

    const relayBadge = screen.getByTestId('prov-badge-relay');
    expect(relayBadge).toHaveTextContent('No relay');
    expect(relayBadge).toHaveTextContent('direct');
    expect(relayBadge).toHaveClass('neutral');
  });

  it('includes signature schemes in tooltip title', () => {
    const hybrid = makeHybridProvenance();
    render(<ProvenanceBadges provenance={hybrid} />);

    const signatureBadge = screen.getByTestId('prov-badge-signature');
    expect(signatureBadge).toHaveAttribute('title', expect.stringContaining('EVM'));
    expect(signatureBadge).toHaveAttribute('title', expect.stringContaining('PQC'));
    expect(signatureBadge).toHaveTextContent('2 sigs');
    expect(signatureBadge).toHaveAttribute('aria-label', expect.stringContaining('2 sigs'));
  });

  it('renders fallback when provenance missing', () => {
    render(<ProvenanceBadges provenance={undefined} />);
      const empty = screen.getByTestId('prov-badge-empty');
      expect(empty).toBeInTheDocument();
      expect(empty).toHaveAttribute('aria-label', 'Provenance unavailable');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<ProvenanceBadges provenance={base} compact />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot for pending anchor', () => {
    const { asFragment } = render(<ProvenanceBadges provenance={makePendingProvenance()} compact />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot for missing CID', () => {
    const { asFragment } = render(<ProvenanceBadges provenance={makeMissingCidProvenance()} compact />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot for failed anchor', () => {
    const { asFragment } = render(<ProvenanceBadges provenance={makeFailedProvenance()} compact />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot for unsigned direct relay', () => {
    const { chainRef: _c, ...unsignedBase } = makeUnsignedProvenance();
    const unsignedDirect: ProvenanceBundle = { ...unsignedBase, relayIds: [], anchorStatus: 'not-requested' as const };
    const { asFragment } = render(<ProvenanceBadges provenance={unsignedDirect} compact />);
    expect(asFragment()).toMatchSnapshot();
  });
});
