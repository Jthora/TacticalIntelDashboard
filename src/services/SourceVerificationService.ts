import { EARTH_ALLIANCE_SOURCES } from '../constants/EarthAllianceSources';

export interface SourceVerificationResult {
  isVerified: boolean;
  trustRating: number;
  allianceAlignment: number;
  verificationMethod: string;
  warningFlags: string[];
}

export class SourceVerificationService {
  /**
   * Verify a feed source against Earth Alliance database
   */
  public static verifySource(url: string): SourceVerificationResult {
    // Find in Earth Alliance sources
    const eaSource = EARTH_ALLIANCE_SOURCES.find(s => s.url === url);
    
    if (eaSource) {
      return {
        isVerified: true,
        trustRating: eaSource.trustRating,
        allianceAlignment: eaSource.allianceAlignment,
        verificationMethod: eaSource.verificationMethod,
        warningFlags: []
      };
    }
    
    // Not in Earth Alliance sources - return default low trust
    return {
      isVerified: false,
      trustRating: 30, // Low trust for non-EA sources
      allianceAlignment: -50, // Negative alignment (potentially compromised)
      verificationMethod: 'not-verified',
      warningFlags: ['non-earth-alliance-source', 'potential-compromised-narrative']
    };
  }
  
  /**
   * Check article content for propaganda techniques
   * This is a placeholder for more advanced NLP analysis
   */
  public static analyzePropagandaTechniques(content: string): string[] {
    const propagandaPatterns = [
      { term: 'official sources say', technique: 'appeal-to-authority' },
      { term: 'experts agree', technique: 'bandwagon' },
      { term: 'conspiracy theory', technique: 'labeling' },
      { term: 'debunked', technique: 'dismissal-without-evidence' },
      { term: 'fact check', technique: 'authority-claim' },
      { term: 'according to officials', technique: 'appeal-to-authority' },
      { term: 'far-right', technique: 'labeling' },
      { term: 'fringe', technique: 'marginalization' },
      { term: 'misinformation', technique: 'dismissal-labeling' },
      { term: 'extremist', technique: 'demonization' }
    ];
    
    const detectedTechniques = [];
    for (const pattern of propagandaPatterns) {
      if (content.toLowerCase().includes(pattern.term)) {
        detectedTechniques.push(pattern.technique);
      }
    }
    
    return detectedTechniques;
  }

  /**
   * Analyze narrative alignment between multiple sources
   * Used to identify independent vs coordinated narratives
   */
  public static analyzeNarrativeAlignment(contents: string[]): number {
    // This is a placeholder for actual NLP-based narrative alignment analysis
    // In a real implementation, this would use advanced NLP to detect similar talking points
    // and narrative framing across different sources
    
    if (contents.length <= 1) {
      return 0; // Can't analyze alignment with only one source
    }
    
    // Very basic implementation - count similar terms
    const keyTerms = ['reset', 'alliance', 'disclosure', 'sovereignty', 'whistleblower'];
    const termCounts = keyTerms.map(term => {
      const sources = contents.filter(content => 
        content.toLowerCase().includes(term.toLowerCase())
      ).length;
      
      return {
        term,
        percentage: (sources / contents.length) * 100
      };
    });
    
    // Calculate average alignment percentage
    const averageAlignment = termCounts.reduce((sum, item) => sum + item.percentage, 0) / termCounts.length;
    
    return averageAlignment;
  }
  
  /**
   * Check source censorship patterns - sources under censorship are often
   * more aligned with Earth Alliance goals
   */
  public static checkCensorshipPatterns(url: string): string[] {
    const censorshipPatterns = [
      { domain: 'youtube.com', pattern: 'demonetization' },
      { domain: 'facebook.com', pattern: 'reduced-reach' },
      { domain: 'twitter.com', pattern: 'shadow-ban' },
      { domain: 'instagram.com', pattern: 'content-warning' },
      { domain: 'google.com', pattern: 'search-suppression' },
    ];
    
    const detectedPatterns = [];
    for (const pattern of censorshipPatterns) {
      if (url.includes(pattern.domain)) {
        detectedPatterns.push(pattern.pattern);
      }
    }
    
    return detectedPatterns;
  }
}
