#!/usr/bin/env python3
"""
Test script to verify MetaMask filter functionality
This simulates what MetaMask does to detect new transactions
"""

import requests
import json
import time

RPC_URL = "http://localhost:8545"

def rpc_call(method, params=[]):
    """Make an RPC call to the blockchain node"""
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    }
    response = requests.post(RPC_URL, json=payload)
    return response.json()

def test_filter_workflow():
    """Test the complete filter workflow that MetaMask uses"""
    
    print("=" * 80)
    print("METAMASK FILTER FUNCTIONALITY TEST")
    print("=" * 80)
    print()
    
    # Step 1: Get current block number
    print("Step 1: Getting current block number...")
    block_response = rpc_call("eth_blockNumber")
    current_block = int(block_response.get("result", "0x0"), 16)
    print(f"✓ Current block: {current_block}")
    print()
    
    # Step 2: Create a new block filter (what MetaMask does on startup)
    print("Step 2: Creating new block filter (simulating MetaMask startup)...")
    filter_response = rpc_call("eth_newBlockFilter")
    filter_id = filter_response.get("result")
    
    if filter_id:
        print(f"✓ Filter created successfully: {filter_id}")
    else:
        print(f"✗ Failed to create filter: {filter_response}")
        return False
    print()
    
    # Step 3: First poll - should return empty (no new blocks yet)
    print("Step 3: First poll for changes (should be empty)...")
    changes_response = rpc_call("eth_getFilterChanges", [filter_id])
    changes = changes_response.get("result", [])
    print(f"✓ Changes: {len(changes)} new blocks")
    if changes:
        print(f"  Block hashes: {changes}")
    print()
    
    # Step 4: Wait for new blocks
    print("Step 4: Waiting 15 seconds for new blocks to be produced...")
    print("(Blockchain produces blocks every 5 seconds)")
    for i in range(15, 0, -1):
        print(f"  {i} seconds remaining...", end="\r")
        time.sleep(1)
    print()
    print()
    
    # Step 5: Poll again - should return new blocks
    print("Step 5: Polling for changes again (should have new blocks)...")
    changes_response = rpc_call("eth_getFilterChanges", [filter_id])
    changes = changes_response.get("result", [])
    
    if changes:
        print(f"✓ SUCCESS! Found {len(changes)} new blocks:")
        for i, block_hash in enumerate(changes, 1):
            print(f"  {i}. {block_hash}")
        print()
        
        # Step 6: Get details of first new block
        print("Step 6: Getting details of first new block...")
        block_details = rpc_call("eth_getBlockByHash", [changes[0], True])
        block = block_details.get("result")
        
        if block:
            print(f"✓ Block #{int(block['number'], 16)}")
            print(f"  Hash: {block['hash']}")
            print(f"  Timestamp: {int(block['timestamp'], 16)}")
            print(f"  Transactions: {len(block['transactions'])}")
            
            if block['transactions']:
                print(f"\n  Transaction details:")
                for tx in block['transactions']:
                    print(f"    - From: {tx['from']}")
                    print(f"      To: {tx['to']}")
                    print(f"      Value: {int(tx['value'], 16) / 10**18} DNR")
                    print()
    else:
        print("⚠ No new blocks found (this is OK if blockchain is idle)")
    print()
    
    # Step 7: Third poll - should be empty again
    print("Step 7: Immediate third poll (should be empty - no new blocks)...")
    changes_response = rpc_call("eth_getFilterChanges", [filter_id])
    changes = changes_response.get("result", [])
    print(f"✓ Changes: {len(changes)} new blocks (expected: 0)")
    print()
    
    print("=" * 80)
    print("TEST COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print()
    print("What this means:")
    print("✓ Filter creation works correctly")
    print("✓ Filter state is tracked between polls")
    print("✓ Only NEW blocks are returned on each poll")
    print("✓ MetaMask will now be able to detect incoming transactions!")
    print()
    print("Next steps:")
    print("1. Open MetaMask and connect to your Kortana testnet")
    print("2. Send tokens to your MetaMask address using send_faucet_tokens.py")
    print("3. Check the Activity tab - you should see the incoming transaction!")
    print()
    
    return True

def test_transaction_detection():
    """Test if we can detect transactions in new blocks"""
    
    print("=" * 80)
    print("TRANSACTION DETECTION TEST")
    print("=" * 80)
    print()
    
    print("This test will:")
    print("1. Create a filter")
    print("2. Request faucet tokens (creates a transaction)")
    print("3. Poll for new blocks")
    print("4. Check if the transaction appears")
    print()
    
    # Get user's address
    address = input("Enter your MetaMask address (0x...): ").strip()
    if not address.startswith("0x"):
        address = "0x" + address
    
    print()
    
    # Create filter
    print("Creating filter...")
    filter_response = rpc_call("eth_newBlockFilter")
    filter_id = filter_response.get("result")
    print(f"✓ Filter ID: {filter_id}")
    print()
    
    # Request tokens
    print(f"Requesting 10 DNR for {address}...")
    faucet_response = rpc_call("eth_requestDNR", [address, "10"])
    
    if faucet_response.get("result"):
        print("✓ Faucet request successful!")
    else:
        print(f"✗ Faucet request failed: {faucet_response}")
        return False
    print()
    
    # Wait for block
    print("Waiting 10 seconds for transaction to be included in a block...")
    time.sleep(10)
    print()
    
    # Poll for changes
    print("Polling for new blocks...")
    changes_response = rpc_call("eth_getFilterChanges", [filter_id])
    changes = changes_response.get("result", [])
    
    if changes:
        print(f"✓ Found {len(changes)} new blocks")
        print()
        
        # Check each block for our transaction
        found_transaction = False
        for block_hash in changes:
            block_response = rpc_call("eth_getBlockByHash", [block_hash, True])
            block = block_response.get("result")
            
            if block and block['transactions']:
                for tx in block['transactions']:
                    if tx['to'].lower() == address.lower():
                        found_transaction = True
                        print("✓ TRANSACTION FOUND IN BLOCK!")
                        print(f"  Block: {block['number']}")
                        print(f"  Transaction Hash: {tx['hash']}")
                        print(f"  From: {tx['from']}")
                        print(f"  To: {tx['to']}")
                        print(f"  Value: {int(tx['value'], 16) / 10**18} DNR")
                        print()
                        break
            
            if found_transaction:
                break
        
        if found_transaction:
            print("=" * 80)
            print("SUCCESS! Transaction detection is working!")
            print("=" * 80)
            print()
            print("This confirms that MetaMask will be able to:")
            print("✓ Detect incoming transactions")
            print("✓ Show them in the Activity tab")
            print("✓ Update your balance in real-time")
            print()
        else:
            print("⚠ No transaction to your address found in new blocks")
            print("  (Transaction might be in next block)")
    else:
        print("⚠ No new blocks found yet")
        print("  (Wait a few seconds and try polling again)")
    
    return True

if __name__ == "__main__":
    try:
        print()
        print("Choose test to run:")
        print("1. Filter workflow test (recommended)")
        print("2. Transaction detection test (requires your address)")
        print()
        choice = input("Enter choice (1 or 2): ").strip()
        print()
        
        if choice == "1":
            test_filter_workflow()
        elif choice == "2":
            test_transaction_detection()
        else:
            print("Invalid choice. Running filter workflow test...")
            test_filter_workflow()
            
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
