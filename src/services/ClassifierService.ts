/*
 * ClassifierService: lightweight rule-based tagging and priority adjustment
 * Integrates with existing NormalizedDataItem to enrich tags and categories.
 */

import { NormalizedDataItem } from '../types/ModernAPITypes';

type Rule = (item: NormalizedDataItem) => Partial<NormalizedDataItem> | null;

const rules: Rule[] = [
  // CVE detection
  (it) => {
    const text = `${it.title} ${it.summary}`.toLowerCase();
    if (/cve-\d{4}-\d{4,7}/i.test(text) || it.tags?.includes('cve')) {
      return { tags: Array.from(new Set([...(it.tags || []), 'cve'])), category: it.category || 'security' };
    }
    return null;
  },
  // NOAA severe events
  (it) => {
    if (it.source.includes('NOAA') && it.tags?.some(t => t.startsWith('severity:'))) {
      const sevTag = it.tags.find(t => t.startsWith('severity:')) || '';
      if (sevTag.includes('extreme') || sevTag.includes('severe')) {
        return { priority: it.priority === 'high' ? 'critical' : 'high' } as Partial<NormalizedDataItem>;
      }
    }
    return null;
  },
  // USGS magnitude boost
  (it) => {
    if (it.source.includes('USGS') && (it.metadata as any)?.magnitude >= 6.0) {
      return { priority: 'high' };
    }
    return null;
  },
  // Social momentum (Reddit)
  (it) => {
    if (it.source.startsWith('Reddit') && (it.metadata as any)?.score >= 1000) {
      return { priority: 'high', tags: Array.from(new Set([...(it.tags || []), 'trending'])) };
    }
    return null;
  }
];

export const ClassifierService = {
  apply(items: NormalizedDataItem[]): NormalizedDataItem[] {
    return items.map(it => {
      let merged: NormalizedDataItem = { ...it };
      for (const rule of rules) {
        const res = rule(merged);
        if (res) {
          merged = { ...merged, ...res, tags: Array.from(new Set([...(merged.tags || []), ...((res as any).tags || [])])) };
        }
      }
      return merged;
    });
  }
};
