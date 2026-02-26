#!/usr/bin/env tsx
/**
 * Faucet Integration Test Script
 * 
 * This script tests the complete faucet flow including:
 * - Address validation
 * - Rate limiting
 * - RPC communication
 * - Database operations
 * - Error handling
 * 
 * Usage:
 *   npm run test:faucet
 *   or
 *   tsx scripts/test-faucet-integration.ts
 */

import { isValidEVMAddress, normalizeAddress, sanitizeInput } from '../lib/validation';
import { requestDNR, buildRPCRequest, parseRPCResponse, getRPCEndpoint } from '../lib/faucetRpc';
import clientPromise from '../lib/mongodb';

// Test configuration
const TEST_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const TEST_NETWORK = 'testnet';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name: string) {
  console.log(`\n${colors.cyan}▶ Testing: ${name}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`  ✗ ${message}`, 'red');
}

function logWarning(message: string) {
  log(`  ⚠ ${message}`, 'yellow');
}

function logInfo(message: string) {
  log(`  ℹ ${message}`, 'blue');
}

// Test counters
let passed = 0;
let failed = 0;
let warnings = 0;

async function testValidation() {
  logTest('Address Validation');

  // Test valid addresses
  const validAddresses = [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    '0x0000000000000000000000000000000000000000',
    '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    '0xabcdef1234567890abcdef1234567890abcdef12',
  ];

  for (const address of validAddresses) {
    if (isValidEVMAddress(address)) {
      logSuccess(`Valid address accepted: ${address}`);
      passed++;
    } else {
      logError(`Valid address rejected: ${address}`);
      failed++;
    }
  }

  // Test invalid addresses
  const invalidAddresses = [
    '742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // Missing 0x
    '0x742d35Cc', // Too short
    '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', // Invalid hex
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb123', // Too long
    '', // Empty
    '0x', // Just prefix
  ];

  for (const address of invalidAddresses) {
    if (!isValidEVMAddress(address)) {
      logSuccess(`Invalid address rejected: ${address || '(empty)'}`);
      passed++;
    } else {
      logError(`Invalid address accepted: ${address}`);
      failed++;
    }
  }

  // Test normalization
  const testAddr = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
  const normalized = normalizeAddress(testAddr);
  if (normalized === testAddr.toLowerCase()) {
    logSuccess(`Address normalized correctly: ${normalized}`);
    passed++;
  } else {
    logError(`Address normalization failed: ${normalized}`);
    failed++;
  }

  // Test sanitization
  const dirtyInput = '  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb  ';
  const sanitized = sanitizeInput(dirtyInput);
  if (sanitized === '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb') {
    logSuccess(`Input sanitized correctly`);
    passed++;
  } else {
    logError(`Input sanitization failed: ${sanitized}`);
    failed++;
  }
}

async function testRPCService() {
  logTest('RPC Service');

  // Test endpoint selection
  const testnetEndpoint = getRPCEndpoint('testnet');
  if (testnetEndpoint.includes('testnet.kortana.xyz')) {
    logSuccess(`Testnet endpoint correct: ${testnetEndpoint}`);
    passed++;
  } else {
    logError(`Testnet endpoint incorrect: ${testnetEndpoint}`);
    failed++;
  }

  const devnetEndpoint = getRPCEndpoint('devnet');
  if (devnetEndpoint.includes('localhost') || devnetEndpoint.includes('devnet')) {
    logSuccess(`Devnet endpoint correct: ${devnetEndpoint}`);
    passed++;
  } else {
    logError(`Devnet endpoint incorrect: ${devnetEndpoint}`);
    failed++;
  }

  // Test RPC request construction
  const rpcRequest = buildRPCRequest(TEST_ADDRESS, '500');
  
  if (rpcRequest.jsonrpc === '2.0') {
    logSuccess('RPC request has correct JSON-RPC version');
    passed++;
  } else {
    logError(`RPC request has wrong version: ${rpcRequest.jsonrpc}`);
    failed++;
  }

  if (rpcRequest.method === 'eth_requestDNR') {
    logSuccess('RPC request has correct method');
    passed++;
  } else {
    logError(`RPC request has wrong method: ${rpcRequest.method}`);
    failed++;
  }

  if (rpcRequest.params[0] === TEST_ADDRESS && rpcRequest.params[1] === '500') {
    logSuccess('RPC request has correct parameters');
    passed++;
  } else {
    logError(`RPC request has wrong parameters: ${JSON.stringify(rpcRequest.params)}`);
    failed++;
  }

  // Test RPC response parsing
  const successResponse = {
    jsonrpc: '2.0' as const,
    id: 1,
    result: '0xabc123',
  };

  const parsedSuccess = parseRPCResponse(successResponse);
  if (parsedSuccess.success && parsedSuccess.result === '0xabc123') {
    logSuccess('Success response parsed correctly');
    passed++;
  } else {
    logError('Success response parsing failed');
    failed++;
  }

  const errorResponse = {
    jsonrpc: '2.0' as const,
    id: 1,
    error: {
      code: -32000,
      message: 'Insufficient funds',
    },
  };

  const parsedError = parseRPCResponse(errorResponse);
  if (!parsedError.success && parsedError.error?.includes('Insufficient funds')) {
    logSuccess('Error response parsed correctly');
    passed++;
  } else {
    logError('Error response parsing failed');
    failed++;
  }
}

async function testDatabaseConnection() {
  logTest('Database Connection');

  try {
    const client = await clientPromise;
    logSuccess('Connected to MongoDB');
    passed++;

    const db = client.db('kortana_presale');
    const collections = await db.listCollections().toArray();
    
    const hasFaucetCollection = collections.some(c => c.name === 'faucet_requests');
    if (hasFaucetCollection) {
      logSuccess('Faucet requests collection exists');
      passed++;
    } else {
      logWarning('Faucet requests collection does not exist (will be created on first request)');
      warnings++;
    }

    // Check indexes
    const requests = db.collection('faucet_requests');
    const indexes = await requests.indexes();
    
    logInfo(`Found ${indexes.length} indexes`);
    
    const hasRateLimitIndex = indexes.some(idx => 
      idx.key.address && idx.key.createdAt
    );
    
    if (hasRateLimitIndex) {
      logSuccess('Rate limit index exists');
      passed++;
    } else {
      logWarning('Rate limit index missing (run: npm run db:create-indexes)');
      warnings++;
    }

    // Test query performance
    const startTime = Date.now();
    await requests.findOne({
      address: TEST_ADDRESS.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    const queryTime = Date.now() - startTime;
    
    if (queryTime < 100) {
      logSuccess(`Rate limit query fast: ${queryTime}ms`);
      passed++;
    } else if (queryTime < 500) {
      logWarning(`Rate limit query slow: ${queryTime}ms (consider adding indexes)`);
      warnings++;
    } else {
      logError(`Rate limit query very slow: ${queryTime}ms`);
      failed++;
    }

  } catch (error) {
    logError(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    failed++;
  }
}

async function testRPCEndpoint() {
  logTest('RPC Endpoint Connectivity');

  try {
    logInfo('Testing connection to testnet RPC endpoint...');
    logInfo('This may take up to 30 seconds...');

    const startTime = Date.now();
    const result = await requestDNR(TEST_ADDRESS, '500', 'testnet');
    const responseTime = Date.now() - startTime;

    if (result.success) {
      logSuccess(`RPC request successful in ${responseTime}ms`);
      logInfo(`Result: ${result.result}`);
      passed++;
    } else {
      // Some errors are expected (e.g., rate limiting, insufficient funds)
      if (result.error?.includes('Rate limit') || 
          result.error?.includes('Insufficient funds') ||
          result.error?.includes('already requested')) {
        logWarning(`RPC returned expected error: ${result.error}`);
        logSuccess('RPC endpoint is responding correctly');
        warnings++;
        passed++;
      } else {
        logError(`RPC request failed: ${result.error}`);
        failed++;
      }
    }

    if (responseTime < 5000) {
      logSuccess(`Response time good: ${responseTime}ms`);
      passed++;
    } else if (responseTime < 15000) {
      logWarning(`Response time slow: ${responseTime}ms`);
      warnings++;
    } else {
      logError(`Response time very slow: ${responseTime}ms`);
      failed++;
    }

  } catch (error) {
    logError(`RPC endpoint test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    failed++;
  }
}

async function testErrorScenarios() {
  logTest('Error Scenarios');

  // Test with invalid address (should fail validation before RPC call)
  try {
    const invalidResult = await requestDNR('invalid-address', '500', 'testnet');
    if (!invalidResult.success) {
      logSuccess('Invalid address handled correctly (validation should catch this)');
      passed++;
    } else {
      logWarning('Invalid address not caught (validation may need improvement)');
      warnings++;
    }
  } catch (error) {
    logSuccess('Invalid address threw error (acceptable)');
    passed++;
  }

  // Test with empty address
  try {
    const emptyResult = await requestDNR('', '500', 'testnet');
    if (!emptyResult.success) {
      logSuccess('Empty address handled correctly');
      passed++;
    } else {
      logError('Empty address not rejected');
      failed++;
    }
  } catch (error) {
    logSuccess('Empty address threw error (acceptable)');
    passed++;
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║     Kortana Faucet Integration Test Suite             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  try {
    await testValidation();
    await testRPCService();
    await testDatabaseConnection();
    await testErrorScenarios();
    
    // Only test RPC endpoint if explicitly requested (can be slow)
    if (process.argv.includes('--test-rpc')) {
      await testRPCEndpoint();
    } else {
      logInfo('\nSkipping RPC endpoint test (use --test-rpc to enable)');
    }

  } catch (error) {
    logError(`\nTest suite error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    failed++;
  }

  // Print summary
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    Test Summary                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n  Passed:   ${passed}`, 'green');
  if (warnings > 0) {
    log(`  Warnings: ${warnings}`, 'yellow');
  }
  if (failed > 0) {
    log(`  Failed:   ${failed}`, 'red');
  }

  const total = passed + failed;
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  
  log(`\n  Success Rate: ${percentage}%`, percentage >= 80 ? 'green' : 'yellow');

  if (failed === 0) {
    log('\n✓ All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n✗ Some tests failed. Please review the errors above.', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(`\nFatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exit(1);
});
