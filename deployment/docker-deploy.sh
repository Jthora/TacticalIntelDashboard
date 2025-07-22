#!/bin/bash

# Docker-based RSS Proxy Server
# Build and deploy a containerized RSS proxy for any cloud provider

# Build the Docker image
docker build -t rss-proxy-server .

# Run locally for testing
docker run -p 3001:3001 rss-proxy-server

# Tag for deployment (replace with your registry)
docker tag rss-proxy-server your-registry/rss-proxy-server:latest

# Push to registry
docker push your-registry/rss-proxy-server:latest

echo "RSS Proxy Server Docker image built and ready for deployment!"
echo "Local test: http://localhost:3001/health"
echo "Proxy endpoint: http://localhost:3001/proxy?url=https://example.com/feed.xml"
