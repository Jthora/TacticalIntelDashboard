// src/components/intelligence/CrossPlatformIntelPanel.tsx

import '../../assets/styles/components/cross-platform-intel-panel.css';

import React, {useState } from 'react';

import { useIPFS } from '../../contexts/IPFSContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { TIDIntelligenceFormat,useIntelligenceBridge } from '../../services/IntelligenceBridge';

interface CrossPlatformIntelPanelProps {
  onIntelligencePublished?: (metadataHash: string) => void;
}

const CrossPlatformIntelPanel: React.FC<CrossPlatformIntelPanelProps> = ({
  onIntelligencePublished
}) => {
  const { isConnected: isWeb3Connected, walletAddress } = useWeb3();
  const { isConnected: isIPFSConnected } = useIPFS();
  const bridge = useIntelligenceBridge();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [confidence, setConfidence] = useState(75);
  const [encrypt, setEncrypt] = useState(false);
  const [accessLevel, setAccessLevel] = useState(0);

  // Status state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');
  const [lastPublishedHash, setLastPublishedHash] = useState('');

  // Retrieved intelligence state
  const [retrievalHash, setRetrievalHash] = useState('');
  const [retrievalFormat, setRetrievalFormat] = useState<'tid' | 'ime'>('tid');
  const [retrievedIntel, setRetrievedIntel] = useState<any>(null);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [retrievalStatus, setRetrievalStatus] = useState('');

  const isReady = bridge.isReady;

  const handlePublish = async () => {
    if (!isReady) {
      setPublishStatus('Please connect wallet and IPFS first');
      return;
    }

    if (!title || !content) {
      setPublishStatus('Please fill in title and content');
      return;
    }

    setIsPublishing(true);
    setPublishStatus('Publishing intelligence to IPFS...');

    try {
      // Create TID format intelligence
      const tidIntel: TIDIntelligenceFormat = {
        id: `intel-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title,
        content,
        source: {
          name: sourceName || 'Manual Entry',
          url: sourceUrl || '',
          category
        },
        metadata: {
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          priority,
          confidence: confidence / 100
        }
      };

      // Publish to IPFS with both formats
      const metadataHash = await bridge.publishIntelligence(tidIntel, {
        encrypt,
        accessLevel,
        pinToMultipleServices: true
      });

      setLastPublishedHash(metadataHash);
      setPublishStatus(`✅ Published successfully! Hash: ${metadataHash}`);
      
      if (onIntelligencePublished) {
        onIntelligencePublished(metadataHash);
      }

      // Clear form
      setTitle('');
      setContent('');
      setSourceName('');
      setSourceUrl('');
      setTags('');
    } catch (error) {
      console.error('Publishing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setPublishStatus(`❌ Failed to publish: ${errorMessage}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRetrieve = async () => {
    if (!isReady || !retrievalHash) {
      setRetrievalStatus('Please connect services and enter a hash');
      return;
    }

    setIsRetrieving(true);
    setRetrievalStatus(`Retrieving intelligence in ${retrievalFormat.toUpperCase()} format...`);

    try {
      const intel = await bridge.getIntelligence(retrievalHash, retrievalFormat);
      setRetrievedIntel(intel);
      setRetrievalStatus(`✅ Retrieved successfully in ${retrievalFormat.toUpperCase()} format`);
    } catch (error) {
      console.error('Retrieval failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setRetrievalStatus(`❌ Failed to retrieve: ${errorMessage}`);
      setRetrievedIntel(null);
    } finally {
      setIsRetrieving(false);
    }
  };

  return (
    <div className="cross-platform-intel-panel">
      <div className="panel-header">
        <h2>🌐 Cross-Platform Intelligence Bridge</h2>
        <p>Publish intelligence accessible from both Tactical Intel Dashboard and Intelligence Market Exchange</p>
        
        <div className="connection-status">
          <div className={`status-item ${isWeb3Connected ? 'connected' : 'disconnected'}`}>
            {isWeb3Connected ? '🟢' : '🔴'} Web3: {isWeb3Connected ? walletAddress.slice(0, 8) + '...' : 'Disconnected'}
          </div>
          <div className={`status-item ${isIPFSConnected ? 'connected' : 'disconnected'}`}>
            {isIPFSConnected ? '🟢' : '🔴'} IPFS: {isIPFSConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className={`status-item ${isReady ? 'connected' : 'disconnected'}`}>
            {isReady ? '🟢' : '🔴'} Bridge: {isReady ? 'Ready' : 'Not Ready'}
          </div>
        </div>
      </div>

      <div className="panel-content">
        {/* Publishing Section */}
        <section className="publish-section">
          <h3>📤 Publish Intelligence</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Intelligence report title"
              />
            </div>

            <div className="form-group">
              <label>Source Name</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Source name (optional)"
              />
            </div>

            <div className="form-group">
              <label>Source URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="general">General</option>
                <option value="security">Security</option>
                <option value="economic">Economic</option>
                <option value="technical">Technical</option>
                <option value="geopolitical">Geopolitical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Confidence (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
              />
              <span>{confidence}%</span>
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Intelligence content..."
              rows={6}
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
              />
              Encrypt content
            </label>

            {encrypt && (
              <div className="form-group">
                <label>Access Level</label>
                <select value={accessLevel} onChange={(e) => setAccessLevel(parseInt(e.target.value))}>
                  <option value={0}>Public</option>
                  <option value={1}>Field Operative</option>
                  <option value={2}>Analyst</option>
                  <option value={3}>Commander</option>
                  <option value={4}>Director</option>
                </select>
              </div>
            )}
          </div>

          <button
            className="publish-btn"
            onClick={handlePublish}
            disabled={!isReady || isPublishing || !title || !content}
          >
            {isPublishing ? 'Publishing...' : '📤 Publish Intelligence'}
          </button>

          {publishStatus && (
            <div className={`status-message ${publishStatus.includes('❌') ? 'error' : 'success'}`}>
              {publishStatus}
            </div>
          )}

          {lastPublishedHash && (
            <div className="published-hash">
              <strong>Published Hash:</strong>
              <code>{lastPublishedHash}</code>
              <button onClick={() => navigator.clipboard.writeText(lastPublishedHash)}>
                📋 Copy
              </button>
            </div>
          )}
        </section>

        {/* Retrieval Section */}
        <section className="retrieve-section">
          <h3>📥 Retrieve Intelligence</h3>
          
          <div className="form-group">
            <label>IPFS Hash</label>
            <input
              type="text"
              value={retrievalHash}
              onChange={(e) => setRetrievalHash(e.target.value)}
              placeholder="Qm... or baf..."
            />
          </div>

          <div className="form-group">
            <label>Format</label>
            <select value={retrievalFormat} onChange={(e) => setRetrievalFormat(e.target.value as 'tid' | 'ime')}>
              <option value="tid">TID Format</option>
              <option value="ime">IME Format</option>
            </select>
          </div>

          <button
            className="retrieve-btn"
            onClick={handleRetrieve}
            disabled={!isReady || isRetrieving || !retrievalHash}
          >
            {isRetrieving ? 'Retrieving...' : '📥 Retrieve Intelligence'}
          </button>

          {retrievalStatus && (
            <div className={`status-message ${retrievalStatus.includes('❌') ? 'error' : 'success'}`}>
              {retrievalStatus}
            </div>
          )}

          {retrievedIntel && (
            <div className="retrieved-intel">
              <h4>Retrieved Intelligence ({retrievalFormat.toUpperCase()} Format)</h4>
              <pre>{JSON.stringify(retrievedIntel, null, 2)}</pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CrossPlatformIntelPanel;
