# AETHER: Fractional Real Estate Tokenization Platform
## Built on Kortana Blockchain | Powered by Dinar

---

## Platform Overview

**Platform Name:** AETHER  
**Primary Color (Brand):** `#DC143C` (Crimson Red)  
**Accent Color:** `#FFFFFF` (Pure White)  
**Secondary Color:** `#B22222` (Fire Brick Red)  
**Success Color:** `#00E676` (Emerald Green)  
**Warning Color:** `#FFB300` (Gold)  
**Tertiary Neutral:** `#F5F7FA` (Off-White)  

**Tagline:** *"Own the World, One Token at a Time"*

---

## Vision & Purpose

AETHER is a next-generation fractional real estate tokenization platform that democratizes global property investment. By leveraging the Kortana EVM blockchain, AETHER enables seamless fractional ownership of premium real estate assets, allowing investors worldwide to build diversified property portfolios with minimal capital barriers. Every transaction settles instantly on Kortana using Dinar, creating an immutable, transparent ledger of ownership.

**Key Value Propositions:**
- **Fractional Ownership:** Purchase property stakes from as low as 0.1% ownership
- **Global Access:** Invest in properties across borders without traditional banking friction
- **Golden Visa Integration:** Meet Golden Visa investment requirements through tokenized properties
- **Blockchain Settlement:** All transactions verified and settled on Kortana blockchain
- **Transparent Ownership:** Immutable proof of ownership recorded on-chain
- **Instant Liquidity:** Trade property tokens peer-to-peer on secondary markets

---

## Technical Stack

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + Framer Motion (animations)
- Wagmi + Viem (blockchain interaction)
- React Query (data fetching)
- Zustand (state management)

**Backend:**
- Next.js API Routes or Node.js (Express optional)
- PostgreSQL (property data, user profiles, transaction history)
- Redis (caching, real-time updates)
- Web3.js or Ethers.js (Kortana blockchain interaction)

**Blockchain:**
- Kortana EVM L1 blockchain
- Smart Contracts (Solidity for Kortana EVM)
- Contract ABIs for token creation and escrow

**Infrastructure:**
- Vercel (deployment)
- AWS S3 (property images, documents)
- Kortana RPC endpoints (testnet & mainnet)

---

## Core Smart Contracts Required

### 1. **PropertyToken Contract**
- Creates ERC-20 tokens representing fractional ownership
- Mints tokens based on property valuation
- Tracks total supply and individual balances

### 2. **EscrowManager Contract**
- Handles deposit locking during property purchases
- Releases funds upon condition verification
- Supports multi-signature approval (buyer, seller, administrator)

### 3. **RentalDistribution Contract**
- Automatically distributes rental income to token holders
- Proportional payouts based on ownership percentage
- Weekly/monthly payout cycles

### 4. **PropertyRegistry Contract**
- Immutable record of property metadata
- Links to legal documents and certificates
- Timestamp-verified ownership transfers

---

## Database Schema (PostgreSQL)

### Users Table
```
- id (UUID, primary key)
- wallet_address (string, unique)
- email (string)
- full_name (string)
- kyc_status (enum: pending, verified, rejected)
- dinar_balance (decimal)
- created_at (timestamp)
- updated_at (timestamp)
```

### Properties Table
```
- id (UUID, primary key)
- title (string)
- description (text)
- location (string)
- country (string)
- price_usd (decimal)
- total_tokens (integer)
- token_contract_address (string)
- images (JSON array of S3 URLs)
- legal_documents (JSON array of S3 URLs)
- listing_status (enum: active, sold, pending)
- golden_visa_eligible (boolean)
- created_at (timestamp)
```

### Ownership Table
```
- id (UUID, primary key)
- user_id (UUID, foreign key)
- property_id (UUID, foreign key)
- token_balance (decimal)
- ownership_percentage (decimal)
- transaction_hash (string, from Kortana)
- acquired_at (timestamp)
```

### Transactions Table
```
- id (UUID, primary key)
- buyer_id (UUID, foreign key)
- seller_id (UUID, foreign key)
- property_id (UUID, foreign key)
- tokens_transferred (decimal)
- dinar_amount (decimal)
- transaction_type (enum: purchase, sale, rental_distribution)
- tx_hash (string, Kortana blockchain)
- status (enum: pending, confirmed, failed)
- created_at (timestamp)
```

---

## Platform Pages & Features

### 1. **Landing Page** (`/`)
**Purpose:** Introduce AETHER and convert visitors

**Components:**
- Hero section with animated background (Kortana network visualization)
- Value proposition cards (3 main benefits)
- "Start Investing" CTA button
- Trust indicators (blockchain verified, properties listed, investors)
- FAQ section
- Footer with links and social

**Design Notes:**
- Use gradient from `#DC143C` to `#B22222`
- Animated crypto charts showing real estate growth
- Smooth scroll animations

---

### 2. **Marketplace** (`/marketplace`)
**Purpose:** Browse and discover properties

**Features:**
- Property grid/list toggle view
- Advanced filters:
  - Location (country, city, region)
  - Price range (in Dinar)
  - Ownership percentage available
  - Golden Visa eligibility
  - Expected rental yield
  - Token price (Dinar per token)
- Search bar with autocomplete
- Sort options (newest, price, yield, popularity)
- Property cards with:
  - High-quality images (carousel)
  - Key metrics (total value, tokens available, current ownership %)
  - Location map preview
  - "View Details" button

**Design Notes:**
- Cards use `#F5F7FA` background with subtle shadows
- Accent color (`#FFFFFF`) for highlights and CTAs on red backgrounds
- Responsive grid (1 col mobile, 2 tablet, 3+ desktop)

---

### 3. **Property Detail Page** (`/property/[id]`)
**Purpose:** Deep dive into a single property

**Sections:**
- **Image Gallery:** Full-screen carousel with zoom
- **Property Overview:**
  - Title, location, country
  - Total valuation (USD & Dinar)
  - Ownership distribution (pie chart)
  - Available tokens and price per token
- **Key Metrics:** (cards)
  - Expected annual yield %
  - Token price history (mini chart)
  - Total investors count
  - Golden Visa eligibility info
- **Legal & Documentation:**
  - Property deed (downloadable PDF)
  - Certificate of authenticity
  - Golden Visa documentation
  - Smart contract address (Kortana)
- **Ownership Breakdown:**
  - Top holders (anonymized)
  - Recent transactions (live feed)
- **Investment Section:**
  - Input field: "Tokens to Purchase"
  - Calculated cost in Dinar
  - "Review Purchase" button (leads to escrow flow)
- **Rental History:**
  - Monthly/quarterly distributions
  - Projected next payout

**Design Notes:**
- Use consistent spacing and typography
- Embed Kortana blockchain explorer link for transaction verification
- Show real-time ownership updates

---

### 4. **Checkout/Escrow Flow** (`/checkout/[propertyId]`)
**Purpose:** Purchase property tokens with escrow protection

**Steps (Multi-step wizard):**

**Step 1: Review Purchase**
- Property summary
- Tokens to purchase (read-only)
- Total cost in Dinar
- Wallet address confirmation

**Step 2: Connect Wallet**
- MetaMask/WalletConnect integration
- Show connected wallet address
- Verify balance (must have enough Dinar)

**Step 3: Initiate Escrow**
- Smart contract interaction
- User approves Dinar spend
- Funds locked in EscrowManager contract
- Transaction hash displayed

**Step 4: Seller Confirmation**
- Status: "Awaiting Seller" (loading state)
- Expected confirmation time
- Can cancel and retrieve Dinar if timeout occurs

**Step 5: Verification**
- Legal/technical verification (background process)
- User can upload additional documents if needed

**Step 6: Release & Settlement**
- Escrow released
- Tokens transferred to buyer's wallet
- Ownership updated on AETHER
- Transaction confirmed on Kortana

**Design Notes:**
- Progress bar at top
- Clear status indicators using `#00E676` (success) and `#FFB300` (warning)
- Large, readable transaction details
- Option to save as PDF

---

### 5. **Portfolio** (`/portfolio`)
**Purpose:** View personal investments

**Features:**
- **Portfolio Overview:**
  - Total invested (Dinar & USD)
  - Unrealized gains
  - Monthly rental income received
  - Net ROI percentage
- **Holdings Table:**
  - Property name
  - Tokens held
  - Current value (Dinar)
  - Ownership %
  - Monthly yield
  - Action buttons: "View Property", "Sell Tokens"
- **Portfolio Analytics:**
  - Pie chart: allocation by property
  - Line chart: portfolio value over time
  - Geographic distribution map
- **Rental Income Dashboard:**
  - Last payout date
  - Next payout date
  - Monthly trend chart

**Design Notes:**
- Use `#DC143C` (crimson red) background for cards
- Accent colors for positive metrics (`#00E676`)
- Real-time data updates using WebSocket or polling

---

### 6. **Sell Tokens** (`/sell/[propertyId]`)
**Purpose:** Sell property token holdings

**Features:**
- Property selection (dropdown of user's holdings)
- Input: tokens to sell
- Real-time price calculation (Dinar)
- Order preview
- Confirm sale
- Post-sale: transfer tokens to buyer, Dinar to seller (escrow)

**Design Notes:**
- Mirror checkout flow for consistency
- Show seller protection (buyer escrow funds locked)

---

### 7. **Transaction History** (`/transactions`)
**Purpose:** View all transaction history

**Features:**
- Filterable table with columns:
  - Date
  - Property
  - Type (buy, sell, rental payout)
  - Amount (Dinar)
  - Status
  - Kortana TX hash (link to explorer)
- Filter by date range, property, type
- Export as CSV

**Design Notes:**
- Use monospace font for transaction hashes
- Link directly to Kortana blockchain explorer

---

### 8. **Golden Visa Manager** (`/golden-visa`)
**Purpose:** Track Golden Visa eligibility

**Features:**
- Eligibility calculator:
  - Total real estate invested (auto-calculated)
  - Country requirements comparison
  - Eligibility status for each country
- Golden Visa properties highlight:
  - List of eligible properties
  - Minimum investment requirement met ✓/✗
  - Documentation download
- Visa application guide (country-specific)
- Export investment proof (for visa application)

**Design Notes:**
- Use clear icons and checkmarks
- Highlight `#00E676` for met requirements
- Country flags for visual organization

---

### 9. **User Profile** (`/profile`)
**Purpose:** Account settings and KYC

**Features:**
- Profile information:
  - Full name, email, phone
  - Country, tax ID
  - Wallet address (read-only)
- KYC Status:
  - Current status (verified, pending, rejected)
  - Document upload interface
  - Verification timeline
- Security:
  - Password change
  - Two-factor authentication toggle
  - Connected wallets management
- Preferences:
  - Email notification settings
  - Currency preference (USD, EUR, GBP, AED)
  - Privacy settings

**Design Notes:**
- Clear sections with dividers
- Green checkmark for verified items

---

### 10. **Admin Dashboard** (`/admin`)
**Purpose:** Platform management (admin-only)

**Features:**
- Property management:
  - Create new listing
  - Edit existing properties
  - Approve/reject listings
- User management:
  - View all users
  - Approve KYC
  - Monitor suspicious activity
- Transaction monitoring:
  - All transactions on dashboard
  - Dispute resolution
  - Escrow releases
- Analytics:
  - Total users
  - Total invested
  - Properties listed
  - Monthly volume

**Design Notes:**
- Dark theme optimized for hours of viewing
- High-contrast elements for readability

---

### 11. **Authentication** (`/auth`)
**Pages:**
- `/auth/signup` - Email + password registration
- `/auth/login` - Email/wallet login
- `/auth/forgot-password` - Password recovery
- `/auth/wallet-connect` - Web3 wallet connection (MetaMask, WalletConnect, Coinbase Wallet)

**Features:**
- OAuth integration (Google, Apple optional)
- Wallet signature verification
- Email verification requirement

**Design Notes:**
- Minimal, clean interface
- Progress indicators for multi-step auth

---

## Design System

### Color Palette
```
Primary: #DC143C (Crimson Red)
Accent: #FFFFFF (Pure White)
Secondary: #B22222 (Fire Brick Red)
Success: #00E676 (Emerald Green)
Warning: #FFB300 (Gold)
Error: #FF5252 (Red)
Neutral: #F5F7FA (Off-White)
Dark: #0A1929 (Almost Black)
```

### Typography
- **Headlines:** Inter Bold, 32-48px
- **Body:** Inter Regular, 14-16px
- **Small Text:** Inter Regular, 12px
- **Mono (addresses/hashes):** Fira Code, 12px

### Spacing
- Base unit: 8px
- Padding: 16px, 24px, 32px, 48px
- Margins: 16px, 24px, 32px

### Components
- Buttons: Rounded corners (8px), smooth hover transitions
- Cards: Subtle box-shadow, hover lift effect
- Inputs: Border `#E0E0E0`, focus `#00D4FF`
- Modals: Backdrop blur, smooth fade-in

### Animations
- Fade-ins on page load (0.4s)
- Hover state transitions (0.2s)
- Loading spinners (smooth rotation)
- Success notifications (slide-in from top-right)

---

## Key Features & Functionality

### 1. **Real-Time Blockchain Settlement**
- Every transaction settles on Kortana within seconds
- Users see transaction hash immediately
- Link to Kortana blockchain explorer on every transaction

### 2. **Escrow Smart Contracts**
- Deposits locked until conditions met
- Multi-signature releases (buyer, seller, administrator)
- Automatic refunds if conditions fail
- Transparent escrow timeline

### 3. **Rental Income Distribution**
- Smart contract automatically distributes rental income
- Proportional to ownership percentage
- Monthly distribution cycles
- Real-time payout tracking

### 4. **KYC/AML Compliance**
- Regulatory-compliant user verification
- Document storage (encrypted)
- Rejection feedback for failed KYC
- Re-submission capability

### 5. **Property Tokenization**
- Each property gets unique smart contract
- Fixed total token supply per property
- Token metadata stored on-chain
- Fractional ownership records

### 6. **Portfolio Analytics**
- Real-time portfolio value calculation
- Historical performance charts
- Geographic allocation visualization
- Projected income forecasts

### 7. **Secondary Market Trading**
- Peer-to-peer token trading
- Order book (optional for MVP)
- Price discovery mechanism
- Trade history

### 8. **Notifications & Alerts**
- Email notifications (transaction confirmations, payouts)
- In-app notifications (new messages, market updates)
- Price alerts (property token price changes)
- Golden Visa eligibility alerts

---

## User Flows

### Flow 1: New User Property Purchase
1. User lands on homepage
2. Browses marketplace
3. Clicks "View Details" on property
4. Reviews property info, legal docs, Kortana contract
5. Clicks "Buy Tokens"
6. Redirected to checkout (escrow flow)
7. Connects wallet
8. Approves Dinar spend
9. Confirms purchase
10. Escrow initiated, funds locked
11. Seller notified
12. Verification occurs (background)
13. Escrow released
14. Tokens appear in wallet
15. Ownership recorded on AETHER & Kortana

### Flow 2: Investor Golden Visa Tracking
1. User buys tokens across multiple properties
2. Navigates to /golden-visa
3. Platform auto-calculates total invested
4. Checks against Golden Visa requirements for Portugal (€500k, etc.)
5. Sees "✓ Eligible for Portugal Golden Visa"
6. Downloads investment proof document
7. Submits to Portuguese immigration authorities

### Flow 3: Rental Income Payout
1. Property generates rental income
2. Smart contract receives funds
3. Smart contract calculates proportional splits
4. Each token holder receives automatic payout
5. Payout appears in wallet + AETHER dashboard
6. User receives email notification
7. Can withdraw to bank or reinvest

---

## Smart Contract Integration Points

### Contract Calls from Frontend

**1. Buying Tokens**
```
EscrowManager.initiateEscrow(
  propertyId,
  tokensDesired,
  dinarAmount,
  buyerAddress
)
```

**2. Approving Dinar Spend**
```
DinarToken.approve(
  EscrowManager.address,
  dinarAmount
)
```

**3. Checking Token Balance**
```
PropertyToken[propertyId].balanceOf(userAddress)
```

**4. Claiming Rental Income**
```
RentalDistribution.claimPayout(propertyId)
```

**5. Selling Tokens**
```
EscrowManager.initiateTokenSale(
  propertyId,
  tokenAmount,
  sellerAddress
)
```

---

## API Endpoints (Backend)

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/wallet-verify` - Verify wallet signature
- `POST /api/auth/kyc-submit` - Submit KYC documents

### Properties
- `GET /api/properties` - List all properties (with filters)
- `GET /api/properties/[id]` - Get property details
- `POST /api/properties` - Create new property (admin)
- `PUT /api/properties/[id]` - Update property (admin)

### Portfolio
- `GET /api/portfolio` - Get user's holdings
- `GET /api/portfolio/[propertyId]` - Get holdings for specific property
- `GET /api/portfolio/analytics` - Portfolio analytics data

### Transactions
- `GET /api/transactions` - Get user's transactions
- `POST /api/transactions/[propertyId]` - Record transaction on backend after blockchain confirmation

### Golden Visa
- `GET /api/golden-visa/eligibility` - Calculate eligibility for all countries
- `GET /api/golden-visa/proof` - Generate investment proof document

### Rentals
- `GET /api/rentals/[propertyId]` - Get rental payment history
- `GET /api/rentals/schedule` - Get upcoming payouts

---

## Security Considerations

1. **Smart Contract Audits:** All contracts audited before mainnet
2. **Rate Limiting:** API endpoints rate-limited by IP/wallet
3. **HTTPS Only:** All data encrypted in transit
4. **Environment Variables:** Sensitive keys in .env.local
5. **Input Validation:** Sanitize all user inputs
6. **SQL Injection Prevention:** Use parameterized queries
7. **XSS Protection:** React's built-in protection + CSP headers
8. **CSRF Tokens:** On all state-changing endpoints
9. **KYC/AML:** Regulatory compliance with Chainalysis or similar
10. **Private Key Storage:** Never stored on backend; always client-side wallet

---

## Performance Optimization

1. **Image Optimization:**
   - Next.js Image component with lazy loading
   - WebP format with fallbacks
   - CDN delivery via Vercel/CloudFront

2. **Code Splitting:**
   - Dynamic imports for admin dashboard
   - Lazy-load marketplace filters

3. **Caching:**
   - Redis cache for property data (15-min TTL)
   - Client-side cache for portfolio data
   - Service Worker for offline support

4. **Database:**
   - Indexed queries on user_id, property_id
   - Connection pooling
   - Query optimization for complex joins

5. **Blockchain:**
   - RPC request batching
   - Local state caching for read-heavy operations
   - Event listeners instead of polling where possible

---

## Deployment & DevOps

**Development:**
- Local environment with Kortana testnet
- `.env.local` with testnet RPC endpoint

**Staging:**
- Vercel preview deployments
- Kortana testnet
- Test data only

**Production:**
- Vercel production deployment
- Kortana mainnet
- Real properties, real funds
- Monitoring: Sentry (error tracking), DataDog (performance)

---

## Roadmap & Future Enhancements

**Phase 1 (MVP - 3 months):**
- Core marketplace functionality
- Property detail pages
- Basic purchase flow with escrow
- Portfolio dashboard
- Kortana testnet integration

**Phase 2 (4-6 months):**
- Secondary market trading (P2P)
- Rental income distribution
- Golden Visa calculator
- Mobile app (React Native)
- Analytics dashboard

**Phase 3 (6-12 months):**
- Property fractional improvements (upgrades)
- Governance tokens (DAO for property decisions)
- Staking mechanism
- Cross-chain integration (other EVM chains)
- AI-powered investment recommendations

---

## Build Prompt for AI Assistant

```
You are building AETHER, a fractional real estate tokenization platform 
on the Kortana EVM blockchain. Here's the complete specification:

PROJECT OVERVIEW:
- Platform: AETHER (Fractional Real Estate Tokenization)
- Blockchain: Kortana EVM L1
- Currency: Dinar (native Kortana token)
- Frontend: Next.js 14+ with TypeScript
- Design: Gorgeous, modern UI with primary color #DC143C (Crimson Red), accent #FFFFFF (Pure White)

CORE MISSION:
Allow global investors to purchase fractional ownership of real estate properties, 
with all transactions settling on Kortana blockchain. Integrate Golden Visa tracking 
to help investors meet residency permit requirements.

PAGES TO BUILD (in order of priority):
1. Landing page - Hero, benefits, CTAs
2. Marketplace - Property discovery with advanced filters
3. Property detail page - Full property info, legal docs, Kortana contract
4. Checkout/Escrow flow - Multi-step token purchase wizard
5. Portfolio dashboard - Holdings, analytics, rental income
6. Golden Visa calculator - Eligibility tracking
7. Transaction history - All blockchain transactions
8. User profile - KYC, settings, security
9. Sell tokens - Peer-to-peer token selling
10. Admin dashboard - Property & user management

DESIGN REQUIREMENTS:
- Primary Color: #DC143C (Crimson Red)
- Accent Color: #FFFFFF (Pure White)
- Secondary: #B22222, Success: #00E676, Warning: #FFB300
- Neutral: #F5F7FA (backgrounds)
- Use Tailwind CSS + Framer Motion for animations
- Responsive design (mobile-first approach)
- Smooth page transitions and hover effects
- Professional, trust-inspiring aesthetic

BLOCKCHAIN INTEGRATION:
- Connect to Kortana EVM RPC endpoints (provide endpoint)
- Integrate Wagmi + Viem for wallet connections (MetaMask, WalletConnect)
- Display transaction hashes with links to Kortana explorer
- Show gas fees, confirmations, and status in real-time
- Implement escrow flow: user approves Dinar → funds locked → tokens transferred

AUTHENTICATION:
- Email/password registration
- Wallet signature verification (Web3)
- KYC document upload
- Two-factor authentication option

DATABASE STRUCTURE (PostgreSQL):
- Users: id, wallet_address, email, kyc_status, dinar_balance
- Properties: id, title, location, price_usd, token_contract, images, legal_docs
- Ownership: id, user_id, property_id, token_balance, tx_hash
- Transactions: id, buyer_id, property_id, dinar_amount, tx_hash, status

SMART CONTRACT LANGUAGE:
- All smart contracts written in Solidity for Kortana EVM compatibility
- Contracts: PropertyToken.sol, EscrowManager.sol, RentalDistribution.sol, PropertyRegistry.sol

SMART CONTRACT FUNCTIONS TO INTEGRATE:
1. PropertyToken.balanceOf(address) - Check token holdings
2. EscrowManager.initiateEscrow(...) - Lock funds during purchase
3. RentalDistribution.claimPayout(propertyId) - Claim rental income
4. PropertyRegistry.getPropertyMetadata(...) - Fetch property info

API ENDPOINTS:
- GET /api/properties - List properties with filters
- GET /api/properties/[id] - Property details
- GET /api/portfolio - User holdings
- POST /api/transactions - Record blockchain transaction
- GET /api/golden-visa/eligibility - Calculate visa eligibility

CRITICAL FEATURES:
1. Real-time Kortana settlement - Every transaction must verify on-chain
2. Escrow protection - Funds locked until conditions met
3. Transparent ownership - Show all holders, recent transactions
4. Golden Visa integration - Auto-calculate eligibility
5. Rental income tracking - Show monthly/quarterly payouts
6. Security - HTTPS, input validation, rate limiting, KYC

START WITH:
1. Project setup (Next.js, Tailwind, Wagmi)
2. Landing page skeleton with branding
3. Marketplace page with mock property data
4. Wallet connection flow
5. Then build out remaining pages

DELIVERABLES:
- Fully functional Next.js application
- Beautiful, responsive UI matching design specs
- Kortana blockchain integration (testnet ready)
- All pages from specification
- API routes for backend functionality
- Database schema and migrations
- Environment setup instructions
- Deployment-ready code

Let's build the future of real estate ownership.
```

---

## Contact & Support

**For Questions on Implementation:**
- Technical: Refer to Kortana RPC documentation
- Smart Contracts: Provide contract ABIs and addresses
- Design: Refer to color palette and component specs above

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Ready for Development

---

*AETHER: Own the World, One Token at a Time.*
