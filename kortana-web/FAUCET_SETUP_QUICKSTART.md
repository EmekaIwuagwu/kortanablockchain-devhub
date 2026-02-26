# Kortana Faucet - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get your Kortana Faucet up and running quickly.

## Prerequisites

- Node.js 18+ or Bun
- MongoDB (local or hosted)
- 5 minutes of your time

## Step 1: Install Dependencies

```bash
cd kortana-web
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local with your MongoDB connection
# Minimum required:
MONGODB_URI=mongodb://localhost:27017/kortana_presale
```

## Step 3: Start MongoDB

### Option A: Local MongoDB
```bash
mongod --dbpath ./data
```

### Option B: MongoDB Atlas (Hosted)
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Add to `.env.local`

## Step 4: Run the Application

```bash
npm run dev
```

## Step 5: Test It Out

1. Open: http://localhost:3000/faucets
2. Enter a wallet address: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
3. Click "Airdrop 500 DNR"
4. See the magic happen! ✨

## Verification

### Check if it's working:

```bash
# Run integration tests
npm run test:faucet
```

### Check the database:

```bash
mongosh
use kortana_presale
db.faucet_requests.find().pretty()
```

## Common Issues

### "Database temporarily unavailable"
- **Fix**: Make sure MongoDB is running
- **Check**: `ps aux | grep mongod`

### "Request to blockchain timed out"
- **Fix**: Check your internet connection
- **Check**: RPC endpoint is accessible

### "Rate limit exceeded"
- **Fix**: Wait 24 hours or use a different address
- **Note**: This is expected behavior!

## Next Steps

### 📚 Read the Documentation

- **[Full Documentation](./FAUCET_DOCUMENTATION.md)** - Complete guide
- **[API Reference](./FAUCET_API.md)** - API endpoints and examples
- **[Testing Guide](./FAUCET_TESTING_GUIDE.md)** - Comprehensive testing
- **[Troubleshooting](./FAUCET_TROUBLESHOOTING.md)** - Common issues

### 🔧 Customize Configuration

Edit `.env.local` to customize:

```env
# Change faucet amount
FAUCET_AMOUNT=1000

# Change rate limit (hours)
FAUCET_RATE_LIMIT_HOURS=12

# Change RPC timeout (milliseconds)
FAUCET_RPC_TIMEOUT_MS=60000
```

### 🧪 Run Full Tests

```bash
# Test everything including live RPC
npm run test:faucet:full
```

### 🗄️ Create Database Indexes

```bash
# Optimize database performance
npm run db:create-indexes
```

## Production Deployment

### 1. Environment Setup

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kortana_presale
NEXT_PUBLIC_TESTNET_RPC_URL=https://poseidon-rpc.testnet.kortana.xyz/
```

### 2. Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

### 3. Verify Deployment

```bash
# Test the API
curl -X POST https://yourdomain.com/api/faucet/request \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","network":"testnet"}'
```

## Architecture Overview

```
┌─────────────┐
│   Browser   │  User enters wallet address
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Next.js    │  Validates input
│   Frontend  │  Shows loading state
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Route  │  Checks rate limit
│  /api/faucet│  Calls blockchain
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌────────┐ ┌──────────┐
│MongoDB │ │ Kortana  │  Sends tokens
│Rate    │ │Blockchain│  Returns tx hash
│Limit   │ │   RPC    │
└────────┘ └──────────┘
```

## Key Features

✅ **Real Blockchain Integration** - Direct RPC calls to Kortana Testnet  
✅ **Rate Limiting** - 24-hour cooldown per address  
✅ **Input Validation** - Client and server-side checks  
✅ **Error Handling** - Clear, actionable error messages  
✅ **Transaction Tracking** - Display tx hash with explorer link  
✅ **Multi-Network** - Support for Testnet and Devnet  
✅ **Security** - Input sanitization, CORS, timeouts  

## Quick Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ Yes | - | MongoDB connection string |
| `NEXT_PUBLIC_TESTNET_RPC_URL` | No | Testnet URL | Testnet RPC endpoint |
| `NEXT_PUBLIC_DEVNET_RPC_URL` | No | localhost:8545 | Devnet RPC endpoint |
| `FAUCET_AMOUNT` | No | 500 | DNR tokens per request |
| `FAUCET_RATE_LIMIT_HOURS` | No | 24 | Hours between requests |
| `FAUCET_RPC_TIMEOUT_MS` | No | 30000 | RPC timeout (ms) |

### NPM Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run test:faucet      # Run integration tests
npm run test:faucet:full # Run full tests (includes RPC)
npm run db:create-indexes # Create database indexes
```

### API Endpoint

```bash
POST /api/faucet/request

Body:
{
  "address": "0x...",
  "network": "testnet"
}

Response (Success):
{
  "success": true,
  "message": "500 DNR tokens have been sent to your wallet!",
  "requestId": "...",
  "txHash": "0x..."
}

Response (Error):
{
  "success": false,
  "message": "Error description"
}
```

### Networks

**Testnet**:
- Chain ID: 72511 (0x11B3F)
- RPC: https://poseidon-rpc.testnet.kortana.xyz/
- Explorer: https://explorer.testnet.kortana.xyz

**Devnet**:
- Chain ID: 9001 (0x2329)
- RPC: http://localhost:8545
- Explorer: http://localhost:3001

## Support

### Need Help?

1. **Check Documentation**: See links above
2. **Run Tests**: `npm run test:faucet`
3. **Check Logs**: Look at console output
4. **Ask Community**: Discord/Telegram
5. **Report Issues**: GitHub Issues

### Useful Commands

```bash
# Check MongoDB connection
mongosh "mongodb://localhost:27017/kortana_presale"

# View recent requests
mongosh
> use kortana_presale
> db.faucet_requests.find().sort({createdAt:-1}).limit(10)

# Check indexes
> db.faucet_requests.getIndexes()

# Test RPC endpoint
curl -X POST https://poseidon-rpc.testnet.kortana.xyz/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## What's Next?

### For Users
- Request testnet tokens at `/faucets`
- Add Kortana network to MetaMask
- Start building on Kortana!

### For Developers
- Read the [API Documentation](./FAUCET_API.md)
- Explore the [Testing Guide](./FAUCET_TESTING_GUIDE.md)
- Check out the [Troubleshooting Guide](./FAUCET_TROUBLESHOOTING.md)

### For Administrators
- Monitor request logs
- Set up database backups
- Configure rate limits
- Monitor RPC endpoint health

## Success! 🎉

You now have a fully functional Kortana Faucet!

Users can request testnet tokens, and the system will:
1. Validate their address
2. Check rate limits
3. Send tokens via blockchain RPC
4. Track the transaction
5. Display the result

Happy building! 🚀

---

**Quick Links**:
- [Full Documentation](./FAUCET_DOCUMENTATION.md)
- [API Reference](./FAUCET_API.md)
- [Testing Guide](./FAUCET_TESTING_GUIDE.md)
- [Troubleshooting](./FAUCET_TROUBLESHOOTING.md)

**Last Updated**: February 2026  
**Maintained By**: Kortana Development Team
