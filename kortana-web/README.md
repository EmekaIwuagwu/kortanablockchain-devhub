# Kortana Blockchain Website

This is the official website for Kortana Blockchain, built with Next.js 16, React 19, and Tailwind CSS v4.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- MongoDB (for faucet and presale features)

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Configure the required environment variables in `.env.local`:

#### Required Variables

- `MONGODB_URI`: MongoDB connection string for storing faucet requests and presale data
  - Example: `mongodb://localhost:27017/kortana_presale`
  - For production, use a hosted MongoDB service like MongoDB Atlas

#### Network Configuration (Optional - defaults provided)

- `NEXT_PUBLIC_TESTNET_RPC_URL`: Testnet RPC endpoint
  - Default: `https://poseidon-rpc.testnet.kortana.xyz/`
  
- `NEXT_PUBLIC_DEVNET_RPC_URL`: Devnet RPC endpoint for local development
  - Default: `http://localhost:8545`

#### Faucet Configuration (Optional - defaults provided)

- `FAUCET_AMOUNT`: Amount of DNR tokens distributed per request
  - Default: `500`
  
- `FAUCET_RATE_LIMIT_HOURS`: Hours between allowed requests per address
  - Default: `24`
  
- `FAUCET_RPC_TIMEOUT_MS`: RPC request timeout in milliseconds
  - Default: `30000` (30 seconds)

### Running the Development Server

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Faucet Documentation

The Kortana Faucet allows developers to request testnet DNR tokens for testing and development.

### Quick Start

See **[Quick Start Guide](./FAUCET_SETUP_QUICKSTART.md)** to get up and running in 5 minutes!

### Complete Documentation

- **[Quick Start Guide](./FAUCET_SETUP_QUICKSTART.md)** - Get started in 5 minutes
- **[Full Documentation](./FAUCET_DOCUMENTATION.md)** - Complete setup guide, architecture, and usage
- **[API Documentation](./FAUCET_API.md)** - API endpoints, request/response formats, and examples
- **[Testing Guide](./FAUCET_TESTING_GUIDE.md)** - Comprehensive testing procedures
- **[Troubleshooting Guide](./FAUCET_TROUBLESHOOTING.md)** - Common issues and solutions

## Project Structure

- `app/`: Contains the App Router pages.
  - `page.tsx`: Homepage
  - `architecture/`: Architecture page
  - `technology/`: Technology page
  - `developers/`: Developers portal
  - `faucets/`: Faucet page for requesting testnet tokens
  - `network-status/`: Network status dashboard
  - `api/faucet/request/`: Faucet API endpoint
  - `globals.css`: Global styles and Kortana Design System tokens.
- `components/`: Reusable UI components.
  - `landing/`: Components specific to the landing page (Hero, KeyMetrics, etc.).
  - `Navbar.tsx`: Main navigation.
  - `Footer.tsx`: Main footer.
- `lib/`: Utility modules and services.
  - `faucetRpc.ts`: Blockchain RPC communication
  - `validation.ts`: Input validation and sanitization
  - `errorHandler.ts`: Error handling and parsing
  - `rpc.ts`: Network configuration
  - `mongodb.ts`: Database connection
  - `logger.ts`: Structured logging

## Design System

The project uses a custom Tailwind configuration defined in `app/globals.css` using the new `@theme` directive.
Key colors:
- Deep Space Black (`bg-deep-space`)
- Cyan Accent (`text-cyan-accent`)
- Electric Purple (`text-electric-purple`)

## Verification

The project has been built and verified successfully.
To build for production:
```bash
npm run build
```
