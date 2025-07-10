// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GovernanceV1
 * @dev Simple governance contract for creating and voting on proposals
 */
contract GovernanceV1 {
    // Enums
    enum ProposalType { GENERAL, PARAMETER_CHANGE, FUND_ALLOCATION, EMERGENCY }
    enum ProposalStatus { PENDING, ACTIVE, SUCCEEDED, DEFEATED, EXECUTED, CANCELED, EXPIRED }
    enum VoteType { AGAINST, FOR, ABSTAIN }

    // Structs
    struct Proposal {
        uint256 id;
        address creator;
        string title;
        string description;
        ProposalType proposalType;
        ProposalStatus status;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        string metadataURI;
        bool executed;
        uint256 createdAt;
        uint256 executedAt;
    }

    // State variables
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public votingPower;
    address public admin;

    // Events
    event ProposalCreated(
        uint256 proposalId,
        address indexed creator,
        string title,
        string description,
        ProposalType proposalType,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteType support,
        uint256 weight
    );

    event ProposalExecuted(uint256 indexed proposalId, address indexed executor);
    event ProposalCanceled(uint256 indexed proposalId, address indexed canceler);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "GovernanceV1: caller is not admin");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "GovernanceV1: invalid proposal id");
        _;
    }

    // Constructor
    constructor() {
        admin = msg.sender;
        
        // Initialize admin voting power
        votingPower[msg.sender] = 100 ether;
    }

    /**
     * @dev Creates a new proposal
     * @param title Proposal title
     * @param description Detailed proposal description
     * @param proposalType Type of proposal
     * @param startTime Start time of voting period
     * @param endTime End time of voting period
     * @param targets Contract addresses to call if proposal passes
     * @param values ETH values to send with calls
     * @param calldatas Function data for calls
     * @param metadataURI URI for additional metadata (e.g., IPFS hash)
     */
    function createProposal(
        string memory title,
        string memory description,
        ProposalType proposalType,
        uint256 startTime,
        uint256 endTime,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory metadataURI
    ) external returns (uint256) {
        require(bytes(title).length > 0, "GovernanceV1: empty title");
        require(bytes(description).length > 0, "GovernanceV1: empty description");
        require(startTime >= block.timestamp, "GovernanceV1: start time must be in the future");
        require(endTime > startTime, "GovernanceV1: end time must be after start time");
        
        // Check if caller has voting power
        require(votingPower[msg.sender] > 0, "GovernanceV1: caller has no voting power");

        // If this is an executable proposal, ensure targets/values/calldatas are valid
        if (targets.length > 0) {
            require(targets.length == values.length, "GovernanceV1: invalid proposal actions");
            require(targets.length == calldatas.length, "GovernanceV1: invalid proposal actions");
        }

        // Increment proposal counter
        proposalCount++;
        uint256 proposalId = proposalCount;

        // Create new proposal
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.creator = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.proposalType = proposalType;
        proposal.status = startTime <= block.timestamp ? ProposalStatus.ACTIVE : ProposalStatus.PENDING;
        proposal.startTime = startTime;
        proposal.endTime = endTime;
        proposal.targets = targets;
        proposal.values = values;
        proposal.calldatas = calldatas;
        proposal.metadataURI = metadataURI;
        proposal.createdAt = block.timestamp;

        // Emit event
        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            description,
            proposalType,
            startTime,
            endTime
        );

        return proposalId;
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal
     * @param support Vote type (0=Against, 1=For, 2=Abstain)
     */
    function vote(uint256 proposalId, VoteType support) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.status == ProposalStatus.ACTIVE, "GovernanceV1: proposal not active");
        require(block.timestamp >= proposal.startTime, "GovernanceV1: voting not started");
        require(block.timestamp <= proposal.endTime, "GovernanceV1: voting ended");
        require(!hasVoted[proposalId][msg.sender], "GovernanceV1: already voted");
        
        // Get voter's voting power
        uint256 weight = votingPower[msg.sender];
        require(weight > 0, "GovernanceV1: no voting power");

        // Record vote
        hasVoted[proposalId][msg.sender] = true;

        // Update vote counts
        if (support == VoteType.FOR) {
            proposal.yesVotes += weight;
        } else if (support == VoteType.AGAINST) {
            proposal.noVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }

        // Emit event
        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /**
     * @dev Execute a successful proposal
     * @param proposalId ID of the proposal
     */
    function executeProposal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.status == ProposalStatus.ACTIVE, "GovernanceV1: proposal not active");
        require(block.timestamp > proposal.endTime, "GovernanceV1: voting period not ended");
        require(!proposal.executed, "GovernanceV1: proposal already executed");
        require(proposal.targets.length > 0, "GovernanceV1: proposal has no actions");

        // Check if proposal was successful
        if (proposal.yesVotes > proposal.noVotes) {
            proposal.status = ProposalStatus.SUCCEEDED;
            proposal.executed = true;
            proposal.executedAt = block.timestamp;

            // Execute each action
            for (uint i = 0; i < proposal.targets.length; i++) {
                (bool success, ) = proposal.targets[i].call{value: proposal.values[i]}(proposal.calldatas[i]);
                require(success, "GovernanceV1: proposal execution failed");
            }

            // Emit event
            emit ProposalExecuted(proposalId, msg.sender);
        } else {
            proposal.status = ProposalStatus.DEFEATED;
        }
    }

    /**
     * @dev Cancel a proposal (only creator or admin)
     * @param proposalId ID of the proposal
     */
    function cancelProposal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(
            msg.sender == proposal.creator || msg.sender == admin,
            "GovernanceV1: not authorized to cancel"
        );
        require(
            proposal.status == ProposalStatus.PENDING || proposal.status == ProposalStatus.ACTIVE,
            "GovernanceV1: proposal cannot be canceled"
        );
        require(!proposal.executed, "GovernanceV1: proposal already executed");

        proposal.status = ProposalStatus.CANCELED;

        // Emit event
        emit ProposalCanceled(proposalId, msg.sender);
    }

    /**
     * @dev Get a proposal by ID
     * @param proposalId ID of the proposal
     */
    function getProposalById(uint256 proposalId) external view proposalExists(proposalId) returns (Proposal memory) {
        return proposals[proposalId];
    }

    /**
     * @dev Get all proposals
     */
    function getProposals() external view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalCount);
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            allProposals[i - 1] = proposals[i];
        }
        
        return allProposals;
    }

    /**
     * @dev Check if a proposal is active
     * @param proposalId ID of the proposal
     */
    function isProposalActive(uint256 proposalId) external view proposalExists(proposalId) returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.status != ProposalStatus.ACTIVE) {
            return false;
        }
        
        if (block.timestamp < proposal.startTime) {
            return false;
        }
        
        if (block.timestamp > proposal.endTime) {
            return false;
        }
        
        return true;
    }

    /**
     * @dev Assign voting power to an address (admin only)
     * @param voter Address to assign voting power to
     * @param amount Amount of voting power to assign
     */
    function assignVotingPower(address voter, uint256 amount) external onlyAdmin {
        require(voter != address(0), "GovernanceV1: invalid address");
        votingPower[voter] = amount;
    }
}
