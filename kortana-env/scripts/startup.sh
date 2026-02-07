#!/bin/bash
set -e

echo "[$(date)] Bootstrapping Kortana Virtual Environment..."

# Wait for Environment Manager API to be ready
echo "[$(date)] Waiting for API on port 9000..."
max_retries=30
count=0
while ! curl -s http://localhost:9000/api/status/health > /dev/null; do
    sleep 2
    count=$((count + 1))
    if [ $count -ge $max_retries ]; then
        echo "API failed to start in time."
        exit 1
    fi
done

# 1. Allocate virtual environment
echo "[$(date)] Allocating environment (5TB ROM, 32GB RAM)..."
B_NAME=${BLOCKCHAIN_NAME:-poseidon}
curl -X POST http://localhost:9000/api/allocate \
  -H "Content-Type: application/json" \
  -d "{\"rom_gb\": 5120, \"ram_gb\": 32, \"blockchain_name\": \"$B_NAME\"}" > /tmp/env.json

ENV_ID=$(jq -r '.env_id' /tmp/env.json)
PUBLIC_URL=$(jq -r '.public_url' /tmp/env.json)

echo "[$(date)] Allocated Env ID: $ENV_ID"

# 4. Deploy blockchain
curl -X POST http://localhost:9000/api/deploy \
  -H "Content-Type: application/json" \
  -d "{\"env_id\": \"$ENV_ID\", \"repo\": \"$GITHUB_REPO\"}"

# 5. Start blockchain
curl -X POST http://localhost:9000/api/start \
  -H "Content-Type: application/json" \
  -d "{\"env_id\": \"$ENV_ID\"}"

# 6. Health check
sleep 15
curl -s http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

echo "[$(date)] ✅ Environment ready!"
echo "Public URL (Custom Domain): $PUBLIC_URL"
echo "Public URL (Direct Render): ${RENDER_EXTERNAL_URL}/rpc"
