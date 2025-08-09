import { NormalizedDataItem } from '../types/ModernAPITypes';

export interface MarqueeItem {
  id: string;
  sourceId: string;
  text: string;
  category?: string;
  importance: 1|2|3|4;
  timestamp: Date;
  link?: string;
}

interface MarqueeProjector {
  canProject: (items: NormalizedDataItem[], sourceId: string) => boolean;
  project: (items: NormalizedDataItem[], sourceId: string) => MarqueeItem[];
}

const projectors: MarqueeProjector[] = [];

// Utility helpers
const truncate = (t: string | undefined | null, max = 70) => {
  if (!t) return '';
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
};
const normPriority = (p: any): 1|2|3|4 => {
  switch (String(p).toLowerCase()) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    default: return 1;
  }
};

// Crypto / Price projector (CoinGecko etc.)
projectors.push({
  canProject: (items) => items.some(i => (i.category?.toLowerCase().includes('crypto')) || (i.tags?.some(t => t.toLowerCase().includes('crypto'))) || !!i.metadata?.symbol),
  project: (items, sourceId) => {
    return items.filter(i => i.metadata && i.metadata.symbol && (i.metadata.price || i.metadata.current_price)).map(i => {
      const md: any = i.metadata || {};
      const symbol = String(md.symbol).toUpperCase();
      const priceRaw = md.price ?? md.current_price;
      const price = typeof priceRaw === 'number' ? priceRaw : parseFloat(priceRaw);
      const changeSource = (typeof md.change24h === 'number') ? md.change24h : (typeof md.price_change_percentage_24h === 'number' ? md.price_change_percentage_24h : undefined);
      const change = typeof changeSource === 'number' ? changeSource : undefined;
      const changeStr = change !== undefined && Math.abs(change) >= 0.3 ? ` (${change>0?'+':''}${change.toFixed(1)}%)` : '';
      return {
        id: `price-${symbol}`,
        sourceId,
        text: `${symbol} $${price < 1 ? price.toFixed(4) : price.toLocaleString(undefined,{maximumFractionDigits:2})}${changeStr}`,
        category: 'PRICE',
        importance: (change !== undefined && Math.abs(change) >= 3) ? 3 : 2,
        timestamp: i.publishedAt || new Date(),
        link: i.url
      } as MarqueeItem;
    });
  }
});

// NOAA Alert projector (enhanced detail)
projectors.push({
  canProject: (items, sourceId) => sourceId.toLowerCase().includes('noaa') || items.some(i => i.category?.toLowerCase().includes('weather') || /advisory|warning|watch|statement/i.test(i.title)),
  project: (items, sourceId) => items.filter(i => i.metadata?.event || /advisory|warning|watch|statement/i.test(i.title)).map(i => {
    const md: any = i.metadata || {};
    const event = (md.event || i.title.split(':')[0] || 'Weather').trim();
    const regionRaw = (md.area || md.areaDesc || md.region || '').split(';')[0].trim();
    const region = regionRaw.split(',').slice(0,2).join(', '); // keep up to two sections
    const until = md.ends || md.expires;
    let timePart = '';
    if (until) {
      const dt = new Date(until);
      if (!isNaN(dt.getTime())) {
        const h = dt.getHours().toString().padStart(2,'0');
        const m = dt.getMinutes().toString().padStart(2,'0');
        const diffMs = dt.getTime() - Date.now();
        if (diffMs > 0) {
          const diffH = Math.floor(diffMs/3600000);
          const diffM = Math.floor((diffMs%3600000)/60000);
          const rel = diffH > 0 ? `${diffH}h${diffM>0?`${diffM}m`:''}` : `${diffM}m`;
          timePart = ` until ${h}:${m} (${rel})`;
        } else {
          timePart = ` until ${h}:${m}`;
        }
      }
    }
    const snippetSource = (md.instruction || md.description || i.summary || '').replace(/\s+/g,' ').trim();
    const snippet = snippetSource.split(/\.(\s|$)/)[0].slice(0,60);
    return {
      id: i.id || `alert-${event}-${region}`,
      sourceId,
      text: `${event}${region?` (${region})`:''}${snippet?` – ${snippet}`:''}${timePart}`,
      category: 'ALERT',
      importance: normPriority(i.priority),
      timestamp: i.publishedAt || new Date(),
      link: i.url
    } as MarqueeItem;
  })
});

// Earthquake / USGS projector
projectors.push({
  canProject: (items) => items.some(i => i.category?.toLowerCase().includes('earthquake') || i.tags?.includes('earthquake')),
  project: (items, sourceId) => items.filter(i => i.metadata?.magnitude !== undefined).map(i => {
    const md: any = i.metadata || {};
    const mag = md.magnitude;
    const placeRaw = (md.place || i.title || '');
    const place = truncate(placeRaw.replace(/ of /i,' '), 40);
    return {
      id: i.id || `quake-${mag}-${place}`,
      sourceId,
      text: `M${Number(mag).toFixed(1)} • ${place}`,
      category: 'QUAKE',
      importance: (mag >= 6 ? 4 : mag >=5 ? 3 : 2),
      timestamp: i.publishedAt,
      link: i.url
    } as MarqueeItem;
  })
});

// CVE / Security Advisory projector
projectors.push({
  canProject: (items) => items.some(i => /cve-/i.test(i.title) || i.tags?.some(t => t.toLowerCase().startsWith('cve'))),
  project: (items, sourceId) => items.filter(i => /cve-/i.test(i.title) || i.metadata?.cveId).map(i => {
    const cve = (i.metadata?.cveId || (i.title.match(/CVE-\d{4}-\d+/i)||[])[0] || truncate(i.title,20)).toUpperCase();
    const severity = (i.metadata?.severity || i.priority || 'low').toString().toUpperCase();
    const pkg = i.metadata?.package || i.tags?.find(t=>!/cve/i.test(t)) || '';
    return {
      id: i.id || cve,
      sourceId,
      text: `${cve} ${severity}${pkg?` (${pkg})`:''}`,
      category: 'CVE',
      importance: normPriority(severity),
      timestamp: i.publishedAt,
      link: i.url
    } as MarqueeItem;
  })
});

// Generic / News fallback
projectors.push({
  canProject: () => true,
  project: (items, sourceId) => items.map(i => ({
    id: i.id,
    sourceId,
    text: truncate(i.title) || '[untitled]',
    category: (i.category || 'GENERIC').toUpperCase(),
    importance: normPriority(i.priority),
    timestamp: i.publishedAt,
    link: i.url
  }))
});

class MarqueeProjectionService {
  private store: Map<string, MarqueeItem> = new Map();
  private listeners: Set<() => void> = new Set();
  private maxItems = 250;
  private retentionMs = 45 * 60 * 1000;

  /** Test-only helper to clear state */
  _testReset() { this.store.clear(); this.emit(); }

  /** Test helper: directly add marquee items */
  _testDirectAdd(items: MarqueeItem[]) {
    items.forEach(item => {
      if (!(item.timestamp instanceof Date)) item.timestamp = new Date();
      this.store.set(this.logicalKey(item), item);
    });
    this.emit();
  }

  subscribe(cb: () => void) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
  getItems(): MarqueeItem[] {
    const now = Date.now();
    const arr = Array.from(this.store.values()).filter(i => {
      // Coerce timestamp into Date if needed
      if (!(i.timestamp instanceof Date)) {
        // attempt parse if string/number else fallback to now
        // @ts-ignore mutate in place
        i.timestamp = typeof (i as any).timestamp === 'string' || typeof (i as any).timestamp === 'number'
          ? new Date((i as any).timestamp)
          : new Date();
      }
      return (now - (i.timestamp as Date).getTime()) < this.retentionMs;
    });
    return arr.sort((a,b)=> b.importance - a.importance || (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime() || a.text.localeCompare(b.text));
  }

  ingest(sourceId: string, normalizedItems: NormalizedDataItem[]) {
    if (!normalizedItems || normalizedItems.length === 0) return;
    const applicable = projectors.find(p => p.canProject(normalizedItems, sourceId)) || projectors[projectors.length-1];
    const projected = applicable.project(normalizedItems, sourceId);
    projected.forEach(item => {
      if (!(item.timestamp instanceof Date)) {
        item.timestamp = item.timestamp ? new Date(item.timestamp) : new Date();
      }
      const logicalKey = this.logicalKey(item);
      const existing = this.store.get(logicalKey);
      if (!existing || existing.text !== item.text || (existing.timestamp as Date) < (item.timestamp as Date)) {
        this.store.set(logicalKey, item);
      }
    });
    // Trim
    if (this.store.size > this.maxItems) {
      const items = this.getItems();
      items.slice(this.maxItems).forEach(i => this.store.delete(this.logicalKey(i))); // delete overflow
    }
    this.emit();
  }

  private logicalKey(item: MarqueeItem) {
    if (item.category === 'PRICE') return item.id; // symbol-based id already unique
    if (item.category === 'ALERT') return item.id;
    if (item.category === 'QUAKE') return item.id;
    if (item.category === 'CVE') return item.id;
    return item.id;
  }

  private emit() { this.listeners.forEach(cb => cb()); }
}

export const marqueeProjectionService = new MarqueeProjectionService();
