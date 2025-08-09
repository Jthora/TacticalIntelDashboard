# Starcom Intel Integration Export Bundle

This bundle contains the core Intel / IntelReport domain models, foundational type specifications, and related services required to integrate .intel, .intelReport, and DataVault workflows into another project.

## Structure

- models/Intel/  Domain model types (Intel, IntelReport, Visualization, Metadata, Enums, Validation, Transformation)
- types/         Foundational cross-cutting specs (IntelWorkspace, IntelRepository, UnifiedIntelStorage, DataVault)
- services/      Simplified service implementations (workspace, repository, storage, vault)
- EXPORT_MANIFEST.json  Machine-readable manifest
- UPGRADE_INTEL_REPORTS_3D_GLOBE.md  (Q&A architectural upgrade document)

## Integration Order
1. Models (models/Intel) – Import into your project first.
2. Types (types/*.ts) – Wire into storage/repository abstractions.
3. Services – Adapt implementations to your runtime (filesystem, git, encryption).
4. Replace placeholder/mock implementations as you build full features.

## Key Files
- IntelReport.ts: Unified IntelReport interface and builder.
- IntelReportMetaData.ts: Comprehensive metadata schema.
- IntelVisualization3D.ts: 3D visualization & performance types.
- DataVault.ts: Secure export format interfaces.
- IntelWorkspace.ts / IntelRepository.ts: File + Git architecture.
- UnifiedIntelStorage.ts: Aggregated storage abstraction.

## Next Steps
- Implement real ingestion pipeline mapping IntelReport -> IntelReport3DData.
- Add IntelReport3DAdapter (not included) to derive visualization layer objects.
- Connect services to actual filesystem and Git client.
- Add classification/priority style mapping for globe markers.

## Verification
All original source content copied (no placeholders). Use a type checker to confirm resolution inside target project. See EXPORT_MANIFEST.json for automated validation.

## Notes
Integration tags present: INTEL_FILE_FORMAT_REFERENCE 2025-08-09 in core type specs for external compatibility tracking.
