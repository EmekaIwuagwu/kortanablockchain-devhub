# ⚔️# Kortana Mainnet Protocol Node

Welcome to the production-grade Kortana Mainnet node implementation. This version is optimized for high-performance EVM compatibility with a 2-second block time and a decentralized 3-validator consensus set.

## 🚀 Mainnet Specifications
- **Network Name**: Kortana Mainnet
- **Chain ID**: `9002`
- **Currency**: `DNR` (Dinari)
- **Consensus**: BFT with PoH Anchor
- **Block Time**: 2 Seconds
- **Validators**: 3 Initial Production Nodes

## 🛠️ Production Deployment

### 1. Requirements
- Rust (Latest Stable)
- 4 vCPUs / 8GB RAM minimum
- Port `8545` (RPC) and `30333` (P2P) open

### 2. Setup
```bash
# Clone and navigate to mainnet folder
cd kortana-mainnet

# Copy env example
cp .env.example .env

# Generate a new validator wallet if needed
cargo run -- --wallet
```

### 3. Running the Node
To run in production mode (requires `VALIDATOR_PRIVATE_KEY` in `.env` or as environment variable):
```bash
cargo run --release -- --prod
```

For development/local testing:
```bash
cargo run --release
```

## 📊 Monitoring
Logs are color-coded for clarity:
- 👑 **Yellow**: Block Production (Leader)
- ✅ **Green**: Successful Finality/Verification
- 🟦 **Blue**: RPC Handshake
- 🟪 **Magenta**: Mempool Activity
- 🟥 **Red**: Critical Errors/Slashing

---

## 🛠️ Manual Installation

If you prefer to set things up manually, follow these steps:

### 1. Prerequisites
- **Ubuntu 22.04+** or **CentOS 8+**
- **Rust Toolchain** (Latest Stable)
- **C++ Compiler** (build-essential)
- **OpenSSL** (libssl-dev)

### 2. Build from Source
```bash
cargo build --release
```

### 3. Run the Node
```bash
# Basic run
./target/release/kortana-blockchain-rust

# Run as a Validator
./target/release/kortana-blockchain-rust --validator
```

---

## ⚙️ Configuration (.env)

The node uses an environment file for sensitive settings. A secure validator key is generated automatically by `install.sh`, but you can customize it in `.env`:

| Key | Description | Default |
|-----|-------------|---------|
| `VALIDATOR_PRIVATE_KEY` | Your 64-hex char secret key | (Generated) |
| `RPC_ADDR` | Bind address for API calls | `0.0.0.0:8545` |
| `P2P_ADDR` | Bind address for node gossip | `/ip4/0.0.0.0/tcp/30333` |
| `DB_PATH` | Storage location for the ledger | `./data/kortana.db` |

---

## 📊 Monitoring & Maintenance

Once installed via the script, the node runs as a background service called `kortanad`.

- **Check Node Status**: `sudo systemctl status kortanad`
- **View Live Logs**: `journalctl -u kortanad -f`
- **Restart Node**: `sudo systemctl restart kortanad`
- **Stop Node**: `sudo systemctl stop kortanad`

---

## 🔒 Security Recommendations

1. **Firewall**: Ensure ports `30333` (P2P) and `8545` (RPC) are open in your Cloud Provider's dashboard.
2. **Private Keys**: Your `VALIDATOR_PRIVATE_KEY` is your identity. **NEVER** share it or commit your `.env` file to GitHub.
3. **Updates**: To update your node, simply `git pull` the latest changes and run `cargo build --release` again, then restart the service.

---

## 🧪 Testing the RPC

You can verify your node is responding by running this command from any terminal:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---
**Build with ❤️ for the Kortana Community.**
