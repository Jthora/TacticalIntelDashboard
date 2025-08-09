# Intel Export Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|----|------|-----------|--------|-----------|--------|
| R1 | Missing legacy module references block build | High | High | Prune imports or add stubs | Open |
| R2 | Priority mapping mismatch with UI severity | Medium | Medium | Central mapping table + tests | Open |
| R3 | Incorrect timestamp serialization | Low | Medium | ISO parse/format tests | Open |
| R4 | Large export size impacts UX | Low | Low | Option to truncate summaries | Deferred |
| R5 | Classification misinterpretation | Medium | Medium | Explicit placeholder + docs | Open |
| R6 | Duplicate tags pollution | Medium | Low | Dedup utility | Open |
