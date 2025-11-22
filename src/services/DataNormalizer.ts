/**
 * Data Normalization Service
 * Converts various API responses to unified NormalizedDataItem format
 */

import { 
  AlphaVantageNewsResponse,
  NASAAPODResponse, 
  NASADSNStatusResponse,
  NASADSNDish,
  NASADSNSignal,
  NOAAAlertResponse, 
  NormalizedDataItem, 
  RedditPostResponse
} from '../types/ModernAPITypes';

type RSSPriorityContext = {
  title: string;
  summary: string;
  categories: string[];
  item: any;
};

interface RSSNormalizationOptions {
  sourceFallback: string;
  category: string;
  baseTags?: string[];
  trustRating?: number;
  verificationStatus?: 'VERIFIED' | 'UNVERIFIED' | 'OFFICIAL';
  dataQuality?: number;
  priorityMapper?: (context: RSSPriorityContext) => 'low' | 'medium' | 'high' | 'critical';
  metadataEnricher?: (context: RSSPriorityContext) => Record<string, any>;
  additionalTags?: (context: RSSPriorityContext) => string[];
  transformTitle?: (title: string, rawItem: any) => string;
  transformSummary?: (summary: string, rawItem: any) => string;
  transformUrl?: (
    url: string,
    rawItem: any
  ) => string | { url: string; extraTags?: string[]; metadata?: Record<string, any> };
}

export class DataNormalizer {
  /**
   * NOAA Weather Alert Normalization
   */
  static normalizeNOAAAlert(response: NOAAAlertResponse): NormalizedDataItem[] {
    // Guard against unexpected shapes
    const features = Array.isArray((response as any)?.features) ? (response as any).features : [];
    if (features.length === 0) return [];

    const stripHTML = (html?: string): string => {
      if (!html) return '';
      return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    };

    return features.map((alert: any) => {
      const p = alert?.properties || {};
      const parameters = p.parameters || {};
      const nwsHeadline = Array.isArray(parameters.NWSheadline) ? parameters.NWSheadline[0] : parameters.NWSheadline;
      const title = p.headline || p.event || nwsHeadline || 'NOAA Alert';
      const desc = stripHTML(p.description) || stripHTML(p.instruction) || title;
      const url = p.web || p['@id'] || '';
      const publishedStr = p.sent || p.effective || p.onset || p.expires;
      let publishedAt = new Date();
      try {
        if (publishedStr) {
          const d = new Date(publishedStr);
          if (!isNaN(d.getTime())) publishedAt = d;
        }
      } catch {}

      return {
        id: alert.id || p.id || `${title}-${Date.now()}`,
        title,
        summary: (desc || title).substring(0, 500) + '...',
        url,
        publishedAt,
        source: 'NOAA Weather Service',
        category: 'weather-alert',
        tags: [p.event, p.severity, 'weather'].filter(Boolean) as string[],
        priority: this.mapSeverityToPriority(p.severity),
        trustRating: 95,
        verificationStatus: 'OFFICIAL',
        dataQuality: 98,
        metadata: {
          severity: p.severity,
          urgency: p.urgency,
          areas: p.areaDesc,
          event: p.event,
          parameters
        }
      };
    });
  }

  /**
   * NASA APOD Normalization
   */
  static normalizeNASAAPOD(response: NASAAPODResponse): NormalizedDataItem {
    return {
      id: `nasa-apod-${response.date}`,
      title: response.title,
      summary: response.explanation.substring(0, 500) + '...',
      url: response.url,
      publishedAt: new Date(response.date),
      source: 'NASA APOD',
      category: 'space',
      tags: ['astronomy', 'space', 'nasa', 'image'],
      priority: 'medium',
      trustRating: 100, // Official NASA source
      verificationStatus: 'OFFICIAL',
      dataQuality: 100,
      metadata: {
        mediaType: response.media_type,
        hdUrl: response.hdurl,
        copyright: response.copyright,
        fullExplanation: response.explanation
      }
    };
  }

  static normalizeNASADSNStatus(response: NASADSNStatusResponse): NormalizedDataItem[] {
    if (!response || typeof response !== 'object' || typeof response.dishes !== 'object') {
      return [];
    }

    const timestampMs = typeof response.time === 'number' ? response.time * 1000 : Date.now();
    const items: NormalizedDataItem[] = [];

    (Object.entries(response.dishes) as Array<[string, NASADSNDish]>).forEach(([dishId, dish]) => {
      if (!dish) return;
      const signals = Array.isArray(dish.sigs) ? dish.sigs : [];
      if (signals.length === 0) return;

      const { site, location } = this.getDSNSiteInfo(dishId, dish.site);
      const dishName = dish.name || `DSS-${dishId}`;

      signals.forEach((signal: NASADSNSignal, index: number) => {
        if (!signal) return;
        const targetLabel = signal.tgt || dish.user || 'Unknown Target';
        const direction = signal.dir === 'up' ? 'Uplink' : 'Downlink';
        const band = signal.band || 'Unknown';
        const dataRateRaw = typeof signal.rate === 'number' ? signal.rate : Number(signal.rate || signal.data_rate);
        const dataRate = Number.isFinite(dataRateRaw) ? Number(dataRateRaw) : undefined;
        const isActive = Boolean(signal.active);
        const priority = this.determineDSNPriority(isActive, dataRate, band);

        const summaryParts = [
          `${dishName} at ${site} ${isActive ? 'is actively' : 'recently'} handling a ${band}-band ${direction.toLowerCase()} link for ${targetLabel}`
        ];

        if (dish.act) {
          summaryParts.push(`Activity: ${dish.act}`);
        } else if (dish.desc) {
          summaryParts.push(dish.desc);
        }

        if (dataRate) {
          summaryParts.push(`Data rate ${dataRate.toLocaleString()} bps`);
        }

        const summary = summaryParts.join(' · ');
        const tagSet = new Set<string>();
        ['dsn', site, direction, band, targetLabel].forEach(value => {
          if (value) {
            tagSet.add(String(value).toLowerCase());
          }
        });

        items.push({
          id: `dsn-${dishId}-${signal.uid || index}-${response.time || Date.now()}`,
          title: `${dishName} ${direction} link with ${targetLabel}`,
          summary,
          url: 'https://eyes.nasa.gov/dsn/dsn.html',
          publishedAt: new Date(timestampMs),
          source: 'NASA Deep Space Network',
          sourceId: 'spaceforce-deep-space-network',
          sourceDisplayName: 'Deep Space Network Telemetry',
          category: 'space-operations',
          tags: Array.from(tagSet),
          priority,
          trustRating: 98,
          verificationStatus: 'OFFICIAL',
          dataQuality: 95,
          metadata: {
            dishId,
            dishName,
            site,
            location,
            azimuth: dish.az,
            elevation: dish.el,
            windSpeed: dish.ws,
            activity: dish.act,
            description: dish.desc,
            user: dish.user,
            direction,
            band,
            target: targetLabel,
            dataRate,
            signalPower: signal.pwr,
            signalId: signal.uid,
            targets: dish.tgts,
            timestamp: response.time,
            isActive
          }
        });
      });
    });

    return items;
  }

  /**
   * GitHub Security Advisory Normalization (handles both array and object forms)
   */
  static normalizeGitHubSecurityAdvisories(response: any): NormalizedDataItem[] {
    const advisories: any[] = Array.isArray(response)
      ? response
      : Array.isArray(response?.security_advisories)
      ? response.security_advisories
      : [];

    const mapCvssToPriority = (score?: number): 'low' | 'medium' | 'high' | 'critical' => {
      if (typeof score !== 'number') return 'medium';
      if (score >= 9.0) return 'critical';
      if (score >= 7.0) return 'high';
      if (score >= 4.0) return 'medium';
      return 'low';
    };

    return advisories.map((advisory: any) => {
      const id = advisory.id || advisory.ghsa_id || advisory.cve_id || `ghsa-${Date.now()}`;
      const cve = advisory.cve_id || advisory.identifiers?.find?.((i: any) => i.type === 'CVE')?.value;
      const summary = advisory.summary || advisory.description || 'Security advisory';
      const htmlUrl = advisory.html_url || advisory.url || advisory.repository_advisory_url || '';
      const published = advisory.published_at || advisory.github_reviewed_at || advisory.updated_at;
      const cvssScore = advisory.cvss?.score || advisory.cvss_severities?.cvss_v3?.score || advisory.cvss_severities?.cvss_v4?.score;
      const severity = String(advisory.severity || '').toLowerCase();

      // Priority from CVSS if present, else from severity label
      const priority = typeof cvssScore === 'number'
        ? mapCvssToPriority(cvssScore)
        : (severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : severity === 'low' ? 'low' : 'medium');

      return {
        id,
        title: summary,
        summary: String(advisory.description || summary).substring(0, 500) + '...',
        url: htmlUrl,
        publishedAt: published ? new Date(published) : new Date(),
        source: 'GitHub Security',
        category: 'security',
        tags: ['security', 'vulnerability', advisory.severity || 'unknown', cve].filter(Boolean) as string[],
        priority,
        trustRating: 90,
        verificationStatus: 'OFFICIAL',
        dataQuality: 95,
        metadata: {
          cveId: cve,
          identifiers: advisory.identifiers,
          references: advisory.references,
          cvss: advisory.cvss || advisory.cvss_severities,
          vulnerabilities: advisory.vulnerabilities,
          cwes: advisory.cwes,
          withdrawnAt: advisory.withdrawn_at
        }
      } as NormalizedDataItem;
    });
  }

  /**
   * Alpha Vantage Financial News Normalization
   */
  static normalizeAlphaVantageNews(response: AlphaVantageNewsResponse): NormalizedDataItem[] {
    return response.feed.map(article => ({
      id: `av-${article.url.split('/').pop()}`,
      title: article.title,
      summary: article.summary.substring(0, 500) + '...',
      url: article.url,
      publishedAt: new Date(article.time_published),
      source: `${article.source} (Alpha Vantage)`,
      category: 'financial',
      tags: ['finance', 'news', article.category_within_source],
      priority: this.mapSentimentToPriority(article.overall_sentiment_score),
      trustRating: 80, // Third-party aggregator
      verificationStatus: 'VERIFIED',
      dataQuality: 85,
      metadata: {
        bannerImage: article.banner_image,
        sentimentScore: article.overall_sentiment_score,
        sentimentLabel: article.overall_sentiment_label,
        tickerSentiment: article.ticker_sentiment,
        sourceCategory: article.category_within_source
      }
    }));
  }

  /**
   * Reddit Post Normalization (subreddit derived per item when not provided)
   */
  static normalizeRedditPosts(response: RedditPostResponse, subreddit: string): NormalizedDataItem[] {
    return response.data.children.map(post => {
      const createdUtc = post.data.created_utc;
      let publishedDate: Date;
      try {
        if (typeof createdUtc === 'number' && !isNaN(createdUtc)) {
          publishedDate = new Date(createdUtc * 1000);
          if (isNaN(publishedDate.getTime())) publishedDate = new Date();
        } else {
          publishedDate = new Date();
        }
      } catch {
        publishedDate = new Date();
      }

      const sub = post.data.subreddit || subreddit || 'reddit';

      return {
        id: `reddit-${post.data.id}`,
        title: post.data.title,
        summary: post.data.selftext ? String(post.data.selftext).substring(0, 500) + '...' : 'Click to view discussion',
        url: post.data.url?.startsWith('http') ? post.data.url : `https://reddit.com${post.data.url || ''}`,
        publishedAt: publishedDate,
        source: `Reddit r/${sub}`,
        category: 'social',
        tags: ['reddit', 'discussion', sub],
        priority: this.mapScoreToPriority(post.data.score),
        trustRating: 60,
        verificationStatus: 'UNVERIFIED',
        dataQuality: 75,
        metadata: {
          author: post.data.author,
          score: post.data.score,
          numComments: post.data.num_comments,
          ups: post.data.ups,
          downs: post.data.downs,
          subreddit: sub,
          redditPostId: post.data.id,
          commentsUrl: `https://reddit.com/r/${sub}/comments/${post.data.id}/`,
          originalUrl: post.data.url
        }
      };
    });
  }

  /**
   * Earth Alliance News RSS Normalization
   */
  static normalizeEarthAllianceNews(response: any): NormalizedDataItem[] {
    return this.normalizeRSSFeed(response, {
      sourceFallback: 'Earth Alliance News',
      category: 'security',
      baseTags: ['earth-alliance', 'operations'],
      trustRating: 87,
      verificationStatus: 'VERIFIED',
      dataQuality: 85,
      priorityMapper: this.determineEarthAlliancePriority
    });
  }

  /**
   * Investigative Outlet RSS Normalization
   */
  static normalizeInvestigativeRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );
    const sourceFallback = feedTitle || 'Investigative Outlet';
    const isDDoSecrets = /distributed denial of secrets/i.test(sourceFallback);

    const normalizationOptions: RSSNormalizationOptions = {
      sourceFallback,
      category: 'investigative',
      baseTags: ['investigative', 'whistleblower'],
      trustRating: isDDoSecrets ? 80 : 85,
      verificationStatus: 'VERIFIED',
      dataQuality: 82,
      priorityMapper: context => {
        if (isDDoSecrets) {
          const text = `${context.title} ${context.summary}`.toLowerCase();
          if (/(ministry|government|military|intel|secret|classified|state)/.test(text)) {
            return 'high';
          }
          return 'medium';
        }
        return this.determineInvestigativePriority(context);
      },
      additionalTags: context => {
        const tags: string[] = [];
        if (isDDoSecrets) {
          tags.push('ddosecrets', 'leak', 'torrent');
          if (typeof context.item?.link === 'string' && context.item.link.startsWith('magnet:')) {
            tags.push('magnet-link');
          }
        }
        return tags;
      },
      metadataEnricher: context => {
        if (!isDDoSecrets) {
          return {};
        }

        const lastModified = context.item?.lastModified;
        const releaseSlug = typeof context.item?.title === 'string' ? context.item.title : undefined;

        return {
          ...(lastModified ? { lastModified } : {}),
          ...(releaseSlug ? { releaseSlug } : {})
        };
      }
    };

    if (isDDoSecrets) {
      normalizationOptions.transformTitle = (title: string, _raw: any) =>
        this.humanizeInvestigativeTitle(title);
      normalizationOptions.transformSummary = (summary: string, rawItem: any) =>
        this.buildDDoSecretsSummary(summary, rawItem);
      normalizationOptions.transformUrl = (url: string, rawItem: any) =>
        this.transformDDoSecretsUrl(url, rawItem);
    }

    return this.normalizeRSSFeed(workingResponse, normalizationOptions);
  }

  static normalizeCyberSecurityRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );

    const sourceFallback = feedTitle || 'Cybersecurity Intelligence';

    return this.normalizeRSSFeed(workingResponse, {
      sourceFallback,
      category: 'cybersecurity',
      baseTags: ['cybersecurity', 'security', 'threat-intel'],
      trustRating: 88,
      verificationStatus: 'VERIFIED',
      dataQuality: 88,
      priorityMapper: context => {
        const text = `${context.title} ${context.summary}`.toLowerCase();
        if (/(zero[-\s]?day|worm|critical vulnerability|self-replicating|supply chain attack|nation-state)/.test(text)) {
          return 'high';
        }
        if (/(ransomware|exploit|breach|backdoor|malware|botnet|credential)/.test(text)) {
          return 'medium';
        }
        return 'low';
      }
    });
  }

  static normalizeGeopoliticalRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );

    const sourceFallback = feedTitle || 'Geopolitical Intelligence';

    return this.normalizeRSSFeed(workingResponse, {
      sourceFallback,
      category: 'geopolitics',
      baseTags: ['geopolitics', 'hybrid-warfare', 'analysis'],
      trustRating: 82,
      verificationStatus: 'VERIFIED',
      dataQuality: 80,
      priorityMapper: context => {
        const text = `${context.title} ${context.summary}`.toLowerCase();
        if (/(invasion|war|airstrike|coup|sanction|nato|hybrid warfare|false flag|mobilization)/.test(text)) {
          return 'high';
        }
        if (/(military|geopolitical|intelligence agency|diplomatic|proxy)/.test(text)) {
          return 'medium';
        }
        return 'low';
      }
    });
  }

  static normalizeSpaceLaunchRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );

    const sourceFallback = feedTitle || 'Space Launch Intelligence';

    return this.normalizeRSSFeed(workingResponse, {
      sourceFallback,
      category: 'space-operations',
      baseTags: ['launch', 'space', 'countdown'],
      trustRating: 85,
      verificationStatus: 'VERIFIED',
      dataQuality: 87,
      priorityMapper: context => {
        const text = `${context.title || ''} ${context.summary || ''}`.toLowerCase();
        if (/(scrub|abort|delay|hold)/.test(text)) {
          return 'critical';
        }
        if (/(launch|liftoff|ignition|t-\d|go-for-launch|mission update)/.test(text)) {
          return 'high';
        }
        if (/(payload|mission|rocket|pad|vehicle|countdown)/.test(text)) {
          return 'medium';
        }
        return 'low';
      },
      additionalTags: context => {
        const tags: string[] = [];
        const text = `${context.title || ''} ${context.summary || ''}`.toLowerCase();
        if (/scrub|delay|hold|abort/.test(text)) {
          tags.push('anomaly');
        }
        if (/starlink|classified|national security|uspacific|nrol|us space force/.test(text)) {
          tags.push('mission-critical');
        }
        return tags;
      },
      metadataEnricher: context => {
        const titleText = context.title || '';
        const summaryText = context.summary || '';
        const vehicleMatch = titleText.match(/(falcon\s?9|falcon\s?heavy|starship|electron|ariane|atlas|vulcan|soyuz|long march|delta iv|new glenn|rocket lab|relativity|taurus|vega)/i);
        const siteMatch = summaryText.match(/(cape canaveral|kennedy|vandenberg|wallops|baikonur|kourou|tanegashima|jiuquan|xichang|satish dhawan)/i);
        const metadata: Record<string, any> = {};
        if (vehicleMatch) metadata.vehicle = vehicleMatch[0];
        if (siteMatch) metadata.launchSite = siteMatch[0];
        return metadata;
      }
    });
  }

  static normalizeSpaceAgencyRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );

    const sourceFallback = feedTitle || 'Space Agency News';

    const detectPrograms = (text: string) => {
      const programs: string[] = [];
      if (/artemis/i.test(text)) programs.push('artemis');
      if (/gateway/i.test(text)) programs.push('lunar-gateway');
      if (/iss|space station/i.test(text)) programs.push('iss');
      if (/mars/i.test(text)) programs.push('mars');
      if (/crew|astronaut/i.test(text)) programs.push('crew');
      return programs;
    };

    return this.normalizeRSSFeed(workingResponse, {
      sourceFallback,
      category: 'space-operations',
      baseTags: ['space', 'mission', 'agency'],
      trustRating: 92,
      verificationStatus: 'VERIFIED',
      dataQuality: 90,
      priorityMapper: context => {
        const text = `${context.title || ''} ${context.summary || ''}`.toLowerCase();
        if (/(launch|liftoff|crew|eva|docking|mission update|payload)/.test(text)) {
          return 'high';
        }
        if (/(contract|partnership|science|instrument|payload|development)/.test(text)) {
          return 'medium';
        }
        return 'low';
      },
      additionalTags: context => {
        const text = `${context.title || ''} ${context.summary || ''}`;
        const tags = detectPrograms(text);
        if (/space\s?force/i.test(text)) tags.push('space-force');
        if (/commercial|contract/i.test(text)) tags.push('industry');
        return tags;
      },
      metadataEnricher: context => {
        const detectedPrograms = detectPrograms(`${context.title || ''} ${context.summary || ''}`);
        return {
          agency: sourceFallback,
          detectedPrograms
        };
      }
    });
  }

  static normalizeDefenseNewsRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );

    const sourceFallback = feedTitle || 'Defense Intelligence';

    const branchMatchers: Record<string, RegExp> = {
      'army': /army|soldier/i,
      'navy': /navy|fleet|sailor|carrier/i,
      'air-force': /air force|airmen|airman|fighter/i,
      'space-force': /space force|ussf/i,
      'marines': /marine corps|marines/i,
      'dod': /department of defense|dod|war\.gov/i
    };

    const detectBranch = (text: string) => {
      const matches = Object.entries(branchMatchers).find(([, pattern]) => pattern.test(text));
      return matches ? matches[0] : undefined;
    };

    return this.normalizeRSSFeed(workingResponse, {
      sourceFallback,
      category: 'defense',
      baseTags: ['defense', 'military', 'osint'],
      trustRating: 90,
      verificationStatus: 'OFFICIAL',
      dataQuality: 88,
      priorityMapper: context => {
        const text = `${context.title || ''} ${context.summary || ''}`.toLowerCase();
        if (/(airstrike|deployment|operation|casualty|readiness alert|combat)/.test(text)) {
          return 'high';
        }
        if (/(contract|exercise|training|budget|procurement|assessment|cyber)/.test(text)) {
          return 'medium';
        }
        return 'low';
      },
      additionalTags: context => {
        const branch = detectBranch(`${context.title || ''} ${context.summary || ''}`);
        return branch ? [branch] : [];
      },
      metadataEnricher: context => {
        const text = `${context.title || ''} ${context.summary || ''}`;
        return {
          branch: detectBranch(text)
        };
      }
    });
  }

  static normalizePrivacyAdvocacyRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );

    const sourceFallback = feedTitle || 'Privacy Advocacy Updates';

    return this.normalizeRSSFeed(workingResponse, {
      sourceFallback,
      category: 'privacy-rights',
      baseTags: ['privacy', 'civil-liberties', 'surveillance'],
      trustRating: 90,
      verificationStatus: 'VERIFIED',
      dataQuality: 88,
      priorityMapper: context => {
        const text = `${context.title} ${context.summary}`.toLowerCase();
        if (/(lawsuit|ban|injunction|surveillance program|court order|illegal spying)/.test(text)) {
          return 'high';
        }
        if (/(privacy|data protection|biometric|encryption|policy)/.test(text)) {
          return 'medium';
        }
        return 'low';
      }
    });
  }

  static normalizeFinancialTransparencyRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );

    const sourceFallback = feedTitle || 'Financial Transparency';

    return this.normalizeRSSFeed(workingResponse, {
      sourceFallback,
      category: 'financial-transparency',
      baseTags: ['transparency', 'finance', 'anti-corruption'],
      trustRating: 86,
      verificationStatus: 'VERIFIED',
      dataQuality: 84,
      priorityMapper: context => {
        const text = `${context.title} ${context.summary}`.toLowerCase();
        if (/(corruption|money laundering|dark money|sanction|campaign finance|shell company)/.test(text)) {
          return 'high';
        }
        if (/(disclosure|report|accountability|audit|lobbying|transparency)/.test(text)) {
          return 'medium';
        }
        return 'low';
      }
    });
  }

  static normalizeClimateResilienceRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );

    const sourceFallback = feedTitle || 'Climate Resilience';

    return this.normalizeRSSFeed(workingResponse, {
      sourceFallback,
      category: 'climate-resilience',
      baseTags: ['climate', 'environment', 'resilience'],
      trustRating: 87,
      verificationStatus: 'VERIFIED',
      dataQuality: 85,
      priorityMapper: context => {
        const text = `${context.title} ${context.summary}`.toLowerCase();
        if (/(hurricane|wildfire|heatwave|flood|disaster|emergency|evacuation)/.test(text)) {
          return 'high';
        }
        if (/(climate|environment|emissions|mitigation|adaptation)/.test(text)) {
          return 'medium';
        }
        return 'low';
      }
    });
  }

  static normalizeAIGovernanceRSS(response: any): NormalizedDataItem[] {
    let workingResponse = response;

    if (workingResponse && typeof workingResponse === 'object' && typeof workingResponse.contents === 'string') {
      const parsed = this.parseRSSFromString(workingResponse.contents);
      if (parsed) {
        workingResponse = parsed;
      }
    }

    const feedTitle = this.stripHtmlSafe(
      workingResponse?.channel?.title ||
        workingResponse?.feed?.title ||
        workingResponse?.title ||
        workingResponse?.name
    );

    const sourceFallback = feedTitle || 'AI Governance';

    return this.normalizeRSSFeed(workingResponse, {
      sourceFallback,
      category: 'ai-governance',
      baseTags: ['ai', 'ethics', 'governance'],
      trustRating: 85,
      verificationStatus: 'VERIFIED',
      dataQuality: 83,
      priorityMapper: context => {
        const text = `${context.title} ${context.summary}`.toLowerCase();
        if (/(existential risk|autonomous weapon|ai weapon|moratorium|ban|regulation|policy)/.test(text)) {
          return 'high';
        }
        if (/(ai|artificial intelligence|machine learning|ethics|governance|alignment)/.test(text)) {
          return 'medium';
        }
        return 'low';
      }
    });
  }

  static normalizeOpenSecretsNews(response: any): NormalizedDataItem[] {
    let htmlContent: string | undefined;

    if (response && typeof response === 'object') {
      if (typeof response.contents === 'string') {
        htmlContent = response.contents;
      } else if (typeof response.html === 'string') {
        htmlContent = response.html;
      }
    } else if (typeof response === 'string') {
      htmlContent = response;
    }

    if (!htmlContent) {
      return [];
    }

    const doc = this.parseHTMLDocument(htmlContent);
    if (!doc) {
      return [];
    }

    const cards = Array.from(doc.querySelectorAll('div.news-item'));
    if (cards.length === 0) {
      return [];
    }

    const items: NormalizedDataItem[] = [];

    cards.slice(0, 20).forEach((card, index) => {
      const titleAnchor = card.querySelector('h3 a');
      const title = this.stripHtmlSafe(titleAnchor?.textContent || '');
      const href = titleAnchor?.getAttribute('href');
      if (!title || !href) {
        return;
      }

      const url = href.startsWith('http') ? href : `https://www.opensecrets.org${href}`;
      const summaryRaw = this.stripHtmlSafe(card.querySelector('p.teaser')?.textContent || '');
      const summary = this.truncateSummary(summaryRaw || title);
      const dateTextRaw = this.stripHtmlSafe(card.querySelector('span.date')?.textContent || '');
      const publishedAt = this.parseDateSafe(dateTextRaw);

      const tagElements = Array.from(card.querySelectorAll('.label, .badge')); // capture category badges if present
      const additionalTags = tagElements
        .map(el => this.stripHtmlSafe(el.textContent || '').toLowerCase())
        .filter(Boolean);

      const tags = new Set<string>(['financial', 'transparency', 'opensecrets']);
      additionalTags.forEach(tag => tags.add(tag));

      const priorityText = `${title} ${summary}`.toLowerCase();
      let priority: 'low' | 'medium' | 'high' = 'low';
      if (/(dark money|money trail|corruption|sanction|shell company|launder|campaign finance)/.test(priorityText)) {
        priority = 'high';
      } else if (/(donor|lobby|finance|disclosure|tracking|political action|spending)/.test(priorityText)) {
        priority = 'medium';
      }

      items.push({
        id: `${this.slugify(title)}-${publishedAt.getTime()}-${index}`,
        title,
        summary,
        url,
        publishedAt,
        source: 'OpenSecrets Investigations',
        category: 'financial-transparency',
        tags: Array.from(tags),
        priority,
        trustRating: 85,
        verificationStatus: 'VERIFIED',
        dataQuality: 82,
        metadata: {
          categories: additionalTags,
          raw: {
            dateText: dateTextRaw,
            summary: summaryRaw
          }
        }
      });
    });

    return items;
  }

  static normalizeTBIJInvestigations(response: any): NormalizedDataItem[] {
    let htmlContent: string | undefined;

    if (response && typeof response === 'object') {
      if (typeof response.contents === 'string') {
        htmlContent = response.contents;
      } else if (typeof response.html === 'string') {
        htmlContent = response.html;
      }
    } else if (typeof response === 'string') {
      htmlContent = response;
    }

    if (!htmlContent) {
      return [];
    }

    const doc = this.parseHTMLDocument(htmlContent);
    const storyNodes = doc ? Array.from(doc.querySelectorAll('a.tb-c-story-preview')) : [];

    if (storyNodes.length === 0) {
      return this.normalizeTBIJFromMarkdown(htmlContent);
    }

    const items: NormalizedDataItem[] = [];

    storyNodes.forEach((node, index) => {
      const href = node.getAttribute('href')?.trim();
      if (!href) {
        return;
      }

      const url = href.startsWith('http')
        ? href
        : `https://www.thebureauinvestigates.com${href.startsWith('/') ? '' : '/'}${href}`;

      const title = this.stripHtmlSafe(node.querySelector('.tb-c-story-preview__heading')?.textContent || '');
      if (!title) {
        return;
      }

      const summaryRaw = this.stripHtmlSafe(node.querySelector('.tb-c-story-preview__body')?.textContent || '');
      const summary = this.truncateSummary(summaryRaw);

      const metaItems = Array.from(node.querySelectorAll('.tb-c-story-preview__meta-item'))
        .map(el => this.stripHtmlSafe(el.textContent || ''))
        .filter(Boolean);

      const dateText = metaItems[0] || '';
      const categories = metaItems.slice(1).map(text => text.toLowerCase());
      const publishedAt = this.parseTBIJDate(dateText);

      const imgEl = node.querySelector('.tb-c-story-preview__image-img') as HTMLImageElement | null;
      const thumbnail = imgEl?.getAttribute('data-src')?.trim() || imgEl?.getAttribute('src')?.trim();

      const context: RSSPriorityContext = {
        title,
        summary,
        categories,
        item: {
          url,
          dateText,
          categories: metaItems
        }
      };

      const tags = new Set<string>();
      tags.add('investigative');
      tags.add('tbij');
      categories.forEach(cat => tags.add(cat));

      const priority = this.determineInvestigativePriority(context);

      items.push({
        id: `${this.slugify(title)}-${publishedAt.getTime()}`,
        title,
        summary,
        url,
        publishedAt,
        source: 'The Bureau of Investigative Journalism',
        category: 'investigative',
        tags: Array.from(tags),
        priority,
        trustRating: 88,
        verificationStatus: 'VERIFIED',
        dataQuality: 80,
        metadata: {
          thumbnail,
          categories: metaItems,
          raw: {
            dateText,
            summary: summaryRaw,
            index
          }
        }
      });
    });

    return items;
  }

  /**
   * USGS Earthquake Data Normalization
   */
  static normalizeUSGSEarthquakes(geoJsonResponse: any): NormalizedDataItem[] {
    const features = Array.isArray(geoJsonResponse?.features) ? geoJsonResponse.features : [];
    if (features.length === 0) return [];

    return features.map((earthquake: any) => {
      const p = earthquake?.properties || {};
      const g = earthquake?.geometry || {};
      const coords = Array.isArray(g.coordinates) ? g.coordinates : [];
      const mag = typeof p.mag === 'number' ? p.mag : 0;
      const place = p.place || 'Unknown location';
      const title = p.title || (mag ? `M${mag} Earthquake - ${place}` : `Earthquake - ${place}`);
      const url = p.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${earthquake?.id || ''}`;
      const time = typeof p.time === 'number' ? p.time : Date.now();

      return {
        id: earthquake?.id || `${time}-${place}`,
        title,
        summary: `Magnitude ${mag} earthquake ${place}`,
        url,
        publishedAt: new Date(time),
        source: 'USGS Earthquake Hazards',
        category: 'seismic',
        tags: ['earthquake', 'geology', 'hazard'],
        priority: this.mapMagnitudeToPriority(mag),
        trustRating: 98,
        verificationStatus: 'OFFICIAL',
        dataQuality: 100,
        metadata: {
          magnitude: mag,
          location: place,
          depth: typeof coords[2] === 'number' ? coords[2] : undefined,
          latitude: typeof coords[1] === 'number' ? coords[1] : undefined,
          longitude: typeof coords[0] === 'number' ? coords[0] : undefined,
          magType: p.magType,
          significance: p.sig,
          felt: p.felt
        }
      };
    });
  }

  /**
   * CoinGecko Data Normalization
   */
  static normalizeCoinGeckoData(response: any): NormalizedDataItem[] {
    const items: NormalizedDataItem[] = [];

    // /search/trending response
    if (response && Array.isArray(response.coins)) {
      for (const c of response.coins) {
        const coin = c.item || c;
        items.push({
          id: `cg-${coin.id}`,
          title: coin.name || coin.symbol || 'Crypto Asset',
          summary: `Trending: ${coin.name || coin.symbol}`,
          url: coin.id ? `https://www.coingecko.com/en/coins/${coin.id}` : 'https://www.coingecko.com',
          publishedAt: new Date(),
          source: 'CoinGecko',
          category: 'financial',
          tags: ['crypto', 'trending'],
          priority: 'medium',
          trustRating: 80,
          verificationStatus: 'VERIFIED',
          dataQuality: 85,
          metadata: coin
        });
      }
    }

    // /coins/markets response
    else if (Array.isArray(response)) {
      for (const coin of response) {
        items.push({
          id: `cg-${coin.id}`,
          title: coin.name || coin.symbol || 'Crypto Asset',
          summary: `${coin.name || coin.symbol} price: $${coin.current_price}`,
          url: `https://www.coingecko.com/en/coins/${coin.id}`,
          publishedAt: new Date(),
          source: 'CoinGecko',
          category: 'financial',
          tags: ['crypto', 'markets'],
          priority: 'medium',
          trustRating: 80,
          verificationStatus: 'VERIFIED',
          dataQuality: 85,
          metadata: coin
        });
      }
    }

    // /global response
    else if (response && response.data) {
      items.push({
        id: `cg-global-${Date.now()}`,
        title: 'Crypto Market Overview',
        summary: `Active Cryptocurrencies: ${response.data.active_cryptocurrencies}`,
        url: 'https://www.coingecko.com',
        publishedAt: new Date(),
        source: 'CoinGecko',
        category: 'financial',
        tags: ['crypto', 'global'],
        priority: 'medium',
        trustRating: 80,
        verificationStatus: 'VERIFIED',
        dataQuality: 85,
        metadata: response.data
      });
    }

    return items;
  }

  static normalizeLaunchLibraryData(response: any): NormalizedDataItem[] {
    let payload: any = response;

    if (payload && typeof payload === 'object' && typeof payload.contents === 'string') {
      try {
        payload = JSON.parse(payload.contents);
      } catch {
        payload = null;
      }
    }

    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = null;
      }
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const launches = Array.isArray(payload.results) ? payload.results : [];
    if (launches.length === 0) {
      return [];
    }

    const mapStatusToPriority = (statusText: string): 'low' | 'medium' | 'high' | 'critical' => {
      const normalized = statusText.toLowerCase();
      if (/(failure|hold|scrub|abort)/.test(normalized)) {
        return 'critical';
      }
      if (/(go|success|in flight)/.test(normalized)) {
        return 'high';
      }
      if (/(tbd|unknown|tentative)/.test(normalized)) {
        return 'medium';
      }
      return 'low';
    };

    return launches.map((launch: any, index: number) => {
      const statusName = launch?.status?.name || launch?.status?.abbrev || 'TBD';
      const net = launch?.net || launch?.window_start || new Date().toISOString();
      const publishedAt = this.parseDateSafe(net);
      const vehicle = launch?.rocket?.configuration?.name || launch?.rocket?.name;
      const missionName = launch?.mission?.name || launch?.name || 'Upcoming Launch';
      const locationName = launch?.pad?.location?.name || launch?.pad?.name;
      const provider = launch?.launch_service_provider?.name;
      const summaryParts: string[] = [];

      summaryParts.push(`${missionName} targeting ${publishedAt.toUTCString()}`);
      if (vehicle) {
        summaryParts.push(`Vehicle: ${vehicle}`);
      }
      if (locationName) {
        summaryParts.push(`Site: ${locationName}`);
      }
      if (launch?.mission?.description) {
        summaryParts.push(this.stripHtmlSafe(launch.mission.description).substring(0, 240));
      }

      const tags = new Set<string>(['space', 'launch']);
      if (vehicle) tags.add(this.slugify(vehicle));
      if (locationName) tags.add(this.slugify(locationName));
      if (provider) tags.add(this.slugify(provider));
      if (launch?.mission?.type) tags.add(this.slugify(launch.mission.type));
      tags.add(`status:${this.slugify(statusName)}`);

      const url = launch?.url || (launch?.slug ? `https://thespacedevs.com/launch/${launch.slug}` : 'https://thespacedevs.com/launches');

      return {
        id: launch?.id || `${this.slugify(missionName)}-${index}-${publishedAt.getTime()}`,
        title: `${missionName} (${statusName})`,
        summary: this.truncateSummary(summaryParts.join(' · ')),
        url,
        publishedAt,
        source: 'Launch Library 2',
        category: 'space-operations',
        tags: Array.from(tags),
        priority: mapStatusToPriority(statusName),
        trustRating: 94,
        verificationStatus: 'VERIFIED',
        dataQuality: 92,
        metadata: {
          status: launch?.status,
          net,
          windowStart: launch?.window_start,
          windowEnd: launch?.window_end,
          mission: launch?.mission,
          vehicle,
          provider,
          pad: launch?.pad,
          location: launch?.pad?.location,
          agencies: launch?.mission?.agencies,
          probability: launch?.probability,
          webcast: launch?.vidURLs,
          slug: launch?.slug
        }
      } as NormalizedDataItem;
    });
  }

  private static normalizeRSSFeed(response: any, options: RSSNormalizationOptions): NormalizedDataItem[] {
    const items = this.extractRSSItems(response);
    if (items.length === 0) return [];

  const fallbackSource = options.sourceFallback;
  const feedTitle = this.stripHtmlSafe(response?.feed?.title || response?.title || response?.name);
    const sourceName = feedTitle || fallbackSource;
    const baseTags = options.baseTags ?? [];
    const trustRating = options.trustRating ?? 80;
    const verificationStatus = options.verificationStatus ?? 'VERIFIED';
    const dataQuality = options.dataQuality ?? 80;
    const sourceSlug = this.slugify(sourceName || fallbackSource);

    return items
      .map((item: any, index: number) => {
        let url = item.link || item.url || item.guid || '';
        if (!url) {
          return null;
        }

        const publishedAt = this.parseDateSafe(
          item.pubDate || item.published || item.isoDate || item.updated || item.date
        );

        let title = (item.title || item.headline || sourceName || fallbackSource).toString().trim();
        if (options.transformTitle) {
          title = options.transformTitle(title, item);
        }

        const rawSummary = item.description || item.summary || item.contentSnippet || item.content || '';
        let summary = this.truncateSummary(this.stripHtmlSafe(rawSummary));
        if (options.transformSummary) {
          summary = this.truncateSummary(options.transformSummary(summary, item));
        }

        const categories = Array.isArray(item.categories)
          ? item.categories
              .map((cat: any) => this.stripHtmlSafe(String(cat)).toLowerCase())
              .filter((cat: string) => !!cat)
          : [];

        const context: RSSPriorityContext = { title, summary, categories, item };

        const additionalTags = options.additionalTags ? options.additionalTags(context) : [];
        const tagSet = new Set<string>();
        [...baseTags, ...categories, ...additionalTags].forEach(tag => {
          if (tag) {
            tagSet.add(String(tag).toLowerCase());
          }
        });

        let transformMetadata: Record<string, any> = {};
        const extraTransformTags: string[] = [];
        if (options.transformUrl) {
          const transformed = options.transformUrl(url, item);
          if (typeof transformed === 'string') {
            url = transformed;
          } else if (transformed && typeof transformed === 'object') {
            if (typeof transformed.url === 'string' && transformed.url.length > 0) {
              url = transformed.url;
            }
            if (Array.isArray(transformed.extraTags)) {
              transformed.extraTags.forEach(tag => {
                if (tag) extraTransformTags.push(String(tag));
              });
            }
            if (transformed.metadata) {
              transformMetadata = { ...transformMetadata, ...transformed.metadata };
            }
          }
        }

        extraTransformTags.forEach(tag => {
          tagSet.add(tag.toLowerCase());
        });

        const priority = options.priorityMapper ? options.priorityMapper(context) : 'medium';
        const metadataExtra = options.metadataEnricher ? options.metadataEnricher(context) : {};

        return {
          id: item.guid || item.id || `${sourceSlug}-${index}-${publishedAt.getTime()}`,
          title,
          summary,
          url,
          publishedAt,
          source: sourceName,
          category: options.category,
          tags: Array.from(tagSet),
          priority,
          trustRating,
          verificationStatus,
          dataQuality,
          metadata: {
            author:
              (typeof item.author === 'object' && item.author !== null
                ? item.author.name || item.author.title
                : item.author) || item.creator || item['dc:creator'],
            thumbnail: item.thumbnail || item.enclosure?.link || item.image,
            categories: item.categories,
            ...transformMetadata,
            ...metadataExtra,
            raw: item
          }
        } as NormalizedDataItem;
      })
      .filter((item): item is NormalizedDataItem => item !== null);
  }

  private static slugify(value: string): string {
    return value
      ?.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'feed';
  }

  /**
   * Priority Mapping Utilities
   */
  private static mapSeverityToPriority(severity?: string): 'low' | 'medium' | 'high' | 'critical' {
    if (!severity) return 'low';
    const severityLower = String(severity).toLowerCase();
    if (severityLower.includes('extreme') || severityLower.includes('critical')) return 'critical';
    if (severityLower.includes('severe') || severityLower.includes('major') || severityLower.includes('significant')) return 'high';
    if (severityLower.includes('moderate') || severityLower.includes('minor')) return 'medium';
    return 'low';
  }

  private static mapSentimentToPriority(sentimentScore: number): 'low' | 'medium' | 'high' | 'critical' {
    const absScore = Math.abs(sentimentScore);
    if (absScore > 0.8) return 'critical';
    if (absScore > 0.5) return 'high';
    if (absScore > 0.2) return 'medium';
    return 'low';
  }

  private static mapScoreToPriority(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score > 1000) return 'critical';
    if (score > 500) return 'high';
    if (score > 100) return 'medium';
    return 'low';
  }

  private static determineDSNPriority(isActive: boolean, dataRate?: number, band?: string): 'low' | 'medium' | 'high' {
    if (!isActive) return 'low';
    if ((dataRate || 0) >= 500000 || (band || '').toLowerCase() === 'ka') {
      return 'high';
    }
    return 'medium';
  }

  private static getDSNSiteInfo(dishId: string, reportedSite?: string): { site: string; location: string } {
    if (reportedSite) {
      switch (reportedSite.toLowerCase()) {
        case 'canberra':
          return { site: 'Canberra', location: 'Australian Capital Territory' };
        case 'madrid':
          return { site: 'Madrid', location: 'Spain' };
        case 'goldstone':
          return { site: 'Goldstone', location: 'California, USA' };
        default:
          break;
      }
    }

    const idNum = parseInt(dishId, 10);
    if (Number.isNaN(idNum)) {
      return { site: 'Deep Space Network', location: 'Global' };
    }

    if (idNum >= 10 && idNum < 30) {
      return { site: 'Goldstone', location: 'California, USA' };
    }

    if (idNum >= 30 && idNum < 50) {
      return { site: 'Canberra', location: 'Australian Capital Territory' };
    }

    return { site: 'Madrid', location: 'Spain' };
  }

  private static mapMagnitudeToPriority(magnitude?: number | null): 'low' | 'medium' | 'high' | 'critical' {
    const mag = typeof magnitude === 'number' ? magnitude : 0;
    if (mag >= 7.0) return 'critical';
    if (mag >= 6.0) return 'high';
    if (mag >= 4.0) return 'medium';
    return 'low';
  }

  private static stripHtmlSafe(input?: string): string {
    if (!input) return '';
    return String(input).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private static truncateSummary(summary: string, maxLength: number = 500): string {
    if (summary.length <= maxLength) return summary;
    return `${summary.substring(0, maxLength).trim()}...`;
  }

  private static parseDateSafe(input?: string): Date {
    if (!input) return new Date();
    const parsed = new Date(input);
    if (isNaN(parsed.getTime())) {
      return new Date();
    }
    return parsed;
  }

  private static extractRSSItems(response: any): any[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.entries)) return response.entries;
    if (response.feed && Array.isArray(response.feed.items)) return response.feed.items;
    if (response.data && Array.isArray(response.data.items)) return response.data.items;
    return [];
  }

  private static determineEarthAlliancePriority(context: RSSPriorityContext): 'low' | 'medium' | 'high' | 'critical' {
    const text = `${context.title} ${context.summary}`.toLowerCase();
    if (/alert|breaking|critical|emergency|evac|priority/.test(text)) return 'high';
    if (/intel|operation|brief|analysis|update/.test(text) || context.categories.includes('operations')) return 'medium';
    return 'low';
  }

  private static determineInvestigativePriority(context: RSSPriorityContext): 'low' | 'medium' | 'high' | 'critical' {
    const text = `${context.title} ${context.summary}`.toLowerCase();
    if (/exclusive|breaking|reveals|exposed|leak|secret|classified|documents|urgent/.test(text)) return 'high';
    if (/investigation|report|analysis|data|corruption|whistleblower|accountability|oversight/.test(text)) return 'medium';
    if (context.categories.some(cat => ['breaking', 'exclusive'].includes(cat))) return 'high';
    return 'low';
  }

  private static humanizeInvestigativeTitle(title: string): string {
    if (!title) return title;
    const cleaned = title.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) return title;
    return cleaned
      .split(' ')
      .map(word => {
        if (word.length <= 4 && word === word.toUpperCase()) {
          return word; // Preserve short acronyms
        }
        if (/^[A-Z0-9_-]+$/.test(word) && word === word.toUpperCase()) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  private static buildDDoSecretsSummary(summary: string, rawItem: any): string {
    const content = this.stripHtmlSafe(rawItem?.content || rawItem?.description || '');
    const wikiUrl = this.extractFirstHttpUrl(content) || this.extractFirstHttpUrl(summary);
    if (!wikiUrl) {
      return summary || 'Leak release available via Distributed Denial of Secrets.';
    }

    const humanTitle = this.humanizeInvestigativeTitle(rawItem?.title || 'Leak Release');
    return `${humanTitle} leak dossier published on DDoSecrets – review details at ${wikiUrl}`;
  }

  private static transformDDoSecretsUrl(
    url: string,
    rawItem: any
  ): { url: string; extraTags?: string[]; metadata?: Record<string, any> } {
    const result: { url: string; extraTags?: string[]; metadata?: Record<string, any> } = {
      url
    };

    if (typeof url === 'string' && url.startsWith('magnet:')) {
      const content = this.stripHtmlSafe(rawItem?.content || rawItem?.description || '');
      const wikiUrl = this.extractFirstHttpUrl(content) || this.extractFirstHttpUrl(rawItem?.summary);
      result.metadata = {
        magnetUrl: url
      };

      if (wikiUrl) {
        result.url = wikiUrl;
        result.extraTags = ['dossier-link'];
      }
    }

    return result;
  }

  private static extractFirstHttpUrl(input?: string | null): string | undefined {
    if (!input) return undefined;
    const match = String(input).match(/https?:\/\/[^\s)]+/i);
    if (!match) return undefined;
    return match[0].replace(/[.,)]+$/, '');
  }

  private static parseRSSFromString(xml: string): { channel?: { title?: string }; feed?: { title?: string }; items: any[] } | null {
    if (!xml || typeof xml !== 'string') return null;

    const DOMParserCtor = (typeof globalThis !== 'undefined' ? (globalThis as any).DOMParser : undefined);
    if (!DOMParserCtor) {
      return null;
    }

    try {
      const parser = new DOMParserCtor();
      const doc = parser.parseFromString(xml, 'application/xml');

      if (doc.getElementsByTagName('parsererror').length > 0) {
        return null;
      }

      const channelTitle = doc.querySelector('channel > title')?.textContent?.trim() || undefined;
      const feedTitle = doc.querySelector('feed > title')?.textContent?.trim() || channelTitle;

      const itemNodes: Element[] = Array.from(doc.querySelectorAll('channel > item'));
      const entryNodes: Element[] =
        itemNodes.length > 0 ? itemNodes : Array.from(doc.querySelectorAll('feed > entry'));

      const items = entryNodes.map((node: Element) => {
        const getText = (selector: string) => node.querySelector(selector)?.textContent?.trim() || '';

        let link = getText('link');
        if (!link) {
          const linkEl = node.querySelector('link');
          const href = linkEl?.getAttribute('href');
          if (href) {
            link = href.trim();
          }
        }

        const description =
          getText('description') ||
          getText('content') ||
          getText('content\\:encoded') ||
          getText('summary');

        const categories: string[] = [];
        node.querySelectorAll('category').forEach((cat: Element) => {
          const value = cat.textContent?.trim();
          if (value) categories.push(value);
          const term = cat.getAttribute('term');
          if (term) categories.push(term.trim());
        });

        node.querySelectorAll('*[term]').forEach((cat: Element) => {
          const term = cat.getAttribute('term');
          if (term) categories.push(term.trim());
        });

        const enclosure = node.querySelector('enclosure');
        const enclosureLink = enclosure?.getAttribute('url') || enclosure?.getAttribute('href');

        return {
          title: getText('title'),
          link,
          url: link,
          description,
          content: getText('content') || getText('content\\:encoded'),
          summary: getText('summary'),
          pubDate: getText('pubDate') || getText('updated') || getText('published'),
          updated: getText('updated'),
          guid: getText('guid') || getText('id'),
          lastModified: getText('updated'),
          author:
            getText('author > name') ||
            getText('author') ||
            getText('dc\\:creator') ||
            getText('creator'),
          categories: categories.filter(Boolean),
          enclosure: enclosureLink ? { link: enclosureLink } : undefined
        };
      });

      const parsed: { channel?: { title?: string }; feed?: { title?: string }; items: any[] } = {
        items
      };

      if (channelTitle) {
        parsed.channel = { title: channelTitle };
      }

      if (feedTitle) {
        parsed.feed = { title: feedTitle };
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to parse RSS string', error);
      return null;
    }
  }

  private static parseHTMLDocument(html: string): Document | null {
    if (!html) return null;
    const DOMParserCtor = (typeof globalThis !== 'undefined' ? (globalThis as any).DOMParser : undefined);
    if (!DOMParserCtor) {
      return null;
    }

    try {
      const parser = new DOMParserCtor();
      const doc = parser.parseFromString(html, 'text/html');
      return doc;
    } catch (error) {
      console.warn('Failed to parse HTML string', error);
      return null;
    }
  }

  private static parseTBIJDate(input?: string): Date {
    if (!input) return new Date();
    const trimmed = input.trim();
    const match = trimmed.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      let year = parseInt(match[3], 10);
      if (match[3].length === 2) {
        year += year >= 70 ? 1900 : 2000;
      }
      try {
        const date = new Date(Date.UTC(year, month, day));
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {}
    }

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private static normalizeTBIJFromMarkdown(markdown: string): NormalizedDataItem[] {
    if (!markdown) {
      return [];
    }

    const linkRegex = /\[!\[[^\]]*?\]\((?<image>https?:\/\/[^)]+)\)\s*(?<payload>[^\]]+)\]\((?<url>https?:\/\/www\.thebureauinvestigates\.com\/[^)]+)\)/g;
    const items: NormalizedDataItem[] = [];
    const seen = new Set<string>();

    for (const match of markdown.matchAll(linkRegex)) {
      const groups = match.groups ?? {};
      const url = groups.url;
      const payload = groups.payload;
      if (!url || !payload) continue;
      if (!/\/stories\//.test(url)) continue;
      if (seen.has(url)) continue;

      const normalized = this.buildTBIJMarkdownItem(payload, url, groups.image);
      if (normalized) {
        items.push(normalized);
        seen.add(url);
      }
    }

    return items;
  }

  private static buildTBIJMarkdownItem(payload: string, url: string, image?: string): NormalizedDataItem | null {
    const condensed = payload.replace(/\s+/g, ' ').trim();
    if (!condensed) {
      return null;
    }

    const dateMatch = condensed.match(/^(\d{2}\.\d{2}\.\d{2})\s+(.*)$/);
    if (!dateMatch) {
      return null;
    }

    const dateText = dateMatch[1];
    let remainder = dateMatch[2].trim();

    const readTimeMatch = remainder.match(/(\d+\s+minute read)$/i);
    let readTime: string | undefined;
    if (readTimeMatch && readTimeMatch.index !== undefined) {
      readTime = readTimeMatch[0];
      remainder = remainder.slice(0, readTimeMatch.index).trim();
    }

    let titleSegment = remainder;
    let summarySegment = '';

    const splitParts = remainder.split(/-{3,}/);
    if (splitParts.length > 1) {
      titleSegment = splitParts[0].trim();
      summarySegment = splitParts.slice(1).join(' ').trim();
    }

    if (!summarySegment && titleSegment.includes('  ')) {
      const parts = titleSegment.split('  ');
      if (parts.length > 1) {
        titleSegment = parts[0].trim();
        summarySegment = parts.slice(1).join(' ').trim();
      }
    }

    summarySegment = summarySegment.replace(/\b\d+\s+minute read\b/gi, '').trim();

    let categoryLabel: string | undefined;
    const knownCategories = this.getTBIJKnownCategories();
    for (const category of knownCategories) {
      if (titleSegment.startsWith(category + ' ')) {
        categoryLabel = category;
        titleSegment = titleSegment.slice(category.length).trim();
        break;
      }
      if (titleSegment === category) {
        categoryLabel = category;
        titleSegment = '';
        break;
      }
    }

    const title = titleSegment || summarySegment || url;
    const summary = this.truncateSummary(summarySegment || title);
    const publishedAt = this.parseTBIJDate(dateText);

    const categories = categoryLabel ? [categoryLabel.toLowerCase()] : [];
    const context: RSSPriorityContext = {
      title,
      summary,
      categories,
      item: {
        url,
        dateText,
        categories: categoryLabel ? [categoryLabel] : []
      }
    };

    const tags = new Set<string>();
    tags.add('investigative');
    tags.add('tbij');
    if (categoryLabel) {
      tags.add(categoryLabel.toLowerCase());
    }

    const priority = this.determineInvestigativePriority(context);

    const metadataCategories = [dateText];
    if (categoryLabel) {
      metadataCategories.push(categoryLabel);
    }

    return {
      id: `${this.slugify(title)}-${publishedAt.getTime()}`,
      title,
      summary,
      url,
      publishedAt,
      source: 'The Bureau of Investigative Journalism',
      category: 'investigative',
      tags: Array.from(tags),
      priority,
      trustRating: 88,
      verificationStatus: 'VERIFIED',
      dataQuality: 80,
      metadata: {
        thumbnail: image,
        categories: metadataCategories,
        raw: {
          dateText,
          payload,
          readTime
        }
      }
    };
  }

  private static getTBIJKnownCategories(): string[] {
    return [
      'Making Bad Bosses Pay',
      'Global Health',
      'Big Tech',
      'Environment',
      'The Enablers',
      'Family Court Files',
      'Global Superbugs',
      'Bureau Local',
      'Open Resources',
      'News',
      'Opinion'
    ];
  }

  /**
   * Generic normalization for unknown data formats
   */
  static normalizeGeneric(data: any, source: string, category: string): NormalizedDataItem {
    return {
      id: data.id || `${source}-${Date.now()}`,
      title: data.title || data.name || data.headline || 'Untitled',
      summary: data.summary || data.description || data.content || 'No description available',
      url: data.url || data.link || data.href || '',
      publishedAt: new Date(data.publishedAt || data.created || data.timestamp || Date.now()),
      source,
      category,
      tags: data.tags || [category],
      priority: 'medium',
      trustRating: 50,
      verificationStatus: 'UNVERIFIED',
      dataQuality: 60,
      metadata: {
        ...(typeof data === 'object' && data !== null ? data : { raw: data }),
        __genericFallback: true
      }
    };
  }

  /**
   * Hacker News Normalization (single item) — enriched
   */
  static normalizeHackerNewsItem(item: any): NormalizedDataItem {
    const itemId = item?.id || 'unknown';
    const itemTime = item?.time && typeof item.time === 'number' ? item.time : Math.floor(Date.now() / 1000);

    const stripHTML = (html?: string) => (html ? String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');

    let publishedDate: Date;
    try {
      publishedDate = new Date(itemTime * 1000);
      if (isNaN(publishedDate.getTime())) publishedDate = new Date();
    } catch {
      publishedDate = new Date();
    }

    const title = item?.title || (item?.type === 'ask' ? 'Ask HN' : 'Hacker News Discussion');
    const text = stripHTML(item?.text);
    const type = String(item?.type || 'story');

    const tags = ['hackernews'];
    if (/^Ask HN/i.test(title)) tags.push('ask-hn');
    if (/^Show HN/i.test(title)) tags.push('show-hn');

    return {
      id: `hn-${itemId}`,
      title,
      summary: text ? text.substring(0, 500) + '...' : 'Click to view discussion',
      url: item?.url || `https://news.ycombinator.com/item?id=${itemId}`,
      publishedAt: publishedDate,
      source: 'Hacker News',
      category: type === 'job' ? 'jobs' : 'technology',
      tags,
      priority: this.mapScoreToPriority(item?.score || 0),
      trustRating: 75,
      verificationStatus: 'UNVERIFIED',
      dataQuality: 85,
      metadata: {
        by: item?.by,
        score: item?.score,
        descendants: item?.descendants,
        type: item?.type,
        kids: item?.kids
      }
    };
  }
}
