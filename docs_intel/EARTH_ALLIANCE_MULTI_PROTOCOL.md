# Earth Alliance Multi-Protocol Source Integration

This document explains how the Earth Alliance multi-protocol source system works and how to use it in the Tactical Intelligence Dashboard.

## Overview

The Earth Alliance source roster has been expanded to include sources beyond just RSS feeds, now supporting multiple protocols:

- RSS/Atom feeds
- JSON feeds
- API endpoints
- IPFS content
- Mastodon instances
- Secure Scuttlebutt (SSB) nodes

All sources have been validated through a multi-protocol validation process to ensure they're working correctly.

## Key Components

### TypeScript Files

The integration has generated several TypeScript files:

1. `src/constants/EarthAllianceSources.ts` - Contains the validated Earth Alliance sources with metadata
2. `src/constants/EarthAllianceDefaultFeeds.ts` - Provides the default feed list using Earth Alliance sources
3. `src/constants/SourceProtocolAdapter.ts` - Handles different protocols through a common interface

### Protocol Abstraction

The `SourceProtocolAdapter` provides a unified way to fetch and parse content from different protocols. It dynamically selects the appropriate handler based on the endpoint or protocol type.

### New UI Components

- `FeedModeSelector` - Allows switching between Earth Alliance, Mainstream, and Hybrid feed modes
- `SourceInfo` - Displays source trust ratings, alliance alignment, and protocol information

## Usage

### Feed Mode Selection

You can now switch between different feed modes:

- **Earth Alliance**: Shows vetted sources aligned with Earth Alliance priorities
- **Mainstream**: Shows conventional news sources for comparison
- **Hybrid**: Shows high-trust Earth Alliance sources alongside selected mainstream outlets

```tsx
import { useFeedMode } from '../contexts/FeedModeContext';
import { FeedMode } from '../constants/EarthAllianceDefaultFeeds';

// In your component:
const { feedMode, setFeedMode } = useFeedMode();

// To switch modes:
setFeedMode(FeedMode.EARTH_ALLIANCE);
```

### Displaying Source Metadata

Use the `SourceInfo` component to display trust ratings and protocol information:

```tsx
import SourceInfo from '../components/SourceInfo';
import { EARTH_ALLIANCE_SOURCES } from '../constants/EarthAllianceSources';

// In your component:
const source = EARTH_ALLIANCE_SOURCES[0];

// In your render:
<SourceInfo source={source} />
```

### Fetching from Different Protocols

The `EnhancedFeedFetcherService` handles fetching from all supported protocols:

```tsx
import { EnhancedFeedFetcherService } from '../features/feeds/services/EnhancedFeedFetcherService';

// Fetch from any endpoint (RSS, JSON, API, IPFS, Mastodon, SSB)
const items = await EnhancedFeedFetcherService.fetchFeed(endpoint);

// Convert to Feed objects
const feeds = EnhancedFeedFetcherService.convertToFeeds(items, endpoint);
```

## Adding New Sources

To add new sources to the Earth Alliance roster:

1. Edit `docs/EARTH_ALLIANCE_SOURCE_ROSTER.md`
2. Add the source with appropriate metadata including the protocol type
3. Run the multi-protocol validator
4. Run the integration script to update the TypeScript files

## Protocol Support Details

The system supports the following protocols:

### RSS/Atom
Standard RSS and Atom feeds are supported via fetch and XML parsing.

### JSON
JSON Feeds (jsonfeed.org format) and other JSON-based feeds are supported.

### API
REST API endpoints with proper authentication if needed.

### IPFS
IPFS content accessed via HTTP gateways.

### Mastodon
Mastodon instance timelines via the Mastodon API.

### SSB
Secure Scuttlebutt via a proxy or gateway (requires additional server-side support).
