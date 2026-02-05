#!/bin/bash
set -e

echo "=========================================="
echo "KORTANA NODE - REBUILD AND RESTART"
echo "=========================================="

# Stop the service
echo "[1/5] Stopping kortanad service..."
sudo systemctl stop kortanad
echo "✓ Service stopped"

# Rebuild with new fixes
echo "[2/5] Building with new fixes..."
cd ~/kortanablockchain-devhub/kortana-blockchain-rust
cargo build --release
echo "✓ Build complete"

# Restart the service
echo "[3/5] Starting kortanad service..."
sudo systemctl start kortanad
echo "✓ Service started"

# Wait a moment for startup
sleep 3

# Check status
echo "[4/5] Checking service status..."
sudo systemctl status kortanad --no-pager | head -20

# Show recent logs
echo "[5/5] Showing recent logs..."
sudo journalctl -u kortanad --no-pager -n 30

echo ""
echo "=========================================="
echo "NODE RESTART COMPLETE"
echo "=========================================="
