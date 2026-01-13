# Intel Inference MVP — UX Flows

## Principles
- One- to two-click access from the Central View; no deep navigation.
- Clear states: idle, loading, success, error; no silent failures.
- Accessible: keyboard navigable, screen reader-friendly status updates.

## Entry Points
- Central View header: primary CTA “Summarize Intel”.
- Secondary CTA “Risk & Alerts” near alerts indicator (or dropdown).
- Diagnostics banner CTA “Source Health Note” when failures detected.

## States and Copy (suggested)
- Idle: button enabled; tooltip “Summarize current feeds”.
- Loading: spinner + text “Generating summary (≤10s)…”. Disable CTA; allow cancel if transport supports abort.
- Success: render result block with timestamp and “Re-run” link.
- Error: inline alert “Couldn’t generate summary. Check connection or retry.”
- Empty data: “No feeds to summarize. Select a feed list first.”

## Layout
- Result panel under header (same column as feed list), collapsible.
- Show metadata: lastUpdated, feed count, truncation notice, requestId (dev/debug view).
- Keep vertical space modest; collapse older result when new one loads.

## Truncation/Warnings Display
- If truncation occurred: “Showing top N of M feeds; output may omit some items.”
- If diagnostics failures present: suggest Source Health Note CTA.

## Interactions
- Clicking CTA triggers payload build → transport call.
- Disable CTA while in-flight; re-enable after completion or error.
- “Re-run” uses same selection/filter context; “Copy” button optional.

## Accessibility
- Buttons focusable; aria-labels for CTAs.
- Live regions for loading/error/success messages.
- Color contrast and non-color cues for status.

## Edge Cases
- No feeds: skip call; show empty message.
- Transport timeout: show error; CTA re-enabled.
- Circuit open/rate-limit: CTA disabled with message.

## Telemetry Hooks (for UX)
- Log CTA clicks, success/failure, latency buckets, and cancellations.
- Capture whether truncation notice was shown.

## Content Placement
- Summary block: bullets with brief leading labels (e.g., [SOURCE] or [TAG]).
- Risk block: separate heading, highlight critical/high items.
- Source health: callout panel with failing sources list.

## Future Enhancements
- Toggle to stream partial results (post-MVP).
- History of last 3 summaries with timestamps.
- Quick question input field (if Quick Answers added).

## Acceptance (UX)
- User can reach summary in ≤2 clicks from Home.
- Clear feedback during loading and on errors.
- Truncation and diagnostics caveats surfaced when relevant.
