#!/usr/bin/env python3
"""
Comprehensive test of the production RPC endpoint to verify MetaMask filter fix
"""

import requests
import json
import time

RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/"
WALLET_ADDRESS = "0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9"

def rpc_call(method, params=[]):
    """Make an RPC call"""
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    }
    try:
        response = requests.post(RPC_URL, json=payload, timeout=10)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def test_basic_connectivity():
    """Test 1: Basic RPC connectivity"""
    print("\n" + "="*80)
    print("TEST 1: Basic RPC Connectivity")
    print("="*80)
    
    result = rpc_call("eth_blockNumber")
    if "result" in result:
        block_num = int(result["result"], 16)
        print(f"[PASS] Connected to RPC successfully")
        print(f"       Current block: {block_num}")
        return True, block_num
    else:
        print(f"[FAIL] Could not connect to RPC")
        print(f"       Error: {result}")
        return False, 0

def test_filter_creation():
    """Test 2: Filter creation (the fix!)"""
    print("\n" + "="*80)
    print("TEST 2: Block Filter Creation (MetaMask Fix)")
    print("="*80)
    
    # Create first filter
    result1 = rpc_call("eth_newBlockFilter")
    if "result" not in result1:
        print(f"[FAIL] Could not create filter")
        print(f"       Error: {result1}")
        return False
    
    filter_id_1 = result1["result"]
    print(f"[INFO] First filter created: {filter_id_1}")
    
    # Create second filter
    time.sleep(0.5)
    result2 = rpc_call("eth_newBlockFilter")
    if "result" not in result2:
        print(f"[FAIL] Could not create second filter")
        return False
    
    filter_id_2 = result2["result"]
    print(f"[INFO] Second filter created: {filter_id_2}")
    
    # Check if filters are unique
    if filter_id_1 == filter_id_2:
        print(f"[FAIL] Filter IDs are identical: {filter_id_1}")
        print(f"       This means the OLD BROKEN code is still running!")
        print(f"       Expected: Unique IDs for each filter")
        return False
    elif filter_id_1 == "0x1" or filter_id_2 == "0x1":
        print(f"[FAIL] Filter ID is always '0x1'")
        print(f"       This means the OLD BROKEN code is still running!")
        return False
    else:
        print(f"[PASS] Filter IDs are unique!")
        print(f"       This means the FIX IS DEPLOYED!")
        return True

def test_filter_polling(filter_id, initial_block):
    """Test 3: Filter polling for new blocks"""
    print("\n" + "="*80)
    print("TEST 3: Filter Polling (Detecting New Blocks)")
    print("="*80)
    
    # First poll - should be empty
    result1 = rpc_call("eth_getFilterChanges", [filter_id])
    if "result" not in result1:
        print(f"[FAIL] Could not poll filter")
        print(f"       Error: {result1}")
        return False
    
    changes1 = result1["result"]
    print(f"[INFO] First poll: {len(changes1)} blocks")
    
    # Wait for new blocks
    print(f"[INFO] Waiting 15 seconds for new blocks...")
    for i in range(15, 0, -1):
        print(f"       {i} seconds remaining...", end="\r")
        time.sleep(1)
    print()
    
    # Second poll - should have new blocks
    result2 = rpc_call("eth_getFilterChanges", [filter_id])
    if "result" not in result2:
        print(f"[FAIL] Could not poll filter second time")
        return False
    
    changes2 = result2["result"]
    print(f"[INFO] Second poll: {len(changes2)} new blocks")
    
    if len(changes2) > 0:
        print(f"[PASS] Filter detected {len(changes2)} new blocks!")
        print(f"       Block hashes:")
        for i, block_hash in enumerate(changes2, 1):
            print(f"       {i}. {block_hash}")
        return True
    else:
        print(f"[WARN] No new blocks detected")
        print(f"       This could mean blocks aren't being produced")
        return False

def test_wallet_balance():
    """Test 4: Check wallet balance"""
    print("\n" + "="*80)
    print("TEST 4: Wallet Balance Check")
    print("="*80)
    
    result = rpc_call("eth_getBalance", [WALLET_ADDRESS, "latest"])
    if "result" in result:
        balance_wei = int(result["result"], 16)
        balance_dnr = balance_wei / 10**18
        print(f"[PASS] Wallet: {WALLET_ADDRESS}")
        print(f"       Balance: {balance_dnr} DNR")
        return True, balance_dnr
    else:
        print(f"[FAIL] Could not get balance")
        print(f"       Error: {result}")
        return False, 0

def test_send_tokens():
    """Test 5: Send test tokens"""
    print("\n" + "="*80)
    print("TEST 5: Send Test Tokens")
    print("="*80)
    
    result = rpc_call("eth_requestDNR", [WALLET_ADDRESS, "50"])
    if "result" in result and result["result"]:
        print(f"[PASS] Sent 50 DNR to {WALLET_ADDRESS}")
        print(f"       Transaction should appear in MetaMask Activity tab!")
        return True
    else:
        print(f"[FAIL] Could not send tokens")
        print(f"       Error: {result}")
        return False

def test_transaction_history():
    """Test 6: Check transaction history"""
    print("\n" + "="*80)
    print("TEST 6: Transaction History")
    print("="*80)
    
    result = rpc_call("eth_getAddressHistory", [WALLET_ADDRESS])
    if "result" in result:
        txs = result["result"]
        print(f"[INFO] Found {len(txs)} transactions in history")
        
        if len(txs) > 0:
            print(f"[PASS] Transaction history available")
            print(f"\n       Recent transactions:")
            for i, tx in enumerate(txs[:5], 1):  # Show first 5
                tx_hash = tx.get("hash", "N/A")
                tx_from = tx.get("from", "N/A")
                tx_to = tx.get("to", "N/A")
                tx_value = int(tx.get("value", "0x0"), 16) / 10**18
                print(f"       {i}. Hash: {tx_hash[:20]}...")
                print(f"          From: {tx_from}")
                print(f"          To: {tx_to}")
                print(f"          Value: {tx_value} DNR")
                print()
            return True
        else:
            print(f"[WARN] No transactions found")
            return False
    else:
        print(f"[FAIL] Could not get transaction history")
        print(f"       Error: {result}")
        return False

def main():
    print("\n" + "="*80)
    print("KORTANA PRODUCTION RPC - COMPREHENSIVE TEST SUITE")
    print("="*80)
    print(f"\nRPC Endpoint: {RPC_URL}")
    print(f"Wallet Address: {WALLET_ADDRESS}")
    print(f"Testing MetaMask Filter Fix...")
    
    results = {}
    
    # Test 1: Basic connectivity
    success, current_block = test_basic_connectivity()
    results["connectivity"] = success
    if not success:
        print("\n[ABORT] Cannot proceed without RPC connectivity")
        return
    
    # Test 2: Filter creation (THE CRITICAL TEST!)
    success = test_filter_creation()
    results["filter_creation"] = success
    
    if success:
        print("\n" + "="*80)
        print("[CRITICAL SUCCESS] The MetaMask fix IS DEPLOYED!")
        print("="*80)
        
        # Test 3: Create a filter and test polling
        filter_result = rpc_call("eth_newBlockFilter")
        if "result" in filter_result:
            filter_id = filter_result["result"]
            success = test_filter_polling(filter_id, current_block)
            results["filter_polling"] = success
    else:
        print("\n" + "="*80)
        print("[CRITICAL FAILURE] The MetaMask fix is NOT deployed!")
        print("="*80)
        print("\nThe production server is still running the OLD code.")
        print("You need to restart the production server with the new code.")
        results["filter_polling"] = False
    
    # Test 4: Wallet balance
    success, balance = test_wallet_balance()
    results["balance"] = success
    
    # Test 5: Send tokens
    if results["balance"]:
        print(f"\n[INFO] Current balance: {balance} DNR")
        print(f"[INFO] Sending 50 DNR to test transaction detection...")
        success = test_send_tokens()
        results["send_tokens"] = success
        
        if success:
            print(f"\n[INFO] Waiting 10 seconds for transaction to be mined...")
            time.sleep(10)
            
            # Check balance again
            success, new_balance = test_wallet_balance()
            if success and new_balance > balance:
                print(f"[PASS] Balance increased from {balance} to {new_balance} DNR")
    
    # Test 6: Transaction history
    success = test_transaction_history()
    results["tx_history"] = success
    
    # Final summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    for test_name, passed in results.items():
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {test_name.replace('_', ' ').title()}")
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    
    # Critical verdict
    print("\n" + "="*80)
    if results.get("filter_creation"):
        print("VERDICT: MetaMask Fix IS DEPLOYED AND WORKING!")
        print("="*80)
        print("\nWhat this means:")
        print("- MetaMask WILL detect incoming transactions")
        print("- Activity tab WILL show transaction history")
        print("- Users WILL see complete transaction records")
        print("\nNext steps:")
        print("1. Clear MetaMask cache (Settings > Advanced > Clear activity tab data)")
        print("2. Reconnect to Kortana network")
        print("3. Check Activity tab - transactions should appear!")
    else:
        print("VERDICT: MetaMask Fix NOT DEPLOYED!")
        print("="*80)
        print("\nWhat this means:")
        print("- MetaMask CANNOT detect incoming transactions")
        print("- Activity tab will remain empty")
        print("- Users will NOT see transaction history")
        print("\nAction required:")
        print("1. SSH into production server")
        print("2. cd ~/kortanablockchain-devhub/kortana-blockchain-rust")
        print("3. git pull origin main")
        print("4. pkill -9 kortana-blockchain-rust")
        print("5. nohup cargo run --release > kortana-node.log 2>&1 &")
    print("="*80)

if __name__ == "__main__":
    main()
