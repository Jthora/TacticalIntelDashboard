// Intelligence Collection Requirements
// Implementation of Improvement #2: Better Service Organization

import { PrimaryIntelSource, CollectionMethod } from './Sources';
import { ClassificationLevel } from './Classification';

/**
 * Collection Priority Levels
 */
export type CollectionPriority = 
  | 'FLASH_OVERRIDE'  // Highest priority - immediate action required
  | 'FLASH'           // Immediate priority
  | 'IMMEDIATE'       // Immediate handling
  | 'PRIORITY'        // Priority handling
  | 'ROUTINE';        // Routine priority

/**
 * Intelligence Requirements Categories
 */
export type RequirementCategory = 
  | 'STRATEGIC'       // Strategic intelligence needs
  | 'TACTICAL'        // Tactical intelligence needs
  | 'OPERATIONAL'     // Operational intelligence needs
  | 'TECHNICAL'       // Technical intelligence needs
  | 'COUNTERINTEL'    // Counterintelligence needs
  | 'FORCE_PROTECTION'; // Force protection needs

/**
 * Essential Elements of Information (EEI)
 * Critical information needed for decision making
 */
export interface EssentialElement {
  id: string;
  question: string;
  priority: CollectionPriority;
  deadline: number; // timestamp
  applicableSources: PrimaryIntelSource[];
  status: 'OPEN' | 'PARTIAL' | 'SATISFIED' | 'UNABLE_TO_COLLECT';
  percentComplete: number; // 0-100
}

/**
 * Geographic Area of Interest
 */
export interface AreaOfInterest {
  id: string;
  name: string;
  description: string;
  coordinates: {
    type: 'POINT' | 'POLYGON' | 'CIRCLE' | 'CORRIDOR';
    points: Array<{
      latitude: number;
      longitude: number;
    }>;
    radius?: number; // For circle type, in meters
    width?: number; // For corridor type, in meters
  };
  priority: CollectionPriority;
  timeframe: {
    start: number;
    end: number;
  };
}

/**
 * Intelligence Collection Requirement
 */
export interface IntelRequirement {
  // Identification
  id: string;
  title: string;
  description: string;
  category: RequirementCategory;
  
  // Priority and timing
  priority: CollectionPriority;
  deadline: number; // timestamp
  validUntil?: number; // requirement expiration
  
  // What we need to know
  essentialElements: EssentialElement[];
  specificQuestions: string[];
  
  // Where to collect
  areasOfInterest: AreaOfInterest[];
  targetLocation?: {
    latitude: number;
    longitude: number;
    radius: number; // meters
  };
  
  // How to collect
  preferredSources: PrimaryIntelSource[];
  preferredMethods: CollectionMethod[];
  prohibitedSources?: PrimaryIntelSource[]; // Sources not to use
  
  // Security and handling
  classification: ClassificationLevel;
  compartments?: string[];
  releasabilityTo?: string[];
  
  // Requestor information
  requestedBy: string;
  requestedAt: number;
  justification: string;
  
  // Status tracking
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string[]; // Collection managers/analysts
  
  // Results tracking
  collectionResults?: string[]; // IDs of collected intel
  analysisResults?: string[]; // IDs of analysis products
  percentSatisfied: number; // 0-100
  
  // Feedback
  customerFeedback?: {
    rating: number; // 1-5
    comments: string;
    receivedAt: number;
  };
}

/**
 * Collection Plan
 * Coordinated plan to satisfy multiple requirements
 */
export interface CollectionPlan {
  id: string;
  title: string;
  description: string;
  
  // Requirements covered
  requirements: string[]; // Requirement IDs
  
  // Execution details
  startDate: number;
  endDate: number;
  phases: CollectionPhase[];
  
  // Resource allocation
  assignedSources: string[]; // Source IDs
  assignedAnalysts: string[]; // Analyst IDs
  estimatedCost: number;
  
  // Approval and tracking
  approvedBy: string;
  approvedAt: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  
  // Coordination
  coordinationRequired: string[]; // Other agencies/units
  deconflictionNotes: string;
}

/**
 * Collection Phase
 * Distinct phase within a collection plan
 */
export interface CollectionPhase {
  id: string;
  name: string;
  description: string;
  
  // Timing
  startDate: number;
  endDate: number;
  duration: number; // in hours
  
  // Objectives
  objectives: string[];
  essentialElements: string[]; // EEI IDs to address
  
  // Resources
  sources: string[]; // Source IDs
  methods: CollectionMethod[];
  platforms: string[]; // Platform IDs
  
  // Dependencies
  dependsOn?: string[]; // Other phase IDs
  enables?: string[]; // Phases this enables
  
  // Status
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  percentComplete: number;
}

/**
 * Collection Tasking
 * Specific tasking to a collection source
 */
export interface CollectionTasking {
  id: string;
  requirementId: string;
  planId?: string;
  phaseId?: string;
  
  // Target
  taskingTitle: string;
  taskingDescription: string;
  specificInstructions: string;
  
  // Assigned resource
  assignedSource: string; // Source ID
  assignedOperator?: string; // Operator ID
  
  // Timing
  taskingDate: number;
  executionDate: number;
  deadline: number;
  
  // Geographic focus
  targetArea?: AreaOfInterest;
  
  // Technical requirements
  technicalRequirements: {
    resolution?: string;
    frequency?: string;
    coverage?: string;
    format?: string;
  };
  
  // Status
  status: 'ASSIGNED' | 'ACCEPTED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  
  // Results
  deliverables: string[]; // Intel IDs produced
  deliveryDate?: number;
  qualityRating?: number; // 1-5
  notes?: string;
}

/**
 * Requirements Management Utilities
 */
export class RequirementsUtils {
  /**
   * Calculate requirement urgency score
   */
  static calculateUrgencyScore(requirement: IntelRequirement): number {
    const now = Date.now();
    const timeToDeadline = requirement.deadline - now;
    const priorityWeight = this.getPriorityWeight(requirement.priority);
    
    // Urgency increases as deadline approaches and priority increases
    const timeUrgency = Math.max(0, 100 - (timeToDeadline / (24 * 60 * 60 * 1000)) * 10);
    return (timeUrgency * 0.7) + (priorityWeight * 0.3);
  }

  /**
   * Get numeric weight for priority
   */
  private static getPriorityWeight(priority: CollectionPriority): number {
    const weights = {
      'FLASH_OVERRIDE': 100,
      'FLASH': 80,
      'IMMEDIATE': 60,
      'PRIORITY': 40,
      'ROUTINE': 20
    };
    return weights[priority];
  }

  /**
   * Check if requirement is overdue
   */
  static isOverdue(requirement: IntelRequirement): boolean {
    return Date.now() > requirement.deadline && 
           !['COMPLETED', 'CANCELLED'].includes(requirement.status);
  }

  /**
   * Validate requirement completeness
   */
  static validateRequirement(requirement: IntelRequirement): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!requirement.title?.trim()) {
      errors.push('Title is required');
    }

    if (!requirement.description?.trim()) {
      errors.push('Description is required');
    }

    if (!requirement.essentialElements?.length) {
      errors.push('At least one essential element is required');
    }

    if (!requirement.preferredSources?.length) {
      warnings.push('No preferred sources specified');
    }

    if (requirement.deadline <= Date.now()) {
      errors.push('Deadline cannot be in the past');
    }

    if (!requirement.areasOfInterest?.length && !requirement.targetLocation) {
      warnings.push('No geographic focus specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
