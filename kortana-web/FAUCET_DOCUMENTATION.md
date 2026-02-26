# Kortana Faucet Documentation

## Overview

The Kortana Faucet is a web-based application that allows developers to request testnet DNR tokens for testing and development purposes. The system integrates directly with the Kortana blockchain via JSON-RPC calls and includes rate limiting, validation, and comprehensive error handling.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)

## Features

### Core Functionality
- **Real Blockchain Integration**: Direct JSON-RPC communication with Kortana Testnet
- **Multi-Network Support**: Supports both Testnet and Devnet environments
- **Rate Limiting**: Prevents abuse with 24-hour cooldown per wallet address
- **Address Validation**: Client and server-side validation of EVM addresses
- **Transaction Tracking**: Displays transaction hashes with explorer links
- **Real-time Feedback**: Loading states, success messages, and detailed error reporting

### Security Features
- Input sanitization and validation
- CORS protection with allowed origins
- Request payload size limits
- Error message sanitization (no internal details exposed)
- Timeout protection for RPC calls
- No automatic retries to prevent duplicate distributions

### User Experience
- Clean, modern UI with network-specific theming
- Instant client-side validation feedback
- Clear error messages with actionable information
- Transaction hash display with explorer integration
- Network selection with visual indicators

## Architecture

### System Components

```
┌─────────────────┐
│   Browser UI    │
│  (React/Next)   │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────┐
│   API Route     │
│ /api/faucet/    │
│    request      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│MongoDB │ │ Kortana RPC  │
│ Rate   │ │   Endpoint   │
│ Limit  │ │ eth_requestDNR│
└────────┘ └──────────────┘
```

### Data Flow

1. User enters wallet address and selects network
2. Frontend validates address format (client-side)
3. Frontend sends POST request to `/api/faucet/request`
4. API validates address format (server-side)
5. API checks MongoDB for recent requests (rate limiting)
6. API constructs JSON-RPC request
7. API sends RPC request to Kortana blockchain
8. API receives and parses RPC response
9. API stores request record in MongoDB
10. API returns success/error response to frontend
11. Frontend displays result to user

### Key Files

- **Frontend**: `app/faucets/page.tsx` - User interface component
- **API Route**: `app/api/faucet/request/route.ts` - Request handler
- **RPC Service**: `lib/faucetRpc.ts` - Blockchain communication
- **Validation**: `lib/validation.ts` - Input validation and sanitization
- **Error Handling**: `lib/errorHandler.ts` - Error parsing and responses
- **Configuration**: `lib/rpc.ts` - Network and faucet configuration
- **Logging**: `lib/logger.ts` - Structured logging
- **Database**: `lib/mongodb.ts` - MongoDB connection
- **Indexes**: `lib/initFaucetIndexes.ts` - Database index management

## Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- MongoDB 4.4+ (local or hosted)
- Access to Kortana Testnet RPC endpoint

### Installation Steps

1. **Clone the repository** (if not already done):
   ```bash
   cd kortana-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Edit `.env.local`** with your configuration:
   ```env
   # Required
   MONGODB_URI=mongodb://localhost:27017/kortana_presale
   
   # Optional (defaults provided)
   NEXT_PUBLIC_TESTNET_RPC_URL=https://poseidon-rpc.testnet.kortana.xyz/
   NEXT_PUBLIC_DEVNET_RPC_URL=http://localhost:8545
   FAUCET_AMOUNT=500
   FAUCET_RATE_LIMIT_HOURS=24
   FAUCET_RPC_TIMEOUT_MS=30000
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   mongod --dbpath /path/to/data
   ```

6. **Create database indexes** (optional, auto-created on first request):
   ```bash
   npm run db:create-indexes
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

8. **Access the faucet**:
   Open [http://localhost:3000/faucets](http://localhost:3000/faucets)

### Production Deployment

1. **Set environment variables** in your hosting platform
2. **Use a hosted MongoDB** service (e.g., MongoDB Atlas)
3. **Build the application**:
   ```bash
   npm run build
   ```
4. **Start the production server**:
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/kortana_presale` |

#### Optional Variables (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_TESTNET_RPC_URL` | `https://poseidon-rpc.testnet.kortana.xyz/` | Testnet RPC endpoint |
| `NEXT_PUBLIC_DEVNET_RPC_URL` | `http://localhost:8545` | Devnet RPC endpoint |
| `FAUCET_AMOUNT` | `500` | DNR tokens per request |
| `FAUCET_RATE_LIMIT_HOURS` | `24` | Hours between requests |
| `FAUCET_RPC_TIMEOUT_MS` | `30000` | RPC timeout (milliseconds) |

### Network Configuration

The faucet supports two networks:

#### Testnet
- **Chain ID**: 72511 (0x11B3F)
- **RPC URL**: https://poseidon-rpc.testnet.kortana.xyz/
- **Explorer**: https://explorer.testnet.kortana.xyz
- **Symbol**: DNR

#### Devnet (Local Development)
- **Chain ID**: 9001 (0x2329)
- **RPC URL**: http://localhost:8545
- **Explorer**: http://localhost:3001
- **Symbol**: DNR

### Database Schema

#### Collection: `faucet_requests`

```typescript
{
  _id: ObjectId,
  address: string,           // Normalized wallet address (lowercase)
  network: string,           // 'testnet' or 'devnet'
  amount: number,            // Amount requested (500)
  symbol: string,            // Token symbol ('DNR')
  status: string,            // 'pending' | 'completed' | 'failed'
  txHash?: string,           // Transaction hash (if available)
  errorMessage?: string,     // Error details (if failed)
  createdAt: Date,           // Request timestamp
  updatedAt: Date            // Last update timestamp
}
```

#### Indexes

The following indexes are automatically created:

1. **Rate Limit Index**: `{ address: 1, createdAt: -1 }`
   - Used for efficient rate limit queries
   
2. **Monitoring Index**: `{ createdAt: -1 }`
   - Used for admin monitoring and cleanup
   
3. **Status Index**: `{ status: 1, createdAt: -1 }`
   - Used for status-based queries

## Usage

### For End Users

1. **Navigate to the faucet page**: `/faucets`
2. **Select network**: Choose Testnet or Devnet
3. **Enter wallet address**: Provide your EVM-compatible address (0x...)
4. **Click "Airdrop 500 DNR"**: Submit the request
5. **Wait for confirmation**: The system will process your request
6. **View transaction**: Click the explorer link to see your transaction

### Rate Limiting

- Each wallet address can request tokens once every 24 hours
- The cooldown is per address, not per IP
- If you try to request too soon, you'll see the remaining wait time
- The timer resets 24 hours after your last successful request

### Supported Wallets

Any EVM-compatible wallet works:
- MetaMask
- Trust Wallet
- Coinbase Wallet
- WalletConnect-compatible wallets
- Hardware wallets (Ledger, Trezor)

## API Reference

See [FAUCET_API.md](./FAUCET_API.md) for detailed API documentation.

### Quick Reference

**Endpoint**: `POST /api/faucet/request`

**Request**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "network": "testnet"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "500 DNR tokens have been sent to your wallet!",
  "requestId": "507f1f77bcf86cd799439011",
  "txHash": "0xabc123..."
}
```

**Error Response** (400/429/502/503/504):
```json
{
  "success": false,
  "message": "Rate limit exceeded. You can request tokens again in 23h 45m."
}
```

## Testing

For comprehensive testing procedures, see [FAUCET_TESTING_GUIDE.md](./FAUCET_TESTING_GUIDE.md).

### Quick Test

Run the automated integration test suite:

```bash
# Basic tests (validation, RPC service, database)
npm run test:faucet

# Full tests (includes live RPC endpoint testing)
npm run test:faucet:full
```

### Manual Testing

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Navigate to**: http://localhost:3000/faucets

3. **Test happy path**:
   - Enter a valid wallet address
   - Select network (Testnet or Devnet)
   - Click "Airdrop 500 DNR"
   - Verify success message and transaction hash

4. **Test validation**:
   - Try invalid addresses
   - Try empty input
   - Verify error messages

5. **Test rate limiting**:
   - Request tokens twice with same address
   - Verify second request is rejected
   - Check error message shows remaining time

For detailed test cases and procedures, see the [Testing Guide](./FAUCET_TESTING_GUIDE.md).

## Troubleshooting

See [FAUCET_TROUBLESHOOTING.md](./FAUCET_TROUBLESHOOTING.md) for detailed troubleshooting guide.

### Common Issues

#### "Database temporarily unavailable"
- **Cause**: MongoDB connection failed
- **Solution**: Check `MONGODB_URI` in `.env.local`, ensure MongoDB is running

#### "Request to blockchain timed out"
- **Cause**: RPC endpoint not responding within 30 seconds
- **Solution**: Check RPC endpoint URL, verify network connectivity

#### "Rate limit exceeded"
- **Cause**: Address requested tokens within last 24 hours
- **Solution**: Wait for the specified time or use a different address

#### "Invalid wallet address format"
- **Cause**: Address doesn't match EVM format (0x + 40 hex chars)
- **Solution**: Verify address is correct, copy from wallet

## Security Considerations

### Input Validation
- All inputs are validated on both client and server
- Addresses must match exact EVM format
- Network selection is restricted to allowed values
- Request payload size is limited to 10KB

### Rate Limiting
- Per-address rate limiting prevents abuse
- 24-hour cooldown between requests
- Database-backed (not easily bypassed)
- Consider adding IP-based rate limiting for extra protection

### RPC Security
- All RPC calls use HTTPS (testnet)
- 30-second timeout prevents hanging connections
- Response structure validated before processing
- No automatic retries to prevent duplicate distributions

### Error Handling
- Internal error details never exposed to users
- Error messages sanitized (no file paths, IDs, etc.)
- All errors logged with context for debugging
- Appropriate HTTP status codes used

### CORS Protection
- Allowed origins configured
- Preflight requests handled
- Headers properly set

### Database Security
- Connection pooling with limits
- Query timeouts implemented
- Indexes for efficient queries
- Input sanitization prevents injection

### Recommendations

1. **Add CAPTCHA**: Implement reCAPTCHA for bot protection
2. **IP Rate Limiting**: Add secondary rate limit by IP address
3. **Monitoring**: Set up alerts for unusual patterns
4. **Wallet Balance**: Monitor faucet wallet balance
5. **Audit Logs**: Keep detailed logs for security audits
6. **Regular Updates**: Keep dependencies updated
7. **Penetration Testing**: Regular security assessments

## Monitoring and Maintenance

### Metrics to Track

1. **Request Success Rate**: Percentage of successful requests
2. **RPC Response Time**: Average time for blockchain responses
3. **Rate Limit Violations**: Number of rejected requests
4. **Error Rates**: Breakdown by error type
5. **Database Performance**: Query execution times

### Maintenance Tasks

1. **Database Cleanup**: Remove old request records (>30 days)
   ```javascript
   db.faucet_requests.deleteMany({
     createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
   })
   ```

2. **Index Optimization**: Rebuild indexes periodically
   ```bash
   npm run db:create-indexes
   ```

3. **Log Review**: Check logs for errors and unusual patterns

4. **Dependency Updates**: Keep packages up to date
   ```bash
   npm update
   npm audit fix
   ```

5. **RPC Endpoint Health**: Monitor blockchain endpoint availability

## Future Enhancements

### Planned Features

1. **CAPTCHA Integration**: Add bot protection
2. **Social Authentication**: GitHub/Twitter for higher limits
3. **Admin Dashboard**: Monitor requests and manage system
4. **Balance Checking**: Verify tokens received
5. **Webhook Notifications**: Notify users when tokens arrive
6. **Multi-language Support**: Internationalization
7. **Mobile App**: Native mobile application
8. **Analytics Dashboard**: Usage statistics and insights

### Potential Improvements

1. **Dynamic Rate Limiting**: Adjust based on faucet balance
2. **Tiered Limits**: Different limits for verified users
3. **Batch Requests**: Support multiple addresses
4. **Scheduled Distributions**: Queue requests during high load
5. **Fallback RPC Endpoints**: Automatic failover
6. **GraphQL API**: Alternative API interface
7. **WebSocket Updates**: Real-time status updates

## Support

### Getting Help

- **Documentation**: Check this guide and troubleshooting docs
- **GitHub Issues**: Report bugs or request features
- **Community**: Join the Kortana Discord/Telegram
- **Email**: support@kortana.xyz

### Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add license information here]

## Changelog

### Version 1.0.0 (Current)
- Initial release with real blockchain integration
- Multi-network support (Testnet/Devnet)
- Rate limiting and validation
- Transaction hash display
- Comprehensive error handling
- Security enhancements

---

**Last Updated**: February 2026
**Maintained By**: Kortana Development Team
