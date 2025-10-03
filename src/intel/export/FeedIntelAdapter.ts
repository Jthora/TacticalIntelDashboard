// FeedIntelAdapter.ts
// Implements mapping, validation, serialization, caching, and export helpers
// for converting current Feed model objects into .intel file contents.

import { Feed } from '../../models/Feed';
import { IntelExportRecord, IntelValidationIssue, IntelValidationResult } from './IntelExportTypes';
import SHA256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

// Priority mapping table
const PRIORITY_MAP: Record<string, IntelExportRecord['priority']> = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Validation constants
const MAX_TITLE_LENGTH = 300;
const SUMMARY_MAX = 280;
const STORAGE_KEY_PREFIX = 'intel_export_cache:'; // per record
const STORAGE_INDEX_KEY = 'intel_export_cache_index'; // JSON array of ids

// Utility: safe JSON parse
function safeJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

// Derive source from link if not set
function deriveSource(feed: Feed): string {
  if (feed.source && feed.source.trim()) return feed.source.trim().toUpperCase();
  try {
    const host = new URL(feed.link).hostname.replace(/^www\./, '');
    return host.split('.')[0].toUpperCase();
  } catch {
    return 'UNKNOWN';
  }
}

// Normalize tags/categories
function normalizeTags(feed: Feed): string[] | undefined {
  const combined = [
    ...(feed.tags || []),
    ...(feed.categories || [])
  ].filter(Boolean).map(t => (t || '').toLowerCase().trim()).filter(Boolean);
  if (!combined.length) return undefined;
  const set = Array.from(new Set(combined));
  set.sort();
  return set;
}

// Extract summary
function buildSummary(feed: Feed): string | undefined {
  const base = feed.description || feed.content || '';
  if (!base) return undefined;
  const plain = base.replace(/<[^>]+>/g, '');
  if (plain.length <= SUMMARY_MAX) return plain;
  return plain.substring(0, SUMMARY_MAX).trim() + '…';
}

// Body selection
function buildBody(feed: Feed): string {
  const body = feed.content || feed.description || '';
  return body.endsWith('\n') ? body : body + '\n';
}

// Priority normalization
function normalizePriority(feed: Feed): IntelExportRecord['priority'] {
  if (!feed.priority) return 'medium';
  const mapped = PRIORITY_MAP[feed.priority.toUpperCase()];
  return mapped || 'medium';
}

// Created timestamp
function determineCreated(feed: Feed): string {
  const ts = feed.timestamp || feed.pubDate;
  if (!ts) return new Date().toISOString();
  try { return new Date(ts as any).toISOString(); } catch { return new Date().toISOString(); }
}

function determineUpdated(feed: Feed, created: string): string | undefined {
  const updated = feed.pubDate && feed.pubDate !== created ? feed.pubDate : undefined;
  if (!updated) return undefined;
  try {
    const iso = new Date(updated).toISOString();
    return iso === created ? undefined : iso;
  } catch { return undefined; }
}

// Mapping function
export function mapFeedToIntel(feed: Feed): IntelExportRecord {
  const created = determineCreated(feed);
  const updated = determineUpdated(feed, created);
  const record: IntelExportRecord = {
    id: String(feed.id || feed.link || Date.now()),
    title: (feed.title || 'Untitled').trim().slice(0, MAX_TITLE_LENGTH),
    created,
    classification: 'UNCLASS',
    priority: normalizePriority(feed),
    sources: [deriveSource(feed)],
    tags: normalizeTags(feed),
    location: undefined,
    summary: buildSummary(feed),
    body: buildBody(feed)
  };
  if (updated) (record as any).updated = updated; // assign conditionally
  return record;
}

export function mapFeedsToIntel(feeds: Feed[]): IntelExportRecord[] {
  return feeds.map(mapFeedToIntel);
}

// Validation
export function validateIntel(record: IntelExportRecord): IntelValidationResult {
  const issues: IntelValidationIssue[] = [];
  if (!record.id) issues.push({ field: 'id', message: 'Missing id', severity: 'error' });
  if (!record.title) issues.push({ field: 'title', message: 'Missing title', severity: 'error' });
  if (record.title.length > MAX_TITLE_LENGTH) issues.push({ field: 'title', message: `Title exceeds ${MAX_TITLE_LENGTH} chars`, severity: 'warning' });
  if (!record.created || isNaN(Date.parse(record.created))) issues.push({ field: 'created', message: 'Invalid created timestamp', severity: 'error' });
  if (!record.priority) issues.push({ field: 'priority', message: 'Missing priority', severity: 'error' });
  if (!record.sources?.length) issues.push({ field: 'sources', message: 'At least one source required', severity: 'error' });
  if (!record.body.trim()) issues.push({ field: 'body', message: 'Empty body', severity: 'warning' });
  return { valid: !issues.some(i => i.severity === 'error'), issues };
}

// Serialization (.intel YAML frontmatter + markdown body)
export function serializeIntel(record: IntelExportRecord): string {
  const order: (keyof IntelExportRecord)[] = ['id','title','created','updated','classification','priority','sources','tags','location','summary','confidence'];
  const lines: string[] = ['---'];
  for (const key of order) {
    const value = (record as any)[key];
    if (value === undefined || value === null || (Array.isArray(value) && !value.length)) continue;
    let serialized: string;
    if (Array.isArray(value)) {
      serialized = '[' + value.map(v => JSON.stringify(v)).join(', ') + ']';
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      serialized = JSON.stringify(value);
    } else {
      const str = String(value);
      serialized = /[:#\n]|^\s|\s$/.test(str) ? JSON.stringify(str) : str;
    }
    lines.push(`${key}: ${serialized}`);
  }
  lines.push('---','');
  lines.push(record.body);
  return lines.join('\n');
}

// Browser download (single record)
export function downloadIntel(record: IntelExportRecord): void {
  const { valid } = validateIntel(record);
  if (!valid) {
    // Proceed anyway; could optionally block
  }
  const content = serializeIntel(record);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${record.id}.intel`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}

// LocalStorage Cache API
function loadIndex(): string[] { return safeJSON<string[]>(localStorage.getItem(STORAGE_INDEX_KEY), []); }
function saveIndex(index: string[]) { localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index)); }

export function cacheIntel(record: IntelExportRecord): void {
  const key = STORAGE_KEY_PREFIX + record.id;
  localStorage.setItem(key, JSON.stringify(record));
  const index = loadIndex();
  if (!index.includes(record.id)) { index.push(record.id); saveIndex(index); }
}

export function getCachedIntel(id: string): IntelExportRecord | null {
  const raw = localStorage.getItem(STORAGE_KEY_PREFIX + id);
  if (!raw) return null;
  return safeJSON<IntelExportRecord>(raw, null as any);
}

export function listCachedIntel(): IntelExportRecord[] {
  return loadIndex().map(id => getCachedIntel(id)).filter(Boolean) as IntelExportRecord[];
}

export function removeCachedIntel(id: string): void {
  localStorage.removeItem(STORAGE_KEY_PREFIX + id);
  saveIndex(loadIndex().filter(x => x !== id));
}

export function clearIntelCache(): void {
  for (const id of loadIndex()) localStorage.removeItem(STORAGE_KEY_PREFIX + id);
  saveIndex([]);
}

// Convenience: map, validate, cache, and download
export function exportFeedAsIntel(feed: Feed, opts: { cache?: boolean } = { cache: true }) {
  const record = mapFeedToIntel(feed);
  if (opts.cache) cacheIntel(record);
  downloadIntel(record);
  return record;
}

export function exportFeedsAsIntel(feeds: Feed[], opts: { cache?: boolean } = { cache: true }): IntelExportRecord[] {
  return feeds.map(f => exportFeedAsIntel(f, opts));
}

// Future: batch zip export (Phase 2)
// export async function downloadIntelBatchZip(records: IntelExportRecord[]): Promise<Blob> { /* impl later */ throw new Error('Not implemented'); }

// Enhanced export result type
export interface IntelExportResult {
  record: IntelExportRecord;
  validation: IntelValidationResult;
  serialized: string | null;
  errors: string[];
  warnings: string[];
  downloaded: boolean;
  cached: boolean;
}

// Compute SHA-256 integrity hash of the deterministic serialization body portion
export function computeIntelIntegrity(record: IntelExportRecord, opts: { deterministic?: boolean } = {}): string {
  const deterministic = opts.deterministic !== false; // default true
  const base = deterministic ? serializeIntelDeterministic(record) : serializeIntel(record);
  // Exclude trailing newline differences for hash consistency
  const normalized = base.endsWith('\n') ? base : base + '\n';
  // Use browser SubtleCrypto if available, else node crypto
  if (typeof window !== 'undefined' && (window as any).crypto?.subtle) {
    // Synchronous wrapper not possible; in browser prefer async path elsewhere
  }
  const hash = SHA256(normalized);
  return hash.toString(Hex);
}

// Extend deterministic serializer to optionally inject schemaVersion + integrityHash if provided
export function serializeIntelDeterministic(record: IntelExportRecord & { schemaVersion?: string; integrityHash?: string }): string {
  const order: (keyof IntelExportRecord | 'schemaVersion' | 'integrityHash')[] = ['id','title','created','updated','classification','priority','sources','tags','location','summary','confidence','schemaVersion','integrityHash'];
  const lines: string[] = ['---'];
  for (const key of order) {
    const value = (record as any)[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    let serialized: string;
    if (Array.isArray(value)) serialized = '[' + value.map(v => JSON.stringify(v)).join(', ') + ']';
    else if (typeof value === 'object') serialized = JSON.stringify(value);
    else serialized = JSON.stringify(value); // always quote scalars
    lines.push(`${key}: ${serialized}`);
  }
  lines.push('---','');
  lines.push(record.body);
  return lines.join('\n');
}

// Internal helper to check large body
function checkBodySize(body: string, warnings: string[]) {
  const bytes = new Blob([body]).size; // approximate
  if (bytes > 200 * 1024) warnings.push(`Body size ${bytes} bytes exceeds 200KB threshold`);
}

// Robust export function
export function robustExportFeed(feed: Feed, opts: { cache?: boolean, deterministic?: boolean } = { cache: true, deterministic: true }): IntelExportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  // Detect original malformed timestamp before mapping normalization replaces it
  if (feed.timestamp && isNaN(Date.parse(feed.timestamp as any))) {
    warnings.push('Created timestamp parse failure (original)');
  }
  let downloaded = false;
  let cached = false;
  const record = mapFeedToIntel(feed);
  const validation = validateIntel(record);
  if (isNaN(Date.parse(record.created))) warnings.push('Created timestamp parse failure');
  if (!validation.valid) warnings.push(...validation.issues.filter(i=>i.severity==='error').map(i=>`Validation error: ${i.field} - ${i.message}`));
  warnings.push(...validation.issues.filter(i=>i.severity==='warning').map(i=>`Validation warning: ${i.field} - ${i.message}`));
  // Additional rules
  if (record.tags && record.tags.length > 25) warnings.push(`Tag count ${record.tags.length} exceeds 25`);
  checkBodySize(record.body, warnings);

  // Serialize
  let serialized: string | null = null;
  try {
    serialized = opts.deterministic ? serializeIntelDeterministic(record) : serializeIntel(record);
  } catch (e:any) {
    errors.push(`Serialization failed: ${e?.message || e}`);
    serialized = null;
  }

  // Cache
  if (opts.cache && serialized) {
    try { cacheIntel(record); cached = true; } catch (e:any) { warnings.push(`Cache failed: ${e?.message || e}`); }
  }

  // Download (guard for DOM)
  if (serialized) {
    try {
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        downloadIntel(record);
        downloaded = true;
      } else {
        warnings.push('Download skipped: DOM not available');
      }
    } catch (e:any) {
      errors.push(`Download failed: ${e?.message || e}`);
    }
  }

  return { record, validation, serialized, errors, warnings, downloaded, cached };
}

// Deterministic batch export returning aggregate results
export function robustExportFeeds(feeds: Feed[], opts: { cache?: boolean, deterministic?: boolean } = { cache: true, deterministic: true }): IntelExportResult[] {
  return feeds.map(f => robustExportFeed(f, opts));
}
