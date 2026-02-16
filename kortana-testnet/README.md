# ⚔️ Kortana Blockchain Node (Rust Implementation)

Welcome to the heart of the Kortana Network. This repository contains the high-performance, multithreaded blockchain node implementation written in Rust.

## 🚀 Quick Start (Zero to Hero)

If you are deploying to a new Ubuntu cloud server (e.g., RackNerd, Azure, DigitalOcean), use our automated installer to set up everything in one go.

### 1. Simple One-Line Setup
```bash
# Clone the repository
git clone https://github.com/EmekaIwuagwu/kortanablockchain-devhub.git
cd kortanablockchain-devhub/kortana-blockchain-rust

# Make the installer executable and run it
chmod +x install.sh
sudo ./install.sh
```

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
