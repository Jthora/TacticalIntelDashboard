import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';

import type { IntelligenceSource } from '../../types/ModernAPITypes';
import {
  buildEnabledSourceMap,
  getRolloutAllowlist,
  isSourceEnabled,
  parseBooleanFlag
} from '../FeatureFlagUtil';

const SOURCE_FLAG_KEYS = [
  'VITE_SOURCE_KREBS_SECURITY_ENABLED',
  'VITE_SOURCE_GUARDIAN_ENVIRONMENT_ENABLED',
  'VITE_ENABLE_SOURCE_EXPANSION_2025',
  'VITE_SOURCE_ROLLOUT_ALLOWLIST'
];

describe('FeatureFlagUtil', () => {
  const originalEnv = { ...process.env };
  const originalOverrides = globalThis.__SOURCE_FLAG_OVERRIDES__;

  beforeEach(() => {
    SOURCE_FLAG_KEYS.forEach(key => {
      delete process.env[key];
    });
    globalThis.__SOURCE_FLAG_OVERRIDES__ = undefined;
  });

  afterEach(() => {
    SOURCE_FLAG_KEYS.forEach(key => {
      delete process.env[key];
    });
    Object.entries(originalEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });

    if (originalOverrides === undefined) {
      delete (globalThis as typeof globalThis & { __SOURCE_FLAG_OVERRIDES__?: Record<string, unknown> }).__SOURCE_FLAG_OVERRIDES__;
    } else {
      globalThis.__SOURCE_FLAG_OVERRIDES__ = originalOverrides;
    }
  });

  test('parseBooleanFlag handles truthy/falsey values', () => {
    expect(parseBooleanFlag('true')).toBe(true);
    expect(parseBooleanFlag('FALSE')).toBe(false);
    expect(parseBooleanFlag('1')).toBe(true);
    expect(parseBooleanFlag('0')).toBe(false);
    expect(parseBooleanFlag('maybe')).toBeNull();
  });

  test('isSourceEnabled falls back to default value', () => {
    expect(isSourceEnabled('krebs-security', true)).toBe(true);
    expect(isSourceEnabled('krebs-security', false)).toBe(false);
  });

  test('isSourceEnabled respects per-source override via process.env', () => {
    process.env.VITE_SOURCE_KREBS_SECURITY_ENABLED = 'false';
    expect(isSourceEnabled('krebs-security', true)).toBe(false);

    process.env.VITE_SOURCE_KREBS_SECURITY_ENABLED = 'on';
    expect(isSourceEnabled('krebs-security', false)).toBe(true);
  });

  test('isSourceEnabled respects global allowlist', () => {
    process.env.VITE_SOURCE_ROLLOUT_ALLOWLIST = 'krebs-security, opensecrets-transparency';
    expect(isSourceEnabled('krebs-security', false)).toBe(true);
    expect(isSourceEnabled('guardian-environment', false)).toBe(false);

    process.env.VITE_SOURCE_ROLLOUT_ALLOWLIST = '*';
    expect(isSourceEnabled('guardian-environment', false)).toBe(true);
  });

  test('isSourceEnabled respects global rollout flag', () => {
    process.env.VITE_ENABLE_SOURCE_EXPANSION_2025 = 'false';
    expect(isSourceEnabled('krebs-security', true)).toBe(false);

    process.env.VITE_ENABLE_SOURCE_EXPANSION_2025 = 'true';
    expect(isSourceEnabled('guardian-environment', false)).toBe(true);
  });

  test('browser overrides take priority', () => {
    globalThis.__SOURCE_FLAG_OVERRIDES__ = {
      VITE_SOURCE_KREBS_SECURITY_ENABLED: 'false'
    };

    expect(isSourceEnabled('krebs-security', true)).toBe(false);
  });

  const createStubSource = (id: string, enabled: boolean): IntelligenceSource => ({
    id,
    name: id,
    description: `${id} stub`,
    endpoint: {
      id: `${id}-endpoint`,
      name: `${id}-endpoint`,
      category: 'technology',
      baseUrl: 'https://example.com',
      endpoints: { primary: '/feed' },
      corsEnabled: true,
      requiresAuth: false,
      rateLimit: { requests: 1, period: 'hour' },
      status: 'active'
    },
    normalizer: 'normalizeStub',
    refreshInterval: 60000,
    enabled,
    tags: [],
    healthScore: 100
  });

  test('buildEnabledSourceMap snapshots boolean states', () => {
    const sources = [
      createStubSource('krebs-security', true),
      createStubSource('guardian-environment', false)
    ];

    const snapshot = buildEnabledSourceMap(sources);
    expect(snapshot).toEqual({
      'krebs-security': true,
      'guardian-environment': false
    });
  });

  test('getRolloutAllowlist splits comma separated values', () => {
    process.env.VITE_SOURCE_ROLLOUT_ALLOWLIST = ' krebs-security , guardian-environment ';
    expect(getRolloutAllowlist()).toEqual(['krebs-security', 'guardian-environment']);
  });
});
