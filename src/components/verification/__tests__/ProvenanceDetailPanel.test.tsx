import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import ProvenanceDetailPanel from '../ProvenanceDetailPanel';
import { ProvenanceBundle } from '../../../types/Provenance';

describe('ProvenanceDetailPanel', () => {
  const sample: ProvenanceBundle = {
    contentHash: 'hash-123',
    cid: 'bafybeigdyrandomcidvalueforproofs',
    signatures: [{ scheme: 'PQC', algo: 'falcon', signerId: 'sig-1', signature: 'deadbeef', createdAt: '2024-01-01T00:00:00Z' }],
    chainRef: { chain: 'QAN-mock', txRef: 'tx-123', status: 'confirmed', anchoredAt: '2024-01-02T00:00:00Z' },
    relayIds: ['relay-1'],
    modelVerdicts: [{ modelId: 'model-1', summaryHash: 'sumhash', ts: '2024-01-03T00:00:00Z', confidence: 0.86 }],
    provenanceVersion: '0.1.0',
    anchorStatus: 'anchored'
  };

  it('renders provenance fields when provided', () => {
    render(<ProvenanceDetailPanel provenance={sample} />);

    expect(screen.getByTestId('prov-hash')).toHaveTextContent('hash-123');
    expect(screen.getByTestId('prov-cid')).toHaveTextContent('bafy');
    expect(screen.getByTestId('prov-sigs')).toHaveTextContent('PQC/falcon (sig-1)');
    expect(screen.getByTestId('prov-anchor')).toHaveTextContent('confirmed');
    expect(screen.getByTestId('prov-txref')).toHaveTextContent('tx-123');
    expect(screen.getByTestId('prov-relays')).toHaveTextContent('relay-1');
    expect(screen.getByTestId('prov-verdicts-count')).toHaveTextContent('1 verdict');
    expect(screen.getByTestId('prov-verdicts-list')).toHaveTextContent('model-1');
    expect(screen.getByTestId('prov-verdicts-list')).toHaveTextContent('confidence 86%');
    expect(screen.getByTestId('prov-version')).toHaveTextContent('0.1.0');
  });

  it('handles missing provenance gracefully', () => {
    render(<ProvenanceDetailPanel provenance={null} />);
    expect(screen.getByTestId('prov-detail-empty')).toHaveTextContent('Provenance not provided');
  });

  it('shows fallbacks for absent fields', () => {
    render(<ProvenanceDetailPanel provenance={{}} />);
    expect(screen.getByTestId('prov-hash')).toHaveTextContent('Not provided');
    expect(screen.getByTestId('prov-cid')).toHaveTextContent('Not provided');
    expect(screen.getByTestId('prov-sigs')).toHaveTextContent('None');
    expect(screen.getByTestId('prov-relays')).toHaveTextContent('Direct');
    expect(screen.getByTestId('prov-verdicts-count')).toHaveTextContent('None (model verdicts not yet provided)');
  });
});
