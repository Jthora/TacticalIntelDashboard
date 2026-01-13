import { ProvenanceBundle } from '../types/Provenance';

const DEFAULT_PROVENANCE_VERSION = '0.1.0';
const DEFAULT_ANCHOR_STATUS: ProvenanceBundle['anchorStatus'] = 'not-requested';

export const withProvenanceDefaults = (input?: ProvenanceBundle | null): ProvenanceBundle => {
  const bundle: ProvenanceBundle = input ? { ...input } : {};

  if (!bundle.provenanceVersion) {
    bundle.provenanceVersion = DEFAULT_PROVENANCE_VERSION;
  }

  if (!bundle.anchorStatus) {
    bundle.anchorStatus = DEFAULT_ANCHOR_STATUS;
  }

  return bundle;
};

export const PROVENANCE_DEFAULTS = {
  VERSION: DEFAULT_PROVENANCE_VERSION,
  ANCHOR_STATUS: DEFAULT_ANCHOR_STATUS,
};
