# Intel Export Integration Plan

Status: Phase 2 substantially complete (robustness & multi-format validation ongoing)
Date: 2025-08-09 (Updated)
Owner: Integration
Scope: Map existing Feed items to canonical `.intel` file format, enable deterministic export, batch packaging, aggregated report, and parity exports for data science workflows.

## 1. Objectives
- Produce valid `.intel` markdown (frontmatter + body) from current Feed items. ✅
- Minimize coupling to incomplete legacy Intel bundle parts. ✅ (pruned / isolated)
- Provide deterministic, testable mapping & serialization (stable key ordering + quoted scalars). ✅
- Support batch zip per-article export (.intel each) & aggregated IntelReport. ✅
- Provide JSON / CSV / XML / PDF export parity for analytical users. ✅ (baseline) / Enhanced tests in progress.
- Surface validation & environmental warnings without blocking export. ✅

## 2. Deliverables & Status
| Phase | Deliverable | Description | Status |
|-------|-------------|-------------|--------|
| P1 | Mapping Spec | Field mapping Feed -> Intel | DONE |
| P1 | Serializer | Frontmatter generator (stable ordering + deterministic variant) | DONE |
| P1 | Adapter Functions | `mapFeedToIntel`, `mapFeedsToIntel` | DONE |
| P1 | Minimal Validator | Required field checks | DONE |
| P1 | Export Workflow Doc | Browser download path | DONE |
| P2 | Batch Export (Zip) | `.intel` per feed via JSZip w/ collision handling | DONE |
| P2 | Deterministic Serializer | Always-quoted scalars option | DONE |
| P2 | Robust Export Layer | `robustExportFeed(s)` warnings/errors struct | DONE |
| P2 | IntelReport | Aggregated markdown frontmatter + fenced JSON payload | DONE |
| P2 | IntelReport JSON Parity | Raw `.intelreport.json` generator | DONE |
| P2 | Edge Case Handling | Large body, tag overflow, bad timestamps, collision suffixing | DONE |
| P2 | Multi-format Exports | JSON / CSV / XML / PDF service | DONE (core) |
| P2 | Advanced Multi-format Tests | Date range, field filtering, escaping, encryption, compression | DONE (initial suite) |
| P3 | Classification Policy | Real mapping + redaction | PENDING |
| P3 | Repository Integration | Persist Intel records | PENDING |
| P3 | Performance / Stress | Large dataset scaling + memory | PENDING |
| P3 | Security Hardening | Hash/integrity, optional signing | PLANNED |

## 3. Constraints & Assumptions
- Legacy / unused intel bundle code pruned where blocking.
- All timestamps stored as ISO strings.
- `classification` placeholder `UNCLASS` until policy module lands.
- Single source derived (host) wrapped as array now for forward compatibility.

## 4. Feed -> Intel Field Mapping (Implemented)
| Intel Field | Source Feed Field | Notes |
|-------------|-------------------|-------|
| id | feed.id || feed.link || Date.now() | Fallback chain ensures uniqueness | 
| title | feed.title || 'Untitled' | Trim + truncate 300 |
| created | feed.timestamp || feed.pubDate || now | Normalized ISO |
| updated | feed.pubDate distinct from created | Only if different |
| classification | constant `UNCLASS` | Placeholder |
| priority | mapped from feed.priority | CRITICAL/HIGH/MEDIUM/LOW -> lowercased else `medium` |
| sources | [derived host] | Uppercased host extraction fallback `UNKNOWN` |
| tags | union feed.tags + categories | lowercased, deduped, sorted, omitted if empty |
| location | (not yet wired) | Reserved |
| summary | strip HTML from description/content then 280 char ellipsis | Stored if available |
| body | content || description + trailing newline | Markdown preserved |
| confidence | (not yet wired) | Reserved |

## 5. Frontmatter Ordering (Stable)
1. id
2. title
3. created
4. updated
5. classification
6. priority
7. sources
8. tags
9. location
10. summary
11. confidence

Two serializers:
- `serializeIntel` (contextual quoting)
- `serializeIntelDeterministic` (always JSON quoting scalars) ✅ used for tests & robust export

## 6. Validation (MVP Implemented)
- id: non-empty
- title: 1..300
- created: ISO-parsable
- sources: length ≥1
- priority: mapped set
- Additional soft warnings: empty body, title length overflow, etc.

## 7. Open Issues / Decisions (Updated)
| ID | Topic | Current Position | Action |
|----|-------|------------------|--------|
| O1 | Classification policy & redaction | Not implemented | Define mapping & redact rules (Phase 3) |
| O2 | Integrity hashing / signing | Not implemented | Decide format (SHA256 in frontmatter?) |
| O3 | Large dataset streaming (zip) | Not implemented | Investigate streaming zip / chunking |
| O4 | Location & confidence fields | Placeholder | Specify schema & populate |
| O5 | Unified export API | Partially split (Intel vs Multi-format) | Consider single orchestrator |
| O6 | Encryption algorithm choice | AES (CryptoJS) placeholder | Evaluate WebCrypto + key derivation |
| O7 | Compression realism | Simulated gzip | Replace with real library (pako) before prod |

## 8. Test Plan (Executed + Extensions)
Unit:
- Mapping correctness ✅
- Validation paths & warnings ✅
- Deterministic serializer ordering & quoting ✅
- Edge cases: large body, bad timestamps, tag overflow/dedupe ✅

Integration / Functional:
- Batch zip export with collision suffixing ✅
- IntelReport markdown & fenced JSON parity ✅
- Multi-format export option flows (JSON/CSV/XML/PDF) ✅
- Encryption + compression option interactions ✅

Pending / Future:
- Performance benchmarks (N=5k, 10k feeds)
- Real compression ratio assertions once pako integrated
- Integrity hash verification test (if adopted)

## 9. Risks & Mitigations (Refreshed)
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Future classification changes breaking backward compatibility | Medium | Version frontmatter schema; include `schemaVersion` |
| Memory spike on large zip | Medium | Stream or chunk in Phase 3 |
| Simulated compression misleads size expectations | Low | Replace with pako + size comparison tests |
| Encryption weak PBKDF | Medium | Migrate to WebCrypto subtle crypto + salt/IV tests |
| Frontmatter growth (new fields) destabilizes ordering | Low | Centralized order array enforced by tests |

## 10. Next Actions (Revised)
1. Design classification + redaction rules (spec + tests).
2. Introduce real gzip (pako) + update compression tests.
3. Add integrity hash (optional) and test recalculation.
4. Implement location & confidence enrichment if data available.
5. Consolidate ExportService & IntelBatchExport under unified facade.
6. Add performance benchmarks & memory usage profiling harness.
7. Evaluate WebCrypto-based encryption pipeline (salted key derivation, IV) + migration tests.

## 11. Completion Criteria
Phase 1 (DONE): mapping + serialization + basic tests.
Phase 2 (ACHIEVED): robust deterministic export, batch zip, report, edge case & multi-format baseline tests.
Phase 3 (TARGET): policy enforcement, performance, security hardening, streaming & integrity features.

## 12. Robustness & Warning Matrix
| Condition | Trigger | Outcome |
|----------|---------|---------|
| Malformed original timestamp | feed.timestamp parse fails | Warning: original parse failure |
| Post-mapping created invalid | record.created parse fails | Warning: created parse failure |
| Large body >200KB | Body bytes threshold | Warning: body size exceeds threshold |
| Tag overflow | >25 tags after dedupe | Warning: tag count exceeds 25 |
| Empty / truncated report | No feeds or truncation rule | Warning: empty/truncated report |
| Zip filename collision | Duplicate IDs | Auto suffix (-2, -3...) + warning |
| Download in non-DOM env | SSR / test | Warning: download skipped |
| Cache failure | localStorage errors | Warning: cache failed msg |
| Serialization exception | Unexpected field error | Error: serialization failed |

## 13. Multi-format Export Coverage
Implemented Formats: JSON, CSV, XML, PDF.
Advanced Tests Added: dateRange filtering, includeFields pruning, CSV quoting of commas/quotes/newlines, XML entity escaping (<, >, &, quotes), PDF blob generation, encryption (AES) filename mutation, compression + combined encryption/compression ordering.
Planned Enhancements: Real compression ratio assertions, PDF pagination snapshot invariants, XML schema validation (optional XSD).

## 14. Remaining Gaps / TODO Summary
- Real compression implementation & size delta tests
- WebCrypto encryption + KDF (PBKDF2/Argon2) evaluation
- Classification & redaction pipeline
- Integrity hash / signature (optional frontmatter field)
- Location / confidence enrichment & tests
- Performance profiling & thresholds (document + enforce)
- Unified export facade & service layering refactor

---
Document updated to reflect current implementation & forward plan.
