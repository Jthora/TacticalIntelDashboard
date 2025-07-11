# Intelligence Source Restoration Plan

## 🚨 Current Problem Analysis

The Tactical Intel Dashboard has degraded from a realistic intelligence source roster to mostly **fake/mock data sources**. Our validation shows:

- **58 total sources configured**
- **Only 14 working sources (24.1% success rate)**
- **44 fake/broken sources (75.9% failure rate)**

### Fake Sources Examples:
- `defenseintelnetwork.org` - Non-existent domain
- `specops-forum.net` - Non-existent domain  
- `strategicintelhub.com` - Non-existent domain
- `zeropoint-tech.org` - Non-existent domain
- `financialresetmonitor.com` - Non-existent domain

## ✅ Working Sources (Verified Real)

Based on the validation report, these **14 sources are confirmed working**:

### **Independent Journalism (7 sources)**
1. **Veterans Today** - `https://www.veteranstoday.com/feed`
2. **Unlimited Hangout** - `https://unlimitedhangout.com/feed`
3. **The Last American Vagabond** - `https://www.thelastamericanvagabond.com/feed`
4. **The Grayzone** - `https://thegrayzone.com/feed`
5. **MintPress News** - `https://www.mintpressnews.com/feed`
6. **The Corbett Report** - `https://www.corbettreport.com/feed`
7. **Covert Action Quarterly** - `https://covertactionquarterly.org/feed`

### **Health & Science Research (4 sources)**
8. **Children's Health Defense** - `https://childrenshealthdefense.org/feed`
9. **The Highwire** - `https://thehighwire.com/feed`
10. **Alliance for Natural Health** - `https://anh-usa.org/feed`
11. **Natural Health Research Institute** - `https://naturalhealthresearch.org/feed`

### **Consciousness Research (2 sources)**
12. **Institute of Noetic Sciences** - `https://noetic.org/feed`
13. **International Association for Near-Death Studies** - `https://iands.org/feed`

### **Technology Research (1 source)**
14. **New Energy Times** - `https://newenergytimes.com/feed`

## 🎯 Recommended Solution

### **Phase 1: Immediate Cleanup**
1. **Remove all fake sources** (44 sources)
2. **Keep only verified working sources** (14 sources)
3. **Add mainstream comparison sources** for balance

### **Phase 2: Expand with Real Sources**
Add verified RSS feeds from legitimate sources:

#### **Mainstream News (for comparison)**
- **Reuters** - `https://feeds.reuters.com/reuters/topNews`
- **Associated Press** - `https://feeds.apnews.com/top`
- **BBC World** - `https://feeds.bbci.co.uk/news/world/rss.xml`
- **NPR News** - `https://feeds.npr.org/1001/rss.xml`

#### **Tech & Security**
- **Krebs on Security** - `https://krebsonsecurity.com/feed/`
- **Dark Reading** - `https://www.darkreading.com/rss.xml`
- **The Register** - `https://www.theregister.com/headlines.atom`
- **Ars Technica** - `https://feeds.arstechnica.com/arstechnica/index`

#### **Alternative Analysis**
- **Moon of Alabama** - `https://www.moonofalabama.org/atom.xml`
- **Naked Capitalism** - `https://www.nakedcapitalism.com/feed`
- **Zero Hedge** - `https://feeds.feedburner.com/zerohedge/feed`
- **CounterPunch** - `https://www.counterpunch.org/feed`

#### **Scientific Research**
- **Science Daily** - `https://www.sciencedaily.com/rss/all.xml`
- **Phys.org** - `https://phys.org/rss-feed/`
- **Nature News** - `https://www.nature.com/nature.rss`

### **Phase 3: Quality Control**
- **Regular validation** - Run feed validation weekly
- **Response time monitoring** - Track feed performance
- **Content quality scoring** - Rate source reliability
- **Dead link removal** - Automated cleanup of broken feeds

## 📊 Proposed New Architecture

### **Feed Categories** (Realistic & Functional)
```typescript
export enum FeedCategory {
  MAINSTREAM_NEWS = 'MAINSTREAM_NEWS',           // 4-6 major outlets
  INDEPENDENT_JOURNALISM = 'INDEPENDENT_JOURNALISM', // 7 verified sources  
  ALTERNATIVE_ANALYSIS = 'ALTERNATIVE_ANALYSIS',     // 4-6 alternative perspectives
  TECH_SECURITY = 'TECH_SECURITY',               // 4-6 tech sources
  HEALTH_RESEARCH = 'HEALTH_RESEARCH',           // 4 verified sources
  CONSCIOUSNESS_RESEARCH = 'CONSCIOUSNESS_RESEARCH', // 2 verified sources
  SCIENTIFIC_RESEARCH = 'SCIENTIFIC_RESEARCH'    // 3-4 academic sources
}
```

### **Feed Modes** (Balanced Options)
```typescript
export enum FeedMode {
  MAINSTREAM = 'MAINSTREAM',           // Traditional news sources
  ALTERNATIVE = 'ALTERNATIVE',         // Independent + alternative analysis  
  RESEARCH = 'RESEARCH',              // Academic + scientific sources
  BALANCED = 'BALANCED',              // Mix of all categories
  CUSTOM = 'CUSTOM'                   // User-defined selection
}
```

## 🛠️ Implementation Steps

1. **Create new source file** with only verified working feeds
2. **Update feed validation** to run automatically
3. **Implement feed health monitoring** 
4. **Add source credibility ratings** based on track record
5. **Create backup/fallback** system for when sources go down
6. **User customization** - Allow users to add their own verified sources

This approach will restore the dashboard to using **real, functional intelligence sources** while maintaining the sophisticated UI and filtering capabilities already built.
