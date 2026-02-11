# KORTANA WALLET (POSEIDON) - EVM BLOCKCHAIN WALLET DEVELOPMENT SPECIFICATION

## Executive Summary

**ANTIGRAVITY** — You are a Senior Blockchain Engineer and Systems Architect tasked with designing and developing **Kortana Wallet (Poseidon)** — a production-grade EVM-compatible blockchain wallet built with **Next.js**. This wallet will function as both a **Chrome Extension** and **Web Application**, featuring MetaMask-equivalent core functionality plus proprietary blockchain backend integration capabilities.

As the primary designer and builder of the Poseidon Blockchain EVM Wallet, you will lead the technical architecture, implementation strategy, and delivery of this project. This specification serves as your blueprint for execution.

---

## 1. PROJECT OVERVIEW

### 1.1 Core Definition & Project Owner
- **Project Owner / Lead Architect**: Antigravity
- **Product**: Kortana Wallet (Poseidon) — EVM-compatible blockchain wallet
- **Architecture**: Next.js frontend, Chrome Extension + Web App dual deployment
- **Blockchain Target**: Rust-based, EVM-compatible Layer 1 blockchain with custom financial services capabilities
- **Design Philosophy**: Enterprise-grade security, intuitive UI/UX, extensible architecture
- **Comparable Product**: MetaMask with proprietary differentiators for financial services

### 1.2 Key Deliverables
1. Secure key management and account abstraction
2. Transaction signing and broadcasting
3. Smart contract interaction interface
4. Custom blockchain protocol integration (via extended JSON-RPC)
5. Multi-chain awareness with focus on Poseidon chain
6. Chrome Extension deployment mechanism
7. Web-based wallet interface
8. Advanced features: compliance verification, ESG tracking, risk simulation

---

## 2. CORE WALLET ARCHITECTURE

### 2.1 Technical Stack
```
Frontend:     Next.js 14+ (React, TypeScript)
State:        Redux Toolkit / Zustand
Styling:      Tailwind CSS + custom design system
Crypto:       ethers.js v6+ / web3.js
Storage:      Encrypted browser storage (Web Crypto API)
Build:        Webpack 5 (Chrome Extension), Next.js (Web)
Testing:      Jest + Playwright
```

### 2.2 Core Modules

#### A. **Key Management System**
- **HD Wallet Support**: BIP-39 mnemonics, BIP-44 derivation paths
- **Key Storage**: 
  - Browser IndexedDB (encrypted with user password)
  - Optional hardware wallet integration (Ledger, Trezor)
- **Security**: 
  - AES-256 encryption for private keys
  - Scrypt key derivation (configurable iterations)
  - Session timeout with automatic lock
  - Biometric unlock (Web Crypto API)

#### B. **Transaction Management**
- **Gas Estimation**: Custom RPC calls to `poseidon_estimateGas`
- **Transaction Building**: 
  - Standard EVM tx structure
  - Support for EIP-1559 (dynamic fees)
  - Custom nonce management with mempool awareness
- **Signing Flow**: 
  - Local signing (private key in browser)
  - Hardware wallet delegation
  - Batch transaction signing
- **Broadcasting**: 
  - Direct RPC submission via `eth_sendRawTransaction`
  - Transaction status polling
  - Retry logic with exponential backoff

#### C. **Smart Contract Interaction**
- **ABI Parser**: Dynamic contract ABI import
- **Function Encoding**: Automatic encoding via ethers.js
- **Event Decoding**: Real-time log parsing and human-readable rendering
- **Read-Only Calls**: `eth_call` for state queries without gas
- **Write Methods**: Full transaction signing flow

#### D. **Account Management**
- **Multi-Account Support**: Unlimited derived accounts per wallet
- **Account Naming**: Custom labels and emojis
- **Account Switching**: Seamless context switching
- **Account Recovery**: 12/24-word mnemonic recovery
- **Watch-Only Accounts**: Monitor addresses without private keys

---

## 3. PROPRIETARY POSEIDON BLOCKCHAIN FEATURES

### 3.1 Custom RPC Extensions
Your wallet will integrate five proprietary custom RPC methods that differentiate the Poseidon chain:

#### **Feature 1: Native ZK Compliance Verification**
```
RPC Method:    compliance_verifyIdentity
Namespace:     compliance_
Input:         {
                 proofData: string,        // ZK circuit output
                 criteriaHash: string,     // Hash of compliance criteria
                 userId: string,           // User identifier
                 txType: string            // e.g., "regulated_trade", "loan"
               }
Output:        {
                 approved: boolean,
                 txId: string,
                 timestamp: number,
                 expiryBlock: number
               }
Purpose:       Enable regulated financial transactions with privacy-preserving KYC/AML
Implementation: ZK library integration (circom/snarkjs) at node level
Wallet Feature: Pre-transaction compliance check; compliance badge display
```

**Wallet Integration Checklist:**
- [ ] UI component: "Verify Compliance" button in transaction review
- [ ] ZK proof generation helper library
- [ ] Compliance status persistence (cached credentials)
- [ ] Error messaging for failed verifications

---

#### **Feature 2: On-Chain ESG Impact Scoring**
```
RPC Method:    esg_getTransactionScore
Namespace:     esg_
Input:         {
                 transactionData: object,   // Full tx object
                 recipientAddress: string,
                 tokenAddress: string,
                 simulationMode: boolean    // Pre-tx vs post-tx
               }
Output:        {
                 score: number,             // 0-100
                 category: string,          // "excellent", "good", "neutral", "poor"
                 breakdown: {
                   carbon: number,
                   social: number,
                   governance: number
                 },
                 feeAdjustment: string,     // e.g., "5% rebate" or "2% penalty"
                 impact: string             // Human-readable impact summary
               }
Purpose:       Gamify sustainable finance; align transactions with ESG goals
Implementation: Oracle integration (Chainlink) + custom scoring algorithm
Wallet Feature: ESG score display pre/post-transaction; impact rewards dashboard
```

**Wallet Integration Checklist:**
- [ ] ESG dashboard showing historical scores
- [ ] Pre-transaction scoring simulation
- [ ] Reward tracking and redemption UI
- [ ] ESG report generation (exportable)
- [ ] Sorting/filtering txs by ESG impact

---

#### **Feature 3: Programmable Fiat-Backed Stablecoin Issuance**
```
RPC Method:    stable_issueCoin
Namespace:     stable_
Input:         {
                 amount: string,            // Wei or smallest unit
                 reserveProof: object,      // Oracle-verified reserve data
                 operatorAddress: string,
                 expiryDuration: number     // Seconds
               }
Output:        {
                 transactionHash: string,
                 tokenAddress: string,
                 mintedAmount: string,
                 rate: string               // Exchange rate locked
               }
Purpose:       Issue fiat-backed stablecoins with transparent, on-chain reserve verification
Implementation: Precompile for reserve proof verification; automated redemption logic
Wallet Feature: Mint/burn stablecoin interface; reserve transparency view; redemption requests
```

**Wallet Integration Checklist:**
- [ ] Mint stablecoin UI form
- [ ] Redemption request workflow
- [ ] Reserve transparency dashboard
- [ ] Rate lock display
- [ ] Historical mint/burn activity

---

#### **Feature 4: AI-Driven Risk Simulation for DeFi Actions**
```
RPC Method:    risk_simulateAction
Namespace:     risk_
Input:         {
                 actionType: string,        // "loan", "swap", "leverage", "pool"
                 actionParams: object,      // Amount, collateral ratio, etc.
                 userHistory: object,       // Optional historical data
                 marketData: object         // Real-time oracle feeds
               }
Output:        {
                 riskScore: number,         // 0-100 (0 = safest)
                 probability: {
                   default: number,         // % chance of liquidation/loss
                   slippage: number,
                   impermanentLoss: number
                 },
                 recommendations: [
                   {
                     adjustment: string,    // e.g., "reduce leverage by 20%"
                     impact: string
                   }
                 ],
                 safetyRating: string       // "safe", "moderate", "high-risk"
               }
Purpose:       Reduce DeFi losses through AI-powered pre-action risk assessment
Implementation: Lightweight ML models (ONNX format) embedded in RPC handler
Wallet Feature: Risk warnings in transaction review; personalized risk dashboard
```

**Wallet Integration Checklist:**
- [ ] Risk score display in transaction review modal
- [ ] Recommendation suggestions with one-click apply
- [ ] Risk history and trends
- [ ] Safety rating badges
- [ ] Educational tooltips on risk factors

---

#### **Feature 5: Hybrid Permissioned Sub-Networks**
```
RPC Method:    hybrid_createSubNet
Namespace:     hybrid_
Input:         {
                 subNetName: string,
                 permissions: object,       // Whitelist of addresses/roles
                 consensusConfig: object,   // Custom rules
                 settlementMode: string     // "atomic" or "periodic"
               }
Output:        {
                 subNetId: string,
                 accessKey: string,
                 mainChainSettlementAddress: string,
                 status: string             // "active", "pending"
               }
Purpose:       Enable private enterprise finance while maintaining main chain security
Implementation: Custom consensus layer with main chain bridge
Wallet Feature: Sub-net switching context; permissioned tx approval; settlement monitoring
```

**Wallet Integration Checklist:**
- [ ] Sub-net discovery and switching UI
- [ ] Permission management interface
- [ ] Separate account contexts per sub-net
- [ ] Settlement tracking dashboard
- [ ] Main chain bridge transaction history

---

## 4. WALLET UI/UX ARCHITECTURE

### 4.1 Core Pages & Views

#### Extension (Popup Context - 360px width)
```
Dashboard
├── Account display (address, balance)
├── Recent transactions
├── Quick action buttons (send, receive, buy)
└── Settings access

Accounts
├── Account list with balances
├── Account switcher
├── Add new account modal
└── Import account options

Send
├── Recipient address input with validation
├── Amount input with conversion
├── Gas fee editor
├── Transaction preview
└── Confirmation

Receive
├── QR code display
├── Copy address
├── Share options

Settings
├── Network configuration
├── Security settings
├── Privacy settings
├── About & support
```

#### Web Application (Full-width)
```
Dashboard
├── Wallet overview with charts
├── Portfolio by asset
├── Transaction history (filterable, exportable)
├── Network selector
└── Advanced features

Features
├── Compliance verification dashboard
├── ESG impact tracking
├── Stablecoin management
├── Risk simulator
├── Sub-net management

Settings
├── Account management
├── Security center
├── Connected apps/permissions
├── Preferences
```

### 4.2 Design Requirements
- **Brand**: "Drop dead gorgeous and very beautiful" — premium, modern aesthetic
- **Color Palette**: TBD (integrate Kortana branding)
- **Accessibility**: WCAG 2.1 AA minimum
- **Performance**: <1s page load, <100ms interactions
- **Responsive**: Mobile-first; breakpoints at 375px, 768px, 1024px

---

## 5. SECURITY ARCHITECTURE

### 5.1 Key Security Requirements
- **Private Key Security**: 
  - Never stored unencrypted
  - Never sent to external services
  - Cleared from memory after use
  - Zero server-side key management
  
- **Content Security Policy**: Strict CSP headers for extension
- **Session Management**: Auto-lock after inactivity (configurable, default 15 min)
- **Permissions Model**: 
  - dApp connection approvals with per-method scoping
  - Transaction signing requires explicit user confirmation
  - Read-only methods auto-approved after initial connection

### 5.2 Security Audit Checklist
- [ ] Private key handling review (no leaks in logs, memory)
- [ ] Smart contract audit (if deploying contracts)
- [ ] Extension manifest security review
- [ ] Content Security Policy hardening
- [ ] Dependency vulnerability scanning (Snyk, npm audit)
- [ ] Third-party audit (recommended pre-mainnet)

---

## 6. DEPLOYMENT ARCHITECTURE

### 6.1 Chrome Extension Deployment
```
Build Output:
├── manifest.json (v3)
├── background.html + service worker
├── popup.html + popup bundle
├── content.js (for dApp injection)
└── assets/

Deployment:
1. Build Next.js as static export
2. Repackage as Chrome extension ZIP
3. Sign with private key
4. Submit to Chrome Web Store
5. Configure auto-updates via manifest
```

### 6.2 Web Application Deployment
```
Hosting:      Vercel / AWS CloudFront + S3
Database:     (Optional) For user preferences sync
CDN:          CloudFront for assets
HTTPS:        Required; auto-renew SSL
Domain:       kortana-wallet.io (example)

CI/CD:
├── GitHub Actions for testing
├── Automated builds on push
├── Staging environment preview
└── Production deployment approval
```

---

## 7. DEVELOPMENT ROADMAP

### **Phase 1: MVP (Weeks 1-4)**
- [ ] Basic account creation/import
- [ ] Send/receive transactions
- [ ] Balance display
- [ ] Basic settings
- [ ] Extension packaging

### **Phase 2: Feature Expansion (Weeks 5-8)**
- [ ] Multi-account support
- [ ] Smart contract interaction
- [ ] Advanced transaction options (gas, nonce)
- [ ] Web app launch
- [ ] Compliance RPC integration

### **Phase 3: Proprietary Features (Weeks 9-12)**
- [ ] ESG scoring integration
- [ ] Risk simulator
- [ ] Stablecoin interface
- [ ] Sub-net support
- [ ] Advanced dashboards

### **Phase 4: Optimization & Security (Weeks 13-16)**
- [ ] Performance audit
- [ ] Security audit
- [ ] User testing
- [ ] Mainnet preparation
- [ ] Marketing launch

---

## 8. TECHNOLOGY DECISIONS & RATIONALE

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js | SSR/SSG capable, excellent extension bundling, built-in optimization |
| State Management | Redux/Zustand | Enterprise-grade predictability for wallet state |
| Signing | ethers.js v6 | Type-safe, modern API, superior to web3.js |
| Storage | IndexedDB + localStorage | Better quota than localStorage alone; encryption layer |
| Extension | Manifest v3 | Future-proofed; aligns with Chrome's direction |
| Testing | Jest + Playwright | Unit + E2E; browser automation for extension testing |

---

## 9. SUCCESS METRICS & KPIs

- **Technical**: 
  - Page load <1s, Lighthouse score >90
  - Zero critical security vulnerabilities
  - 95%+ test coverage for core modules
  
- **User**: 
  - 10k+ weekly active users (target for launch)
  - <2% transaction failure rate
  - 4.5+ app store rating
  
- **Business**: 
  - $X in transaction volume
  - Y% compliance verification adoption
  - Z% ESG feature usage

---

## 10. GLOSSARY & KEY TERMS

- **EVM**: Ethereum Virtual Machine — compatible bytecode execution environment
- **RPC**: Remote Procedure Call — blockchain node API communication protocol
- **ZKP**: Zero-Knowledge Proof — cryptographic proof without revealing data
- **ABI**: Application Binary Interface — smart contract function/event definitions
- **Precompile**: Low-level contract at fixed address for high-performance operations
- **Sub-net**: Permissioned blockchain operating within/alongside the main chain

---

## NEXT STEPS

1. **Validate Tech Stack**: Confirm Next.js 14+, ethers.js v6+ adoption
2. **Design System**: Create Figma design file with brand guidelines
3. **RPC Integration**: Coordinate with blockchain team on custom RPC implementation
4. **Security Plan**: Engage security audit firm
5. **Testing Strategy**: Define unit test coverage targets and E2E test scenarios
6. **Timeline**: Lock in 16-week roadmap with team

---

**Document Version**: 1.1  
**Last Updated**: February 2026  
**Project Owner**: Antigravity (Senior Blockchain Engineer & Systems Architect)  
**Primary Responsibility**: Design, Development, and Delivery of Poseidon Blockchain EVM Wallet  
**Audience**: Antigravity, Development Team, Stakeholders, and Investors
