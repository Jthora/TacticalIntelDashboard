# Intel Inference MVP — Payload Schema

## Goals
- Provide a deterministic, documented JSON payload for all inference calls.
- Enforce size limits and redaction rules before transport.
- Support backward-compatible evolution via versioning.

## Top-Level Structure (v1)
- `version`: string (e.g., "1.0")
- `mission`: { `mode`: string; `profileLabel`: string; `selectedFeedList`: string|null }
- `filters`: { `activeFilters`: string[]; `timeRange`: {start:string,end:string,label:string}|null; `searchQuery`: string; `sortBy`: {field:string; direction:string} }
- `feeds`: { `intel`: IntelExportRecord[]; `count`: number; `total`: number; `raw`?: Feed[]; `truncated`: boolean }
- `diagnostics`: { `summary`: {success:number; empty:number; failed:number}; `entries`: FeedFetchDiagnostic[] }
- `alerts`: { `triggers`: AlertTriggerLite[]; `count`: number; `truncated`: boolean }
- `timestamps`: { `lastUpdated`: string|null; `generatedAt`: string }
- `limits`: { `maxFeeds`: number; `maxAlerts`: number }
- `notes`: { `truncation`: string[]; `redactions`: string[] }

## IntelExportRecord (from adapter)
- `id`: string
- `title`: string (trimmed, ≤300 chars)
- `created`: ISO string
- `updated`?: ISO string
- `classification`: string (e.g., UNCLASS)
- `priority`: 'critical'|'high'|'medium'|'low'
- `sources`: string[] (UPPER, host-derived if absent)
- `tags`?: string[] (lowercase, deduped, sorted)
- `summary`?: string (HTML stripped, ≤280 chars)
- `body`: string (content/description; ensured trailing newline)
- `location`?: {lat:number; lon:number; name?:string}
- `confidence`?: number|string

## Feed (optional raw passthrough, if enabled)
- As defined in models/Feed.ts; include only if `includeRawFeeds` is true; subject to redaction.

## FeedFetchDiagnostic
- `sourceId`: string; `sourceName`: string; `status`: 'success'|'empty'|'failed'; `itemsFetched`: number; `durationMs`: number; `error`?: string; `notes`?: string.

## AlertTriggerLite (recommended minimal)
- `id`: string; `alertId`: string; `triggeredAt`: ISO string; `matchedKeywords`: string[]; `priority`: string; `source`: string; `title`: string; `link`: string; `pubDate`: string.

## Limits & Truncation
- Default `maxFeeds`: 50; default `maxAlerts`: 10.
- If feeds > maxFeeds, truncate `intel` to maxFeeds, set `truncated=true`, add note in `notes.truncation`.
- If alerts > maxAlerts, truncate triggers; set `truncated=true`.
- Enforce total payload size target < 64KB; if exceeded, drop `raw` feeds and note redaction.

## Redaction Rules (initial)
- Remove PII-like author fields when present in raw feeds unless explicitly allowed.
- Strip or hash long querystrings in URLs if exceeding 200 chars; keep host/path.
- Drop embedded HTML in summaries; store plain text only.
- Ensure tags are lowercase; remove empty strings.

## Versioning
- `version` field required; start with "1.0".
- Backward-compatible changes: adding optional fields.
- Breaking changes require version bump; client must send known version.

## Validation
- Required: `mission.mode`, `mission.profileLabel`, `feeds.intel[]`, `timestamps.generatedAt`.
- Reject/abort send if `feeds.intel.length === 0` and `feeds.total === 0`; surface user message instead of calling LLM.
- Timestamps must parse as valid ISO; if not, replace with `generatedAt` and add note.

## Examples
- **Minimal**: single feed, no alerts, diagnostics empty; truncation false.
- **Typical**: 20 feeds, 3 alerts, diagnostics with mixed statuses; truncation false.
- **Large capped**: 120 feeds incoming → truncated to 50; alerts 30 → truncated to 10; notes include both truncations.

## Storage/Telemetry Notes
- Do not persist payloads at rest (privacy). Log only sizes and counts, not full text.
- Metrics: payload size bytes, feed count, alert count, truncation flags.

## Evolution Ideas (post-MVP)
- Add `diff` block for delta summaries; add `sentiment`/`threatScore` fields if computed client-side; include `modelHints` for routing.
