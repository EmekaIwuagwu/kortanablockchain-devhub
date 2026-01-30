#!/bin/bash
set -e

# Colors for output
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper for beautiful headers
print_step() {
    echo -e "\n${CYAN}================================================================${NC}"
    echo -e "${CYAN}  STEP $1: $2${NC}"
    echo -e "${CYAN}================================================================${NC}"
}

print_logo() {
echo -e "${BLUE}"
echo "██╗  ██╗ ██████╗ ██████╗ ████████╗ █████╗ ███╗   ██╗ █████╗ "
echo "██║ ██╔╝██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗████╗  ██║██╔══██╗"
echo "█████═╝ ██║   ██║██████╔╝   ██║   ███████║██╔██╗ ██║███████║"
echo "██╔═██╗ ██║   ██║██╔══██╗   ██║   ██╔══██║██║╚██╗██║██╔══██║"
echo "██║  ██╗╚██████╔╝██║  ██║   ██║   ██║  ██║██║ ╚████║██║  ██║"
echo "╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝"
echo -e "      ${YELLOW}KORTANA BLOCKCHAIN PRODUCTION NODE DEPLOYMENT${NC}\n"
}

print_logo

# Check for root/sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Error: This script must be run with sudo or as root.${NC}"
   exit 1
fi

# 1. System Update
print_step "1" "Updating and Upgrading System"
sudo DEBIAN_FRONTEND=noninteractive apt update
sudo DEBIAN_FRONTEND=noninteractive apt upgrade -y

# 2. Install Dependencies & Peripherals
print_step "2" "Installing Dependencies & Production Peripherals"
sudo DEBIAN_FRONTEND=noninteractive apt install -y \
    build-essential curl git pkg-config libssl-dev libclang-dev \
    chrony jq ufw screen zip unzip

# 3. Install Rust
print_step "3" "Installing Rust Toolchain"
if ! command -v cargo &> /dev/null; then
    echo -e "${YELLOW}Installing Rust via rustup...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo -e "${GREEN}✅ Rust is already installed: $(rustc --version)${NC}"
fi

# 4. Clone/Update Source Code
print_step "4" "Validating Source Code"
if [ ! -f "Cargo.toml" ]; then
    echo -e "${RED}❌ Error: Cargo.toml not found! Please run from repository root.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build manifest found.${NC}"

# 5. Build Release Binary
print_step "5" "Building Release Binary (This may take several minutes)"
cargo build --release

# 6. Install as Systemd Service
print_step "6" "Configuring Systemd Service"
BINARY_PATH="$(pwd)/target/release/kortana-blockchain-rust"
SERVICE_FILE="/etc/systemd/system/kortanad.service"

P2P_LISTEN=${P2P_ADDR:-"/ip4/0.0.0.0/tcp/30333"}
BOOT_NODES=${BOOTNODES:-""}

EXEC_COMMAND="$BINARY_PATH --p2p-addr $P2P_LISTEN"
if [ ! -z "$BOOT_NODES" ]; then
    EXEC_COMMAND="$EXEC_COMMAND --bootnodes $BOOT_NODES"
fi

echo -e "${YELLOW}Creating service at $SERVICE_FILE...${NC}"
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
print_step "7" "Configuring Network Firewall (UFW)"
sudo ufw allow 22/tcp    > /dev/null # SSH
sudo ufw allow 30333/tcp > /dev/null # P2P
sudo ufw allow 8545/tcp  > /dev/null # RPC
echo -e "${GREEN}✅ Ports 22, 30333, and 8545 opened.${NC}"

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}          🚀 DEPLOYMENT COMPLETED SUCCESSFULLY 🚀${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "${CYAN}Node Status:${NC} $(sudo systemctl is-active kortanad)"
echo -e "${CYAN}Public RPC:${NC} http://$(curl -s ifconfig.me):8545"
echo -e "${CYAN}Log Tool:${NC} journalctl -u kortanad -f"
echo -e "${CYAN}Bin Path:${NC} $BINARY_PATH"
echo -e "${GREEN}================================================================${NC}"
echo -e "${YELLOW}Kortana Node is now live and securing the network.${NC}\n"
