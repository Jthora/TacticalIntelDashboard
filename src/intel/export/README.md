# Intel Export Module (Work In Progress)

This folder contains planning artifacts and types for exporting current Feed data into `.intel` files.

## Current Contents
- IntelExportTypes.ts: Local types (IntelExportRecord, validation types).
- FeedIntelAdapter.spec.md: Functional spec for mapping, serialization, and export helpers.

## Not Yet Implemented
- Adapter functions
- Serializer
- Validator
- Download integration

## Next Steps
1. Implement priority & source mapping utilities.
2. Implement mapFeedToIntel + validation.
3. Implement serializer (frontmatter + body).
4. Add unit tests (mapping & serialization determinism).
5. Wire into UI action (export single item) behind feature flag.
