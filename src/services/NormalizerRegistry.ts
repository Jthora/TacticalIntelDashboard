/*
 * Normalizer Registry (plugin-based)
 * Validates payloads (Zod) and runs per-source normalization + optional enrichment/classification.
 */

import { z } from 'zod';
import { NormalizedDataItem } from '../types/ModernAPITypes';
import { DataNormalizer } from './DataNormalizer';
import { ClassifierService } from './ClassifierService';

export interface NormalizerPlugin {
  id: string; // should match existing normalizerFunction keys
  schema?: z.ZodTypeAny; // optional validation schema
  validate?: (data: any) => { ok: boolean; errors?: string[] };
  normalize: (data: any) => NormalizedDataItem[];
  enrich?: (items: NormalizedDataItem[]) => NormalizedDataItem[];
  classify?: (items: NormalizedDataItem[]) => NormalizedDataItem[];
}

// Schemas (loose, resilient)
const NOAA_SCHEMA = z.object({
  features: z.array(z.object({
    id: z.string().optional(),
    properties: z.record(z.any()).optional()
  })).optional()
});

const USGS_SCHEMA = z.object({
  features: z.array(z.object({
    id: z.string().optional(),
    properties: z.record(z.any()).optional(),
    geometry: z.record(z.any()).optional()
  })).optional()
});

const GITHUB_SCHEMA = z.union([
  z.array(z.record(z.any())),
  z.object({ security_advisories: z.array(z.record(z.any())) })
]);

const REDDIT_SCHEMA = z.object({
  data: z.object({
    children: z.array(z.object({ data: z.record(z.any()) }))
  })
});

const HN_ITEM_SCHEMA = z.object({
  id: z.number().optional(),
  title: z.string().optional(),
  url: z.string().optional(),
  time: z.number().optional(),
  score: z.number().optional(),
  by: z.string().optional()
}).passthrough();

const COINGECKO_SCHEMA = z.union([
  z.array(z.record(z.any())),
  z.object({ coins: z.array(z.record(z.any())).optional(), data: z.record(z.any()).optional() })
]);

function defaultValidate(schema?: z.ZodTypeAny) {
  return (data: any) => {
    if (!schema) return { ok: true };
    const res = schema.safeParse(data);
    if (res.success) return { ok: true };
    const errors = res.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return { ok: false, errors };
  };
}

function addTags(items: NormalizedDataItem[], extra: (it: NormalizedDataItem) => string[] | undefined) {
  return items.map(it => {
    const tags = extra(it) || [];
    return { ...it, tags: Array.from(new Set([...(it.tags || []), ...tags])) };
  });
}

const plugins: Record<string, NormalizerPlugin> = {
  normalizeNOAAAlert: {
    id: 'normalizeNOAAAlert',
    schema: NOAA_SCHEMA,
    validate: defaultValidate(NOAA_SCHEMA),
    normalize: (data: any) => DataNormalizer.normalizeNOAAAlert(data),
    enrich: items => addTags(items, it => {
      const sev = (it.metadata as any)?.severity;
      const event = (it.metadata as any)?.event;
      const tags: string[] = [];
      if (sev) tags.push(`severity:${String(sev).toLowerCase()}`);
      if (event) tags.push(`event:${String(event).toLowerCase()}`);
      return tags;
    }),
    classify: items => ClassifierService.apply(items)
  },
  normalizeUSGSEarthquakes: {
    id: 'normalizeUSGSEarthquakes',
    schema: USGS_SCHEMA,
    validate: defaultValidate(USGS_SCHEMA),
    normalize: (data: any) => DataNormalizer.normalizeUSGSEarthquakes(data),
    enrich: items => addTags(items, it => {
      const mag = (it.metadata as any)?.magnitude;
      const place = (it.metadata as any)?.location;
      const tags: string[] = [];
      if (typeof mag === 'number') tags.push(`m:${mag.toFixed(1)}`);
      if (place) tags.push(`place:${String(place).toLowerCase()}`);
      return tags;
    }),
    classify: items => ClassifierService.apply(items)
  },
  normalizeGitHubSecurityAdvisories: {
    id: 'normalizeGitHubSecurityAdvisories',
    schema: GITHUB_SCHEMA,
    validate: defaultValidate(GITHUB_SCHEMA),
    normalize: (data: any) => DataNormalizer.normalizeGitHubSecurityAdvisories(data),
    enrich: items => addTags(items, it => {
      const cve = (it.metadata as any)?.cveId;
      const tags: string[] = [];
      if (cve) tags.push('cve');
      return tags;
    }),
    classify: items => ClassifierService.apply(items)
  },
  normalizeRedditPosts: {
    id: 'normalizeRedditPosts',
    schema: REDDIT_SCHEMA,
    validate: defaultValidate(REDDIT_SCHEMA),
    normalize: (data: any) => DataNormalizer.normalizeRedditPosts(data, 'unknown'),
    classify: items => ClassifierService.apply(items)
  },
  normalizeHackerNewsItem: {
    id: 'normalizeHackerNewsItem',
    schema: HN_ITEM_SCHEMA,
    validate: defaultValidate(HN_ITEM_SCHEMA),
    normalize: (data: any) => Array.isArray(data)
      ? (data as any[]).map(d => DataNormalizer.normalizeHackerNewsItem(d))
      : [DataNormalizer.normalizeHackerNewsItem(data)],
    classify: items => ClassifierService.apply(items)
  },
  normalizeCoinGeckoData: {
    id: 'normalizeCoinGeckoData',
    schema: COINGECKO_SCHEMA,
    validate: defaultValidate(COINGECKO_SCHEMA),
    normalize: (data: any) => DataNormalizer.normalizeCoinGeckoData(data),
    classify: items => ClassifierService.apply(items)
  }
};

export const normalizerRegistry = {
  get(id: string): NormalizerPlugin | undefined {
    return plugins[id];
  }
};
