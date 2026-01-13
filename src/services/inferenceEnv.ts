const getEnvValue = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key];
  }
  return undefined;
};

export type InferenceEnvironment = 'prod' | 'sandbox' | 'unknown';

export const getInferenceEnvironment = (): InferenceEnvironment => {
  const raw = getEnvValue('VITE_ENVIRONMENT') ?? getEnvValue('NODE_ENV');
  const normalized = raw?.toLowerCase();
  if (normalized === 'production' || normalized === 'prod') return 'prod';
  if (normalized === 'sandbox' || normalized === 'development' || normalized === 'dev') return 'sandbox';
  return 'unknown';
};

export const validateInferenceKey = (): { ok: boolean; message?: string } => {
  const env = getInferenceEnvironment();
  const key = getEnvValue('VITE_INFERENCE_API_KEY');

  if (!key) {
    return { ok: false, message: 'Inference API key missing (VITE_INFERENCE_API_KEY)' };
  }

  if (env === 'sandbox' && key.toLowerCase().includes('prod')) {
    return { ok: false, message: 'Prod inference key detected in sandbox environment' };
  }

  if (env === 'prod' && key.toLowerCase().includes('sandbox')) {
    return { ok: false, message: 'Sandbox inference key detected in prod environment' };
  }

  return { ok: true };
};

export const warnIfInvalidInferenceKey = () => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') return;
  const result = validateInferenceKey();
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.warn('[Inference] key validation warning:', result.message);
  }
};

export const getInferenceApiKey = (): string | undefined => getEnvValue('VITE_INFERENCE_API_KEY');
