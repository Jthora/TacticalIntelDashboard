# Intel Source Expansion Plan — Q4 2025

## Objective
Add twelve high-value investigative, cybersecurity, geopolitical, civil-liberties, financial-transparency, climate, and AI-governance sources to the Tactical Intel Dashboard without degrading existing feed reliability. Each source must ship with a resilient ingestion path, normalization hook, and automated regression coverage.

## Scope
- Incorporate the consolidated research list delivered on 2025-10-04.
- Revisit previously-removed sources (e.g., TBIJ) only if a reliable endpoint or scrape contract is documented.
- Produce reusable ingestion blueprints (RSS vs. HTML scraping) for future outlets in the same category cohorts.
- Maintain parity between Modern API architecture and legacy adapters.

## Key Deliverables
1. Updated `ModernIntelligenceSources` and adapters with source metadata and category mappings.
2. Normalization utilities (RSS-focused or custom HTML) with Jest coverage.
3. Proxy orchestration updates (`ModernFeedService`) including fallback chains.
4. Ops runbook additions covering smoke tests, alerting signals, and rollback procedure for each new source.
5. Documentation bundle (this folder) kept in sync with implementation status.

## Phase Breakdown
| Phase | Window | Goal | Status | Exit Criteria |
|-------|--------|------|--------|---------------|
| Discovery & Validation | Oct 04 – Oct 11 | Confirm feed endpoints, determine capture method, record blockers | ✅ Completed Oct 04 | All sources categorized with preferred ingestion method and selectors |
| API Wiring | Oct 11 – Oct 25 | Implement endpoints, normalizers, and caching strategies | 🔄 In Progress | All new sources return ≥3 items via `fetchSourceData`, tests green |
| UI & UX QA | Oct 25 – Nov 01 | Ensure cards render properly, tags/categorization accurate | ☐ Not Started | Visual QA sign-off, marquee ingestion verified |
| Launch & Monitoring | Nov 01 – Nov 08 | Deploy to production, enable health metrics | ☐ Not Started | Source health dashboards updated, alert thresholds configured |

## Stakeholders
- **Intel Data Engineering:** Modern feed integration and proxy tuning.
- **Frontend/UX:** Sidebar taxonomy, responsiveness, accessibility.
- **Ops & Reliability:** Monitoring hooks, alert routing, cache invalidation policies.
- **Research & Compliance:** Validates source legitimacy and licensing constraints.

## Guiding Constraints
- Zero new unauthenticated remote services; leverage existing proxy pattern (AllOrigins, r.jina.ai) or Netlify/Cloudflare workers.
- Sensitive scraping (e.g., OCCRP, TBIJ) must respect robots.txt and throttle policies.
- All additions require toggle flags to facilitate incremental rollout.
- RSS-first integrations must still define HTML fallback selectors when feeds intermittently fail.

## Folder Map
- `SourceIntegrationPlan.md` — consolidated matrix of sources, capture methods, and task owners.
- `ScrapingBlueprint.md` — DOM selectors, pagination, and sanitization rules for non-RSS sources.
- `VerificationChecklist.md` — testing, monitoring, and rollback steps per phase.

_Updated automatically as implementation progresses._
