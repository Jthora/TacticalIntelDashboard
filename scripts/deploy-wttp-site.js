const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying Tactical Intel Site to WTTP...");
    
    // Get the contract factory
    const TacticalIntelSite = await ethers.getContractFactory("TacticalIntelSite");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const balance = await ethers.provider.getBalance(deployerAddress);
    
    console.log("📝 Deployment Details:");
    console.log("├── Deployer address:", deployerAddress);
    console.log("├── Account balance:", ethers.formatEther(balance), "ETH");
    console.log("├── Network:", (await ethers.provider.getNetwork()).name);
    
    // Check balance
    if (balance === 0n) {
        console.log("❌ Insufficient balance for deployment");
        console.log("💡 Get testnet ETH from:");
        console.log("   - https://sepoliafaucet.com/");
        console.log("   - https://faucets.chain.link/sepolia");
        process.exit(1);
    }
    
    // Site configuration
    const siteConfig = {
        name: "Tactical Intel Dashboard",
        description: "Advanced Intelligence Analysis and Monitoring Platform for Web3",
        tags: "intelligence,tactical,analysis,monitoring,web3,blockchain,security"
    };
    
    console.log("\n🏗️ Site Configuration:");
    console.log("├── Name:", siteConfig.name);
    console.log("├── Description:", siteConfig.description);
    console.log("├── Tags:", siteConfig.tags);
    
    // Deploy the contract
    console.log("\n🔧 Deploying TacticalIntelSite contract...");
    
    try {
        const tacticalSite = await TacticalIntelSite.deploy(
            siteConfig.name,
            siteConfig.description,
            siteConfig.tags
        );
        
        // Wait for deployment to be mined
        console.log("⏳ Waiting for deployment transaction to be mined...");
        await tacticalSite.waitForDeployment();
        
        const contractAddress = await tacticalSite.getAddress();
        const deployTxHash = tacticalSite.deploymentTransaction()?.hash || "N/A";
        
        console.log("✅ Contract deployed successfully!");
        console.log("├── Contract address:", contractAddress);
        console.log("├── Transaction hash:", deployTxHash);
        
        // Verify initial state
        console.log("\n🔍 Verifying contract state...");
        const siteInfo = await tacticalSite.getSiteInfo();
        
        console.log("├── Site name:", siteInfo.siteName);
        console.log("├── Site description:", siteInfo.siteDescription);
        console.log("├── Site tags:", siteInfo.siteTags);
        console.log("├── Version:", siteInfo.version);
        console.log("├── Site type:", siteInfo.siteType);
        console.log("├── Owner:", siteInfo.owner);
        
        // Check content manager permissions
        const isManager = await tacticalSite.isContentManager(deployerAddress);
        console.log("├── Deployer is content manager:", isManager);
        
        console.log("\n🎯 Deployment Summary:");
        console.log("├── ✅ TacticalIntelSite contract deployed");
        console.log("├── ✅ Site metadata configured");
        console.log("├── ✅ Content management permissions set");
        console.log("├── ✅ Ready for content deployment");
        
        console.log("\n📋 Next Steps:");
        console.log("1. Update WTTP_SITE_ADDRESS in .env file");
        console.log("2. Run: npm run wttp:deploy-content");
        console.log("3. Test deployment: npm run wttp:test");
        
        console.log("\n🔧 Environment Variable:");
        console.log(`WTTP_SITE_ADDRESS=${contractAddress}`);
        
        // Save deployment info to file
        const deploymentInfo = {
            contractAddress,
            deploymentHash: deployTxHash,
            network: (await ethers.provider.getNetwork()).name,
            chainId: (await ethers.provider.getNetwork()).chainId,
            deployer: deployerAddress,
            timestamp: new Date().toISOString(),
            siteConfig
        };
        
        const fs = require('fs');
        const path = require('path');
        
        // Create wttp directory if it doesn't exist
        const wttpDir = path.join(__dirname, '..', 'wttp-deployments');
        if (!fs.existsSync(wttpDir)) {
            fs.mkdirSync(wttpDir, { recursive: true });
        }
        
        // Save deployment info
        const deploymentFile = path.join(wttpDir, `tactical-intel-site-${Date.now()}.json`);
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);
        
        return {
            address: contractAddress,
            network: (await ethers.provider.getNetwork()).name,
            chainId: (await ethers.provider.getNetwork()).chainId
        };
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Solutions:");
            console.log("1. Get testnet ETH from faucets");
            console.log("2. Check network configuration");
            console.log("3. Verify private key is correct");
        }
        
        throw error;
    }
}

// Error handling and execution
main()
    .then((result) => {
        console.log("\n🎉 WTTP Site deployment completed successfully!");
        console.log("Site Address:", result.address);
        console.log("Network:", result.network);
        console.log("Chain ID:", result.chainId);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ WTTP Site deployment failed:");
        console.error(error.message || error);
        process.exit(1);
    });
