import '../../assets/styles/pages/governance-page.css';

import { BrowserProvider } from 'ethers';
import React, { useEffect,useState } from 'react';

import { getProposals, GovernanceProposal, ProposalStatus } from '../../web3/dao/governanceProposal';
import ProposalCreationPanel from './ProposalCreationPanel';
import ProposalVotingPanel from './ProposalVotingPanel';

interface GovernancePageProps {
  provider: BrowserProvider | null;
}

const GovernancePage: React.FC<GovernancePageProps> = ({ provider }) => {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'view'>('list');

  // Fetch all proposals
  useEffect(() => {
    const fetchProposals = async () => {
      if (!provider) return;
      
      try {
        setLoading(true);
        setError(null);
        const allProposals = await getProposals(provider);
        setProposals(allProposals);
      } catch (err) {
        setError(`Failed to load proposals: ${(err as Error).message}`);
        console.error('Error loading proposals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
    
    // Set up polling to update proposals every 30 seconds
    const intervalId = setInterval(fetchProposals, 30000);
    
    return () => clearInterval(intervalId);
  }, [provider]);

  // Navigate to create proposal view
  const handleCreateProposal = () => {
    setView('create');
    setSelectedProposalId(null);
  };

  // Navigate to view specific proposal
  const handleViewProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setView('view');
  };

  // Navigate back to list view
  const handleBackToList = () => {
    setView('list');
    setSelectedProposalId(null);
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get status badge CSS class
  const getStatusBadgeClass = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.ACTIVE:
        return 'status-badge status-active';
      case ProposalStatus.SUCCEEDED:
        return 'status-badge status-succeeded';
      case ProposalStatus.DEFEATED:
        return 'status-badge status-defeated';
      case ProposalStatus.EXECUTED:
        return 'status-badge status-executed';
      case ProposalStatus.CANCELED:
        return 'status-badge status-canceled';
      case ProposalStatus.EXPIRED:
        return 'status-badge status-expired';
      default:
        return 'status-badge status-pending';
    }
  };

  // Get status as string
  const getStatusString = (status: ProposalStatus) => {
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

  // Render proposals list view
  const renderProposalsList = () => {
    if (loading) {
      return <div className="loading-indicator">Loading governance proposals...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (proposals.length === 0) {
      return <div className="empty-state">No governance proposals found.</div>;
    }

    return (
      <div className="proposals-list">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="proposal-card" onClick={() => handleViewProposal(proposal.id)}>
            <div className="proposal-header">
              <h3>{proposal.title}</h3>
              <span className={getStatusBadgeClass(proposal.status)}>
                {getStatusString(proposal.status)}
              </span>
            </div>
            <p className="proposal-description">{proposal.description.substring(0, 150)}...</p>
            <div className="proposal-meta">
              <span>Created by: {proposal.creator.substring(0, 6)}...{proposal.creator.substring(38)}</span>
              <span>Voting ends: {formatDate(proposal.endTime)}</span>
            </div>
            <div className="proposal-stats">
              <div className="vote-bar">
                <div 
                  className="vote-yes" 
                  style={{ 
                    width: `${proposal.yesVotes > 0n ? 
                      Number(proposal.yesVotes * 100n / (proposal.yesVotes + proposal.noVotes + proposal.abstainVotes)) : 0}%`
                  }}
                ></div>
                <div 
                  className="vote-no" 
                  style={{ 
                    width: `${proposal.noVotes > 0n ? 
                      Number(proposal.noVotes * 100n / (proposal.yesVotes + proposal.noVotes + proposal.abstainVotes)) : 0}%`
                  }}
                ></div>
                <div 
                  className="vote-abstain" 
                  style={{ 
                    width: `${proposal.abstainVotes > 0n ? 
                      Number(proposal.abstainVotes * 100n / (proposal.yesVotes + proposal.noVotes + proposal.abstainVotes)) : 0}%`
                  }}
                ></div>
              </div>
              <div className="vote-stats">
                <span className="vote-yes-count">Yes: {proposal.yesVotes.toString()}</span>
                <span className="vote-no-count">No: {proposal.noVotes.toString()}</span>
                <span className="vote-abstain-count">Abstain: {proposal.abstainVotes.toString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="governance-page">
      <header className="governance-header">
        <h1>Tactical Intel Dashboard Governance</h1>
        <p>Participate in decentralized decision-making for the Earth Alliance intelligence operations</p>
      </header>

      <div className="governance-actions">
        {view === 'list' && (
          <button 
            className="create-proposal-button" 
            onClick={handleCreateProposal}
            disabled={!provider}
          >
            Create New Proposal
          </button>
        )}
        
        {(view === 'create' || view === 'view') && (
          <button className="back-button" onClick={handleBackToList}>
            ← Back to Proposals
          </button>
        )}
      </div>

      <div className="governance-content">
        {view === 'list' && renderProposalsList()}
        
        {view === 'create' && (
          <div className="create-proposal-container">
            <h2>Create New Governance Proposal</h2>
            <ProposalCreationPanel provider={provider} />
          </div>
        )}
        
        {view === 'view' && selectedProposalId && (
          <div className="view-proposal-container">
            <h2>Proposal Details</h2>
            <ProposalVotingPanel proposalId={selectedProposalId} provider={provider} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernancePage;
