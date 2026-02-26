# Kortana Faucet API Documentation

## Overview

The Kortana Faucet API provides a RESTful endpoint for requesting testnet DNR tokens. The API handles validation, rate limiting, blockchain communication, and request tracking.

## Base URL

```
Development: http://localhost:3000
Production: https://kortana.xyz
```

## Authentication

No authentication is required. Rate limiting is enforced per wallet address.

## Endpoints

### Request Faucet Tokens

Request DNR tokens to be sent to a specified wallet address.

#### Endpoint

```
POST /api/faucet/request
```

#### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |
| `Origin` | Your domain | No (for CORS) |

#### Request Body

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "network": "testnet"
}
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | EVM-compatible wallet address (0x + 40 hex characters) |
| `network` | string | Yes | Network selection: `"testnet"` or `"devnet"` |

##### Validation Rules

- **address**:
  - Must start with `0x`
  - Must be exactly 42 characters long (0x + 40 hex)
  - Must contain only hexadecimal characters (0-9, a-f, A-F)
  - Case-insensitive
  
- **network**:
  - Must be either `"testnet"` or `"devnet"`
  - Case-sensitive

#### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "message": "500 DNR tokens have been sent to your wallet!",
  "requestId": "507f1f77bcf86cd799439011",
  "txHash": "0xabc123def456789..."
}
```

##### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful requests |
| `message` | string | Human-readable success message |
| `requestId` | string | MongoDB ObjectId of the request record |
| `txHash` | string (optional) | Transaction hash if provided by blockchain |

#### Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

##### 400 Bad Request

**Validation Errors**

Invalid address format:
```json
{
  "success": false,
  "message": "Invalid wallet address format. Must be 0x followed by 40 hexadecimal characters."
}
```

Missing address:
```json
{
  "success": false,
  "message": "Wallet address is required"
}
```

Invalid network:
```json
{
  "success": false,
  "message": "Invalid network selection"
}
```

Malformed JSON:
```json
{
  "success": false,
  "message": "Invalid request format"
}
```

Payload too large:
```json
{
  "success": false,
  "message": "Request payload too large"
}
```

##### 429 Too Many Requests

**Rate Limit Exceeded**

```json
{
  "success": false,
  "message": "Rate limit exceeded. You can request tokens again in 23h 45m."
}
```

**Headers**:
- `Retry-After`: Number of seconds until next request is allowed

**Rate Limit Rules**:
- One request per wallet address per 24 hours
- Cooldown starts from the last successful request
- Different addresses can request simultaneously

##### 500 Internal Server Error

**Database Error**

```json
{
  "success": false,
  "message": "Failed to record request. Please try again."
}
```

**Unknown Error**

```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again."
}
```

##### 502 Bad Gateway

**RPC Error**

```json
{
  "success": false,
  "message": "Blockchain error: Insufficient funds in faucet"
}
```

**Invalid Response**

```json
{
  "success": false,
  "message": "Received invalid response from blockchain"
}
```

##### 503 Service Unavailable

**Database Unavailable**

```json
{
  "success": false,
  "message": "Database temporarily unavailable"
}
```

**Network Error**

```json
{
  "success": false,
  "message": "Unable to connect to blockchain. Please try again later."
}
```

##### 504 Gateway Timeout

**RPC Timeout**

```json
{
  "success": false,
  "message": "Request to blockchain timed out. Please try again."
}
```

**Timeout Details**:
- Default timeout: 30 seconds
- Configurable via `FAUCET_RPC_TIMEOUT_MS` environment variable

## CORS Configuration

### Allowed Origins

The API supports CORS for the following origins:
- `http://localhost:3000`
- `http://localhost:3001`
- `https://kortana.xyz`
- `https://www.kortana.xyz`

### Preflight Requests

The API handles OPTIONS requests for CORS preflight:

```
OPTIONS /api/faucet/request
```

**Response Headers**:
- `Access-Control-Allow-Origin`: Requesting origin (if allowed)
- `Access-Control-Allow-Methods`: `POST, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type`
- `Access-Control-Max-Age`: `86400` (24 hours)

## Rate Limiting

### Per-Address Rate Limiting

- **Limit**: 1 request per 24 hours per wallet address
- **Tracking**: Based on normalized (lowercase) wallet address
- **Storage**: MongoDB with indexed queries
- **Reset**: 24 hours after last successful request

### Rate Limit Headers

When rate limited, the response includes:
- **Status Code**: `429 Too Many Requests`
- **Header**: `Retry-After: <seconds>`
- **Message**: Includes human-readable time remaining

### Rate Limit Bypass

There is no rate limit bypass mechanism. All addresses are subject to the same limits.

## Request Flow

### Successful Request Flow

1. Client sends POST request with address and network
2. API validates request format and payload size
3. API validates address format (server-side)
4. API normalizes address to lowercase
5. API checks MongoDB for recent requests (rate limit)
6. API creates pending request record in database
7. API constructs JSON-RPC request
8. API sends request to blockchain RPC endpoint
9. API receives and validates RPC response
10. API updates request record status (completed/failed)
11. API returns success response with transaction hash
12. Client displays success message and transaction link

### Failed Request Flow

1. Client sends POST request
2. API validates request
3. **Validation fails** → Return 400 error
4. **Rate limit check fails** → Return 429 error
5. **Database connection fails** → Return 503 error
6. **RPC call fails** → Return 502/503/504 error
7. Client displays error message

## JSON-RPC Integration

### RPC Request Format

The API constructs JSON-RPC 2.0 compliant requests:

```json
{
  "jsonrpc": "2.0",
  "id": 1234567890,
  "method": "eth_requestDNR",
  "params": [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "500"
  ]
}
```

### RPC Response Format

Expected response from blockchain:

**Success**:
```json
{
  "jsonrpc": "2.0",
  "id": 1234567890,
  "result": "0xabc123def456789..."
}
```

**Error**:
```json
{
  "jsonrpc": "2.0",
  "id": 1234567890,
  "error": {
    "code": -32000,
    "message": "Insufficient funds"
  }
}
```

### RPC Endpoints

**Testnet**:
- URL: `https://poseidon-rpc.testnet.kortana.xyz/`
- Chain ID: 72511 (0x11B3F)
- Protocol: HTTPS

**Devnet**:
- URL: `http://localhost:8545` (default)
- Chain ID: 9001 (0x2329)
- Protocol: HTTP (local only)

## Database Schema

### Collection: `faucet_requests`

```typescript
{
  _id: ObjectId,              // MongoDB document ID
  address: string,            // Normalized wallet address (lowercase)
  network: string,            // 'testnet' or 'devnet'
  amount: number,             // Amount requested (500)
  symbol: string,             // Token symbol ('DNR')
  status: string,             // 'pending' | 'completed' | 'failed'
  txHash?: string,            // Transaction hash (if available)
  errorMessage?: string,      // Error details (if failed)
  createdAt: Date,            // Request timestamp
  updatedAt: Date             // Last update timestamp
}
```

### Indexes

1. **Rate Limit Index**: `{ address: 1, createdAt: -1 }`
2. **Monitoring Index**: `{ createdAt: -1 }`
3. **Status Index**: `{ status: 1, createdAt: -1 }`

## Security

### Input Validation

- All inputs sanitized before processing
- Address format strictly validated
- Network selection restricted to allowed values
- Request payload size limited to 10KB

### Error Message Sanitization

- Internal error details never exposed
- File paths removed from error messages
- Stack traces removed
- MongoDB ObjectIds masked
- IP addresses masked

### Request Security

- HTTPS required for production
- CORS protection with allowed origins
- No automatic retries (prevents duplicate distributions)
- Timeout protection (30 seconds)
- Response structure validation

### Database Security

- Parameterized queries (no injection risk)
- Connection pooling with limits
- Query timeouts implemented
- Indexes for efficient queries

## Examples

### cURL Examples

#### Successful Request

```bash
curl -X POST https://kortana.xyz/api/faucet/request \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "network": "testnet"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "500 DNR tokens have been sent to your wallet!",
  "requestId": "507f1f77bcf86cd799439011",
  "txHash": "0xabc123def456789..."
}
```

#### Invalid Address

```bash
curl -X POST https://kortana.xyz/api/faucet/request \
  -H "Content-Type: application/json" \
  -d '{
    "address": "invalid-address",
    "network": "testnet"
  }'
```

**Response** (400):
```json
{
  "success": false,
  "message": "Invalid wallet address format. Must be 0x followed by 40 hexadecimal characters."
}
```

#### Rate Limited

```bash
curl -X POST https://kortana.xyz/api/faucet/request \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "network": "testnet"
  }'
```

**Response** (429):
```json
{
  "success": false,
  "message": "Rate limit exceeded. You can request tokens again in 23h 45m."
}
```

**Headers**:
```
Retry-After: 85500
```

### JavaScript/TypeScript Examples

#### Using Fetch API

```typescript
async function requestFaucetTokens(address: string, network: 'testnet' | 'devnet') {
  try {
    const response = await fetch('/api/faucet/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, network }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('Success!', data.message);
      console.log('Transaction Hash:', data.txHash);
      return data;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}

// Usage
requestFaucetTokens('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'testnet')
  .then(result => console.log('Tokens requested successfully'))
  .catch(error => console.error('Failed to request tokens'));
```

#### Using Axios

```typescript
import axios from 'axios';

async function requestFaucetTokens(address: string, network: 'testnet' | 'devnet') {
  try {
    const response = await axios.post('/api/faucet/request', {
      address,
      network,
    });

    console.log('Success!', response.data.message);
    console.log('Transaction Hash:', response.data.txHash);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error:', error.response.data.message);
      
      // Handle rate limiting
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        console.log(`Retry after ${retryAfter} seconds`);
      }
    }
    throw error;
  }
}
```

#### With Error Handling

```typescript
interface FaucetResponse {
  success: boolean;
  message: string;
  requestId?: string;
  txHash?: string;
}

async function requestTokensWithErrorHandling(
  address: string,
  network: 'testnet' | 'devnet'
): Promise<FaucetResponse> {
  const response = await fetch('/api/faucet/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, network }),
  });

  const data: FaucetResponse = await response.json();

  // Handle different status codes
  switch (response.status) {
    case 200:
      return data;
    
    case 400:
      throw new Error(`Validation error: ${data.message}`);
    
    case 429:
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
    
    case 502:
      throw new Error(`Blockchain error: ${data.message}`);
    
    case 503:
      throw new Error(`Service unavailable: ${data.message}`);
    
    case 504:
      throw new Error(`Request timeout: ${data.message}`);
    
    default:
      throw new Error(`Unexpected error: ${data.message}`);
  }
}
```

## Testing

### Test Addresses

For testing purposes, you can use any valid EVM address format:

```
Valid: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Valid: 0x0000000000000000000000000000000000000000
Valid: 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF

Invalid: 742d35Cc6634C0532925a3b844Bc9e7595f0bEb (missing 0x)
Invalid: 0x742d35Cc (too short)
Invalid: 0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG (invalid hex)
```

### Test Networks

- **Testnet**: Use for public testing with real blockchain
- **Devnet**: Use for local development with local node

## Monitoring

### Metrics to Track

1. **Request Volume**: Total requests per hour/day
2. **Success Rate**: Percentage of successful requests
3. **Error Distribution**: Breakdown by error type
4. **Response Time**: Average API response time
5. **RPC Performance**: Blockchain response times
6. **Rate Limit Hits**: Number of rate-limited requests

### Logging

All requests are logged with structured data:

```json
{
  "level": "info",
  "message": "Processing faucet request",
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "network": "testnet",
  "timestamp": "2026-02-26T12:00:00.000Z"
}
```

## Changelog

### Version 1.0.0
- Initial API release
- POST /api/faucet/request endpoint
- Rate limiting per address
- Multi-network support
- Transaction hash tracking
- Comprehensive error handling

---

**API Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintained By**: Kortana Development Team
