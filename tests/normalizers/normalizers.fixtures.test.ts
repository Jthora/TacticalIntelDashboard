import fs from 'fs';
import path from 'path';
import { describe, it, expect } from '@jest/globals';

import { DataNormalizer } from '../../src/services/DataNormalizer';
import { normalizerRegistry } from '../../src/services/NormalizerRegistry';

function readJson(p: string): any {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function latestSample(dir: string): string | null {
  const abs = path.resolve(process.cwd(), 'samples', dir);
  if (!fs.existsSync(abs)) return null;
  const files = fs.readdirSync(abs).filter(f => f.endsWith('.json') && !f.includes('-schema'));
  if (!files.length) return null;
  files.sort();
  return path.join(abs, files[files.length - 1]);
}

function assertItems(items: any[]) {
  expect(Array.isArray(items)).toBe(true);
  for (const it of items) {
    expect(typeof it.id).toBe('string');
    expect(typeof it.title).toBe('string');
    expect(it.title.length).toBeGreaterThan(0);
    expect(typeof it.url).toBe('string');
    expect(it.publishedAt instanceof Date).toBe(true);
    expect(['low', 'medium', 'high', 'critical']).toContain(it.priority);
    expect(Array.isArray(it.tags)).toBe(true);
    expect(typeof it.category).toBe('string');
  }
}

describe('Normalizer fixtures (from samples/)', () => {
  const cases = [
    { dir: 'noaa', plugin: 'normalizeNOAAAlert' },
    { dir: 'usgs', plugin: 'normalizeUSGSEarthquakes' },
    { dir: 'coingecko', plugin: 'normalizeCoinGeckoData' },
    { dir: 'reddit', plugin: 'normalizeRedditPosts' },
    { dir: 'hn', plugin: 'normalizeHackerNewsItem' },
    { dir: 'github', plugin: 'normalizeGitHubSecurityAdvisories' }
  ];

  for (const c of cases) {
    it(`normalizes latest ${c.dir} sample`, () => {
      const file = latestSample(c.dir);
      if (!file) {
        console.warn(`No sample file for ${c.dir}, skipping test.`);
        return;
      }
      const json = readJson(file);

      const plugin = normalizerRegistry.get(c.plugin);
      let items: any[] = [];
      if (plugin) {
        const validation = plugin.validate ? plugin.validate(json) : { ok: true };
        if (!validation.ok) console.warn(`Validation warnings for ${c.dir}:`, validation.errors?.slice(0, 3));
        items = plugin.normalize(json);
        if (plugin.enrich) items = plugin.enrich(items);
        if (plugin.classify) items = plugin.classify(items);
      } else {
        // Fallback to direct normalizer mapping for coverage
        const map: Record<string, Function> = {
          normalizeNOAAAlert: DataNormalizer.normalizeNOAAAlert,
          normalizeUSGSEarthquakes: DataNormalizer.normalizeUSGSEarthquakes,
          normalizeCoinGeckoData: DataNormalizer.normalizeCoinGeckoData,
          normalizeRedditPosts: (d: any) => DataNormalizer.normalizeRedditPosts(d, 'unknown'),
          normalizeHackerNewsItem: (d: any) => Array.isArray(d) ? d.map((x: any) => DataNormalizer.normalizeHackerNewsItem(x)) : [DataNormalizer.normalizeHackerNewsItem(d)],
          normalizeGitHubSecurityAdvisories: DataNormalizer.normalizeGitHubSecurityAdvisories
        };
        items = map[c.plugin](json);
      }

      // Only assert when the API returned data
      if (items.length > 0) assertItems(items);
    });
  }
});
