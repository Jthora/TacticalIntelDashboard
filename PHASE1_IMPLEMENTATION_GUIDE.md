# Phase 1 Implementation Guide - Web3 Foundation Completion

## Overview
This guide provides step-by-step instructions for completing Phase 1 of the Web3 implementation, focusing on making existing features production-ready and deploying basic smart contracts.

## Current State Analysis

### What Works Now
- ✅ Web3Context with wallet connection
- ✅ MetaMask integration
- ✅ ENS name resolution
- ✅ Basic UI components
- ✅ Tactical styling integration

### What Needs Immediate Fixes
- 🔴 Replace placeholder contract addresses
- 🔴 Deploy actual smart contracts to testnet
- 🔴 Implement proper error handling
- 🔴 Add transaction state management
- 🔴 Create fallback providers

## Phase 1 Tasks

### Task 1: Smart Contract Deployment (Priority: Critical)

#### 1.1 Create Deployment Scripts
Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  // Deploy Governance Token
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy(
    "Earth Alliance Token",
    "EAT",
    ethers.parseEther("1000000") // 1M tokens
  );
  await governanceToken.waitForDeployment();

  // Deploy Intelligence Verification Contract
  const IntelligenceVerification = await ethers.getContractFactory("IntelligenceVerification");
  const intelVerification = await IntelligenceVerification.deploy(
    await governanceToken.getAddress()
  );
  await intelVerification.waitForDeployment();

  console.log("Governance Token deployed to:", await governanceToken.getAddress());
  console.log("Intelligence Verification deployed to:", await intelVerification.getAddress());
  
  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    governanceToken: await governanceToken.getAddress(),
    intelligenceVerification: await intelVerification.getAddress(),
    deployedAt: new Date().toISOString()
  };
  
  await fs.writeFile(
    `deployments/${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
}
```

#### 1.2 Update Contract Addresses
Create `src/config/contracts.ts`:

```typescript
import { ChainId } from '../types/web3';

interface ContractAddresses {
  governanceToken: string;
  intelligenceVerification: string;
  rewardDistribution: string;
}

export const CONTRACT_ADDRESSES: Record<ChainId, ContractAddresses> = {
  [ChainId.ETHEREUM]: {
    governanceToken: "0x...", // Will be updated after deployment
    intelligenceVerification: "0x...",
    rewardDistribution: "0x..."
  },
  [ChainId.SEPOLIA]: {
    governanceToken: "0x...", // Testnet addresses
    intelligenceVerification: "0x...",
    rewardDistribution: "0x..."
  },
  [ChainId.POLYGON]: {
    governanceToken: "0x...",
    intelligenceVerification: "0x...",
    rewardDistribution: "0x..."
  }
};
```

### Task 2: Enhanced Error Handling (Priority: High)

#### 2.1 Create Web3 Error Types
Create `src/types/web3Errors.ts`:

```typescript
export enum Web3ErrorType {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  NETWORK_UNSUPPORTED = 'NETWORK_UNSUPPORTED',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR'
}

export class Web3Error extends Error {
  constructor(
    public type: Web3ErrorType,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'Web3Error';
  }
}
```

#### 2.2 Update Web3Context with Error Handling
Add to `src/contexts/Web3Context.tsx`:

```typescript
const [error, setError] = useState<Web3Error | null>(null);
const [isLoading, setIsLoading] = useState(false);

const clearError = () => setError(null);

const handleError = (error: any, type: Web3ErrorType): Web3Error => {
  const web3Error = new Web3Error(type, error.message || 'Unknown error', error);
  setError(web3Error);
  return web3Error;
};

// Enhanced connectWallet with proper error handling
const connectWallet = async (): Promise<void> => {
  setIsLoading(true);
  setError(null);
  
  try {
    if (!window.ethereum) {
      throw new Web3Error(
        Web3ErrorType.PROVIDER_ERROR,
        'Please install MetaMask or another Web3 wallet'
      );
    }

    // Rest of connection logic with try/catch blocks
    
  } catch (error: any) {
    if (error instanceof Web3Error) {
      setError(error);
      throw error;
    }
    
    // Handle specific error types
    if (error.code === 4001) {
      throw handleError(error, Web3ErrorType.TRANSACTION_REJECTED);
    } else if (error.code === -32002) {
      throw handleError(error, Web3ErrorType.PROVIDER_ERROR);
    } else {
      throw handleError(error, Web3ErrorType.PROVIDER_ERROR);
    }
  } finally {
    setIsLoading(false);
  }
};
```

### Task 3: Transaction State Management (Priority: High)

#### 3.1 Create Transaction Hook
Create `src/hooks/useTransaction.ts`:

```typescript
import { useState, useCallback } from 'react';
import { ContractTransaction } from 'ethers';

interface TransactionState {
  isLoading: boolean;
  hash?: string;
  confirmations: number;
  error?: Error;
  receipt?: any;
}

export const useTransaction = () => {
  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    confirmations: 0
  });

  const executeTransaction = useCallback(async (
    transactionFunction: () => Promise<ContractTransaction>,
    requiredConfirmations = 1
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const tx = await transactionFunction();
      setState(prev => ({ ...prev, hash: tx.hash }));
      
      // Wait for transaction receipt
      const receipt = await tx.wait(requiredConfirmations);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        confirmations: receipt.confirmations,
        receipt 
      }));
      
      return receipt;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      confirmations: 0
    });
  }, []);

  return {
    ...state,
    executeTransaction,
    reset
  };
};
```

### Task 4: Fallback Provider System (Priority: Medium)

#### 4.1 Create Provider Manager
Create `src/utils/providerManager.ts`:

```typescript
import { ethers, JsonRpcProvider } from 'ethers';

interface ProviderConfig {
  name: string;
  rpcUrl: string;
  priority: number;
}

const PROVIDER_CONFIGS: Record<number, ProviderConfig[]> = {
  1: [ // Ethereum Mainnet
    { name: 'Infura', rpcUrl: `https://mainnet.infura.io/v3/${process.env.VITE_INFURA_PROJECT_ID}`, priority: 1 },
    { name: 'Alchemy', rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.VITE_ALCHEMY_API_KEY}`, priority: 2 },
    { name: 'Public', rpcUrl: 'https://ethereum.publicnode.com', priority: 3 }
  ],
  137: [ // Polygon
    { name: 'Polygon RPC', rpcUrl: 'https://polygon-rpc.com', priority: 1 },
    { name: 'Infura Polygon', rpcUrl: `https://polygon-mainnet.infura.io/v3/${process.env.VITE_INFURA_PROJECT_ID}`, priority: 2 }
  ]
};

export class ProviderManager {
  private providers: Map<number, JsonRpcProvider[]> = new Map();
  
  constructor() {
    this.initializeProviders();
  }
  
  private initializeProviders() {
    Object.entries(PROVIDER_CONFIGS).forEach(([chainId, configs]) => {
      const providers = configs
        .sort((a, b) => a.priority - b.priority)
        .map(config => new JsonRpcProvider(config.rpcUrl));
      
      this.providers.set(Number(chainId), providers);
    });
  }
  
  async getWorkingProvider(chainId: number): Promise<JsonRpcProvider | null> {
    const providers = this.providers.get(chainId);
    if (!providers) return null;
    
    for (const provider of providers) {
      try {
        await provider.getBlockNumber();
        return provider;
      } catch (error) {
        console.warn(`Provider failed for chain ${chainId}:`, error);
        continue;
      }
    }
    
    return null;
  }
}
```

### Task 5: Gas Estimation & Optimization (Priority: Medium)

#### 5.1 Create Gas Estimation Hook
Create `src/hooks/useGasEstimation.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCost: string;
  estimatedCostUSD?: string;
}

export const useGasEstimation = () => {
  const { provider, networkId } = useWeb3();
  const [gasPrice, setGasPrice] = useState<bigint>(BigInt(0));
  const [isEIP1559, setIsEIP1559] = useState(false);

  useEffect(() => {
    if (!provider) return;

    const updateGasInfo = async () => {
      try {
        const feeData = await provider.getFeeData();
        if (feeData.gasPrice) {
          setGasPrice(feeData.gasPrice);
        }
        setIsEIP1559(!!feeData.maxFeePerGas);
      } catch (error) {
        console.error('Failed to fetch gas data:', error);
      }
    };

    updateGasInfo();
    const interval = setInterval(updateGasInfo, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [provider, networkId]);

  const estimateGas = async (
    contractCall: () => Promise<any>
  ): Promise<GasEstimate> => {
    if (!provider) throw new Error('Provider not connected');

    try {
      const gasLimit = await contractCall();
      const feeData = await provider.getFeeData();
      
      let estimatedCost: bigint;
      let estimate: GasEstimate;

      if (isEIP1559 && feeData.maxFeePerGas) {
        estimatedCost = gasLimit * feeData.maxFeePerGas;
        estimate = {
          gasLimit,
          gasPrice: feeData.gasPrice || BigInt(0),
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(0),
          estimatedCost: ethers.formatEther(estimatedCost)
        };
      } else {
        estimatedCost = gasLimit * (feeData.gasPrice || gasPrice);
        estimate = {
          gasLimit,
          gasPrice: feeData.gasPrice || gasPrice,
          estimatedCost: ethers.formatEther(estimatedCost)
        };
      }

      return estimate;
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw error;
    }
  };

  return {
    gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
    isEIP1559,
    estimateGas
  };
};
```

### Task 6: Testing Infrastructure (Priority: High)

#### 6.1 Enhanced Web3Context Tests
Update `src/contexts/__tests__/Web3Context.test.tsx`:

```typescript
import { render, act, waitFor } from '@testing-library/react';
import { Web3Provider, useWeb3 } from '../Web3Context';
import { Web3ErrorType } from '../../types/web3Errors';

// Mock component to test the hook
const TestComponent = () => {
  const { isConnected, connectWallet, error } = useWeb3();
  return (
    <div>
      <div data-testid="connection-status">{isConnected ? 'connected' : 'disconnected'}</div>
      <button data-testid="connect-button" onClick={connectWallet}>Connect</button>
      {error && <div data-testid="error">{error.message}</div>}
    </div>
  );
};

describe('Web3Context', () => {
  beforeEach(() => {
    // Mock window.ethereum
    Object.defineProperty(window, 'ethereum', {
      value: {
        request: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn(),
      },
      writable: true,
    });
  });

  it('should handle wallet connection success', async () => {
    const mockAccounts = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
    
    (window.ethereum as any).request.mockImplementation((params: any) => {
      if (params.method === 'eth_requestAccounts') {
        return Promise.resolve(mockAccounts);
      }
      return Promise.resolve([]);
    });

    const { getByTestId } = render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    expect(getByTestId('connection-status')).toHaveTextContent('disconnected');

    await act(async () => {
      getByTestId('connect-button').click();
    });

    await waitFor(() => {
      expect(getByTestId('connection-status')).toHaveTextContent('connected');
    });
  });

  it('should handle wallet connection rejection', async () => {
    (window.ethereum as any).request.mockRejectedValue({
      code: 4001,
      message: 'User rejected request'
    });

    const { getByTestId } = render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    await act(async () => {
      getByTestId('connect-button').click();
    });

    await waitFor(() => {
      expect(getByTestId('error')).toHaveTextContent('User rejected request');
    });
  });
});
```

### Task 7: Environment Configuration (Priority: Medium)

#### 7.1 Create Environment Template
Create `.env.example`:

```bash
# Web3 Configuration
VITE_INFURA_PROJECT_ID=your_infura_project_id
VITE_INFURA_API_SECRET=your_infura_api_secret
VITE_ALCHEMY_API_KEY=your_alchemy_api_key

# Contract Addresses (will be populated after deployment)
VITE_GOVERNANCE_TOKEN_ADDRESS=
VITE_INTELLIGENCE_VERIFICATION_ADDRESS=
VITE_REWARD_DISTRIBUTION_ADDRESS=

# Network Configuration
VITE_DEFAULT_CHAIN_ID=1
VITE_ENABLE_TESTNET=false

# IPFS Configuration
VITE_IPFS_GATEWAY=https://ipfs.infura.io/ipfs/
VITE_IPFS_API_URL=https://ipfs.infura.io:5001

# Feature Flags
VITE_ENABLE_WEB3_DEBUG=false
VITE_ENABLE_GAS_OPTIMIZATION=true
VITE_ENABLE_TRANSACTION_SIMULATION=true
```

#### 7.2 Update Vite Config
Update `vite.config.ts`:

```typescript
export default defineConfig({
  // ... existing config
  define: {
    // ... existing defines
    __WEB3_DEBUG__: JSON.stringify(process.env.VITE_ENABLE_WEB3_DEBUG === 'true'),
    __CONTRACT_ADDRESSES__: JSON.stringify({
      governanceToken: process.env.VITE_GOVERNANCE_TOKEN_ADDRESS || '',
      intelligenceVerification: process.env.VITE_INTELLIGENCE_VERIFICATION_ADDRESS || '',
      rewardDistribution: process.env.VITE_REWARD_DISTRIBUTION_ADDRESS || ''
    })
  }
});
```

## Implementation Timeline

### Week 1
- [ ] **Monday-Tuesday**: Smart contract deployment scripts and testnet deployment
- [ ] **Wednesday-Thursday**: Enhanced error handling and transaction state management
- [ ] **Friday**: Testing infrastructure setup

### Week 2
- [ ] **Monday-Tuesday**: Fallback provider system and gas estimation
- [ ] **Wednesday-Thursday**: Environment configuration and documentation
- [ ] **Friday**: Integration testing and bug fixes

## Testing Checklist

### Manual Testing
- [ ] Wallet connection/disconnection
- [ ] Network switching
- [ ] Error scenarios (no wallet, wrong network, transaction rejection)
- [ ] Gas estimation accuracy
- [ ] Fallback provider functionality

### Automated Testing
- [ ] Unit tests for all Web3 utilities
- [ ] Integration tests for Web3Context
- [ ] Contract deployment tests
- [ ] Error handling tests

## Success Criteria

### Phase 1 Complete When:
- [ ] Smart contracts deployed to testnet
- [ ] All placeholder addresses replaced with real addresses
- [ ] Zero critical errors in Web3 operations
- [ ] 90%+ test coverage for Web3 code
- [ ] Comprehensive error handling implemented
- [ ] Gas estimation working accurately
- [ ] Fallback providers functional
- [ ] Documentation complete

## Next Steps After Phase 1

Once Phase 1 is complete:
1. **Review and validate** all functionality with stakeholders
2. **Deploy to staging environment** for user acceptance testing
3. **Plan Phase 2** implementation (Intelligence Verification System)
4. **Gather user feedback** and iterate on UX improvements

This foundation will enable rapid development of advanced Web3 features in subsequent phases while maintaining security and reliability standards.
