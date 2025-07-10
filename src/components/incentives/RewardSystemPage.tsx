import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { ethers } from 'ethers';
import { 
  rewardContribution,
  claimRewards,
  createStake,
  getRewardBalance,
  getStakesByStaker,
  issueAnonymousReward,
  claimAnonymousReward,
  withdrawStake,
  RewardData,
  StakeData
} from '../../web3/incentives/rewardSystem';
import '../../styles/incentives/RewardSystem.css';

/**
 * Main page for reward system and incentives
 */
const RewardSystemPage: React.FC = () => {
  const { provider, isConnected: connected, walletAddress: account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for reward dashboard
  const [rewardBalance, setRewardBalance] = useState('0');
  const [rewardHistory, setRewardHistory] = useState<RewardData[]>([]);
  const [userStakes, setUserStakes] = useState<StakeData[]>([]);
  
  // Form states for rewards
  const [contributorAddress, setContributorAddress] = useState('');
  const [intelId, setIntelId] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [rewardId, setRewardId] = useState('');
  
  // Form states for staking
  const [stakeIntelId, setStakeIntelId] = useState('');
  const [stakePosition, setStakePosition] = useState(true);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeExpiry, setStakeExpiry] = useState('');
  
  useEffect(() => {
    if (connected && provider && account) {
      loadRewardData();
    }
  }, [connected, provider, account]);
  
  const loadRewardData = async () => {
    if (!provider || !account) return;
    
    setLoading(true);
    try {
      // Get reward balance
      const balance = await getRewardBalance(account, provider);
      setRewardBalance(balance);
      
      // Get user stakes
      const stakes = await getStakesByStaker(account, provider);
      setUserStakes(stakes);
      
      // For demo purposes, let's add some mock reward history
      setRewardHistory([
        {
          recipient: account,
          intelId: '0x123456789abcdef',
          amount: '1000000000000000000', // 1 ETH in wei
          timestamp: Date.now() - 86400000 // 1 day ago
        },
        {
          recipient: account,
          intelId: '0xabcdef123456789',
          amount: '500000000000000000', // 0.5 ETH in wei
          timestamp: Date.now() - 172800000 // 2 days ago
        }
      ]);
    } catch (error) {
      console.error('Error loading reward data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRewardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    
    setLoading(true);
    try {
      if (isAnonymous) {
        // Generate a random claim code for anonymous rewards
        const generatedClaimCode = Math.random().toString(36).substring(2, 15);
        
        // Issue anonymous reward
        await issueAnonymousReward(
          intelId,
          rewardAmount,
          generatedClaimCode,
          provider
        );
        
        // Display the claim code to the user (in a real app, this would be handled securely)
        alert(`Anonymous reward issued! Claim code: ${generatedClaimCode}`);
      } else {
        // Issue direct reward
        await rewardContribution(
          contributorAddress,
          intelId,
          rewardAmount,
          provider
        );
      }
      
      // Reset form
      setContributorAddress('');
      setIntelId('');
      setRewardAmount('');
      setIsAnonymous(false);
      
      // Reload reward data
      await loadRewardData();
    } catch (error) {
      console.error('Error issuing reward:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClaimRewards = async () => {
    if (!provider) return;
    
    setLoading(true);
    try {
      await claimRewards(provider);
      
      // Reload reward data
      await loadRewardData();
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClaimAnonymous = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    
    setLoading(true);
    try {
      await claimAnonymousReward(
        rewardId,
        claimCode,
        provider
      );
      
      // Reset form
      setRewardId('');
      setClaimCode('');
      
      // Reload reward data
      await loadRewardData();
    } catch (error) {
      console.error('Error claiming anonymous reward:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    
    setLoading(true);
    try {
      // Parse expiry date
      const expiryDate = new Date(stakeExpiry);
      
      await createStake(
        stakeIntelId,
        stakePosition,
        stakeAmount,
        Math.floor(expiryDate.getTime() / 1000),
        provider
      );
      
      // Reset form
      setStakeIntelId('');
      setStakePosition(true);
      setStakeAmount('');
      setStakeExpiry('');
      
      // Reload reward data
      await loadRewardData();
    } catch (error) {
      console.error('Error creating stake:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleWithdrawStake = async (stakeId: string) => {
    if (!provider) return;
    
    setLoading(true);
    try {
      await withdrawStake(stakeId, provider);
      
      // Reload reward data
      await loadRewardData();
    } catch (error) {
      console.error('Error withdrawing stake:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="reward-system-container">
      <h1 className="reward-title">Incentive & Reward System</h1>
      
      <div className="reward-tabs">
        <button
          className={`reward-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Reward Dashboard
        </button>
        <button
          className={`reward-tab ${activeTab === 'issue' ? 'active' : ''}`}
          onClick={() => setActiveTab('issue')}
        >
          Issue Reward
        </button>
        <button
          className={`reward-tab ${activeTab === 'claim' ? 'active' : ''}`}
          onClick={() => setActiveTab('claim')}
        >
          Claim Reward
        </button>
        <button
          className={`reward-tab ${activeTab === 'stake' ? 'active' : ''}`}
          onClick={() => setActiveTab('stake')}
        >
          Staking
        </button>
      </div>
      
      <div className="reward-content">
        {!connected && (
          <div className="reward-not-connected">
            <p>Please connect your wallet to access reward features.</p>
          </div>
        )}
        
        {connected && activeTab === 'dashboard' && (
          <div className="reward-dashboard">
            <div className="dashboard-cards">
              <div className="dashboard-card balance-card">
                <h3>Your Reward Balance</h3>
                <div className="balance-amount">
                  <span>{ethers.formatEther(rewardBalance)}</span>
                  <span className="token-symbol">TID</span>
                </div>
                <button 
                  className="claim-button"
                  onClick={handleClaimRewards}
                  disabled={loading || rewardBalance === '0'}
                >
                  {loading ? 'Claiming...' : 'Claim Rewards'}
                </button>
              </div>
              
              <div className="dashboard-card stakes-card">
                <h3>Active Stakes</h3>
                <div className="stakes-count">
                  <span>{userStakes.length}</span>
                  <span className="stakes-label">Active Stakes</span>
                </div>
                <button 
                  className="stake-button"
                  onClick={() => setActiveTab('stake')}
                >
                  Manage Stakes
                </button>
              </div>
            </div>
            
            <div className="reward-history">
              <h3>Reward History</h3>
              {rewardHistory.length === 0 ? (
                <p>No rewards received yet.</p>
              ) : (
                <table className="reward-table">
                  <thead>
                    <tr>
                      <th>Intel ID</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewardHistory.map((reward, index) => (
                      <tr key={index}>
                        <td>
                          {reward.intelId.substring(0, 6)}...{reward.intelId.substring(reward.intelId.length - 4)}
                        </td>
                        <td>{ethers.formatEther(reward.amount)} TID</td>
                        <td>{new Date(reward.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        
        {connected && activeTab === 'issue' && (
          <div className="reward-issue">
            <h2>Issue Reward</h2>
            <form onSubmit={handleRewardSubmit} className="reward-form">
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="isAnonymous">Anonymous Reward</label>
              </div>
              
              {!isAnonymous && (
                <div className="form-group">
                  <label htmlFor="contributorAddress">Recipient Address</label>
                  <input
                    type="text"
                    id="contributorAddress"
                    value={contributorAddress}
                    onChange={(e) => setContributorAddress(e.target.value)}
                    placeholder="0x..."
                    required={!isAnonymous}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="intelId">Intelligence ID</label>
                <input
                  type="text"
                  id="intelId"
                  value={intelId}
                  onChange={(e) => setIntelId(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="rewardAmount">Reward Amount (TID)</label>
                <input
                  type="text"
                  id="rewardAmount"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  placeholder="1.0"
                  required
                />
              </div>
              
              <button type="submit" className="reward-submit-button" disabled={loading}>
                {loading ? 'Issuing...' : isAnonymous ? 'Issue Anonymous Reward' : 'Issue Reward'}
              </button>
            </form>
          </div>
        )}
        
        {connected && activeTab === 'claim' && (
          <div className="reward-claim">
            <h2>Claim Anonymous Reward</h2>
            <form onSubmit={handleClaimAnonymous} className="reward-form">
              <div className="form-group">
                <label htmlFor="rewardId">Reward ID</label>
                <input
                  type="text"
                  id="rewardId"
                  value={rewardId}
                  onChange={(e) => setRewardId(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="claimCode">Claim Code</label>
                <input
                  type="text"
                  id="claimCode"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  placeholder="Enter claim code"
                  required
                />
              </div>
              
              <button type="submit" className="reward-submit-button" disabled={loading}>
                {loading ? 'Claiming...' : 'Claim Anonymous Reward'}
              </button>
            </form>
          </div>
        )}
        
        {connected && activeTab === 'stake' && (
          <div className="reward-stake">
            <div className="stake-sections">
              <div className="stake-create-section">
                <h2>Create New Stake</h2>
                <form onSubmit={handleStakeSubmit} className="reward-form">
                  <div className="form-group">
                    <label htmlFor="stakeIntelId">Intelligence ID</label>
                    <input
                      type="text"
                      id="stakeIntelId"
                      value={stakeIntelId}
                      onChange={(e) => setStakeIntelId(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stakePosition">Your Position</label>
                    <select
                      id="stakePosition"
                      value={stakePosition.toString()}
                      onChange={(e) => setStakePosition(e.target.value === 'true')}
                      required
                    >
                      <option value="true">Accurate</option>
                      <option value="false">Inaccurate</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stakeAmount">Stake Amount (TID)</label>
                    <input
                      type="text"
                      id="stakeAmount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="1.0"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stakeExpiry">Expiry Date</label>
                    <input
                      type="datetime-local"
                      id="stakeExpiry"
                      value={stakeExpiry}
                      onChange={(e) => setStakeExpiry(e.target.value)}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="reward-submit-button" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Stake'}
                  </button>
                </form>
              </div>
              
              <div className="stake-list-section">
                <h2>Your Active Stakes</h2>
                {userStakes.length === 0 ? (
                  <p>No active stakes found.</p>
                ) : (
                  <div className="stakes-list">
                    {userStakes.map((stake, index) => (
                      <div key={index} className="stake-item">
                        <div className="stake-item-header">
                          <h3>Stake on {stake.intelId.substring(0, 6)}...{stake.intelId.substring(stake.intelId.length - 4)}</h3>
                          <span className={`stake-position ${stake.position ? 'position-true' : 'position-false'}`}>
                            {stake.position ? 'Accurate' : 'Inaccurate'}
                          </span>
                        </div>
                        <div className="stake-item-content">
                          <p><strong>Amount:</strong> {ethers.formatEther(stake.amount)} TID</p>
                          <p><strong>Expires:</strong> {new Date(stake.expiryTime * 1000).toLocaleString()}</p>
                          {stake.resolved && (
                            <p>
                              <strong>Result:</strong>
                              <span className={`stake-result ${stake.result ? 'result-true' : 'result-false'}`}>
                                {stake.result ? 'Correct' : 'Incorrect'}
                              </span>
                              {stake.reward && (
                                <span> (Reward: {ethers.formatEther(stake.reward)} TID)</span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="stake-item-footer">
                          {!stake.resolved && (
                            <button
                              className="withdraw-button"
                              onClick={() => handleWithdrawStake(stake.stakeId)}
                              disabled={loading}
                            >
                              {loading ? 'Withdrawing...' : 'Withdraw Stake'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardSystemPage;
