import { deflate, inflate } from 'pako';

import type { Feed } from '../models/Feed';

export interface FeedStoragePayload {
  version: number;
  compressed: boolean;
  snapshot: string;
  itemCount: number;
  createdAt: number;
}

const STORAGE_VERSION = 1;
const DESCRIPTION_LIMIT = 2000;

const bytesToBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  if (typeof btoa === 'function') {
    return btoa(binary);
  }

  throw new Error('Base64 encoding is not supported in this environment');
};

const base64ToBytes = (base64: string): Uint8Array => {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(base64, 'base64'));
  }

  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  throw new Error('Base64 decoding is not supported in this environment');
};

const sanitizeFeedForStorage = (feed: Feed): Feed => {
  const sanitizeField = (value?: string): string | undefined => {
    if (!value) {
      return value;
    }

    if (value.length <= DESCRIPTION_LIMIT) {
      return value;
    }

    return `${value.slice(0, DESCRIPTION_LIMIT)}…`;
  };

  const nextDescription = sanitizeField(feed.description);
  const nextContent = sanitizeField(feed.content);

  return {
    ...feed,
    ...(nextDescription !== undefined ? { description: nextDescription } : {}),
    ...(nextContent !== undefined ? { content: nextContent } : {})
  };
};

export const FeedStorageSerializer = {
  serialize(feeds: Feed[]): FeedStoragePayload {
    const sanitizedFeeds = feeds.map(sanitizeFeedForStorage);
    const json = JSON.stringify(sanitizedFeeds);
    const compressed = deflate(json);
    const snapshot = bytesToBase64(compressed);

    return {
      version: STORAGE_VERSION,
      compressed: true,
      snapshot,
      itemCount: sanitizedFeeds.length,
      createdAt: Date.now()
    };
  },

  deserialize(payload: FeedStoragePayload | Feed[] | null | undefined): Feed[] {
    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (typeof payload === 'object' && payload.compressed && typeof payload.snapshot === 'string') {
      try {
        const bytes = base64ToBytes(payload.snapshot);
        const json = inflate(bytes, { to: 'string' });
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('FeedStorageSerializer', 'Failed to decompress stored feeds', error);
        return [];
      }
    }

    if (typeof (payload as any).feeds !== 'undefined' && Array.isArray((payload as any).feeds)) {
      return (payload as any).feeds;
    }

    return [];
  }
};
