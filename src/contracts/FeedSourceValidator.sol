// src/contracts/FeedSourceValidator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title FeedSourceValidator
 * @dev Smart contract for validating and registering trusted feed sources
 * Used by the Tactical Intel Dashboard for source verification
 */
contract FeedSourceValidator {
    address public owner;
    
    // Role-based access control
    mapping(address => bool) public admins;
    mapping(address => bool) public verifiers;
    
    // Verified sources
    mapping(address => bool) public verifiedSources;
    mapping(address => string) public sourceMetadata;
    address[] public sourcesList;
    
    // Events
    event SourceRegistered(address indexed source, address indexed registeredBy);
    event SourceRevoked(address indexed source, address indexed revokedBy);
    event RoleGranted(address indexed account, string role, address indexed grantedBy);
    event RoleRevoked(address indexed account, string role, address indexed revokedBy);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == owner || admins[msg.sender], "Only admin can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(msg.sender == owner || admins[msg.sender] || verifiers[msg.sender], "Only verifier can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
    
    /**
     * @dev Grant admin role to an account
     * @param account The address to grant admin role
     */
    function grantAdmin(address account) external onlyOwner {
        require(!admins[account], "Account is already an admin");
        admins[account] = true;
        emit RoleGranted(account, "admin", msg.sender);
    }
    
    /**
     * @dev Revoke admin role from an account
     * @param account The address to revoke admin role
     */
    function revokeAdmin(address account) external onlyOwner {
        require(admins[account], "Account is not an admin");
        admins[account] = false;
        emit RoleRevoked(account, "admin", msg.sender);
    }
    
    /**
     * @dev Grant verifier role to an account
     * @param account The address to grant verifier role
     */
    function grantVerifier(address account) external onlyAdmin {
        require(!verifiers[account], "Account is already a verifier");
        verifiers[account] = true;
        emit RoleGranted(account, "verifier", msg.sender);
    }
    
    /**
     * @dev Revoke verifier role from an account
     * @param account The address to revoke verifier role
     */
    function revokeVerifier(address account) external onlyAdmin {
        require(verifiers[account], "Account is not a verifier");
        verifiers[account] = false;
        emit RoleRevoked(account, "verifier", msg.sender);
    }
    
    /**
     * @dev Register a new feed source
     * @param source The address of the source to register
     * @param metadata JSON metadata about the source
     */
    function registerSource(address source, string calldata metadata) external onlyVerifier {
        require(!verifiedSources[source], "Source is already verified");
        require(bytes(metadata).length > 0, "Metadata cannot be empty");
        
        verifiedSources[source] = true;
        sourceMetadata[source] = metadata;
        sourcesList.push(source);
        
        emit SourceRegistered(source, msg.sender);
    }
    
    /**
     * @dev Revoke verification from a source
     * @param source The address of the source to revoke
     */
    function revokeSource(address source) external onlyVerifier {
        require(verifiedSources[source], "Source is not verified");
        
        verifiedSources[source] = false;
        
        // Remove from sourcesList
        for (uint i = 0; i < sourcesList.length; i++) {
            if (sourcesList[i] == source) {
                sourcesList[i] = sourcesList[sourcesList.length - 1];
                sourcesList.pop();
                break;
            }
        }
        
        emit SourceRevoked(source, msg.sender);
    }
    
    /**
     * @dev Update metadata for a verified source
     * @param source The address of the verified source
     * @param metadata New metadata for the source
     */
    function updateSourceMetadata(address source, string calldata metadata) external onlyVerifier {
        require(verifiedSources[source], "Source is not verified");
        require(bytes(metadata).length > 0, "Metadata cannot be empty");
        
        sourceMetadata[source] = metadata;
    }
    
    /**
     * @dev Check if a source is verified
     * @param source The address to check
     * @return Whether the source is verified
     */
    function isVerified(address source) external view returns (bool) {
        return verifiedSources[source];
    }
    
    /**
     * @dev Get metadata for a verified source
     * @param source The address of the verified source
     * @return Metadata for the source
     */
    function getSourceMetadata(address source) external view returns (string memory) {
        require(verifiedSources[source], "Source is not verified");
        return sourceMetadata[source];
    }
    
    /**
     * @dev Get the list of all verified sources
     * @return Array of verified source addresses
     */
    function getVerifiedSources() external view returns (address[] memory) {
        return sourcesList;
    }
    
    /**
     * @dev Get the count of verified sources
     * @return Count of verified sources
     */
    function getVerifiedSourcesCount() external view returns (uint256) {
        return sourcesList.length;
    }
}
