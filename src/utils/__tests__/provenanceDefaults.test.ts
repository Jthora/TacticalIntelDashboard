import { withProvenanceDefaults, PROVENANCE_DEFAULTS } from '../provenanceDefaults';
import { ProvenanceBundle } from '../../types/Provenance';

describe('withProvenanceDefaults', () => {
  it('applies defaults when bundle is undefined', () => {
    const result = withProvenanceDefaults();
    expect(result.provenanceVersion).toBe(PROVENANCE_DEFAULTS.VERSION);
    expect(result.anchorStatus).toBe(PROVENANCE_DEFAULTS.ANCHOR_STATUS);
  });

  it('preserves provided fields and fills missing ones', () => {
    const input: ProvenanceBundle = {
      contentHash: 'hash',
      provenanceVersion: '1.2.3'
    };

    const result = withProvenanceDefaults(input);
    expect(result.contentHash).toBe('hash');
    expect(result.provenanceVersion).toBe('1.2.3');
    expect(result.anchorStatus).toBe(PROVENANCE_DEFAULTS.ANCHOR_STATUS);
  });
});
