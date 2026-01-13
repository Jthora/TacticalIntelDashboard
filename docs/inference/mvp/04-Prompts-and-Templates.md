# Intel Inference MVP — Prompts and Templates

## Goals
- Provide deterministic, size-aware prompts per feature.
- Encode safety and grounding instructions to reduce hallucinations.
- Keep templates versioned and easily testable with mocks.

## General Prompt Principles
- Always mention the time window (from filters/timeRange or lastUpdated) if available.
- Ground statements: “Based on the provided feeds…” not speculative claims.
- Avoid inventing sources; cite tags/sources present in payload.
- Constrain length: request concise bullets; set explicit max sentences per section.
- Include guidance to acknowledge truncation if payload was capped.

## Template Variables
- `{{missionMode}}`, `{{profileLabel}}`, `{{selectedFeedList}}`
- `{{timeRange}}` (derived string), `{{feedCount}}`, `{{truncatedNote}}`
- `{{alertsBlock}}`, `{{diagnosticsBlock}}`, `{{feedsBlock}}` (structured text from payload)

## Feature Templates (v1)

### Intel Summary
```
System: You summarize intelligence feeds concisely. Do not speculate. Use only provided data.
User: Mission mode: {{missionMode}} ({{profileLabel}}). Selected list: {{selectedFeedList}}.
Time window: {{timeRange}}. Feeds provided: {{feedCount}}. {{truncatedNote}}
Tasks:
- Provide 3-7 bullet insights.
- Reference sources or tags when possible.
- Mention if data was truncated.
Data:
{{feedsBlock}}
```

### Risk & Alert Recap
```
System: You identify risks, threats, and alerts from the provided feeds. Do not invent sources.
User: Mission mode: {{missionMode}}. Time window: {{timeRange}}. Feeds: {{feedCount}}. Alerts included: {{alertsCount}}. {{truncatedNote}}
Tasks:
- List top risks/threats (bullets).
- Summarize recent alerts and matched keywords.
- Suggest one mitigation/next step if any risk is present.
Data:
{{alertsBlock}}
{{feedsBlock}}
```

### Source Health Note
```
System: You summarize source health and propose simple remediation actions.
User: Diagnostics summary: success={{successCount}}, empty={{emptyCount}}, failed={{failedCount}}. {{truncatedNote}}
Tasks:
- State which sources failed or are empty.
- Include latency/errors if given.
- Suggest a concise action (retry, disable, proxy) if failures exist.
Data:
{{diagnosticsBlock}}
```

## Blocks Construction
- `feedsBlock`: list items like `- [source: SOURCE1][priority: high][tags: a,b] title: ... summary: ...`
- `alertsBlock`: `- [priority: high][keywords: k1,k2] title: ... source: ...`
- `diagnosticsBlock`: `- SOURCE (status=failed, items=0, latency=120ms, error=timeout)`

## Size Budgeting
- Target input ≤ 8k tokens: limit feeds to 50, alerts to 10, diagnostics to 30 entries; truncate summaries to 280 chars.
- Output cap: request 1.5k tokens max; instruct model to keep bullets concise.

## Safety / Guardrails
- In system prompt: “Do not speculate. If information is missing, state that it is not provided.”
- Instruct to avoid sensitive/PII reproduction; avoid URLs unless present and required; keep to mission context.
- Require explicit mention if payload truncated.

## Fallback Prompts
- If no feeds: “No feed data available; do not fabricate insights. Respond with a brief notice.”
- If alerts missing: skip alerts section.
- If diagnostics empty: state that all sources appear healthy.

## Prompt Versioning
- Include `promptVersion: v1` in request metadata.
- Store templates alongside code; tests should snapshot-render variables for stability.

## Testing Guidance (for prompts)
- Unit snapshot test per template with fixture payload blocks.
- Ensure truncation note appears when payload indicates truncation.
- Validate that empty sections yield fallback text, not empty bullets.

## Future Enhancements
- Add language/locale support.
- Add optional “confidence/uncertainty” phrase if diagnostics poor or feeds sparse.
- Add chain-of-thought suppression hints if model tends to ramble.
