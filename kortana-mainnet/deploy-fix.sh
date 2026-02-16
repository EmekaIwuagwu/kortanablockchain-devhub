#!/bin/bash

# Kortana Blockchain - Auto Deploy Contract Deployment Fix
# This script pulls the latest code, rebuilds, and restarts the node

echo ""
echo "=================================================="
echo "🚀 KORTANA CONTRACT DEPLOYMENT FIX - AUTO DEPLOY"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Find the repo directory
echo "📁 Locating repository..."
if [ -d "/root/kortanablockchain-devhub" ]; then
    REPO_DIR="/root/kortanablockchain-devhub"
elif [ -d "$HOME/kortanablockchain-devhub" ]; then
    REPO_DIR="$HOME/kortanablockchain-devhub"
else
    echo -e "${RED}❌ Repository not found!${NC}"
    echo "Please run this script from the repository directory or specify the path."
    exit 1
fi

echo -e "${GREEN}✅ Found repo at: $REPO_DIR${NC}"

# Step 2: Navigate to repo
cd "$REPO_DIR" || exit 1

# Step 3: Pull latest code
echo ""
echo "📥 Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed!${NC}"
    echo "Please check your git configuration and try again."
    exit 1
fi

echo -e "${GREEN}✅ Code updated successfully${NC}"

# Step 4: Navigate to Rust project
cd kortana-blockchain-rust || exit 1

# Step 5: Build the project
echo ""
echo "🔨 Building Kortana blockchain with contract deployment fix..."
echo "⏱️  This will take a few minutes..."
cargo build --release

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    echo "Please check the error messages above."
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Step 6: Stop the old node
echo ""
echo "🛑 Stopping old blockchain node..."

# Try to find the process
PID=$(pgrep -f "kortana-blockchain-rust" | head -n 1)

if [ -n "$PID" ]; then
    echo "Found running process with PID: $PID"
    kill -15 "$PID"
    sleep 3
    
    # Check if still running
    if ps -p "$PID" > /dev/null; then
        echo "Process still running, forcing shutdown..."
        kill -9 "$PID"
    fi
    
    echo -e "${GREEN}✅ Old node stopped${NC}"
else
    echo -e "${YELLOW}⚠️  No running node found (this is OK)${NC}"
fi

# Step 7: Start the new node
echo ""
echo "🚀 Starting new blockchain node with contract deployment support..."

# Check if screen is available
if command -v screen &> /dev/null; then
    echo "Using screen session..."
    screen -dmS kortana-node ./target/release/kortana-blockchain-rust
    echo -e "${GREEN}✅ Node started in screen session 'kortana-node'${NC}"
    echo "   To view logs: screen -r kortana-node"
    echo "   To detach: Ctrl+A, then D"
else
    echo "Starting in background with nohup..."
    nohup ./target/release/kortana-blockchain-rust > ../node.log 2>&1 &
    echo -e "${GREEN}✅ Node started in background${NC}"
    echo "   Logs: tail -f $REPO_DIR/node.log"
fi

# Step 8: Wait for node to start
echo ""
echo "⏳ Waiting for node to initialize (10 seconds)..."
sleep 10

# Step 9: Test if node is running
echo ""
echo "🧪 Testing if node is responding..."

RESPONSE=$(curl -s -X POST https://poseidon-rpc.kortana.worchsester.xyz/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  2>/dev/null)

if echo "$RESPONSE" | grep -q "result"; then
    echo -e "${GREEN}✅ Node is responding correctly!${NC}"
    
    # Extract block number
    BLOCK=$(echo "$RESPONSE" | grep -oP '(?<="result":")[^"]+')
    echo "   Current block: $BLOCK"
else
    echo -e "${YELLOW}⚠️  Node may still be initializing...${NC}"
    echo "   Check logs to verify it's running"
fi

# Step 10: Summary
echo ""
echo "=================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=================================================="
echo ""
echo "📋 Summary:"
echo "   Repository: $REPO_DIR"
echo "   Binary: $REPO_DIR/kortana-blockchain-rust/target/release/kortana-blockchain-rust"
echo "   RPC: https://poseidon-rpc.kortana.worchsester.xyz/"
echo ""
echo "🎉 Contract deployment is now enabled!"
echo ""
echo "🧪 To test deployment, run this from your local machine:"
echo "   node test-contract-deployment.js <YOUR_PRIVATE_KEY>"
echo ""
echo "📖 For more info, see:"
echo "   $REPO_DIR/kortana-blockchain-rust/CONTRACT_DEPLOYMENT_FIXED.md"
echo ""

exit 0
