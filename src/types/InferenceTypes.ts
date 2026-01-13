import { IntelLLMPayload } from '../hooks/useIntelLLMPayload';

export type InferenceFeature = 'summary' | 'risk' | 'sourceHealth';

export interface InferenceRequest {
  feature: InferenceFeature;
  promptVersion: string;
  payload: IntelLLMPayload;
  truncationNote?: string;
}

export interface InferenceResponse {
  requestId: string;
  text: string;
  generatedAt: string;
  truncated?: boolean;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
    costUSD?: number;
  };
  status: number;
}

export type InferenceErrorCategory = 'network' | 'timeout' | 'rate-limit' | 'server' | 'client' | 'unknown';

export interface InferenceResult {
  feature: InferenceFeature;
  requestId: string;
  text: string;
  generatedAt: string;
  truncated: boolean;
  truncationNote?: string;
}
