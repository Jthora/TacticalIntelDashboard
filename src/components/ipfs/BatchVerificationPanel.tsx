// src/components/ipfs/BatchVerificationPanel.tsx
import React, { useState, useRef } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useIPFS } from '../../contexts/IPFSContext';
import {
  ContentWithMetadata,
  BatchVerificationResult,
  generateAndAnchorBatch,
  verifyBatch
} from '../../utils/contentVerificationBatch';
import '../../assets/styles/components/batch-verification-panel.css';

/**
 * BatchVerificationPanel component
 * Allows users to verify multiple content items at once using Merkle trees and blockchain anchoring
 */
const BatchVerificationPanel: React.FC = () => {
  const { isConnected: isWeb3Connected, provider } = useWeb3();
  const { isConnected: isIPFSConnected } = useIPFS();
  
  const [contentItems, setContentItems] = useState<ContentWithMetadata[]>([]);
  const [verificationResult, setVerificationResult] = useState<BatchVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [merkleRoot, setMerkleRoot] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [showVerificationForm, setShowVerificationForm] = useState<boolean>(false);
  const [showBatchMaker, setShowBatchMaker] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add a new content item to the batch
  const addContentItem = () => {
    const newItem: ContentWithMetadata = {
      id: `item-${contentItems.length + 1}`,
      content: '',
      title: `Item ${contentItems.length + 1}`,
      source: ''
    };
    
    setContentItems([...contentItems, newItem]);
  };
  
  // Remove a content item from the batch
  const removeContentItem = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  };
  
  // Update a content item
  const updateContentItem = (id: string, field: keyof ContentWithMetadata, value: string) => {
    setContentItems(contentItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  // Handle batch verification
  const verifyContentBatch = async () => {
    if (!provider) {
      setStatus('Web3 provider not connected');
      return;
    }
    
    if (contentItems.length === 0) {
      setStatus('Please add at least one content item');
      return;
    }
    
    // Check if all items have content
    const emptyItems = contentItems.filter(item => !item.content.trim());
    if (emptyItems.length > 0) {
      setStatus(`Please fill in content for all items (${emptyItems.length} empty)`);
      return;
    }
    
    setIsVerifying(true);
    setStatus('Generating hashes and anchoring to blockchain...');
    
    try {
      const result = await generateAndAnchorBatch(contentItems, provider);
      
      setVerificationResult(result);
      setMerkleRoot(result.merkleRoot || '');
      setTransactionHash(result.anchorTransactionHash || '');
      setStatus(`Verification complete. ${result.verifiedItems}/${result.totalItems} items verified.`);
      
      // Hide the batch maker and show the results
      setShowBatchMaker(false);
    } catch (error) {
      console.error('Error verifying content batch:', error);
      setStatus(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle existing batch verification
  const verifyExistingBatch = async () => {
    if (!provider || !merkleRoot || !transactionHash) {
      setStatus('Please provide Merkle root and transaction hash');
      return;
    }
    
    if (contentItems.length === 0) {
      setStatus('Please add at least one content item to verify');
      return;
    }
    
    setIsVerifying(true);
    setStatus('Verifying content against blockchain anchor...');
    
    try {
      const result = await verifyBatch(
        contentItems.map(item => ({ content: item.content, hash: '' })),
        merkleRoot,
        transactionHash,
        provider
      );
      
      setVerificationResult(result);
      setStatus(`Verification complete. ${result.verifiedItems}/${result.totalItems} items verified.`);
      
      // Hide the verification form and show the results
      setShowVerificationForm(false);
    } catch (error) {
      console.error('Error verifying existing batch:', error);
      setStatus(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle file upload for batch content
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedContent = JSON.parse(content);
        
        if (Array.isArray(parsedContent)) {
          // Convert to ContentWithMetadata format
          const items: ContentWithMetadata[] = parsedContent.map((item, index) => ({
            id: `item-${index + 1}`,
            content: typeof item === 'string' ? item : JSON.stringify(item),
            title: typeof item === 'object' && item.title ? item.title : `Item ${index + 1}`,
            source: typeof item === 'object' && item.source ? item.source : ''
          }));
          
          setContentItems(items);
          setStatus(`Loaded ${items.length} items from file`);
        } else {
          setStatus('Invalid file format. Expected JSON array.');
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        setStatus('Error parsing file. Make sure it contains valid JSON.');
      }
    };
    
    reader.readAsText(file);
  };
  
  // Reset the verification process
  const resetVerification = () => {
    setVerificationResult(null);
    setShowBatchMaker(true);
    setShowVerificationForm(false);
  };
  
  // Toggle between creating a new batch and verifying an existing one
  const toggleVerificationMode = () => {
    setShowVerificationForm(!showVerificationForm);
    setShowBatchMaker(!showBatchMaker);
    setVerificationResult(null);
  };
  
  // Format timestamp to readable date
  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  if (!isWeb3Connected) {
    return (
      <div className="batch-verification-panel">
        <h2>Batch Content Verification</h2>
        <div className="verification-notice">
          <p>Please connect your Web3 wallet to use batch verification features</p>
        </div>
      </div>
    );
  }
  
  if (!isIPFSConnected) {
    return (
      <div className="batch-verification-panel">
        <h2>Batch Content Verification</h2>
        <div className="verification-notice">
          <p>IPFS connection required for content verification</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="batch-verification-panel">
      <h2>Batch Content Verification</h2>
      
      <div className="verification-mode-toggle">
        <button 
          className={`mode-button ${!showVerificationForm ? 'active' : ''}`}
          onClick={() => toggleVerificationMode()}
        >
          Create New Batch
        </button>
        <button 
          className={`mode-button ${showVerificationForm ? 'active' : ''}`}
          onClick={() => toggleVerificationMode()}
        >
          Verify Existing Batch
        </button>
      </div>
      
      {/* Batch Creation UI */}
      {showBatchMaker && !verificationResult && (
        <div className="batch-maker">
          <div className="batch-header">
            <h3>Create Content Batch</h3>
            <div className="batch-actions">
              <button 
                className="add-item-button"
                onClick={addContentItem}
              >
                Add Item
              </button>
              <button 
                className="upload-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload JSON
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".json"
              />
            </div>
          </div>
          
          {contentItems.length > 0 ? (
            <div className="content-items">
              {contentItems.map(item => (
                <div key={item.id} className="content-item">
                  <div className="item-header">
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateContentItem(item.id, 'title', e.target.value)}
                      placeholder="Item Title"
                      className="item-title-input"
                    />
                    <button
                      className="remove-item-button"
                      onClick={() => removeContentItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={item.content}
                    onChange={(e) => updateContentItem(item.id, 'content', e.target.value)}
                    placeholder="Enter content to verify"
                    className="item-content-input"
                    rows={4}
                  />
                  <input
                    type="text"
                    value={item.source || ''}
                    onChange={(e) => updateContentItem(item.id, 'source', e.target.value)}
                    placeholder="Source (optional)"
                    className="item-source-input"
                  />
                </div>
              ))}
              
              <div className="batch-footer">
                <button
                  className="verify-button"
                  onClick={verifyContentBatch}
                  disabled={isVerifying || contentItems.length === 0}
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Anchor Batch'}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-batch">
              <p>No content items added yet. Add items or upload a JSON file.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Verify Existing Batch UI */}
      {showVerificationForm && !verificationResult && (
        <div className="verification-form">
          <h3>Verify Existing Batch</h3>
          <div className="form-group">
            <label htmlFor="merkleRoot">Merkle Root:</label>
            <input
              id="merkleRoot"
              type="text"
              value={merkleRoot}
              onChange={(e) => setMerkleRoot(e.target.value)}
              placeholder="0x..."
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="txHash">Transaction Hash:</label>
            <input
              id="txHash"
              type="text"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="0x..."
              className="form-control"
            />
          </div>
          
          <div className="batch-header">
            <h4>Content Items to Verify</h4>
            <button 
              className="add-item-button"
              onClick={addContentItem}
            >
              Add Item
            </button>
          </div>
          
          {contentItems.length > 0 ? (
            <div className="content-items">
              {contentItems.map(item => (
                <div key={item.id} className="content-item">
                  <div className="item-header">
                    <span className="item-number">{item.title || `Item ${item.id}`}</span>
                    <button
                      className="remove-item-button"
                      onClick={() => removeContentItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={item.content}
                    onChange={(e) => updateContentItem(item.id, 'content', e.target.value)}
                    placeholder="Enter content to verify"
                    className="item-content-input"
                    rows={4}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-batch">
              <p>Add content items to verify against the Merkle root.</p>
            </div>
          )}
          
          <div className="form-actions">
            <button
              className="verify-button"
              onClick={verifyExistingBatch}
              disabled={isVerifying || !merkleRoot || !transactionHash || contentItems.length === 0}
            >
              {isVerifying ? 'Verifying...' : 'Verify Batch'}
            </button>
          </div>
        </div>
      )}
      
      {/* Verification Results UI */}
      {verificationResult && (
        <div className="verification-results">
          <h3>Verification Results</h3>
          
          <div className="result-summary">
            <div className="summary-item">
              <span className="summary-label">Status:</span>
              <span className={`summary-value ${verificationResult.verifiedItems === verificationResult.totalItems ? 'verified' : 'failed'}`}>
                {verificationResult.verifiedItems === verificationResult.totalItems ? 'Verified' : 'Verification Failed'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Items Verified:</span>
              <span className="summary-value">{verificationResult.verifiedItems}/{verificationResult.totalItems}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Timestamp:</span>
              <span className="summary-value">{formatTimestamp(verificationResult.timestamp)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Merkle Root:</span>
              <span className="summary-value hash">{verificationResult.merkleRoot}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Transaction:</span>
              <a 
                href={`https://etherscan.io/tx/${verificationResult.anchorTransactionHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="summary-value link"
              >
                {verificationResult.anchorTransactionHash}
              </a>
            </div>
          </div>
          
          <h4>Verified Items</h4>
          <div className="verified-items">
            {verificationResult.items.map((item, index) => (
              <div key={index} className={`verified-item ${item.verified ? 'verified' : 'failed'}`}>
                <div className="item-header">
                  <span className="item-status">
                    {item.verified ? '✓ Verified' : '✗ Not Verified'}
                  </span>
                </div>
                <div className="item-content">
                  {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                </div>
                <div className="item-details">
                  <span className="item-detail">
                    <span className="detail-label">Hash:</span>
                    <span className="detail-value">{item.hash.substring(0, 10)}...</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="result-actions">
            <button
              className="reset-button"
              onClick={resetVerification}
            >
              Verify New Batch
            </button>
          </div>
        </div>
      )}
      
      {status && (
        <div className="verification-status">
          {status}
        </div>
      )}
    </div>
  );
};

export default BatchVerificationPanel;
