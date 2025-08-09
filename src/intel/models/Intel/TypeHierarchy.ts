/**
 * Intel Type Hierarchy Definition - Phase 3 Step 3.1
 * 
 * This file documents the clean unidirectional type hierarchy established in Phase 3.
 * It defines clear inheritance and composition relationships with no circular dependencies.
 * 
 * Date: August 2, 2025
 * Status: Implementation - Step 3.1
 */

// =============================================================================
// CLEAN TYPE HIERARCHY FLOW
// =============================================================================

/**
 * UNIDIRECTIONAL DATA FLOW ARCHITECTURE
 * 
 * Raw Sources → Intel → IntelData → IntelReport → IntelReportData
 *                ↓          ↓          ↓              ↓
 *           IntelMetaData  IntelReportMetaData  → IntelVisualization3D
 *                                      ↓              ↓
 *                              IntelReportDataPack → Intel3DAdapter
 *                                      ↓              ↓
 *                              IntelReportPackage → IntelReport3DData
 *                                                          ↓
 *                                                  3D Visualization
 */

export interface TypeHierarchyDefinition {
  // Core Foundation Layer (No dependencies)
  foundation: {
    Intel: 'Raw intelligence data points (unprocessed)';
    IntelEnums: 'Standardized classifications and categories';
    IntelLocation: 'Geographic data structures';
    IntelClassification: 'Security classification levels';
  };

  // Data Abstraction Layer (Depends on Foundation)
  dataLayer: {
    IntelData: 'Core data interface bridging Intel → IntelReport';
    IntelMetadata: 'Analysis-specific metadata for Intel objects';
    IntelReportMetaData: 'Centralized metadata management for reports';
  };

  // Processing Layer (Depends on Data Layer)
  processingLayer: {
    IntelReport: 'Unified processed intelligence reports';
    IntelReportData: 'Extended reports with blockchain support';
    Intelligence: 'Legacy intelligence interface (compatibility)';
  };

  // Visualization Layer (Depends on Processing Layer)
  visualizationLayer: {
    IntelVisualization3D: '3D visualization properties and rendering data';
    IntelReport3DData: 'Reports prepared for 3D rendering';
    Intel3DAdapter: 'Service for transforming reports to 3D data';
  };

  // Container Layer (Depends on Processing Layer)
  containerLayer: {
    DataPack: 'Universal file container format';
    IntelReportDataPack: 'Intelligence-specific DataPack extension';
    IntelReportPackage: 'Complete distribution unit with metadata';
    IntelPackage: 'Domain-specific cyber investigation container';
  };
}

// =============================================================================
// DEPENDENCY MAPPING
// =============================================================================

export interface DependencyMap {
  // Foundation Layer - NO DEPENDENCIES
  Intel: string[];
  IntelEnums: string[];
  IntelLocation: string[];
  IntelClassification: string[];

  // Data Layer - Depends on Foundation
  IntelData: ['Intel', 'IntelEnums', 'IntelLocation', 'IntelClassification'];
  IntelMetadata: ['Intel', 'IntelEnums'];
  IntelReportMetaData: ['IntelEnums', 'IntelLocation', 'IntelClassification'];

  // Processing Layer - Depends on Data Layer
  IntelReport: ['IntelData', 'IntelReportMetaData', 'IntelVisualization3D'];
  IntelReportData: ['IntelReport', 'IntelReportMetaData'];
  Intelligence: ['Intel', 'IntelEnums']; // Legacy compatibility

  // Visualization Layer - Depends on Processing Layer
  IntelVisualization3D: ['IntelEnums', 'IntelLocation'];
  IntelReport3DData: ['IntelReportData', 'IntelVisualization3D'];
  Intel3DAdapter: ['IntelReportData', 'IntelReport3DData'];

  // Container Layer - Depends on Processing Layer
  DataPack: string[];
  IntelReportDataPack: ['DataPack', 'IntelReportData'];
  IntelReportPackage: ['IntelReportDataPack', 'IntelReportMetaData'];
  IntelPackage: ['DataPack', 'IntelReportData'];
}

// =============================================================================
// TYPE RELATIONSHIP VALIDATION
// =============================================================================

export interface TypeRelationshipRules {
  // Inheritance Rules
  inheritance: {
    'All Intel types must extend from foundational interfaces': boolean;
    'Visualization types must not depend on container types': boolean;
    'Container types must not depend on visualization types': boolean;
  };

  // Composition Rules
  composition: {
    'Reports compose Data through well-defined interfaces': boolean;
    'Metadata provides context without tight coupling': boolean;
    'Adapters bridge layers without creating dependencies': boolean;
  };

  // Circular Dependency Prevention
  circularPrevention: {
    'Foundation layer has zero dependencies': boolean;
    'Each layer only depends on layers below it': boolean;
    'No bidirectional dependencies allowed': boolean;
    'Services use dependency injection patterns': boolean;
  };
}

// =============================================================================
// MIGRATION GUIDELINES
// =============================================================================

export interface MigrationGuidelines {
  // Import Standardization
  imports: {
    foundationTypes: 'import { Intel, IntelEnums } from "@/models/Intel"';
    dataTypes: 'import { IntelData, IntelReportMetaData } from "@/models/Intel"';
    processingTypes: 'import { IntelReport, IntelReportData } from "@/models/Intel"';
    visualizationTypes: 'import { IntelVisualization3D } from "@/models/Intel"';
    containerTypes: 'import { DataPack, IntelReportPackage } from "@/types"';
  };

  // Service Integration
  services: {
    'Use dependency injection for cross-layer communication': string;
    'Implement adapter pattern for type transformations': string;
    'Avoid direct imports between incompatible layers': string;
  };

  // Component Guidelines
  components: {
    'UI components should use adapter services': string;
    'Visualization components use Intel3DAdapter': string;
    'Storage services operate on container types': string;
  };
}

// =============================================================================
// PERFORMANCE OPTIMIZATION RULES
// =============================================================================

export interface PerformanceOptimization {
  // Lazy Loading
  lazyLoading: {
    'Visualization types loaded on-demand': boolean;
    'Container types loaded when needed': boolean;
    'Legacy types deprecated gradually': boolean;
  };

  // Memory Management
  memoryManagement: {
    'Avoid keeping entire hierarchy in memory': boolean;
    'Use weak references for cross-layer communication': boolean;
    'Implement cleanup for unused type instances': boolean;
  };

  // Build Optimization
  buildOptimization: {
    'Tree-shake unused type definitions': boolean;
    'Bundle layers separately for code splitting': boolean;
    'Minimize cross-layer import surface': boolean;
  };
}

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

export const HIERARCHY_VALIDATION = {
  version: '3.1.0',
  lastUpdated: '2025-08-02',
  layers: {
    foundation: ['Intel', 'IntelEnums', 'IntelLocation', 'IntelClassification'],
    data: ['IntelData', 'IntelMetadata', 'IntelReportMetaData'],
    processing: ['IntelReport', 'IntelReportData', 'Intelligence'],
    visualization: ['IntelVisualization3D', 'IntelReport3DData', 'Intel3DAdapter'],
    container: ['DataPack', 'IntelReportDataPack', 'IntelReportPackage', 'IntelPackage']
  },
  rules: {
    maxDependencyDepth: 3,
    allowedCircularDependencies: 0,
    requiredInterfaceCompliance: 100
  }
} as const;

export default TypeHierarchyDefinition;
