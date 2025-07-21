// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IntelToken ($INTEL)
 * @dev ERC20 token for the Starcom Intelligence Exchange Marketplace
 * @notice Utility token for accessing premium intelligence features and marketplace trading
 */
contract IntelToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    
    // Token configuration
    uint256 public constant TOTAL_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% annual staking rewards
    
    // Access level thresholds (in tokens)
    uint256 public constant FIELD_OPERATIVE_THRESHOLD = 100 * 10**18;
    uint256 public constant ANALYST_THRESHOLD = 1000 * 10**18;
    uint256 public constant COMMANDER_THRESHOLD = 5000 * 10**18;
    uint256 public constant DIRECTOR_THRESHOLD = 10000 * 10**18;
    
    // Staking functionality
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
    }
    
    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public rewardsClaimed;
    
    uint256 public totalStaked;
    bool public stakingEnabled = true;
    
    // Events
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event AccessLevelChanged(address indexed user, uint8 newLevel);
    
    constructor(address initialOwner) 
        ERC20("IntelToken", "INTEL") 
        Ownable(initialOwner) 
    {
        _mint(initialOwner, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Stake tokens to earn rewards and unlock marketplace features
     * @param amount Amount of tokens to stake
     */
    function stakeTokens(uint256 amount) external nonReentrant {
        require(stakingEnabled, "Staking is disabled");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");
        
        // Claim any pending rewards before updating stake
        if (stakes[msg.sender].amount > 0) {
            claimStakingRewards();
        }
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update stake info
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        
        totalStaked += amount;
        
        emit TokensStaked(msg.sender, amount);
        emit AccessLevelChanged(msg.sender, getAccessLevel(msg.sender));
    }
    
    /**
     * @dev Unstake tokens (forfeits unclaimed rewards)
     * @param amount Amount of tokens to unstake
     */
    function unstakeTokens(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].amount >= amount, "Insufficient staked balance");
        
        // Update stake info
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        // Reset timing if fully unstaking
        if (stakes[msg.sender].amount == 0) {
            stakes[msg.sender].startTime = 0;
            stakes[msg.sender].lastClaimTime = 0;
        }
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, amount);
        emit AccessLevelChanged(msg.sender, getAccessLevel(msg.sender));
    }
    
    /**
     * @dev Claim accumulated staking rewards
     */
    function claimStakingRewards() public nonReentrant {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards to claim");
        
        stakes[msg.sender].lastClaimTime = block.timestamp;
        rewardsClaimed[msg.sender] += rewards;
        
        // Mint new tokens as rewards
        _mint(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Calculate pending staking rewards for a user
     * @param user Address to calculate rewards for
     * @return reward Amount of rewards pending
     */
    function calculateRewards(address user) public view returns (uint256 reward) {
        StakeInfo memory stake = stakes[user];
        if (stake.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - stake.lastClaimTime;
        uint256 annualReward = (stake.amount * STAKING_REWARD_RATE) / 100;
        reward = (annualReward * timeStaked) / 365 days;
        
        return reward;
    }
    
    /**
     * @dev Get user's access level based on token holdings and staking
     * @param user Address to check access level for
     * @return level Access level (0-4)
     */
    function getAccessLevel(address user) public view returns (uint8 level) {
        uint256 balance = balanceOf(user);
        uint256 stakedAmount = stakes[user].amount;
        uint256 totalTokens = balance + stakedAmount;
        
        // Higher privileges for staked tokens
        uint256 effectiveBalance = balance + (stakedAmount * 2);
        
        if (effectiveBalance >= DIRECTOR_THRESHOLD) return 4;
        if (effectiveBalance >= COMMANDER_THRESHOLD) return 3;
        if (totalTokens >= ANALYST_THRESHOLD) return 2;
        if (totalTokens >= FIELD_OPERATIVE_THRESHOLD) return 1;
        return 0;
    }
    
    /**
     * @dev Get detailed user info for frontend
     * @param user Address to get info for
     */
    function getUserInfo(address user) external view returns (
        uint256 balance,
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint8 accessLevel,
        uint256 stakingStartTime
    ) {
        balance = balanceOf(user);
        stakedAmount = stakes[user].amount;
        pendingRewards = calculateRewards(user);
        accessLevel = getAccessLevel(user);
        stakingStartTime = stakes[user].startTime;
    }
    
    /**
     * @dev Toggle staking functionality (owner only)
     */
    function toggleStaking() external onlyOwner {
        stakingEnabled = !stakingEnabled;
    }
    
    /**
     * @dev Emergency withdraw function (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = balanceOf(address(this));
        _transfer(address(this), owner(), balance);
    }
}
