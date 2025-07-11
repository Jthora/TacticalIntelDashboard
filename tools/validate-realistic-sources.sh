#!/bin/bash

# Realistic Intelligence Source Validator
# Tests all sources in the new realistic roster to ensure they're working

echo "🔍 REALISTIC INTELLIGENCE SOURCE VALIDATION"
echo "============================================="
echo "Testing $(wc -l < ../src/constants/RealisticIntelligenceSources.ts | tr -d ' ') sources..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
WORKING=0
FAILED=0
SLOW=0

# Test function
test_feed() {
    local name="$1"
    local url="$2"
    local category="$3"
    
    TOTAL=$((TOTAL + 1))
    
    echo -n "${CYAN}Testing:${NC} $name... "
    
    # Test with 10 second timeout
    START_TIME=$(date +%s%N)
    
    if curl -L --max-time 10 --retry 2 --silent --fail "$url" > /dev/null 2>&1; then
        END_TIME=$(date +%s%N)
        RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 )) # Convert to milliseconds
        
        if [ $RESPONSE_TIME -gt 5000 ]; then
            echo "${YELLOW}✓ SLOW${NC} (${RESPONSE_TIME}ms) - $category"
            SLOW=$((SLOW + 1))
        else
            echo "${GREEN}✅ WORKING${NC} (${RESPONSE_TIME}ms) - $category"
        fi
        WORKING=$((WORKING + 1))
    else
        echo "${RED}❌ FAILED${NC} - $category"
        FAILED=$((FAILED + 1))
    fi
}

echo "🔗 Testing Mainstream News Sources..."
echo "-----------------------------------"
test_feed "Reuters World News" "https://feeds.reuters.com/reuters/topNews" "MAINSTREAM_NEWS"
test_feed "Associated Press" "https://feeds.apnews.com/top" "MAINSTREAM_NEWS"
test_feed "BBC World News" "https://feeds.bbci.co.uk/news/world/rss.xml" "MAINSTREAM_NEWS"
test_feed "NPR News" "https://feeds.npr.org/1001/rss.xml" "MAINSTREAM_NEWS"

echo ""
echo "📰 Testing Independent Journalism Sources..."
echo "-------------------------------------------"
test_feed "Veterans Today" "https://www.veteranstoday.com/feed" "INDEPENDENT_JOURNALISM"
test_feed "Unlimited Hangout" "https://unlimitedhangout.com/feed" "INDEPENDENT_JOURNALISM"
test_feed "The Last American Vagabond" "https://www.thelastamericanvagabond.com/feed" "INDEPENDENT_JOURNALISM"
test_feed "The Grayzone" "https://thegrayzone.com/feed" "INDEPENDENT_JOURNALISM"
test_feed "MintPress News" "https://www.mintpressnews.com/feed" "INDEPENDENT_JOURNALISM"
test_feed "The Corbett Report" "https://www.corbettreport.com/feed" "INDEPENDENT_JOURNALISM"
test_feed "Covert Action Quarterly" "https://covertactionquarterly.org/feed" "INDEPENDENT_JOURNALISM"

echo ""
echo "🔍 Testing Alternative Analysis Sources..."
echo "----------------------------------------"
test_feed "Moon of Alabama" "https://www.moonofalabama.org/atom.xml" "ALTERNATIVE_ANALYSIS"
test_feed "Naked Capitalism" "https://www.nakedcapitalism.com/feed" "ALTERNATIVE_ANALYSIS"
test_feed "Zero Hedge" "https://feeds.feedburner.com/zerohedge/feed" "ALTERNATIVE_ANALYSIS"
test_feed "CounterPunch" "https://www.counterpunch.org/feed" "ALTERNATIVE_ANALYSIS"

echo ""
echo "🔒 Testing Tech & Security Sources..."
echo "------------------------------------"
test_feed "Krebs on Security" "https://krebsonsecurity.com/feed/" "TECH_SECURITY"
test_feed "Dark Reading" "https://www.darkreading.com/rss.xml" "TECH_SECURITY"
test_feed "The Register" "https://www.theregister.com/headlines.atom" "TECH_SECURITY"
test_feed "Ars Technica" "https://feeds.arstechnica.com/arstechnica/index" "TECH_SECURITY"

echo ""
echo "🏥 Testing Health Research Sources..."
echo "------------------------------------"
test_feed "Children's Health Defense" "https://childrenshealthdefense.org/feed" "HEALTH_RESEARCH"
test_feed "The Highwire" "https://thehighwire.com/feed" "HEALTH_RESEARCH"
test_feed "Alliance for Natural Health" "https://anh-usa.org/feed" "HEALTH_RESEARCH"
test_feed "Natural Health Research Institute" "https://naturalhealthresearch.org/feed" "HEALTH_RESEARCH"

echo ""
echo "🧠 Testing Consciousness Research Sources..."
echo "------------------------------------------"
test_feed "Institute of Noetic Sciences" "https://noetic.org/feed" "CONSCIOUSNESS_RESEARCH"
test_feed "International Association for Near-Death Studies" "https://iands.org/feed" "CONSCIOUSNESS_RESEARCH"

echo ""
echo "🔬 Testing Scientific Research Sources..."
echo "---------------------------------------"
test_feed "New Energy Times" "https://newenergytimes.com/feed" "SCIENTIFIC_RESEARCH"
test_feed "Science Daily" "https://www.sciencedaily.com/rss/all.xml" "SCIENTIFIC_RESEARCH"
test_feed "Phys.org" "https://phys.org/rss-feed/" "SCIENTIFIC_RESEARCH"

echo ""
echo "📊 VALIDATION SUMMARY"
echo "===================="
echo "Total Sources Tested: $TOTAL"
echo "${GREEN}Working Sources: $WORKING${NC}"
echo "${RED}Failed Sources: $FAILED${NC}"
echo "${YELLOW}Slow Sources: $SLOW${NC}"
echo ""

SUCCESS_RATE=$(( (WORKING * 100) / TOTAL ))
echo "Success Rate: ${SUCCESS_RATE}%"

if [ $SUCCESS_RATE -ge 90 ]; then
    echo "${GREEN}✅ EXCELLENT - Ready for production${NC}"
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo "${YELLOW}⚠️ GOOD - Minor issues to address${NC}"
else
    echo "${RED}❌ POOR - Significant issues need fixing${NC}"
fi

echo ""
echo "💡 COMPARISON WITH PREVIOUS SYSTEM"
echo "================================="
echo "Previous System:"
echo "  - Total Sources: 58"
echo "  - Working Sources: 14" 
echo "  - Success Rate: 24.1%"
echo ""
echo "New Realistic System:"
echo "  - Total Sources: $TOTAL"
echo "  - Working Sources: $WORKING"
echo "  - Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $SUCCESS_RATE -gt 24 ]; then
    IMPROVEMENT=$(( SUCCESS_RATE - 24 ))
    echo "${GREEN}🚀 IMPROVEMENT: +${IMPROVEMENT} percentage points${NC}"
else
    echo "${RED}📉 REGRESSION: System performance decreased${NC}"
fi

echo ""
echo "Generated: $(date)"
echo "Script: validate-realistic-sources.sh"
