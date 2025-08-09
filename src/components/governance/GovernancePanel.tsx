// src/components/governance/GovernancePanel.tsx
import '../../assets/styles/components/governance-panel.css';

import React, { useEffect,useState } from 'react';

import { useWeb3 } from '../../contexts/Web3Context';
import { AccessLevel } from '../../contexts/Web3Context';

interface Proposal {
  id: number;
  title: string;
  description: string;
  creator: string;
  status: 'Active' | 'Succeeded' | 'Defeated' | 'Pending' | 'Executed';
  votesFor: number;
  votesAgainst: number;
  abstainVotes: number;
  endTime: string;
  category: 'Platform' | 'Security' | 'Economics' | 'Technical';
}

const GovernancePanel: React.FC = () => {
  const { isConnected, accessLevel } = useWeb3();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userVotes, setUserVotes] = useState<{ [key: number]: 'for' | 'against' | 'abstain' | null }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Demo proposals data
  const demoProposals: Proposal[] = [
    {
      id: 1,
      title: 'Implement Dynamic Staking Rewards',
      description: 'Proposal to implement dynamic staking rewards based on platform usage and intelligence report quality ratings.',
      creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      status: 'Active',
      votesFor: 1547,
      votesAgainst: 234,
      abstainVotes: 89,
      endTime: '2025-01-25T18:00:00Z',
      category: 'Economics'
    },
    {
      id: 2,
      title: 'Add Multi-Signature Security for High-Value Reports',
      description: 'Require multi-signature verification for intelligence reports exceeding 1 ETH in value to enhance security.',
      creator: '0x1234567890123456789012345678901234567890',
      status: 'Active',
      votesFor: 892,
      votesAgainst: 445,
      abstainVotes: 156,
      endTime: '2025-01-20T12:00:00Z',
      category: 'Security'
    },
    {
      id: 3,
      title: 'Expand Intelligence Sources Registry',
      description: 'Add support for additional intelligence sources including academic institutions and government agencies.',
      creator: '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199',
      status: 'Succeeded',
      votesFor: 2341,
      votesAgainst: 678,
      abstainVotes: 234,
      endTime: '2025-01-15T09:00:00Z',
      category: 'Platform'
    }
  ];

  useEffect(() => {
    if (isConnected) {
      setProposals(demoProposals);
      // Initialize user votes (simulate previous voting history)
      setUserVotes({
        3: 'for', // User voted for proposal 3
      });
    }
  }, [isConnected]);

  const canVote = accessLevel >= AccessLevel.ANALYST;
  const canCreateProposal = accessLevel >= AccessLevel.DIRECTOR;

  const handleVote = async (proposalId: number, vote: 'for' | 'against' | 'abstain') => {
    if (!canVote) {
      alert('Analyst level access or higher required to participate in governance');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate voting transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      setUserVotes(prev => ({ ...prev, [proposalId]: vote }));
      
      // Update proposal vote counts (simplified)
      setProposals(prev => prev.map(proposal => {
        if (proposal.id === proposalId) {
          const updated = { ...proposal };
          if (vote === 'for') updated.votesFor += 1;
          else if (vote === 'against') updated.votesAgainst += 1;
          else updated.abstainVotes += 1;
          return updated;
        }
        return proposal;
      }));

      alert(`Vote cast successfully! You voted ${vote.toUpperCase()} on proposal ${proposalId}`);
    } catch (error) {
      alert('Failed to cast vote');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': '#3b82f6',
      'Succeeded': '#10b981',
      'Defeated': '#ef4444',
      'Pending': '#f59e0b',
      'Executed': '#8b5cf6'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Platform': '#3b82f6',
      'Security': '#ef4444',
      'Economics': '#f59e0b',
      'Technical': '#8b5cf6'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  const getTotalVotes = (proposal: Proposal) => {
    return proposal.votesFor + proposal.votesAgainst + proposal.abstainVotes;
  };

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  if (!isConnected) {
    return (
      <div className="governance-panel">
        <div className="connect-prompt">
          <h2>🏛️ Starcom DAO Governance</h2>
          <p>Connect your wallet to participate in decentralized governance</p>
          <div className="governance-features">
            <div className="feature">📊 Vote on Platform Proposals</div>
            <div className="feature">💡 Create Governance Proposals</div>
            <div className="feature">🎯 Shape Platform Direction</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="governance-panel">
      <div className="governance-header">
        <h1>🏛️ Starcom DAO Governance</h1>
        <p>Decentralized decision-making for the Intelligence Exchange Marketplace</p>
        
        <div className="governance-stats">
          <div className="stat">
            <span className="label">Active Proposals</span>
            <span className="value">{proposals.filter(p => p.status === 'Active').length}</span>
          </div>
          <div className="stat">
            <span className="label">Your Voting Power</span>
            <span className="value">{canVote ? '1 Vote' : 'None'}</span>
          </div>
          <div className="stat">
            <span className="label">Participation</span>
            <span className="value">{Object.keys(userVotes).length} Votes Cast</span>
          </div>
        </div>
      </div>

      {!canVote && (
        <div className="access-notice">
          <p>⚠️ Analyst level access required to participate in governance. Stake more INTEL tokens to unlock voting rights.</p>
        </div>
      )}

      <div className="proposals-section">
        <div className="section-header">
          <h2>📋 Active Proposals</h2>
          {canCreateProposal && (
            <button className="create-proposal-btn">
              ➕ Create Proposal
            </button>
          )}
        </div>

        <div className="proposals-grid">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card">
              <div className="proposal-header">
                <div className="proposal-title-section">
                  <h3>{proposal.title}</h3>
                  <div className="proposal-meta">
                    <span 
                      className="category-badge" 
                      style={{ backgroundColor: getCategoryColor(proposal.category) }}
                    >
                      {proposal.category}
                    </span>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(proposal.status) }}
                    >
                      {proposal.status}
                    </span>
                  </div>
                </div>
                <div className="proposal-id">#{proposal.id}</div>
              </div>

              <div className="proposal-description">
                {proposal.description}
              </div>

              <div className="proposal-creator">
                <span className="label">Proposed by:</span>
                <span className="address">{proposal.creator}</span>
              </div>

              {proposal.status === 'Active' && (
                <div className="proposal-timeline">
                  <span className="label">Voting ends:</span>
                  <span className="time">{new Date(proposal.endTime).toLocaleDateString()}</span>
                </div>
              )}

              <div className="voting-results">
                <div className="vote-bar">
                  <div className="vote-section for">
                    <div 
                      className="vote-fill" 
                      style={{ 
                        width: `${getVotePercentage(proposal.votesFor, getTotalVotes(proposal))}%`,
                        backgroundColor: '#10b981'
                      }}
                    ></div>
                  </div>
                  <div className="vote-section against">
                    <div 
                      className="vote-fill" 
                      style={{ 
                        width: `${getVotePercentage(proposal.votesAgainst, getTotalVotes(proposal))}%`,
                        backgroundColor: '#ef4444'
                      }}
                    ></div>
                  </div>
                  <div className="vote-section abstain">
                    <div 
                      className="vote-fill" 
                      style={{ 
                        width: `${getVotePercentage(proposal.abstainVotes, getTotalVotes(proposal))}%`,
                        backgroundColor: '#6b7280'
                      }}
                    ></div>
                  </div>
                </div>

                <div className="vote-counts">
                  <div className="vote-count for">
                    <span className="count">{proposal.votesFor}</span>
                    <span className="label">For</span>
                  </div>
                  <div className="vote-count against">
                    <span className="count">{proposal.votesAgainst}</span>
                    <span className="label">Against</span>
                  </div>
                  <div className="vote-count abstain">
                    <span className="count">{proposal.abstainVotes}</span>
                    <span className="label">Abstain</span>
                  </div>
                </div>
              </div>

              {proposal.status === 'Active' && canVote && (
                <div className="voting-actions">
                  {userVotes[proposal.id] ? (
                    <div className="voted-indicator">
                      ✅ You voted: <strong>{userVotes[proposal.id]?.toUpperCase()}</strong>
                    </div>
                  ) : (
                    <div className="vote-buttons">
                      <button 
                        className="vote-btn for"
                        onClick={() => handleVote(proposal.id, 'for')}
                        disabled={isLoading}
                      >
                        👍 For
                      </button>
                      <button 
                        className="vote-btn against"
                        onClick={() => handleVote(proposal.id, 'against')}
                        disabled={isLoading}
                      >
                        👎 Against
                      </button>
                      <button 
                        className="vote-btn abstain"
                        onClick={() => handleVote(proposal.id, 'abstain')}
                        disabled={isLoading}
                      >
                        🤷 Abstain
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovernancePanel;
