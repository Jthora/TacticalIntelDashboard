# WTTP (Web3 Transfer Protocol) Specification
Version 2.0

## Overview

WTTP (Web3 Transfer Protocol) is a blockchain-based protocol that implements HTTP-like functionality for decentralized web resources. It provides a comprehensive system for storing, retrieving, and managing web resources on the blockchain with built-in content addressing and royalty mechanisms.

## Protocol Structure

### URL Format

WTTP URLs follow the pattern:
```
wttp://[host]:[network]/[path]
```

Where:
- `host`: Contract address or ENS name
- `network`: Optional network identifier (defaults to configured master network)
- `path`: Resource path

Examples:
- `wttp://0x1234567890123456789012345678901234567890/index.html`
- `wttp://site.eth:mainnet/page.html`
- `wttp://example.com:sepolia/api/data.json`

### Request Methods

#### GET
Retrieves a resource from the specified path.
```
GET {
    requestLine: { protocol: "WTTP/2.0", path: string },
    rangeStart: uint256,
    rangeEnd: uint256,
    accepts: bytes2[],
    acceptsCharset: bytes2[],
    acceptsLocation: bytes2[],
    ifNoneMatch: bytes32,
    ifModifiedSince: uint256
}
```

#### HEAD
Retrieves metadata about a resource without the content body.
```
HEAD {
    requestLine: { protocol: "WTTP/2.0", path: string },
    accepts: bytes2[],
    acceptsCharset: bytes2[],
    acceptsLocation: bytes2[]
}
```

#### PUT
Creates or replaces a resource at the specified path.
```
PUT {
    requestLine: { protocol: "WTTP/2.0", path: string },
    mimeType: bytes2,
    charset: bytes2,
    location: bytes2,
    publisher: address,
    data: bytes
}
```

#### PATCH
Updates a multi-part resource.
```
PATCH {
    requestLine: { protocol: "WTTP/2.0", path: string },
    data: bytes,
    chunk: uint256,
    publisher: address
}
```

#### LOCATE
Gets resource location information.
```
LOCATE {
    host: address,
    requestLine: { protocol: "WTTP/2.0", path: string }
}
```

#### DEFINE
Sets resource metadata and permissions.
```
DEFINE {
    host: address,
    requestLine: { protocol: "WTTP/2.0", path: string },
    header: HeaderInfo
}
```
    charset: bytes2,
    location: bytes2,
    publisher: address,
    data: bytes
}
```

#### PATCH
Updates a multi-part resource.
```
PATCH {
    requestLine: { protocol: "WTTP/2.0", path: string },
    data: bytes,
    chunk: uint256,
    publisher: address
}
```

#### LOCATE
Gets resource location information.
```
LOCATE {
    host: address,
    requestLine: { protocol: "WTTP/2.0", path: string }
}
```

#### DEFINE
Sets resource metadata and permissions.
```
DEFINE {
    host: address,
    requestLine: { protocol: "WTTP/2.0", path: string },
    header: HeaderInfo
}
```

### Response Structure

All WTTP responses include:
- Status code (HTTP-compatible)
- Headers (cache control, content type, etc.)
- Optional body data
- ETag for content verification
- Metadata (size, version, timestamps)

### Status Codes

- 200: OK
- 201: Created
- 206: Partial Content
- 304: Not Modified
- 400: Bad Request
- 404: Not Found
- 405: Method Not Allowed
- 416: Range Not Satisfiable
- 505: WTTP Version Not Supported

### Headers

WTTP supports standard HTTP headers plus blockchain-specific extensions:
- Content-Type: MIME type and charset
- Content-Location: Storage location type
- Cache-Control: Caching directives
- ETag: Content hash for validation
- Publisher: Address of content publisher
- Range: Chunk range for partial requests

### Data Structures

#### DataPoints
Atomic storage units with:
- Content hash address
- Data payload
- Metadata (size, type, publisher)
- Royalty information

#### Resources
Composite structures containing:
- Multiple DataPoints
- Version information
- Access permissions
- Cache directives

## Royalty System

WTTP includes a built-in royalty system:
- Gas-based royalty calculations
- Publisher receives 90% of royalties
- TW3 protocol receives 10% fee
- Royalty waivers for authorized publishers

## Performance Considerations

- Chunk size optimization (recommended: 16KB)
- Gas efficiency through batching
- Content deduplication
- Caching strategies

## Security

- Content addressing prevents tampering
- Permission-based access control
- Royalty enforcement
- Collision-resistant hashing

## Implementation Guidelines

### Client Implementation
1. Parse WTTP URL
2. Build appropriate request structure
3. Handle network switching if specified
4. Execute request through WTTP contract
5. Process response according to status code

### Site Implementation
1. Implement required WTTP methods
2. Handle DataPoint storage
3. Manage access controls
4. Process royalty payments
5. Maintain resource metadata

## References
- [WTTP GitHub Repository](https://github.com/TechnicallyWeb3/WTTP)
- [HTTP/1.1 Specification (RFC 2616)](https://tools.ietf.org/html/rfc2616)
