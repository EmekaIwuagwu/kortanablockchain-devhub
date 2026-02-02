# Kortana Network Configuration

This document contains the canonical configuration for the Kortana Poseidon Testnet.

## Chain Details

- **Chain Name**: Kortana Testnet
- **Network ID**: 72511
- **Chain ID (Hex)**: 0x11B3F
- **Native Currency**: DNR (18 decimals)
- **Consensus**: BFT-POW Hybrid

## Endpoints

- **Public RPC**: `https://poseidon-rpc.kortana.worchsester.xyz`
- **WebSocket (WSS)**: `wss://poseidon-rpc.kortana.worchsester.xyz/ws` (Soon)
- **Explorer**: `https://explorer.kortana.worchsester.xyz`
- **Faucet**: `https://kortana.worchsester.xyz/faucet`

## Manual Wallet Configuration (MetaMask)

1. Open MetaMask and click the Network selector.
2. Click **Add Network** -> **Add a network manually**.
3. Enter the following details:
   - **Network Name**: Kortana Testnet
   - **New RPC URL**: `https://poseidon-rpc.kortana.worchsester.xyz`
   - **Chain ID**: `72511`
   - **Currency Symbol**: `DNR`
   - **Block Explorer**: `https://explorer.kortana.worchsester.xyz`
4. Click **Save**.

## SDK Example (ethers.js)

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://poseidon-rpc.kortana.worchsester.xyz");

// Network check
const network = await provider.getNetwork();
console.log("Connected to:", network.name, "(ChainID:", network.chainId, ")");
```

