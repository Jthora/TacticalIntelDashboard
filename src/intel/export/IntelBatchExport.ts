import JSZip from 'jszip';
import { Feed } from '../../models/Feed';
import { robustExportFeed } from './FeedIntelAdapter';

interface BatchWarning { type: string; message: string; }

// Build individual deterministic .intel documents for provided feeds and bundle into a zip
export async function exportFeedsAsIntelZip(feeds: Feed[], opts: { limit?: number } = {}): Promise<{ fileName: string, count: number, warnings: BatchWarning[], fileNames: string[] }> {
  const warnings: BatchWarning[] = [];
  const fileNames: string[] = [];
  const limit = opts.limit ?? 200;
  if (!Array.isArray(feeds) || feeds.length === 0) warnings.push({ type: 'empty', message: 'No feeds provided' });
  const selected = feeds.slice(0, limit);
  if (feeds.length > limit) warnings.push({ type: 'truncate', message: `Truncated from ${feeds.length} to ${limit}` });
  const zip = new JSZip();
  let count = 0;
  for (const feed of selected) {
    try {
      const result = robustExportFeed(feed, { cache: false, deterministic: true });
      if (result.serialized) {
        let baseName = `${result.record.id}.intel`;
        let name = baseName;
        let suffix = 2;
        while (zip.file(name)) { // collision
            name = `${result.record.id}-${suffix}.intel`;
            suffix++;
        }
        if (name !== baseName) warnings.push({ type: 'collision', message: `ID collision for ${result.record.id}, stored as ${name}` });
        zip.file(name, result.serialized);
        fileNames.push(name);
        count++;
      } else {
        warnings.push({ type: 'serialize', message: `Serialization failed for ${feed.id}` });
      }
    } catch (e:any) {
      warnings.push({ type: 'exception', message: `Exception for ${feed.id}: ${e?.message || e}` });
    }
  }
  if (count === 0) warnings.push({ type: 'emptyOutput', message: 'No .intel documents produced' });
  const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const fileName = `intel-articles-${ts}.zip`;
  try {
    const blob = await zip.generateAsync({ type: 'blob' });
    triggerBlobDownload(blob, fileName);
  } catch (e:any) {
    warnings.push({ type: 'zip', message: `Zip generation failed: ${e?.message || e}` });
  }
  return { fileName, count, warnings, fileNames };
}

// Generic builder for intel report style payload (shared with JSON export)
function buildIntelReportPayload(feeds: Feed[], limit: number) {
  const selected = feeds.slice(0, limit);
  const articleExports = selected.map(f => robustExportFeed(f, { cache: false, deterministic: true })).filter(r => !!r.serialized);
  return articleExports;
}

// Build a single Intel Report that embeds metadata + every article .intel payload inside JSON in body.
export function exportIntelReport(feeds: Feed[], opts: { limit?: number } = {}): { fileName: string, serialized: string, warnings: string[] } {
  const warnings: string[] = [];
  const limit = opts.limit ?? 200;
  if (!Array.isArray(feeds) || feeds.length === 0) warnings.push('No feeds provided');
  if (feeds.length > limit) warnings.push(`Truncated from ${feeds.length} to ${limit}`);
  const articleExports = buildIntelReportPayload(feeds, limit);
  const ts = new Date().toISOString();
  const reportId = `intel-report-${ts.replace(/[-:TZ.]/g, '').slice(0,14)}`;

  const frontmatter: Record<string, any> = {
    id: reportId,
    title: 'Intelligence Batch Report',
    created: ts,
    classification: 'UNCLASS',
    priority: 'medium',
    sources: Array.from(new Set(articleExports.flatMap(e => e.record.sources || []))).slice(0, 50),
    tags: dedupe(articleExports.flatMap(e => e.record.tags || [])).slice(0, 100),
    articleCount: articleExports.length,
  };
  const fmOrder = ['id','title','created','classification','priority','sources','tags','articleCount'];
  const lines: string[] = ['---'];
  for (const key of fmOrder) {
    const value = (frontmatter as any)[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) lines.push(`${key}: [` + value.map(v=>JSON.stringify(v)).join(', ') + ']');
    else lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push('---','');
  const payload = articleExports.map(e => ({
    id: e.record.id,
    title: e.record.title,
    created: e.record.created,
    priority: e.record.priority,
    sources: e.record.sources,
    tags: e.record.tags,
    summary: e.record.summary,
    intelFile: `${e.record.id}.intel`,
    intelContent: e.serialized,
  }));
  lines.push('# Intelligence Batch Report');
  lines.push('');
  lines.push(`Contains ${articleExports.length} articles.`);
  if (articleExports.length === 0) warnings.push('Report has no articles');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(payload, null, 2));
  lines.push('```');
  const serialized = lines.join('\n');
  const fileName = `${reportId}.intelreport`;
  try {
    const blob = new Blob([serialized], { type: 'text/markdown;charset=utf-8' });
    triggerBlobDownload(blob, fileName);
  } catch (e:any) {
    warnings.push(`Download failed: ${e?.message || e}`);
  }
  return { fileName, serialized, warnings };
}

// JSON export variant using same structure but outputting .json with pure JSON body (no frontmatter)
export function exportIntelReportJson(feeds: Feed[], opts: { limit?: number } = {}): { fileName: string, json: string, warnings: string[] } {
  const warnings: string[] = [];
  const limit = opts.limit ?? 200;
  if (!Array.isArray(feeds) || feeds.length === 0) warnings.push('No feeds provided');
  if (feeds.length > limit) warnings.push(`Truncated from ${feeds.length} to ${limit}`);
  const articleExports = buildIntelReportPayload(feeds, limit);
  const ts = new Date().toISOString();
  const payload = {
    id: `intel-report-json-${ts.replace(/[-:TZ.]/g, '').slice(0,14)}`,
    created: ts,
    articleCount: articleExports.length,
    articles: articleExports.map(e => ({
      id: e.record.id,
      title: e.record.title,
      created: e.record.created,
      priority: e.record.priority,
      sources: e.record.sources,
      tags: e.record.tags,
      summary: e.record.summary,
      intelContent: e.serialized
    }))
  };
  if (articleExports.length === 0) warnings.push('No articles in JSON export');
  const json = JSON.stringify(payload, null, 2);
  const fileName = payload.id + '.json';
  try {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    triggerBlobDownload(blob, fileName);
  } catch (e:any) {
    warnings.push(`Download failed: ${e?.message || e}`);
  }
  return { fileName, json, warnings };
}

function dedupe(list: string[]): string[] { return Array.from(new Set(list)); }

function triggerBlobDownload(blob: Blob, fileName: string) {
  if (typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },0);
}
