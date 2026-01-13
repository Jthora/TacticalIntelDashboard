# Configuration Matrix

1. Purpose
- Centralize configuration and feature flags so we can toggle relay, IPFS, PQC, and anchoring behaviors without refactors.
- Define precedence and safe defaults for environments (dev/demo/stage/prod).

2. Configuration layers
- Defaults in code (safe, offline-friendly).
- Environment variables (deployment- and secret-aware).
- Persisted user settings (localStorage) for UI preferences.
- Runtime flags (query params or debug panel) for testing.

3. Key domains and knobs
- Relay: endpoints[], activeEndpoint, publishEnabled, subscribeEnabled, relayMockMode.
- IPFS: primaryGateway, fallbackGateways[], pinningEnabled, pinningProvider, cidVersion.
- PQC: pqcEnabled, pqcPreferredScheme, hybridMode, signerFallback.
- Anchoring: anchoringEnabled, chainName, anchorMockMode, confirmationPollMs, maxRetries.
- Caching: feedCacheTtlMs, provenanceCacheTtlMs.
- Security: allowedFeedDomains[], htmlSanitizationLevel, maxPayloadSizeKb.
- Telemetry: logLevel, traceEnabled, redactPayloads, diagnosticsPanelEnabled.

4. Suggested environment variables
- RELAY_ENDPOINTS (comma-separated)
- RELAY_MOCK_MODE (true/false)
- IPFS_GATEWAY_PRIMARY
- IPFS_GATEWAYS_FALLBACK (comma-separated)
- IPFS_PINNING_ENABLED
- PQC_ENABLED
- PQC_PREFERRED_SCHEME (e.g., dilithium2)
- PQC_HYBRID_MODE (true/false)
- ANCHORING_ENABLED
- ANCHOR_CHAIN (e.g., QAN-mock)
- ANCHOR_MOCK_MODE (true/false)
- LOG_LEVEL (info|debug|warn|error)

5. Precedence rules
- Env vars override code defaults.
- User settings override env for non-sensitive UI prefs (theme, density, display).
- Sensitive and endpoint configs should be env-only (not persisted to user storage).

6. Defaults (proposed, safe)
- relayMockMode: true
- anchoringEnabled: false (until SDK/specs arrive)
- pqcEnabled: false (toggle on when mock provider is ready)
- ipfs pinning: false; primary gateway = Infura if creds exist, else public gateway
- logLevel: info; redactPayloads: true

7. Profiles
- dev: mock relay, mock anchor, pqc off, verbose logs, diagnostics panel on.
- demo: mock relay, mock anchor, pqc off or mock PQC, limited logs, stable sample data.
- stage: real relay endpoint (once available), anchor mock until chain ready, pqc off/hybrid trial.
- prod: real relay, real anchor, pqc on/hybrid, stricter security, redaction on.

8. Feature flags to expose in UI (with tooltips)
- Enable relays (subscribe/publish)
- Enable anchoring (QAN)
- Enable PQC signatures (experimental)
- Enable IPFS pinning
- Enable diagnostics panel

9. Secrets handling
- Keep credentials (Infura keys, private endpoints) in env only.
- Do not persist secrets in localStorage.
- Avoid printing secrets in logs.

10. Validation and safety
- Validate URLs for endpoints and gateways.
- Enforce max list sizes (e.g., fallback gateways count) to avoid user error.
- Clamp TTLs and payload sizes to safe ranges.

11. Observability
- Structured logs should include which backend was used (relay/anchor/signer) and config mode (mock/real).
- Add a config summary endpoint/panel to quickly inspect active settings.

12. Change management
- Document how to change configs per environment.
- Prefer versioned config files or env templates for reproducibility.

13. Testing configuration
- Provide fixtures for mock modes to ensure deterministic tests.
- Include e2e toggles to simulate relay/anchor failures.

14. Migration guidance
- Keep config keys stable; add new keys rather than renaming.
- Deprecate keys via warnings before removal.

15. Risks and mitigations
- Risk: leaking secrets via client bundle. Mitigation: env-only, avoid bundling secrets.
- Risk: misconfigured endpoints breaking UX. Mitigation: validation and fallbacks.
- Risk: flag sprawl. Mitigation: documented matrix and profiles.
