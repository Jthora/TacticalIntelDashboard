#!/usr/bin/env node
/*
  Capture API Samples
  - Fetch raw payloads from key endpoints (NOAA, USGS, CoinGecko, Reddit, HN, GitHub)
  - Save raw JSON and lightweight schema summaries to ./samples
  - Helps improve/validate normalizers
*/

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_OUTDIR = path.resolve(process.cwd(), 'samples');

const SOURCES = {
  noaa: {
    name: 'NOAA Alerts',
    fetch: async () => fetchJSON(
      'https://api.weather.gov/alerts/active?status=actual&message_type=alert',
      { headers: { Accept: 'application/geo+json', 'User-Agent': 'TacticalIntelDashboard/1.0' } }
    )
  },
  usgs: {
    name: 'USGS Earthquakes All Day',
    fetch: async () => fetchJSON(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
      { headers: { Accept: 'application/json', 'User-Agent': 'TacticalIntelDashboard/1.0' } }
    )
  },
  coingecko: {
    name: 'CoinGecko Markets',
    fetch: async () => fetchJSON(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false',
      { headers: { Accept: 'application/json', 'User-Agent': 'TacticalIntelDashboard/1.0' } }
    )
  },
  reddit: {
    name: 'Reddit WorldNews Top',
    fetch: async () => fetchJSON(
      'https://www.reddit.com/r/worldnews/top.json?limit=10',
      { headers: { Accept: 'application/json', 'User-Agent': 'TacticalIntelDashboard/1.0' } }
    )
  },
  hn: {
    name: 'Hacker News Top Items',
    fetch: async () => {
      const ids = await fetchJSON('https://hacker-news.firebaseio.com/v0/topstories.json');
      const first = Array.isArray(ids) ? ids.slice(0, 20) : [];
      const items = await Promise.allSettled(
        first.map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))
      );
      return {
        ids: first,
        items: items.filter(r => r.status === 'fulfilled').map(r => r.value)
      };
    }
  },
  github: {
    name: 'GitHub Security Advisories',
    fetch: async () => fetchJSON(
      'https://api.github.com/advisories?per_page=10',
      { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'TacticalIntelDashboard/1.0' } }
    )
  }
};

function getArg(flag, fallback = undefined) {
  const idx = process.argv.findIndex(a => a === flag || a.startsWith(flag + '='));
  if (idx === -1) return fallback;
  const eq = process.argv[idx].split('=');
  if (eq.length > 1) return eq.slice(1).join('=');
  const next = process.argv[idx + 1];
  if (next && !next.startsWith('--')) return next;
  return true;
}

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function ts() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function typeOf(val) {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
}

function summarize(value, opts = { depth: 0, maxDepth: 3 }) {
  const { depth, maxDepth } = opts;
  const t = typeOf(value);
  if (depth >= maxDepth) return t;

  if (t === 'array') {
    const arr = value;
    const sample = arr.slice(0, 3);
    return {
      type: 'array',
      length: arr.length,
      items: sample.map(v => summarize(v, { depth: depth + 1, maxDepth }))
    };
  }

  if (t === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = summarize(v, { depth: depth + 1, maxDepth });
    }
    return out;
  }

  return t;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeFileSafe(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, data);
}

async function saveOutput(name, payload) {
  const stamp = ts();
  const base = path.resolve(DEFAULT_OUTDIR, name);
  const rawPath = path.join(base, `${name}-${stamp}.json`);
  const schemaPath = path.join(base, `${name}-${stamp}-schema.json`);

  await writeFileSafe(rawPath, JSON.stringify(payload, null, 2));
  const schema = summarize(payload, { depth: 0, maxDepth: 3 });
  await writeFileSafe(schemaPath, JSON.stringify(schema, null, 2));

  return { rawPath, schemaPath };
}

async function run() {
  const sourceArg = (getArg('--source', 'all') || 'all').toString();
  const outDirArg = getArg('--outdir', DEFAULT_OUTDIR);
  if (outDirArg && outDirArg !== DEFAULT_OUTDIR) {
    // Overwrite default if user provides explicit path
    // still create nested dirs per source
  }

  const selected = sourceArg === 'all' ? Object.keys(SOURCES) : sourceArg.split(',').map(s => s.trim());

  for (const key of selected) {
    const entry = SOURCES[key];
    if (!entry) {
      console.error(`[skip] Unknown source key: ${key}`);
      continue;
    }

    try {
      console.log(`[fetch] ${entry.name} (${key})...`);
      const payload = await entry.fetch();
      const out = await saveOutput(key, payload);
      console.log(`[saved] ${key} -> ${path.relative(process.cwd(), out.rawPath)} | schema -> ${path.relative(process.cwd(), out.schemaPath)}`);
    } catch (err) {
      console.error(`[error] ${key}:`, err?.message || err);
    }
  }

  console.log('Done.');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
