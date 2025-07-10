import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { 
  deployMissionContract,
  getMissions,
  submitEvidence,
  completeIfCriteriaMet,
  claimResources,
  MissionData,
  EvidenceData,
  MissionStatus,
  EvidenceType
} from '../../web3/missions/missionOperations';
import '../../styles/missions/MissionOperations.css';

/**
 * Main page for mission operations
 */
const MissionOperationsPage: React.FC = () => {
  const { provider, isConnected: connected, walletAddress: account } = useWeb3();
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [missionEvidence, setMissionEvidence] = useState<EvidenceData[]>([]);
  
  // Form states for creating a mission
  const [missionName, setMissionName] = useState('');
  const [missionObjective, setMissionObjective] = useState('');
  const [missionCriteria, setMissionCriteria] = useState('');
  const [missionDeadline, setMissionDeadline] = useState('');
  const [missionParticipants, setMissionParticipants] = useState('');
  
  // Form states for submitting evidence
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>(EvidenceType.DOCUMENT);
  const [evidenceMetadata, setEvidenceMetadata] = useState('');
  
  useEffect(() => {
    if (connected && provider) {
      loadMissions();
    }
  }, [connected, provider]);
  
  const loadMissions = async () => {
    if (!provider) return;
    
    setLoading(true);
    try {
      const missionData = await getMissions(provider);
      setMissions(missionData);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMissionEvidence = async (missionAddress: string) => {
    if (!provider) return;
    
    setLoading(true);
    try {
      // In a real implementation, this would fetch evidence from the mission contract
      // For now, we'll use mock data
      setMissionEvidence([
        {
          submitter: '0x1234567890123456789012345678901234567890',
          evidenceHash: 'QmXYZ123456789',
          evidenceType: EvidenceType.DOCUMENT,
          metadata: JSON.stringify({ filename: 'mission_report.pdf', description: 'Detailed mission report' }),
          timestamp: Date.now() - 360000
        },
        {
          submitter: '0x0987654321098765432109876543210987654321',
          evidenceHash: 'QmABC987654321',
          evidenceType: EvidenceType.PHOTO,
          metadata: JSON.stringify({ filename: 'site_photo.jpg', location: '37.7749° N, 122.4194° W' }),
          timestamp: Date.now() - 720000
        }
      ]);
    } catch (error) {
      console.error('Error loading mission evidence:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMissionCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    
    setLoading(true);
    try {
      // Parse participants
      const participants = missionParticipants
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);
      
      // Parse deadline
      const deadlineDate = new Date(missionDeadline);
      
      // Create mission parameters
      const parameters = {
        name: missionName,
        objective: missionObjective,
        successCriteria: missionCriteria,
        deadline: Math.floor(deadlineDate.getTime() / 1000)
      };
      
      // Deploy mission contract
      await deployMissionContract(
        parameters,
        participants,
        {
          recipients: participants,
          amounts: participants.map(() => '1000000000000000000') // 1 ETH equivalent
        },
        provider
      );
      
      // Reset form
      setMissionName('');
      setMissionObjective('');
      setMissionCriteria('');
      setMissionDeadline('');
      setMissionParticipants('');
      
      // Reload missions
      await loadMissions();
      
      // Switch to browse tab
      setActiveTab('browse');
    } catch (error) {
      console.error('Error creating mission:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !selectedMission || !evidenceFile) return;
    
    setLoading(true);
    try {
      // In a real implementation, this would upload the file to IPFS
      // and get back an IPFS hash
      const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
      
      // Submit evidence to the mission contract
      await submitEvidence(
        selectedMission,
        mockIpfsHash,
        evidenceType,
        evidenceMetadata,
        provider
      );
      
      // Reset form
      setEvidenceFile(null);
      setEvidenceType(EvidenceType.DOCUMENT);
      setEvidenceMetadata('');
      
      // Reload mission evidence
      await loadMissionEvidence(selectedMission);
    } catch (error) {
      console.error('Error submitting evidence:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEvidenceFile(e.target.files[0]);
    }
  };
  
  const handleMissionSelect = (missionAddress: string) => {
    setSelectedMission(missionAddress);
    loadMissionEvidence(missionAddress);
    setActiveTab('evidence');
  };
  
  const handleCompleteMission = async () => {
    if (!provider || !selectedMission) return;
    
    setLoading(true);
    try {
      await completeIfCriteriaMet(selectedMission, provider);
      
      // Reload missions
      await loadMissions();
    } catch (error) {
      console.error('Error completing mission:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClaimResources = async () => {
    if (!provider || !selectedMission) return;
    
    setLoading(true);
    try {
      await claimResources(selectedMission, provider);
      
      // Reload missions
      await loadMissions();
    } catch (error) {
      console.error('Error claiming resources:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mission-operations-container">
      <h1 className="mission-title">Autonomous Mission Operations</h1>
      
      <div className="mission-tabs">
        <button
          className={`mission-tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Active Missions
        </button>
        <button
          className={`mission-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Mission
        </button>
        <button
          className={`mission-tab ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => {
            if (selectedMission) {
              setActiveTab('evidence');
            } else {
              alert('Please select a mission first');
            }
          }}
          disabled={!selectedMission}
        >
          Submit Evidence
        </button>
      </div>
      
      <div className="mission-content">
        {!connected && (
          <div className="mission-not-connected">
            <p>Please connect your wallet to access mission operations.</p>
          </div>
        )}
        
        {connected && activeTab === 'browse' && (
          <div className="mission-browse">
            <h2>Active Missions</h2>
            {loading ? (
              <p>Loading missions...</p>
            ) : missions.length === 0 ? (
              <p>No active missions found.</p>
            ) : (
              <div className="mission-list">
                {missions.map((mission) => (
                  <div 
                    key={mission.address} 
                    className={`mission-item ${selectedMission === mission.address ? 'selected' : ''}`}
                    onClick={() => handleMissionSelect(mission.address)}
                  >
                    <div className="mission-item-header">
                      <h3>{mission.name}</h3>
                      <span className={`mission-status status-${MissionStatus[mission.status].toLowerCase()}`}>
                        {MissionStatus[mission.status]}
                      </span>
                    </div>
                    <div className="mission-item-content">
                      <p><strong>Objective:</strong> {mission.objective}</p>
                      <p><strong>Success Criteria:</strong> {mission.successCriteria}</p>
                      <p><strong>Deadline:</strong> {new Date(mission.deadline * 1000).toLocaleString()}</p>
                      <p><strong>Evidence Count:</strong> {mission.evidenceCount}</p>
                    </div>
                    <div className="mission-item-footer">
                      <div className="mission-creator">
                        <span>Created by: {mission.creator.substring(0, 6)}...{mission.creator.substring(38)}</span>
                      </div>
                      <div className="mission-actions">
                        {mission.status === MissionStatus.ACTIVE && (
                          <>
                            <button 
                              className="mission-action-button verify-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteMission();
                              }}
                            >
                              Verify Completion
                            </button>
                            <button 
                              className="mission-action-button claim-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClaimResources();
                              }}
                            >
                              Claim Resources
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {connected && activeTab === 'create' && (
          <div className="mission-create">
            <h2>Create New Mission</h2>
            <form onSubmit={handleMissionCreate} className="mission-form">
              <div className="form-group">
                <label htmlFor="missionName">Mission Name</label>
                <input
                  type="text"
                  id="missionName"
                  value={missionName}
                  onChange={(e) => setMissionName(e.target.value)}
                  placeholder="Enter mission name..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="missionObjective">Mission Objective</label>
                <textarea
                  id="missionObjective"
                  value={missionObjective}
                  onChange={(e) => setMissionObjective(e.target.value)}
                  placeholder="Describe the mission objective..."
                  required
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="missionCriteria">Success Criteria</label>
                <textarea
                  id="missionCriteria"
                  value={missionCriteria}
                  onChange={(e) => setMissionCriteria(e.target.value)}
                  placeholder="Define verifiable success criteria..."
                  required
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="missionDeadline">Deadline</label>
                <input
                  type="datetime-local"
                  id="missionDeadline"
                  value={missionDeadline}
                  onChange={(e) => setMissionDeadline(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="missionParticipants">Participants (comma-separated addresses)</label>
                <textarea
                  id="missionParticipants"
                  value={missionParticipants}
                  onChange={(e) => setMissionParticipants(e.target.value)}
                  placeholder="0x1234..., 0xabcd..."
                  required
                  rows={2}
                />
              </div>
              
              <button type="submit" className="mission-submit-button" disabled={loading}>
                {loading ? 'Creating...' : 'Create Mission'}
              </button>
            </form>
          </div>
        )}
        
        {connected && activeTab === 'evidence' && selectedMission && (
          <div className="mission-evidence">
            <h2>Submit Evidence</h2>
            <div className="mission-evidence-header">
              <h3>
                Mission: {missions.find(m => m.address === selectedMission)?.name || 'Selected Mission'}
              </h3>
            </div>
            
            <form onSubmit={handleEvidenceSubmit} className="mission-form">
              <div className="form-group">
                <label htmlFor="evidenceFile">Evidence File</label>
                <input
                  type="file"
                  id="evidenceFile"
                  onChange={handleFileChange}
                  required
                />
                {evidenceFile && (
                  <div className="file-info">
                    <span>{evidenceFile.name}</span>
                    <span>{Math.round(evidenceFile.size / 1024)} KB</span>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="evidenceType">Evidence Type</label>
                <select
                  id="evidenceType"
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(Number(e.target.value) as EvidenceType)}
                  required
                >
                  <option value={EvidenceType.DOCUMENT}>Document</option>
                  <option value={EvidenceType.PHOTO}>Photo</option>
                  <option value={EvidenceType.AUDIO}>Audio</option>
                  <option value={EvidenceType.VIDEO}>Video</option>
                  <option value={EvidenceType.OTHER}>Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="evidenceMetadata">Evidence Description</label>
                <textarea
                  id="evidenceMetadata"
                  value={evidenceMetadata}
                  onChange={(e) => setEvidenceMetadata(e.target.value)}
                  placeholder="Provide details about this evidence..."
                  rows={3}
                />
              </div>
              
              <button type="submit" className="mission-submit-button" disabled={loading || !evidenceFile}>
                {loading ? 'Submitting...' : 'Submit Evidence'}
              </button>
            </form>
            
            <div className="submitted-evidence">
              <h3>Submitted Evidence</h3>
              {missionEvidence.length === 0 ? (
                <p>No evidence submitted yet.</p>
              ) : (
                <div className="evidence-list">
                  {missionEvidence.map((evidence, index) => (
                    <div key={index} className="evidence-item">
                      <div className="evidence-item-header">
                        <h4>Evidence #{index + 1}</h4>
                        <span className="evidence-type">
                          {EvidenceType[evidence.evidenceType]}
                        </span>
                      </div>
                      <div className="evidence-item-content">
                        <p><strong>IPFS Hash:</strong> {evidence.evidenceHash}</p>
                        <p><strong>Description:</strong> {
                          (() => {
                            try {
                              const metadata = JSON.parse(evidence.metadata);
                              return metadata.description || metadata.filename || 'No description';
                            } catch (e) {
                              return evidence.metadata || 'No description';
                            }
                          })()
                        }</p>
                      </div>
                      <div className="evidence-item-footer">
                        <span>Submitted by: {
                          evidence.submitter === account 
                            ? 'You' 
                            : `${evidence.submitter.substring(0, 6)}...${evidence.submitter.substring(38)}`
                        }</span>
                        <span>{new Date(evidence.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionOperationsPage;
