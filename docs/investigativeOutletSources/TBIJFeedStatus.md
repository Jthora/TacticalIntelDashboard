# TBIJ Feed Removal Log

**Last Updated:** 2025-10-04

The Bureau of Investigative Journalism (`tbij-investigations`) source was removed from the Tactical Intel Dashboard due to persistent proxy instability and the absence of an official RSS feed. Keep this note as an audit trail in case the outlet exposes a reliable API in the future.

## Reintroduction Checklist

- ✅ Confirm the publisher offers an authenticated or CORS-permissive JSON/RSS endpoint.
- ✅ Verify at least two redundant mirrors or proxies deliver matching payloads.
- ✅ Re-enable the source in `PRIMARY_INTELLIGENCE_SOURCES` with a passing integration test suite.
- ✅ Update investigative source documentation and milestone trackers.

Until these conditions are met, the dashboard will exclude TBIJ content.
