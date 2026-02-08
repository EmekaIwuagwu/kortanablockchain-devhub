# AETHER PLATFORM - FULLSTACK BLOCKCHAIN ENGINEER BUILD PROMPT
## For Antigravity AI Assistant

---

## EXECUTIVE SUMMARY

You are being tasked as the **Fullstack Blockchain Engineer** to build **AETHER**, a fractional real estate tokenization platform on the Kortana EVM blockchain. This is a complete end-to-end build spanning smart contracts, backend APIs, and a gorgeous Next.js frontend with real and white branding.

**What You're Building:**
A production-ready application that allows global investors to purchase fractional ownership of real estate properties, with all transactions settling on Kortana blockchain. The platform includes Golden Visa tracking, rental income distribution, escrow management, and a professional portfolio dashboard.

**Timeline:** Full MVP in 8-12 weeks  
**Scope:** Fullstack (Solidity contracts → Node.js backend → Next.js frontend)  
**Blockchain:** Kortana EVM L1  
**Currency:** Dinar (native Kortana token)

---

## YOUR ROLE & RESPONSIBILITIES

As the **Fullstack Blockchain Engineer**, you own:

1. **Smart Contract Development (Solidity)**
   - Design and implement 4 core contracts
   - Test with Hardhat/Foundry
   - Deploy to Kortana testnet
   - Provide ABIs to frontend team

2. **Backend API Development (Node.js)**
   - Design database schema
   - Build REST APIs for frontend
   - Implement blockchain integration
   - Handle KYC/AML compliance
   - Manage escrow logic

3. **Frontend Blockchain Integration**
   - Connect Wagmi + Viem to Kortana RPC
   - Implement wallet connections
   - Display real-time blockchain data
   - Handle transaction signing and confirmation
   - Build transaction monitoring

4. **DevOps & Deployment**
   - Set up Kortana testnet environment
   - Configure environment variables
   - Deploy contracts and backend
   - Monitor for errors and performance

---

## PROJECT STRUCTURE

```
aether-platform/
├── contracts/                    # Solidity Smart Contracts
│   ├── src/
│   │   ├── PropertyToken.sol     # ERC-20 for property fractional ownership
│   │   ├── EscrowManager.sol     # Escrow & multi-sig release
│   │   ├── RentalDistribution.sol # Auto rental payouts
│   │   └── PropertyRegistry.sol  # Immutable property metadata
│   ├── test/                     # Hardhat tests
│   ├── scripts/                  # Deployment scripts
│   ├── hardhat.config.js
│   └── README.md
│
├── backend/                      # Node.js Backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts           # Authentication endpoints
│   │   │   ├── properties.ts     # Property CRUD
│   │   │   ├── portfolio.ts      # User holdings
│   │   │   ├── transactions.ts   # Transaction history
│   │   │   ├── golden-visa.ts    # Golden Visa calculator
│   │   │   └── admin.ts          # Admin endpoints
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT verification
│   │   │   ├── kyc.ts            # KYC check
│   │   │   └── rate-limit.ts     # Rate limiting
│   │   ├── services/
│   │   │   ├── blockchain.ts     # Kortana interaction
│   │   │   ├── database.ts       # PostgreSQL queries
│   │   │   ├── escrow.ts         # Escrow logic
│   │   │   └── kyc.ts            # KYC/AML integration
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Property.ts
│   │   │   ├── Ownership.ts
│   │   │   └── Transaction.ts
│   │   └── index.ts              # Express app entry
│   ├── migrations/               # Database migrations
│   ├── .env.example
│   └── package.json
│
├── frontend/                     # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page
│   │   ├── (auth)/
│   │   │   ├── signup/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (app)/
│   │   │   ├── marketplace/page.tsx
│   │   │   ├── property/[id]/page.tsx
│   │   │   ├── checkout/[propertyId]/page.tsx
│   │   │   ├── portfolio/page.tsx
│   │   │   ├── golden-visa/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── sell/[propertyId]/page.tsx
│   │   │   └── layout.tsx
│   │   └── api/
│   │       └── route.ts          # API proxy routes
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetail.tsx
│   │   ├── CheckoutWizard.tsx
│   │   ├── PortfolioDashboard.tsx
│   │   ├── WalletConnect.tsx
│   │   └── ...other components
│   ├── lib/
│   │   ├── wagmi.ts              # Wagmi config
│   │   ├── api.ts                # API client
│   │   ├── contracts.ts          # Contract ABIs & addresses
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useProperty.ts
│   │   ├── usePortfolio.ts
│   │   ├── useTransaction.ts
│   │   └── useWallet.ts
│   ├── styles/
│   │   └── globals.css           # Tailwind
│   ├── public/
│   │   └── images/
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## PHASE 1: SMART CONTRACTS (Weeks 1-2)

### Contract 1: PropertyToken.sol
**Purpose:** ERC-20 token representing fractional property ownership

**Specifications:**
```solidity
// Key Functions:
function createPropertyToken(
    string memory name,
    uint256 totalSupply,
    address propertyOwner
) external onlyAdmin returns (address);

function transferPropertyToken(
    address from,
    address to,
    uint256 amount
) external;

function balanceOf(address account) external view returns (uint256);

function approve(address spender, uint256 amount) external returns (bool);

function burn(uint256 amount) external;
```

**Requirements:**
- Inherit from OpenZeppelin ERC-20
- Each property gets its own token contract (or use one factory)
- Token metadata stored on-chain
- Pause functionality for emergencies
- Ownership tracking

**Testing:**
- Unit tests for mint, transfer, burn
- Test approval mechanism
- Test decimal handling

---

### Contract 2: EscrowManager.sol
**Purpose:** Handle deposits, multi-sig releases, and secure transactions

**Specifications:**
```solidity
// Key Functions:
function initiateEscrow(
    address buyer,
    address seller,
    address propertyToken,
    uint256 tokenAmount,
    uint256 dinarAmount
) external returns (uint256 escrowId);

function confirmEscrow(uint256 escrowId) external onlyApprover;

function releaseEscrow(uint256 escrowId) external onlyAdmin;

function refundEscrow(uint256 escrowId) external onlyAdmin;

function getEscrowStatus(uint256 escrowId) external view returns (EscrowStatus);

struct EscrowStatus {
    address buyer;
    address seller;
    uint256 dinarAmount;
    uint256 tokenAmount;
    bool released;
    uint256 createdAt;
}
```

**Requirements:**
- Lock funds in contract during transaction
- Multi-signature support (buyer, seller, admin confirmation)
- Time-lock mechanism (if no confirmation after 7 days, auto-refund)
- Event emission for all state changes
- Secure fund handling

**Testing:**
- Test escrow initiation
- Test approval flow
- Test release conditions
- Test timeout/refund mechanism

---

### Contract 3: RentalDistribution.sol
**Purpose:** Automatically distribute rental income to token holders

**Specifications:**
```solidity
// Key Functions:
function depositRentalIncome(
    address propertyToken,
    uint256 amount
) external payable;

function calculateShare(
    address propertyToken,
    address holder
) external view returns (uint256);

function claimPayout(address propertyToken) external;

function batchDistribute(
    address propertyToken,
    address[] calldata holders
) external onlyAdmin;

function scheduleDistribution(
    address propertyToken,
    uint256 frequency
) external onlyAdmin;
```

**Requirements:**
- Proportional payouts based on token holdings
- Track payout history per property
- Automatic vs manual distribution options
- Prevent double-claiming
- Event logging for transparency

**Testing:**
- Test proportional calculations
- Test claiming mechanism
- Test batch distribution
- Test payout tracking

---

### Contract 4: PropertyRegistry.sol
**Purpose:** Immutable record of property metadata and ownership transfers

**Specifications:**
```solidity
// Key Functions:
function registerProperty(
    string memory title,
    string memory location,
    string memory country,
    uint256 valuationUSD,
    address tokenAddress,
    string memory metadataURI
) external onlyAdmin returns (uint256 propertyId);

function getPropertyMetadata(uint256 propertyId) 
    external view returns (PropertyMetadata);

function recordOwnershipTransfer(
    uint256 propertyId,
    address from,
    address to,
    uint256 tokens,
    bytes32 txHash
) external;

function verifyOwnership(uint256 propertyId, address user) 
    external view returns (uint256);

struct PropertyMetadata {
    uint256 id;
    string title;
    string location;
    string country;
    uint256 valuationUSD;
    address tokenAddress;
    string metadataURI;
    uint256 createdAt;
}
```

**Requirements:**
- Immutable property records
- URI linking to external legal documents
- Full ownership history tracking
- Timestamp verification
- Country-specific metadata

**Testing:**
- Test property registration
- Test metadata retrieval
- Test ownership tracking
- Test URI validation

---

## PHASE 2: BACKEND API (Weeks 3-5)

### Database Schema (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    kyc_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    dinar_balance DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    country VARCHAR(100),
    price_usd DECIMAL(18, 2),
    total_tokens BIGINT,
    token_contract_address VARCHAR(255),
    images JSONB,
    legal_documents JSONB,
    listing_status ENUM('active', 'sold', 'pending') DEFAULT 'active',
    golden_visa_eligible BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ownership Table
CREATE TABLE ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    token_balance DECIMAL(18, 8),
    ownership_percentage DECIMAL(5, 2),
    transaction_hash VARCHAR(255),
    acquired_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    property_id UUID REFERENCES properties(id),
    tokens_transferred DECIMAL(18, 8),
    dinar_amount DECIMAL(18, 8),
    transaction_type ENUM('purchase', 'sale', 'rental_distribution'),
    tx_hash VARCHAR(255),
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rental Payouts Table
CREATE TABLE rental_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    holder_id UUID REFERENCES users(id),
    amount DECIMAL(18, 8),
    percentage DECIMAL(5, 2),
    payout_date TIMESTAMP,
    tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KYC Documents Table
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    s3_url VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_ownership_user ON ownership(user_id);
CREATE INDEX idx_ownership_property ON ownership(property_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_property ON transactions(property_id);
```

### Core API Endpoints

**Authentication Routes:**

```typescript
// POST /api/auth/signup
Request: { email, password, fullName }
Response: { userId, token, walletRequired }

// POST /api/auth/login
Request: { email, password }
Response: { userId, token, wallet }

// POST /api/auth/wallet-verify
Request: { walletAddress, signature, message }
Response: { userId, token, kyc_status }

// POST /api/auth/kyc-submit
Request: { userId, documents: File[], country, taxId }
Response: { kycId, status: 'pending' }

// GET /api/auth/user
Headers: { Authorization: 'Bearer token' }
Response: { user: User }
```

**Property Routes:**

```typescript
// GET /api/properties
Query: { 
  skip, limit, country, minPrice, maxPrice, 
  goldenVisaEligible, sortBy 
}
Response: { properties: Property[], total, hasMore }

// GET /api/properties/[id]
Response: { 
  property: Property,
  metadata: PropertyMetadata,
  ownership: { holders: [], distribution: [] },
  transactions: Transaction[],
  contractAddress: string
}

// POST /api/properties (admin only)
Request: { title, description, location, price, images, docs }
Response: { propertyId, tokenContractAddress }

// PUT /api/properties/[id] (admin only)
Request: { updated fields }
Response: { property: Property }
```

**Portfolio Routes:**

```typescript
// GET /api/portfolio
Headers: { Authorization: 'Bearer token' }
Response: {
  totalInvested: number,
  unrealizedGains: number,
  monthlyIncome: number,
  holdings: Holding[],
  analytics: { pieChart, lineChart, allocation }
}

// GET /api/portfolio/analytics
Response: {
  portfolioValue: number[],
  timestamps: string[],
  allocation: { propertyId: percentage },
  geoDistribution: { country: percentage }
}
```

**Transaction Routes:**

```typescript
// POST /api/transactions/[propertyId]
Request: { 
  buyerAddress, tokens, dinarAmount, 
  txHash, escrowId 
}
Response: { transactionId, status }

// GET /api/transactions
Headers: { Authorization: 'Bearer token' }
Query: { skip, limit, propertyId, type, status }
Response: { transactions: Transaction[], total }
```

**Golden Visa Routes:**

```typescript
// GET /api/golden-visa/eligibility
Headers: { Authorization: 'Bearer token' }
Response: {
  countries: {
    Portugal: { required: 500000, invested: 750000, eligible: true },
    Greece: { required: 250000, invested: 750000, eligible: true },
    ...
  }
}

// POST /api/golden-visa/export-proof
Headers: { Authorization: 'Bearer token' }
Response: { PDF file as download }
```

### Blockchain Integration Service

```typescript
// File: src/services/blockchain.ts

import { ethers } from 'ethers';
import { 
  PropertyToken, 
  EscrowManager, 
  RentalDistribution,
  PropertyRegistry 
} from '../contracts';

class BlockchainService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private escrowManager: EscrowManager;
  private rentalDistribution: RentalDistribution;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.KORTANA_RPC_URL
    );
    // Signer for admin operations (use private key)
    this.signer = new ethers.Wallet(
      process.env.ADMIN_PRIVATE_KEY,
      this.provider
    );
  }

  // Initiate escrow transaction
  async initiateEscrow(
    buyer: string,
    seller: string,
    propertyToken: string,
    tokenAmount: bigint,
    dinarAmount: bigint
  ) {
    const tx = await this.escrowManager.initiateEscrow(
      buyer,
      seller,
      propertyToken,
      tokenAmount,
      dinarAmount
    );
    return tx.wait();
  }

  // Release escrow after verification
  async releaseEscrow(escrowId: number) {
    const tx = await this.escrowManager.releaseEscrow(escrowId);
    return tx.wait();
  }

  // Get token balance
  async getTokenBalance(
    tokenAddress: string,
    userAddress: string
  ) {
    const token = new ethers.Contract(
      tokenAddress,
      PropertyToken.abi,
      this.provider
    );
    return token.balanceOf(userAddress);
  }

  // Distribute rental income
  async distributeRental(
    propertyToken: string,
    amount: bigint
  ) {
    const tx = await this.rentalDistribution.depositRentalIncome(
      propertyToken,
      amount,
      { value: amount }
    );
    return tx.wait();
  }

  // Monitor transaction status
  async monitorTransaction(txHash: string) {
    const receipt = await this.provider.getTransactionReceipt(txHash);
    return {
      confirmed: receipt !== null,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed,
      status: receipt?.status === 1 ? 'success' : 'failed'
    };
  }
}

export default new BlockchainService();
```

### Escrow Service

```typescript
// File: src/services/escrow.ts

class EscrowService {
  
  async initiateEscrow(
    propertyId: string,
    buyerId: string,
    sellerId: string,
    tokens: number,
    dinarAmount: number
  ) {
    // 1. Create DB record
    const escrow = await db.escrow.create({
      propertyId,
      buyerId,
      sellerId,
      tokens,
      dinarAmount,
      status: 'initiated'
    });

    // 2. Lock funds on blockchain
    const property = await db.properties.findById(propertyId);
    const txHash = await blockchainService.initiateEscrow(
      buyerId,
      sellerId,
      property.tokenContractAddress,
      tokens,
      dinarAmount
    );

    // 3. Update with tx hash
    escrow.txHash = txHash;
    escrow.status = 'awaiting_confirmation';
    await escrow.save();

    return escrow;
  }

  async confirmEscrow(escrowId: string, confirmerRole: 'seller' | 'admin') {
    const escrow = await db.escrow.findById(escrowId);
    
    if (confirmerRole === 'seller') {
      escrow.sellerConfirmed = true;
    }
    if (confirmerRole === 'admin') {
      escrow.adminConfirmed = true;
    }

    if (escrow.sellerConfirmed && escrow.adminConfirmed) {
      // All conditions met - trigger release
      escrow.status = 'ready_to_release';
    }

    await escrow.save();
    return escrow;
  }

  async releaseEscrow(escrowId: string) {
    const escrow = await db.escrow.findById(escrowId);

    // Check conditions
    if (!escrow.sellerConfirmed || !escrow.adminConfirmed) {
      throw new Error('Not all confirmations received');
    }

    // Release on blockchain
    const txHash = await blockchainService.releaseEscrow(escrow.escrowId);

    // Update records
    escrow.status = 'released';
    escrow.releasedAt = new Date();
    escrow.releaseTxHash = txHash;
    await escrow.save();

    // Update ownership
    await db.ownership.create({
      userId: escrow.buyerId,
      propertyId: escrow.propertyId,
      tokenBalance: escrow.tokens,
      ownershipPercentage: (escrow.tokens / totalTokens) * 100,
      transactionHash: txHash
    });

    return escrow;
  }

  async checkTimeout(escrowId: string) {
    const escrow = await db.escrow.findById(escrowId);
    const initiatedTime = escrow.createdAt.getTime();
    const currentTime = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    if (currentTime - initiatedTime > sevenDaysMs) {
      // Auto refund
      await blockchainService.refundEscrow(escrow.escrowId);
      escrow.status = 'refunded';
      await escrow.save();
    }
  }
}
```

---

## PHASE 3: FRONTEND APPLICATION (Weeks 6-10)

### Setup & Configuration

```bash
# Create Next.js project
npx create-next-app@latest aether-frontend --typescript --tailwind

# Install dependencies
npm install \
  wagmi viem @rainbow-me/rainbowkit \
  axios react-query zustand framer-motion \
  react-hook-form zod \
  recharts date-fns

# Install Hardhat (for contracts in same repo)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### Wagmi Configuration

```typescript
// File: lib/wagmi.ts

import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

// Define Kortana chain
const kortana = {
  id: 1, // Update with actual Kortana chain ID
  name: 'Kortana',
  network: 'kortana',
  nativeCurrency: { name: 'Dinar', symbol: 'DIN', decimals: 18 },
  rpcUrls: {
    public: { http: [process.env.NEXT_PUBLIC_KORTANA_RPC_URL!] },
    default: { http: [process.env.NEXT_PUBLIC_KORTANA_RPC_URL!] },
  },
  blockExplorers: {
    default: { name: 'Kortana Explorer', url: process.env.NEXT_PUBLIC_KORTANA_EXPLORER! },
  },
};

export const config = createConfig({
  chains: [kortana],
  transports: {
    [kortana.id]: http(),
  },
});
```

### Landing Page Component

```typescript
// File: app/page.tsx

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-6 text-[#E63946]">
            Own the World, One Token at a Time
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AETHER brings fractional real estate ownership to your fingertips. 
            Invest globally. Settle instantly. On Kortana blockchain.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/marketplace" className="px-8 py-3 bg-[#E63946] text-white rounded-lg hover:bg-[#D62828] transition-colors flex items-center gap-2">
              Start Investing <ArrowRight size={20} />
            </Link>
            <Link href="/auth/signup" className="px-8 py-3 border-2 border-[#E63946] text-[#E63946] rounded-lg hover:bg-[#E63946] hover:text-white transition-colors">
              Create Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why AETHER?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Blockchain Verified',
                desc: 'Every transaction settled on Kortana. Immutable ownership records.'
              },
              {
                icon: Zap,
                title: 'Instant Settlement',
                desc: 'No banking delays. Transactions settle in seconds.'
              },
              {
                icon: Globe,
                title: 'Global Access',
                desc: 'Invest in premium properties worldwide from your couch.'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-lg shadow-md"
              >
                <item.icon size={40} className="text-[#E63946] mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-[#E63946] text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to invest smarter?</h2>
        <Link href="/auth/signup" className="px-8 py-3 bg-white text-[#E63946] rounded-lg font-bold hover:bg-gray-100 transition-colors inline-block">
          Get Started Now
        </Link>
      </section>
    </div>
  );
}
```

### Marketplace Component

```typescript
// File: app/(app)/marketplace/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropertyCard from '@/components/PropertyCard';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Property {
  id: string;
  title: string;
  location: string;
  country: string;
  priceUSD: number;
  images: string[];
  tokensAvailable: number;
  expectedYield: number;
  goldenVisaEligible: boolean;
}

export default function Marketplace() {
  const [filters, setFilters] = useState({
    country: '',
    minPrice: 0,
    maxPrice: 1000000,
    goldenVisaEligible: false,
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => api.get('/properties', { params: filters }),
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#E63946] mb-8">Discover Properties</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <input
            type="text"
            placeholder="Country"
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            className="px-4 py-2 border-2 border-[#E63946] rounded-lg focus:outline-none"
          />
          <input
            type="number"
            placeholder="Min Price"
            onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
            className="px-4 py-2 border-2 border-[#E63946] rounded-lg"
          />
          <input
            type="number"
            placeholder="Max Price"
            onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
            className="px-4 py-2 border-2 border-[#E63946] rounded-lg"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={(e) => setFilters({ ...filters, goldenVisaEligible: e.target.checked })}
              className="w-4 h-4"
            />
            Golden Visa Eligible
          </label>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="text-center">Loading properties...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {properties?.data?.map((property: Property, i: number) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

### Checkout/Escrow Flow

```typescript
// File: app/(app)/checkout/[propertyId]/page.tsx

'use client';

import { useState } from 'react';
import { useAccount, useContract, useContractWrite } from 'wagmi';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const STEPS = [
  'Review Purchase',
  'Connect Wallet',
  'Approve Spending',
  'Initiate Escrow',
  'Awaiting Confirmation',
  'Settlement Complete'
];

export default function CheckoutPage({ params }: { params: { propertyId: string } }) {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [dinarAmount, setDinarAmount] = useState(0);
  const [escrowId, setEscrowId] = useState<string | null>(null);

  const handleProceed = async () => {
    switch (step) {
      case 0:
        // Validate and move to wallet connection
        setStep(1);
        break;
      case 1:
        // Wallet already connected via wagmi
        setStep(2);
        break;
      case 2:
        // Approve Dinar spend
        setStep(3);
        break;
      case 3:
        // Initiate escrow
        const result = await api.post(`/transactions/${params.propertyId}`, {
          tokens,
          dinarAmount,
          buyerAddress: address,
        });
        setEscrowId(result.data.escrowId);
        setStep(4);
        break;
      case 4:
        // Poll for confirmation
        setStep(5);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-[#E63946] mb-12">Purchase Property Tokens</h1>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {STEPS.map((stepName, i) => (
              <div
                key={i}
                className={`text-sm font-bold ${
                  i <= step ? 'text-[#E63946]' : 'text-gray-400'
                }`}
              >
                {stepName}
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <motion.div
              className="h-2 bg-[#E63946] rounded-full"
              animate={{ width: `${(step + 1) / STEPS.length * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-50 p-8 rounded-lg mb-8">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Review Purchase</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Tokens to Purchase</label>
                  <input
                    type="number"
                    value={tokens}
                    onChange={(e) => {
                      const t = Number(e.target.value);
                      setTokens(t);
                      setDinarAmount(t * 100); // Mock price
                    }}
                    className="w-full px-4 py-2 border-2 border-[#E63946] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Total Cost (Dinar)</label>
                  <input
                    type="number"
                    value={dinarAmount}
                    disabled
                    className="w-full px-4 py-2 bg-gray-200 border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
              {isConnected ? (
                <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded-lg">
                  Connected: {address}
                </div>
              ) : (
                <button className="px-6 py-2 bg-[#E63946] text-white rounded-lg">
                  Connect Wallet
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Initiating Escrow...</h2>
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946]"></div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-600">✓ Settlement Complete</h2>
              <p className="text-gray-600">Your tokens are now in your wallet.</p>
              <p className="text-sm text-gray-500 mt-4">Escrow ID: {escrowId}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className="px-6 py-2 border-2 border-[#E63946] text-[#E63946] rounded-lg hover:bg-[#E63946] hover:text-white transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleProceed}
            className="flex-1 px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#D62828] transition-colors font-bold"
          >
            {step === STEPS.length - 1 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Portfolio Dashboard

```typescript
// File: app/(app)/portfolio/page.tsx

'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { BarChart, PieChart, LineChart, Line, Bar, Pie, Cell } from 'recharts';
import api from '@/lib/api';

export default function Portfolio() {
  const { address } = useAccount();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', address],
    queryFn: () => api.get('/portfolio'),
    enabled: !!address,
  });

  if (isLoading) return <div>Loading portfolio...</div>;

  const colors = ['#E63946', '#D62828', '#FF6B6B', '#FFA07A'];

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#E63946] mb-8">Your Portfolio</h1>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Invested', value: `$${portfolio?.totalInvested || 0}` },
            { label: 'Unrealized Gains', value: `$${portfolio?.unrealizedGains || 0}` },
            { label: 'Monthly Income', value: `$${portfolio?.monthlyIncome || 0}` },
            { label: 'ROI', value: `${portfolio?.roi || 0}%` },
          ].map((metric, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#E63946]">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-[#E63946]">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Allocation Pie Chart */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Portfolio Allocation</h2>
            <PieChart width={300} height={300}>
              <Pie
                data={portfolio?.allocation || []}
                cx={150}
                cy={150}
                labelLine={false}
                label={({ property, percent }) => `${property}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {portfolio?.allocation?.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>

          {/* Performance Line Chart */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Portfolio Performance</h2>
            <LineChart width={500} height={300} data={portfolio?.performance || []}>
              <Line type="monotone" dataKey="value" stroke="#E63946" strokeWidth={2} />
            </LineChart>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#E63946] text-white">
              <tr>
                <th className="px-6 py-4 text-left">Property</th>
                <th className="px-6 py-4 text-left">Tokens Held</th>
                <th className="px-6 py-4 text-left">Current Value</th>
                <th className="px-6 py-4 text-left">Ownership %</th>
                <th className="px-6 py-4 text-left">Monthly Yield</th>
              </tr>
            </thead>
            <tbody>
              {portfolio?.holdings?.map((holding, i) => (
                <tr key={i} className="border-t hover:bg-gray-100">
                  <td className="px-6 py-4">{holding.property}</td>
                  <td className="px-6 py-4">{holding.tokens}</td>
                  <td className="px-6 py-4">${holding.value}</td>
                  <td className="px-6 py-4">{holding.ownership}%</td>
                  <td className="px-6 py-4 text-green-600 font-bold">${holding.monthlyYield}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 4: DEPLOYMENT & TESTING (Weeks 11-12)

### Smart Contract Testing with Hardhat

```typescript
// File: contracts/test/PropertyToken.test.ts

import { expect } from "chai";
import { ethers } from "hardhat";

describe("PropertyToken", function () {
  let propertyToken: any;
  let owner: any, buyer: any, seller: any;

  beforeEach(async function () {
    [owner, buyer, seller] = await ethers.getSigners();
    
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    propertyToken = await PropertyToken.deploy("Property1", ethers.parseEther("1000"), owner.address);
    await propertyToken.deployed();
  });

  it("Should mint tokens to owner", async function () {
    const balance = await propertyToken.balanceOf(owner.address);
    expect(balance).to.equal(ethers.parseEther("1000"));
  });

  it("Should transfer tokens between users", async function () {
    await propertyToken.transfer(buyer.address, ethers.parseEther("100"));
    const buyerBalance = await propertyToken.balanceOf(buyer.address);
    expect(buyerBalance).to.equal(ethers.parseEther("100"));
  });

  it("Should handle approvals correctly", async function () {
    await propertyToken.approve(buyer.address, ethers.parseEther("500"));
    const allowance = await propertyToken.allowance(owner.address, buyer.address);
    expect(allowance).to.equal(ethers.parseEther("500"));
  });
});
```

### Environment Setup

```bash
# .env.example

# Blockchain
NEXT_PUBLIC_KORTANA_RPC_URL=https://kortana-testnet-rpc.example.com
NEXT_PUBLIC_KORTANA_EXPLORER=https://explorer.kortana.com
NEXT_PUBLIC_KORTANA_CHAIN_ID=1

# Contract Addresses
NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_ESCROW_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_RENTAL_DISTRIBUTION_ADDRESS=0x...
NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=0x...

# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/aether
REDIS_URL=redis://localhost:6379
NODE_ENV=production

# Admin
ADMIN_PRIVATE_KEY=0x... # Only on backend
ADMIN_WALLET_ADDRESS=0x...

# Auth
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=aether-properties
AWS_REGION=us-east-1

# KYC Service (e.g., Chainalysis)
KYC_API_KEY=...
KYC_API_ENDPOINT=...

# Analytics
SENTRY_DSN=...
```

### Deployment Checklist

```markdown
## Pre-Deployment

- [ ] All contracts audited
- [ ] All tests passing (contracts + backend + frontend)
- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Kortana RPC endpoint tested and stable
- [ ] Admin wallet funded with Dinar for gas
- [ ] S3 bucket configured
- [ ] KYC service integrated
- [ ] Email service configured

## Smart Contracts

- [ ] Deploy PropertyToken contract
- [ ] Deploy EscrowManager contract
- [ ] Deploy RentalDistribution contract
- [ ] Deploy PropertyRegistry contract
- [ ] Verify contracts on Kortana explorer
- [ ] Update contract addresses in backend

## Backend

- [ ] Deploy to AWS Lambda / Digital Ocean
- [ ] Database backup configured
- [ ] Redis cache warmed up
- [ ] API rate limiting tested
- [ ] Error logging configured (Sentry)
- [ ] Monitoring dashboards created

## Frontend

- [ ] Build optimized
- [ ] Deploy to Vercel
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] CDN enabled
- [ ] Analytics configured

## Post-Deployment

- [ ] Smoke tests on mainnet
- [ ] Admin dashboard verified
- [ ] User flow tested end-to-end
- [ ] Escrow transactions tested
- [ ] Wallet connections verified
- [ ] Mobile responsiveness checked
```

---

## KEY DELIVERABLES

By end of development, you will have:

1. **4 Auditable Solidity Smart Contracts**
   - PropertyToken.sol
   - EscrowManager.sol
   - RentalDistribution.sol
   - PropertyRegistry.sol
   - Fully tested, documented, deployment scripts

2. **Production Node.js Backend**
   - PostgreSQL database with migrations
   - REST APIs (15+ endpoints)
   - Blockchain integration service
   - KYC/AML compliance
   - Escrow logic
   - Error handling & logging

3. **Beautiful Next.js Frontend**
   - 11+ pages as specified
   - Red & white color scheme
   - Real & white design
   - Wallet integration (Wagmi)
   - Real-time blockchain data
   - Responsive & accessible

4. **Complete Documentation**
   - Smart contract ABIs & documentation
   - API endpoint documentation (Swagger/OpenAPI)
   - Deployment guide
   - User guide
   - Admin guide

5. **Testing Suite**
   - Unit tests (contracts + backend)
   - Integration tests
   - E2E tests (checkout flow)
   - Load testing results

---

## BUILD PRIORITY ORDER

**Week 1-2:** Smart Contracts
- Create all 4 contracts
- Write tests
- Deploy to testnet

**Week 3-4:** Backend Foundation
- Set up Express server
- Create database schema
- Build auth endpoints
- Implement blockchain service

**Week 5:** Backend Properties & Portfolio
- Build property CRUD endpoints
- Implement portfolio calculations
- Build transaction tracking

**Week 6-7:** Frontend Setup & Pages
- Create project structure
- Landing page
- Marketplace
- Property detail page

**Week 8:** Frontend Checkout & Portfolio
- Escrow checkout flow
- Portfolio dashboard
- Transaction history

**Week 9:** Polish & Integration
- Connect frontend to backend
- Wallet integration
- Golden Visa calculator
- Admin dashboard

**Week 10-12:** Testing, Deployment & Documentation
- Full testing suite
- Deploy to mainnet
- Create documentation
- User onboarding

---

## SUCCESS METRICS

Your build is successful when:

✅ Users can browse properties on marketplace
✅ Users can purchase tokens with Dinar via escrow
✅ Transactions verify on Kortana blockchain
✅ Portfolio updates in real-time
✅ Rental income distributes automatically
✅ Golden Visa eligibility calculates correctly
✅ Admin can manage properties
✅ Mobile experience is seamless
✅ All tests passing
✅ Documentation complete

---

## FINAL NOTES

- **Color Scheme:** Red (#E63946) primary with white accents
- **Blockchain:** Kortana EVM only
- **Smart Contracts:** Solidity only
- **Frontend:** Next.js with Tailwind CSS
- **Design:** Professional, trust-inspiring, modern

You're building the future of real estate. Let's make it beautiful and functional.

**AETHER: Own the World, One Token at a Time**
