# WTTP Deployment Guide for Tactical Intel Dashboard

This guide provides step-by-step instructions for deploying the Tactical Intel Dashboard to WTTP (Web3 Transfer Protocol).

## Prerequisites

Before deploying to WTTP, ensure you have:

1. **Node.js 18+** and **npm 9+** installed
2. **Wallet with testnet ETH** (for Sepolia deployment)
3. **Basic knowledge of Web3** and smart contracts
4. **WTTP handler** and **@tw3/solidity** packages

## Quick Start

### 1. Install WTTP Dependencies

```bash
npm run wttp:install
```

This installs the required WTTP packages:
- `wttp-handler`: For WTTP protocol interaction
- `@tw3/solidity`: Base contracts for WTTP sites

### 2. Configure Environment

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Add your WTTP configuration to `.env`:

```env
# WTTP Configuration
WTTP_SITE_ADDRESS=         # Will be set after contract deployment
WTTP_PRIVATE_KEY=0x...     # Your private key for content management
WTTP_NETWORK=sepolia       # Network for deployment
WTTP_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# WTTP Frontend Configuration
VITE_WTTP_MODE=true                 # Enable WTTP mode
VITE_WTTP_SITE_ADDRESS=             # Will be set after deployment
VITE_WTTP_NETWORK=sepolia
```

### 3. Full Deployment (Recommended)

For a complete deployment from scratch:

```bash
npm run wttp:full-deploy
```

This command will:
1. Compile smart contracts
2. Deploy the WTTP site contract
3. Build the frontend application
4. Upload content to WTTP

### 4. Test Deployment

Verify your deployment works correctly:

```bash
npm run wttp:test
```

## Step-by-Step Deployment

### Step 1: Compile Contracts

```bash
npm run wttp:compile
```

This compiles the `TacticalIntelSite.sol` contract which extends the base WTTP `TW3Site` contract.

### Step 2: Deploy Site Contract

```bash
npm run wttp:deploy-contract
```

This deploys the WTTP site contract to the configured network. The script will:
- Deploy `TacticalIntelSite` contract
- Set up site metadata (name, description, tags)
- Grant content management permissions
- Save deployment information

**Important**: Update your `.env` file with the contract address printed by this command.

### Step 3: Build Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Step 4: Deploy Content

```bash
npm run wttp:deploy-content
```

This uploads your built application to the WTTP contract. The script will:
- Upload HTML, CSS, and JavaScript files
- Upload static assets (favicon, robots.txt, etc.)
- Set appropriate MIME types and metadata
- Verify successful uploads

## Available Scripts

| Script | Description |
|--------|-------------|
| `wttp:install` | Install WTTP dependencies |
| `wttp:compile` | Compile smart contracts |
| `wttp:deploy-contract` | Deploy WTTP site contract |
| `wttp:deploy-content` | Upload content to WTTP |
| `wttp:deploy` | Build and deploy content |
| `wttp:full-deploy` | Complete deployment process |
| `wttp:test` | Test deployed site |

## Configuration Options

### Site Metadata

The site metadata is configured in `scripts/deploy-wttp-site.js`:

```javascript
const siteConfig = {
    name: "Tactical Intel Dashboard",
    description: "Advanced Intelligence Analysis and Monitoring Platform for Web3",
    tags: "intelligence,tactical,analysis,monitoring,web3,blockchain,security"
};
```

### Content Management

The `TacticalIntelSite` contract includes content management features:

- **Owner permissions**: Full contract control
- **Content managers**: Can upload/update content
- **Access control**: Prevent unauthorized content changes

### Network Configuration

Supported networks:
- **Sepolia** (recommended for testing)
- **Mainnet** (for production)
- **Local** (for development)

Configure in `hardhat.config.js`:

```javascript
networks: {
  sepolia: {
    url: process.env.WTTP_RPC_URL,
    accounts: [process.env.WTTP_PRIVATE_KEY]
  }
}
```

## Frontend Integration

### WTTP Mode

When `VITE_WTTP_MODE=true`, the frontend can:
- Display WTTP site information
- Show decentralized hosting status
- Provide WTTP-specific features

### Environment Variables

The frontend uses these WTTP environment variables:

```typescript
const wttpConfig = {
  enabled: process.env.VITE_WTTP_MODE === 'true',
  siteAddress: process.env.VITE_WTTP_SITE_ADDRESS,
  network: process.env.VITE_WTTP_NETWORK
};
```

## Troubleshooting

### Common Issues

1. **Insufficient balance**
   ```
   Solution: Get testnet ETH from faucets:
   - https://sepoliafaucet.com/
   - https://faucets.chain.link/sepolia
   ```

2. **Contract deployment fails**
   ```
   Check:
   - Network configuration
   - Private key format
   - RPC URL accessibility
   ```

3. **Content upload fails**
   ```
   Verify:
   - Contract address is correct
   - Account has content manager permissions
   - Build files exist
   ```

4. **Site not accessible**
   ```
   Test:
   - Contract is deployed
   - Content was uploaded successfully
   - WTTP URL format is correct
   ```

### Debug Commands

Check deployment status:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

View contract on block explorer:
```
https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>
```

Test WTTP URL manually:
```bash
curl -X GET "wttp://<CONTRACT_ADDRESS>/"
```

## Security Considerations

### Private Key Management

- **Never commit private keys** to version control
- **Use environment variables** for sensitive data
- **Consider hardware wallets** for production
- **Rotate keys regularly** for security

### Content Management

- **Limit content managers** to trusted addresses
- **Monitor contract events** for unauthorized changes
- **Implement content validation** before uploads
- **Backup content** before major updates

### Network Security

- **Use HTTPS RPC endpoints** when possible
- **Verify contract addresses** before deployment
- **Monitor gas costs** for efficiency
- **Test on testnets** before mainnet

## Production Checklist

Before deploying to mainnet:

- [ ] Test complete deployment on Sepolia
- [ ] Verify all content uploads correctly
- [ ] Test site accessibility via WTTP
- [ ] Review security configurations
- [ ] Backup deployment information
- [ ] Monitor initial deployment
- [ ] Document contract addresses
- [ ] Set up monitoring and alerts

## Support and Resources

### Documentation
- [WTTP Protocol Specification](./wttp.spec.md)
- [WTTP Handler Documentation](https://github.com/TechnicallyWeb3/wttp)
- [TW3 Solidity Contracts](https://github.com/TechnicallyWeb3/tw3-solidity)

### Community
- [WTTP Discord](https://discord.gg/wttp)
- [GitHub Issues](https://github.com/TechnicallyWeb3/wttp/issues)
- [Technical Documentation](https://docs.wttp.tech)

### Tools
- [WTTP Browser Extension](https://chrome.google.com/webstore/wttp)
- [WTTP Proxy Services](https://proxy.wttp.tech)
- [Contract Verification](https://etherscan.io)

## Next Steps

After successful deployment:

1. **Set up monitoring** for your WTTP site
2. **Configure custom domains** if needed
3. **Implement analytics** for usage tracking
4. **Plan content update workflows**
5. **Consider scaling solutions** for high traffic
6. **Integrate with other Web3 services**

---

**Need Help?** Check the [troubleshooting section](#troubleshooting) or reach out to the WTTP community for support.
