/*
 * Feature flag utilities for controlling source rollout across environments.
 * Enables per-source toggles via environment variables and allowlists while
 * providing sensible defaults for local development and tests.
 */

import type { IntelligenceSource } from '../types/ModernAPITypes';

const BOOLEAN_TRUE_VALUES = new Set(['true', '1', 'yes', 'on']);
const BOOLEAN_FALSE_VALUES = new Set(['false', '0', 'no', 'off']);

/**
 * Normalizes a source identifier into the environment variable key format.
 */
const buildSourceFlagKey = (sourceId: string): string => {
  return `VITE_SOURCE_${sourceId.replace(/-/g, '_').toUpperCase()}_ENABLED`;
};

/**
 * Retrieves the globally injected source flag overrides when running in the browser.
 */
const getGlobalFlagOverrides = (): Record<string, unknown> | undefined => {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }

  const overrides = (globalThis as typeof globalThis & {
    __SOURCE_FLAG_OVERRIDES__?: Record<string, unknown>;
  }).__SOURCE_FLAG_OVERRIDES__;

  if (overrides && typeof overrides === 'object') {
    return overrides;
  }

  return undefined;
};

/**
 * Retrieves a raw environment value by checking, in order:
 * 1. Browser-injected overrides (window.__SOURCE_FLAG_OVERRIDES__)
 * 2. Node.js process.env (for tests and server-side utilities)
 */
const getEnvValue = (key: string): string | undefined => {
  const overrides = getGlobalFlagOverrides();
  const overrideValue = overrides?.[key];

  if (overrideValue !== undefined && overrideValue !== null) {
    if (typeof overrideValue === 'string') {
      return overrideValue;
    }
    if (typeof overrideValue === 'boolean') {
      return overrideValue ? 'true' : 'false';
    }
    return String(overrideValue);
  }

  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key];
  }

  return undefined;
};

/**
 * Parses a boolean-like environment string into an actual boolean.
 */
export const parseBooleanFlag = (value: string | undefined | null): boolean | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = value.toString().trim().toLowerCase();
  if (BOOLEAN_TRUE_VALUES.has(normalized)) {
    return true;
  }
  if (BOOLEAN_FALSE_VALUES.has(normalized)) {
    return false;
  }

  return null;
};

/**
 * Returns the rollout allowlist, if provided.
 * Accepts comma separated source ids or `*` to enable all staged sources.
 */
export const getRolloutAllowlist = (): string[] => {
  const allowlistRaw = getEnvValue('VITE_SOURCE_ROLLOUT_ALLOWLIST');
  if (!allowlistRaw) {
    return [];
  }

  return allowlistRaw
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);
};

/**
 * Resolves a boolean feature flag by environment key with fallback to a default value.
 */
export const isFeatureEnabled = (envKey: string, defaultValue = false): boolean => {
  const explicit = parseBooleanFlag(getEnvValue(envKey));
  if (explicit !== null) {
    return explicit;
  }
  return defaultValue;
};

/**
 * Computes whether the provided source should be considered enabled for the
 * current runtime, respecting per-source overrides, allowlists, and global rollout toggles.
 */
export const isSourceEnabled = (
  sourceId: string,
  defaultValue = true
): boolean => {
  const sourceKey = buildSourceFlagKey(sourceId);
  const explicit = parseBooleanFlag(getEnvValue(sourceKey));

  if (explicit !== null) {
    return explicit;
  }

  const allowlist = getRolloutAllowlist();
  if (allowlist.length > 0) {
    if (allowlist.includes('*')) {
      return true;
    }

    if (allowlist.includes(sourceId)) {
      return true;
    }

    return false;
  }

  const globalRollout = parseBooleanFlag(getEnvValue('VITE_ENABLE_SOURCE_EXPANSION_2025'));
  if (globalRollout !== null) {
    return globalRollout;
  }

  return defaultValue;
};

export type SourceFlagEvaluator = (
  source: Pick<IntelligenceSource, 'id' | 'enabled'>
) => boolean;

/**
 * Utility to create a snapshot of enabled source ids for analytics or telemetry reports.
 */
export const buildEnabledSourceMap = (sources: IntelligenceSource[]): Record<string, boolean> => {
  return sources.reduce<Record<string, boolean>>((acc, source) => {
    acc[source.id] = source.enabled;
    return acc;
  }, {});
};

declare global {
  // eslint-disable-next-line no-var
  var __SOURCE_FLAG_OVERRIDES__: Record<string, unknown> | undefined;

  interface Window {
    __SOURCE_FLAG_OVERRIDES__?: Record<string, unknown>;
  }
}

export {};
