// src/components/ipfs/IPFSStoragePanel.tsx
import React, { useState, useEffect } from 'react';
import { useIPFS } from '../../contexts/IPFSContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { encryptContent, decryptContent, createSharedEncryptionKey, encryptWithSharedKey, decryptWithSharedKey } from '../../utils/encryptionUtils';
import { pinToMultipleServices, getPinStatus } from '../../utils/ipfsPinningService';
import '../../assets/styles/components/ipfs-storage-panel.css';

/**
 * IPFSStoragePanel component
 * Allows users to upload and retrieve content from IPFS
 */
const IPFSStoragePanel: React.FC = () => {
  const { isConnected: isWeb3Connected, provider } = useWeb3();
  const { isConnected: isIPFSConnected, uploadContent, getContent, pinContent, ipfsError } = useIPFS();
  
  const [content, setContent] = useState<string>('');
  const [cid, setCid] = useState<string>('');
  const [retrievedContent, setRetrievedContent] = useState<string>('');
  const [retrievedCid, setRetrievedCid] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isRetrieving, setIsRetrieving] = useState<boolean>(false);
  const [isPinning, setIsPinning] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [encryptionMetadata, setEncryptionMetadata] = useState<any>(null);
  const [selectedPinningServices, setSelectedPinningServices] = useState<string[]>(['infura']);
  const [pinningResults, setPinningResults] = useState<any[]>([]);
  const [sharingAddress, setSharingAddress] = useState<string>('');
  const [isSharedEncryption, setIsSharedEncryption] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [decryptionStage, setDecryptionStage] = useState<'metadata' | 'content' | 'complete'>('metadata');
  const [contentName, setContentName] = useState<string>('');

  // Clear decryption state when changing CID
  useEffect(() => {
    setEncryptionMetadata(null);
    setDecryptionStage('metadata');
  }, [retrievedCid]);

  // Handle content upload
  const handleUpload = async () => {
    if (!content) {
      setStatus('Please enter content to upload');
      return;
    }

    setIsUploading(true);
    setStatus('Uploading to IPFS...');

    try {
      let contentToUpload = content;
      let metadata = null;
      
      // Encrypt content if requested
      if (isEncrypted && provider) {
        setStatus('Encrypting content...');
        
        if (isSharedEncryption && sharingAddress) {
          // Create shared encryption key
          const { sharedKey, metadata: sharedMetadata } = await createSharedEncryptionKey(sharingAddress, provider);
          // Encrypt with shared key
          contentToUpload = encryptWithSharedKey(content, sharedKey);
          metadata = sharedMetadata;
        } else {
          // Standard personal encryption
          const encrypted = await encryptContent(content, provider);
          contentToUpload = encrypted.encryptedContent;
          metadata = encrypted.metadata;
        }
        
        setEncryptionMetadata(metadata);
      }
      
      // Upload to IPFS (encrypted or plain)
      const newCid = await uploadContent(contentToUpload);
      setCid(newCid);
      
      // If encrypted, also upload metadata with special naming convention
      if (isEncrypted && metadata) {
        const metadataCid = await uploadContent(JSON.stringify(metadata));
        setStatus(`Encrypted content uploaded with CID: ${newCid}\nMetadata CID: ${metadataCid}`);
        
        // Store for easier retrieval
        localStorage.setItem(`metadata-for-${newCid}`, metadataCid);
        localStorage.setItem(`content-name-${newCid}`, contentName || 'Unnamed Content');
      } else {
        setStatus(`Content uploaded successfully with CID: ${newCid}`);
        if (contentName) {
          localStorage.setItem(`content-name-${newCid}`, contentName);
        }
      }
      
      // Pin to selected services
      if (selectedPinningServices.length > 1) { // Infura is always included
        handlePinToMultipleServices(newCid);
      }
    } catch (error) {
      console.error('Error uploading content:', error);
      setStatus('Failed to upload content. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle content retrieval
  const handleRetrieve = async () => {
    if (!retrievedCid) {
      setStatus('Please enter a CID to retrieve');
      return;
    }

    setIsRetrieving(true);
    setStatus('Retrieving from IPFS...');

    try {
      let content = await getContent(retrievedCid);
      
      // Check if content might be encrypted (try to parse as JSON first)
      let isEncryptedContent = false;
      let retrievedMetadata = null;
      
      try {
        // Try to parse as JSON in case it's metadata
        const parsed = JSON.parse(content);
        // Check if it looks like encryption metadata
        if (parsed.encryptionVersion || parsed.encryptionMethod === 'AES' || parsed.keyType === 'shared') {
          retrievedMetadata = parsed;
          isEncryptedContent = true;
          
          // Store metadata and update status based on the type
          setEncryptionMetadata(retrievedMetadata);
          setDecryptionStage('content');
          
          if (parsed.keyType === 'shared') {
            setStatus('Found shared encryption metadata. Please enter the CID of the encrypted content.');
          } else {
            setStatus('Found encryption metadata. Please enter the CID of the encrypted content.');
          }
        }
      } catch (e) {
        // Not JSON, might be encrypted content or regular content
      }
      
      // If we have metadata from a previous step and provider
      if (encryptionMetadata && provider && !isEncryptedContent && decryptionStage === 'content') {
        try {
          setStatus('Attempting to decrypt content...');
          
          let decrypted;
          if (encryptionMetadata.keyType === 'shared') {
            // Get the shared key
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const { sharedKey } = await createSharedEncryptionKey(
              encryptionMetadata.sharedWith === address ? 
                encryptionMetadata.creator : encryptionMetadata.sharedWith,
              provider
            );
            
            // Decrypt with shared key
            decrypted = decryptWithSharedKey(content, sharedKey);
          } else {
            // Standard personal decryption
            decrypted = await decryptContent(content, encryptionMetadata, provider);
          }
          
          content = decrypted;
          setDecryptionStage('complete');
          setStatus('Content decrypted successfully!');
        } catch (error) {
          console.error('Decryption failed:', error);
          setStatus(`Retrieved encrypted content but failed to decrypt: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      setRetrievedContent(content);
      
      if (isEncryptedContent) {
        setEncryptionMetadata(retrievedMetadata);
        setStatus('Retrieved encryption metadata. Enter the content CID to decrypt.');
      } else if (!encryptionMetadata || decryptionStage === 'complete') {
        setStatus('Content retrieved successfully');
        setDecryptionStage('complete');
        
        // Check if we have a name for this content
        const contentName = localStorage.getItem(`content-name-${retrievedCid}`);
        if (contentName) {
          setStatus(`Retrieved: ${contentName}`);
        }
        
        // Check if we have related metadata
        const metadataCid = localStorage.getItem(`metadata-for-${retrievedCid}`);
        if (metadataCid && !encryptionMetadata) {
          setStatus(prev => `${prev}\nThis content has associated metadata: ${metadataCid}`);
        }
      }
    } catch (error) {
      console.error('Error retrieving content:', error);
      setStatus('Failed to retrieve content. Check console for details.');
      setRetrievedContent('');
    } finally {
      setIsRetrieving(false);
    }
  };

  // Helper to automatically retrieve metadata for content
  const retrieveMetadataForContent = async () => {
    const metadataCid = localStorage.getItem(`metadata-for-${retrievedCid}`);
    if (metadataCid) {
      setStatus(`Found associated metadata. Retrieving...`);
      setRetrievedCid(metadataCid);
      
      // Trigger retrieval
      const metadata = await getContent(metadataCid);
      try {
        const parsed = JSON.parse(metadata);
        setEncryptionMetadata(parsed);
        setDecryptionStage('content');
        setStatus('Retrieved associated metadata. Ready to decrypt the content.');
      } catch (e) {
        setStatus('Found metadata CID, but failed to parse the metadata.');
      }
    } else {
      setStatus('No associated metadata found for this content. It may not be encrypted.');
    }
  };

  // Handle content pinning
  const handlePin = async () => {
    if (!cid) {
      setStatus('Please upload content first or enter a CID to pin');
      return;
    }

    setIsPinning(true);
    setStatus('Pinning content to IPFS...');

    try {
      await pinContent(cid);
      setStatus(`Content with CID ${cid} pinned successfully`);
    } catch (error) {
      console.error('Error pinning content:', error);
      setStatus('Failed to pin content. Check console for details.');
    } finally {
      setIsPinning(false);
    }
  };
  
  // Pin to multiple services
  const handlePinToMultipleServices = async (cidToPins: string) => {
    const targetCid = cidToPins || cid;
    if (!targetCid) {
      setStatus('Please upload content first or enter a CID to pin');
      return;
    }
    
    setIsPinning(true);
    setStatus('Pinning content to multiple IPFS services...');
    
    try {
      const results = await pinToMultipleServices(
        targetCid,
        contentName || `content-${Date.now()}`,
        { source: 'tactical-intel-dashboard' }
      );
      
      setPinningResults(results);
      
      const successCount = results.filter(r => r.success).length;
      setStatus(`Content pinned to ${successCount}/${results.length} services`);
    } catch (error) {
      console.error('Error pinning to multiple services:', error);
      setStatus('Failed to pin content to multiple services. Check console for details.');
    } finally {
      setIsPinning(false);
    }
  };

  // Check pinning status
  const handleCheckPinStatus = async () => {
    if (!retrievedCid) {
      setStatus('Please enter a CID to check');
      return;
    }
    
    setIsPinning(true);
    setStatus('Checking pin status across services...');
    
    try {
      const results = await getPinStatus(retrievedCid);
      setPinningResults(results);
      
      const pinnedCount = results.filter(r => r.success).length;
      setStatus(`Content is pinned on ${pinnedCount}/${results.length} services`);
    } catch (error) {
      console.error('Error checking pin status:', error);
      setStatus('Failed to check pin status. Check console for details.');
    } finally {
      setIsPinning(false);
    }
  };

  // Generate IPFS gateway links
  const getIpfsLinks = (contentCid: string) => {
    if (!contentCid) return null;
    
    return (
      <div className="ipfs-links">
        <div className="link-item">
          <span className="link-label">IPFS Gateway:</span>
          <a 
            href={`https://ipfs.io/ipfs/${contentCid}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View on IPFS Gateway
          </a>
        </div>
        <div className="link-item">
          <span className="link-label">Local Gateway:</span>
          <a 
            href={`http://localhost:8080/ipfs/${contentCid}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View on Local Gateway
          </a>
        </div>
        <div className="link-item">
          <span className="link-label">Infura Gateway:</span>
          <a 
            href={`https://tactical-intel.infura-ipfs.io/ipfs/${contentCid}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View on Infura Gateway
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="ipfs-storage-panel">
      <h2>Decentralized Storage (IPFS)</h2>
      
      {!isWeb3Connected ? (
        <div className="ipfs-connection-notice">
          <p>Please connect your Web3 wallet to use IPFS features</p>
          <button 
            className="btn-secondary"
            onClick={() => window.location.href = '/profile'}
          >
            Go to Profile
          </button>
        </div>
      ) : !isIPFSConnected ? (
        <div className="ipfs-connection-error">
          <p>Error connecting to IPFS: {ipfsError || 'Unknown error'}</p>
        </div>
      ) : (
        <div className="ipfs-functional">
          <div className="ipfs-status-indicator">
            <span className="status-dot connected"></span>
            Connected to IPFS Network
          </div>
          
          <div className="ipfs-operations">
            <div className="upload-section">
              <h3>Upload Content</h3>
              <div className="form-group">
                <input
                  type="text"
                  className="content-name"
                  value={contentName}
                  onChange={(e) => setContentName(e.target.value)}
                  placeholder="Content name (optional)"
                />
              </div>
              <textarea
                className="content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content to store on IPFS"
                rows={5}
              />
              <div className="encryption-options">
                <div className="encryption-option">
                  <label className="encryption-label">
                    <input
                      type="checkbox"
                      checked={isEncrypted}
                      onChange={(e) => {
                        setIsEncrypted(e.target.checked);
                        if (!e.target.checked) {
                          setIsSharedEncryption(false);
                        }
                      }}
                    />
                    Encrypt content
                  </label>
                </div>
                
                {isEncrypted && (
                  <div className="encryption-suboptions">
                    <label className="encryption-label">
                      <input
                        type="checkbox"
                        checked={isSharedEncryption}
                        onChange={(e) => setIsSharedEncryption(e.target.checked)}
                      />
                      Share with another address
                    </label>
                    
                    {isSharedEncryption && (
                      <div className="sharing-address-input">
                        <input
                          type="text"
                          value={sharingAddress}
                          onChange={(e) => setSharingAddress(e.target.value)}
                          placeholder="Enter Ethereum address to share with (0x...)"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="advanced-options-toggle">
                <button 
                  className="toggle-button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </button>
              </div>
              
              {showAdvancedOptions && (
                <div className="advanced-options">
                  <h4>Pinning Services</h4>
                  <div className="pinning-services">
                    <label className="service-option">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                      />
                      Infura (Default)
                    </label>
                    <label className="service-option">
                      <input
                        type="checkbox"
                        checked={selectedPinningServices.includes('pinata')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPinningServices([...selectedPinningServices, 'pinata']);
                          } else {
                            setSelectedPinningServices(selectedPinningServices.filter(s => s !== 'pinata'));
                          }
                        }}
                      />
                      Pinata
                    </label>
                    <label className="service-option">
                      <input
                        type="checkbox"
                        checked={selectedPinningServices.includes('web3storage')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPinningServices([...selectedPinningServices, 'web3storage']);
                          } else {
                            setSelectedPinningServices(selectedPinningServices.filter(s => s !== 'web3storage'));
                          }
                        }}
                      />
                      Web3.Storage
                    </label>
                    <label className="service-option">
                      <input
                        type="checkbox"
                        checked={selectedPinningServices.includes('local')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPinningServices([...selectedPinningServices, 'local']);
                          } else {
                            setSelectedPinningServices(selectedPinningServices.filter(s => s !== 'local'));
                          }
                        }}
                      />
                      Local Node
                    </label>
                  </div>
                </div>
              )}
              
              <div className="button-group">
                <button
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={isUploading || !content}
                >
                  {isUploading ? 'Uploading...' : 'Upload to IPFS'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={handlePin}
                  disabled={isPinning || !cid}
                >
                  {isPinning ? 'Pinning...' : 'Pin Content'}
                </button>
                {showAdvancedOptions && (
                  <button
                    className="btn-secondary"
                    onClick={() => handlePinToMultipleServices(cid)}
                    disabled={isPinning || !cid}
                  >
                    Pin to Multiple Services
                  </button>
                )}
              </div>
              
              {cid && (
                <div className="cid-display">
                  <h4>Content CID:</h4>
                  <div className="cid-value">{cid}</div>
                  {getIpfsLinks(cid)}
                </div>
              )}
              
              {pinningResults.length > 0 && (
                <div className="pinning-results">
                  <h4>Pinning Results:</h4>
                  <ul className="results-list">
                    {pinningResults.map((result, index) => (
                      <li key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
                        <span className="service-name">{result.service}:</span>
                        <span className="result-status">
                          {result.success ? 'Pinned Successfully' : `Failed: ${result.error || 'Unknown error'}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="retrieve-section">
              <h3>Retrieve Content</h3>
              <div className="retrieve-form">
                <div className="cid-input-group">
                  <input
                    type="text"
                    className="cid-input"
                    value={retrievedCid}
                    onChange={(e) => setRetrievedCid(e.target.value)}
                    placeholder="Enter CID to retrieve"
                  />
                  <button
                    className="btn-primary"
                    onClick={handleRetrieve}
                    disabled={isRetrieving || !retrievedCid}
                  >
                    {isRetrieving ? 'Retrieving...' : 'Retrieve'}
                  </button>
                </div>
                
                <div className="decrypt-actions">
                  <button
                    className="btn-secondary"
                    onClick={retrieveMetadataForContent}
                    disabled={isRetrieving || !retrievedCid}
                  >
                    Find Metadata
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={handleCheckPinStatus}
                    disabled={isPinning || !retrievedCid}
                  >
                    Check Pin Status
                  </button>
                </div>
              </div>
              
              {encryptionMetadata && decryptionStage === 'content' && (
                <div className="encryption-metadata">
                  <h4>Encryption Metadata Found</h4>
                  <div className="metadata-details">
                    <div className="metadata-item">
                      <span className="item-label">Type:</span>
                      <span className="item-value">
                        {encryptionMetadata.keyType === 'shared' ? 'Shared Encryption' : 'Personal Encryption'}
                      </span>
                    </div>
                    {encryptionMetadata.keyType === 'shared' && (
                      <div className="metadata-item">
                        <span className="item-label">Shared With:</span>
                        <span className="item-value address">{encryptionMetadata.sharedWith}</span>
                      </div>
                    )}
                    <div className="metadata-item">
                      <span className="item-label">Created:</span>
                      <span className="item-value">
                        {new Date(encryptionMetadata.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="item-label">Creator:</span>
                      <span className="item-value address">{encryptionMetadata.creator}</span>
                    </div>
                  </div>
                  <div className="metadata-instructions">
                    <p>Enter the CID of the encrypted content to decrypt it</p>
                  </div>
                </div>
              )}
              
              {retrievedContent && (
                <div className="retrieved-content">
                  <h4>Retrieved Content:</h4>
                  <div className="content-display">{retrievedContent}</div>
                  {getIpfsLinks(retrievedCid)}
                </div>
              )}
            </div>
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

export default IPFSStoragePanel;
