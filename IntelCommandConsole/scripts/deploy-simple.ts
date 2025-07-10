import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting Simple Tactical Auth Contract Deployment...");
  
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
  
  console.log("\n🎯 Deployment Summary:");
  console.log("├── ✅ Contract deployed and verified");
  console.log("├── ✅ Initial state configured");
  console.log("├── ✅ Ready for frontend integration");
  console.log(`└── 📋 Contract Address: ${contractAddress}`);
  
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
