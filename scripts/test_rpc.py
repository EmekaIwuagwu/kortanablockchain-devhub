#!/usr/bin/env python3
import requests
import json

# Test 1: Check RPC is alive
print("Test 1: Checking RPC endpoint...")
response = requests.post('http://127.0.0.1:8545', json={
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
})
print(f"  Status: {response.status_code}")
print(f"  Response: {response.json()}")

# Test 2: Check chain ID
print("\nTest 2: Checking chain ID...")
response = requests.post('http://127.0.0.1:8545', json={
    "jsonrpc": "2.0",
    "method": "eth_chainId",
    "params": [],
    "id": 2
})
print(f"  Status: {response.status_code}")
print(f"  Response: {response.json()}")

# Test 3: Send a simple raw transaction (just to see if method exists)
print("\nTest 3: Testing eth_sendRawTransaction with dummy data...")
response = requests.post('http://127.0.0.1:8545', json={
    "jsonrpc": "2.0",
    "method": "eth_sendRawTransaction",
    "params": ["0xDEADBEEF"],
    "id": 3
})
print(f"  Status: {response.status_code}")
print(f"  Response: {response.json()}")

print("\n✅ RPC tests complete")
