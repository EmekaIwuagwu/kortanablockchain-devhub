#!/bin/bash
set -e

echo "[$(date)] Bootstrapping Kortana Virtual Environment..."

# Prepare persistent storage
mkdir -p /data/logs /data/virtual-envs
if [ ! -L /logs ]; then rm -rf /logs && ln -s /data/logs /logs; fi
if [ ! -L /virtual-envs ]; then rm -rf /virtual-envs && ln -s /data/virtual-envs /virtual-envs; fi

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

# 1. Check if environment already exists
B_NAME=${BLOCKCHAIN_NAME:-poseidon}
echo "[$(date)] Checking if environment $B_NAME exists..."
EXISTING_ENV=$(curl -s http://localhost:9000/api/list | jq -r ".[] | select(.env_id == \"$B_NAME\")")

if [ -n "$EXISTING_ENV" ]; then
    echo "[$(date)] Environment $B_NAME already exists. Skipping allocation."
    ENV_ID=$B_NAME
    PUBLIC_URL=$(echo "$EXISTING_ENV" | jq -r '.public_url')
else
    echo "[$(date)] Allocating environment (5TB ROM, 32GB RAM)..."
    curl -X POST http://localhost:9000/api/allocate \
      -H "Content-Type: application/json" \
      -d "{\"rom_gb\": 5120, \"ram_gb\": 32, \"blockchain_name\": \"$B_NAME\"}" > /tmp/env.json
    ENV_ID=$(jq -r '.env_id' /tmp/env.json)
    PUBLIC_URL=$(jq -r '.public_url' /tmp/env.json)
fi

echo "[$(date)] Env ID: $ENV_ID"
echo "[$(date)] Public URL: $PUBLIC_URL"

# 4. Deploy blockchain
echo "[$(date)] Deploying blockchain to $ENV_ID..."
DEPLOY_RES=$(curl -s -X POST http://localhost:9000/api/deploy \
  -H "Content-Type: application/json" \
  -d "{\"env_id\": \"$ENV_ID\", \"repo\": \"$GITHUB_REPO\"}")
echo "[$(date)] Deploy response: $DEPLOY_RES"

if echo "$DEPLOY_RES" | grep -q "failed"; then
    echo "[ERROR] Deployment failed: $DEPLOY_RES"
    exit 1
fi

# 5. Start blockchain
echo "[$(date)] Starting blockchain $ENV_ID..."
START_RES=$(curl -s -X POST http://localhost:9000/api/start \
  -H "Content-Type: application/json" \
  -d "{\"env_id\": \"$ENV_ID\"}")
echo "[$(date)] Start response: $START_RES"

if echo "$START_RES" | grep -q "failed"; then
    echo "[ERROR] Start failed: $START_RES"
    exit 1
fi

# 6. Health check
echo "[$(date)] Waiting for RPC health check..."
sleep 20
HEALTH_RES=$(curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' || echo "failed")

echo "[$(date)] RPC health check result: $HEALTH_RES"

if [ "$HEALTH_RES" == "failed" ]; then
    echo "[CRITICAL ERROR] Blockchain failed to respond. Dumping last logs for $ENV_ID:"
    curl -s http://localhost:9000/api/logs/$ENV_ID?lines=30 | jq -r '.logs'
    # We don't exit here so at least the API manager stays alive for you to debug
fi

echo "[$(date)] ✅ Bootstrap sequence finished."
echo "Public URL (Custom Domain): $PUBLIC_URL"
echo "Public URL (Direct Render): ${RENDER_EXTERNAL_URL}/rpc"
