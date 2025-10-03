import { useCallback, useMemo } from 'react';

import { log } from '../utils/LoggerService';
import { buildXIntentUrl, composeShareText, normalizeHashtags } from '../utils/socialShare';

export type ShareMethod = 'web-share' | 'intent';

export interface SharePayload {
  url: string;
  title?: string | undefined;
  summary?: string | undefined;
  text?: string | undefined;
  hashtags?: string[] | undefined;
  via?: string | undefined;
}

export interface UseSocialShareConfig {
  baseUrl?: string | undefined;
  defaultHashtags?: string[] | undefined;
  via?: string | undefined;
  maxLength?: number | undefined;
  windowRef?: Window | null;
  onShareStart?: (method: ShareMethod, payload: SharePayload) => void;
  onShareSuccess?: (method: ShareMethod) => void;
  onShareError?: (error: Error) => void;
}

const SOCIAL_LOG_CATEGORY = 'SocialShare';

const isNavigatorShareSupported = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export const useSocialShare = (config: UseSocialShareConfig = {}) => {
  const {
    baseUrl,
  defaultHashtags = [],
    via,
    maxLength,
    windowRef,
    onShareStart,
    onShareSuccess,
    onShareError
  } = config;

  const supportsNativeShare = isNavigatorShareSupported();

  const combineHashtags = useCallback(
    (hashtags?: string[] | undefined) => normalizeHashtags([...(defaultHashtags ?? []), ...(hashtags ?? [])]),
    [defaultHashtags]
  );

  const buildIntentUrl = useCallback(
    (payload: SharePayload) =>
      buildXIntentUrl({
        baseUrl,
        url: payload.url,
        title: payload.title,
        summary: payload.summary,
        hashtags: combineHashtags(payload.hashtags),
        via: payload.via ?? via,
        maxLength
      }),
    [baseUrl, combineHashtags, via, maxLength]
  );

  const share = useCallback(
    async (payload: SharePayload) => {
      const targetWindow = windowRef ?? (typeof window !== 'undefined' ? window : undefined);
      const method: ShareMethod = supportsNativeShare ? 'web-share' : 'intent';

      try {
        onShareStart?.(method, payload);
      } catch (hookError) {
        log.warn(SOCIAL_LOG_CATEGORY, 'onShareStart handler threw', { error: hookError });
      }

      const shareText = payload.text ??
        composeShareText({
          title: payload.title,
          summary: payload.summary,
          maxLength
        });

      if (supportsNativeShare) {
        try {
          const shareData: ShareData = { url: payload.url };
          if (payload.title) {
            shareData.title = payload.title;
          }
          if (shareText) {
            shareData.text = shareText;
          }

          await navigator.share(shareData);
          log.info(SOCIAL_LOG_CATEGORY, 'Shared via Web Share API', { url: payload.url });
          onShareSuccess?.('web-share');
          return { method: 'web-share' as const };
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          log.warn(SOCIAL_LOG_CATEGORY, 'Web Share API failed, falling back to intent url', {
            message: err.message
          });
          onShareError?.(err);
        }
      }

  const intentUrl = buildIntentUrl(payload);

      if (targetWindow?.open) {
        targetWindow.open(intentUrl, '_blank', 'noopener,noreferrer');
      } else {
        log.warn(SOCIAL_LOG_CATEGORY, 'Unable to open window for intent URL', { intentUrl });
      }

      log.info(SOCIAL_LOG_CATEGORY, 'Opened X intent URL for sharing', { intentUrl });
      onShareSuccess?.('intent');

      return { method: 'intent' as const, intentUrl };
    },
    [buildIntentUrl, maxLength, onShareError, onShareStart, onShareSuccess, supportsNativeShare, windowRef]
  );

  return useMemo(
    () => ({
      supportsNativeShare,
      share,
      buildIntentUrl
    }),
    [supportsNativeShare, share, buildIntentUrl]
  );
};

export default useSocialShare;
