# Action Button Investigation

## Status: Investigating defunct Action button UI at bottom

### Potential Candidates Found:

1. **QuickActions Component** (`src/components/QuickActions.tsx`)
   - Contains "ACTIONS" button text
   - Has expandable panel with action buttons
   - Status: NOT imported in current HomePage.tsx
   - Used in: MainScreen.tsx (which is not the active screen)

2. **AlertStats Component** (`src/components/alerts/AlertStats.tsx`)
   - Contains "Quick Actions" section with action buttons
   - Has buttons: "Create Alert", "Export Data", "Settings"
   - Status: NOT directly imported in active components
   - Used via: AlertManager (which is not imported)

3. **FeedItem Action Buttons** (`src/components/FeedItem.tsx`)
   - Contains action-button classes
   - Part of feed items, not at bottom of interface

4. **Health Component** (`src/components/Health.tsx`)
   - Contains diagnostic-actions section
   - Has SCAN, CLEAN, REPAIR buttons
   - Status: IS imported in RightSidebar → HomePage

### Next Steps:
- Examine Health component as most likely candidate
- Check for any floating/fixed positioned elements
- Look for CSS that might be showing hidden elements

### Scrollbar Fix Status:
✅ COMPLETED - Fixed auto-expansion by removing problematic min-height: 400px
✅ COMPLETED - Added stable scrollbar CSS rules
✅ COMPLETED - Resolved conflicting overflow rules

## Priority Algorithm Investigation ✅ COMPLETED

**ISSUE IDENTIFIED**: Reddit posts marked as CRITICAL based on popularity, not intelligence relevance

### Root Cause Analysis:
**File**: `src/services/DataNormalizer.ts`
**Function**: `normalizeRedditPosts()` + `mapScoreToPriority()`
**Problem**: Reddit posts prioritized by upvote count instead of intelligence value

### Current Flawed Algorithm:
```typescript
priority: this.mapScoreToPriority(post.data.score)

mapScoreToPriority(score: number):
- score > 1000 = 'critical'  ← Post "What's your funniest 'false positive' moment" has >1000 upvotes
- score > 500 = 'high'
- score > 100 = 'medium'  
- score ≤ 100 = 'low'
```

### Why This Is Wrong:
- **Popular ≠ Important**: Funny memes get high upvotes but aren't intelligence-critical
- **Context Ignored**: Algorithm doesn't consider if content is actually relevant to intelligence/security
- **Misleading UI**: Users see CRITICAL indicators on entertainment content

### Proposed Solution:
Replace Reddit score-based priority with content-based intelligence classification

### Container Height Fix Status:
✅ IDENTIFIED - Root issue: tactical-main using 100vh instead of 100% 
✅ FIXED - Changed tactical-main height from 100vh to 100% to fit within grid cell
✅ APPLIED - Added height inheritance chain fixes for proper container sizing
🔄 TESTING - Verifying bottom clipping is resolved

### Issue Analysis:
**Problem**: Intelligence Feed clipping at bottom due to viewport height miscalculation
**Root Cause**: Container using 100vh when it should use 100% to fit within parent grid cell
**Solution**: Fixed height inheritance: tactical-dashboard (100vh) → tactical-main-content (100%) → home-page-container (100%) → tactical-main (100%)
