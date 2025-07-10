import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { 
  ProposalType, 
  createProposal, 
  getProposals, 
  GovernanceProposal 
} from '../../web3/dao/governanceProposal';

interface ProposalCreationPanelProps {
  provider: BrowserProvider | null;
}

const ProposalCreationPanel: React.FC<ProposalCreationPanelProps> = ({ provider }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposalType, setProposalType] = useState<ProposalType>(ProposalType.GENERAL);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('7'); // Default 7 days
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentProposals, setRecentProposals] = useState<GovernanceProposal[]>([]);

  // Fetch recent proposals on component mount
  useEffect(() => {
    const fetchRecentProposals = async () => {
      if (!provider) return;
      
      try {
        const proposals = await getProposals(provider);
        setRecentProposals(proposals.slice(0, 5)); // Show 5 most recent proposals
      } catch (err) {
        console.error('Error fetching recent proposals:', err);
      }
    };

    fetchRecentProposals();
  }, [provider, success]); // Refetch when a new proposal is created

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider) {
      setError('Web3 provider not connected');
      return;
    }

    if (!title || !description || !startTime) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert start time to Unix timestamp
      const startTimeDate = new Date(startTime);
      const startTimeUnix = Math.floor(startTimeDate.getTime() / 1000);
      
      // Calculate end time based on duration (days)
      const durationInSeconds = parseInt(duration) * 24 * 60 * 60;
      const endTimeUnix = startTimeUnix + durationInSeconds;

      const proposalData = {
        title,
        description,
        proposalType,
        startTime: startTimeUnix,
        endTime: endTimeUnix
      };

      const proposalId = await createProposal(proposalData, provider);
      
      setSuccess(`Proposal created successfully! Proposal ID: ${proposalId}`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setProposalType(ProposalType.GENERAL);
      setStartTime('');
      setDuration('7');
    } catch (err) {
      setError(`Failed to create proposal: ${(err as Error).message}`);
      console.error('Error creating proposal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get proposal type as string
  const getProposalTypeString = (type: ProposalType) => {
    switch (type) {
      case ProposalType.GENERAL:
        return 'General';
      case ProposalType.PARAMETER_CHANGE:
        return 'Parameter Change';
      case ProposalType.FUND_ALLOCATION:
        return 'Fund Allocation';
      case ProposalType.EMERGENCY:
        return 'Emergency';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="governance-panel">
      <h2>Create Governance Proposal</h2>
      
      {!provider && (
        <div className="alert alert-warning">
          Connect your wallet to create and manage governance proposals.
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="proposal-title">Title</label>
          <input
            id="proposal-title"
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter proposal title"
            disabled={isSubmitting || !provider}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="proposal-description">Description</label>
          <textarea
            id="proposal-description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed proposal description"
            rows={5}
            disabled={isSubmitting || !provider}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="proposal-type">Proposal Type</label>
          <select
            id="proposal-type"
            className="form-control"
            value={proposalType}
            onChange={(e) => setProposalType(parseInt(e.target.value) as ProposalType)}
            disabled={isSubmitting || !provider}
          >
            <option value={ProposalType.GENERAL}>General</option>
            <option value={ProposalType.PARAMETER_CHANGE}>Parameter Change</option>
            <option value={ProposalType.FUND_ALLOCATION}>Fund Allocation</option>
            <option value={ProposalType.EMERGENCY}>Emergency</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="proposal-start-time">Start Time</label>
          <input
            id="proposal-start-time"
            type="datetime-local"
            className="form-control"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isSubmitting || !provider}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="proposal-duration">Duration (days)</label>
          <input
            id="proposal-duration"
            type="number"
            className="form-control"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            max="30"
            disabled={isSubmitting || !provider}
            required
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !provider}
        >
          {isSubmitting ? 'Creating Proposal...' : 'Create Proposal'}
        </button>
      </form>
      
      <div className="recent-proposals mt-5">
        <h3>Recent Proposals</h3>
        
        {recentProposals.length === 0 ? (
          <p>No proposals found</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProposals.map((proposal) => (
                <tr key={proposal.id}>
                  <td>{proposal.id}</td>
                  <td>{proposal.title}</td>
                  <td>{getProposalTypeString(proposal.proposalType)}</td>
                  <td>{formatDate(proposal.startTime)}</td>
                  <td>{formatDate(proposal.endTime)}</td>
                  <td>{proposal.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProposalCreationPanel;
