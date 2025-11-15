# Scraping Blueprint

> Use this document whenever an intel outlet lacks a dependable RSS/Atom payload. All selectors verified on 2025-10-04. Re-validate if markup drifts.

## Shared Requirements
- Perform fetches through approved proxies (`https://api.allorigins.win/get?url=...`, `https://r.jina.ai/https://...`).
- Normalize HTML with `DOMParser` and enforce `rel="noopener"` when rewriting anchors.
- Strip tracking query parameters (`utm_*`, `mc_cid`, etc.).
- Convert datetime strings to ISO using `DateNormalizer.parseDateSafe` (extend helper if necessary).
- Respect politeness delay: minimum 30 minutes between scrapes per domain.

## ProPublica
- **Base URL:** `https://www.propublica.org/`
- **Primary selectors:**
  - Article card: `article` within `section#stream`.
  - Title/URL: `h2 a` (relative URLs → prefix with `https://www.propublica.org`).
  - Published: `time[datetime]` (fallback `time` text).
  - Summary: `p.story-card__deck`.
- **Fallback:** If homepage fails, query `/topics/investigations` with identical selectors.
- **Notes:** Some cards labeled “Podcast” — tag with `type=audio` and consider excluding if normalization scope is text-only.

## OCCRP
- **Base URL:** `https://www.occrp.org/en/investigations`
- **Selectors:**
  - Card: `article.post`.
  - Title/URL: `h2.entry-title a`.
  - Published: `time` attribute `datetime`.
  - Summary: `div.entry-summary p` (strip trailing “Read more”).
- **Pagination:** Append `?start=<offset>`; limit to first page until demand grows.
- **Notes:** Images served via lazy-loading `data-src`; capture for thumbnails.

## OpenSecrets
- **Base URL:** `https://www.opensecrets.org/news`
- **Selectors:**
  - Card: `div.news-item`.
  - Title/URL: `h3 a`.
  - Published: `span.date` (format `MMM DD, YYYY`).
  - Summary: `p.teaser`.
- **Notes:** Many articles include category badges; store under `metadata.tags` for filtering.

## Transparency International (Fallback)
- **Base URL:** `https://www.transparency.org/en/news`
- **Selectors:**
  - Card: `article.teaser`.
  - Title/URL: `a.teaser__link`.
  - Published: `time` attribute `datetime`.
  - Summary: `p.teaser__text`.
- **Usage:** Only trigger if RSS fetch fails twice consecutively.

## Electronic Frontier Foundation (Fallback)
- **Base URL:** `https://www.eff.org/updates`
- **Selectors:**
  - Card: `article` with class `view-content` descendant.
  - Title/URL: `h2 a`.
  - Published: `time` attribute `datetime`.
  - Summary: `.field-body p` (first paragraph).
- **Notes:** Mark posts tagged “Deeplinks” with `tags += ['deeplinks']`.

## The Bureau of Investigative Journalism (Deferred)
- **Status:** Source disabled until stable endpoint exists.
- **When reactivated:**
  - Primary: `https://www.thebureauinvestigates.com/stories`
  - Selectors: `.tb-c-story-preview` anchors (`heading`, `meta-item`, `body`).
  - Markdown fallback: newsletter archives via embedded markdown block.
- **Action:** Revisit once ops secures reliable HTML snapshot service.

## Validation Harness
- Add Playwright smoke script to `tests/feeds` validating DOM extraction for each scraper.
- Capture sanitized HTML fixtures under `samples/html/` to support Jest tests (`DataNormalizer` suites).
- Logging: include `scrapeVersion` in metadata to aid debugging when selectors drift.
