# News & Intelligence Feed Vetting (2025-11-16)

This memo captures only the sources that returned live payloads during this session and fit the "news/intel" guidance (no raw NOAA telemetry). Each entry covers format, auth/CORS, payload schema highlights, and integration notes so we can wire them into Tactical Intel Dashboard without guesswork.

## Quick reference table

| Source | Endpoint | Format | Auth | CORS / Browser access | Notes |
| --- | --- | --- | --- | --- | --- |
| NASA News Releases | `https://www.nasa.gov/news-release/feed/` | RSS 2.0 (XML) | None | `Access-Control-Allow-Origin: *` (direct browser OK) | 301 from legacy `breaking_news.rss`; hourly updates. |
| SpaceNews | `https://spacenews.com/feed/` | RSS 2.0 | None | No CORS header → needs proxy or server fetch. | Commercial space policy/business coverage. |
| ESA Space News | `https://www.esa.int/rssfeed/Our_Activities/Space_News` | RSS 2.0 | None | No CORS header. | Mix of ESA missions + ops notices; TTL 600s. |
| U.S. Dept. of Defense (War.gov) | `https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?...` (follows to `war.gov`) | RSS 2.0 | None | `Access-Control-Allow-Origin: *` once redirected. | All-service news + weekly rollups; follow 301 via proxy or fetcher. |
| Space.com (Latest) | `https://www.space.com/feeds/all` (301 to `feeds.xml`) | RSS 2.0 | None | No CORS header. | Consumer-friendly science + astronomy situational intel. |
| Breaking Defense | `https://breakingdefense.com/feed/` | RSS 2.0 | None | No CORS header. | Defense acquisition + policy analysis. |
| C4ISRNET | `https://www.c4isrnet.com/arc/outboundfeeds/rss/?outputType=xml` | RSS 2.0 | None | No CORS header. | Signals/cyber/space mil-tech briefs; payload is large (full `<content:encoded>`). |
| Launch Library 2 | `https://ll.thespacedevs.com/2.2.0/launch/upcoming/` | JSON (REST) | None | No CORS header. | Rich launch schedule intel; pagination with `results`, `next`, `previous`. |

## Feed profiles

### NASA News Releases
- **Endpoint behavior:** legacy `https://www.nasa.gov/rss/dyn/breaking_news.rss` now 301s to `https://www.nasa.gov/news-release/feed/`. Hitting the latter directly avoids the blank payload we saw earlier.
- **Payload:** Standard RSS with modules (`content:encoded`, `media`, `atom`). `channel` advertises hourly update cadence. Items include `title`, `link`, `description`, `pubDate`, optional `media:content`.
- **Headers:** `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: GET`, so we can fetch from the browser without a proxy.
- **Integration:** Parser already supports RSS 2.0, so map to our `NewsItem` DTO. Keep category filters open for mission-critical keywords (e.g., Artemis, partnerships).

### SpaceNews
- **Endpoint:** `https://spacenews.com/feed/` served via WordPress. No auth.
- **Payload:** RSS 2.0 with `description` and `content:encoded` (HTML body). Useful metadata includes business context and policy statements.
- **Headers:** No `Access-Control-*`, so browser fetch will fail; use existing feed proxy service.
- **Integration tip:** Articles can be long-form; truncate/strip HTML when building cards, but retain `content:encoded` for drill-in.

### ESA Space News
- **Endpoint:** `https://www.esa.int/rssfeed/Our_Activities/Space_News`. Returns RSS 2.0 with TTL=600 seconds (per `<ttl>` tag) and English locale.
- **Payload highlights:** `channel` includes `category=space`. Items carry `title`, `link`, `description`, `pubDate`, and often inline `<media>` tags referencing ESA assets.
- **Headers:** No CORS support. Fetch through proxy or Edge Worker.
- **Integration:** TTL indicates we should cache for at least 10 minutes before refetching. Good source for European ops + cooperation intel.

### U.S. Department of Defense (War.gov)
- **Endpoint flow:** `https://www.defense.gov/...RSS.ashx` instantly 301s to `https://www.war.gov/...` during the current shutdown naming scheme. Use `-L`/HTTP client follow redirects.
- **Payload:** RSS 2.0 with `channel` title "Department of War News Feed" (temporary rename). Items expose `title`, `link`, `description`, `pubDate`.
- **Headers:** Final response exposes `Access-Control-Allow-Origin: *`, so direct browser pulls succeed if redirects are honored.
- **Integration:** Because the canonical host may flip back to `defense.gov`, keep redirect-following enabled in the fetcher and whitelist both domains in CSP.

### Space.com (Latest from team)
- **Endpoint:** `https://www.space.com/feeds/all` 301s to `https://www.space.com/feeds.xml`. Follow redirect.
- **Payload:** Rich RSS with heavy use of `dc:content` containing full HTML (images, inline ads). Frequent astronomy, launch, and observation tips.
- **Headers:** No CORS; require proxy.
- **Integration:** Strip/allowlist HTML tags before rendering to avoid script injection. Good for public-facing situational awareness tiles.

### Breaking Defense
- **Endpoint:** `https://breakingdefense.com/feed/`.
- **Payload:** RSS 2.0 with `description`, `content:encoded`, and occasional geolocation tags (`georss`, `geo`). Good for acquisition, doctrine, and budget intel.
- **Headers:** No CORS. Fetch via proxy.
- **Integration:** Use `content:encoded` for full analysis view; for list view surface `description` + `pubDate`.

### C4ISRNET
- **Endpoint:** `https://www.c4isrnet.com/arc/outboundfeeds/rss/?outputType=xml`. Large WordPress/Arc feed.
- **Payload:** Items include `title`, `link`, `category`, `content:encoded` with multi-paragraph HTML, plus `media:thumbnail`. Many articles directly address cyber/space/intel topics.
- **Headers:** No CORS. Response is sizable (~MB scale) so enforce gzip + caching.
- **Integration:** Consider trimming `content:encoded` before storing; we mostly need summary + hero image for cards.

### Launch Library 2 (Operations intel)
- **Endpoint:** `https://ll.thespacedevs.com/2.2.0/launch/upcoming/` (supports query params such as `limit`, `offset`, `search`, `hide_recent_previous`).
- **Payload:** JSON with keys `count`, `next`, `previous`, `results`. Each launch contains `status`, `net`, `rocket.configuration`, `mission` (with `description`, `type`, `agencies`), and `pad/location` metadata.
- **Headers:** No CORS; expect to hit via serverless proxy or backend.
- **Integration:** Rich structured data for mission cards and timeline visualizations. Respect rate limits (default 15 RPM) by caching responses per query for ~1 minute.

## Implementation checklist
- [ ] Wire NASA + Defense feeds directly (browser-safe) and keep redirect-following on the fetcher.
- [ ] Route the remaining RSS feeds through the existing feed proxy (or Edge worker) so CORS doesn’t block the UI.
- [ ] Extend feed parser test matrix with fixtures from each source to lock in schema assumptions (`title`, `description`, `content:encoded`, `media`).
- [ ] Add Launch Library client wrapper with pagination + minimal field projection to keep payloads light.

## Deferred / excluded sources
- US Space Force RSS endpoints currently 301 to unrelated DFAS feeds; no working category IDs discovered this pass, so omitted.
- CISA ICS advisories feed blocked by Akamai (Access Denied); needs authenticated/VPN path before inclusion.
- Secure World Foundation & UNOOSA RSS endpoints returned 404s; alternative sources still under investigation.

Only the feeds above produced live data without auth, so they’re safe to integrate immediately.
