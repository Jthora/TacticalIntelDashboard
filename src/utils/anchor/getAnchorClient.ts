import { AnchoringConfig } from '../../config/anchoringConfig';
import { AnchorClient } from '../../types/AnchorClient';
import { mockAnchorClient } from './mockAnchorClient';

export interface AnchorClientResolution {
  client: AnchorClient;
  mode: 'mock' | 'real';
  reason?: string | undefined;
}

/**
 * Resolves the anchor client based on config and availability.
 * If real mode is requested but not allowed or unavailable, falls back to mock and returns a reason.
 */
export const getAnchorClient = (
  config: AnchoringConfig,
  realFactory?: () => AnchorClient
): AnchorClientResolution => {
  const { effectiveMode, reason } = config;

  if (effectiveMode === 'real') {
    if (realFactory) {
      return { client: realFactory(), mode: 'real', reason };
    }
    return { client: mockAnchorClient, mode: 'mock', reason: reason || 'real-client-unavailable' };
  }

  return { client: mockAnchorClient, mode: 'mock', reason };
};
