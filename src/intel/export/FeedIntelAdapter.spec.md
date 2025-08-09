# FeedIntelAdapter Specification (Draft)

Status: Draft

## Purpose
Map current `Feed` model instances to `IntelExportRecord` structures suitable for `.intel` frontmatter + markdown export, independent of incomplete legacy Intel modules.

## Functions (Planned)
- mapFeedToIntel(feed: Feed): IntelExportRecord
- mapFeedsToIntel(feeds: Feed[]): IntelExportRecord[]
- serializeIntel(record: IntelExportRecord): string (frontmatter + body)
- validateIntel(record: IntelExportRecord): IntelValidationResult
- exportAsFile(record: IntelExportRecord): void (browser download)
- exportBatchAsZip(records: IntelExportRecord[]): Promise<Blob> (Phase 2)

## Priority Mapping
| Input | Output |
|-------|--------|
| CRITICAL | critical |
| HIGH | high |
| MEDIUM | medium |
| LOW | low |
| (missing) | medium |

## Source Mapping
- Use `feed.source` if present else derive from URL hostname (strip www, TLD).
- Normalize uppercase.

## Summary Strategy
1. Use `feed.description` if short (<=280 chars) raw text (strip HTML tags).
2. Else truncate combined (description || content) to 280 chars.

## Body Strategy
- Prefer `feed.content` if present else `feed.description` else empty string.
- Preserve markdown formatting (no mutation) except ensure trailing newline.

## Tag Normalization
- Combine `feed.tags` and `feed.categories`.
- Lowercase, trim, dedupe, stable sort.
- Omit if empty.

## Classification
- Static 'UNCLASS' for MVP.
- Future: mapping service; redaction rules.

## Validation Rules
| Field | Rule |
|-------|------|
| id | non-empty string |
| title | 1..300 chars |
| created | valid ISO date |
| classification | non-empty |
| priority | in enum set |
| sources | length >=1 |

Warnings
- Empty body -> warning
- Too many tags (>25) -> warning trim suggestion

## Frontmatter Formatting
- YAML fence '---' top & bottom.
- Key ordering per Integration Plan (id .. confidence).
- Arrays: JSON-style inline (e.g., sources: ["SOURCE"]).
- Strings: wrap only if contain colon, hash, or leading/trailing space.
- Summary/body separation: blank line after closing '---'.

## Open Items
- Decide inclusion of hash (sha256) for integrity (Phase 2).
- Determine if confidence normalization needed (0..1 clamp).

---
Generated spec to guide implementation.
