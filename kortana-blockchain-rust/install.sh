#!/bin/bash
# =================================================================
#  KORTANA BLOCKCHAIN - ALL-IN-ONE DEPLOYMENT SCRIPT
#  Designed for Ubuntu Linux (Cloud VPS)
# =================================================================

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
echo -e "      ${YELLOW}KORTANA BLOCKCHAIN NODE - ZERO TO HERO INSTALLER${NC}\n"
}

print_logo

# 1. System Requirements & Swap
print_step "1" "Optimizing Server Resources"
if [[ $EUID -eq 0 ]]; then
    # Create Swap if less than 2GB RAM
    TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$TOTAL_RAM" -lt 2000 ]; then
        echo -e "${YELLOW}Detected low RAM (${TOTAL_RAM}MB). Creating 2GB Swap file...${NC}"
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        echo -e "${GREEN}✅ Swap file created successfully.${NC}"
    else
        echo -e "${GREEN}✅ Sufficient RAM detected (${TOTAL_RAM}MB). skipping swap creation.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping RAM optimization (Requires Root/Sudo).${NC}"
fi

# 2. System Update & Dependencies
print_step "2" "Installing System Dependencies"
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git pkg-config libssl-dev libclang-dev chrony jq ufw screen

# 3. Install Rust Toolchain
print_step "3" "Installing Rust Toolchain"
if ! command -v cargo &> /dev/null; then
    echo -e "${YELLOW}Installing Rust via rustup...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo -e "${GREEN}✅ Rust is already installed: $(rustc --version)${NC}"
fi

# 4. Environment Configuration
print_step "4" "Setting up Environment"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env from template...${NC}"
    cp .env.example .env
    # Generate a random private key for the validator if not set
    RAND_KEY=$(openssl rand -hex 32)
    sed -i "s/your_64_character_hex_private_key_here/$RAND_KEY/" .env
    echo -e "${GREEN}✅ Created .env with a secure random Validator Key.${NC}"
else
    echo -e "${GREEN}✅ .env file already exists.${NC}"
fi

# 5. Build the Node
print_step "5" "Compiling Kortana Node (Release Mode)"
echo -e "${CYAN}This may take several minutes depending on CPU power...${NC}"
cargo build --release

# 6. Service Installation (Systemd)
print_step "6" "Installing System Service (Autostart)"
BINARY_PATH="$(pwd)/target/release/kortana-blockchain-rust"
SERVICE_FILE="/etc/systemd/system/kortanad.service"

echo -e "${YELLOW}Creating service at $SERVICE_FILE...${NC}"
sudo bash -c "cat > $SERVICE_FILE" <<EOF
[Unit]
Description=Kortana Blockchain Node
After=network.target

[Service]
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$BINARY_PATH
Restart=always
RestartSec=10
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable kortanad
sudo systemctl restart kortanad

# 7. Final Security Adjustments
print_step "7" "Applying Security & Firewall Rules"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 30333/tcp # P2P Gossip
sudo ufw allow 8545/tcp  # RPC Interface (Optional)

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}          🚀 KORTANA NODE IS LIVE AND SYNCING! 🚀${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "${CYAN}Status Control :${NC} sudo systemctl status kortanad"
echo -e "${CYAN}Live Logs      :${NC} journalctl -u kortanad -f"
echo -e "${CYAN}Public IP      :${NC} $(curl -s ifconfig.me)"
echo -e "${CYAN}RPC Address    :${NC} http://$(curl -s ifconfig.me):8545"
echo -e "${GREEN}================================================================${NC}"
echo -e "${YELLOW}Happy Staking / Developing!${NC}\n"
