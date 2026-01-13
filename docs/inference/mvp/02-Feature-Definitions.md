# Intel Inference MVP — Feature Definitions

## Feature 1: Intel Summary
- **Purpose:** Provide a concise, mission-aware summary of the currently filtered feeds.
- **Inputs:** Filtered feeds (capped), mission mode/profile, active filters/search, timestamps, tags/sources.
- **Output format:** 3–7 bullet insights; each bullet includes a cue to source/tag; max 1.5k tokens output.
- **When triggered:** User click on primary CTA in Central View; optional retry after load failure.
- **Acceptance criteria:** No empty output; cites at least 2 distinct sources/tags when available; respects token limits; surfaces time frame (from lastUpdated/timeRange if present).

## Feature 2: Risk & Alert Recap
- **Purpose:** Highlight risks, threats, and recent alert triggers from current feeds.
- **Inputs:** Same as Summary plus alertHistory (capped) and alert counts; priority/contentType fields.
- **Output format:** Bullets segmented into “Risks/Threats” and “Alerts”; mention matched keywords; include one mitigation/next-step suggestion if risks found.
- **When triggered:** Secondary CTA in Central View; can be combined with Summary or separate tab/section.
- **Acceptance criteria:** If alerts exist, they’re mentioned; if threats present in feeds, at least one appears in output; length within limits; no hallucinated sources.

## Feature 3: Source Health Note
- **Purpose:** Summarize diagnostics and source health, advising on remediation.
- **Inputs:** Feed diagnostics (success/empty/failed, errors, latency), enabled source list, selected feed list, mission mode.
- **Output format:** Short paragraph + bullet list of failing/empty sources with reason/latency; suggested action (retry, disable, change proxy) when failures > 0.
- **When triggered:** Auto-suggested if failures detected; user-invoked otherwise via CTA or diagnostics panel.
- **Acceptance criteria:** If failures > 0, they are named; includes count of success/empty/fail; action hint present when any failure.

## Stretch Feature: Delta Since Last Summary (optional)
- **Purpose:** Describe changes between current feeds and previous summary snapshot.
- **Inputs:** Current payload + cached prior summary metadata (not yet implemented); diff of feed IDs/timestamps.
- **Output format:** Bullets for new/changed items; note removed items if detectable.
- **When triggered:** Manual “Delta” CTA; only if prior summary exists.
- **Acceptance criteria:** Guards against missing baseline; gracefully degrades to full summary if no prior state.

## Stretch Feature: Quick Answers (optional)
- **Purpose:** Single-turn Q&A over current filtered feeds.
- **Inputs:** Feeds payload + user question; strict token budget; safety prompts.
- **Output format:** Brief answer with 1–2 cited sources/tags; optional “Unable to answer” fallback.
- **When triggered:** Prompt box near summary CTA; not auto-run.
- **Acceptance criteria:** Must decline safely when question out-of-scope; must respect token cap; no hallucinated sources.

## Shared Input Contract (all features)
- Payload built via `useIntelLLMPayload`: mission mode/profile label; selectedFeedList; filters (activeFilters, timeRange, search, sort); feeds (mapped to IntelExportRecord); diagnostics summary + entries; alerts (capped); timestamps and limits metadata.
- Truncation rules: maxFeeds default 50; maxAlerts default 10; summaries note when truncation occurred.
- Redaction: remove/mask PII-like fields per schema doc; ensure URLs handled per rules.

## Shared Output Expectations
- No empty or purely boilerplate responses; each response must reference input context (time window, count, or source names/tags).
- Must avoid speculative statements; prefer “based on current feeds…” phrasing.
- Length discipline: stay within output cap; avoid long prose.

## UX Entry Points (binding to doc 06)
- Intel Summary: primary CTA in Central View header.
- Risk & Alert Recap: secondary CTA or tab near alerts indicator.
- Source Health Note: surfaced when diagnostics show failures; also callable via CTA.

## Error/Degradation Behavior
- If transport fails: show StatusMessage error; do not render stale/partial output.
- If payload empty (no feeds): present a short “no data” message instead of LLM call.
- If model returns invalid/empty text: surface error and log occurrence.

## Metrics per Feature
- Requests, successes, failures, P90 latency; token usage (req/resp); truncation count; empty-response count.

## Acceptance Checklist (global)
- Prompt uses only documented fields; payload matches schema; truncation noted; errors surfaced; metrics logged; UI states clear.
