// Auto-generated contract constants - Test Deployment
// Generated on: 2025-07-10T11:15:00.000Z
// Network: hardhat (for development)

export const TACTICAL_AUTH_CONTRACT = {
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  network: "hardhat",
  chainId: 1337,
} as const;

export const ACCESS_LEVELS = {
  PUBLIC: 0,
  FIELD_OPERATIVE: 1,
  ANALYST: 2,
  COMMANDER: 3,
  DIRECTOR: 4,
} as const;

// Contract ABI for frontend integration
// This will be populated when we deploy to a real testnet
export const TACTICAL_AUTH_ABI = [
  // Basic functions for access level management
  "function getAccessLevel(address user) external view returns (uint8)",
  "function getAccessLevelString(address user) external view returns (string memory)",
  "function grantAccess(address user, uint8 level) external",
  "function revokeAccess(address user) external",
  "function getContractStats() external view returns (tuple(uint256 totalUsers, bool isActive, address contractOwner))",
  
  // Events
  "event AccessLevelGranted(address indexed user, uint8 level)",
  "event AccessLevelRevoked(address indexed user)",
  "event ContractInitialized(address indexed owner)"
] as const;
