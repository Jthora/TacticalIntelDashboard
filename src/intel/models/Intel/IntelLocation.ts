/**
 * Intel Domain - Geospatial Location Types
 * 
 * Clean, focused geospatial interfaces for intelligence location data.
 * Extracted from bloated type definitions for better organization.
 */

/**
 * Core geospatial location for intelligence reports
 */
export interface IntelLocation {
  lat: number;
  lng: number;
  altitude?: number;
  accuracy?: number;
  region?: string;
  timezone?: string;
}

/**
 * Geographic bounds for area-based intelligence
 */
export interface IntelGeographicBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom?: number;
}

/**
 * Geospatial region for contextual intelligence filtering
 */
export interface IntelGeographicRegion {
  id: string;
  name: string;
  bounds: IntelGeographicBounds;
  description?: string;
}
