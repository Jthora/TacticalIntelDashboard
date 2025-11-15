import { DataNormalizer } from '../src/services/DataNormalizer.ts';

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function main() {
  const krebsUrl = 'https://rss2json.vercel.app/api?url=' + encodeURIComponent('https://krebsonsecurity.com/feed/');
  const data = await fetchJson(krebsUrl);
  const normalized = DataNormalizer.normalizeCyberSecurityRSS(data);
  console.log('Normalized sample:', normalized.slice(0, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
