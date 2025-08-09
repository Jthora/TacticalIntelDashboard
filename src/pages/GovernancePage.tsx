import '../assets/styles/pages/governance-page.css';

import { BrowserProvider } from 'ethers';
import React, { useEffect,useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';

import ProposalCreationPanel from '../components/governance/ProposalCreationPanel';
import ProposalVotingPanel from '../components/governance/ProposalVotingPanel';
import { getProposals, GovernanceProposal } from '../web3/dao/governanceProposal';

interface GovernancePageProps {
  provider: BrowserProvider | null;
}

const GovernancePage: React.FC<GovernancePageProps> = ({ provider }) => {
  const { proposalId } = useParams<{ proposalId?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'vote'>(proposalId ? 'vote' : 'create');
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!provider) return;
      
      try {
        setLoading(true);
        setError(null);
        const proposalList = await getProposals(provider);
        setProposals(proposalList);
      } catch (err) {
        setError(`Failed to load proposals: ${(err as Error).message}`);
        console.error('Error loading proposals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [provider]);

  // Handle tab changes
  useEffect(() => {
    if (proposalId) {
      setActiveTab('vote');
    }
  }, [proposalId]);

  const handleTabChange = (tab: 'create' | 'vote') => {
    setActiveTab(tab);
    if (tab === 'create') {
      navigate('/governance');
    }
  };

  const handleProposalSelect = (id: string) => {
    navigate(`/governance/${id}`);
  };

  return (
    <div className="governance-page">
      <div className="page-header">
        <h1>Governance</h1>
        <p className="page-description">
          Create and vote on governance proposals to participate in the decentralized decision-making process.
        </p>
      </div>

      <div className="governance-tabs">
        <div 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => handleTabChange('create')}
        >
          Create Proposal
        </div>
        <div 
          className={`tab ${activeTab === 'vote' ? 'active' : ''}`}
          onClick={() => handleTabChange('vote')}
        >
          Vote on Proposals
        </div>
      </div>

      <div className="governance-content">
        {activeTab === 'create' && (
          <ProposalCreationPanel provider={provider} />
        )}

        {activeTab === 'vote' && proposalId && (
          <ProposalVotingPanel proposalId={proposalId} provider={provider} />
        )}

        {activeTab === 'vote' && !proposalId && (
          <div className="proposal-list-container">
            <h2>Active Proposals</h2>
            
            {loading ? (
              <div className="loading-indicator">Loading proposals...</div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : proposals.length === 0 ? (
              <div className="alert alert-info">No proposals found</div>
            ) : (
              <div className="proposal-list">
                {proposals.map((proposal) => (
                  <div 
                    key={proposal.id}
                    className="proposal-card"
                    onClick={() => handleProposalSelect(proposal.id)}
                  >
                    <h3>{proposal.title}</h3>
                    <div className="proposal-card-details">
                      <span className="proposal-type">
                        {proposal.proposalType === 0 ? 'General' : 
                         proposal.proposalType === 1 ? 'Parameter Change' : 
                         proposal.proposalType === 2 ? 'Fund Allocation' : 'Emergency'}
                      </span>
                      <span className="proposal-status">
                        {proposal.status === 1 ? 'Active' : 
                         proposal.status === 2 ? 'Succeeded' : 
                         proposal.status === 3 ? 'Defeated' : 
                         proposal.status === 4 ? 'Executed' : 
                         proposal.status === 5 ? 'Canceled' : 
                         proposal.status === 6 ? 'Expired' : 'Pending'}
                      </span>
                    </div>
                    <p className="proposal-description-preview">
                      {proposal.description.length > 150 
                        ? `${proposal.description.substring(0, 150)}...` 
                        : proposal.description}
                    </p>
                    <div className="proposal-votes">
                      <div className="vote-bar">
                        <div 
                          className="for-votes" 
                          style={{ 
                            width: `${Number(proposal.yesVotes) * 100 / 
                              (Number(proposal.yesVotes) + Number(proposal.noVotes) + Number(proposal.abstainVotes) || 1)}%` 
                          }}
                        ></div>
                        <div 
                          className="against-votes" 
                          style={{ 
                            width: `${Number(proposal.noVotes) * 100 / 
                              (Number(proposal.yesVotes) + Number(proposal.noVotes) + Number(proposal.abstainVotes) || 1)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="vote-numbers">
                        <span className="for">For: {proposal.yesVotes.toString()}</span>
                        <span className="against">Against: {proposal.noVotes.toString()}</span>
                        <span className="abstain">Abstain: {proposal.abstainVotes.toString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernancePage;
