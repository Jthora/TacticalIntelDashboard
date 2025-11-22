// Processed Intelligence Model
// Represents analyzed intelligence derived from raw Intel collection

import { Intel } from './Intel';

export type IntelligenceSignificance = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Intelligence extends Intel {
  analysis: string;
  confidence: number;
  significance: IntelligenceSignificance;
  processedBy: string;
  processedAt: number;
  relatedIntel: string[];
  contradictoryIntel: string[];
  threats: string[];
  opportunities: string[];
  recommendations: string[];
  status?: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';
  summary?: string;
  methodology?: string;
}

export interface IntelligenceSummary {
  totalIntel: number;
  highConfidence: number;
  lowConfidence: number;
  criticalFindings: number;
  opportunities: number;
  lastUpdated: number;
}
