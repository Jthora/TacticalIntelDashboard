# 🔄 Data Flow Architecture

## Overview

The Tactical Intel Dashboard follows a unidirectional data flow pattern designed for real-time intelligence processing and alerting. This document outlines how data moves through the system from external RSS feeds to user notifications.

## 🏗️ High-Level Data Flow

```
External RSS Feeds → CORS Proxy → Feed Processing → Alert System → User Interface
                                      ↓
                                 Local Storage → Analytics → Export
```

## 📊 Detailed Data Flow Components

### 1. **Data Ingestion Layer**

#### **External RSS Sources**
- **Input**: Various RSS/XML feeds from news sources, government feeds, etc.
- **Challenge**: CORS restrictions prevent direct browser access
- **Solution**: Vercel Edge Function proxy

#### **CORS Proxy System** (`/api/proxy-feed.ts`)
```typescript
Request Flow:
1. Client requests feed via: /api/proxy-feed?url=<RSS_URL>
2. Edge function fetches RSS content
3. Adds CORS headers
4. Returns XML/JSON to client
```

**Fallback Strategy**:
- Primary: Vercel Edge Function
- Secondary: Public CORS proxies
- Tertiary: Direct fetch (for permissive sources)

### 2. **Data Processing Layer**

#### **Feed Service** (`/src/services/FeedService.ts`)
```typescript
Processing Pipeline:
RSS XML → Parse XML → Extract Items → Normalize Data → Store Locally
```

**Data Transformation**:
- **Input**: Raw RSS XML
- **Parser**: Browser DOMParser API
- **Output**: Standardized Feed objects

```typescript
interface Feed {
  id: string;
  title: string;
  description?: string;
  link: string;
  pubDate?: string;
  author?: string;
  categories?: string[];
  content?: string;
  source: string; // Feed source identifier
}
```

#### **Data Normalization**
- **Date Parsing**: Multiple date format support
- **Content Cleaning**: HTML sanitization
- **Category Extraction**: Tag and category normalization
- **Deduplication**: Prevent duplicate articles

### 3. **Intelligence Processing Layer**

#### **Alert System** (`/src/services/alerts/AlertService.ts`)
```typescript
Alert Processing Flow:
Feed Items → Keyword Matching → Priority Scoring → Notification Triggering
```

**Keyword Matching Engine**:
- **Boolean Logic**: AND, OR, NOT operations
- **Case Insensitive**: Flexible matching
- **Multi-field Search**: Title, description, content, categories
- **Performance**: Optimized for real-time processing

**Priority Scoring**:
```typescript
type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

Priority Calculation:
- Keyword frequency
- Source reliability weight
- Time sensitivity
- User-defined priority overrides
```

### 4. **Data Persistence Layer**

#### **Local Storage Strategy**
```typescript
Storage Structure:
- feeds_cache: Recently fetched feed data
- alert_configs: User alert configurations
- alert_history: Triggered alert history
- user_preferences: UI settings and preferences
- feed_lists: Saved feed collections
```

**Cache Management**:
- **TTL**: 30-minute cache for feed data
- **Cleanup**: Automatic old data removal
- **Sync**: Cross-tab synchronization

### 5. **User Interface Layer**

#### **State Management** (React Hooks)
```typescript
Data Flow in Components:
useAlerts → AlertService → Local Storage
            ↓
        Notification System → Browser APIs
            ↓
        UI Components → User Feedback
```

#### **Real-Time Updates**
- **Auto-Refresh**: 5-minute intervals
- **Event-Driven**: User action triggers
- **Push Notifications**: Browser notification API

## 🔄 Complete Data Flow Example

### Scenario: New Breaking News Alert

1. **Data Ingestion** (5 seconds)
   ```
   CNN RSS Feed → Vercel Edge Proxy → Raw XML Response
   ```

2. **Processing** (2 seconds)
   ```
   XML → Feed Parser → Normalized Feed Objects → Local Cache
   ```

3. **Alert Processing** (1 second)
   ```
   New Feed Items → Keyword Engine → "breaking news" match → Critical Alert
   ```

4. **Notification** (1 second)
   ```
   Critical Alert → Browser Notification + Sound + UI Indicator
   ```

5. **User Interaction** (User dependent)
   ```
   User sees notification → Opens dashboard → Reviews details → Acknowledges alert
   ```

6. **Analytics** (Background)
   ```
   Alert trigger → History log → Statistics update → Dashboard metrics
   ```

## 🎯 Performance Characteristics

### **Latency Targets**
- **Feed Refresh**: < 10 seconds for complete cycle
- **Alert Processing**: < 3 seconds from new data to notification
- **UI Responsiveness**: < 100ms for user interactions
- **Cache Access**: < 50ms for local storage operations

### **Throughput Capacity**
- **Concurrent Feeds**: 50+ RSS sources
- **Feed Items**: 1000+ items in memory
- **Alert Rules**: 100+ simultaneous alerts
- **Storage Limit**: 5MB local storage (browser limit)

## 🔒 Data Security

### **Privacy Considerations**
- **Local-Only Storage**: No server-side data persistence
- **No User Tracking**: Anonymous usage
- **Secure Transport**: HTTPS for all external requests
- **Data Retention**: User-controlled cleanup

### **Error Handling**
- **Graceful Degradation**: System continues with partial failures
- **Retry Logic**: Automatic retry for failed feed fetches
- **Fallback Sources**: Multiple proxy options
- **User Feedback**: Clear error messages and recovery options

## 🛠️ Development Considerations

### **Testing Data Flow**
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end flow testing
- **Performance Tests**: Load and stress testing
- **Monitoring**: Real-time performance metrics

### **Debugging Tools**
- **Console Logging**: Detailed flow tracking
- **Local Storage Inspector**: Data persistence debugging
- **Network Tab**: Proxy and feed request monitoring
- **Performance Profiler**: Bottleneck identification

---

*This data flow architecture ensures reliable, fast, and secure intelligence processing while maintaining the tactical, mission-critical aesthetic of the platform.*

**Last Updated**: July 6, 2025  
**Next Review**: During Phase 3 development
