/**
 * Intel Domain - Core Enumerations
 * 
 * Essential enums extracted from bloated type definitions for clean, 
 * reusable intelligence classification and categorization.
 */

/**
 * Security classification levels for intelligence reports
 */
export type IntelClassification = 
  | 'UNCLASSIFIED'
  | 'CONFIDENTIAL'
  | 'SECRET'
  | 'TOP_SECRET'
  | 'COMPARTMENTED';

/**
 * Intelligence report priority levels
 */
export type IntelPriority = 'critical' | 'high' | 'medium' | 'low' | 'background';

/**
 * Threat level assessment for intelligence
 */
export type IntelThreatLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'critical';

/**
 * Intelligence category classification
 */
export type IntelCategory = 
  | 'cyber_threat'
  | 'physical_security'
  | 'financial_crime'
  | 'geopolitical'
  | 'infrastructure'
  | 'personnel'
  | 'operational'
  | 'strategic'
  | 'tactical';

/**
 * 3D marker types for visualization
 */
export type IntelMarkerType = 
  | 'standard'      // Default intel marker
  | 'priority'      // High-priority intel
  | 'alert'         // Alert/warning intel
  | 'classified'    // Classified intel marker
  | 'verified'      // Verified intel marker
  | 'unverified'    // Unverified intel marker
  | 'archived';     // Archived intel marker

/**
 * Relationship types between intelligence reports
 */
export type IntelRelationshipType = 
  | 'related_to'
  | 'follows_from'
  | 'contradicts'
  | 'confirms'
  | 'updates'
  | 'supersedes'
  | 'part_of'
  | 'references';
