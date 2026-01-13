# Feed Smoke Tests

Location: src/utils/__tests__/fetchFeed.smoke.test.ts

Coverage:
- XML fixture (tests/fixtures/feeds/xml/basic-feed.xml): ensures fallback link and valid pubDate when fields missing.
- JSON fixture (tests/fixtures/feeds/json/basic-feed.json): exercises defaulting for missing link/pubDate/description/content/author/categories/media.
- TXT fixture (tests/fixtures/feeds/txt/basic-feed.txt): pipe-delimited records with a missing-link case and category preservation.

Notes:
- Tests mock fetch and use FEED_ALLOWED_HOSTS to permit example.com.
- Structured ingest logging produces console output; tests assert on data, not logs.
- Oversized TXT fixture available for negative size-cap scenarios (tests/fixtures/feeds/txt/oversized-feed.txt).
