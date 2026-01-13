# Feed Fixture Catalog

Location: tests/fixtures/feeds

## XML
- xml/basic-feed.xml — RSS 2.0 channel with one complete item and one missing link plus unexpected tags (`priority`, `unexpectedTag`).

## JSON
- json/basic-feed.json — Array-style feed with one complete item and one missing `url` plus unexpected `extra` payload.

## TXT
- txt/basic-feed.txt — Line-based feed with a missing-link example and unexpected field.
- txt/oversized-feed.txt — Padding-heavy text to exercise oversized-ingest guards.

Usage notes:
- Fixtures are intentionally minimal to keep parsing fast while covering missing fields and unexpected tags.
- Oversized TXT can be reused for size-cap tests without network fetch.
