// src/components/feed/FeedSourceValidator.tsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { 
  isSourceVerified, 
  getSourceMetadata, 
  registerFeedSource, 
  getVerifiedSources 
} from '../../utils/contractUtils';
import '../../assets/styles/components/feed-source-validator.css';

interface SourceMetadata {
  name: string;
  description: string;
  url: string;
  category: string;
  trustScore: number;
}

/**
 * FeedSourceValidator component
 * Allows users to verify feed sources on-chain and register new trusted sources
 */
const FeedSourceValidator: React.FC = () => {
  const { isConnected, provider, networkId, walletAddress, accessLevel } = useWeb3();
  
  const [sourceAddress, setSourceAddress] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [metadata, setMetadata] = useState<SourceMetadata | null>(null);
  const [verifiedSources, setVerifiedSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [registrationMode, setRegistrationMode] = useState<boolean>(false);
  const [newSourceMetadata, setNewSourceMetadata] = useState<SourceMetadata>({
    name: '',
    description: '',
    url: '',
    category: 'news',
    trustScore: 7
  });
  const [status, setStatus] = useState<string>('');

  // Load verified sources on initial render
  useEffect(() => {
    if (isConnected && provider && networkId) {
      loadVerifiedSources();
    }
  }, [isConnected, provider, networkId]);

  // Load the list of verified sources
  const loadVerifiedSources = async () => {
    if (!provider || !networkId) return;
    
    setIsLoading(true);
    try {
      const sources = await getVerifiedSources(provider, networkId);
      setVerifiedSources(sources);
    } catch (error) {
      console.error('Error loading verified sources:', error);
      setStatus('Failed to load verified sources');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a source is verified
  const validateSource = async () => {
    if (!sourceAddress || !provider || !networkId) {
      setStatus('Please enter a valid source address');
      return;
    }

    setIsValidating(true);
    setStatus('Validating source...');
    setIsVerified(null);
    setMetadata(null);

    try {
      const verified = await isSourceVerified(sourceAddress, provider, networkId);
      setIsVerified(verified);
      
      if (verified) {
        const metadataStr = await getSourceMetadata(sourceAddress, provider, networkId);
        if (metadataStr) {
          try {
            const parsedMetadata = JSON.parse(metadataStr) as SourceMetadata;
            setMetadata(parsedMetadata);
          } catch (e) {
            console.error('Error parsing metadata:', e);
          }
        }
        setStatus('Source verification completed');
      } else {
        setStatus('Source is not verified');
      }
    } catch (error) {
      console.error('Error validating source:', error);
      setStatus('Error validating source. Check console for details.');
    } finally {
      setIsValidating(false);
    }
  };

  // Register a new source
  const registerSource = async () => {
    if (!sourceAddress || !provider || !networkId) {
      setStatus('Please enter a valid source address');
      return;
    }

    // Basic validation
    if (!newSourceMetadata.name || !newSourceMetadata.description || !newSourceMetadata.url) {
      setStatus('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    setStatus('Registering source...');

    try {
      const metadataStr = JSON.stringify(newSourceMetadata);
      const txHash = await registerFeedSource(sourceAddress, metadataStr, provider, networkId);
      
      setStatus(`Source registered successfully! Transaction: ${txHash}`);
      
      // Reset form and reload sources
      setNewSourceMetadata({
        name: '',
        description: '',
        url: '',
        category: 'news',
        trustScore: 7
      });
      setSourceAddress('');
      setRegistrationMode(false);
      
      // Reload sources after a short delay to allow for block confirmation
      setTimeout(() => loadVerifiedSources(), 5000);
    } catch (error) {
      console.error('Error registering source:', error);
      setStatus('Failed to register source. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update new source metadata
  const handleMetadataChange = (field: keyof SourceMetadata, value: string | number) => {
    setNewSourceMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if user has permission to register sources
  const canRegister = accessLevel >= 2; // Commander level or higher

  return (
    <div className="feed-source-validator">
      <h2>Feed Source Validation</h2>
      
      {!isConnected ? (
        <div className="validator-notice">
          <p>Connect your wallet to access feed source validation features</p>
        </div>
      ) : (
        <div className="validator-content">
          <div className="validator-actions">
            {!registrationMode ? (
              <div className="validation-section">
                <h3>Validate Feed Source</h3>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter source address (0x...)"
                    value={sourceAddress}
                    onChange={(e) => setSourceAddress(e.target.value)}
                    className="address-input"
                  />
                  <button
                    className="validate-button"
                    onClick={validateSource}
                    disabled={isValidating || !sourceAddress}
                  >
                    {isValidating ? 'Validating...' : 'Validate Source'}
                  </button>
                </div>
                
                {isVerified !== null && (
                  <div className={`validation-result ${isVerified ? 'verified' : 'unverified'}`}>
                    <div className="result-header">
                      <span className="result-icon">{isVerified ? '✓' : '✗'}</span>
                      <h4>{isVerified ? 'Verified Source' : 'Unverified Source'}</h4>
                    </div>
                    
                    {isVerified && metadata && (
                      <div className="source-metadata">
                        <div className="metadata-field">
                          <span className="field-label">Name:</span>
                          <span className="field-value">{metadata.name}</span>
                        </div>
                        <div className="metadata-field">
                          <span className="field-label">Description:</span>
                          <span className="field-value">{metadata.description}</span>
                        </div>
                        <div className="metadata-field">
                          <span className="field-label">URL:</span>
                          <a href={metadata.url} target="_blank" rel="noopener noreferrer" className="field-value url">
                            {metadata.url}
                          </a>
                        </div>
                        <div className="metadata-field">
                          <span className="field-label">Category:</span>
                          <span className="field-value">{metadata.category}</span>
                        </div>
                        <div className="metadata-field">
                          <span className="field-label">Trust Score:</span>
                          <span className="field-value trust-score">
                            <span className="score-value">{metadata.trustScore}/10</span>
                            <div className="score-bar">
                              <div 
                                className="score-fill" 
                                style={{ width: `${metadata.trustScore * 10}%` }}
                              ></div>
                            </div>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {canRegister && (
                  <button 
                    className="register-toggle-button"
                    onClick={() => setRegistrationMode(true)}
                  >
                    Register New Source
                  </button>
                )}
              </div>
            ) : (
              <div className="registration-section">
                <h3>Register New Feed Source</h3>
                <div className="registration-form">
                  <div className="form-group">
                    <label htmlFor="sourceAddress">Source Address:</label>
                    <input
                      id="sourceAddress"
                      type="text"
                      placeholder="0x..."
                      value={sourceAddress}
                      onChange={(e) => setSourceAddress(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="sourceName">Source Name:</label>
                    <input
                      id="sourceName"
                      type="text"
                      placeholder="e.g., Earth Alliance News Network"
                      value={newSourceMetadata.name}
                      onChange={(e) => handleMetadataChange('name', e.target.value)}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="sourceDescription">Description:</label>
                    <textarea
                      id="sourceDescription"
                      placeholder="Brief description of the source"
                      value={newSourceMetadata.description}
                      onChange={(e) => handleMetadataChange('description', e.target.value)}
                      className="form-control"
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="sourceUrl">Website URL:</label>
                    <input
                      id="sourceUrl"
                      type="text"
                      placeholder="https://..."
                      value={newSourceMetadata.url}
                      onChange={(e) => handleMetadataChange('url', e.target.value)}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="sourceCategory">Category:</label>
                      <select
                        id="sourceCategory"
                        value={newSourceMetadata.category}
                        onChange={(e) => handleMetadataChange('category', e.target.value)}
                        className="form-control"
                      >
                        <option value="news">News</option>
                        <option value="intelligence">Intelligence</option>
                        <option value="research">Research</option>
                        <option value="government">Government</option>
                        <option value="military">Military</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="form-group half">
                      <label htmlFor="trustScore">Trust Score (1-10):</label>
                      <input
                        id="trustScore"
                        type="number"
                        min="1"
                        max="10"
                        value={newSourceMetadata.trustScore}
                        onChange={(e) => handleMetadataChange('trustScore', parseInt(e.target.value))}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button
                      className="cancel-button"
                      onClick={() => setRegistrationMode(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="register-button"
                      onClick={registerSource}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Registering...' : 'Register Source'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="verified-sources-list">
            <h3>Verified Sources</h3>
            {isLoading ? (
              <div className="loading-sources">Loading sources...</div>
            ) : verifiedSources.length > 0 ? (
              <ul className="sources-list">
                {verifiedSources.map((address, index) => (
                  <li key={index} className="source-item">
                    <span className="source-address">{address}</span>
                    <button
                      className="view-source-button"
                      onClick={() => {
                        setSourceAddress(address);
                        validateSource();
                      }}
                    >
                      View Details
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-sources">No verified sources found on this network</div>
            )}
          </div>
          
          {status && (
            <div className="status-message">
              {status}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedSourceValidator;
