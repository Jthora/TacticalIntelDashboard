import crypto from 'crypto';
import { ProvenanceBundle, SignatureRecord } from '../types/Provenance';

const VOLATILE_ROOT_FIELDS = new Set(['anchorStatus']);
const VOLATILE_CHAIN_FIELDS = new Set(['status', 'anchoredAt']);

const sortSignatures = (signatures: SignatureRecord[] = []): SignatureRecord[] => {
  return [...signatures].sort((a, b) => {
    const aKey = `${a.scheme}|${a.algo}|${a.signerId}`;
    const bKey = `${b.scheme}|${b.algo}|${b.signerId}`;
    return aKey.localeCompare(bKey);
  });
};

const sortStrings = (items: string[] = []): string[] => [...items].sort((a, b) => a.localeCompare(b));

const sortModelVerdicts = (verdicts: NonNullable<ProvenanceBundle['modelVerdicts']> = []) =>
  [...verdicts].sort((a, b) => a.modelId.localeCompare(b.modelId));

const canonicalizeObject = (value: unknown): unknown => {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(item => canonicalizeObject(item));
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  const result: Record<string, unknown> = {};
  for (const [k, v] of entries) {
    result[k] = canonicalizeObject(v);
  }
  return result;
};

export const canonicalizeProvenanceBundle = (bundle: ProvenanceBundle): string => {
  const filtered: Record<string, unknown> = {};

  Object.entries(bundle).forEach(([key, value]) => {
    if (VOLATILE_ROOT_FIELDS.has(key)) return;
    if (key === 'relayIds' && Array.isArray(value)) {
      filtered[key] = sortStrings(value);
      return;
    }
    if (key === 'signatures' && Array.isArray(value)) {
      filtered[key] = sortSignatures(value);
      return;
    }
    if (key === 'modelVerdicts' && Array.isArray(value)) {
      filtered[key] = sortModelVerdicts(value);
      return;
    }
    if (key === 'chainRef' && value && typeof value === 'object') {
      const chainRef = value as NonNullable<ProvenanceBundle['chainRef']>;
      const chainFiltered: Record<string, unknown> = {};
      Object.entries(chainRef).forEach(([cKey, cValue]) => {
        if (VOLATILE_CHAIN_FIELDS.has(cKey)) return;
        chainFiltered[cKey] = cValue;
      });
      filtered[key] = chainFiltered;
      return;
    }
    filtered[key] = value as unknown;
  });

  const canonical = canonicalizeObject(filtered);
  return JSON.stringify(canonical);
};

export const hashProvenanceBundle = (bundle: ProvenanceBundle): string => {
  const canonical = canonicalizeProvenanceBundle(bundle);
  return crypto.createHash('sha256').update(canonical).digest('hex');
};

export default hashProvenanceBundle;
