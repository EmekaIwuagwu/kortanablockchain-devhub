# Faucet Testing Guide

## Overview

This guide provides comprehensive testing procedures for the Kortana Faucet system, including manual testing, integration testing, and validation of all components.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Manual Testing](#manual-testing)
3. [Integration Testing](#integration-testing)
4. [Component Testing](#component-testing)
5. [Error Scenario Testing](#error-scenario-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)

## Prerequisites

### Required Setup

1. **Development Environment**:
   ```bash
   cd kortana-web
   npm install
   ```

2. **Environment Variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **MongoDB** (for full integration testing):
   ```bash
   # Start MongoDB locally
   mongod --dbpath /path/to/data
   
   # Or use MongoDB Atlas (hosted)
   ```

4. **Test Wallet**:
   - Have a testnet wallet address ready
   - Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### Optional Setup

1. **Integration Test Script**:
   ```bash
   npm run test:faucet
   ```

2. **Full RPC Testing**:
   ```bash
   npm run test:faucet:full
   ```

## Manual Testing

### Test 1: Happy Path - Successful Token Request

**Objective**: Verify complete flow from request to token receipt

**Steps**:
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/faucets

3. Select network: **Testnet**

4. Enter a valid wallet address:
   ```
   0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
   ```

5. Click "Airdrop 500 DNR"

**Expected Results**:
- ✓ Loading spinner appears
- ✓ Success message displays: "500 DNR tokens have been sent to your wallet!"
- ✓ Transaction hash is shown
- ✓ Explorer link is clickable
- ✓ Network is displayed correctly (Testnet)
- ✓ Button changes to "Sent Successfully"
- ✓ "Request More Tokens" button appears

**Verification**:
1. Click the explorer link
2. Verify transaction exists on blockchain
3. Check wallet balance increased by 500 DNR

---

### Test 2: Client-Side Validation

**Objective**: Verify client-side validation catches invalid inputs

**Test Cases**:

#### 2.1: Empty Address
**Steps**:
1. Leave address field empty
2. Click "Airdrop 500 DNR"

**Expected**: Error message "Wallet address is required"

#### 2.2: Invalid Format - Missing 0x
**Steps**:
1. Enter: `742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
2. Click "Airdrop 500 DNR"

**Expected**: Error message "Invalid wallet address format..."

#### 2.3: Invalid Format - Too Short
**Steps**:
1. Enter: `0x742d35Cc`
2. Click "Airdrop 500 DNR"

**Expected**: Error message "Invalid wallet address format..."

#### 2.4: Invalid Format - Non-Hex Characters
**Steps**:
1. Enter: `0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG`
2. Click "Airdrop 500 DNR"

**Expected**: Error message "Invalid wallet address format..."

#### 2.5: Valid Format - Mixed Case
**Steps**:
1. Enter: `0xAbCdEf1234567890AbCdEf1234567890AbCdEf12`
2. Click "Airdrop 500 DNR"

**Expected**: Request proceeds (case-insensitive)

---

### Test 3: Rate Limiting

**Objective**: Verify rate limiting prevents abuse

**Steps**:
1. Request tokens with address A (should succeed)
2. Wait for success confirmation
3. Immediately request tokens with same address A

**Expected Results**:
- ✓ Second request fails with HTTP 429
- ✓ Error message shows: "Rate limit exceeded. You can request tokens again in Xh Ym."
- ✓ Time remaining is accurate
- ✓ Response includes `Retry-After` header

**Verification**:
1. Check MongoDB for request record:
   ```javascript
   db.faucet_requests.find({ address: "0x..." }).sort({ createdAt: -1 })
   ```

2. Verify `createdAt` timestamp is recent

3. Try with different address (should succeed)

---

### Test 4: Network Switching

**Objective**: Verify network selection works correctly

**Steps**:
1. Select **Testnet**
2. Enter valid address
3. Note the network indicator (cyan color)
4. Switch to **Devnet**
5. Note the network indicator changes (purple color)
6. Submit request

**Expected Results**:
- ✓ Network indicator updates visually
- ✓ Form state resets when switching
- ✓ Previous errors clear
- ✓ Correct RPC endpoint is used
- ✓ Success message shows correct network
- ✓ Explorer link uses correct network

---

### Test 5: Error Handling

**Objective**: Verify all error scenarios display appropriate messages

#### 5.1: RPC Timeout
**Setup**: Configure very short timeout or disconnect network

**Expected**: "Request to blockchain timed out. Please try again."

#### 5.2: RPC Error
**Setup**: Use address that triggers RPC error (if possible)

**Expected**: "Blockchain error: [specific error message]"

#### 5.3: Database Error
**Setup**: Stop MongoDB

**Expected**: "Database temporarily unavailable"

#### 5.4: Network Error
**Setup**: Disconnect internet

**Expected**: "Unable to connect to blockchain. Please try again later."

---

## Integration Testing

### Automated Integration Tests

Run the integration test suite:

```bash
# Basic tests (no RPC calls)
npm run test:faucet

# Full tests (includes RPC calls)
npm run test:faucet:full
```

### Test Coverage

The integration test script validates:

1. **Address Validation**:
   - Valid addresses accepted
   - Invalid addresses rejected
   - Address normalization
   - Input sanitization

2. **RPC Service**:
   - Endpoint selection
   - Request construction
   - Response parsing
   - Error handling

3. **Database Connection**:
   - MongoDB connectivity
   - Collection existence
   - Index verification
   - Query performance

4. **Error Scenarios**:
   - Invalid address handling
   - Empty input handling
   - Network errors

5. **RPC Endpoint** (with --test-rpc flag):
   - Live endpoint connectivity
   - Response time
   - Error responses

### Manual Integration Test

**Complete Flow Test**:

1. **Setup**:
   ```bash
   # Terminal 1: Start MongoDB
   mongod --dbpath ./data
   
   # Terminal 2: Start application
   npm run dev
   ```

2. **Test Sequence**:
   ```bash
   # Test 1: First request (should succeed)
   curl -X POST http://localhost:3000/api/faucet/request \
     -H "Content-Type: application/json" \
     -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","network":"testnet"}'
   
   # Test 2: Immediate second request (should fail - rate limited)
   curl -X POST http://localhost:3000/api/faucet/request \
     -H "Content-Type: application/json" \
     -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","network":"testnet"}'
   
   # Test 3: Different address (should succeed)
   curl -X POST http://localhost:3000/api/faucet/request \
     -H "Content-Type: application/json" \
     -d '{"address":"0x0000000000000000000000000000000000000000","network":"testnet"}'
   
   # Test 4: Invalid address (should fail - validation)
   curl -X POST http://localhost:3000/api/faucet/request \
     -H "Content-Type: application/json" \
     -d '{"address":"invalid","network":"testnet"}'
   ```

3. **Verify Database**:
   ```bash
   mongosh
   use kortana_presale
   db.faucet_requests.find().sort({createdAt:-1}).limit(5).pretty()
   ```

---

## Component Testing

### Validation Module (`lib/validation.ts`)

**Test Cases**:

```typescript
// Test 1: Valid addresses
isValidEVMAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb') // true
isValidEVMAddress('0x0000000000000000000000000000000000000000') // true
isValidEVMAddress('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') // true

// Test 2: Invalid addresses
isValidEVMAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEb') // false (no 0x)
isValidEVMAddress('0x742d35Cc') // false (too short)
isValidEVMAddress('0xGGGG...') // false (invalid hex)
isValidEVMAddress('') // false (empty)

// Test 3: Normalization
normalizeAddress('0xABCDEF...') // '0xabcdef...' (lowercase)

// Test 4: Sanitization
sanitizeInput('  0x742d35Cc...  ') // '0x742d35Cc...' (trimmed)
```

### RPC Service Module (`lib/faucetRpc.ts`)

**Test Cases**:

```typescript
// Test 1: Endpoint selection
getRPCEndpoint('testnet') // 'https://poseidon-rpc.testnet.kortana.xyz/'
getRPCEndpoint('devnet') // 'http://localhost:8545'

// Test 2: Request construction
const req = buildRPCRequest('0x...', '500')
// req.jsonrpc === '2.0'
// req.method === 'eth_requestDNR'
// req.params === ['0x...', '500']

// Test 3: Response parsing
parseRPCResponse({ jsonrpc: '2.0', id: 1, result: true })
// { success: true, result: true }

parseRPCResponse({ jsonrpc: '2.0', id: 1, error: { code: -32000, message: 'Error' } })
// { success: false, error: 'Error' }
```

### Error Handler Module (`lib/errorHandler.ts`)

**Test Cases**:

```typescript
// Test 1: Validation errors
createValidationError('Invalid address', {})
// { success: false, statusCode: 400, message: 'Invalid address' }

// Test 2: Rate limit errors
createRateLimitError(23, 45, 85500, {})
// { success: false, statusCode: 429, retryAfter: 85500 }

// Test 3: RPC errors
createRPCError('Insufficient funds', {})
// { success: false, statusCode: 502, message: 'Blockchain error: Insufficient funds' }

// Test 4: Timeout errors
createTimeoutError({})
// { success: false, statusCode: 504, message: 'Request to blockchain timed out...' }
```

---

## Error Scenario Testing

### Scenario 1: Database Unavailable

**Setup**:
```bash
# Stop MongoDB
sudo systemctl stop mongod
```

**Test**:
```bash
curl -X POST http://localhost:3000/api/faucet/request \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","network":"testnet"}'
```

**Expected**:
- HTTP 503
- Message: "Database temporarily unavailable"

---

### Scenario 2: RPC Endpoint Down

**Setup**:
```env
# In .env.local, use invalid endpoint
NEXT_PUBLIC_TESTNET_RPC_URL=https://invalid-endpoint.example.com/
```

**Test**: Request tokens via UI

**Expected**:
- HTTP 503
- Message: "Unable to connect to blockchain..."

---

### Scenario 3: RPC Timeout

**Setup**:
```env
# In .env.local, set very short timeout
FAUCET_RPC_TIMEOUT_MS=100
```

**Test**: Request tokens via UI

**Expected**:
- HTTP 504
- Message: "Request to blockchain timed out..."

---

### Scenario 4: Malformed Request

**Test**:
```bash
# Invalid JSON
curl -X POST http://localhost:3000/api/faucet/request \
  -H "Content-Type: application/json" \
  -d 'invalid json'

# Missing fields
curl -X POST http://localhost:3000/api/faucet/request \
  -H "Content-Type: application/json" \
  -d '{}'

# Wrong network
curl -X POST http://localhost:3000/api/faucet/request \
  -H "Content-Type: application/json" \
  -d '{"address":"0x...","network":"invalid"}'
```

**Expected**: HTTP 400 with appropriate error messages

---

## Performance Testing

### Response Time Test

**Objective**: Verify API responds within acceptable time

**Test**:
```bash
# Measure response time
time curl -X POST http://localhost:3000/api/faucet/request \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","network":"testnet"}'
```

**Targets**:
- Validation errors: < 100ms
- Rate limit checks: < 500ms
- Successful requests: < 5 seconds (depends on RPC)
- RPC timeout: 30 seconds max

---

### Database Query Performance

**Test**:
```javascript
// In MongoDB shell
use kortana_presale

// Test rate limit query
db.faucet_requests.find({
  address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  createdAt: { $gt: new Date(Date.now() - 24*60*60*1000) }
}).explain("executionStats")
```

**Targets**:
- Query execution time: < 10ms
- Documents examined: Should use index (low number)
- Index used: Should show `address_1_createdAt_-1`

---

### Load Testing

**Objective**: Test system under concurrent requests

**Test**:
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 -p request.json -T application/json \
  http://localhost:3000/api/faucet/request
```

**Targets**:
- No crashes or errors
- Consistent response times
- Rate limiting works correctly
- Database handles concurrent queries

---

## Security Testing

### Input Validation Security

**Test Cases**:

1. **SQL Injection Attempt**:
   ```json
   {"address":"0x' OR '1'='1","network":"testnet"}
   ```
   Expected: Validation error

2. **XSS Attempt**:
   ```json
   {"address":"<script>alert('xss')</script>","network":"testnet"}
   ```
   Expected: Validation error

3. **Path Traversal**:
   ```json
   {"address":"../../etc/passwd","network":"testnet"}
   ```
   Expected: Validation error

4. **Oversized Payload**:
   ```bash
   # Create 20KB payload
   curl -X POST http://localhost:3000/api/faucet/request \
     -H "Content-Type: application/json" \
     -d '{"address":"0x...","network":"testnet","extra":"'$(python -c 'print("A"*20000)')'"}'
   ```
   Expected: HTTP 400 "Request payload too large"

---

### CORS Testing

**Test**:
```bash
# From unauthorized origin
curl -X POST http://localhost:3000/api/faucet/request \
  -H "Content-Type: application/json" \
  -H "Origin: https://malicious-site.com" \
  -d '{"address":"0x...","network":"testnet"}'
```

**Expected**: No `Access-Control-Allow-Origin` header in response

---

### Rate Limit Bypass Attempts

**Test Cases**:

1. **Different Case Address**:
   ```bash
   # Request 1
   curl -X POST ... -d '{"address":"0xABC...","network":"testnet"}'
   # Request 2
   curl -X POST ... -d '{"address":"0xabc...","network":"testnet"}'
   ```
   Expected: Second request rate limited (case-insensitive)

2. **Extra Spaces**:
   ```bash
   curl -X POST ... -d '{"address":" 0xABC... ","network":"testnet"}'
   ```
   Expected: Sanitized and rate limited

---

## Test Checklist

Use this checklist for comprehensive testing:

### Functional Tests
- [ ] Valid address accepts tokens
- [ ] Invalid address rejected (client-side)
- [ ] Invalid address rejected (server-side)
- [ ] Rate limiting works (24 hours)
- [ ] Network switching works
- [ ] Transaction hash displayed
- [ ] Explorer link works
- [ ] Success message correct
- [ ] Error messages clear

### Validation Tests
- [ ] Empty address rejected
- [ ] Missing 0x prefix rejected
- [ ] Wrong length rejected
- [ ] Non-hex characters rejected
- [ ] Case-insensitive validation
- [ ] Whitespace trimmed

### Error Handling Tests
- [ ] Database error handled
- [ ] RPC timeout handled
- [ ] RPC error handled
- [ ] Network error handled
- [ ] Invalid JSON handled
- [ ] Missing fields handled

### Performance Tests
- [ ] Response time acceptable
- [ ] Database queries fast
- [ ] Indexes working
- [ ] No memory leaks
- [ ] Handles concurrent requests

### Security Tests
- [ ] Input sanitization works
- [ ] CORS protection works
- [ ] Rate limit can't be bypassed
- [ ] Error messages sanitized
- [ ] No sensitive data exposed

---

## Reporting Issues

When reporting test failures, include:

1. **Test Case**: Which test failed
2. **Expected Result**: What should happen
3. **Actual Result**: What actually happened
4. **Steps to Reproduce**: Exact steps
5. **Environment**: OS, Node version, browser
6. **Logs**: Relevant error messages
7. **Screenshots**: If UI-related

---

**Last Updated**: February 2026  
**Maintained By**: Kortana Development Team
