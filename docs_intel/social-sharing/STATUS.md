# Social Sharing Status Snapshot

_Last reviewed: 2025-10-01_

## Current Implementation Surface
- **UI Components**
  - `src/features/feeds/components/FeedItem.tsx`: "Open", "Copy", and "Bookmark" actions in the feed card footer. No social share triggers yet; this is the obvious slot for an additional share affordance.
  - `docs/implementation/COMPONENT_ARCHITECTURE_GUIDE.md`: design spec references an optional `onShare` callback in `TacticalIntelCard`, but the production component tree does not wire it up.
- **Export Stack**
  - `src/services/ExportService.ts` & `src/components/Export.tsx`: handle JSON/CSV/XML/PDF exports plus `.intel` and `.intelreport` flows via `src/intel/export/IntelBatchExport.ts`. These outputs can seed social sharing (e.g., link to hosted documents) but there is no direct bridge today.
- **Cross-Platform Bridge**
  - `src/services/IntelligenceBridge.ts`: IPFS/Web3 publishing for intelligence packets. Useful for distributed sharing, but not integrated with any social platform.
- **Verification Utilities**
  - `src/services/SourceVerificationService.ts`: only tangential mention of `twitter.com` within censorship heuristics; no outbound share logic.

## What Does **Not** Exist Yet
- No `X/Twitter` API client, OAuth flow, or intent URL helper.
- No Web Share API invocation or clipboard-based tweet composer.
- No settings schema for social accounts or consent preferences.
- No tests asserting share affordances or outbound link formatting.

## Recommended First Steps Toward X.com Support
1. **Intent Builder Utility**  
   Create a small helper (e.g., `src/utils/socialShare.ts`) that can format X intent URLs (`https://twitter.com/intent/tweet`) with encoded title, URL, and hashtags. Provide fallbacks for the rebranded `https://x.com/intent/...` URLs once confirmed.
2. **UI Hook-Up**  
   Extend `FeedItem` (and future `TacticalIntelCard`) with a share button that:
   - Uses the Web Share API when available.
   - Falls back to opening the intent URL in a new tab.
   - Logs analytics via `LoggerService` for traceability.
3. **Configuration Guardrails**  
   Add optional toggles to `SettingsContext` (`settings.general.share`) so sharing can be enabled/disabled, and allow custom hashtag or attribution strings.
4. **Service Layer**  
   If native posting is required, introduce an `XShareService` that stores tokens securely (server-side or via edge function) and exposes signed posting endpoints. This repo currently has no backend, so intent URLs are the safest MVP.
5. **Testing**  
   Add React Testing Library coverage verifying that the share button renders, builds the correct intent link, and respects disabled settings. Include a utility-level unit test for the formatter.

## Critique of the Current Export Integration Plan (2025-08-15)
- The plan in `docs/intel/INTEL_EXPORT_INTEGRATION_PLAN.md` focuses on deterministic `.intel` generation and multi-format parity, but it never declares how exports will surface to social channels. Without a distribution strategy, Phase 2 risks producing artifacts that stay locked inside the dashboard.
- Phase 3 priorities (classification, integrity, security) are essential, yet there is no workstream to translate those hardened outputs into shareable narratives or redacted summaries for public platforms like X.com. We should slot a “Phase 3½” task to define share-safe templates and guardrails.
- The warning matrix handles file-level issues (timestamps, large bodies) but nothing about social compliance (character count, attribution requirements, embargoed data). That gap could create compliance drift once sharing is enabled.
- No mention of Web Share API, short-link strategy, or IPFS gateway publishing in the plan; all are prerequisites if we expect analysts to push exports to social audiences quickly.
- Suggested addition: introduce a “Social Dissemination” deliverable covering intent URL utilities, share presets, and analytics hooks so exports can be measured post-publication.

## Longer-Term Enhancements
- Draft rate-limit handling / retry strategy if direct API posting is added later.
- Explore auto-attaching exported `.intel` artefacts by publishing to IPFS (`IntelligenceBridge`) and injecting the resulting gateway URL into the tweet text.
- Coordinate with existing export batching so operators can share curated summaries rather than raw feed links.
- Document privacy implications and ensure redaction policies (Phase 3 export tasks) complete before auto-sharing sensitive content.

## Quick Reference Checklist
- [ ] Add share helper utility
- [ ] Wire share button into feed cards
- [ ] Expose share settings (enable flag, hashtag preset)
- [ ] Implement tests for share flows
- [ ] Update docs/user guide once flows ship

---
This snapshot is meant to accelerate future social-share work by centralizing the current state and immediate integration points.
