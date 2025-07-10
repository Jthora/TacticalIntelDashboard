// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TacticalAuthContract
 * @dev Smart contract for managing access levels in the Tactical Intel Dashboard
 * @notice This contract handles role-based authentication and access control
 */
contract TacticalAuthContract is Ownable, ReentrancyGuard {
    
    // Access levels matching the frontend enum
    enum AccessLevel {
        PUBLIC,           // 0
        FIELD_OPERATIVE,  // 1
        ANALYST,          // 2
        COMMANDER,        // 3
        DIRECTOR          // 4
    }
    
    // Events for frontend listening
    event AccessLevelGranted(address indexed user, AccessLevel level);
    event AccessLevelRevoked(address indexed user);
    event ContractInitialized(address indexed owner);
    
    // Mapping of addresses to access levels
    mapping(address => AccessLevel) private userAccessLevels;
    mapping(address => bool) private registeredUsers;
    
    // Contract state
    uint256 public totalRegisteredUsers;
    bool public contractActive;
    
    /**
     * @dev Contract constructor
     * @param initialOwner The address that will own the contract
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        contractActive = true;
        
        // Grant DIRECTOR level to contract owner
        userAccessLevels[initialOwner] = AccessLevel.DIRECTOR;
        registeredUsers[initialOwner] = true;
        totalRegisteredUsers = 1;
        
        emit ContractInitialized(initialOwner);
        emit AccessLevelGranted(initialOwner, AccessLevel.DIRECTOR);
    }
    
    /**
     * @dev Get access level for a specific address
     * @param user The address to check
     * @return The access level of the user
     */
    function getAccessLevel(address user) external view returns (AccessLevel) {
        if (!registeredUsers[user]) {
            return AccessLevel.PUBLIC;
        }
        return userAccessLevels[user];
    }
    
    /**
     * @dev Check if a user is registered
     * @param user The address to check
     * @return True if user is registered
     */
    function isRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }
    
    /**
     * @dev Grant access level to a user (only owner)
     * @param user The address to grant access to
     * @param level The access level to grant
     */
    function grantAccess(address user, AccessLevel level) external onlyOwner {
        require(contractActive, "Contract is not active");
        require(user != address(0), "Invalid address");
        require(level <= AccessLevel.DIRECTOR, "Invalid access level");
        
        bool wasRegistered = registeredUsers[user];
        
        userAccessLevels[user] = level;
        registeredUsers[user] = true;
        
        if (!wasRegistered) {
            totalRegisteredUsers++;
        }
        
        emit AccessLevelGranted(user, level);
    }
    
    /**
     * @dev Revoke access for a user (only owner)
     * @param user The address to revoke access from
     */
    function revokeAccess(address user) external onlyOwner {
        require(contractActive, "Contract is not active");
        require(user != address(0), "Invalid address");
        require(user != owner(), "Cannot revoke owner access");
        require(registeredUsers[user], "User not registered");
        
        userAccessLevels[user] = AccessLevel.PUBLIC;
        registeredUsers[user] = false;
        totalRegisteredUsers--;
        
        emit AccessLevelRevoked(user);
    }
    
    /**
     * @dev Batch grant access to multiple users (gas optimized)
     * @param users Array of addresses
     * @param levels Array of access levels
     */
    function batchGrantAccess(
        address[] calldata users, 
        AccessLevel[] calldata levels
    ) external onlyOwner {
        require(contractActive, "Contract is not active");
        require(users.length == levels.length, "Arrays length mismatch");
        require(users.length <= 50, "Batch too large"); // Gas limit protection
        
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            AccessLevel level = levels[i];
            
            require(user != address(0), "Invalid address in batch");
            require(level <= AccessLevel.DIRECTOR, "Invalid access level in batch");
            
            bool wasRegistered = registeredUsers[user];
            
            userAccessLevels[user] = level;
            registeredUsers[user] = true;
            
            if (!wasRegistered) {
                totalRegisteredUsers++;
            }
            
            emit AccessLevelGranted(user, level);
        }
    }
    
    /**
     * @dev Get contract statistics
     * @return totalUsers Total registered users
     * @return isActive Contract active status
     * @return contractOwner Owner address
     */
    function getContractStats() external view returns (
        uint256 totalUsers,
        bool isActive,
        address contractOwner
    ) {
        return (totalRegisteredUsers, contractActive, owner());
    }
    
    /**
     * @dev Toggle contract active status (emergency function)
     * @param active New active status
     */
    function setContractActive(bool active) external onlyOwner {
        contractActive = active;
    }
    
    /**
     * @dev Emergency function to pause contract
     */
    function emergencyPause() external onlyOwner {
        contractActive = false;
    }
    
    /**
     * @dev Get access level as string for easier frontend integration
     * @param user The address to check
     * @return Access level as string
     */
    function getAccessLevelString(address user) external view returns (string memory) {
        AccessLevel level = registeredUsers[user] ? userAccessLevels[user] : AccessLevel.PUBLIC;
        
        if (level == AccessLevel.DIRECTOR) return "DIRECTOR";
        if (level == AccessLevel.COMMANDER) return "COMMANDER";
        if (level == AccessLevel.ANALYST) return "ANALYST";
        if (level == AccessLevel.FIELD_OPERATIVE) return "FIELD_OPERATIVE";
        return "PUBLIC";
    }
}
