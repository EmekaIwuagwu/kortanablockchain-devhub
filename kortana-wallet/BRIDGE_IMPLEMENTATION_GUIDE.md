# Kortana Bridge: Full Implementation Architecture

This document outlines the requirements to move from the current **Wallet MVP** to a **Production Cross-Chain Bridge**.

## 1. The Architecture
A bridge is NOT just a wallet feature; it is a three-tier system:

### Tier 1: On-Chain Smart Contracts
*   **Source Chain (Kortana)**: A `BridgePortal` contract.
    *   `lockNative()`: Receives DNR, holds it in escrow, and emits a `Deposit` event.
    *   `lockToken()`: Transfers ERC-20 from user to itself, emits event.
*   **Destination Chain (e.g., Sepolia)**: A `MintableWrappedAsset` contract.
    *   `mint(address to, uint256 amount)`: Creates "Wrapped DNR" (wDNR) on the destination.
    *   **Security**: This function MUST only be callable by the **Relayer Enclave**.

### Tier 2: The Off-Chain Relayer (The "Mind")
The wallet cannot be the only relayer because:
1.  **Trust**: The destination contract shouldn't trust a user's wallet to "say" they paid on the source.
2.  **Gas**: The relayer usually covers the destination gas to provide a better UX.
3.  **Finality**: The relayer waits for several blocks on Kortana to ensure the transaction isn't reverted (re-org) before minting on Sepolia.

### Tier 3: The Wallet (The "Interface")
The wallet (Current Enclave) handles:
1.  Requesting authorization (Approve/Permit).
2.  Initiating the `lock` transaction on the source.
3.  **Tracking**: Polished UI by listening for the Relayer's transaction on the destination.

## 2. why "Destination Cannot be Located"?
In the current MVP implementation:
*   The wallet generates a **verification pulse** on the destination to show a real hash.
*   **Problem**: If your wallet address on the destination (e.g., Sepolia) has **0 ETH**, the transaction fails.
*   **Fix**: You must have a small amount of gas on the target network, OR we must implement a **Gasless Relayer** service.

## 3. Implementation Checklist for Production
- [ ] **Contract Deployment**: Deploy `StandardBridge.sol` to Kortana and Sepolia.
- [ ] **Relayer Setup**: Deploy a Node.js/Go service (Kortana Relayer) that uses `ethers.js` to listen to the `BridgePortal`.
- [ ] **Authority**: Set the Relayer's address as the official `MINTER_ROLE` on the destination contracts.
- [ ] **API Integration**: Update `BridgeService.ts` to poll the Relayer's API for the real destination hash instead of simulating one.

## 4. Live Deployed Enclaves (Testnet)
*   **Kortana Portal**: `0xe0572C001B320dBd214C5ddB592C018FA5cedA4F`
*   **Avalanche Fuji (wDNR)**: `0xAB7A92C6EA47Cd1AB1734f422e10a62736f9d0c0`
*   **Base Sepolia (wDNR)**: *Pending (Needs Gas)*

---
**Senior Engineer's Note**: The wallet is now successfully targeting the live Portal on Kortana. To complete the bridge loop, we should now deploy a **Relayer Service** that listens for events from `0xe057...` and mints tokens on the destination chains.

