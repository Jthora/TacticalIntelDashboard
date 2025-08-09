/**
 * Intel Domain - 3D Visualization Types
 * 
 * Minimal, focused 3D visualization interfaces extracted from bloated
 * type definitions. Designed for practical 3D intelligence display.
 */

import type { IntelPriority, IntelMarkerType } from './IntelEnums';

/**
 * Essential 3D visualization properties for intelligence reports
 */
export interface IntelVisualization3D {
  markerType: IntelMarkerType;
  color: string;
  size: number;
  opacity: number;
  priority: IntelPriority;
  icon?: string;
  label?: IntelLabel3D;
  animation?: IntelAnimation3D;
}

/**
 * Simple 3D label configuration
 */
export interface IntelLabel3D {
  text: string;
  visible: boolean;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  fontSize: number;
  color: string;
  backgroundColor?: string;
}

/**
 * Basic 3D animation configuration
 */
export interface IntelAnimation3D {
  enabled: boolean;
  type: 'pulse' | 'rotate' | 'bounce' | 'glow' | 'oscillate';
  duration: number;        // Animation duration in ms
  loop?: boolean;          // Whether to loop the animation
}

/**
 * 3D render data for Globe.gl integration
 */
export interface IntelRender3D {
  id: string;
  position: [number, number, number]; // [lng, lat, altitude]
  visible: boolean;
  scale: number;
  rotation: [number, number, number];
  color: string;
  opacity: number;
  zIndex?: number;
}

/**
 * Level of detail for performance optimization
 */
export type IntelLODLevel = 'high' | 'medium' | 'low' | 'hidden';

/**
 * 3D intel report data optimized for visualization
 */
export interface IntelReport3DData {
  // Core identification
  id: string;
  title: string;
  
  // Security and source
  classification?: string;
  source?: string;
  timestamp?: Date;
  
  // Geospatial location
  location?: {
    lat: number;
    lng: number;
    altitude?: number;
    region?: string;
  };
  
  // Temporal data
  expiresAt?: Date;
  
  // Content data (for filtering and search)
  content?: {
    summary?: string;
    details?: string;
    keywords?: string[];
    attachments?: string[];
  };
  
  // Metadata (for filtering and categorization)
  metadata?: {
    category?: string;
    tags?: string[];
    confidence?: number;
    priority?: string;
    threat_level?: string;
    reliability?: number;  // Quality measure
    freshness?: number;    // Temporal relevance
  };
  
  // Relationship data (for network analysis)
  relationships?: Array<{
    target_intel_id: string;
    type: string;
    weight?: number;
  }>;
  
  // 3D visualization
  visualization: IntelVisualization3D;
  
  // Performance optimization
  lodLevel?: IntelLODLevel;
  contextVisible?: boolean;
}

/**
 * 3D viewport configuration for scene management
 */
export interface IntelReport3DViewport {
  center: [number, number];  // [lng, lat]
  zoom: number;
  rotation: number;
  tilt: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Animation configuration for 3D elements
 */
export interface IntelAnimationConfig {
  type: 'pulse' | 'rotate' | 'bounce' | 'glow' | 'oscillate';
  duration: number;
  easing?: string;
  loop?: boolean;
  delay?: number;
  amplitude?: number;  // Animation intensity/scale
}

/**
 * Performance metrics for 3D rendering optimization
 */
export interface IntelPerformanceMetrics {
  fps: number;
  renderTime: number;
  markerCount: number;
  visibleMarkers: number;
  memoryUsage: number;
  gpuMemoryUsage?: number;
  totalIntelReports?: number;
  visibleIntelReports?: number;
  frameRate?: number;
  lastUpdate?: Date;
}
