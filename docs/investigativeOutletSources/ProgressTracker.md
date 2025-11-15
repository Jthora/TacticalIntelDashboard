# Investigative Outlet Sources Progress Tracker

Use this tracker to monitor implementation status as each investigative feed is incorporated into the dashboard. Update the table after every meaningful change (endpoint creation, normalization, UI verification, testing pass, etc.).

| Outlet | RSS Feed URL | Endpoint Added | Normalizer Hooked | UI Visible | Tests Updated | Notes |
|--------|--------------|----------------|-------------------|------------|---------------|-------|
| The Intercept | https://theintercept.com/feed/ | ☑ | ☑ | ☐ | ☑ | Routed via `intercept-investigations`; UI verification pending |
| ProPublica | https://www.propublica.org/feeds/propublica-main | ☑ | ☑ | ☐ | ☑ | Routed via `propublica-investigations`; UI verification pending |
| ICIJ | https://www.icij.org/feed/ | ☑ | ☑ | ☐ | ☑ | Routed via `icij-investigations` with CORS-safe AllOrigins → feed2json fallback; UI verification pending |
| Bellingcat | https://www.bellingcat.com/feed/ | ☑ | ☑ | ☐ | ☑ | Routed via `bellingcat-investigations`; UI verification pending |
| DDoSecrets | https://torrents.ddosecrets.com/releases.xml | ☑ | ☑ | ☐ | ☑ | Routed via `ddosecrets-investigations`; UI verification pending |
| OCCRP | https://www.occrp.org/en/investigations/feed | ☑ | ☑ | ☐ | ☑ | Routed via `occrp-investigations` using AllOrigins JSON proxy + RSS normalization |

> **Note:** The Bureau of Investigative Journalism feed entry was removed on 2025-10-04 after repeated proxy failures. Reintroduce once a stable API or RSS endpoint is available.

## Milestones

- **Phase 1 – Shared Infrastructure**: `INVESTIGATIVE_RSS_API` endpoint + `normalizeInvestigativeRSS` created. _(Completed 2025-10-04)_
- **Phase 2 – Source Registration**: All seven sources added to `ModernIntelligenceSources.ts` with category tags. _(Target)_
- **Phase 3 – UI Verification**: Intel Sources module shows each outlet with correct metadata. _(Target)_
- **Phase 4 – Test Coverage**: Configuration and normalization tests updated. _(Target)_

Record milestone completion dates and add any blockers or follow-up tasks in the notes column above.
