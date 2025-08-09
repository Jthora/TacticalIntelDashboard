/**
 * EXPORTED COPY
 * Source: src/types/intel-foundation/index.ts
 * Date: 2025-08-09
 * NOTE: Reconstructed during integration (placeholder removed)
 */

// Barrel exports for core domain model types (no services to avoid name collisions)
export * from '../models/Intel/Intel';
export * from '../models/Intel/IntelReport';
export * from '../models/Intel/IntelReportMetaData';
export * from '../models/Intel/IntelVisualization3D';
export * from '../models/Intel/IntelEnums';
export * from '../models/Intel/IntelLocation';
export * from '../models/Intel/Classification';
export * from '../models/Intel/Sources';
// Requirements intentionally omitted (IntelRequirement already exported via Intel.ts)
export * from '../models/Intel/TypeHierarchy';
export * from '../models/Intel/Transformers';
export * from '../models/Intel/Validators';

// Services intentionally NOT wildcard re-exported to prevent Validation* and Intel* type collisions.
// Import directly when needed, e.g.:
// import { IntelWorkspaceService } from '../../services/IntelWorkspaceService';

// INTEGRATION_TAG: INTEL_FILE_FORMAT_REFERENCE 2025-08-09 (aggregate barrel)
