# 🌐 Tactical Intel Dashboard
**Starcom Platform Intelligence Exchange Interface**

A cutting-edge Web3-enabled Intelligence Command Console serving as the primary consumer interface for the **Starcom Intelligence Exchange Marketplace**. This decentralized application enables trading of Intel Reports (NFTs), accessing premium intelligence feeds, and participating in the revolutionary blockchain-based intelligence ecosystem.

## 🎯 **Why Web3 for Intelligence? The Business Case**

### **🔒 Trust & Provenance**
- **Blockchain Verification**: Every intelligence report is cryptographically signed and timestamped
- **Source Authentication**: Decentralized verification of intelligence contributors and sources
- **Immutable Audit Trail**: Complete transparency of intelligence lifecycle and modifications

### **💰 Token Economics & Monetization**
- **$INTEL Token**: Utility token enabling access tiers and staking rewards
- **NFT Intel Reports**: Premium intelligence packaged as tradeable digital assets
- **Contributor Incentives**: Direct monetization for intelligence analysts and researchers
- **Revenue Sharing**: Automated royalty distribution through smart contracts

### **🌍 Censorship Resistance & Global Access**
- **IPFS Storage**: Critical intelligence preserved on decentralized storage networks
- **Geographic Freedom**: Access intelligence regardless of location or political restrictions
- **Unstoppable Feeds**: Blockchain-based RSS aggregation immune to centralized censorship

### **🤝 Cross-Platform Intelligence Exchange**
- **Starcom Ecosystem**: Seamless integration with companion intelligence tools
- **Universal Compatibility**: Standardized intelligence formats across platforms
- **Reputation Portability**: Contributor credibility travels across the entire network

## 🚀 **Web3 Intelligence Marketplace Features**

### **Intelligence Marketplace Integration**
- **Intel Reports (NFTs)**: Purchase, trade, and verify exclusive intelligence reports
- **Premium Feed Access**: Token-gated access to verified intelligence sources
- **Data Provenance**: Blockchain-verified source authentication and timestamping
- **Decentralized Storage**: IPFS-backed intelligence archives for censorship resistance

### **Starcom Platform Ecosystem**
- **Cross-platform Intel Trading**: Seamless integration with other Starcom intelligence tools
- **Reputation System**: On-chain verification of intelligence contributor credibility
- **Automated Licensing**: Smart contract-based licensing for intelligence redistribution
- **Decentralized Governance**: DAO-managed platform policies and source verification

## 🚀 Core Functionality

### **Real-time Data Feeds**
- **RSS Aggregation**: Consolidate and display RSS feeds from various intelligence sources
- **Auto-Scroll Interface**: Hands-free, continuous scrolling of intelligence data
- **Keyword Highlighting**: Emphasize critical information based on user-defined keywords

### **Interactive Data Visualization**
- **Dynamic Charts and Graphs**: Visualize intelligence data trends and patterns
- **Geospatial Mapping**: Display intelligence data on interactive maps
- **Customizable Dashboards**: Tailor the dashboard layout and widgets to user preferences

### **User Management and Security**
- **Web3 Wallet Integration**: Secure user authentication and transaction signing
- **Role-based Access Control**: Define user roles and permissions for data access and actions
- **Audit Logs**: Maintain a secure, immutable log of user activities and data access

## 📚 Technical Specifications

### **Frontend**
- **Framework**: React.js with TypeScript for a robust, scalable user interface
- **State Management**: Redux Toolkit for efficient, predictable state management
- **Styling**: Tailwind CSS for responsive, utility-first styling

### **Backend**
- **API Gateway**: Node.js with Express for a flexible, lightweight API layer
- **Database**: MongoDB with Mongoose for a scalable, schema-based data model
- **Authentication**: JSON Web Tokens (JWT) for secure, stateless user authentication

### **Web3 Integration**
- **Ethereum Blockchain**: Smart contracts for Intel Reports and licensing management
- **IPFS**: Decentralized storage for intelligence data and NFTs
- **WalletConnect**: Secure connection to Web3 wallets for user authentication and transactions

## 🚧 Development Setup

### **Prerequisites**
- **Node.js (v18 or higher)**: JavaScript runtime built on Chrome's V8 JavaScript engine
- **npm**: Package manager for Node.js
- **Git**: Version control system

### **Setting up Node.js, npm, and Git on Ubuntu Linux**
1. **Update your package list**:
    ```sh
    sudo apt update
    ```

2. **Install Git**:
    ```sh
    sudo apt install git -y
    ```
    Install Git on your system.

3. **Install Node.js and npm**:
    ```sh
    sudo apt install nodejs npm -y
    ```
    Install Node.js and npm on your system.

4. **Verify the installations**:
    ```sh
    node -v
    npm -v
    git --version
    ```
    Print the installed versions of Node.js, npm, and Git. Ensure Node.js is v18 or higher and npm is installed.

### **Steps**
1. **Clone the repository**:
    ```sh
    git clone https://github.com/jthora/TacticalIntelDashboard.git
    ```
    Create a local copy of the repository on your machine.

2. **Navigate to the project directory**:
    ```sh
    cd TacticalIntelDashboard/IntelCommandConsole
    ```
    Change your current directory to the project directory.

3. **Install the dependencies**:
    ```sh
    npm install
    ```
    Install all the required packages listed in the `package.json` file.

4. **Start the application**:
    ```sh
    npm run dev
    ```
    Start the development server.

5. **Open your browser and go to**:
    ```
    http://localhost:5173
    ```
    Open this URL in your web browser to see the Tactical Intel Dashboard running.

### **Setting up CORS Anywhere Proxy Server**

1. **Clone the CORS Anywhere repository**:
    
    Escape back to the containing folder to clone the proxy server directory
    ```sh
    cd ..
    ```

    ```sh
    git clone https://github.com/Rob--W/cors-anywhere.git
    ```
    Create a local copy of the CORS Anywhere repository on your machine.

2. **Navigate to the CORS Anywhere directory**:
    ```sh
    cd cors-anywhere
    ```
    Change your current directory to the CORS Anywhere directory.

3. **Install the dependencies**:
    ```sh
    npm install
    ```
    Install all the required packages listed in the `package.json` file of the CORS Anywhere project.

4. **Modify `server.js` file with the following content**:
    ```javascript
    // Listen on a specific host via the HOST environment variable
    var host = process.env.HOST || '0.0.0.0';
    // Listen on a specific port via the PORT environment variable
    var port = process.env.PORT || 8081;

    // Grab the blacklist from the command-line so that we can update the blacklist without deploying
    // again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
    // immediate abuse (e.g. denial of service). If you want to block all origins except for some,
    // use originWhitelist instead.
    var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
    var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
    function parseEnvList(env) {
      if (!env) {
        return [];
      }
      return env.split(',');
    }

    // Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
    var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

    var cors_proxy = require('./lib/cors-anywhere');
    cors_proxy.createServer({
      originBlacklist: originBlacklist,
      originWhitelist: originWhitelist,
      requireHeader: ['origin', 'x-requested-with'],
      checkRateLimit: checkRateLimit,
      removeHeaders: [
        'cookie',
        'cookie2',
        // Strip Heroku-specific headers
        'x-request-start',
        'x-request-id',
        'via',
        'connect-time',
        'total-route-time',
      ],
      setHeaders: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept',
      },
      // Add logging for debugging
      handleInitialRequest: function(req, res, location) {
        console.log('Proxying request to: ' + location.href);
        return false; // Continue with the proxy request
      },
      // Handle redirects
      redirectSameOrigin: true,
      httpProxyOptions: {
        followRedirects: true,
      },
    }).listen(port, host, function() {
      console.log('Running CORS Anywhere on ' + host + ':' + port);
    });
    ```
    Open and edit `server.js` in the CORS Anywhere directory and paste the above code into it.

5. **Start the CORS Anywhere server**:
    ```sh
    npm start
    ```
    Start the CORS Anywhere proxy server.

6. **The CORS Anywhere proxy server will be running at**:
    ```
    http://localhost:8081
    ```
    Open this URL in your web browser to verify that the CORS Anywhere proxy server is running.

## 💼 **Web3 Portfolio Showcase**

### **Full-Stack Web3 Development Competencies**
- **🔗 Smart Contract Development**: ERC20 tokens, ERC721 NFTs, governance contracts, and access control
- **⚡ DeFi Integration**: Staking mechanisms, token economics, and automated reward distribution
- **🌐 Frontend Web3 Integration**: ethers.js, wallet connectivity, and real-time blockchain interaction
- **📦 IPFS & Decentralized Storage**: Content addressing, metadata storage, and censorship resistance
- **🏛️ DAO Governance**: Proposal creation, voting mechanisms, and decentralized decision-making
- **🔐 Web3 Security**: Multi-signature patterns, access controls, and vulnerability mitigation

### **Real Business Value Demonstration**
- **💰 Token Economics**: $INTEL utility token with staking rewards and access tier system
- **🎨 NFT Marketplace**: Complete minting, trading, and royalty system for Intel Reports
- **📊 Multi-Chain Support**: Ethereum, Polygon, Arbitrum, and BSC compatibility
- **🔒 Enterprise Security**: Role-based access control and audit trail implementation
- **📈 Scalable Architecture**: Designed for real-world intelligence marketplace operations

### **Technical Innovation**
- **Novel Use Case**: First decentralized intelligence marketplace combining RSS aggregation with Web3
- **Practical Web3**: Real utility beyond speculation - solving actual intelligence industry problems
- **Professional Integration**: Enterprise-ready features with proper error handling and user experience

---

**This project demonstrates complete Web3 development proficiency through a practical, business-focused application that solves real-world problems in the intelligence industry while showcasing cutting-edge blockchain technology integration.**
