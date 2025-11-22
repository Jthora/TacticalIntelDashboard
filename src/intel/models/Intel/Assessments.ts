// Threat and Risk Assessment models for the Intel domain

export interface ThreatAssessment {
  id: string;
  title: string;
  description: string;
  attackVectors: string[];
  potentialImpacts?: string[];
  likelihood: number; // 0-100
  confidence: number; // 0-100
  basedOnIntel?: string[];
  recommendations?: string[];
}

export interface RiskAssessment {
  id: string;
  title: string;
  scenario: string;
  impact: number; // 0-100
  likelihood: number; // 0-100
  mitigationSteps?: string[];
}

export class ThreatAssessmentUtils {
  static calculateSeverity(assessment: ThreatAssessment): number {
    return Math.round((assessment.likelihood + assessment.confidence) / 2);
  }
}
