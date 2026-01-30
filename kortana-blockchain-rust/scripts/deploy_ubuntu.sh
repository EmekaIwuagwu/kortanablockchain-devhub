#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Kortana Blockchain Node Deployment Script ===${NC}"
echo "Target OS: Ubuntu 20.04 - 24.04 LTS"

# 1. System Update
echo -e "${GREEN}[1/7] Updating System...${NC}"
sudo DEBIAN_FRONTEND=noninteractive apt update && sudo DEBIAN_FRONTEND=noninteractive apt upgrade -y

# 2. Install Dependencies
echo -e "${GREEN}[2/7] Installing Dependencies...${NC}"
sudo DEBIAN_FRONTEND=noninteractive apt install -y build-essential curl git pkg-config libssl-dev ufw screen

# 3. Install Rust
echo -e "${GREEN}[3/7] Installing Rust (stable)...${NC}"
if ! command -v cargo &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "Rust is already installed."
fi

# 4. Clone/Update Source Code
# NOTE: In a real scenario, you'd git clone here. We assume the script is in the repo folder for now via upload.
echo -e "${GREEN}[4/7] Checking Source Code...${NC}"
if [ ! -f "Cargo.toml" ]; then
    echo -e "${RED}Error: Cargo.toml not found. Please run this script from the root of the kortana-blockchain-rust repository.${NC}"
    exit 1
fi

# 5. Build Release Binary
echo -e "${GREEN}[5/7] Building Release Binary (This may take a while)...${NC}"
cargo build --release

# 6. Install as Systemd Service
echo -e "${GREEN}[6/7] Configuring Systemd Service...${NC}"
BINARY_PATH="$(pwd)/target/release/kortana-blockchain-rust"
SERVICE_FILE="/etc/systemd/system/kortanad.service"

# Get environment variables or use defaults
P2P_LISTEN=${P2P_ADDR:-"/ip4/0.0.0.0/tcp/30333"}
BOOT_NODES=${BOOTNODES:-""}

EXEC_COMMAND="$BINARY_PATH --p2p-addr $P2P_LISTEN"
if [ ! -z "$BOOT_NODES" ]; then
    EXEC_COMMAND="$EXEC_COMMAND --bootnodes $BOOT_NODES"
fi

sudo bash -c "cat > $SERVICE_FILE" <<EOF
[Unit]
Description=Kortana Blockchain Node
After=network.target

[Service]
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$EXEC_COMMAND
Restart=always
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable kortanad
sudo systemctl start kortanad

# 7. Configure Firewall
echo -e "${GREEN}[7/7] Configuring Firewall (UFW)...${NC}"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 30333/tcp # P2P
sudo ufw allow 8545/tcp  # RPC
# sudo ufw enable        # Automated enabling can be risky if SSH isn't allowed properly. User should enable manually.

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo "Node Status: $(sudo systemctl is-active kortanad)"
echo "Logs: journalctl -u kortanad -f"
echo "RPC Endpoint: http://$(curl -s ifconfig.me):8545"
