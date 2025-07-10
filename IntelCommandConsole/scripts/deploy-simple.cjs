const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Simple Tactical Auth Contract Deployment...");
  
  // Get the contract factory
  const TacticalAuthContract = await ethers.getContractFactory("TacticalAuthContract");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  const network = await ethers.provider.getNetwork();
  
  console.log("📝 Deployment Details:");
  console.log("├── Deployer address:", deployerAddress);
  console.log("├── Account balance:", ethers.formatEther(balance), "ETH");
  console.log("├── Network:", network.name, "| Chain ID:", network.chainId.toString());
  
  if (parseFloat(ethers.formatEther(balance)) < 0.01) {
    console.log("⚠️  WARNING: Low balance detected!");
    console.log("   Please fund your wallet with Sepolia ETH from a faucet:");
    console.log("   - https://sepoliafaucet.com/");
    console.log("   - https://faucets.chain.link/sepolia");
    
    if (parseFloat(ethers.formatEther(balance)) === 0) {
      console.log("❌ Cannot deploy with zero balance. Please fund your wallet first.");
      process.exit(1);
    }
  }
  
  // Deploy the contract
  console.log("\n🔧 Deploying TacticalAuthContract...");
  try {
    const tacticalAuth = await TacticalAuthContract.deploy(deployerAddress);
    
    // Wait for deployment to be mined
    console.log("⏳ Waiting for deployment transaction to be mined...");
    await tacticalAuth.waitForDeployment();
    
    const contractAddress = await tacticalAuth.getAddress();
    const deployTxHash = tacticalAuth.deploymentTransaction()?.hash || "N/A";
    
    console.log("✅ Contract deployed successfully!");
    console.log("├── Contract address:", contractAddress);
    console.log("├── Transaction hash:", deployTxHash);
    console.log("├── Etherscan URL:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("├── TX URL:", `https://sepolia.etherscan.io/tx/${deployTxHash}`);
    
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
    
    // Generate frontend config update
    console.log("\n📄 Frontend Config Update:");
    console.log("Add this to your .env file:");
    console.log(`VITE_TACTICAL_AUTH_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`VITE_TACTICAL_AUTH_NETWORK=sepolia`);
    
    return {
      contract: tacticalAuth,
      address: contractAddress,
      deploymentHash: deployTxHash,
      network: network.name,
      chainId: network.chainId.toString()
    };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Fund your wallet with Sepolia ETH");
      console.log("   Address to fund:", deployerAddress);
      console.log("   Faucets:");
      console.log("   - https://sepoliafaucet.com/");
      console.log("   - https://faucets.chain.link/sepolia");
    }
    
    throw error;
  }
}

// Error handling and execution
main()
  .then((result) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("Contract Address:", result.address);
    console.log("Network:", result.network);
    console.log("Chain ID:", result.chainId);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error.message || error);
    process.exit(1);
  });
