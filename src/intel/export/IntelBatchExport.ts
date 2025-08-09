import JSZip from 'jszip';
import { Feed } from '../../models/Feed';
import { robustExportFeed } from './FeedIntelAdapter';

// Build individual deterministic .intel documents for provided feeds and bundle into a zip
export async function exportFeedsAsIntelZip(feeds: Feed[], opts: { limit?: number } = {}): Promise<{ fileName: string, count: number }> {
  const limit = opts.limit ?? 200;
  const selected = feeds.slice(0, limit);
  const zip = new JSZip();
  const docs: { id: string; serialized: string }[] = [];
  for (const feed of selected) {
    const result = robustExportFeed(feed, { cache: false, deterministic: true });
    if (result.serialized) {
      docs.push({ id: result.record.id, serialized: result.serialized });
      zip.file(`${result.record.id}.intel`, result.serialized);
    }
  }
  const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const fileName = `intel-articles-${ts}.zip`;
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerBlobDownload(blob, fileName);
  return { fileName, count: docs.length };
}

// Build a single Intel Report that embeds metadata + every article .intel payload inside JSON in body.
export function exportIntelReport(feeds: Feed[], opts: { limit?: number } = {}): { fileName: string, serialized: string } {
  const limit = opts.limit ?? 200;
  const selected = feeds.slice(0, limit);
  const articleExports = selected.map(f => robustExportFeed(f, { cache: false, deterministic: true })).filter(r => !!r.serialized);
  const ts = new Date().toISOString();
  const reportId = `intel-report-${ts.replace(/[-:TZ.]/g, '').slice(0,14)}`;

  // Build frontmatter
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
  // Body with JSON payload
  const payload = articleExports.map(e => ({
    id: e.record.id,
    title: e.record.title,
    created: e.record.created,
    priority: e.record.priority,
    sources: e.record.sources,
    tags: e.record.tags,
    summary: e.record.summary,
    intelFile: `${e.record.id}.intel`,
    intelContent: e.serialized, // full serialized doc
  }));
  lines.push('# Intelligence Batch Report');
  lines.push('');
  lines.push(`Contains ${articleExports.length} articles.`);
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(payload, null, 2));
  lines.push('```');
  const serialized = lines.join('\n');
  const fileName = `${reportId}.intelreport`;
  const blob = new Blob([serialized], { type: 'text/markdown;charset=utf-8' });
  triggerBlobDownload(blob, fileName);
  return { fileName, serialized };
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
