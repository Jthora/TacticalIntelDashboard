import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { 
  submitIntelligence, 
  voteOnIntelligence, 
  getIntelligenceItems,
  submitAnonymousIntelligence,
  IntelligenceItem,
  IntelAssessment
} from '../../web3/intelligence/intelligenceAnalysis';
import '../../styles/intelligence/IntelligenceAnalysis.css';

/**
 * Main page for intelligence analysis features
 */
const IntelligenceAnalysisPage: React.FC = () => {
  const { provider, isConnected: connected } = useWeb3();
  const [intelligenceItems, setIntelligenceItems] = useState<IntelligenceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  
  // Form states
  const [newIntelContent, setNewIntelContent] = useState('');
  const [newIntelCategory, setNewIntelCategory] = useState('general');
  const [newIntelSensitivity, setNewIntelSensitivity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [anonymousSubmission, setAnonymousSubmission] = useState(false);
  
  // Vote states
  const [selectedIntelId, setSelectedIntelId] = useState('');
  const [voteConfidence, setVoteConfidence] = useState(50);
  const [voteAssessment, setVoteAssessment] = useState<IntelAssessment>(IntelAssessment.UNCERTAIN);
  const [voteEvidence, setVoteEvidence] = useState('');
  
  useEffect(() => {
    if (connected && provider) {
      loadIntelligenceItems();
    }
  }, [connected, provider]);
  
  const loadIntelligenceItems = async () => {
    if (!provider) return;
    
    setLoading(true);
    try {
      const items = await getIntelligenceItems(provider);
      setIntelligenceItems(items);
    } catch (error) {
      console.error('Error loading intelligence items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleIntelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    
    setLoading(true);
    try {
      if (anonymousSubmission) {
        // For development, we're using a placeholder IPFS client
        // In production, this would use a real IPFS client
        const mockIpfsClient = {} as any;
        await submitAnonymousIntelligence(
          newIntelContent,
          newIntelCategory,
          newIntelSensitivity,
          mockIpfsClient
        );
      } else {
        await submitIntelligence(
          newIntelContent,
          newIntelCategory,
          newIntelSensitivity,
          provider
        );
      }
      
      // Reset form
      setNewIntelContent('');
      setNewIntelCategory('general');
      setNewIntelSensitivity('medium');
      setAnonymousSubmission(false);
      
      // Reload intelligence items
      await loadIntelligenceItems();
    } catch (error) {
      console.error('Error submitting intelligence:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !selectedIntelId) return;
    
    setLoading(true);
    try {
      await voteOnIntelligence(
        selectedIntelId,
        voteConfidence,
        voteAssessment,
        voteEvidence,
        provider
      );
      
      // Reset form
      setSelectedIntelId('');
      setVoteConfidence(50);
      setVoteAssessment(IntelAssessment.UNCERTAIN);
      setVoteEvidence('');
      
      // Reload intelligence items
      await loadIntelligenceItems();
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="intelligence-analysis-container">
      <h1 className="intel-title">Intelligence Analysis Center</h1>
      
      <div className="intel-tabs">
        <button
          className={`intel-tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Intelligence
        </button>
        <button
          className={`intel-tab ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Intelligence
        </button>
        <button
          className={`intel-tab ${activeTab === 'vote' ? 'active' : ''}`}
          onClick={() => setActiveTab('vote')}
        >
          Validate Intelligence
        </button>
      </div>
      
      <div className="intel-content">
        {!connected && (
          <div className="intel-not-connected">
            <p>Please connect your wallet to access intelligence analysis features.</p>
          </div>
        )}
        
        {connected && activeTab === 'browse' && (
          <div className="intel-browse">
            <h2>Available Intelligence</h2>
            {loading ? (
              <p>Loading intelligence items...</p>
            ) : intelligenceItems.length === 0 ? (
              <p>No intelligence items available.</p>
            ) : (
              <div className="intel-items">
                {intelligenceItems.map((item) => (
                  <div key={item.id} className="intel-item">
                    <div className="intel-item-header">
                      <h3>{item.category} Intelligence</h3>
                      <span className={`intel-sensitivity ${item.sensitivity}`}>
                        {item.sensitivity}
                      </span>
                    </div>
                    <div className="intel-item-content">
                      <p>{item.content || 'Encrypted content'}</p>
                    </div>
                    <div className="intel-item-footer">
                      <div className="intel-confidence">
                        <span>Confidence: </span>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-level" 
                            style={{ width: `${item.confidenceScore}%` }}
                          />
                        </div>
                        <span>{item.confidenceScore}%</span>
                      </div>
                      <div className="intel-votes">
                        <span>{item.voteCount} assessments</span>
                      </div>
                      <div className="intel-timestamp">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {connected && activeTab === 'submit' && (
          <div className="intel-submit">
            <h2>Submit New Intelligence</h2>
            <form onSubmit={handleIntelSubmit} className="intel-form">
              <div className="form-group">
                <label htmlFor="intelContent">Intelligence Content</label>
                <textarea
                  id="intelContent"
                  value={newIntelContent}
                  onChange={(e) => setNewIntelContent(e.target.value)}
                  placeholder="Enter detailed intelligence information..."
                  required
                  rows={5}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="intelCategory">Category</label>
                <select
                  id="intelCategory"
                  value={newIntelCategory}
                  onChange={(e) => setNewIntelCategory(e.target.value)}
                  required
                >
                  <option value="general">General</option>
                  <option value="tactical">Tactical</option>
                  <option value="strategic">Strategic</option>
                  <option value="technical">Technical</option>
                  <option value="HUMINT">Human Intelligence</option>
                  <option value="SIGINT">Signal Intelligence</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="intelSensitivity">Sensitivity</label>
                <select
                  id="intelSensitivity"
                  value={newIntelSensitivity}
                  onChange={(e) => setNewIntelSensitivity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="anonymousSubmission"
                  checked={anonymousSubmission}
                  onChange={(e) => setAnonymousSubmission(e.target.checked)}
                />
                <label htmlFor="anonymousSubmission">Submit Anonymously</label>
              </div>
              
              <button type="submit" className="intel-submit-button" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Intelligence'}
              </button>
            </form>
          </div>
        )}
        
        {connected && activeTab === 'vote' && (
          <div className="intel-vote">
            <h2>Validate Intelligence</h2>
            <form onSubmit={handleVoteSubmit} className="intel-form">
              <div className="form-group">
                <label htmlFor="intelId">Select Intelligence Item</label>
                <select
                  id="intelId"
                  value={selectedIntelId}
                  onChange={(e) => setSelectedIntelId(e.target.value)}
                  required
                >
                  <option value="">-- Select Intelligence Item --</option>
                  {intelligenceItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.category} - {new Date(item.timestamp).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="voteAssessment">Your Assessment</label>
                <select
                  id="voteAssessment"
                  value={voteAssessment}
                  onChange={(e) => setVoteAssessment(Number(e.target.value) as IntelAssessment)}
                  required
                >
                  <option value={IntelAssessment.UNCERTAIN}>Uncertain</option>
                  <option value={IntelAssessment.ACCURATE}>Accurate</option>
                  <option value={IntelAssessment.INACCURATE}>Inaccurate</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="voteConfidence">Confidence Level: {voteConfidence}%</label>
                <input
                  type="range"
                  id="voteConfidence"
                  min="0"
                  max="100"
                  step="5"
                  value={voteConfidence}
                  onChange={(e) => setVoteConfidence(Number(e.target.value))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="voteEvidence">Supporting Evidence (Optional)</label>
                <textarea
                  id="voteEvidence"
                  value={voteEvidence}
                  onChange={(e) => setVoteEvidence(e.target.value)}
                  placeholder="Provide any evidence to support your assessment..."
                  rows={3}
                />
              </div>
              
              <button type="submit" className="intel-vote-button" disabled={loading || !selectedIntelId}>
                {loading ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceAnalysisPage;
