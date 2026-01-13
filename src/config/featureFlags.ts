const normalizeBooleanFlag = (value?: string | boolean | null): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return false;
};

const resolveEnvFlag = (key: string): string | boolean | undefined => {
  // Prefer Vite-style import.meta.env but fall back to process.env for tests/Node
  const importMetaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env)
    ? (import.meta as any).env
    : undefined;

  if (importMetaEnv && key in importMetaEnv) {
    return importMetaEnv[key];
  }

  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key];
  }

  return undefined;
};

export const featureFlags = Object.freeze({
  web3Login: normalizeBooleanFlag(resolveEnvFlag('VITE_ENABLE_WEB3_LOGIN')),
});

export type FeatureFlags = typeof featureFlags;
