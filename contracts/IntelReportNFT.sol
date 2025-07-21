// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
 * @title IntelReportNFT
 * @dev NFT contract for intelligence reports in the Starcom marketplace
 * @notice Represents verified intelligence reports as tradeable NFTs
 */
contract IntelReportNFT is ERC721, ERC721URIStorage, ERC721Royalty, Ownable, ReentrancyGuard {
    
    // Rarity levels for intel reports
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }
    
    // Classification levels
    enum Classification { PUBLIC, CONFIDENTIAL, SECRET, TOP_SECRET }
    
    struct IntelReport {
        uint256 id;
        address creator;
        string title;
        string ipfsHash;
        Rarity rarity;
        Classification classification;
        uint256 createdAt;
        uint256 price;
        bool forSale;
        string[] tags;
        uint256 views;
        uint256 tradingVolume;
    }
    
    // State variables
    uint256 private _tokenIdCounter;
    IERC20 public intelToken;
    
    mapping(uint256 => IntelReport) public intelReports;
    mapping(address => uint256[]) public creatorReports;
    mapping(address => bool) public verifiedCreators;
    mapping(string => bool) public usedIPFSHashes;
    
    // Marketplace variables
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant MAX_ROYALTY = 1000; // 10%
    address public feeRecipient;
    
    // Events
    event IntelReportMinted(uint256 indexed tokenId, address indexed creator, string title, Rarity rarity);
    event IntelReportListed(uint256 indexed tokenId, uint256 price);
    event IntelReportSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event CreatorVerified(address indexed creator);
    event ReportViewed(uint256 indexed tokenId, address indexed viewer);
    
    constructor(
        address initialOwner,
        address _intelToken
    ) ERC721("Starcom Intel Reports", "INTEL-RPT") Ownable(initialOwner) {
        intelToken = IERC20(_intelToken);
        feeRecipient = initialOwner;
        _tokenIdCounter = 1;
    }
    
    /**
     * @dev Mint a new intelligence report NFT
     * @param title Title of the intelligence report
     * @param ipfsHash IPFS hash containing the report data
     * @param rarity Rarity level of the report
     * @param classification Security classification level
     * @param price Price in INTEL tokens (0 if not for sale)
     * @param tags Array of tags for categorization
     * @param royaltyFee Royalty fee for creator (basis points, max 1000 = 10%)
     */
    function mintIntelReport(
        string memory title,
        string memory ipfsHash,
        Rarity rarity,
        Classification classification,
        uint256 price,
        string[] memory tags,
        uint96 royaltyFee
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!usedIPFSHashes[ipfsHash], "IPFS hash already used");
        require(royaltyFee <= MAX_ROYALTY, "Royalty fee too high");
        require(tags.length <= 10, "Too many tags");
        
        uint256 tokenId = _tokenIdCounter++;
        
        // Create the intel report struct
        intelReports[tokenId] = IntelReport({
            id: tokenId,
            creator: msg.sender,
            title: title,
            ipfsHash: ipfsHash,
            rarity: rarity,
            classification: classification,
            createdAt: block.timestamp,
            price: price,
            forSale: price > 0,
            tags: tags,
            views: 0,
            tradingVolume: 0
        });
        
        // Track creator reports
        creatorReports[msg.sender].push(tokenId);
        usedIPFSHashes[ipfsHash] = true;
        
        // Mint the NFT
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, ipfsHash);
        
        // Set royalty for the creator
        _setTokenRoyalty(tokenId, msg.sender, royaltyFee);
        
        emit IntelReportMinted(tokenId, msg.sender, title, rarity);
        
        if (price > 0) {
            emit IntelReportListed(tokenId, price);
        }
        
        return tokenId;
    }
    
    /**
     * @dev Purchase an intel report using INTEL tokens
     * @param tokenId ID of the report to purchase
     */
    function purchaseIntelReport(uint256 tokenId) external nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Report does not exist");
        
        IntelReport storage report = intelReports[tokenId];
        require(report.forSale, "Report not for sale");
        require(report.price > 0, "Invalid price");
        
        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy your own report");
        
        uint256 price = report.price;
        
        // Calculate fees
        uint256 platformFeeAmount = (price * platformFee) / 10000;
        uint256 sellerAmount = price - platformFeeAmount;
        
        // Transfer INTEL tokens
        require(
            intelToken.transferFrom(msg.sender, feeRecipient, platformFeeAmount),
            "Platform fee transfer failed"
        );
        require(
            intelToken.transferFrom(msg.sender, seller, sellerAmount),
            "Payment transfer failed"
        );
        
        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Update report data
        report.forSale = false;
        report.price = 0;
        report.tradingVolume += price;
        
        emit IntelReportSold(tokenId, seller, msg.sender, price);
    }
    
    /**
     * @dev List an intel report for sale
     * @param tokenId ID of the report to list
     * @param price Price in INTEL tokens
     */
    function listIntelReport(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        
        IntelReport storage report = intelReports[tokenId];
        report.forSale = true;
        report.price = price;
        
        emit IntelReportListed(tokenId, price);
    }
    
    /**
     * @dev Remove an intel report from sale
     * @param tokenId ID of the report to unlist
     */
    function unlistIntelReport(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        IntelReport storage report = intelReports[tokenId];
        report.forSale = false;
        report.price = 0;
        
        emit IntelReportListed(tokenId, 0);
    }
    
    /**
     * @dev Record a view of an intel report
     * @param tokenId ID of the report being viewed
     */
    function viewIntelReport(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Report does not exist");
        
        intelReports[tokenId].views++;
        emit ReportViewed(tokenId, msg.sender);
    }
    
    /**
     * @dev Verify a creator (owner only)
     * @param creator Address to verify
     */
    function verifyCreator(address creator) external onlyOwner {
        verifiedCreators[creator] = true;
        emit CreatorVerified(creator);
    }
    
    /**
     * @dev Get reports created by an address
     * @param creator Creator address
     * @return Array of token IDs
     */
    function getCreatorReports(address creator) external view returns (uint256[] memory) {
        return creatorReports[creator];
    }
    
    /**
     * @dev Get all reports for sale
     * @return tokenIds Array of token IDs for sale
     * @return prices Array of corresponding prices
     */
    function getReportsForSale() external view returns (uint256[] memory tokenIds, uint256[] memory prices) {
        uint256 count = 0;
        
        // Count reports for sale
        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) != address(0) && intelReports[i].forSale) {
                count++;
            }
        }
        
        // Create arrays
        tokenIds = new uint256[](count);
        prices = new uint256[](count);
        
        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) != address(0) && intelReports[i].forSale) {
                tokenIds[index] = i;
                prices[index] = intelReports[i].price;
                index++;
            }
        }
    }
    
    /**
     * @dev Update platform fee (owner only)
     * @param newFee New fee in basis points (max 1000 = 10%)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high");
        platformFee = newFee;
    }
    
    /**
     * @dev Update fee recipient (owner only)
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }
    
    // Override functions for inheritance resolution
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
