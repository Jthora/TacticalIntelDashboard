// Data Transformation Utilities for Intelligence Domain
// Implementation of Improvement #5: Better Service Organization

import { Intel } from './Intel';
import { Intelligence } from './Intelligence';
import { IntelReportData } from '../IntelReportData';
import { SourceMetadata } from './Sources';

/**
 * Raw collection data interface
 */
interface CollectionData {
  sourceId: string;
  collectedData: unknown;
  location?: { lat: number; lng: number; };
  tags?: string[];
}

/**
 * Form data interface
 */
interface FormData {
  title?: string;
  content?: string;
  reportType?: string;
  classification?: string;
  executiveSummary?: string;
  keyFindings?: string;
  analysis?: string;
  conclusions?: string;
  recommendations?: string;
  latitude?: string;
  longitude?: string;
  locationDescription?: string;
  tags?: string;
  author?: string;
  confidence?: string;
  date?: string;
}

/**
 * Form output interface
 */
interface FormOutput {
  [key: string]: string | undefined;
}

/**
 * Legacy to Enhanced Model Transformers
 * Provides seamless migration from legacy IntelReportData to new intelligence models
 */
export class IntelligenceTransformers {
  
  /**
   * Transform legacy IntelReportData to enhanced IntelligenceReportData
   */
  static legacyToIntelligenceReport(legacy: IntelReportData): IntelligenceReportData {
    return {
      // Basic fields
      id: legacy.id || this.generateId(),
      title: legacy.title,
      content: legacy.content,
      
      // Enhanced metadata with defaults
      reportType: 'ANALYSIS_REPORT', // Default type
      reportNumber: legacy.id || this.generateReportNumber(),
      version: '1.0',
      
      // Classification (default to unclassified)
      classification: {
        level: legacy.classification || 'UNCLASS'
      },
      distributionType: 'ROUTINE',
      distributionList: [],
      handlingInstructions: [],
      
      // Content structure
      executiveSummary: this.extractExecutiveSummary(legacy.content),
      keyFindings: this.extractKeyFindings(legacy.content),
      analysisAndAssessment: legacy.content,
      conclusions: this.extractConclusions(legacy.content),
      recommendations: legacy.recommendations || [],
      intelligenceGaps: [],
      
      // Sources (convert from legacy)
      sources: this.convertLegacySources(legacy),
      sourceSummary: this.generateSourceSummary(legacy),
      collectionDisciplines: legacy.sources || ['OSINT'],
      
      // Geographic scope
      geographicScope: {
        type: 'SPECIFIC',
        coordinates: legacy.latitude && legacy.longitude ? [{
          latitude: legacy.latitude,
          longitude: legacy.longitude,
          description: 'Report location'
        }] : undefined
      },
      
      // Timeframe
      timeframe: {
        start: legacy.timestamp,
        end: legacy.timestamp,
        relevantUntil: legacy.timestamp + (30 * 24 * 60 * 60 * 1000) // 30 days
      },
      
      // Associated products
      relatedReports: [],
      threatAssessments: [],
      riskAssessments: [],
      attachments: [],
      
      // Quality metrics (defaults)
      confidence: legacy.confidence || 75,
      reliabilityScore: 80,
      completeness: 85,
      timeliness: 90,
      
      // Workflow
      status: 'PUBLISHED',
      workflowSteps: [],
      approvalChain: [],
      
      // Production metadata
      author: legacy.author,
      contributors: [],
      reviewedBy: [],
      approvedBy: legacy.author,
      
      // Publishing
      publishedAt: legacy.timestamp,
      distributedAt: legacy.timestamp,
      publishedTo: ['blockchain'],
      accessLog: [],
      
      // Feedback and metrics
      feedback: [],
      viewCount: 0,
      downloadCount: 0,
      citationCount: 0,
      
      // Legacy compatibility
      tags: legacy.tags,
      latitude: legacy.latitude,
      longitude: legacy.longitude,
      timestamp: legacy.timestamp,
      
      // Blockchain
      pubkey: legacy.pubkey,
      signature: legacy.signature,
      
      // UI fields
      subtitle: legacy.subtitle,
      date: legacy.date,
      categories: legacy.categories,
      metaDescription: legacy.metaDescription,
      
      // Deprecated
      lat: legacy.lat,
      long: legacy.long
    };
  }

  /**
   * Transform IntelligenceReportData back to legacy IntelReportData
   */
  static intelligenceReportToLegacy(enhanced: IntelligenceReportData): IntelReportData {
    return {
      id: enhanced.id,
      title: enhanced.title,
      content: enhanced.content,
      tags: enhanced.tags,
      latitude: enhanced.latitude || 0,
      longitude: enhanced.longitude || 0,
      timestamp: enhanced.timestamp,
      author: enhanced.author,
      
      // Blockchain metadata
      pubkey: enhanced.pubkey,
      signature: enhanced.signature,
      
      // Enhanced fields mapped to legacy optional fields
      classification: enhanced.classification.level,
      sources: enhanced.collectionDisciplines,
      confidence: enhanced.confidence,
      priority: this.mapDistributionToPriority(enhanced.distributionType),
      
      // UI fields
      subtitle: enhanced.subtitle,
      date: enhanced.date,
      categories: enhanced.categories,
      metaDescription: enhanced.metaDescription,
      
      // Legacy compatibility
      lat: enhanced.lat,
      long: enhanced.long
    };
  }

  /**
   * Create Intel record from raw data collection
   */
  static createIntelFromCollection(data: {
    sourceId: string;
    collectedData: any;
    location?: { lat: number; lng: number; };
    tags?: string[];
  }): Intel {
    return {
      id: this.generateId(),
      source: 'OSINT', // Default, should be determined by source
      classification: 'UNCLASS',
      reliability: 'C', // Default, should be determined by source
      timestamp: Date.now(),
      collectedBy: data.sourceId,
      
      // Geographic context
      latitude: data.location?.lat,
      longitude: data.location?.lng,
      
      // Raw data
      data: data.collectedData,
      
      // Metadata
      tags: data.tags || [],
      verified: false
    };
  }

  /**
   * Process Intel into Intelligence
   */
  static processIntelToIntelligence(
    intel: Intel,
    analysis: string,
    confidence: number,
    processedBy: string
  ): Intelligence {
    return {
      ...intel,
      analysis,
      confidence,
      significance: this.determineSignificance(confidence),
      processedBy,
      processedAt: Date.now(),
      relatedIntel: [],
      contradictoryIntel: [],
      threats: [],
      opportunities: [],
      recommendations: []
    };
  }

  /**
   * Batch transform multiple legacy reports
   */
  static batchTransformLegacy(legacyReports: IntelReportData[]): IntelligenceReportData[] {
    return legacyReports.map(report => this.legacyToIntelligenceReport(report));
  }

  /**
   * Transform multiple Intel records into a comprehensive Intelligence Report
   * This is the key missing piece - how raw intel becomes a structured report
   */
  static fuseIntelIntoReport(
    intelRecords: Intel[],
    analysisContext: {
      analystId: string;
      reportTitle: string;
      analysisMethod?: string;
      keyQuestions: string[];
      timeframe: { start: number; end: number };
    }
  ): Partial<IntelligenceReportData> {
    
    // Validate we have intel to work with
    if (!intelRecords.length) {
      throw new Error('Cannot create report without intel records');
    }

    // Determine geographic scope from intel locations
    const coordinates = intelRecords
      .filter(intel => intel.latitude && intel.longitude)
      .map(intel => ({
        latitude: intel.latitude!,
        longitude: intel.longitude!,
        description: `Intel from ${intel.source}`
      }));

    // Aggregate sources and determine overall reliability
    const sources = [...new Set(intelRecords.map(intel => intel.source))];
    const avgReliability = this.calculateAverageReliability(intelRecords);
    const overallClassification = this.determineHighestClassification(intelRecords);

    // Generate content from intel data
    const content = this.generateReportContent(intelRecords, analysisContext);
    const keyFindings = this.extractKeyFindingsFromIntel(intelRecords);
    const recommendations = this.generateRecommendationsFromIntel(intelRecords, analysisContext);

    return {
      id: this.generateId(),
      title: analysisContext.reportTitle,
      content,
      reportType: 'ANALYSIS_REPORT',
      
      // Content structure
      executiveSummary: this.generateExecutiveSummaryFromIntel(intelRecords, keyFindings),
      keyFindings,
      analysisAndAssessment: content,
      conclusions: this.generateConclusionsFromIntel(intelRecords, keyFindings),
      recommendations,
      intelligenceGaps: this.identifyIntelligenceGaps(intelRecords, analysisContext.keyQuestions),
      
      // Classification - use highest from source intel
      classification: {
        level: overallClassification
      },
      
      // Source attribution
      sources: intelRecords.map(intel => this.convertIntelToSourceMetadata(intel)),
      sourceSummary: `Analysis based on ${intelRecords.length} intelligence reports from ${sources.length} distinct sources`,
      collectionDisciplines: sources,
      
      // Geographic scope
      geographicScope: {
        type: coordinates.length > 0 ? 'SPECIFIC' : 'GLOBAL',
        coordinates: coordinates.length > 0 ? coordinates : undefined
      },
      
      // Timeframe
      timeframe: analysisContext.timeframe,
      
      // Quality metrics
      confidence: this.calculateReportConfidence(intelRecords, avgReliability),
      reliabilityScore: avgReliability,
      completeness: this.assessCompleteness(intelRecords, analysisContext.keyQuestions),
      timeliness: this.assessTimeliness(intelRecords),
      
      // Production metadata
      author: analysisContext.analystId,
      timestamp: Date.now(),
      
      // Legacy compatibility
      tags: this.aggregateTags(intelRecords),
      latitude: coordinates[0]?.latitude,
      longitude: coordinates[0]?.longitude
    };
  }

  /**
   * Transform IntelligenceReportData to form data
   */
  static intelligenceReportToForm(report: IntelligenceReportData): any {
    return {
      title: report.title,
      content: report.content,
      reportType: report.reportType,
      classification: report.classification.level,
      
      executiveSummary: report.executiveSummary,
      keyFindings: this.arrayToString(report.keyFindings),
      analysis: report.analysisAndAssessment,
      conclusions: report.conclusions,
      recommendations: this.arrayToString(report.recommendations),
      
      latitude: report.geographicScope.coordinates?.[0]?.latitude?.toString(),
      longitude: report.geographicScope.coordinates?.[0]?.longitude?.toString(),
      locationDescription: report.geographicScope.coordinates?.[0]?.description,
      
      tags: this.arrayToString(report.tags),
      author: report.author,
      
      confidence: report.confidence.toString(),
      date: new Date(report.timestamp).toISOString().split('T')[0]
    };
  }

  /**
   * Parse comma-separated string to array
   */
  private static parseStringArray(input: string): string[] {
    if (!input?.trim()) return [];
    return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  /**
   * Convert array to comma-separated string
   */
  private static arrayToString(array: string[]): string {
    return array?.join(', ') || '';
  }

  /**
   * Calculate average reliability from multiple intel sources
   */
  private static calculateAverageReliability(intelRecords: Intel[]): number {
    const reliabilityScores = {
      'A': 100, 'B': 80, 'C': 60, 'D': 40, 'E': 20, 'F': 10, 'X': 0
    };
    
    const totalScore = intelRecords.reduce((sum, intel) => {
      return sum + (reliabilityScores[intel.reliability] || 0);
    }, 0);
    
    return Math.round(totalScore / intelRecords.length);
  }

  /**
   * Determine highest classification level from intel records
   */
  private static determineHighestClassification(intelRecords: Intel[]): ClassificationLevel {
    const levels = ['UNCLASS', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET'];
    let highest = 'UNCLASS';
    
    for (const intel of intelRecords) {
      const currentIndex = levels.indexOf(intel.classification);
      const highestIndex = levels.indexOf(highest);
      if (currentIndex > highestIndex) {
        highest = intel.classification;
      }
    }
    
    return highest as ClassificationLevel;
  }

  /**
   * Generate report content from intel data
   */
  private static generateReportContent(intelRecords: Intel[], context: any): string {
    let content = `# Intelligence Analysis Report\n\n`;
    content += `## Overview\n`;
    content += `This report analyzes ${intelRecords.length} intelligence records collected between ${new Date(context.timeframe.start).toLocaleDateString()} and ${new Date(context.timeframe.end).toLocaleDateString()}.\n\n`;
    
    content += `## Source Summary\n`;
    const sourceCounts = intelRecords.reduce((acc, intel) => {
      acc[intel.source] = (acc[intel.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    for (const [source, count] of Object.entries(sourceCounts)) {
      content += `- ${source}: ${count} reports\n`;
    }
    
    content += `\n## Detailed Analysis\n`;
    content += `Analysis of collected intelligence reveals patterns and insights across multiple sources and timeframes.\n\n`;
    
    // Add specific intel insights
    intelRecords.forEach((intel, index) => {
      if (intel.verified && typeof intel.data === 'object') {
        content += `### Finding ${index + 1} (${intel.source})\n`;
        content += `Source reliability: ${intel.reliability}\n`;
        content += `Location: ${intel.location || 'Not specified'}\n`;
        content += `Summary: Intelligence data point from ${intel.source} source.\n\n`;
      }
    });
    
    return content;
  }

  /**
   * Extract executive summary from content
   */
  private static extractExecutiveSummary(content: string): string {
    // Simple extraction - take first paragraph or first 200 chars
    const firstParagraph = content.split('\n')[0];
    return firstParagraph.length > 200 
      ? firstParagraph.substring(0, 200) + '...'
      : firstParagraph;
  }

  /**
   * Extract key findings from content
   */
  private static extractKeyFindings(content: string): string[] {
    // Look for bullet points or numbered lists
    const lines = content.split('\n');
    const findings: string[] = [];
    
    for (const line of lines) {
      if (line.trim().match(/^[-*•]\s+/) || line.trim().match(/^\d+\.\s+/)) {
        findings.push(line.trim().replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    }
    
    // If no structured findings found, create generic ones
    if (findings.length === 0) {
      findings.push('Analysis of collected intelligence data');
      findings.push('Assessment of current situation');
    }
    
    return findings.slice(0, 5); // Limit to 5 key findings
  }

  /**
   * Extract conclusions from content
   */
  private static extractConclusions(content: string): string {
    // Look for conclusion section or use last paragraph
    const lowerContent = content.toLowerCase();
    const conclusionIndex = lowerContent.indexOf('conclusion');
    
    if (conclusionIndex !== -1) {
      return content.substring(conclusionIndex);
    }
    
    // Fallback to last paragraph
    const paragraphs = content.split('\n\n');
    return paragraphs[paragraphs.length - 1] || 'Further analysis required.';
  }

  /**
   * Convert legacy sources to SourceMetadata
   */
  private static convertLegacySources(legacy: IntelReportData): any[] {
    // This would need to be expanded based on actual legacy source format
    return [{
      primary: 'OSINT',
      method: 'MANUAL',
      platform: 'GROUND',
      quality: 'ANALYZED',
      sourceId: legacy.author,
      collectionDate: legacy.timestamp,
      custodyChain: [legacy.author],
      lastHandler: legacy.author,
      confidence: legacy.confidence || 75,
      completeness: 80,
      timeliness: 85
    }];
  }

  /**
   * Generate source summary
   */
  private static generateSourceSummary(legacy: IntelReportData): string {
    const sourceCount = legacy.sources?.length || 1;
    return `Based on ${sourceCount} source${sourceCount > 1 ? 's' : ''} with moderate reliability.`;
  }

  /**
   * Map distribution type to legacy priority
   */
  private static mapDistributionToPriority(
    distributionType: string
  ): 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE' {
    switch (distributionType) {
      case 'IMMEDIATE': return 'IMMEDIATE';
      case 'SPECIAL': return 'PRIORITY';
      default: return 'ROUTINE';
    }
  }

  /**
   * Determine significance from confidence
   */
  private static determineSignificance(confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (confidence >= 90) return 'CRITICAL';
    if (confidence >= 75) return 'HIGH';
    if (confidence >= 50) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return 'intel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate report number
   */
  private static generateReportNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `INTEL-${year}${month}${day}-${sequence}`;
  }

  // Additional helper methods...
  private static generateExecutiveSummary(intelRecords: Intel[], keyFindings: string[]): string {
    const firstFinding = keyFindings[0] || 'Intelligence collection and analysis completed.';
    return `Analysis of ${intelRecords.length} intelligence records reveals ${keyFindings.length} key findings requiring attention. ${firstFinding}`;
  }

  private static generateConclusions(intelRecords: Intel[], keyFindings: string[]): string {
    const activity = keyFindings.length > 0 ? 'significant findings' : 'routine activity';
    const attention = keyFindings.length > 2 ? 'immediate attention' : 'continued monitoring';
    return `Based on analysis of ${intelRecords.length} intelligence reports, the intelligence picture indicates ${activity} requiring ${attention}.`;
  }

  private static identifyIntelligenceGaps(intelRecords: Intel[], keyQuestions: string[]): string[] {
    const gaps: string[] = [];
    
    if (keyQuestions.length > intelRecords.length) {
      gaps.push('Insufficient intelligence to answer all priority intelligence requirements');
    }
    
    const sources = new Set(intelRecords.map(intel => intel.source));
    if (!sources.has('HUMINT')) {
      gaps.push('Limited human intelligence sources');
    }
    
    return gaps;
  }

  private static convertIntelToSourceMetadata(intel: Intel): any {
    return {
      primary: intel.source,
      method: 'MANUAL',
      platform: 'GROUND',
      quality: this.mapReliabilityToQuality(intel.reliability),
      sourceId: intel.collectedBy,
      collectionDate: intel.timestamp,
      custodyChain: [intel.collectedBy],
      lastHandler: intel.collectedBy,
      confidence: this.mapReliabilityToConfidence(intel.reliability),
      completeness: intel.verified ? 90 : 70,
      timeliness: this.calculateTimeliness(intel.timestamp)
    };
  }

  private static mapReliabilityToQuality(reliability: string): string {
    const mapping = {
      'A': 'VERIFIED', 'B': 'ANALYZED', 'C': 'CORRELATED',
      'D': 'FILTERED', 'E': 'RAW', 'F': 'RAW', 'X': 'RAW'
    };
    return mapping[reliability as keyof typeof mapping] || 'RAW';
  }

  private static mapReliabilityToConfidence(reliability: string): number {
    const mapping = {
      'A': 95, 'B': 85, 'C': 75, 'D': 60, 'E': 40, 'F': 30, 'X': 10
    };
    return mapping[reliability as keyof typeof mapping] || 50;
  }

  private static calculateTimeliness(timestamp: number): number {
    const age = Date.now() - timestamp;
    const dayMs = 24 * 60 * 60 * 1000;
    
    if (age < dayMs) return 100;
    if (age < 7 * dayMs) return 80;
    if (age < 30 * dayMs) return 60;
    return 40;
  }

  private static calculateReportConfidence(intelRecords: Intel[], avgReliability: number): number {
    // Confidence increases with multiple sources and good reliability
    const sourceCount = new Set(intelRecords.map(intel => intel.source)).size;
    const sourceBonus = Math.min(sourceCount * 10, 30);
    return Math.min(95, avgReliability + sourceBonus);
  }

  private static assessCompleteness(intelRecords: Intel[], keyQuestions: string[]): number {
    // Simple heuristic: more intel records = more complete
    const ratio = intelRecords.length / Math.max(keyQuestions.length, 1);
    return Math.min(100, ratio * 80);
  }

  private static assessTimeliness(intelRecords: Intel[]): number {
    // Average timeliness of all intel records
    const timeliness = intelRecords.map(intel => this.calculateTimeliness(intel.timestamp));
    return Math.round(timeliness.reduce((sum, t) => sum + t, 0) / timeliness.length);
  }

  private static aggregateTags(intelRecords: Intel[]): string[] {
    const allTags = intelRecords.flatMap(intel => intel.tags || []);
    return [...new Set(allTags)]; // Remove duplicates
  }

  /**
   * Extract key findings from intel data
   */
  private static extractKeyFindingsFromIntel(intelRecords: Intel[]): string[] {
    const findings: string[] = [];
    
    // Geographic clustering
    const locations = intelRecords.filter(intel => intel.latitude && intel.longitude);
    if (locations.length > 1) {
      findings.push(`Intelligence activity identified across ${locations.length} geographic locations`);
    }
    
    // Source diversity
    const uniqueSources = new Set(intelRecords.map(intel => intel.source));
    if (uniqueSources.size > 2) {
      findings.push(`Multi-source intelligence corroboration from ${uniqueSources.size} disciplines`);
    }
    
    // Reliability assessment
    const highReliability = intelRecords.filter(intel => ['A', 'B'].includes(intel.reliability));
    if (highReliability.length > 0) {
      findings.push(`${highReliability.length} high-reliability intelligence reports confirm key assessments`);
    }
    
    // Temporal patterns
    const timeSpan = Math.max(...intelRecords.map(intel => intel.timestamp)) - 
                    Math.min(...intelRecords.map(intel => intel.timestamp));
    if (timeSpan > 7 * 24 * 60 * 60 * 1000) { // More than a week
      findings.push('Intelligence patterns observed over extended timeframe indicating sustained activity');
    }
    
    return findings.length > 0 ? findings : ['Analysis of collected intelligence data completed'];
  }

  /**
   * Generate recommendations based on intel analysis
   */
  private static generateRecommendationsFromIntel(intelRecords: Intel[], context: any): string[] {
    const recommendations: string[] = [];
    
    // Based on classification levels
    const classified = intelRecords.filter(intel => intel.classification !== 'UNCLASS');
    if (classified.length > 0) {
      recommendations.push('Maintain appropriate security controls for classified intelligence');
    }
    
    // Based on reliability concerns
    const lowReliability = intelRecords.filter(intel => ['D', 'E', 'F', 'X'].includes(intel.reliability));
    if (lowReliability.length > 0) {
      recommendations.push('Seek additional sources to corroborate low-reliability intelligence');
    }
    
    // Geographic considerations
    const geoIntel = intelRecords.filter(intel => intel.latitude && intel.longitude);
    if (geoIntel.length > 0) {
      recommendations.push('Continue monitoring identified geographic areas of interest');
    }
    
    return recommendations.length > 0 ? recommendations : ['Continue intelligence collection and analysis'];
  }

  /**
   * Generate executive summary from intel records
   */
  private static generateExecutiveSummaryFromIntel(intelRecords: Intel[], keyFindings: string[]): string {
    const firstFinding = keyFindings[0] || 'Intelligence collection and analysis completed.';
    return `Analysis of ${intelRecords.length} intelligence records reveals ${keyFindings.length} key findings requiring attention. ${firstFinding}`;
  }

  /**
   * Generate conclusions from intel analysis
   */
  private static generateConclusionsFromIntel(intelRecords: Intel[], keyFindings: string[]): string {
    const findingsCount = keyFindings.length;
    const activity = findingsCount > 0 ? 'significant findings' : 'routine activity';
    const attention = findingsCount > 2 ? 'immediate attention' : 'continued monitoring';
    return `Based on analysis of ${intelRecords.length} intelligence reports, the intelligence picture indicates ${activity} requiring ${attention}.`;
  }
}

/**
 * Form Data Transformers
 * Handle transformation between UI forms and intelligence models
 */
export class FormTransformers {
  
  /**
   * Transform form data to IntelligenceReportData
   */
  static formToIntelligenceReport(formData: any): Partial<IntelligenceReportData> {
    return {
      title: formData.title?.trim(),
      content: formData.content?.trim(),
      reportType: formData.reportType || 'ANALYSIS_REPORT',
      
      classification: {
        level: formData.classification || 'UNCLASS'
      },
      
      executiveSummary: formData.executiveSummary?.trim(),
      keyFindings: this.parseStringArray(formData.keyFindings),
      analysisAndAssessment: formData.analysis?.trim(),
      conclusions: formData.conclusions?.trim(),
      recommendations: this.parseStringArray(formData.recommendations),
      
      geographicScope: {
        type: 'SPECIFIC',
        coordinates: formData.latitude && formData.longitude ? [{
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          description: formData.locationDescription || 'Report location'
        }] : undefined
      },
      
      tags: this.parseStringArray(formData.tags),
      author: formData.author?.trim(),
      
      confidence: parseInt(formData.confidence) || 75,
      
      timestamp: formData.date ? new Date(formData.date).getTime() : Date.now()
    };
  }

  /**
   * Transform IntelligenceReportData to form data
   */
  static intelligenceReportToForm(report: IntelligenceReportData): any {
    return {
      title: report.title,
      content: report.content,
      reportType: report.reportType,
      classification: report.classification.level,
      
      executiveSummary: report.executiveSummary,
      keyFindings: this.arrayToString(report.keyFindings),
      analysis: report.analysisAndAssessment,
      conclusions: report.conclusions,
      recommendations: this.arrayToString(report.recommendations),
      
      latitude: report.geographicScope.coordinates?.[0]?.latitude?.toString(),
      longitude: report.geographicScope.coordinates?.[0]?.longitude?.toString(),
      locationDescription: report.geographicScope.coordinates?.[0]?.description,
      
      tags: this.arrayToString(report.tags),
      author: report.author,
      
      confidence: report.confidence.toString(),
      date: new Date(report.timestamp).toISOString().split('T')[0]
    };
  }

  /**
   * Parse comma-separated string to array
   */
  private static parseStringArray(input: string): string[] {
    if (!input?.trim()) return [];
    return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  /**
   * Convert array to comma-separated string
   */
  private static arrayToString(array: string[]): string {
    return array?.join(', ') || '';
  }
}
