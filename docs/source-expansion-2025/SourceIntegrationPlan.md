# Source Integration Plan

## Consolidated Matrix
| Category | Source | Capture Method | Endpoint Status (2025-10-04) | Integration Tasks | Implementation Status |
|----------|--------|----------------|------------------------------|-------------------|----------------------|
| Leak-Driven Transparency | The Intercept | RSS Parsing (`https://theintercept.com/feed/`) | ✅ Valid XML | Wire existing RSS normalizer, ensure source tagged `investigative` + `leaks`; add fallback via AllOrigins raw endpoint. | ✅ Configured (2025-10-04) |
| Leak-Driven Transparency | ProPublica | Web Scraping (homepage) | ⚠️ Feed 404 | Implement HTML normalizer (selectors: `article` → `h2 a`, `time`, `p`); configure AllOrigins JSON + r.jina.ai fallbacks; throttle to 1 req/30 min. | 🔄 Planned (scraper design parked) |
| Leak-Driven Transparency | ICIJ | RSS Parsing (`https://www.icij.org/feed/`) | ✅ Valid XML | Reuse investigative RSS handler, confirm feed2json fallback, update health metrics thresholds. | ✅ Configured (Existing) |
| Leak-Driven Transparency | Bellingcat | RSS Parsing (`https://www.bellingcat.com/feed/`) | ✅ Valid XML | Same as ICIJ; extend tags for `osint`. | ✅ Configured (Existing) |
| Leak-Driven Transparency | DDoSecrets | XML Parsing (`https://torrents.ddosecrets.com/releases.xml`) | ✅ Custom XML | Extend existing DDoSecrets normalizer for empty payload fallback scraping of `/wiki/Releases`. | 🔄 Follow-up: wiki scrape fallback |
| Leak-Driven Transparency | OCCRP | Web Scraping (`https://www.occrp.org/en/investigations`) | ⚠️ Feed empty | Update HTML parser: cards `.card` or `article.post`; attach caching. | 🔄 Pending HTML implementation |
| Leak-Driven Transparency | The Bureau of Investigative Journalism | Web Scraping (`https://www.thebureauinvestigates.com/stories`) | ❌ Endpoint removed | Document reintroduction criteria; keep normalizer disabled until dependable feed discovered. | ⏸ Deferred |
| Cybersecurity Threats & Digital Forensics | Krebs on Security | RSS Parsing (`https://krebsonsecurity.com/feed/`) | ✅ Valid XML | Add RSS mapping, categorize `cybersecurity`. | ✅ Configured (2025-10-04) |
| Cybersecurity Threats & Digital Forensics | Threatpost | RSS Parsing (`https://threatpost.com/feed/`) | ✅ Valid XML | Integrate with RSS normalizer; monitor stale pubDates. | ✅ Configured (2025-10-04) |
| Cybersecurity Threats & Digital Forensics | WIRED Security | RSS Parsing (`https://www.wired.com/feed/category/security/latest/rss`) | ✅ Valid XML | Add to `technology` + `security` categories; implement summary truncation safeguards. | ✅ Configured (2025-10-04) |
| Geopolitical Intelligence & Hybrid Warfare | The Grayzone | RSS Parsing (`https://thegrayzone.com/feed/`) | ✅ Valid XML | Register as investigative + geopolitics; watch for long-form HTML in summaries. | ✅ Configured (2025-10-04) |
| Geopolitical Intelligence & Hybrid Warfare | MintPress News | RSS Parsing (`https://www.mintpressnews.com/feed/`) | ✅ Valid XML | Add to `geopolitics` bucket; sanitize embedded media. | ✅ Configured (2025-10-04) |
| Geopolitical Intelligence & Hybrid Warfare | Geopolitical Economy Report | RSS Parsing (`https://geopoliticaleconomy.com/feed/`) | ✅ Valid XML | Tag as `economics`, `geopolitics`; verify timezone offsets. | ✅ Configured (2025-10-04) |
| Surveillance & Privacy Defenses | Electronic Frontier Foundation | RSS Parsing (`https://www.eff.org/rss/updates`) | ⚠️ Intermittent fetch | Add AllOrigins + fallback to `/updates` scrape; surface errors in health metrics. | ✅ Configured (rss + fallback proxy) |
| Surveillance & Privacy Defenses | Privacy International | RSS Parsing (`https://privacyinternational.org/rss.xml`) | ✅ Valid XML | Standard RSS integration; category `privacy`. | ✅ Configured (2025-10-04) |
| Financial Networks & Elite Corruption | OpenSecrets | Web Scraping (`https://www.opensecrets.org/news`) | ⚠️ Feed 404 | Build HTML parser for `div.news-item`; respect dynamic querystring. | ✅ Configured (HTML scraper + tests) |
| Financial Networks & Elite Corruption | Transparency International | RSS Parsing (`https://www.transparency.org/en/rss`) | ⚠️ Intermittent fetch | Combine direct RSS attempt with HTML fallback on `/en/news`. | ✅ Configured (RSS w/ fallback chain) |
| Climate Resilience & Planetary Security | Inside Climate News | RSS Parsing (`https://insideclimatenews.org/feed/`) | ✅ Valid XML | Integrate with environmental tagging; confirm image metadata extraction. | ✅ Configured (2025-10-04) |
| Climate Resilience & Planetary Security | The Guardian Environment | RSS Parsing (`https://www.theguardian.com/environment/rss`) | ✅ Valid XML (requires CORS proxy) | Use AllOrigins raw fetch; enforce Guardian attribution per terms. | ✅ Configured (AllOrigins + r.jina.ai fallback) |
| AI Governance & Tech Ethics | Future of Life Institute | RSS Parsing (`https://futureoflife.org/feed/`) | ✅ Valid XML | Add to `technology` + `ethics`; handle occasional large content blocks. | ✅ Configured (2025-10-04) |

## Implementation Notes
- **RSS Reusers:** Favor `normalizeInvestigativeRSS` or create category-specific variants when extra enrichment (e.g., threat-level scoring) is required. (Completed: dedicated normalizers added for cyber, geopolitics, privacy, finance, climate, AI)
- **Scraping Targets:** Must ship with deterministic selectors, HTML sanitization, and queue-friendly fetch cadence. All scraping tasks share the `ScrapingBlueprint.md` as source of truth. (Completed for OpenSecrets; OCCRP/ProPublica pending)
- **Toggle Flags:** Each source must be guarded by `enabled` boolean and optionally environment-based whitelists for staged rollout. (Completed: feature flag utility + env overrides wired Oct 04)
- **Health Metrics:** Extend `ModernAPIService` health map to monitor success rate and response latency for all new endpoints. (In progress: baseline metrics automatically tracked; thresholds pending)
- **Link Integrity:** Each source must expose a canonical homepage for UI linking distinct from proxy endpoints. (Completed: direct domains wired for new cohorts Oct 04)
