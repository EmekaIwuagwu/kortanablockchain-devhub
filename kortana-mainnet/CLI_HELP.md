
# 🚀 Kortana Node CLI & Staking Guide

Your Kortana node is now equipped with production-grade networking and staking capabilities.

## 🛠 CLI Options

The binary supports the following arguments:

| Flag | Description | Default |
|------|-------------|---------|
| `--rpc-addr` | IP and Port for the JSON-RPC server | `0.0.0.0:8545` |
| `--p2p-addr` | Multiaddr for P2P listening | `/ip4/0.0.0.0/tcp/30333` |
| `--bootnodes` | Comma-separated list of bootnodes | (Empty) |

**Example (Node 1):**
```bash
./kortana-blockchain-rust --rpc-addr 0.0.0.0:8545 --p2p-addr /ip4/0.0.0.0/tcp/30333
```

**Example (Node 2 - Connecting to Node 1):**
```bash
./kortana-blockchain-rust --rpc-addr 0.0.0.0:8546 --p2p-addr /ip4/0.0.0.0/tcp/30334 --bootnodes /ip4/127.0.0.1/tcp/30333
```

---

## 🥩 Staking DNR

Staking is built directly into the protocol via a "System Contract".

### Staking Contract Address
`kn:0000000000000000000000000000000000000001`

### Commands (Transaction Data)
To perform staking actions, send a transaction to the Staking Contract with the following `data`:

| Action | Byte 0 | Data Bytes [1..25] | Note |
|--------|---------|---------------------|------|
| **Delegate** | `0x01` | Validator Address (24 bytes) | `value` = Amount to stake |
| **Undelegate** | `0x02` | Validator Address (24 bytes) | `value` = Amount to unstake |

### Querying Staking Info (JSON-RPC)

#### 1. List All Validators
```bash
curl -X POST http://localhost:8545 -d '{"jsonrpc":"2.0","method":"eth_stakingValidators","params":[],"id":1}'
```

#### 2. Check My Delegations
```bash
curl -X POST http://localhost:8545 -d '{"jsonrpc":"2.0","method":"eth_stakingInfo","params":["YOUR_ADDRESS"],"id":1}'
```

---

## ⚡ EVM Compatibility
The node now supports standard precompiles like **ecrecover**, making it compatible with:
- Uniswap-style permit signatures
- OpenZeppelin ECDSA libraries
- Gnosis Safe multisigs

Your node is now ready for a multi-node Testnet deployment!
