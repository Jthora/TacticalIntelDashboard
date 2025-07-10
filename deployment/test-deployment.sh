#!/bin/bash

# Comprehensive RSS Proxy Deployment Test Script
# Tests all deployment options and validates functionality

echo "🧪 RSS Proxy Deployment Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test URLs
TEST_FEEDS=(
  "https://feeds.bbci.co.uk/news/rss.xml"
  "https://rss.cnn.com/rss/edition.rss"
  "https://feeds.reuters.com/reuters/topNews"
  "https://feeds.npr.org/1001/rss.xml"
)

# Function to test a proxy endpoint
test_proxy() {
  local proxy_url=$1
  local test_name=$2
  
  echo -e "\n${YELLOW}Testing: $test_name${NC}"
  echo "URL: $proxy_url"
  
  # Test health endpoint
  echo -n "  Health check: "
  if curl -s --max-time 5 "$proxy_url/health" > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
  else
    echo -e "${RED}✗ FAILED${NC}"
    return 1
  fi
  
  # Test CORS headers
  echo -n "  CORS headers: "
  cors_headers=$(curl -s -I --max-time 5 \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS "$proxy_url" | grep -i "access-control")
  
  if [[ -n "$cors_headers" ]]; then
    echo -e "${GREEN}✓ OK${NC}"
  else
    echo -e "${RED}✗ FAILED${NC}"
    return 1
  fi
  
  # Test RSS proxy functionality
  echo -n "  RSS proxy: "
  local test_url="${TEST_FEEDS[0]}"
  local encoded_url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$test_url'))")
  
  if curl -s --max-time 10 "$proxy_url?url=$encoded_url" | grep -q "<?xml\|<rss\|<feed"; then
    echo -e "${GREEN}✓ OK${NC}"
  else
    echo -e "${RED}✗ FAILED${NC}"
    return 1
  fi
  
  echo -e "  ${GREEN}All tests passed!${NC}"
  return 0
}

# Test local development server
test_local() {
  echo -e "\n${YELLOW}Testing Local Development Server${NC}"
  
  # Check if server is running
  if ! curl -s --max-time 2 "http://localhost:3001/health" > /dev/null; then
    echo "  Starting local server..."
    node standalone-proxy-server.js &
    SERVER_PID=$!
    sleep 3
  fi
  
  if test_proxy "http://localhost:3001" "Local Server"; then
    echo -e "  ${GREEN}Local server is working!${NC}"
  else
    echo -e "  ${RED}Local server failed tests${NC}"
  fi
  
  # Clean up
  if [[ -n "$SERVER_PID" ]]; then
    kill $SERVER_PID 2>/dev/null
  fi
}

# Test Docker deployment
test_docker() {
  echo -e "\n${YELLOW}Testing Docker Deployment${NC}"
  
  # Build Docker image
  echo "  Building Docker image..."
  if docker build -t rss-proxy-test . &>/dev/null; then
    echo -e "  ${GREEN}✓ Docker build successful${NC}"
  else
    echo -e "  ${RED}✗ Docker build failed${NC}"
    return 1
  fi
  
  # Run Docker container
  echo "  Starting Docker container..."
  docker run -d -p 3002:3001 --name rss-proxy-test rss-proxy-test
  sleep 5
  
  if test_proxy "http://localhost:3002" "Docker Container"; then
    echo -e "  ${GREEN}Docker deployment is working!${NC}"
  else
    echo -e "  ${RED}Docker deployment failed tests${NC}"
  fi
  
  # Clean up
  docker stop rss-proxy-test &>/dev/null
  docker rm rss-proxy-test &>/dev/null
}

# Test production deployments (if URLs provided)
test_production() {
  echo -e "\n${YELLOW}Testing Production Deployments${NC}"
  
  # Add your deployed URLs here
  local production_urls=(
    # "https://your-app.railway.app"
    # "https://rss-proxy.your-subdomain.workers.dev"
    # "https://your-app.ondigitalocean.app"
  )
  
  if [[ ${#production_urls[@]} -eq 0 ]]; then
    echo "  No production URLs configured"
    echo "  Add your deployed URLs to the production_urls array"
    return 0
  fi
  
  for url in "${production_urls[@]}"; do
    if test_proxy "$url" "Production: $url"; then
      echo -e "  ${GREEN}Production deployment is working!${NC}"
    else
      echo -e "  ${RED}Production deployment failed tests${NC}"
    fi
  done
}

# Performance test
performance_test() {
  local proxy_url=$1
  echo -e "\n${YELLOW}Performance Test: $proxy_url${NC}"
  
  echo "  Testing response times for multiple feeds..."
  
  local total_time=0
  local successful_requests=0
  
  for feed_url in "${TEST_FEEDS[@]}"; do
    local encoded_url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$feed_url'))")
    local start_time=$(date +%s%3N)
    
    if curl -s --max-time 10 "$proxy_url?url=$encoded_url" > /dev/null; then
      local end_time=$(date +%s%3N)
      local response_time=$((end_time - start_time))
      total_time=$((total_time + response_time))
      successful_requests=$((successful_requests + 1))
      echo "    $(basename "$feed_url"): ${response_time}ms"
    else
      echo "    $(basename "$feed_url"): FAILED"
    fi
  done
  
  if [[ $successful_requests -gt 0 ]]; then
    local avg_time=$((total_time / successful_requests))
    echo "  Average response time: ${avg_time}ms"
    echo "  Success rate: $successful_requests/${#TEST_FEEDS[@]} ($(($successful_requests * 100 / ${#TEST_FEEDS[@]}))%)"
  fi
}

# Main execution
main() {
  echo "Starting comprehensive RSS proxy tests..."
  
  # Check dependencies
  if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is required but not installed.${NC}"
    exit 1
  fi
  
  if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 is required but not installed.${NC}"
    exit 1
  fi
  
  # Run tests
  test_local
  
  if command -v docker &> /dev/null; then
    test_docker
  else
    echo -e "\n${YELLOW}Docker not installed, skipping Docker tests${NC}"
  fi
  
  test_production
  
  # Performance test on local server if available
  if curl -s --max-time 2 "http://localhost:3001/health" > /dev/null; then
    performance_test "http://localhost:3001"
  fi
  
  echo -e "\n${GREEN}🎉 Test suite completed!${NC}"
  echo "Next steps:"
  echo "  1. Deploy to your preferred platform (see DEPLOYMENT_GUIDE.md)"
  echo "  2. Update your React app to use the deployed proxy URL"
  echo "  3. Test with your actual RSS feeds"
  echo "  4. Monitor performance and set up alerts"
}

# Run the main function
main "$@"
