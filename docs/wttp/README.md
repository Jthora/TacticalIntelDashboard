# WTTP (Web3 Transfer Protocol) Deployment Guide

## Overview

WTTP is a blockchain-based protocol that implements HTTP-like functionality for decentralized web resources. This guide covers deploying the Tactical Intel Dashboard onto WTTP.

## What is WTTP?

WTTP provides a comprehensive system for storing, retrieving, and managing web resources on the blockchain with built-in content addressing and royalty mechanisms. It implements HTTP-like methods (GET, PUT, PATCH, HEAD, etc.) for Web3 applications.

## Repository Structure

The WTTP protocol is implemented across three main packages:

- **Protocol Implementation**: [technicallyweb3/wttp](https://github.com/technicallyweb3/wttp)
  - Core protocol implementation
  - TypeScript handler
  - Documentation and examples

- **NPM Package**: [wttp-handler](https://www.npmjs.com/package/wttp-handler)
  - JavaScript/TypeScript client library
  - Fetch-like API for WTTP interactions
  - Ready-to-use examples

- **Smart Contracts**: [@tw3/solidity](https://www.npmjs.com/package/@tw3/solidity)
  - Solidity contract implementations
  - Base contracts for WTTP sites
  - Import path: `@tw3/solidity/contracts/wttp/TW3Site.sol`

## Core Features

### Resource Management
- HTTP-like methods (GET, PUT, PATCH, HEAD, etc.)
- Multi-part resource support
- Content-type and charset handling
- Range requests for large resources
- ETags and conditional requests
- Cache control directives

### Storage System
- Content-addressed storage using DataPoints
- Collision-resistant addressing
- Chunked data storage for large resources
- Efficient data deduplication

### Permission System
- Role-based access control
- Site admin capabilities
- Resource-specific admin roles
- Granular permission management

### Royalty System
- Gas-based royalty calculations
- Publisher royalty collection
- TW3 fee distribution (10%)
- Royalty waiver options

## Deployment Prerequisites

- Node.js
- npm/yarn
- Hardhat
- Solidity ^0.8.20

## Quick Start Deployment

### 1. Install WTTP Dependencies

```bash
npm install wttp-handler @tw3/solidity ethers dotenv
```

### 2. Deploy Your Site Contract

Create a contract extending TW3Site:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@tw3/solidity/contracts/wttp/TW3Site.sol";

contract TacticalIntelSite is TW3Site {
    constructor(
        string memory _name, 
        string memory _description, 
        string memory _tags
    ) TW3Site(_name, _description, _tags) {}
}
```

Deploy using Remix IDE or Hardhat on Sepolia testnet.

### 3. Create Basic Deployment Script

```javascript
const { wttp } = require('wttp-handler');
const { Wallet } = require('ethers');
require('dotenv').config();

// Replace with your deployed contract address
const SITE_ADDRESS = "0x..."; 

// Create a new account for testing and add its private key to .env
const signer = new Wallet(process.env.PRIVATE_KEY);

async function main() {
    // Write content
    const putResponse = await wttp.fetch(`wttp://${SITE_ADDRESS}/index.html`, {
        method: "PUT",
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Location": "datapoint/chunk",
            "Publisher": signer.address
        },
        body: "<html><body>Hello Web3!</body></html>",
        signer: signer
    });
    console.log("PUT Response:", putResponse.status);

    // Read content
    const getResponse = await wttp.fetch(`wttp://${SITE_ADDRESS}/index.html`);
    const content = await getResponse.text();
    console.log("Content:", content);
}

main().catch(console.error);
```

### 4. Setup Environment

Create a `.env` file:
```bash
# ⚠️ Create a new account for testing! Don't use your main account
PRIVATE_KEY=your_private_key_here
WTTP_MNEMONIC=your_mnemonic_here
```

### 5. Run Your Script
```bash
node wttp-deploy.js
```

> ⚠️ **Security Note**: Always create a new account for testing and never share or commit your private keys.

## Advanced Deployment

### Network Configuration

WTTP supports multiple networks configured via `wttp.config.json`:

```json
{
  "masterNetwork": "polygon",
  "networks": {
    "polygon": {
      "chainId": 137,
      "rpcUrls": ["https://polygon-bor-rpc.publicnode.com"],
      "contracts": {
        "dataPointStorageAddress": "0x...",
        "dataPointRegistryAddress": "0x...",
        "wttpAddress": "0x..."
      }
    },
    "sepolia": {
      "chainId": 11155111,
      "rpcUrls": ["https://ethereum-sepolia-rpc.publicnode.com"],
      "contracts": {
        "dataPointStorageAddress": "0x...",
        "dataPointRegistryAddress": "0x...",
        "wttpAddress": "0x..."
      }
    }
  }
}
```

### Deployment Scripts

WTTP provides deployment scripts:

1. **Core Contract Deployment**: `scripts/01-deploy-core.ts`
   - Deploys DataPointStorage
   - Deploys DataPointRegistry
   - Deploys WTTP contract

2. **Site Deployment**: `scripts/02-deploy-example-sites.ts`
   - Deploys example WTTP sites
   - Uploads content using WTTPHandler

3. **Key Generation**: `scripts/03-generate-keys.ts`
   - Generates secure wallets for deployment

4. **Funding**: `scripts/04-fund-deployers.ts`
   - Funds deployer accounts with ETH

### Contract Architecture

WTTP uses several core contracts:

- **DataPointStorage**: Stores content data points
- **DataPointRegistry**: Manages data point registry and royalties
- **WTTP**: Main protocol contract
- **WTTPSite**: Base contract for WTTP sites (extend this)
- **TW3Site**: Enhanced site contract with metadata

### Content Upload Process

1. **Deploy Site Contract**: Extend TW3Site and deploy
2. **Initialize WTTPHandler**: Connect to deployed WTTP protocol
3. **Upload Content**: Use PUT/PATCH methods to upload files
4. **Verify Content**: Use GET methods to verify uploads

### Large File Handling

WTTP supports chunked uploads for large files:

```javascript
// Initial chunk with PUT
const response1 = await handler.fetch(`wttp://${site}/large-file.html`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/html',
        'Content-Location': 'datapoint/chunk'
    },
    body: chunk1
});

// Additional chunks with PATCH
const response2 = await handler.fetch(`wttp://${site}/large-file.html`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'text/html',
        'Content-Location': 'datapoint/chunk',
        'Range': 'chunks=1'
    },
    body: chunk2
});
```

## Performance Metrics

Based on WTTP testing:
- Average write time: 23ms per chunk
- Average read time: 24ms per chunk
- Average gas per chunk: 2.85M gas
- Tested chunk size: 16KB
- Maximum tested file size: 10MB

## Protocol Specification

### Request Methods
- GET: Retrieve resources
- PUT: Create or replace resources
- PATCH: Update multi-part resources
- HEAD: Retrieve resource metadata
- LOCATE: Get resource location information

### Status Codes
- 200: OK
- 206: Partial Content
- 304: Not Modified
- 404: Not Found
- 405: Method Not Allowed
- 416: Range Not Satisfiable
- 505: WTTP Version Not Supported

### URL Format
```
wttp://[site-address]:[network]/[path]
```

Examples:
- `wttp://0x1234.../index.html`
- `wttp://site.eth:mainnet/page.html`

## Security Considerations

⚠️ **Security Notes**:
- Always create a new account for testing
- Never share or commit private keys
- Use environment variables for sensitive data
- Test on testnets before mainnet deployment

## Troubleshooting

### Common Issues

1. **Contract Not Found**: Ensure site contract is deployed and address is correct
2. **Gas Estimation Failed**: Check network configuration and account funding
3. **Content Not Found**: Verify content was uploaded successfully
4. **Permission Denied**: Ensure deployer has site admin privileges

### Debug Tools

WTTP provides debugging utilities:
- `debug-feeds.js`: Debug feed processing
- `comprehensive-test.js`: Full protocol testing
- Contract manager for address tracking

## Testing

Run the test suite:
```
npm test
```

## Next Steps for Tactical Intel Dashboard

1. Deploy WTTP site contract for Tactical Intel Dashboard
2. Integrate content upload into build process
3. Configure frontend to interact with WTTP protocol
4. Set up automated content deployment pipeline
5. Test on testnet before mainnet deployment

## Resources

- [WTTP GitHub Repository](https://github.com/TechnicallyWeb3/WTTP)
- [NPM Package: wttp-handler](https://www.npmjs.com/package/wttp-handler)
- [Solidity Contracts: @tw3/solidity](https://www.npmjs.com/package/@tw3/solidity)
- [HTTP/1.1 Specification (RFC 2616)](https://tools.ietf.org/html/rfc2616)

### Testing

Run the test suite:
```
npm test
```

## Protocol Specification

### Request Methods
- GET: Retrieve resources
- PUT: Create or replace resources
- PATCH: Update multi-part resources
- HEAD: Retrieve resource metadata
- LOCATE: Get resource location information

### Status Codes
- 200: OK
- 206: Partial Content
- 304: Not Modified
- 404: Not Found
- 405: Method Not Allowed
- 416: Range Not Satisfiable
- 505: WTTP Version Not Supported

### Data Structures
- DataPoints: Atomic storage units
- Resources: Composite data structures
- Headers: Resource metadata and control information

## Performance Metrics

Based on current testing:
- Average write time: 23ms per chunk
- Average read time: 24ms per chunk
- Average gas per chunk: 2.85M gas
- Tested chunk size: 16KB
- Maximum tested file size: 10MB

## License

AGPL-3.0
