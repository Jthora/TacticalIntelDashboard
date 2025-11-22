import { ClassificationMarking } from './Classification';
import { SourceMetadata } from './Sources';

export interface IntelReportData {
  id: string;
  title: string;
  content: string;
  classification?: ClassificationMarking | string;
  sources?: string[];
  latitude?: number;
  longitude?: number;
  timestamp: number;
  author: string;
  confidence?: number;
  priority?: 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE';
  recommendations?: string[];
  tags?: string[];
  pubkey?: string;
  signature?: string;
  subtitle?: string;
  date?: string;
  categories?: string[];
  metaDescription?: string;
  lat?: number;
  long?: number;
}

export interface IntelligenceReportData {
  id: string;
  title: string;
  content: string;
  reportType: string;
  classification?: ClassificationMarking | string;
  distributionType?: 'ROUTINE' | 'SPECIAL' | 'IMMEDIATE';
  distributionList?: string[];
  handlingInstructions?: string[];
  executiveSummary?: string;
  keyFindings: string[];
  analysisAndAssessment?: string;
  conclusions?: string;
  recommendations: string[];
  intelligenceGaps?: string[];
  sources?: SourceMetadata[];
  sourceSummary?: string;
  collectionDisciplines?: string[];
  geographicScope: {
    type: 'GLOBAL' | 'REGIONAL' | 'SPECIFIC';
    coordinates?: Array<{
      latitude: number;
      longitude: number;
      description?: string;
    }>;
  };
  timeframe: {
    start: number;
    end: number;
    relevantUntil?: number;
  };
  relatedReports?: string[];
  threatAssessments?: string[];
  riskAssessments?: string[];
  attachments?: string[];
  confidence: number;
  reliabilityScore?: number;
  completeness?: number;
  timeliness?: number;
  status?: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED';
  workflowSteps?: string[];
  approvalChain?: string[];
  author: string;
  contributors?: string[];
  reviewedBy?: string[];
  approvedBy?: string;
  publishedAt?: number;
  distributedAt?: number;
  publishedTo?: string[];
  accessLog?: string[];
  feedback?: string[];
  viewCount?: number;
  downloadCount?: number;
  citationCount?: number;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  timestamp: number;
  pubkey?: string;
  signature?: string;
  subtitle?: string;
  date?: string;
  categories?: string[];
  metaDescription?: string;
  lat?: number;
  long?: number;
}
