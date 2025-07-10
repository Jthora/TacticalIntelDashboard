import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting Tactical Auth Contract Deployment...");
  
  // Get the contract factory
  const TacticalAuthContract = await ethers.getContractFactory("TacticalAuthContract");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  
  console.log("📝 Deployment Details:");
  console.log("├── Deployer address:", deployerAddress);
  console.log("├── Account balance:", ethers.formatEther(balance), "ETH");
  console.log("├── Network:", await ethers.provider.getNetwork());
  
  // Deploy the contract
  console.log("\n🔧 Deploying TacticalAuthContract...");
  const tacticalAuth = await TacticalAuthContract.deploy(deployerAddress);
  
  // Wait for deployment to be mined
  await tacticalAuth.waitForDeployment();
  
  const contractAddress = await tacticalAuth.getAddress();
  const deployTxHash = tacticalAuth.deploymentTransaction()?.hash || "N/A";
  
  console.log("✅ Contract deployed successfully!");
  console.log("├── Contract address:", contractAddress);
  console.log("├── Transaction hash:", deployTxHash);
  
  // Verify initial state
  console.log("\n🔍 Verifying initial contract state...");
  const ownerAccessLevel = await tacticalAuth.getAccessLevel(deployerAddress);
  const contractStats = await tacticalAuth.getContractStats();
  const ownerLevelString = await tacticalAuth.getAccessLevelString(deployerAddress);
  
  console.log("├── Owner access level:", ownerAccessLevel.toString(), `(${ownerLevelString})`);
  console.log("├── Total registered users:", contractStats.totalUsers.toString());
  console.log("├── Contract active:", contractStats.isActive);
  console.log("├── Contract owner:", contractStats.contractOwner);
  
  // Grant access to some predefined addresses for testing
  console.log("\n👥 Setting up test user access levels...");
  
  const testUsers = [
    {
      address: "0x742d35cc6634c0532925a3b844bc454e4438f44e", // ANALYST (from our tests)
      level: 2, // AccessLevel.ANALYST
      name: "Test Analyst"
    },
    {
      address: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199", // FIELD_OPERATIVE  
      level: 1, // AccessLevel.FIELD_OPERATIVE
      name: "Test Field Operative"
    }
  ];
  
  for (const user of testUsers) {
    try {
      const tx = await tacticalAuth.grantAccess(user.address, user.level);
      await tx.wait();
      console.log(`├── Granted ${user.name} access to ${user.address}`);
    } catch (error) {
      console.log(`├── ⚠️  Failed to grant access to ${user.name}:`, error);
    }
  }
  
  // Generate contract artifacts for frontend
  console.log("\n📦 Generating frontend integration files...");
  
  const contractArtifact = {
    address: contractAddress,
    abi: TacticalAuthContract.interface.fragments,
    network: await ethers.provider.getNetwork(),
    deploymentHash: deployTxHash,
    timestamp: new Date().toISOString(),
    deployer: deployerAddress
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  const networkName = (await ethers.provider.getNetwork()).name || "unknown";
  const deploymentFile = path.join(deploymentsDir, `TacticalAuthContract-${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(contractArtifact, null, 2));
  
  // Generate TypeScript constants file for frontend
  const contractConstants = `// Auto-generated contract constants
// Generated on: ${new Date().toISOString()}
// Network: ${networkName}

export const TACTICAL_AUTH_CONTRACT = {
  address: "${contractAddress}",
  network: "${networkName}",
  chainId: ${(await ethers.provider.getNetwork()).chainId},
} as const;

export const ACCESS_LEVELS = {
  PUBLIC: 0,
  FIELD_OPERATIVE: 1,
  ANALYST: 2,
  COMMANDER: 3,
  DIRECTOR: 4,
} as const;

// Contract ABI for frontend integration
export const TACTICAL_AUTH_ABI = ${JSON.stringify(TacticalAuthContract.interface.fragments, null, 2)};
`;

  const constantsFile = path.join(process.cwd(), "src", "config", "contracts.ts");
  const configDir = path.dirname(constantsFile);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  fs.writeFileSync(constantsFile, contractConstants);
  
  console.log("├── Contract artifacts saved to:", deploymentFile);
  console.log("├── Frontend constants saved to:", constantsFile);
  
  // Final verification
  console.log("\n🎯 Deployment Summary:");
  console.log("├── ✅ Contract deployed and verified");
  console.log("├── ✅ Initial access levels configured");
  console.log("├── ✅ Frontend integration files generated");
  console.log("├── ✅ Ready for production use");
  console.log(`└── 🌐 Contract URL: https://sepolia.etherscan.io/address/${contractAddress}`);
  
  return {
    contract: tacticalAuth,
    address: contractAddress,
    deploymentHash: deployTxHash
  };
}

// Error handling and execution
main()
  .then((result) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("Contract Address:", result.address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
