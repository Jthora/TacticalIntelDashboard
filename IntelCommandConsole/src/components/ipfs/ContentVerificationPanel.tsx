// src/components/ipfs/ContentVerificationPanel.tsx
import React, { useState } from 'react';
import { useIPFS } from '../../contexts/IPFSContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { createVerifiedContent, verifyContent, ContentMetadata } from '../../utils/contentVerificationUtils';
import '../../assets/styles/components/content-verification-panel.css';

/**
 * ContentVerificationPanel component
 * Allows users to create and verify cryptographically signed content stored on IPFS
 */
const ContentVerificationPanel: React.FC = () => {
  const { isConnected: isWeb3Connected, walletAddress, provider } = useWeb3();
  const { isConnected: isIPFSConnected, ipfs } = useIPFS();
  
  const [content, setContent] = useState<string>('');
  const [verificationCid, setVerificationCid] = useState<string>('');
  const [verificationMetadata, setVerificationMetadata] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [contentMetadata, setContentMetadata] = useState<ContentMetadata | null>(null);
  const [verifiedContent, setVerifiedContent] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Create verified content
  const handleCreateVerifiedContent = async () => {
    if (!content) {
      setStatus('Please enter content to verify');
      return;
    }

    if (!isWeb3Connected || !provider || !isIPFSConnected || !ipfs) {
      setStatus('Please ensure Web3 and IPFS are connected');
      return;
    }

    setIsCreating(true);
    setStatus('Creating verified content...');

    try {
      const metadata = await createVerifiedContent(content, walletAddress, provider, ipfs);
      setContentMetadata(metadata);
      setStatus('Content verified and stored on IPFS successfully');
    } catch (error) {
      console.error('Error creating verified content:', error);
      setStatus('Failed to create verified content. Check console for details.');
    } finally {
      setIsCreating(false);
    }
  };

  // Verify content
  const handleVerifyContent = async () => {
    if (!verificationCid || !verificationMetadata) {
      setStatus('Please enter CID and metadata to verify');
      return;
    }

    if (!isIPFSConnected || !ipfs) {
      setStatus('Please ensure IPFS is connected');
      return;
    }

    setIsVerifying(true);
    setStatus('Verifying content...');

    try {
      let metadata: ContentMetadata;
      
      try {
        metadata = JSON.parse(verificationMetadata);
      } catch (e) {
        throw new Error('Invalid metadata format. Please provide valid JSON.');
      }

      const verified = await verifyContent(verificationCid, metadata, ipfs);
      setVerifiedContent(verified);
      
      if (verified.verified) {
        setStatus('Content verified successfully! Signature is valid.');
      } else {
        setStatus('Content verification failed! Signature or content does not match.');
      }
    } catch (error) {
      console.error('Error verifying content:', error);
      setStatus(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setVerifiedContent(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="content-verification-panel">
      <h2>Content Verification</h2>
      
      {!isWeb3Connected || !isIPFSConnected ? (
        <div className="verification-prerequisites">
          <p>Please ensure both Web3 wallet and IPFS are connected to use content verification features.</p>
        </div>
      ) : (
        <div className="verification-functional">
          <div className="verification-operations">
            <div className="create-verified-section">
              <h3>Create Verified Content</h3>
              <textarea
                className="content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content to verify and store on IPFS..."
                rows={5}
              />
              <button
                className="btn-primary"
                onClick={handleCreateVerifiedContent}
                disabled={isCreating || !content}
              >
                {isCreating ? 'Creating...' : 'Create Verified Content'}
              </button>
              
              {contentMetadata && (
                <div className="metadata-display">
                  <h4>Content Metadata:</h4>
                  <div className="metadata-value">
                    <pre>{JSON.stringify(contentMetadata, null, 2)}</pre>
                  </div>
                  <div className="metadata-instructions">
                    <p>Share this metadata along with the CID to allow others to verify this content.</p>
                    <button
                      className="copy-metadata-button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(contentMetadata));
                        alert('Metadata copied to clipboard');
                      }}
                    >
                      Copy Metadata
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="verify-content-section">
              <h3>Verify Content</h3>
              <input
                type="text"
                className="cid-input"
                value={verificationCid}
                onChange={(e) => setVerificationCid(e.target.value)}
                placeholder="Enter CID of content to verify"
              />
              <textarea
                className="metadata-input"
                value={verificationMetadata}
                onChange={(e) => setVerificationMetadata(e.target.value)}
                placeholder="Enter content metadata JSON..."
                rows={5}
              />
              <button
                className="btn-primary"
                onClick={handleVerifyContent}
                disabled={isVerifying || !verificationCid || !verificationMetadata}
              >
                {isVerifying ? 'Verifying...' : 'Verify Content'}
              </button>
              
              {verifiedContent && (
                <div className={`verification-result ${verifiedContent.verified ? 'verified' : 'failed'}`}>
                  <h4>Verification Result: {verifiedContent.verified ? 'VERIFIED ✓' : 'FAILED ✗'}</h4>
                  
                  <div className="verification-details">
                    <div className="detail-item">
                      <span className="detail-label">Content:</span>
                      <span className="detail-value">{verifiedContent.content}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Author:</span>
                      <span className="detail-value">{verifiedContent.author}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Timestamp:</span>
                      <span className="detail-value">{verifiedContent.timestamp}</span>
                    </div>
                  </div>
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

export default ContentVerificationPanel;
