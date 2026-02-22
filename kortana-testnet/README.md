# ⚔️ Kortana Blockchain — Testnet Node (Rust)

> **Status: 🟢 LIVE & SECURED (v1.0.0-Testnet)**

Welcome to the Kortana Testnet Node — the developer-facing environment for building, testing, and deploying dApps on the Kortana Layer 1 protocol.

---

## 🌐 Testnet Network Details

| Field | Value |
|-------|-------|
| **Network Name** | Kortana Testnet |
| **RPC URL** | `https://poseidon-rpc.kortana.worchsester.xyz` |
| **Chain ID** | `72511` |
| **Currency Symbol** | `DNR` |
| **Block Explorer** | `https://explorer.kortana.worchsester.xyz` |

---

## 🚀 Quick Start

### 1. Clone & Build

```bash
git clone https://github.com/EmekaIwuagwu/kortanablockchain-devhub.git
cd kortanablockchain-devhub/kortana-testnet

cp .env.example .env
# Edit .env and set your VALIDATOR_PRIVATE_KEY

cargo build --release
```

### 2. Run the Node

```bash
# Start in foreground
./target/release/kortana-blockchain-rust \
  --rpc-addr 0.0.0.0:8545 \
  --p2p-addr /ip4/0.0.0.0/tcp/30333

# Start in background (recommended)
nohup ./target/release/kortana-blockchain-rust \
  --rpc-addr 0.0.0.0:8545 \
  --p2p-addr /ip4/0.0.0.0/tcp/30333 \
  > node.log 2>&1 &

# Monitor
tail -f node.log
```

### 3. Connect a Second Node

```bash
# Node 2 connecting to Node 1 via bootnode
nohup ./target/release/kortana-blockchain-rust \
  --rpc-addr 0.0.0.0:8546 \
  --p2p-addr /ip4/0.0.0.0/tcp/30334 \
  --bootnodes /ip4/<NODE_1_IP>/tcp/30333 \
  > node2.log 2>&1 &
```

---

## ⚙️ CLI Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--rpc-addr` | JSON-RPC server bind address | `0.0.0.0:8545` |
| `--p2p-addr` | P2P listening Multiaddr | `/ip4/0.0.0.0/tcp/30333` |
| `--bootnodes` | Comma-separated bootnode Multiaddrs | (none) |
| `--wallet` | Generate a new validator keypair | (disabled) |
| `--test` | Run protocol self-diagnostic | (disabled) |

---

## ⚙️ Environment Configuration (.env)

| Key | Description | Default |
|-----|-------------|---------|
| `VALIDATOR_PRIVATE_KEY` | 64-hex char validator secret key | (Generated) |
| `RPC_ADDR` | Bind address for JSON-RPC | `0.0.0.0:8545` |
| `P2P_ADDR` | Bind address for P2P | `/ip4/0.0.0.0/tcp/30333` |
| `DB_PATH` | Ledger database path | `./data/kortana.db` |

> ⚠️ **Never commit your `.env` file to version control.**

---

## 🦊 Add to MetaMask

```
Network Name:    Kortana Testnet
RPC URL:         https://poseidon-rpc.kortana.worchsester.xyz
Chain ID:        72511
Symbol:          DNR
Block Explorer:  https://explorer.kortana.worchsester.xyz
```

---

## 🧪 Verify the Node is Running

```bash
# Check block number (remote)
curl -X POST https://poseidon-rpc.kortana.worchsester.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check block number (local dev)
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 🏧 Request Test Tokens (Faucet)

```bash
curl -X POST https://poseidon-rpc.kortana.worchsester.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_requestDNR","params":["YOUR_ADDRESS"],"id":1}'
```

---

## 🥩 Staking

Staking is built directly into the protocol as a system contract.

**Staking Contract Address:** `0x0000000000000000000000000000000000000001`

| Action | Byte 0 | Data Bytes [1..25] | `value` Field |
|--------|---------|---------------------|----------------|
| **Delegate** | `0x01` | Validator Address (24 bytes) | Amount to stake |
| **Undelegate** | `0x02` | Validator Address (24 bytes) | Amount to unstake |

**List Validators:**
```bash
curl -X POST https://poseidon-rpc.kortana.worchsester.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getValidators","params":[],"id":1}'
```

---

## 📊 Monitoring

```bash
sudo systemctl status kortanad
journalctl -u kortanad -f
sudo systemctl restart kortanad
```

---

## 🔒 Security

1. Open ports `30333` (P2P) and `8545` (RPC) in your cloud firewall
2. Never share your `VALIDATOR_PRIVATE_KEY`
3. To update: `git pull` → `cargo build --release` → restart

---

## 🔧 Run All Tests

```bash
cargo test --all -- --nocapture
```

---

**Built with ❤️ by the Kortana Core Team**
