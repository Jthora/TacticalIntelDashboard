#!/bin/bash

# Vercel Deployment Script for Tactical Intel Dashboard
echo "🚀 Starting Vercel Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "vercel.json" ]; then
    print_error "Must be run from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel@latest
    if [ $? -ne 0 ]; then
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf .vercel/

# Install dependencies
print_status "Installing dependencies..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Run build to verify everything works
print_status "Running production build..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed! Please fix build errors before deployment."
    exit 1
fi

print_success "Build completed successfully!"

# Set environment variables for Vercel
print_status "Setting up environment variables..."

# Check if .env file exists and warn about secrets
if [ -f ".env" ]; then
    print_warning "Found .env file. Remember to set these variables in Vercel dashboard:"
    print_warning "Go to: https://vercel.com/your-project/settings/environment-variables"
    echo ""
    grep "^VITE_" .env | while read line; do
        var_name=$(echo $line | cut -d'=' -f1)
        print_warning "  - $var_name"
    done
    echo ""
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."

# Check if this is first deployment or update
if [ "$1" = "--prod" ] || [ "$1" = "-p" ]; then
    print_status "Deploying to PRODUCTION..."
    vercel --prod
else
    print_status "Deploying to PREVIEW (use --prod for production)..."
    vercel
fi

if [ $? -eq 0 ]; then
    print_success "🎉 Deployment completed successfully!"
    print_status "Your application should be available shortly."
    print_status ""
    print_status "📱 Test the deployment by:"
    print_status "  1. Checking the deployed URL"
    print_status "  2. Testing RSS feed functionality"
    print_status "  3. Verifying the proxy endpoint at /api/proxy-feed"
    print_status ""
    print_status "🔧 If you encounter issues:"
    print_status "  1. Check Vercel function logs"
    print_status "  2. Verify environment variables are set"
    print_status "  3. Ensure all dependencies are properly installed"
else
    print_error "Deployment failed! Check the output above for details."
    exit 1
fi
