#!/bin/bash

# Fix dependencies for Phase 3 TDD implementation
# This script installs missing dependencies and fixes test environment issues

echo "🚀 Starting Phase 3 TDD environment setup..."

# Install missing testing dependencies
echo "📦 Installing missing testing dependencies..."
npm install --save-dev @testing-library/dom @testing-library/user-event

# Update TypeScript configuration for testing
echo "🔧 Updating TypeScript configuration for testing..."

# Create tsconfig.test.json if it doesn't exist
if [ ! -f "tsconfig.test.json" ]; then
  echo '{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "types": ["jest", "node", "@testing-library/jest-dom"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "test/**/*.ts",
    "src/setupTests.ts"
  ]
}' > tsconfig.test.json
  echo "✅ Created tsconfig.test.json"
fi

# Update setupTests.ts
echo "🔧 Updating test setup file..."
if [ -f "src/setupTests.ts" ]; then
  # Check if @testing-library/dom is already imported
  if ! grep -q "@testing-library/dom" src/setupTests.ts; then
    echo '
// Additional testing library imports
import "@testing-library/dom";

// Mock the ethers BrowserProvider
import { BrowserProvider } from "ethers";
jest.mock("ethers", () => {
  const original = jest.requireActual("ethers");
  return {
    ...original,
    BrowserProvider: jest.fn().mockImplementation(() => ({
      getSigner: jest.fn().mockResolvedValue({
        getAddress: jest.fn().mockResolvedValue("0x1234567890123456789012345678901234567890"),
        signMessage: jest.fn().mockResolvedValue("0xsignature"),
      }),
    })),
  };
});
' >> src/setupTests.ts
    echo "✅ Updated setupTests.ts with additional mocks"
  else
    echo "⏩ setupTests.ts already contains required imports"
  fi
else
  echo "⚠️ src/setupTests.ts not found. Make sure this file exists."
fi

# Create missing directories for governance CSS if they don't exist
echo "🔧 Setting up CSS directories..."
mkdir -p src/assets/styles/components
mkdir -p src/assets/styles/pages

# Create governance-page.css if it doesn't exist
if [ ! -f "src/assets/styles/pages/governance-page.css" ]; then
  echo "/* Governance Page Styles */
.governance-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #e6e6e6;
  font-family: 'Roboto Mono', monospace;
}

.governance-header {
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  padding-bottom: 1.5rem;
}

.governance-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #00ffff, #0099ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.governance-header p {
  font-size: 1.1rem;
  color: #a6a6a6;
  max-width: 700px;
  margin: 0 auto;
}

.governance-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.create-proposal-button {
  background: linear-gradient(45deg, #00ccff, #0066ff);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Roboto Mono', monospace;
  box-shadow: 0 0 15px rgba(0, 204, 255, 0.3);
}

.create-proposal-button:hover {
  background: linear-gradient(45deg, #00d8ff, #0077ff);
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 204, 255, 0.5);
}

.create-proposal-button:disabled {
  background: #444;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  color: #999;
}

.back-button {
  background: transparent;
  border: 1px solid rgba(0, 204, 255, 0.5);
  color: #00ccff;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Roboto Mono', monospace;
}

.back-button:hover {
  background: rgba(0, 204, 255, 0.1);
}

.proposals-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.proposal-card {
  background: rgba(10, 20, 30, 0.8);
  border: 1px solid rgba(0, 204, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.proposal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 20px rgba(0, 204, 255, 0.2);
  border-color: rgba(0, 204, 255, 0.4);
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.proposal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #ffffff;
  flex: 1;
  margin-right: 1rem;
}

.status-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
}

.status-pending {
  background: rgba(100, 100, 100, 0.3);
  color: #cccccc;
}

.status-active {
  background: rgba(0, 204, 255, 0.2);
  color: #00ccff;
}

.status-succeeded {
  background: rgba(0, 255, 128, 0.2);
  color: #00ff80;
}

.status-defeated {
  background: rgba(255, 50, 50, 0.2);
  color: #ff5050;
}

.status-executed {
  background: rgba(128, 0, 255, 0.2);
  color: #9966ff;
}

.status-canceled {
  background: rgba(255, 128, 0, 0.2);
  color: #ff8000;
}

.status-expired {
  background: rgba(128, 128, 128, 0.3);
  color: #aaaaaa;
}" > src/assets/styles/pages/governance-page.css
  echo "✅ Created governance-page.css"
fi

# Create proposal-voting-panel.css if it doesn't exist
if [ ! -f "src/assets/styles/components/proposal-voting-panel.css" ]; then
  echo "/* Proposal Voting Panel Styles */
.proposal-voting-panel {
  font-family: 'Roboto Mono', monospace;
  color: #e6e6e6;
}

.proposal-voting-panel .wallet-connect-warning {
  text-align: center;
  padding: 2rem;
  color: #ff9900;
  border: 1px solid rgba(255, 153, 0, 0.3);
  border-radius: 4px;
  background: rgba(255, 153, 0, 0.05);
  margin-bottom: 2rem;
}

.proposal-details {
  margin-bottom: 2rem;
}

.proposal-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.proposal-description {
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: #cccccc;
  border-left: 3px solid rgba(0, 204, 255, 0.5);
  padding-left: 1rem;
  font-style: italic;
}" > src/assets/styles/components/proposal-voting-panel.css
  echo "✅ Created proposal-voting-panel.css"
fi

# Run tests to verify setup
echo "🧪 Running tests to verify setup..."
npm run test

echo "✅ Phase 3 TDD environment setup complete!"
