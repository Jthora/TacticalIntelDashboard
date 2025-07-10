#!/bin/bash

# Earth Alliance Integration Tool
# This tool helps to validate, expand, and integrate Earth Alliance sources into the dashboard

echo "🌐 EARTH ALLIANCE SOURCE INTEGRATION TOOL"
echo "=========================================="

# Directories
TOOLS_DIR="tools"
VALIDATOR_DIR="$TOOLS_DIR/feed-validator"
VALIDATOR_REPORTS_DIR="$VALIDATOR_DIR/reports"
SRC_DIR="src"
CONSTANTS_DIR="$SRC_DIR/constants"

# Ensure directories exist
mkdir -p "$VALIDATOR_REPORTS_DIR"

# Function to display the menu
show_menu() {
    clear
    echo "🌐 EARTH ALLIANCE SOURCE INTEGRATION TOOL"
    echo "=========================================="
    echo "1. Validate current Earth Alliance sources"
    echo "2. Expand source roster with additional sources"
    echo "3. Create TypeScript integration file for dashboard"
    echo "4. Run complete process (validate, expand, integrate)"
    echo "5. Exit"
    echo "=========================================="
    echo "Enter your choice (1-5): "
}

# Function to validate sources
validate_sources() {
    echo "🔍 Validating Earth Alliance sources..."
    
    # Check if Node.js validator exists
    if [ -f "$VALIDATOR_DIR/validator.js" ]; then
        cd "$VALIDATOR_DIR"
        
        # Check if node_modules exist, if not, install dependencies
        if [ ! -d "node_modules" ]; then
            echo "Installing validator dependencies..."
            npm install
        fi
        
        # Run the validator
        echo "Running advanced validator..."
        node validator.js --file ../../docs/EARTH_ALLIANCE_SOURCE_ROSTER.md
        cd ../../
    else
        # Fallback to bash validator
        echo "Using basic bash validator..."
        $TOOLS_DIR/validate_ea_feeds.sh
    fi
    
    echo "✅ Validation complete!"
}

# Function to expand the source roster
expand_roster() {
    echo "🔄 Expanding Earth Alliance source roster..."
    $TOOLS_DIR/expand_ea_roster.sh
    echo "✅ Roster expansion complete!"
}

# Function to generate TypeScript integration file
generate_ts_integration() {
    echo "🔧 Generating TypeScript integration file..."
    
    # Find the most recent validation results
    LATEST_VALIDATION=$(find "$VALIDATOR_REPORTS_DIR" -name "working-endpoints-*.md" | sort -r | head -n 1)
    
    if [ -z "$LATEST_VALIDATION" ]; then
        echo "❌ No validation results found. Please run validation first."
        return 1
    fi
    
    echo "Using validation results from: $LATEST_VALIDATION"
    
    # Create directory if it doesn't exist
    mkdir -p "$CONSTANTS_DIR"
    
    # Create the TypeScript file
    cat > "$CONSTANTS_DIR/EarthAllianceSources.ts" << EOL
// Earth Alliance Sources
// Auto-generated from validation results on $(date)

import { FeedSource } from '../types/FeedTypes';

// Categories aligned with Earth Alliance intelligence priorities
export enum EarthAllianceCategory {
  MILITARY_INTELLIGENCE = 'MILITARY_INTELLIGENCE',
  TECHNOLOGY_DISCLOSURE = 'TECHNOLOGY_DISCLOSURE',
  FINANCIAL_TRANSPARENCY = 'FINANCIAL_TRANSPARENCY',
  INDEPENDENT_JOURNALISM = 'INDEPENDENT_JOURNALISM',
  ALTERNATIVE_HEALTH = 'ALTERNATIVE_HEALTH',
  DECENTRALIZED_NEWS = 'DECENTRALIZED_NEWS',
  CONSCIOUSNESS_RESEARCH = 'CONSCIOUSNESS_RESEARCH',
  HISTORICAL_TRUTH = 'HISTORICAL_TRUTH',
  POSITIVE_MILITARY = 'POSITIVE_MILITARY',
  SPACE_PROGRAM = 'SPACE_PROGRAM',
}

// Interface extending FeedSource with Earth Alliance specific attributes
export interface EarthAllianceFeedSource extends FeedSource {
  category: EarthAllianceCategory;
  trustRating: number; // 0-100
  allianceAlignment: number; // -100 to 100 (negative = compromised)
  verificationMethod: string;
}

// Earth Alliance sources that have been validated as working
export const EARTH_ALLIANCE_SOURCES: EarthAllianceFeedSource[] = [
EOL
    
    # Process the validation results to extract working endpoints
    CURRENT_CATEGORY=""
    FIRST_ENTRY=true
    
    # Read validation file and extract working endpoints
    while IFS= read -r line; do
        # Check for category headers
        if [[ "$line" =~ ^"### " ]]; then
            CATEGORY=$(echo "$line" | sed 's/### //')
            
            # Map category to enum
            case "$CATEGORY" in
                "MILITARY & INTELLIGENCE WHISTLEBLOWER PLATFORMS")
                    CURRENT_CATEGORY="EarthAllianceCategory.MILITARY_INTELLIGENCE"
                    ;;
                "TECHNOLOGY DISCLOSURE NETWORKS")
                    CURRENT_CATEGORY="EarthAllianceCategory.TECHNOLOGY_DISCLOSURE"
                    ;;
                "FINANCIAL SYSTEM TRANSPARENCY INITIATIVES")
                    CURRENT_CATEGORY="EarthAllianceCategory.FINANCIAL_TRANSPARENCY"
                    ;;
                "INDEPENDENT INVESTIGATIVE JOURNALISM")
                    CURRENT_CATEGORY="EarthAllianceCategory.INDEPENDENT_JOURNALISM"
                    ;;
                "ALTERNATIVE HEALTH RESEARCH")
                    CURRENT_CATEGORY="EarthAllianceCategory.ALTERNATIVE_HEALTH"
                    ;;
                "DECENTRALIZED NEWS NETWORKS")
                    CURRENT_CATEGORY="EarthAllianceCategory.DECENTRALIZED_NEWS"
                    ;;
                "CONSCIOUSNESS & REALITY RESEARCH")
                    CURRENT_CATEGORY="EarthAllianceCategory.CONSCIOUSNESS_RESEARCH"
                    ;;
                "HISTORICAL TRUTH & ARCHAEOLOGY")
                    CURRENT_CATEGORY="EarthAllianceCategory.HISTORICAL_TRUTH"
                    ;;
                "POSITIVE MILITARY OPERATIONS TRACKING")
                    CURRENT_CATEGORY="EarthAllianceCategory.POSITIVE_MILITARY"
                    ;;
                "SPACE PROGRAM DISCLOSURE")
                    CURRENT_CATEGORY="EarthAllianceCategory.SPACE_PROGRAM"
                    ;;
                *)
                    CURRENT_CATEGORY=""
                    ;;
            esac
        fi
        
        # Check for endpoint entries
        if [[ "$line" =~ ^"- ".*"\`" ]] && [ -n "$CURRENT_CATEGORY" ]; then
            # Extract name and URL
            NAME=$(echo "$line" | sed -E 's/- \*\*(.*)\*\* - .*/\1/')
            URL=$(echo "$line" | sed -E 's/.*\`(.*)\`.*/\1/')
            
            # Find trust rating in the source roster
            TRUST_RATING=$(grep -A 5 "\"name\": \"$NAME\"" docs/EARTH_ALLIANCE_SOURCE_ROSTER.md | grep "trustRating" | head -n 1 | sed -E 's/.*"trustRating": ([0-9]+).*/\1/')
            
            # Find verification method in the source roster
            VERIFICATION=$(grep -A 7 "\"name\": \"$NAME\"" docs/EARTH_ALLIANCE_SOURCE_ROSTER.md | grep "verification" | head -n 1 | sed -E 's/.*"verification": "([^"]+)".*/\1/')
            
            # Calculate alliance alignment (simplified: trust rating - 10)
            ALIGNMENT=$((TRUST_RATING - 10))
            
            # Generate unique ID
            ID=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g')
            
            # Add comma if not first entry
            if [ "$FIRST_ENTRY" = true ]; then
                FIRST_ENTRY=false
            else
                echo "," >> "$CONSTANTS_DIR/EarthAllianceSources.ts"
            fi
            
            # Add the source to the TypeScript file
            cat >> "$CONSTANTS_DIR/EarthAllianceSources.ts" << EOL
  {
    id: '$ID',
    name: '$NAME',
    url: '$URL',
    category: $CURRENT_CATEGORY,
    trustRating: ${TRUST_RATING:-75},
    allianceAlignment: ${ALIGNMENT:-65},
    verificationMethod: '${VERIFICATION:-"unverified"}'
  }
EOL
        fi
    done < "$LATEST_VALIDATION"
    
    # Complete the TypeScript file
    cat >> "$CONSTANTS_DIR/EarthAllianceSources.ts" << EOL
];

// Function to get sources by category
export const getSourcesByCategory = (category: EarthAllianceCategory): EarthAllianceFeedSource[] => {
  return EARTH_ALLIANCE_SOURCES.filter(source => source.category === category);
};

// Function to get high-trust sources (trust rating above threshold)
export const getHighTrustSources = (threshold = 80): EarthAllianceFeedSource[] => {
  return EARTH_ALLIANCE_SOURCES.filter(source => source.trustRating >= threshold);
};

// Function to get sources with high alliance alignment
export const getHighAlignmentSources = (threshold = 80): EarthAllianceFeedSource[] => {
  return EARTH_ALLIANCE_SOURCES.filter(source => source.allianceAlignment >= threshold);
};

// Default Earth Alliance feed URLs for the dashboard
export const earthAllianceDefaultUrls = EARTH_ALLIANCE_SOURCES.map(source => source.url);
EOL
    
    echo "✅ TypeScript integration file generated at $CONSTANTS_DIR/EarthAllianceSources.ts"
    
    # Create a DefaultFeeds.ts replacement
    cat > "$CONSTANTS_DIR/EarthAllianceDefaultFeeds.ts" << EOL
import { FeedItem } from '../types/FeedTypes';
import { EARTH_ALLIANCE_SOURCES } from './EarthAllianceSources';

// Original mainstream sources
const mainstreamUrls = [
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://www.npr.org/rss/rss.php?id=1001',
  'https://www.reddit.com/r/news/.rss',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://rss.cnn.com/rss/edition.rss',
  'https://www.theguardian.com/world/rss',
  'https://www.washingtonpost.com/rss/world',
  'https://www.bloomberg.com/feed/podcast/etf-report.xml',
  'https://www.ft.com/?format=rss',
];

// Original DefaultFeeds (renamed to MainstreamFeeds)
export const MainstreamFeeds: FeedItem[] = mainstreamUrls.map((url, index) => ({
  id: (index + 1).toString(),
  title: \`Mainstream Source \${index + 1}\`,
  link: url,
  pubDate: \`2023-01-\${String(index + 1).padStart(2, '0')}\`,
  description: \`Mainstream news source \${index + 1}\`,
  content: \`Content \${index + 1}\`,
  feedListId: '1',
}));

// Earth Alliance Feeds
export const EarthAllianceFeeds: FeedItem[] = EARTH_ALLIANCE_SOURCES.map((source, index) => ({
  id: \`ea-\${index + 1}\`,
  title: source.name,
  link: source.url,
  pubDate: \`2023-01-\${String(index + 1).padStart(2, '0')}\`,
  description: \`Earth Alliance aligned source: \${source.category}\`,
  content: \`Earth Alliance intelligence source with trust rating: \${source.trustRating}\`,
  feedListId: '2',
  categories: [source.category],
}));

// Default is now Earth Alliance sources
export const DefaultFeeds: FeedItem[] = EarthAllianceFeeds;

// Feed modes enum
export enum FeedMode {
  EARTH_ALLIANCE = 'EARTH_ALLIANCE',
  MAINSTREAM = 'MAINSTREAM',
  HYBRID = 'HYBRID'
}

// Function to get appropriate feeds based on selected mode
export const getFeedsByMode = (mode: FeedMode) => {
  switch (mode) {
    case FeedMode.EARTH_ALLIANCE:
      return EarthAllianceFeeds;
    case FeedMode.MAINSTREAM:
      return MainstreamFeeds;
    case FeedMode.HYBRID:
      // Combine high-trust Earth Alliance sources with mainstream
      return [...EarthAllianceFeeds.filter(feed => {
        const source = EARTH_ALLIANCE_SOURCES.find(s => s.url === feed.link);
        return source && source.trustRating >= 80;
      }), ...MainstreamFeeds];
    default:
      return EarthAllianceFeeds;
  }
};
EOL
    
    echo "✅ Earth Alliance DefaultFeeds replacement generated at $CONSTANTS_DIR/EarthAllianceDefaultFeeds.ts"
    
    # Create a source verification service
    mkdir -p "$SRC_DIR/services"
    cat > "$SRC_DIR/services/SourceVerificationService.ts" << EOL
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
}
EOL
    
    echo "✅ Source Verification Service generated at $SRC_DIR/services/SourceVerificationService.ts"
}

# Function to run the complete process
run_complete_process() {
    echo "🚀 Running complete Earth Alliance integration process..."
    validate_sources
    expand_roster
    validate_sources  # Validate again after expansion
    generate_ts_integration
    echo "✅ Complete process finished successfully!"
}

# Main loop
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1)
            validate_sources
            echo "Press Enter to continue..."
            read -r
            ;;
        2)
            expand_roster
            echo "Press Enter to continue..."
            read -r
            ;;
        3)
            generate_ts_integration
            echo "Press Enter to continue..."
            read -r
            ;;
        4)
            run_complete_process
            echo "Press Enter to continue..."
            read -r
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Press Enter to continue..."
            read -r
            ;;
    esac
done
