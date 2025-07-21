// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@tw3/solidity/contracts/wttp/TW3Site.sol";

/**
 * @title TacticalIntelSite
 * @dev WTTP site contract for Tactical Intel Dashboard
 * @notice This contract enables the Tactical Intel Dashboard to be hosted on WTTP
 */
contract TacticalIntelSite is TW3Site {
    
    // Site metadata
    string public constant VERSION = "1.0.0";
    string public constant SITE_TYPE = "Intelligence Dashboard";
    
    // Access control for content management
    mapping(address => bool) public contentManagers;
    
    // Events
    event ContentManagerAdded(address indexed manager);
    event ContentManagerRemoved(address indexed manager);
    event ContentUpdated(string indexed path, address indexed publisher);
    
    /**
     * @dev Constructor for TacticalIntelSite
     * @param _name Site name
     * @param _description Site description 
     * @param _tags Site tags for discovery
     */
    constructor(
        string memory _name, 
        string memory _description, 
        string memory _tags
    ) TW3Site(_name, _description, _tags) {
        // Grant deployer content management permissions
        contentManagers[msg.sender] = true;
        emit ContentManagerAdded(msg.sender);
    }
    
    /**
     * @dev Add a content manager
     * @param manager Address to grant content management permissions
     */
    function addContentManager(address manager) external {
        require(_isSiteAdmin(msg.sender), "Only site admin can add content managers");
        require(manager != address(0), "Invalid manager address");
        require(!contentManagers[manager], "Already a content manager");
        
        contentManagers[manager] = true;
        emit ContentManagerAdded(manager);
    }
    
    /**
     * @dev Remove a content manager
     * @param manager Address to revoke content management permissions
     */
    function removeContentManager(address manager) external {
        require(_isSiteAdmin(msg.sender), "Only site admin can remove content managers");
        require(contentManagers[manager], "Not a content manager");
        
        contentManagers[manager] = false;
        emit ContentManagerRemoved(manager);
    }
    
    /**
     * @dev Check if address is a content manager
     * @param manager Address to check
     * @return bool True if address is a content manager
     */
    function isContentManager(address manager) external view returns (bool) {
        return contentManagers[manager];
    }
    
    /**
     * @dev Get site information
     * @return siteName The name of the site
     * @return siteDescription The description of the site  
     * @return siteTags The tags of the site
     * @return version The version of the site
     * @return siteType The type of the site
     */
    function getSiteInfo() external view returns (
        string memory siteName,
        string memory siteDescription,
        string memory siteTags,
        string memory version,
        string memory siteType
    ) {
        return (
            name,
            description,
            tags,
            VERSION,
            SITE_TYPE
        );
    }
}
