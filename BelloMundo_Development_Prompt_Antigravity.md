# BELLOMUNDO — FULL PRODUCT & DEVELOPMENT BRIEF
### Prepared for: Antigravity Design & Engineering Studio
### Authored by: Senior Fullstack Developer / Senior Blockchain Integrations Engineer / Blockchain Core Developer
### Project Classification: Smart City Financial Infrastructure — Web3 Native
### Document Version: 1.0 — FINAL

---

> *"BelloMundo is not a payments app. It is the financial operating system of the smart city — the settlement layer for an entire civilization, denominated in its own currency, running on its own blockchain."*

---

## TABLE OF CONTENTS

1. Project Overview & Vision
2. Brand Identity & Design Language
3. Color System & Typography
4. Logo Direction
5. Technology Stack
6. System Architecture Overview
7. Blockchain Integration Specification (Kortana + MetaMask)
8. Feature Modules & Payment Verticals
9. Complete Payment Flow — Step by Step
10. Screen-by-Screen UI Specification
11. Database Schema (MongoDB)
12. API Architecture
13. Smart Contract Integration Points
14. Security & Compliance Requirements
15. Performance & Accessibility Standards
16. Deliverables Checklist

---

## 1. PROJECT OVERVIEW & VISION

### 1.1 What is BelloMundo?

**BelloMundo** (Italian/Spanish: *Beautiful World*) is a next-generation Smart City payment platform built on the **Kortana Blockchain**, settling all transactions in **DNR (Dinar)** — the native currency of the Kortana ecosystem. It is the single financial interface through which residents, visitors, and investors of a Smart City interact with every economic touchpoint in their urban life.

BelloMundo is not a crypto wallet UI. It is not a DeFi dashboard. It is not another fintech clone. It is a **civic financial operating system** — as familiar as Airbnb, as powerful as a bank, as beautiful as the city it serves.

### 1.2 The Problem it Solves

Today, urban residents interact with 8–15 different payment systems to manage their civic financial life: one app for rent, another for electricity, a bank website for mortgage, a separate portal for EV lease, a POS terminal for the gym, a card reader for the cab. These systems don't talk to each other, don't share identity, and certainly don't settle on a shared, transparent ledger.

BelloMundo collapses all of this into **one beautiful, unified interface** — a single platform where every payment in the city is initiated, verified, and settled on-chain in DNR.

### 1.3 Target Users

- **Residents** — People who live in BelloMundo Smart City, paying rent, utilities, mortgages
- **Visitors / Short-stay Tenants** — People booking short-term accommodation
- **Property Investors** — Purchasing homes or commercial property on-chain
- **e-Residents** — Digital residents who hold a BelloMundo e-Residency Card
- **EV Owners** — Managing EV purchase, lease, and charging payments
- **Business Operators** — Gyms, service providers, utility companies receiving DNR

### 1.4 Investor-Facing Value Proposition

BelloMundo represents the **monetization layer** of the Smart City. Every transaction — from a morning cab ride to a 30-year mortgage — flows through Kortana Blockchain and settles in DNR. This creates:

- **Monetary velocity** for DNR, increasing its fundamental utility and value
- **On-chain financial identity** for every resident
- **Transparent, immutable** civic financial records
- **A replicable model** for smart cities globally — BelloMundo is the financial OS that can be licensed to every smart city development in the world

The total addressable market is not "crypto payments." It is **every financial transaction inside every city on earth.**

---

## 2. BRAND IDENTITY & DESIGN LANGUAGE

### 2.1 Brand Personality

BelloMundo should feel like **the future made livable**. Not cold. Not intimidating. Not crypto-bro aesthetic with Lambo references and laser eyes. The brand personality is:

- **Visionary but warm** — This is where people live. It should feel like home, but home in 2045.
- **Trustworthy but exciting** — Financial infrastructure requires trust. But BelloMundo also represents something genuinely new and exhilarating.
- **Sophisticated but accessible** — A grandmother and a blockchain engineer should both understand how to pay their electricity bill.
- **Global but civic** — It feels like it belongs to the world, but it is deeply rooted in the community it serves.

### 2.2 Visual Aesthetic — "Warm Futurism"

The design direction is called **Warm Futurism**. This is a deliberate counter to the cold, neon-drenched cyberpunk aesthetic that dominates blockchain design. Instead:

- **Deep teals and oceanic blues** replace electric neon cyan
- **Warm golds and amber** replace cold yellow
- **Obsidian and near-black** replace pure black
- **Soft ivory and warm white** replace cold clinical white
- **Living city visualizations** — gentle, animated aerial views of the smart city in the background, like looking down from above at a living, breathing urban ecosystem
- **Glassmorphism** — frosted glass cards and panels that let the city breathe behind them
- **Subtle bioluminescence** — interface elements that pulse gently, like the city has a heartbeat

### 2.3 Reference Points for Antigravity

The design team should draw visual inspiration from:

- **Architectural direction**: Zaha Hadid's fluid organic futurism. Not the harsh angular grid of Blade Runner — more like a city that grew organically but intelligently.
- **Interface direction**: The spatial UI design from Apple Vision Pro, the depth and material quality of iOS 17+, the whitespace discipline of Linear.app
- **Motion direction**: The gentle environmental animations of Stripe's marketing site, the fluid transitions of Framer.com
- **Color emotion**: The warmth and sophistication of Aesop's brand applied to a futuristic context
- **City visualization**: Nighttime aerial views of Singapore or Dubai — where city lights create rivers of gold and teal against dark urban topology

---

## 3. COLOR SYSTEM & TYPOGRAPHY

### 3.1 Primary Color Palette

```
PRIMARY — Kortana Teal (Brand Signature)
  Deep Teal:        #0A3D62   — primary brand color, navigation, key UI chrome
  Kortana Teal:     #1A7A8A   — primary buttons, active states, CTAs
  Bright Teal:      #22D3EE   — accents, hover states, blockchain confirmations

SECONDARY — Dinar Gold (DNR Currency Color)
  Deep Gold:        #92400E   — warning states, premium tiers
  Warm Gold:        #D97706   — DNR currency amounts, financial figures
  Soft Gold:        #FCD34D   — highlights, icons, small accents

NEUTRAL — Obsidian Scale
  Obsidian:         #0B0F1A   — primary background (dark mode)
  Deep Navy:        #111827   — card backgrounds, elevated surfaces
  Slate:            #1F2937   — secondary surfaces, modals
  Muted:            #374151   — borders, dividers
  Dim Text:         #6B7280   — supporting text, metadata
  Body Text:        #D1D5DB   — primary body text on dark
  Bright Text:      #F9FAFB   — headings, emphasis on dark

LIGHT MODE EQUIVALENT
  Canvas:           #F8FAFC   — page background
  Surface:          #FFFFFF   — card backgrounds
  Border:           #E2E8F0   — dividers, outlines
  Body:             #1E293B   — primary text

SEMANTIC COLORS
  Success:          #10B981   — payment confirmed, transaction success
  Warning:          #F59E0B   — pending, awaiting confirmation
  Error:            #EF4444   — failed transaction, error states
  Info:             #3B82F6   — informational, blockchain explorer links

GRADIENT SYSTEM
  Hero Gradient:    linear-gradient(135deg, #0A3D62 0%, #1A7A8A 50%, #0B0F1A 100%)
  Gold Gradient:    linear-gradient(135deg, #D97706 0%, #FCD34D 100%)
  City Glow:        radial-gradient(ellipse at center, rgba(26,122,138,0.15) 0%, transparent 70%)
  Card Glass:       backdrop-filter: blur(20px); background: rgba(17,24,39,0.7)
```

### 3.2 Typography System

```
DISPLAY / HEADLINES
  Font Family:      "Sora" (Google Fonts) — geometric, clean, slightly futuristic
  Fallback:         "Inter", system-ui, sans-serif
  
  Display XL:       font-size: 72px; font-weight: 800; letter-spacing: -2px; line-height: 1.0
  Display L:        font-size: 56px; font-weight: 700; letter-spacing: -1.5px; line-height: 1.1
  H1:               font-size: 40px; font-weight: 700; letter-spacing: -1px
  H2:               font-size: 32px; font-weight: 600; letter-spacing: -0.5px
  H3:               font-size: 24px; font-weight: 600
  H4:               font-size: 20px; font-weight: 600

BODY & UI
  Font Family:      "Inter" (Google Fonts) — ultimate legibility, UI-native
  
  Body L:           font-size: 18px; font-weight: 400; line-height: 1.7
  Body M:           font-size: 16px; font-weight: 400; line-height: 1.6
  Body S:           font-size: 14px; font-weight: 400; line-height: 1.5
  Caption:          font-size: 12px; font-weight: 500; letter-spacing: 0.4px

MONOSPACE (Blockchain Data)
  Font Family:      "JetBrains Mono" — for tx hashes, wallet addresses, amounts
  Usage:            All blockchain addresses, transaction IDs, DNR amounts in confirmations

NUMERIC / FINANCIAL
  Font Feature:     font-variant-numeric: tabular-nums — all financial figures must be tabular
  DNR Amounts:      Always displayed with "◈" (custom DNR symbol) prefix or "DNR" suffix
```

### 3.3 Spacing & Grid System

```
Base Unit:          8px
Grid:               12-column, 24px gutter, max-width 1440px
Container padding:  0 24px (mobile), 0 48px (tablet), 0 80px (desktop)

Spacing Scale (Tailwind-compatible):
  xs:   4px    (0.5)
  sm:   8px    (1)
  md:   16px   (2)
  lg:   24px   (3)
  xl:   32px   (4)
  2xl:  48px   (6)
  3xl:  64px   (8)
  4xl:  96px   (12)
  5xl:  128px  (16)
```

---

## 4. LOGO DIRECTION

### 4.1 Logo Concept — "The Meridian Mark"

The BelloMundo logo should convey: **a city, a globe, a currency, a future**.

**Primary Mark Concept:**
A geometric abstract cityscape silhouette integrated within a circular form — suggesting both a globe and a coin. The silhouette should be formed by clean, minimalist building shapes of varying heights, with a subtle arc suggesting a horizon line. The circle has a thin, elegant ring with a slight break at the top — suggesting incompleteness, growth, the city still being built.

The lettermark below reads **BELLO MUNDO** with generous tracking. "BELLO" in weight 700, "MUNDO" in weight 300, creating visual tension that suggests both strength and elegance. Below both, in very small caps: **SMART CITY PAYMENTS**.

**Color Treatment:**
- Primary: Deep Teal (#0A3D62) icon + "BELLO" in Obsidian (#0B0F1A)
- The circle ring: Gold Gradient (#D97706 → #FCD34D)
- "MUNDO" in Kortana Teal (#1A7A8A)
- On dark backgrounds: icon in Gold Gradient, text in white

**Symbol Variants:**
- Full horizontal lockup (logo + wordmark)
- Stacked vertical lockup (logo above wordmark)
- Icon only (for app icons, favicons, loading screens)
- Monochrome white (for dark hero sections)
- Monochrome black (for printed materials)

**DNR Symbol:**
Design a custom glyph for the Dinar currency: a "D" with two horizontal strokes through the vertical stem, similar to how ₿ relates to B. This should become the standardized DNR symbol throughout the platform: **◈ DNR** or a custom unicode-registerable glyph.

---

## 5. TECHNOLOGY STACK

### 5.1 Frontend

```
Framework:          Next.js 14+ (App Router)
Styling:            Tailwind CSS 3.4+ with custom design tokens
Component Library:  shadcn/ui (base) + custom components built on top
Animation:          Framer Motion 11+ — all page transitions, micro-interactions
3D / City Visual:   Three.js (r3f / React Three Fiber) — for hero city visualization
State Management:   Zustand — global app state (wallet, user, cart)
Data Fetching:      TanStack Query (React Query v5) — server state, caching
Forms:              React Hook Form + Zod validation
Type Safety:        TypeScript 5.x — strict mode enabled
Icons:              Lucide React + custom SVG icon set
Charts/Data:        Recharts — for payment history, city analytics dashboards
Maps (optional):    Mapbox GL — city property map view
```

### 5.2 Backend

```
Runtime:            Node.js 20+ LTS
API Framework:      Next.js API Routes (App Router) + Route Handlers
Database:           MongoDB 7.x (Atlas)
ODM:                Mongoose 8.x with TypeScript
Authentication:     NextAuth.js v5 (Auth.js) — wallet-based auth + traditional
Session:            JWT (signed) stored in HTTP-only cookies
File Storage:       AWS S3 or Cloudflare R2 — for property images, documents
Email:              Resend or SendGrid — transactional emails
Job Queue:          BullMQ + Redis — for async blockchain confirmations
Caching:            Redis (Upstash) — session cache, rate limiting
```

### 5.3 Blockchain

```
Primary Chain:      Kortana Blockchain (mainnet + testnet)
Kortana SDK:        @kortana/sdk (custom SDK — see Section 7)
Secondary Wallet:   MetaMask (via ethers.js v6 or viem)
Web3 Library:       viem + wagmi v2 — industry standard React hooks for blockchain
Standards:          ERC-20 compatible (DNR token) + custom Kortana standards
Contract Language:  Solidity 0.8.x (for any bridging contracts)
Contract Testing:   Hardhat + Chai
```

### 5.4 Infrastructure & DevOps

```
Hosting:            Vercel (frontend + API) or custom deployment
CI/CD:              GitHub Actions
Monitoring:         Sentry (errors) + Datadog (APM)
Analytics:          PostHog (product analytics) — privacy-first
Environment:        Separate dev / staging / production environments
SSL:                Automatic via Vercel / Cloudflare
CDN:                Cloudflare
```

---

## 6. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ┌──────────────────────┐    ┌─────────────────────────────┐    │
│  │   BelloMundo Next.js │    │  Kortana Wallet Extension   │    │
│  │   Web Application    │◄──►│  OR MetaMask Extension      │    │
│  └──────────┬───────────┘    └─────────────────────────────┘    │
└─────────────┼───────────────────────────────────────────────────┘
              │ HTTPS
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API LAYER (Vercel)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │ Auth Routes │  │Payment APIs │  │  Blockchain Relay     │    │
│  │ /api/auth   │  │ /api/pay    │  │  /api/blockchain      │    │
│  └─────────────┘  └─────────────┘  └──────────────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │  User APIs  │  │ Property API│  │  Notification Service │    │
│  │  /api/user  │  │ /api/props  │  │  /api/notify          │    │
│  └─────────────┘  └─────────────┘  └──────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐    ┌────────────────────────┐
│   MongoDB Atlas     │    │   Kortana Blockchain    │
│   (Primary DB)      │    │   RPC Node              │
│                     │    │                         │
│  Collections:       │    │  Contracts:             │
│  - users            │    │  - DNRToken.sol         │
│  - properties       │    │  - PaymentRouter.sol    │
│  - transactions     │    │  - EscrowVault.sol      │
│  - bookings         │    │  - MortgageRegistry.sol │
│  - utilities        │    │  - eResidency.sol       │
│  - vehicles         │    │  - UtilitySettler.sol   │
│  - evPayments       │    │                         │
│  - gymMemberships   │    └────────────────────────┘
│  - notifications    │
└─────────────────────┘
```

### 6.1 Core Architectural Principles

**Blockchain-First Settlement, Web2-Grade UX**: Every payment ultimately settles on Kortana Blockchain, but the user never sees gas fees, confirmations, or cryptographic complexity unless they actively want to. The interface abstracts all blockchain anxiety.

**Optimistic UI Updates**: When a user submits a payment, the UI immediately reflects the "pending" state and shows a beautiful animation. It does not wait for blockchain confirmation before giving feedback. Confirmation arrives as a notification.

**Event-Driven Architecture**: The BullMQ job queue listens to Kortana Blockchain events. When a transaction is confirmed on-chain, it triggers: database update → push notification → email receipt → dashboard refresh.

**Non-custodial by default**: BelloMundo never holds user funds. All payments flow directly from the user's wallet (Kortana Wallet or MetaMask) to the recipient smart contract. BelloMundo is the interface, not the bank.

---

## 7. BLOCKCHAIN INTEGRATION SPECIFICATION

### 7.1 Kortana Blockchain

Kortana is the purpose-built blockchain for this Smart City ecosystem. Assume:

- **EVM-compatible** (Ethereum Virtual Machine) — this allows use of standard tooling (ethers.js, viem, Hardhat)
- **Custom Chain ID** — to be provided by the Kortana team. Staging and production chain IDs must be environment-variable-controlled.
- **RPC Endpoint** — `https://rpc.kortana.network` (mainnet), `https://rpc-testnet.kortana.network` (testnet)
- **Block Explorer** — `https://explorer.kortana.network` — all transaction links should deep-link here
- **Native currency**: DNR (Dinar) — used for gas fees AND as the payment currency
- **Finality time**: Target < 3 seconds for user-facing payments. If Kortana uses a PoA or PoS mechanism with fast finality, this is achievable.

### 7.2 Wallet Connection Architecture

```typescript
// Wallet connection supports two providers:
// 1. Kortana Wallet (preferred) — window.kortana injected provider
// 2. MetaMask — window.ethereum injected provider

// Implementation using wagmi v2 + viem:

const kortanaChain = defineChain({
  id: KORTANA_CHAIN_ID,               // from env var
  name: 'Kortana Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Dinar',
    symbol: 'DNR',
  },
  rpcUrls: {
    default: { http: [process.env.KORTANA_RPC_URL] }
  },
  blockExplorers: {
    default: { name: 'Kortana Explorer', url: 'https://explorer.kortana.network' }
  }
})

// Connectors configured:
const connectors = [
  kortanaWalletConnector({ chainId: KORTANA_CHAIN_ID }),  // Kortana Wallet SDK
  metaMask({ chains: [kortanaChain] }),                    // MetaMask with Kortana network
]
```

### 7.3 Payment Router Smart Contract

All payments route through a single **PaymentRouter.sol** contract that dispatches to the appropriate handler:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPaymentRouter {
    enum PaymentType {
        RENTAL,
        ELECTRICITY,
        HOME_PURCHASE,
        MORTGAGE_INSTALLMENT,
        EV_PURCHASE,
        EV_LEASE,
        CAB_FARE,
        UTILITY_BILL,
        GYM_MEMBERSHIP,
        E_RESIDENCY_CARD,
        GENERAL_SERVICE
    }

    struct PaymentRequest {
        PaymentType paymentType;
        address recipient;          // service provider or escrow
        uint256 amount;             // in DNR wei (18 decimals)
        bytes32 referenceId;        // off-chain booking/order reference
        uint256 deadline;           // unix timestamp — payment expires
        bytes metadata;             // ABI-encoded type-specific data
    }

    event PaymentSettled(
        address indexed payer,
        address indexed recipient,
        PaymentType indexed paymentType,
        uint256 amount,
        bytes32 referenceId,
        uint256 timestamp
    );

    function settlePayment(PaymentRequest calldata request) external payable;
    function settlePaymentWithDNRToken(PaymentRequest calldata request, uint256 tokenAmount) external;
}
```

### 7.4 Escrow Vault (Property Purchases & Mortgages)

Large transactions (property purchase, EV purchase) use an escrow pattern:

```
User → EscrowVault.sol (holds funds until conditions met) → Seller
                            │
                            └── Triggered by: 
                                - Admin multisig approval
                                - Document verification oracle
                                - Time-lock expiry
```

### 7.5 DNR Token Standard

DNR is treated as both the native gas currency AND an ERC-20 compatible token:

```typescript
// DNR Token contract address (from env):
const DNR_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_DNR_TOKEN_ADDRESS

// Standard ERC-20 ABI functions used:
// - balanceOf(address) → display wallet balance
// - approve(spender, amount) → before PaymentRouter calls
// - transfer(to, amount) → direct transfers
// - allowance(owner, spender) → check existing approvals
```

### 7.6 Transaction Confirmation Flow (Technical)

```
1. User clicks "Pay Now" in UI
2. Frontend calls PaymentRouter.estimateGas() → shows fee to user (in DNR)
3. User signs transaction in Kortana Wallet / MetaMask
4. Frontend receives txHash immediately → switches to "Pending" UI state
5. Frontend calls POST /api/transactions/track { txHash, paymentDetails }
6. API saves pending transaction to MongoDB
7. BullMQ job begins polling Kortana RPC for receipt
8. On confirmation (1 block): job updates DB, sends push notification + email
9. Frontend receives WebSocket/SSE event → switches to "Confirmed" state
10. Blockchain explorer link displayed with full tx details
```

### 7.7 Wallet Authentication (Sign-In With Ethereum pattern)

```
1. User connects wallet (Kortana Wallet or MetaMask)
2. Backend generates a nonce: GET /api/auth/nonce?address=0x...
3. Backend stores nonce in Redis with 5-minute TTL
4. Frontend requests wallet to sign message:
   "Sign in to BelloMundo\nNonce: {nonce}\nTimestamp: {timestamp}"
5. Frontend sends: POST /api/auth/verify { address, signature, nonce }
6. Backend: verifyMessage(signature) → recovers signer address
7. If address matches: create/update User in MongoDB, issue JWT session cookie
8. All subsequent API calls authenticated via JWT
```

---

## 8. FEATURE MODULES & PAYMENT VERTICALS

### 8.1 Module Overview

| Module | Category | Payment Type | Complexity | Smart Contract |
|--------|----------|-------------|------------|---------------|
| Residential Rental | Housing | Recurring | Medium | PaymentRouter |
| Short-Stay / Booking | Housing | One-time | Medium | PaymentRouter |
| Home Purchase | Housing | Large/Escrow | High | EscrowVault |
| Mortgage Payments | Housing | Recurring | High | MortgageRegistry |
| Electricity | Utilities | Recurring | Low | UtilitySettler |
| Water & Sewage | Utilities | Recurring | Low | UtilitySettler |
| Internet & Telecoms | Utilities | Recurring | Low | UtilitySettler |
| EV Purchase | Transport | Large/Escrow | High | EscrowVault |
| EV Lease | Transport | Recurring | Medium | PaymentRouter |
| EV Charging | Transport | Micro-payment | Low | PaymentRouter |
| Cab / Ride Service | Transport | One-time | Low | PaymentRouter |
| Gym Membership | Wellness | Recurring | Low | PaymentRouter |
| e-Residency Card | Identity | One-time | Medium | eResidency.sol |
| General Services | Misc | One-time | Low | PaymentRouter |

### 8.2 Housing Module — Detailed

**Residential Rental:**
- User browses available rental properties (integrated property listing)
- Property cards show: name, location, DNR/month, bedrooms/bathrooms, amenities
- User selects property → views full listing page with photo gallery, 3D tour link, map
- Selects lease duration (6 months, 12 months, 24 months)
- Reviews DNR total, security deposit amount, monthly breakdown
- Proceeds to payment — single upfront payment OR monthly auto-pay setup
- Auto-pay setup creates recurring approval in Kortana Wallet

**Short-Stay / Airbnb-style Booking:**
- Calendar date picker (check-in / check-out)
- Real-time availability grid
- Pricing tiers: per-night DNR rates (weekday vs weekend vs seasonal)
- Instant booking or Request to Book flow
- Escrow holds payment until check-in + 24 hours (dispute window)
- Host receives DNR after dispute window closes automatically

**Home Purchase:**
- Detailed property profile with ownership documentation hash (stored on-chain via IPFS hash)
- Price negotiation workflow (offer → counter-offer → accept)
- Required documents checklist (uploaded, hashed, stored IPFS, hash recorded on-chain)
- Escrow flow: buyer deposits → admin verification → seller transfer
- Mortgage integration: if buyer is financing, links to Mortgage Registry contract
- Full ownership NFT / on-chain title transfer on completion

**Mortgage Module:**
- Mortgage application (basic info, income, property, down payment)
- Amortization schedule visualization — beautiful chart showing principal vs. interest over time
- Monthly payment in DNR clearly displayed
- One-click monthly payment from dashboard
- Overpayment option with instant recalculation
- Mortgage history and remaining balance tracker

### 8.3 Utilities Module — Detailed

**Electricity:**
- Smart meter reading integration (API from city utility provider)
- Current bill amount in DNR, due date clearly visible
- Usage chart (this month vs last 3 months)
- Pay Now (single) or Setup Auto-Pay
- Paper trail: each month's bill stored as immutable record in MongoDB + hash on-chain

**Water, Internet, Other Utilities:**
- Same pattern as electricity — unified utility dashboard
- Color-coded cards per utility type
- Aggregate "Total Utility Bill This Month" prominently displayed
- Bulk payment option: pay ALL utilities in one transaction (batched on-chain)

### 8.4 Transport Module — Detailed

**EV Purchase:**
- Browse EV catalog: make, model, year, range, price in DNR
- Full spec sheet, photo gallery
- Financing option: down payment + EV Lease selection
- Full purchase: escrow → city EV registry → title transfer on-chain
- Connected to e-Residency for ownership verification

**EV Lease:**
- Monthly installment tracker
- Remaining payments counter
- Early termination calculator
- One-click monthly payment

**EV Charging:**
- Map of city charging stations
- Tap-to-pay micro-transaction via wallet (< 1 DNR typically)
- Session history: date, station, kWh, DNR cost

**Cab / Ride Service:**
- QR code scan or ride reference number entry
- Driver/ride details confirmation
- One-tap pay in DNR
- Tip option (percentage or custom DNR amount)
- Ride history with receipts

### 8.5 Wellness & Services — Detailed

**Gym Membership:**
- Choose gym (city may have multiple partner gyms)
- Membership tier selection (Basic / Premium / Elite) with feature comparison
- Monthly or Annual payment option (annual shown with % savings)
- Member QR code displayed post-payment (for entry)
- Renewal reminders 7 days before expiry

### 8.6 e-Residency Card Module — Detailed

This is one of the most distinctive and important features. The **e-Residency Card** is a digital + physical identity document for Smart City residents.

**Application Flow:**
1. User fills in personal details (name, nationality, photo upload, biometric data consent)
2. Uploads KYC documents (passport, proof of address) — files hashed and stored IPFS
3. Pays application fee in DNR (one-time)
4. Application goes to admin review queue
5. On approval: NFT minted on Kortana Blockchain (eResidency.sol)
6. Digital card available in app: shows photo, ID number, QR code, issue/expiry date
7. Physical card production ordered (if applicable)
8. Renewal flow: same as new application but pre-filled

**The Digital e-Residency Card UI:**
This should be rendered as a **stunningly beautiful virtual card** — think: the frosted glass design of a premium credit card, but for a citizen. Show the BelloMundo city skyline as the card background (a gorgeous translucent architectural illustration), with the user's photo, name, ID number, and Kortana Blockchain address in JetBrains Mono. A holographic shimmer animation on hover. This card should be screenshot-worthy.

---

## 9. COMPLETE PAYMENT FLOW — STEP BY STEP

This section defines the end-to-end user journey for every type of payment. The flow has five phases that apply universally, with type-specific variations in Phase 2.

### Phase 1 — Discovery & Selection

**Entry points:**
- Global navigation: "Pay" dropdown with all categories
- City Dashboard: contextual prompts ("Your electricity bill is due in 3 days — Pay Now")
- City Map (3D view): tap on building/location to see associated payment options
- Quick Pay: recent and recurring payments surfaced on dashboard

**Navigation model:**
The main navigation should feel like a city skyline. Don't use a flat dropdown menu. Consider a mega-menu that opens to reveal a visual city map where each district represents a payment category. Properties in the residential district. Charging stations in the transport hub. The wellness center near the park. Make navigation an experience.

### Phase 2 — Configuration

User selects the specific item/service and configures the payment:

- **Rental**: Select property → select lease term → review pricing breakdown
- **Home Purchase**: Select property → review documents → submit offer → accept counter
- **Utilities**: View current bill → review usage details → select pay now or autopay
- **EV**: Select vehicle → choose purchase/lease → configure financing terms
- **Cab**: Scan QR or enter reference → view ride summary → confirm amount
- **Gym**: Choose gym → choose tier → choose monthly/annual → confirm

### Phase 3 — Wallet Connection & Authorization

If not already connected:
1. "Connect Your Wallet" — beautiful modal showing two options side by side
2. **Kortana Wallet** — recommended, with Kortana logo, "Fastest & Native" badge
3. **MetaMask** — shown with MetaMask fox logo, "Connect via MetaMask"
4. User clicks preferred option → wallet extension opens requesting connection
5. User approves connection in wallet extension
6. BelloMundo receives wallet address, loads DNR balance
7. Balance shown prominently: "◈ 1,247.50 DNR Available"

If already connected:
- Skip straight to payment summary screen

### Phase 4 — Payment Summary & Confirmation

This is the most critical screen. It must be:
- Beautiful but not distracting
- Clear above all else — exactly what is being paid, to whom, for how much
- Trustworthy — show every detail a cautious person might want

**Payment Summary Screen contains:**
- Service type icon + name (e.g., ⚡ Electricity — January 2045)
- Recipient name and Kortana address (shortened: 0x1a2b...3c4d)
- Amount in DNR: large, gold-colored, prominent
- Amount in fiat equivalent (if oracle available): "≈ $247.50 USD"
- Transaction fee (gas): shown in DNR, explained simply ("Network fee to process on Kortana Blockchain")
- Total DNR deducted from wallet
- Your current wallet balance
- Your balance after payment (in green if positive, red warning if low)
- Estimated confirmation time: "~3 seconds"
- A Kortana Blockchain security badge: "Protected by Kortana Blockchain · Immutable Record"
- Terms checkbox (for first payment to new recipient)
- Large CTA: **"Confirm & Pay ◈ {amount} DNR"**

### Phase 5 — Transaction Processing & Confirmation

**5a — Signing in Wallet:**
- BelloMundo dims its background and shows a clear instruction: "Please confirm this payment in your Kortana Wallet / MetaMask"
- Animated wallet icon bouncing gently
- Wallet extension pops up with transaction details

**5b — Submitted (Pending):**
- As soon as tx hash received: full-screen success animation
- **Not** a spinner. A genuine moment of delight.
- Design direction: the BelloMundo city logo pulses outward like a ripple in water, expanding rings of teal light, the city skyline illustration illuminates building by building
- Copy: "Payment Submitted · Your transaction is being recorded on Kortana Blockchain"
- Transaction hash displayed in JetBrains Mono with copy button and link to Kortana Explorer
- "This usually takes about 3 seconds" with live timer

**5c — Confirmed:**
- Animation resolves: all buildings are lit, the city is alive
- Copy: "Payment Confirmed ✓ · Your payment has been permanently recorded"
- Block number, timestamp, transaction hash — all in elegant mono typography
- "View on Kortana Explorer" link
- Downloadable PDF receipt (auto-generated, beautiful design)
- "Return to Dashboard" or "Pay Another Bill" CTAs

**5d — Failed:**
- Clear, human-language error message (never show raw blockchain errors to users)
- "Your payment didn't go through" + specific reason (insufficient funds, network issue, expired)
- Actionable next step: "Try Again" or "Get Help"
- Error logged to Sentry for engineering review

---

## 10. SCREEN-BY-SCREEN UI SPECIFICATION

### 10.1 Landing Page / Marketing Site

**Hero Section:**
- Full-viewport: animated 3D city visualization (Three.js) — a living aerial view of BelloMundo at night, gentle vehicle movement, building lights twinkling
- Headline: "The Financial Heart of BelloMundo" — Display XL, white, centered
- Subheadline: "Pay for everything in your smart city. Instantly. On-chain. In DNR." — Body L, muted teal
- Two CTAs: "Launch App" (primary, gold gradient button) and "Learn More" (ghost button)
- Scroll indicator: animated chevron, gentle bounce
- Ambient particle system: tiny gold particles drifting upward like city light pollution seen from above

**Features Section:**
- "Everything Your City Needs" — section heading
- Animated grid of payment categories with beautiful icons and micro-descriptions
- Each card: glassmorphism on dark background, icon in teal gradient, title in white, 2-line description in muted

**How It Works Section:**
- 3-step horizontal flow with animated connecting lines
- Step 1: "Connect your Kortana Wallet" / Step 2: "Choose your service" / Step 3: "Pay in DNR — done"

**Stats Bar:**
- Live-updating or seeded: "◈ 2.4M DNR settled today" / "47,832 transactions" / "12 payment categories" / "1 blockchain"
- Numbers should animate (count up) when scrolled into view

**Testimonials / City Vision:**
- Quotes from imagined city residents — "For the first time, I understand where my money goes" type sentiment
- Render as elegant pull quotes with city skyline silhouette watermark

**Footer:**
- Clean, minimal dark footer
- BelloMundo logo (white monochrome version)
- Navigation links organized in columns: Products, Company, Legal, Social
- "Powered by Kortana Blockchain" with Kortana logo
- DNR price ticker (if oracle available)

### 10.2 Authentication / Onboarding

**Connect Wallet Screen:**
- Clean centered modal or full page
- BelloMundo logo + "Welcome to BelloMundo" heading
- Two large wallet cards:
  - **Kortana Wallet**: Primary, highlighted, gold border. "The official Smart City wallet. Fastest payments, native DNR support. Recommended."
  - **MetaMask**: Secondary. "Already have MetaMask? Connect it here."
- "What is a wallet?" expandable explanation — for non-crypto users
- Security note: "BelloMundo never stores your private keys or controls your funds"

**New User Onboarding (post-connect):**
- 3-screen modal wizard (skippable):
  1. "Welcome, {shortened wallet address}" — personalized greeting, option to set display name
  2. "Set up your profile" — name, profile photo, preferred notifications
  3. "Explore your city" — quick tour of main features

**KYC / Identity Verification (where required for large payments):**
- Clean, reassuring design — this is sensitive and the UI should make users feel safe
- Document upload with drag-and-drop, file type validation
- Progress indicator: "Your information is encrypted and stored securely. Document hash recorded on Kortana Blockchain."

### 10.3 Main Dashboard

The Dashboard is the **command center** of a resident's financial life. It must balance information density with visual clarity.

**Layout (Desktop, 1440px):**
```
┌─────────────────────────────────────────────────────────────────┐
│  NAVIGATION BAR                                                  │
│  [BelloMundo Logo] [Home] [Pay] [Properties] [Transport] [...]  │
│                              [◈ 1,247 DNR] [0x1a2b...] [Avatar] │
├─────────────────────────────────────────────────────────────────┤
│  GREETING + CITY STATUS                                          │
│  "Good evening, Amara ✦" — [Mini city skyline banner, animated] │
├────────────────────┬────────────────────────────────────────────┤
│  WALLET CARD       │  UPCOMING PAYMENTS                          │
│  ◈ 1,247.50 DNR   │  ⚡ Electricity — Due in 3 days  ◈ 45 DNR  │
│  ≈ $12,475 USD     │  🏠 Rent — Due in 8 days        ◈ 850 DNR  │
│  [Add Funds] [Send]│  💧 Water — Due in 12 days      ◈ 22 DNR  │
├────────────────────┤  [View All Bills]                           │
│  QUICK PAY GRID    ├────────────────────────────────────────────┤
│  ⚡ Electricity    │  RECENT TRANSACTIONS                        │
│  🏠 Rent           │  [Transaction list with status, amount,     │
│  🚗 EV Charging    │   recipient, timestamp, tx hash link]        │
│  🚕 Cab            │                                             │
│  🏋️ Gym            │                                             │
│  + More            │                                             │
├────────────────────┴────────────────────────────────────────────┤
│  PAYMENT HISTORY CHART — Monthly spending by category (6 months) │
└─────────────────────────────────────────────────────────────────┘
```

**Wallet Card Design:**
- The most prominent element on the dashboard
- Designed like a premium physical card: subtle gradient background (Deep Navy → Kortana Teal), BelloMundo logo top-left, DNR balance in large Sora font, wallet address in JetBrains Mono bottom-left
- Gentle particle/shimmer animation on the card surface
- Hover: card lifts slightly (CSS 3D transform), shimmer intensifies

**Quick Pay Grid:**
- Icon-forward tiles in a 3x2 grid
- Each tile: category icon (beautiful, consistent icon set), category name, last payment info ("Last: ◈ 45 DNR, Jan 15")
- Hover: tile illuminates with category's accent color

### 10.4 Properties & Housing Page

**Layout:** Full Airbnb-style property discovery interface.

- Hero: large search bar with filters — "Find your home in BelloMundo"
- Filters: Property Type (Apartment / Villa / Studio / Penthouse / Commercial), Price Range (DNR/month), Bedrooms, Amenities, District
- Results: responsive grid of property cards
- Map view toggle: city map (Mapbox) with property pins
- Property Card: Full-bleed property photo, overlay with property name, type badge, location, DNR/month in gold, star rating, amenity icons

**Property Detail Page:**
- Photo gallery: large hero image with thumbnail strip (or fullscreen gallery mode)
- Property name + address + verified badge (on-chain ownership verified)
- Price: "◈ 1,200 DNR / month" — large, gold
- Key facts: bedrooms, bathrooms, sqm, floor, furnished/unfurnished
- Description (rich text from landlord/city)
- Amenities grid with icons
- Location map
- Payment options widget (right-side sticky panel on desktop):
  - For rental: date picker or lease term selector + DNR total + "Book Now" CTA
  - For purchase: "◈ {price} DNR" + "Make Offer" + "Buy Now (Escrow)" CTAs
- Similar properties below

### 10.5 Transport Page

**Tabs:** EV Purchase | EV Lease | EV Charging | Cab Payment

**EV Catalog:** Similar to property grid — car cards with photo, make/model, range, price
**EV Purchase Detail:** Full spec page with financing calculator
**Cab Payment:** QR scanner (camera access) or manual reference entry

### 10.6 Utilities Page

**Layout:** Beautiful utility dashboard
- Large circular "Total Due This Month" gauge (like a speedometer) showing total DNR owed
- Individual utility cards in a grid, each with:
  - Category icon + name (electricity bolt, water drop, wifi symbol)
  - Current balance due in DNR
  - Due date countdown ("Due in 3 days" in amber if urgent, red if overdue)
  - Usage chart (small sparkline)
  - Individual "Pay" button
- "Pay All Utilities" — large CTA at top, sends all to batch payment flow
- Historical usage and payment tabs

### 10.7 e-Residency Page

- Information section: "What is BelloMundo e-Residency?"
- Benefits list: access to smart city services, on-chain identity, global recognition
- "Apply Now" — leads to multi-step application form
- "My e-Residency Card" — if user has one: shows the gorgeous virtual card render
  - Option to download as PDF, share as image
  - "Request Physical Card" option
  - Renewal status and countdown

### 10.8 Transaction History & Records

- Full paginated transaction table
- Filters: date range, category, status, amount range
- Each row: date, description, category badge, amount in DNR, status (confirmed/pending/failed), "View on Explorer" icon
- Export: Download as PDF or CSV
- Search: Full text search across payment descriptions and references

---

## 11. DATABASE SCHEMA (MONGODB)

### users Collection
```javascript
{
  _id: ObjectId,
  walletAddress: String,          // Primary identifier — Kortana/Ethereum address
  displayName: String,
  email: String,                  // Optional, for notifications
  profileImage: String,           // S3/R2 URL
  kycStatus: enum['none', 'pending', 'verified', 'rejected'],
  kycDocuments: [{ type, ipfsHash, submittedAt }],
  eResidencyCardId: ObjectId,     // Ref to eResidencyCards collection
  notificationPreferences: {
    email: Boolean,
    push: Boolean,
    paymentConfirmations: Boolean,
    upcomingBills: Boolean,
        billsDue: Number           // days before due date to notify
  },
  autoPaySchedules: [{
    serviceType: String,
    serviceId: ObjectId,
    enabled: Boolean,
    dayOfMonth: Number,
    maxAmount: Number              // DNR cap for auto-pay
  }],
  createdAt: Date,
  lastLoginAt: Date,
  onboardingCompleted: Boolean
}
```

### transactions Collection
```javascript
{
  _id: ObjectId,
  txHash: String,                 // Kortana Blockchain tx hash
  blockNumber: Number,
  status: enum['pending', 'confirmed', 'failed'],
  paymentType: String,            // enum from PaymentType in contract
  payer: String,                  // wallet address
  recipient: String,              // wallet address or contract address
  amount: String,                 // DNR amount in wei (BigInt as string)
  amountDNR: Number,              // Human-readable DNR amount
  networkFee: String,             // Gas cost in DNR wei
  referenceId: String,            // Off-chain booking/order reference
  serviceId: ObjectId,            // Reference to the specific service record
  serviceType: String,
  description: String,            // Human-readable: "Electricity Bill - January 2045"
  receiptUrl: String,             // Generated PDF receipt S3 URL
  confirmedAt: Date,
  createdAt: Date,
  metadata: Object                // Type-specific additional data
}
```

### properties Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  propertyType: enum['apartment', 'villa', 'studio', 'penthouse', 'commercial'],
  listingType: enum['rent', 'sale', 'both'],
  owner: String,                  // wallet address
  ownershipTxHash: String,        // On-chain title registry
  address: {
    district: String,
    building: String,
    unit: String,
    gpsCoords: { lat: Number, lng: Number }
  },
  pricePerMonth: Number,          // DNR
  salePrice: Number,              // DNR
  bedrooms: Number,
  bathrooms: Number,              // Using decimal: 1.5 = 1 full + 1 half
  areaSqm: Number,
  floor: Number,
  totalFloors: Number,
  furnished: Boolean,
  amenities: [String],
  images: [{ url: String, isPrimary: Boolean, order: Number }],
  virtualTourUrl: String,
  availability: {
    isAvailable: Boolean,
    availableFrom: Date
  },
  ratings: { average: Number, count: Number },
  isVerified: Boolean,            // City authority verified
  createdAt: Date,
  updatedAt: Date
}
```

### bookings Collection
```javascript
{
  _id: ObjectId,
  propertyId: ObjectId,
  tenantWallet: String,
  bookingType: enum['short_stay', 'long_term_rental', 'purchase'],
  status: enum['pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'],
  checkIn: Date,
  checkOut: Date,                 // null for long-term
  leaseDurationMonths: Number,
  totalAmountDNR: Number,
  securityDepositDNR: Number,
  escrowTxHash: String,
  releaseConditions: Object,
  transactions: [ObjectId],       // Ref to transactions
  createdAt: Date
}
```

### utilityBills Collection
```javascript
{
  _id: ObjectId,
  residentWallet: String,
  propertyId: ObjectId,
  utilityType: enum['electricity', 'water', 'internet', 'gas', 'waste', 'heating'],
  billingPeriodStart: Date,
  billingPeriodEnd: Date,
  dueDate: Date,
  amountDNR: Number,
  usageData: {
    unit: String,                 // kWh, m3, GB, etc.
    currentReading: Number,
    previousReading: Number,
    consumed: Number
  },
  status: enum['unpaid', 'paid', 'overdue', 'disputed'],
  paymentTxHash: String,
  paidAt: Date,
  createdAt: Date
}
```

### vehicles Collection (EV)
```javascript
{
  _id: ObjectId,
  make: String,
  model: String,
  year: Number,
  variant: String,
  category: enum['sedan', 'suv', 'hatchback', 'sports', 'commercial'],
  purchasePriceDNR: Number,
  leasePricePerMonthDNR: Number,
  downPaymentDNR: Number,
  rangKm: Number,
  chargingStandard: String,
  specifications: Object,
  images: [String],
  availability: enum['available', 'reserved', 'sold'],
  registrationNumber: String,     // Assigned on purchase
  ownerWallet: String,
  onChainTitleHash: String,
  createdAt: Date
}
```

### eResidencyCards Collection
```javascript
{
  _id: ObjectId,
  holderWallet: String,
  cardNumber: String,             // Auto-generated unique ID
  nftTokenId: String,             // On-chain NFT token ID
  nftContractAddress: String,
  status: enum['applied', 'under_review', 'approved', 'rejected', 'active', 'expired', 'revoked'],
  personalDetails: {
    fullName: String,
    dateOfBirth: Date,
    nationality: String,
    photoIpfsHash: String
  },
  kycDocumentHashes: [String],    // IPFS hashes of submitted docs
  issuedAt: Date,
  expiresAt: Date,
  renewalCount: Number,
  mintTxHash: String,
  applicationFeesTxHash: String
}
```

---

## 12. API ARCHITECTURE

### 12.1 Route Structure

```
/api/
├── auth/
│   ├── nonce          GET  — generate auth nonce for wallet
│   ├── verify         POST — verify wallet signature, issue session
│   └── signout        POST — clear session
│
├── user/
│   ├── profile        GET/PATCH — get or update user profile
│   ├── balance        GET  — fetch DNR balance from blockchain
│   └── autopay        GET/POST/DELETE — manage auto-pay schedules
│
├── transactions/
│   ├── /             GET  — list user transactions (paginated, filtered)
│   ├── track         POST — track new transaction by hash
│   ├── [id]          GET  — single transaction detail
│   └── receipt/[id]  GET  — download PDF receipt
│
├── properties/
│   ├── /             GET  — list properties (search, filter, paginate)
│   ├── [id]          GET  — single property detail
│   └── book          POST — create booking
│
├── bookings/
│   ├── /             GET  — user's bookings
│   └── [id]          GET  — booking detail
│
├── utilities/
│   ├── bills         GET  — all unpaid bills for user
│   ├── [id]/pay      POST — initiate utility payment
│   └── history       GET  — payment history
│
├── vehicles/
│   ├── /             GET  — EV catalog
│   ├── [id]          GET  — vehicle detail
│   └── purchase      POST — initiate purchase/lease flow
│
├── eresidency/
│   ├── apply         POST — submit application
│   ├── status        GET  — check application status
│   └── card          GET  — get card details (if active)
│
├── payment/
│   ├── estimate      POST — estimate gas fees for payment
│   ├── initiate      POST — create payment session (pre-blockchain)
│   └── webhook       POST — blockchain confirmation webhook (internal)
│
└── admin/             (protected, admin wallet only)
    ├── kyc/review     POST — approve/reject KYC
    ├── eresidency/approve POST
    └── escrow/release POST
```

### 12.2 Standard Response Format

```typescript
// Success
{
  success: true,
  data: T,
  meta?: {
    page?: number,
    limit?: number,
    total?: number,
    hasMore?: boolean
  }
}

// Error
{
  success: false,
  error: {
    code: string,        // Machine-readable: "INSUFFICIENT_BALANCE", "KYC_REQUIRED"
    message: string,     // Human-readable
    details?: object     // Optional additional context
  }
}
```

---

## 13. SMART CONTRACT INTEGRATION POINTS

### Key Frontend Integration Patterns

**1. Read DNR Balance:**
```typescript
import { useBalance } from 'wagmi'

const { data: balance } = useBalance({
  address: userAddress,
  token: DNR_TOKEN_ADDRESS,
  chainId: KORTANA_CHAIN_ID
})
// Display: formatUnits(balance.value, 18)
```

**2. Approve + Pay Pattern (for ERC-20 payments):**
```typescript
// Step 1: Check existing allowance
const allowance = await readContract({
  address: DNR_TOKEN_ADDRESS,
  abi: ERC20_ABI,
  functionName: 'allowance',
  args: [userAddress, PAYMENT_ROUTER_ADDRESS]
})

// Step 2: If insufficient, request approval first
if (allowance < paymentAmount) {
  const approveTx = await writeContract({
    address: DNR_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [PAYMENT_ROUTER_ADDRESS, paymentAmount]
  })
  await waitForTransactionReceipt({ hash: approveTx })
}

// Step 3: Execute payment
const paymentTx = await writeContract({
  address: PAYMENT_ROUTER_ADDRESS,
  abi: PAYMENT_ROUTER_ABI,
  functionName: 'settlePaymentWithDNRToken',
  args: [paymentRequest, paymentAmount]
})
```

**3. Listen for on-chain events (for real-time confirmation):**
```typescript
// Backend: BullMQ job polls for receipt
// Frontend: Server-Sent Events (SSE) stream for live updates

// SSE endpoint: GET /api/transactions/stream?txHash=0x...
// Streams: { status: 'pending' } → { status: 'confirmed', blockNumber: N }
```

---

## 14. SECURITY & COMPLIANCE REQUIREMENTS

### 14.1 Smart Contract Security

- All payment contracts must be audited before mainnet deployment (minimum: internal audit + one external audit firm)
- Use OpenZeppelin base contracts for standard patterns (ERC-20, AccessControl, ReentrancyGuard)
- All contracts must implement:
  - Reentrancy guard on all payment functions
  - Pausable pattern for emergency stops
  - Role-based access control (admin multisig for sensitive operations)
  - Event emission for every state change (for off-chain indexing)
  - Payment deadline/expiry to prevent stale transaction replay
- Escrow contracts must have emergency refund mechanism with timelock

### 14.2 Frontend Security

- All API routes authenticated via JWT — no exceptions
- Wallet signature verification on every auth attempt
- Amount validation both client-side AND server-side — never trust frontend amounts
- Rate limiting on all API routes (Redis-backed, per-wallet-address)
- Input sanitization on all user-submitted content
- CSP headers configured strictly
- No private keys or mnemonics ever touch BelloMundo servers or code

### 14.3 Personal Data & KYC

- PII (personally identifiable information) encrypted at rest in MongoDB
- KYC documents stored on IPFS (decentralized) with only the hash in MongoDB
- GDPR-compliant data handling — user can request data deletion (but on-chain records are immutable and excluded from deletion scope — clearly communicated to users)
- e-Residency biometric data handled under relevant jurisdiction's privacy laws

### 14.4 Compliance Considerations

- AML/KYC required for transactions above a threshold (e.g., home purchase, EV purchase, mortgage)
- All large transactions (configurable threshold, e.g., > ◈ 10,000 DNR) trigger enhanced due diligence workflow
- Transaction records are immutable on-chain — this IS the audit trail
- City authority admin interface for regulatory reporting

---

## 15. PERFORMANCE & ACCESSIBILITY STANDARDS

### Performance Targets (Core Web Vitals)

```
LCP (Largest Contentful Paint):   < 2.5 seconds
FID (First Input Delay):          < 100 milliseconds
CLS (Cumulative Layout Shift):    < 0.1
TTFB (Time to First Byte):        < 800 milliseconds
Bundle size (initial JS):         < 200kb gzipped
Lighthouse Score target:          > 90 on all categories
```

### Accessibility (WCAG 2.1 AA Compliance)

- All interactive elements keyboard-navigable
- Focus indicators clearly visible (2px solid teal outline)
- Color contrast ratios: minimum 4.5:1 for body text, 3:1 for large text
- All images have alt text; decorative images have empty alt
- Form inputs properly labeled
- Screen reader announcements for dynamic content (payment status changes)
- Touch targets minimum 44x44px on mobile
- Reduce Motion: all animations respect `prefers-reduced-motion` media query — critical given the heavy animation use

### Responsive Breakpoints

```
Mobile:   320px — 767px
Tablet:   768px — 1023px  
Desktop:  1024px — 1439px
Large:    1440px+
```

---

## 16. DELIVERABLES CHECKLIST

### Design Deliverables (Antigravity)
- [ ] Full brand identity system (logo, color palette, typography, iconography)
- [ ] Custom DNR currency glyph design
- [ ] Component library in Figma (design tokens, all UI components in all states)
- [ ] All screen designs — desktop AND mobile — for all listed screens
- [ ] Animation specification document (what animates, how, timing functions)
- [ ] Prototype (clickable Figma prototype covering core payment flow)
- [ ] Design handoff with all assets exported, fonts licensed, tokens documented

### Frontend Deliverables
- [ ] Next.js 14 project structure with all pages and layouts
- [ ] Tailwind configuration with full custom design tokens
- [ ] All UI components (built on shadcn/ui base)
- [ ] Three.js city visualization (hero section)
- [ ] Framer Motion animation system
- [ ] Wallet connection flow (wagmi + both connectors)
- [ ] All payment flow screens with complete UX
- [ ] Transaction confirmation animations
- [ ] e-Residency virtual card renderer
- [ ] Responsive design (all breakpoints)
- [ ] Dark mode implementation (default dark, optional light)
- [ ] Accessibility audit passed (WCAG 2.1 AA)

### Backend Deliverables
- [ ] Next.js API routes — all endpoints listed in Section 12
- [ ] MongoDB schemas and Mongoose models
- [ ] NextAuth.js wallet-based authentication
- [ ] Payment session management
- [ ] BullMQ job queue for blockchain confirmation tracking
- [ ] Server-Sent Events for real-time payment status
- [ ] PDF receipt generation
- [ ] Email notification system
- [ ] Rate limiting middleware
- [ ] Admin API routes

### Blockchain Deliverables
- [ ] PaymentRouter.sol — deployed and verified on Kortana testnet
- [ ] EscrowVault.sol — deployed and verified
- [ ] eResidency.sol (NFT contract) — deployed and verified
- [ ] UtilitySettler.sol — deployed and verified
- [ ] MortgageRegistry.sol — deployed and verified
- [ ] Hardhat test suite (>90% coverage)
- [ ] Contract ABI exported and integrated in frontend
- [ ] Kortana Wallet connector for wagmi
- [ ] Blockchain event indexer (BullMQ + RPC polling)

### Infrastructure Deliverables
- [ ] Vercel deployment configured (preview + production)
- [ ] MongoDB Atlas configured with proper indexes
- [ ] Redis (Upstash) configured
- [ ] Environment variables documented
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Sentry error monitoring configured
- [ ] PostHog analytics configured

---

## APPENDIX A — ENVIRONMENT VARIABLES REQUIRED

```env
# Application
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=BelloMundo
NODE_ENV=

# Database
MONGODB_URI=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Blockchain
NEXT_PUBLIC_KORTANA_CHAIN_ID=
NEXT_PUBLIC_KORTANA_RPC_URL=
NEXT_PUBLIC_KORTANA_EXPLORER_URL=
NEXT_PUBLIC_DNR_TOKEN_ADDRESS=
NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS=
NEXT_PUBLIC_ESCROW_VAULT_ADDRESS=
NEXT_PUBLIC_E_RESIDENCY_ADDRESS=

# Redis
REDIS_URL=

# Storage
AWS_S3_BUCKET= # or R2 equivalent
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Email
RESEND_API_KEY=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## APPENDIX B — ANIMATION SPECIFICATION SUMMARY

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transitions | Fade + slide up | 300ms | ease-out |
| Card hover | Scale 1.02 + shadow | 200ms | ease-out |
| Wallet card | 3D tilt on mouse move | continuous | linear |
| City hero | Ambient float + particles | continuous | sine wave |
| Payment confirmation | Radial pulse expand | 800ms | ease-out |
| Number counters | Count up on scroll | 1500ms | ease-out |
| Status badges | Pulse glow | 2s loop | ease-in-out |
| Modal open | Scale from 0.95 + fade | 250ms | spring |
| Toast notifications | Slide in from right | 250ms | spring |
| Loading skeleton | Shimmer sweep | 1.5s loop | linear |

---

*End of BelloMundo Development Brief v1.0*
*Prepared for Antigravity Design & Engineering Studio*
*Classification: Confidential — Smart City Infrastructure Project*

---
**BelloMundo** · *The Financial Heart of the Smart City* · Powered by Kortana Blockchain · Settled in DNR
