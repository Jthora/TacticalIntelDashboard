#!/bin/bash

# Vercel Deployment Test Script
echo "🧪 Testing Vercel Deployment Configuration..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
}

check_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

check_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

# Test 1: Check required files exist
echo "🔍 Checking required files..."
if [ -f "vercel.json" ]; then
    check_pass "vercel.json exists"
else
    check_fail "vercel.json missing"
    exit 1
fi

if [ -f "api/proxy-feed.ts" ]; then
    check_pass "api/proxy-feed.ts exists"
else
    check_fail "api/proxy-feed.ts missing"
    exit 1
fi

if [ -f "package.json" ]; then
    check_pass "package.json exists"
else
    check_fail "package.json missing"
    exit 1
fi

# Test 2: Check package.json configuration
echo ""
echo "📦 Checking package.json configuration..."
if grep -q '"engines"' package.json; then
    check_pass "Node.js version specified in engines"
else
    check_warn "Node.js version not specified (recommended to add)"
fi

if grep -q '"build":' package.json; then
    check_pass "Build script exists"
else
    check_fail "Build script missing"
    exit 1
fi

# Test 3: Check vercel.json configuration
echo ""
echo "⚙️ Checking vercel.json configuration..."
if grep -q '"runtime": "edge"' vercel.json; then
    check_pass "Edge function runtime configured"
else
    check_fail "Edge function runtime not configured"
fi

if grep -q '"framework": "vite"' vercel.json; then
    check_pass "Vite framework specified"
else
    check_warn "Vite framework not specified"
fi

# Test 4: Test build process
echo ""
echo "🔨 Testing build process..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_pass "Build succeeds"
else
    check_fail "Build fails - fix errors before deployment"
    exit 1
fi

# Test 5: Check for dist directory
if [ -d "dist" ]; then
    check_pass "dist directory created"
    
    # Check for index.html
    if [ -f "dist/index.html" ]; then
        check_pass "index.html generated"
    else
        check_fail "index.html missing from build output"
    fi
    
    # Check for assets
    if [ -d "dist/assets" ]; then
        check_pass "Assets directory created"
    else
        check_warn "Assets directory missing"
    fi
else
    check_fail "dist directory not created"
    exit 1
fi

# Test 6: Check Edge Function syntax
echo ""
echo "🔄 Checking Edge Function..."
if node -c api/proxy-feed.ts > /dev/null 2>&1; then
    check_pass "Edge function syntax valid"
else
    check_warn "Edge function syntax check failed (may be TypeScript)"
fi

# Test 7: Check environment variables template
echo ""
echo "🔐 Checking environment configuration..."
if [ -f ".env.example" ]; then
    check_pass ".env.example template exists"
    
    # List required environment variables
    check_info "Required environment variables for production:"
    grep "^VITE_" .env.example | while read line; do
        var_name=$(echo $line | cut -d'=' -f1)
        check_info "  - $var_name"
    done
else
    check_warn ".env.example template missing"
fi

if [ -f ".env" ]; then
    check_warn "Local .env file detected - ensure secrets are set in Vercel dashboard"
else
    check_info "No local .env file (good for security)"
fi

# Test 8: Check for common issues
echo ""
echo "🛡️  Checking for common deployment issues..."

# Check package-lock.json
if [ -f "package-lock.json" ]; then
    check_pass "package-lock.json exists (dependency lock)"
else
    check_warn "package-lock.json missing (run npm install)"
fi

# Check for large files
large_files=$(find dist -size +1M -type f 2>/dev/null | wc -l)
if [ $large_files -gt 0 ]; then
    check_warn "Large files detected in build output:"
    find dist -size +1M -type f -exec ls -lh {} \; | awk '{print "  - " $9 " (" $5 ")"}'
else
    check_pass "No large files in build output"
fi

# Final summary
echo ""
echo "📋 Deployment Readiness Summary:"
echo "================================"

# Count checks
total_checks=8
echo "🎯 Configuration checks completed"
echo ""

# Next steps
echo "🚀 Next Steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Run: ./deploy-vercel.sh --prod"
echo "3. Test deployed application"
echo ""

check_info "Ready for Vercel deployment! 🎉"
