# 🪐 AETHER | Fractional Real Estate Platform

A premium, institutional-grade platform for fractionalizing luxury real estate on the **Kortana Blockchain**. AETHER allows investors to own pieces of high-yield properties across the globe through secure, transparent, and liquid smart contracts.

---

## 🚀 The "Paris Fix" (Success Details)
**Yes, the downgrade worked!** 
The previous deployment failures were caused by the `PUSH0` opcode introduced in Solidity `0.8.20`. Since the Kortana Testnet RPC did not support this specific opcode yet, the transactions were reverting with `Parse error: EOF`. 

**The Solution:**
We re-configured the Hardhat compiler to target the **Paris EVM Version**. This ensures the contracts use widely compatible opcodes while maintaining all the security features of Solidity `0.8.20`.

---

## 🏗️ Smart Contract Architecture (Kortana Testnet)

The platform is powered by a suite of interconnected smart contracts deployed on the **Kortana Poseidon Testnet** (Chain ID: `72511`).

| Contract Name | Address | Purpose |
| :--- | :--- | :--- |
| **EscrowManager** | `0x02A9C676d21863F5778D9A623fD62b70BBc32e23` | Handles investment locking and token distribution. |
| **PropertyRegistry** | `0xCb4211481D5647446728f4fBD88Bf69e025A3C07` | Central registry for all verified property assets. |
| **Platform Wallet** | `0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9` | Default owner and fee recipient address. |

### 🏠 Deployed Property Tokens (ERC20)

| ID | Property Title | Token Symbol | Contract Address |
| :--- | :--- | :--- | :--- |
| 1 | Modern Villa in Cascais | **MVC** | `0x1692Ec0372a1c95798411b7B6D6B62eEf8230592` |
| 2 | Acropolis View Apartment | **AVA** | `0x58F3359F31d132eF628A1643811Fc778F4b9c789` |
| 3 | Adriatic Coastal Suite | **ACS** | `0x7C4586B9ABD8cfF7A2387aa395b827c22DDf02b2` |

---

## 🛠️ Technology Stack

- **Blockchain:** Kortana (EVM Compatible)
- **Smart Contracts:** Solidity `0.8.20` (Paris EVM Target)
- **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion
- **Web3 Layer:** Wagmi & Viem (for Wallet connectivity and Contract interaction)
- **Backend:** Node.js (EVM Event Listeners)

---

## 📖 How to Run the Project

### 1. Smart Contracts
```bash
cd contracts
npm install
# Compile with Paris target
npx hardhat compile
# Deploy script
npx hardhat run scripts/deploy_all.cjs --network kortana_testnet
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend is pre-configured to read from `src/config/contracts.json`. Simply connect your MetaMask to the Kortana Testnet.

### 3. Backend
```bash
cd backend
npm install
npm run dev
```

---

## 💎 Features
- **Fractional Ownership:** Buy as little as 1 token (fraction) of a luxury property.
- **Golden Visa Insights:** Filter properties by residency eligibility.
- **Dynamic Yield Tracking:** Real-time calculation of expected APY.
- **Institution-Grade Security:** Fully audited open-zeppelin standard implementations.

---

**Built with pride for the Kortana Ecosystem.** 
*Last Deployment Sync: 2026-02-08 07:25 (UTC)*
