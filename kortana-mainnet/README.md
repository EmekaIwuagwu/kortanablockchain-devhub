# ⚔️ Kortana Blockchain — Mainnet Node (Rust)

> **Status: 🟢 LIVE & SECURED (v1.0.0-Mainnet)**  
> **Launch Date: February 2026**

Welcome to the Kortana Mainnet Node — the production-grade, optimized implementation of the Kortana Layer 1 blockchain, featuring dual VM support (EVM + Quorlin), 2-second block times, and BFT finality.

---

## 🌐 Mainnet Network Details

| Field | Value |
|-------|-------|
| **Network Name** | Kortana Mainnet |
| **RPC URL** | `https://zeus-rpc.mainnet.kortana.xyz` |
| **Chain ID** | `7251` |
| **Currency Symbol** | `DNR` |
| **Block Explorer** | `https://explorer.mainnet.kortana.xyz` |
| **Consensus** | Delegated Proof-of-History (DPoH) + BFT |
| **Block Time** | 2 Seconds |
| **Initial Validators** | 3 Production Nodes |

---

## 💰 Token Economics

| Field | Value |
|-------|-------|
| **Token Name** | DINAR (DNR) |
| **Total Supply** | 500,000,000,000 DNR (500 Billion) |
| **Circulating at Launch** | 10,000,000,000 DNR (10 Billion) |
| **Treasury 1 (Foundation)** | Portion of remaining 490B — ecosystem, grants, ops |
| **Treasury 2 (Reserve)** | Majority of remaining 490B — Kortana SEZ, Smart City, Robotics, EV |
| **Initial Block Reward** | 5 DNR / block |
| **Halving** | 10% reduction per year |

> ⚠️ **No tokens will be sent to any blockchain address upon mainnet deployment.** Treasury disbursements are governed by on-chain proposals only.

---

## 🚀 Production Deployment

### 1. Requirements

- Rust (Latest Stable 1.70+)
- Ubuntu 22.04+ or CentOS 8+
- 4 vCPUs / 8GB RAM (minimum)
- Ports `8545` (RPC) and `30333` (P2P) open

### 2. Setup

```bash
cd kortanablockchain-devhub/kortana-mainnet

# Copy and configure environment
cp .env.example .env
# Set VALIDATOR_PRIVATE_KEY in .env

# (Optional) Generate a new validator keypair
cargo run --release -- --wallet

# Build the production binary
cargo build --release
```

### 3. Run the Node

```bash
# Start as production node
nohup ./target/release/kortana-blockchain-rust \
  --rpc-addr 0.0.0.0:8545 \
  --p2p-addr /ip4/0.0.0.0/tcp/30333 \
  > node.log 2>&1 &

# Monitor
tail -f node.log
```

### 4. Docker Deployment

```bash
docker-compose up -d --build
docker-compose logs -f
```

---

## ⚙️ CLI Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--rpc-addr` | JSON-RPC server bind address | `0.0.0.0:8545` |
| `--p2p-addr` | P2P listening Multiaddr | `/ip4/0.0.0.0/tcp/30333` |
| `--bootnodes` | Comma-separated bootnode list | (none) |
| `--wallet` | Generate a new validator keypair | (disabled) |

---

## ⚙️ Environment Configuration (.env)

| Key | Description | Default |
|-----|-------------|---------|
| `VALIDATOR_PRIVATE_KEY` | 64-hex char validator secret key | (Required in production) |
| `RPC_ADDR` | Bind address for JSON-RPC | `0.0.0.0:8545` |
| `P2P_ADDR` | Bind address for P2P | `/ip4/0.0.0.0/tcp/30333` |
| `DB_PATH` | Ledger database path | `./data/kortana.db` |

> ⚠️ **Never commit your `.env` file to Git. The `VALIDATOR_PRIVATE_KEY` is your node's on-chain identity.**

---

## 🦊 Add Mainnet to MetaMask

```
Network Name:    Kortana Mainnet
RPC URL:         https://zeus-rpc.mainnet.kortana.xyz
Chain ID:        7251
Symbol:          DNR
Block Explorer:  https://explorer.mainnet.kortana.xyz
```

---

## 🧪 Verify the Node

```bash
# Remote verification
curl -X POST https://zeus-rpc.mainnet.kortana.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Local verification (development only)
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 📊 Monitoring & Maintenance

```bash
# Service management (if installed as systemd service)
sudo systemctl status kortanad
journalctl -u kortanad -f
sudo systemctl restart kortanad
sudo systemctl stop kortanad
```

**Log color codes:**
- 👑 Block Production — Node elected as leader
- ✅ Finality — Block confirmed by BFT quorum
- 🔵 RPC — API request handled
- 🟣 Mempool — Transaction activity
- 🔴 Error / Slashing — Critical event

---

## 🔒 Security

1. **Firewall:** Restrict access to ports `8545` and `30333` to trusted IPs where possible
2. **Private Keys:** `VALIDATOR_PRIVATE_KEY` is your node identity — keep it secret
3. **Updates:** `git pull` → `cargo build --release` → `sudo systemctl restart kortanad`

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────┐
│             APPLICATION LAYER                │
│  MetaMask · dApps · Block Explorer           │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────┴──────────────────────────┐
│           CONSENSUS & NETWORK LAYER          │
│  DPoH + BFT · libp2p Gossipsub              │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────┴──────────────────────────┐
│          EXECUTION LAYER (DUAL VM)           │
│  EVM (Solidity) · Quorlin (Native)          │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────┴──────────────────────────┐
│               STATE & STORAGE                │
│  Merkle-Patricia Trie · Sled DB             │
└──────────────────────────────────────────────┘
```

---

## 📖 Related Documentation

| Document | Description |
|----------|-------------|
| `DEPLOY.md` | Full production deployment guide |
| `CLI_HELP.md` | CLI flags & staking integration |
| `CONTRACT_DEPLOYMENT_FIXED.md` | Smart contract deployment guide |
| `CROSS_PLATFORM_GUIDE.md` | Multi-OS build guide |
| `../README.md` | Full repository overview |

---

## 🔖 Version Information

| Field | Value |
|-------|-------|
| **Specification Version** | 2.0.0 |
| **Language** | Rust (stable 1.70+) |
| **Chain ID** | 7251 |
| **Target Standard** | Polkadot / Cosmos / Solana Tier |
| **Status** | 🟢 LIVE |
| **Launch Date** | February 2026 |
| **Developed by** | Kortana Core Team |
| **Built with** | Rust (stable 1.70+) |

---

**Status: MAINNET LIVE — READY FOR DAPP INTEGRATION & ECOSYSTEM DEVELOPMENT**

**Built with ❤️ by the Kortana Core Team**
