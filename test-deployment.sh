#!/bin/bash

# POC Testing Script
# Run this after deploying to verify everything works

echo "=================================="
echo "POC Deployment Verification"
echo "=================================="
echo ""

# Get URLs from user
read -p "Enter POC 1 URL (semantic search): " POC1_URL
read -p "Enter POC 2 URL (image classification): " POC2_URL

echo ""
echo "Testing POC 1: Semantic Search..."
echo "=================================="

# Test health endpoint
echo "1. Health check..."
curl -s "$POC1_URL/health" | jq '.'

echo ""
echo "2. Search test: 'can't log in'..."
curl -s -X POST "$POC1_URL/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "cant log in"}' | jq '.results[0:3] | .[] | {title, relevanceScore}'

echo ""
echo "3. Search test: 'change payment'..."
curl -s -X POST "$POC1_URL/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "change payment method"}' | jq '.results[0:3] | .[] | {title, relevanceScore}'

echo ""
echo "=================================="
echo "Testing POC 2: Image Classification"
echo "=================================="

# Test health endpoint
echo "1. Health check..."
curl -s "$POC2_URL/health" | jq '.'

echo ""
echo "2. Downloading test image..."
curl -s -o /tmp/test-cat.jpg "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/300px-Cat03.jpg"

echo "3. Classifying image..."
curl -s -X POST "$POC2_URL/api/classify" \
  -F "image=@/tmp/test-cat.jpg" | jq '{predictions: .predictions[0:5], processingTime: .metadata.processingTimeMs}'

echo ""
echo "=================================="
echo "Testing Complete!"
echo "=================================="
echo ""
echo "✅ Both POCs are working if you see results above"
echo ""
echo "Next steps:"
echo "  1. Open browser and test UI"
echo "  2. Try different search queries"
echo "  3. Upload different images"
echo "  4. Take screenshots for backup"
echo ""
echo "Your URLs:"
echo "  POC 1: $POC1_URL"
echo "  POC 2: $POC2_URL"
echo ""
