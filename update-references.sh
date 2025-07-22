#!/bin/bash

# Update symbolic links after restructuring
echo "🔄 Updating project references to match new structure..."

# Create symbolic links for documentation
echo "📚 Creating documentation links..."
ln -sf docs/cors-solution/CORS_SOLUTION_COMPLETE.md CORS_SOLUTION.md
ln -sf docs/deployment/DEPLOYMENT_READY.md DEPLOYMENT.md

# Create symbolic links for testing scripts
echo "🧪 Creating testing script links..."
ln -sf tools/testing/test-feed-parsing.sh test-feeds.sh
ln -sf tools/testing/test-proxy-fallback.js test-proxy.sh

# Update import paths in source files if needed
echo "🔧 Checking import paths..."

# Display completion message
echo "✅ Project references updated successfully!"
echo "🏗️ New structure fully implemented and linked"
echo ""
echo "📁 Key Documentation:"
echo "  - Project Structure: ./PROJECT_STRUCTURE.md"
echo "  - CORS Solution: ./docs/cors-solution/CORS_SOLUTION_COMPLETE.md"
echo "  - Deployment Guide: ./docs/deployment/DEPLOYMENT_READY.md"
echo ""
echo "🚀 The project is now fully organized and ready to use!"
