# 🌟 KORTANA BLOCKCHAIN — Production-Grade Layer 1 Protocol

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Rust](https://img.shields.io/badge/rust-1.70%2B-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Security](https://img.shields.io/badge/security-A--grade-success)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Testnet](https://img.shields.io/badge/testnet-LIVE-brightgreen)
![Mainnet](https://img.shields.io/badge/mainnet-LIVE-brightgreen)

**High-Performance Layer 1 Blockchain with Dual VM Support (EVM + Quorlin)**  
**Powering the Kortana Smart City & Special Economic Zone**

[🚀 Quick Start](#-quick-start) • [🌐 Networks](#-network-information) • [🦊 MetaMask](#-metamask-integration) • [🏗 Architecture](#-architecture-overview) • [🌆 Ecosystem Vision](#-kortana-ecosystem-vision)

</div>

---

## 📊 Protocol Specifications

| Feature | Specification |
|---------|--------------|
| **Mainnet Chain ID** | `9002` |
| **Testnet Chain ID** | `72511` |
| **Block Time** | 2 seconds |
| **Finality** | < 2 seconds (Byzantine BFT) |
| **Throughput** | 30M gas/block |
| **Consensus** | Delegated Proof-of-History (DPoH) |
| **Virtual Machines** | EVM + Quorlin (Dual VM) |
| **Token** | DINAR (DNR) — 18 decimals |
| **Total Supply** | 500,000,000,000 DNR (500 Billion) |
| **Circulating at Launch** | 10,000,000,000 DNR (10 Billion) |
| **Active Validators** | 50 |
| **Language** | Rust (stable 1.70+) |

---

## ✨ Key Features

### 🏆 Delegated Proof-of-History (DPoH) Consensus
- ✅ Cryptographic transaction ordering via PoH hash chain
- ✅ Byzantine fault tolerance (2/3 + 1 super-majority)
- ✅ Sub-2-second irreversible finality
- ✅ Stake-weighted validator election with automated slashing
- ✅ 50 active validators with commission-based staking rewards

### 💎 Dual Virtual Machine Architecture

**EVM (Ethereum Virtual Machine):**
- ✅ 50+ opcodes fully implemented — complete Solidity compatibility
- ✅ EIP-1559 fee model with `baseFeePerGas`
- ✅ MetaMask, Hardhat, Foundry, and Remix compatible
- ✅ PUSH0, RETURNDATASIZE, and CREATE2 support

**Quorlin VM (Native):**
- ✅ 25+ custom opcodes for high-throughput on-chain logic
- ✅ 256 local variable slots with global key-value state
- ✅ Native event emission
- ✅ JSON-encoded bytecode format for developer ergonomics

### 🔐 Enterprise-Grade Security
- ✅ **Security Audit Grade:** A-  
- ✅ Zero critical vulnerabilities  
- ✅ Environment-based secret management  
- ✅ Comprehensive input validation on all RPC endpoints  
- ✅ SHA3-256 cryptographic hashing (Keccak256)  
- ✅ ECDSA signature verification (k256)  
- ✅ Replay protection via EIP-155 chain ID enforcement  

### ⚡ High Performance
- ✅ 2-second block production
- ✅ Priority-queue mempool (10,000 transactions)
- ✅ Efficient Merkle-Patricia state trie
- ✅ Optimized gas metering and EVM loop bounds
- ✅ libp2p gossipsub P2P networking

---

## 🌐 Network Information

### 🔵 Kortana Testnet *(For Developers & dApp Testing)*

| Field | Value |
|-------|-------|
| **Network Name** | Kortana Testnet |
| **RPC URL** | `https://poseidon-rpc.kortana.worchsester.xyz` |
| **Chain ID** | `72511` |
| **Currency Symbol** | `DNR` |
| **Block Explorer** | `https://explorer.kortana.worchsester.xyz` |
| **Status** | 🟢 LIVE & SECURED (v1.0.0-Testnet) |

### 🟣 Kortana Mainnet *(Production)*

| Field | Value |
|-------|-------|
| **Network Name** | Kortana Mainnet |
| **RPC URL** | `https://zeus-rpc.mainnet.kortana.xyz` |
| **Chain ID** | `9002` |
| **Currency Symbol** | `DNR` |
| **Block Explorer** | `https://explorer.mainnet.kortana.xyz` |
| **Status** | 🟢 LIVE & SECURED (v1.0.0-Mainnet) |
| **Launch Date** | February 2026 |

---

## 🦊 MetaMask Integration

### Connect to Kortana Testnet *(Developers)*

1. Open MetaMask → Settings → Networks → **Add a Network**
2. Select **Add a network manually**
3. Enter the following:

```
Network Name:    Kortana Testnet
RPC URL:         https://poseidon-rpc.kortana.worchsester.xyz
Chain ID:        72511
Symbol:          DNR
Block Explorer:  https://explorer.kortana.worchsester.xyz
```

### Connect to Kortana Mainnet *(Production)*

1. Open MetaMask → Settings → Networks → **Add a Network**
2. Select **Add a network manually**
3. Enter the following:

```
Network Name:    Kortana Mainnet
RPC URL:         https://zeus-rpc.mainnet.kortana.xyz
Chain ID:        9002
Symbol:          DNR
Block Explorer:  https://explorer.mainnet.kortana.xyz
```

### Request Testnet Tokens (Faucet)

```bash
curl -X POST https://poseidon-rpc.kortana.worchsester.xyz \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_requestDNR",
    "params": ["YOUR_WALLET_ADDRESS"],
    "id": 1
  }'
```

---

## 🌆 Kortana Ecosystem Vision

> Kortana Blockchain is not just a Layer-1 protocol — it is the **operational backbone of a real-world smart city and Special Economic Zone (SEZ)**.

The Kortana ecosystem is designed to power:

| Initiative | Description |
|-----------|-------------|
| 🏙 **Kortana SEZ** | A blockchain-native Special Economic Zone where businesses register, transact, and operate fully on-chain |
| 🏛 **Smart City Infrastructure** | On-chain land registry, utility payments, governance, and e-residency identity |
| 🤖 **Robotics Division** | Automation and robotics systems with on-chain coordination and payments |
| ⚡ **Electric Vehicle (EV) Initiative** | EV infrastructure and charging payments powered by the DNR token |

> **Treasury 2 (Reserve)** is the dedicated long-term fund for all of the above initiatives, ensuring capital allocation is tied directly to real-world development milestones. Spending from this reserve requires on-chain governance approval.

---

## 💰 Token Economics (DNR — DINAR)

| Category | Amount | Notes |
|----------|--------|-------|
| **Total Supply** | 500,000,000,000 DNR | Fixed, never to be exceeded |
| **Circulating at Launch** | 10,000,000,000 DNR | Initial public circulation |
| **Foundation Reserve (Treasury 1)** | Portion of remaining 490B | Ecosystem growth, grants, operations |
| **Strategic Reserve (Treasury 2)** | Majority of remaining 490B | Kortana SEZ, Smart City, Robotics, EV initiatives |
| **Block Reward** | 5 DNR / block | Year 1 |
| **Halving Schedule** | 10% reduction/year | ~15.8M blocks/year |
| **Base Fee Distribution** | 50% burned / 50% proposer | EIP-1559 model |

> ⚠️ Treasury 2 is locked for ecosystem & real-world development. **No tokens will be sent to any blockchain address upon mainnet deployment.** All distribution is governed by on-chain proposals.

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────┐
│             APPLICATION LAYER                 │
│  Wallets · dApps · Block Explorer · REST API │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────┴──────────────────────────┐
│           CONSENSUS & NETWORK LAYER           │
│  · DPoH + Byzantine Finality (BFT)           │
│  · libp2p Gossipsub P2P Networking           │
│  · Priority Mempool (10K transactions)        │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────┴──────────────────────────┐
│         EXECUTION LAYER (DUAL VM)             │
│  · EVM — Full Solidity Support               │
│  · Quorlin VM — Native High-Throughput       │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────┴──────────────────────────┐
│               STATE LAYER                     │
│  · Merkle-Patricia State Trie                │
│  · Account & Contract State Management       │
│  · EIP-1559 Dynamic Fee Market               │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────┴──────────────────────────┐
│          PERSISTENCE LAYER (Sled DB)          │
│  · Block Store · State Snapshots             │
│  · Receipt Storage · Transaction Index       │
└──────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Rust:** 1.70+ (stable)
- **OS:** Linux (Ubuntu 22.04+ recommended), macOS, or Windows
- **RAM:** 4GB minimum (8GB recommended for validators)
- **Open Ports:** `8545` (RPC), `30333` (P2P)

### Clone and Build

```bash
# Clone the repository
git clone https://github.com/EmekaIwuagwu/kortanablockchain-devhub.git

# Navigate to the desired network directory
cd kortanablockchain-devhub/kortana-testnet   # For Testnet
# OR
cd kortanablockchain-devhub/kortana-mainnet   # For Mainnet

# Set up environment variables
cp .env.example .env
# Edit .env and set your VALIDATOR_PRIVATE_KEY

# Build the release binary (takes ~1–2 minutes)
cargo build --release
```

### Run the Node

```bash
# Start node (Testnet)
./target/release/kortana-blockchain-rust \
  --rpc-addr 0.0.0.0:8545 \
  --p2p-addr /ip4/0.0.0.0/tcp/30333

# Start in background (recommended for production)
nohup ./target/release/kortana-blockchain-rust \
  --rpc-addr 0.0.0.0:8545 \
  --p2p-addr /ip4/0.0.0.0/tcp/30333 \
  > node.log 2>&1 &

# Monitor logs
tail -f node.log
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the node
docker-compose down
```

---

## ⚙️ Configuration (.env)

| Key | Description | Default |
|-----|-------------|---------|
| `VALIDATOR_PRIVATE_KEY` | 64-hex char validator secret key | (Generated) |
| `RPC_ADDR` | Bind address for JSON-RPC API | `0.0.0.0:8545` |
| `P2P_ADDR` | Bind address for P2P gossip | `/ip4/0.0.0.0/tcp/30333` |
| `DB_PATH` | Storage path for the ledger | `./data/kortana.db` |

---

## 🌐 RPC API Reference

The node exposes a JSON-RPC 2.0 API compatible with the Ethereum tooling ecosystem.

### Standard Ethereum Methods

| Method | Description |
|--------|-------------|
| `eth_chainId` | Returns the network Chain ID |
| `eth_blockNumber` | Current block height |
| `eth_getBalance` | Get account balance |
| `eth_getTransactionCount` | Get account nonce |
| `eth_sendRawTransaction` | Submit signed transaction |
| `eth_call` | Execute read-only contract call |
| `eth_estimateGas` | Estimate gas for a transaction |
| `eth_getTransactionReceipt` | Retrieve transaction receipt |
| `eth_getBlockByNumber` | Retrieve block by height |
| `eth_getBlockByHash` | Retrieve block by hash |
| `eth_getLogs` | Query event logs with filter |
| `eth_newBlockFilter` | Subscribe to new blocks |
| `eth_getFilterChanges` | Poll filter for changes |
| `eth_feeHistory` | EIP-1559 fee history |

### Kortana-Specific Methods

| Method | Description |
|--------|-------------|
| `eth_requestDNR` | **Faucet** — Request testnet DNR tokens |
| `eth_getRecentTransactions` | Get last 100 global transactions |
| `eth_getAddressHistory` | Get full transaction history for an address |
| `eth_getValidators` | List all active validators with stats |

### Example RPC Calls

**Check block number (Testnet):**
```bash
curl -X POST https://poseidon-rpc.kortana.worchsester.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Check balance (Testnet):**
```bash
curl -X POST https://poseidon-rpc.kortana.worchsester.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["YOUR_ADDRESS","latest"],"id":1}'
```

**List validators:**
```bash
curl -X POST https://poseidon-rpc.kortana.worchsester.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getValidators","params":[],"id":1}'
```

> For local development only, replace the URL with `http://localhost:8545`.

---

## 📁 Project Structure

```
kortanablockchain-devhub/
├── kortana-testnet/               # Testnet node (Chain ID: 72511)
│   ├── src/
│   │   ├── address.rs             # Address format & validation
│   │   ├── consensus/             # DPoH consensus engine
│   │   ├── core/
│   │   │   ├── genesis.rs         # Genesis state (800B DNR distribution)
│   │   │   ├── processor.rs       # Dual-VM transaction processor
│   │   │   └── fees.rs            # EIP-1559 dynamic fee market
│   │   ├── mempool/               # Priority-queue transaction pool
│   │   ├── network/               # libp2p P2P networking
│   │   ├── rpc/                   # JSON-RPC 2.0 server
│   │   ├── state/                 # Merkle-Patricia trie & accounts
│   │   ├── storage/               # Sled embedded database
│   │   ├── types/                 # Block, Transaction, Receipt types
│   │   ├── vm/
│   │   │   ├── evm.rs             # Full EVM implementation
│   │   │   ├── quorlin.rs         # Quorlin native VM
│   │   │   └── precompiles.rs     # ecrecover & standard precompiles
│   │   ├── parameters.rs          # Chain constants & economics
│   │   └── main.rs                # Node entry point
│   └── tests/                     # Integration & contract tests
│
├── kortana-mainnet/               # Mainnet node (Chain ID: 7251)
│   └── src/                       # (mirrors testnet, production-hardened)
│
├── kortana-explorer/              # Block Explorer (Next.js)
│   ├── app/                       # Next.js App Router pages
│   └── components/                # Reusable UI components
│
├── scripts/                       # Deployment & utility scripts
├── examples/                      # Code examples & deploy scripts
└── README.md                      # This file
```

---

## 🔧 Build & Test

```bash
# Development build
cargo build

# Production optimized build
cargo build --release

# Run all tests
cargo test --all

# Code quality check
cargo clippy --all-targets --all-features

# Format code
cargo fmt

# Generate API documentation
cargo doc --no-deps --open
```

**Test Suite Results:**
- ✅ Unit Tests: All passing
- ✅ Integration Tests: All passing
- ✅ Contract Tests (EVM + Quorlin): All passing
- ✅ Overall: **100% pass rate**

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Block Production | 2 seconds |
| Finality Time | < 2 seconds |
| Gas Limit / Block | 30,000,000 |
| Min Gas / TX | 21,000 |
| Mempool Capacity | 10,000 transactions |
| Theoretical TPS | ~6,000+ |

---

## 🔐 Security

**Overall Grade:** A- (Excellent)

| Category | Status |
|----------|--------|
| Critical Vulnerabilities | ✅ Zero |
| High Priority Issues | ✅ All Resolved |
| Input Validation | ✅ All RPC endpoints validated |
| Private Key Management | ✅ Environment-based only |
| Replay Protection | ✅ EIP-155 enforced |
| Cryptographic Standards | ✅ SHA3-256 / ECDSA k256 |

**Security Recommendations:**
1. **Firewall:** Ensure ports `30333` (P2P) and `8545` (RPC) are only exposed as intended
2. **Private Key:** Your `VALIDATOR_PRIVATE_KEY` is your node identity — **NEVER** share it or commit `.env` to Git
3. **Updates:** `git pull` → `cargo build --release` → restart service

---

## 📊 Monitoring & Maintenance

When deployed as a system service:

```bash
# Check service status
sudo systemctl status kortanad

# Live log streaming
journalctl -u kortanad -f

# Restart service
sudo systemctl restart kortanad

# Stop service
sudo systemctl stop kortanad
```

Log color codes:
- 👑 **Block Production** — Node is elected leader
- ✅ **Finality** — Block confirmed by BFT quorum
- 🔵 **RPC** — Incoming API request handled
- 🟣 **Mempool** — Transaction received or evicted
- 🔴 **Error / Slashing** — Critical event requiring attention

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| `SECURITY_AUDIT.md` | Full security audit report |
| `FINAL_STATUS_REPORT.md` | Comprehensive project status |
| `CLI_HELP.md` | CLI flags & staking guide |
| `DEPLOY.md` | Production deployment guide |
| `CROSS_PLATFORM_GUIDE.md` | Multi-OS build instructions |
| `CONTRACT_DEPLOYMENT_FIXED.md` | Smart contract deployment guide |

---

## 🧑‍💻 Development & Contributing

We welcome contributions from the community!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Write tests for your changes
4. Ensure all tests pass: `cargo test --all`
5. Submit a Pull Request

**Code Standards:**
- Zero clippy warnings (enforced in CI)
- All public functions must be documented
- New features must include integration tests

---

## 📞 Support & Community

- **Issues:** [GitHub Issues](https://github.com/EmekaIwuagwu/kortanablockchain-devhub/issues)
- **Discussions:** [GitHub Discussions](https://github.com/EmekaIwuagwu/kortanablockchain-devhub/discussions)

---

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 🔖 Version Information

| Field | Value |
|-------|-------|
| **Specification Version** | 2.0.0 |
| **Language** | Rust (stable 1.70+) |
| **Mainnet Chain ID** | 9002 |
| **Testnet Chain ID** | 72511 |
| **Target Standard** | Polkadot / Cosmos / Solana Tier |
| **Testnet Status** | 🟢 LIVE |
| **Mainnet Status** | 🟢 LIVE |
| **Mainnet Launch Date** | February 2026 |
| **Developed by** | Kortana Core Team |
| **Built with** | Rust (stable 1.70+) |

---

<div align="center">

**Status: MAINNET LIVE — READY FOR DAPP INTEGRATION & ECOSYSTEM DEVELOPMENT**

[![Rust](https://img.shields.io/badge/Made%20with-Rust-orange?logo=rust)](https://www.rust-lang.org/)
[![Security](https://img.shields.io/badge/Security-Audited-success)](./SECURITY_AUDIT.md)
[![Testnet](https://img.shields.io/badge/Testnet-LIVE-brightgreen)](https://explorer.kortana.worchsester.xyz)
[![Mainnet](https://img.shields.io/badge/Mainnet-LIVE-brightgreen)](https://explorer.mainnet.kortana.xyz)

**Built with ❤️ for the decentralized future and the Kortana Smart City Initiative**

[⬆ Back to Top](#-kortana-blockchain--production-grade-layer-1-protocol)

</div>
