// src/components/admin/ContractDeploymentPanel.tsx
import '../../assets/styles/components/contract-deployment-panel.css';

import React, { useEffect,useState } from 'react';

import { useWeb3 } from '../../contexts/Web3Context';
import { deployFeedSourceValidator, getContractAddress,registerContractAddress } from '../../utils/contractDeployment';

/**
 * ContractDeploymentPanel component
 * Admin panel for deploying smart contracts and managing deployments
 */
const ContractDeploymentPanel: React.FC = () => {
  const { isConnected, provider, networkId, accessLevel } = useWeb3();
  
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [deployedNetworks, setDeployedNetworks] = useState<{[chainId: string]: string}>({});
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  
  // Check if user has admin access
  const isAdmin = accessLevel >= 3; // Admin level or higher
  
  // Load existing contract deployments
  useEffect(() => {
    if (isConnected && networkId) {
      loadContractAddresses();
      const address = getContractAddress(networkId);
      setContractAddress(address || '');
    }
  }, [isConnected, networkId]);
  
  // Load all deployed contract addresses from local storage
  const loadContractAddresses = () => {
    try {
      const contractAddressesStr = localStorage.getItem('contractAddresses') || '{}';
      const addresses = JSON.parse(contractAddressesStr);
      setDeployedNetworks(addresses);
    } catch (error) {
      console.error('Error loading contract addresses:', error);
    }
  };
  
  // Deploy the FeedSourceValidator contract
  const deployContract = async () => {
    if (!provider || !networkId) {
      setDeploymentStatus('Web3 provider not available');
      return;
    }
    
    setShowConfirmation(false);
    setIsDeploying(true);
    setDeploymentStatus('Deploying FeedSourceValidator contract...');
    
    try {
      const result = await deployFeedSourceValidator(provider);
      
      if (result.success && result.contractAddress) {
        setContractAddress(result.contractAddress);
        registerContractAddress(result.contractAddress, networkId);
        setDeploymentStatus(`Contract deployed successfully at ${result.contractAddress}`);
        loadContractAddresses(); // Refresh the list
      } else {
        setDeploymentStatus(`Deployment failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deploying contract:', error);
      setDeploymentStatus(`Error deploying contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeploying(false);
    }
  };
  
  // Register an existing contract address
  const registerContract = () => {
    if (!contractAddress || !networkId) {
      setDeploymentStatus('Please enter a valid contract address');
      return;
    }
    
    try {
      registerContractAddress(contractAddress, networkId);
      setDeploymentStatus(`Contract address registered for network ${networkId}`);
      loadContractAddresses(); // Refresh the list
    } catch (error) {
      console.error('Error registering contract:', error);
      setDeploymentStatus('Failed to register contract address');
    }
  };
  
  // Get network name from ID
  const getNetworkName = (chainId: string): string => {
    const networks: {[key: string]: string} = {
      '1': 'Ethereum Mainnet',
      '5': 'Goerli Testnet',
      '11155111': 'Sepolia Testnet',
      '137': 'Polygon Mainnet',
      '80001': 'Mumbai Testnet',
      '42161': 'Arbitrum One',
      '421613': 'Arbitrum Goerli'
    };
    
    return networks[chainId] || `Chain ID ${chainId}`;
  };
  
  // Show confirmation before deployment
  const handleDeployClick = () => {
    setShowConfirmation(true);
  };
  
  if (!isConnected) {
    return (
      <div className="contract-deployment-panel">
        <h2>Smart Contract Deployment</h2>
        <div className="deployment-notice">
          <p>Please connect your wallet to access contract deployment features</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="contract-deployment-panel">
        <h2>Smart Contract Deployment</h2>
        <div className="deployment-notice">
          <p>You need admin access to deploy contracts</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="contract-deployment-panel">
      <h2>Smart Contract Deployment</h2>
      
      <div className="deployment-section">
        <h3>FeedSourceValidator Contract</h3>
        
        {networkId && deployedNetworks[networkId.toString()] ? (
          <div className="deployed-status">
            <span className="status-indicator deployed"></span>
            <span>Deployed on current network</span>
            <div className="contract-address">
              {deployedNetworks[networkId.toString()]}
            </div>
          </div>
        ) : (
          <div className="deployed-status">
            <span className="status-indicator not-deployed"></span>
            <span>Not deployed on current network</span>
          </div>
        )}
        
        <div className="deployment-actions">
          <div className="deployment-form">
            <div className="form-group">
              <label htmlFor="contractAddress">Contract Address:</label>
              <div className="address-input-group">
                <input
                  id="contractAddress"
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                  className="form-control"
                />
                <button
                  className="register-button"
                  onClick={registerContract}
                  disabled={!contractAddress}
                >
                  Register Address
                </button>
              </div>
            </div>
          </div>
          
          <div className="deployment-buttons">
            <button
              className="deploy-button"
              onClick={handleDeployClick}
              disabled={isDeploying}
            >
              {isDeploying ? 'Deploying...' : 'Deploy New Contract'}
            </button>
          </div>
          
          {showConfirmation && (
            <div className="deployment-confirmation">
              <p>
                You are about to deploy a new FeedSourceValidator contract to the current network 
                ({networkId ? getNetworkName(networkId.toString()) : 'Unknown'}).
              </p>
              <p>This action cannot be undone. Are you sure you want to continue?</p>
              <div className="confirmation-buttons">
                <button
                  className="cancel-button"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-button"
                  onClick={deployContract}
                >
                  Confirm Deployment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="deployed-networks">
        <h3>Deployed Networks</h3>
        {Object.keys(deployedNetworks).length > 0 ? (
          <table className="networks-table">
            <thead>
              <tr>
                <th>Network</th>
                <th>Contract Address</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(deployedNetworks).map(([chainId, address]) => (
                <tr key={chainId}>
                  <td>{getNetworkName(chainId)}</td>
                  <td className="address-cell">{address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-deployments">
            No contract deployments found
          </div>
        )}
      </div>
      
      {deploymentStatus && (
        <div className="deployment-status">
          {deploymentStatus}
        </div>
      )}
    </div>
  );
};

export default ContractDeploymentPanel;
