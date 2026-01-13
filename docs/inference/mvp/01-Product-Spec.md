# Intel Inference MVP — Product Spec

## Problem Statement
- Users need rapid, reliable AI-generated summaries and risk insights over the currently selected intelligence feeds without leaving the Tactical Intel Dashboard.
- The system must operate under mission-mode constraints (source availability, classification posture) and surface actionable, trustworthy output with clear provenance and guardrails.
- Latency, cost, and safety constraints must be explicit so we can ship confidently to production.

## Target Users
- Intelligence analysts monitoring multiple feeds in real time.
- Operations leads who need quick situational rollups (summary + risks + alerts recap).
- Platform operators who monitor source health and want a synthesized view of failures/coverage.

## In-Scope (MVP)
- Single-click AI inference from the Central View context over the currently filtered feeds.
- Three core experiences: Intel Summary, Risk & Alert Recap, Source Health Note.
- Deterministic payload schema sourced from in-app state (filters, mission mode, diagnostics, alerts).
- Prompt templates per experience with size budgeting and fallbacks.
- Transport layer with timeouts, retries, error surfacing, and basic logging/metrics.
- Minimal UI affordance (button/CTA) with loading, success, and error states.

## Out-of-Scope (MVP)
- Long-form reports, PDF exports, or offline batch jobs.
- Multi-turn chat over historical intel.
- Fine-grained per-user prompt customization.
- Automated auto-run without user initiation (except optional smoke tests).

## Success Criteria
- P90 end-to-end latency (click to rendered text) ≤ 6s; hard timeout 10s.
- Token budget: request ≤ 8k tokens, response ≤ 1.5k tokens; enforced truncation with metadata noting drops.
- Safety: zero rendering of empty/errored responses; errors surfaced via StatusMessage.
- Reliability: retry once on network failure; graceful degradation with user-visible message.
- Usage: feature exercised by internal users without manual intervention; no fatal regressions across missions.

## Constraints
- Rate limits from LLM provider (define per key/environment); must not exceed daily budget.
- Cost ceilings: cap tokens/requests per user per hour; expose counters in logs/metrics.
- Privacy: redact PII-like fields (author names, raw URLs if flagged) per redaction rules.
- Data freshness: only current filtered feeds; no historical pulls beyond in-memory state.

## Dependencies
- LLM provider endpoint (to be selected), API keys per env (sandbox, prod).
- `useIntelLLMPayload` hook for deterministic payload assembly.
- Prompt templates (doc 04) and payload schema (doc 03).
- Transport client with observability (doc 05).
- UI entry point (doc 06) and feature flag to gate rollout (doc 08).

## Feature List (MVP)
1) Intel Summary — high-level recap of current filtered feeds.
2) Risk & Alert Recap — emphasize alert triggers + threat/risk language from feeds.
3) Source Health Note — summarize diagnostics (fail/empty/success) and suggest actions.

## Acceptance Criteria (per feature)
- Intel Summary: returns 3–7 bullet insights; must cite source names or tags; no empty output.
- Risk & Alert Recap: mentions alert count and top matched keywords; includes at least one mitigation hint if risk terms present.
- Source Health Note: lists failing sources with reason; suggests retry or disable action if failures > 0.

## User Stories
- As an analyst, I click “Summarize Intel” and receive a concise, tagged summary in under 6s.
- As an operator, I see a Source Health Note when sources are failing, with suggested next steps.
- As a lead, I get a Risk & Alert Recap that surfaces critical/alert-level items and recent triggers.

## Non-Functional Requirements
- Latency targets above; graceful timeout handling.
- Observability: log payload size, response latency, status; emit metrics counters.
- Accessibility: button is keyboard-accessible; loading and error states announced.
- Resilience: one retry with backoff; no unbounded retries.

## Risks / Mitigations (high level)
- Hallucinations: include guardrails in prompts; keep payload grounded; apply length caps.
- Token overrun: enforce limits and truncation with metadata.
- Provider outages: surface error and skip rendering; optional fallback provider (future).
- Cost overruns: cap requests per session; log tokens; feature flag kill-switch.

## Open Decisions
- Which LLM model/provider (latency vs cost vs quality trade-off).
- Exact redaction rules for authors/URLs.
- Response validation: minimal regex or schema check before render.
- Whether to cache last successful summary per feed selection for diffing.

## Rollout Plan (summary)
- Start behind feature flag in sandbox.
- Enable internal users only; capture metrics.
- Promote to prod with canary (small % users) once latency and error rates are within SLOs.

## Deliverables
- Finalized schema and prompts; implemented transport and UI entry point; tests (unit, mocked, smoke); runbook and metrics dashboard.
