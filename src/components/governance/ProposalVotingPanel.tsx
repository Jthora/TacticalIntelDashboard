import '../../assets/styles/components/proposal-voting-panel.css';

import { BrowserProvider } from 'ethers';
import React, { useEffect,useState } from 'react';

import { 
  getProposalById, 
  GovernanceProposal, 
  ProposalStatus, 
  ProposalType, 
  voteOnProposal, 
  VoteSupport} from '../../web3/dao/governanceProposal';

interface ProposalVotingPanelProps {
  proposalId: string;
  provider: BrowserProvider | null;
}

const ProposalVotingPanel: React.FC<ProposalVotingPanelProps> = ({ proposalId, provider }) => {
  const [proposal, setProposal] = useState<GovernanceProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteSupport, setVoteSupport] = useState<VoteSupport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  // Fetch proposal details
  useEffect(() => {
    const fetchProposal = async () => {
      if (!provider) return;
      
      try {
        setLoading(true);
        setError(null);
        const proposalData = await getProposalById(proposalId, provider);
        setProposal(proposalData);
      } catch (err) {
        setError(`Failed to load proposal: ${(err as Error).message}`);
        console.error('Error loading proposal:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId, provider, voteSuccess]);

  // Handle vote submission
  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider || !proposal || voteSupport === null) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await voteOnProposal(proposalId, voteSupport, provider);
      setVoteSuccess(true);
    } catch (err) {
      setError(`Failed to submit vote: ${(err as Error).message}`);
      console.error('Error submitting vote:', err);
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

  // Get proposal status as string
  const getProposalStatusString = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.PENDING:
        return 'Pending';
      case ProposalStatus.ACTIVE:
        return 'Active';
      case ProposalStatus.SUCCEEDED:
        return 'Succeeded';
      case ProposalStatus.DEFEATED:
        return 'Defeated';
      case ProposalStatus.EXECUTED:
        return 'Executed';
      case ProposalStatus.CANCELED:
        return 'Canceled';
      case ProposalStatus.EXPIRED:
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  // Calculate vote percentages
  const calculateVotePercentages = () => {
    if (!proposal) return { forPercent: 0, againstPercent: 0, abstainPercent: 0 };
    
    const totalVotes = Number(proposal.yesVotes + proposal.noVotes + proposal.abstainVotes);
    
    if (totalVotes === 0) {
      return { forPercent: 0, againstPercent: 0, abstainPercent: 0 };
    }
    
    const forPercent = Math.round(Number(proposal.yesVotes) * 100 / totalVotes);
    const againstPercent = Math.round(Number(proposal.noVotes) * 100 / totalVotes);
    const abstainPercent = Math.round(Number(proposal.abstainVotes) * 100 / totalVotes);
    
    return { forPercent, againstPercent, abstainPercent };
  };

  // Check if the proposal is active and can be voted on
  const isProposalActive = () => {
    return proposal?.status === ProposalStatus.ACTIVE;
  };

  if (!provider) {
    return (
      <div className="governance-panel proposal-voting-panel">
        <div className="alert alert-warning">
          Connect your wallet to vote on governance proposals.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="governance-panel proposal-voting-panel">
        <div className="loading-indicator">Loading proposal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="governance-panel proposal-voting-panel">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="governance-panel proposal-voting-panel">
        <div className="alert alert-danger">Proposal not found</div>
      </div>
    );
  }

  const { forPercent, againstPercent, abstainPercent } = calculateVotePercentages();

  return (
    <div className="governance-panel proposal-voting-panel">
      <h2>{proposal.title}</h2>
      
      <div className="proposal-metadata">
        <div className="metadata-item">
          <span className="metadata-label">Status:</span>
          <span className={`proposal-status status-${getProposalStatusString(proposal.status).toLowerCase()}`}>
            {getProposalStatusString(proposal.status)}
          </span>
        </div>
        
        <div className="metadata-item">
          <span className="metadata-label">Type:</span>
          <span>{getProposalTypeString(proposal.proposalType)}</span>
        </div>
        
        <div className="metadata-item">
          <span className="metadata-label">Created by:</span>
          <span className="address">{proposal.creator}</span>
        </div>
        
        <div className="metadata-item">
          <span className="metadata-label">Start:</span>
          <span>{formatDate(proposal.startTime)}</span>
        </div>
        
        <div className="metadata-item">
          <span className="metadata-label">End:</span>
          <span>{formatDate(proposal.endTime)}</span>
        </div>
      </div>
      
      <div className="proposal-description">
        <h3>Description</h3>
        <p>{proposal.description}</p>
      </div>
      
      <div className="vote-distribution">
        <h3>Current Votes</h3>
        
        <div className="vote-bars">
          <div className="vote-bar-container">
            <div className="vote-label">For</div>
            <div className="vote-bar">
              <div className="vote-bar-fill vote-yes" style={{ width: `${forPercent}%` }}></div>
            </div>
            <div className="vote-percentage">{forPercent}%</div>
            <div className="vote-count">{proposal.yesVotes.toString()}</div>
          </div>
          
          <div className="vote-bar-container">
            <div className="vote-label">Against</div>
            <div className="vote-bar">
              <div className="vote-bar-fill vote-no" style={{ width: `${againstPercent}%` }}></div>
            </div>
            <div className="vote-percentage">{againstPercent}%</div>
            <div className="vote-count">{proposal.noVotes.toString()}</div>
          </div>
          
          <div className="vote-bar-container">
            <div className="vote-label">Abstain</div>
            <div className="vote-bar">
              <div className="vote-bar-fill vote-abstain" style={{ width: `${abstainPercent}%` }}></div>
            </div>
            <div className="vote-percentage">{abstainPercent}%</div>
            <div className="vote-count">{proposal.abstainVotes.toString()}</div>
          </div>
        </div>
      </div>
      
      {isProposalActive() ? (
        <div className="voting-section">
          <h3>Cast Your Vote</h3>
          
          {voteSuccess ? (
            <div className="alert alert-success">Vote submitted successfully!</div>
          ) : (
            <form onSubmit={handleVoteSubmit}>
              <div className="vote-options">
                <div className="vote-option">
                  <input
                    type="radio"
                    id="vote-for"
                    name="vote-support"
                    value={VoteSupport.FOR}
                    checked={voteSupport === VoteSupport.FOR}
                    onChange={() => setVoteSupport(VoteSupport.FOR)}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="vote-for">For</label>
                </div>
                
                <div className="vote-option">
                  <input
                    type="radio"
                    id="vote-against"
                    name="vote-support"
                    value={VoteSupport.AGAINST}
                    checked={voteSupport === VoteSupport.AGAINST}
                    onChange={() => setVoteSupport(VoteSupport.AGAINST)}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="vote-against">Against</label>
                </div>
                
                <div className="vote-option">
                  <input
                    type="radio"
                    id="vote-abstain"
                    name="vote-support"
                    value={VoteSupport.ABSTAIN}
                    checked={voteSupport === VoteSupport.ABSTAIN}
                    onChange={() => setVoteSupport(VoteSupport.ABSTAIN)}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="vote-abstain">Abstain</label>
                </div>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={voteSupport === null || isSubmitting}
              >
                {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="alert alert-info">
          This proposal is no longer active and cannot be voted on.
        </div>
      )}
    </div>
  );
};

export default ProposalVotingPanel;
