#!/usr/bin/env python3
import json
import sys
from web3 import Web3
from solcx import compile_source, install_solc

# Install Solidity compiler
print("Installing Solidity compiler...")
install_solc('0.8.20')

# Read the contract
print("Reading SimpleStorage contract...")
with open('contracts/SimpleStorage.sol', 'r') as f:
    contract_source = f.read()

# Compile
print("Compiling SimpleStorage...")
compiled = compile_source(contract_source, output_values=['abi', 'bin'], solc_version='0.8.20')
contract_id, contract_interface = compiled.popitem()
bytecode = contract_interface['bin']
abi = contract_interface['abi']

print(f"Bytecode length: {len(bytecode)} characters")

# Connect to Kortana
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

if not w3.is_connected():
    print("ERROR: Failed to connect to Kortana RPC")
    sys.exit(1)

print(f"\n[OK] Connected to Kortana Testnet")
print(f"Chain ID: {w3.eth.chain_id}")

# Account (same as test_deployment_flow.py)
private_key = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
account = w3.eth.account.from_key(private_key)

print(f"\nDeployer Address: {account.address}")
print(f"Initial Balance: {w3.eth.get_balance(account.address) / 10**18} DNR")

# Fund if balance is low
if w3.eth.get_balance(account.address) < 100 * 10**18:
    print("Funding account...")
    import requests
    response = requests.post('http://127.0.0.1:8545', json={
        "jsonrpc": "2.0",
        "method": "eth_requestDNR",
        "params": [account.address, "1000"],
        "id": 1
    })
    print(f"Funding response: {response.json()}")
    print(f"New Balance: {w3.eth.get_balance(account.address) / 10**18} DNR")

initial_nonce = w3.eth.get_transaction_count(account.address)
print(f"Initial Nonce: {initial_nonce}")

# Build deployment transaction
SimpleStorage = w3.eth.contract(abi=abi, bytecode=bytecode)
tx = SimpleStorage.constructor().build_transaction({
    'from': account.address,
    'nonce': initial_nonce,
    'gas': 10000000,
    'gasPrice': w3.eth.gas_price,
    'chainId': w3.eth.chain_id,
})

print(f"\n[INFO] Transaction Details:")
print(f"  Gas Limit: {tx['gas']}")
print(f"  Gas Price: {tx['gasPrice']}")
print(f"  Data Length: {len(tx['data'])} characters")

# Sign and send
signed_tx = w3.eth.account.sign_transaction(tx, private_key)

print(f"\n[DEBUG] DEBUGGING SIGNED TRANSACTION:")
print(f"  Raw transaction (first 100 chars): {signed_tx.raw_transaction.hex()[:100]}...")
print(f"  Raw transaction length: {len(signed_tx.raw_transaction)} bytes")
print(f"  Transaction hash: 0x{signed_tx.hash.hex()}")

# Send using Web3
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
print(f"\n[SUCCESS] Transaction sent via Web3: 0x{tx_hash.hex()}")

# Wait for receipt
print("[WAIT] Waiting for transaction to be mined...")
import time
for i in range(100):
    try:
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        if receipt:
            print(f"\n{'='*60}")
            print(f"[SUCCESS] DEPLOYMENT {'SUCCESSFUL' if receipt['status'] == 1 else 'FAILED'}")
            print(f"{'='*60}")
            print(f"Status: {receipt['status']}")
            print(f"Gas Used: {receipt['gasUsed']}")
            print(f"Contract Address: {receipt['contractAddress']}")
            print(f"Block Number: {receipt['blockNumber']}")
            
            final_nonce = w3.eth.get_transaction_count(account.address)
            final_balance = w3.eth.get_balance(account.address)
            
            print(f"\nFinal Nonce: {final_nonce} (increased by {final_nonce - initial_nonce})")
            print(f"Final Balance: {final_balance / 10**18} DNR")
            
            gas_cost = receipt['gasUsed'] * tx['gasPrice']
            print(f"Gas Cost: {gas_cost / 10**18} DNR")
            
            if receipt['contractAddress']:
                print(f"\n[YAY] Contract deployed at: {receipt['contractAddress']}")
                print(f"\nYou can now add this to MetaMask:")
                print(f"  Address: {receipt['contractAddress']}")
                
                # VERIFICATION
                print(f"\n[INFO] Verifying contract interaction...")
                contract_instance = w3.eth.contract(address=receipt['contractAddress'], abi=abi)
                
                try:
                    # Check initial value
                    val = contract_instance.functions.getValue().call()
                    print(f"[TEST] Initial getValue(): {val}")
                    if val != 42:
                         print(f"[ERROR] Expected 42, got {val}")
                         sys.exit(1)
                    else:
                         print(f"[SUCCESS] Initial state matches (42)")
                         
                    # Update value
                    print(f"[INFO] Sending setValue(100)...")
                    tx_set = contract_instance.functions.setValue(100).build_transaction({
                        'from': account.address,
                        'nonce': w3.eth.get_transaction_count(account.address),
                        'gas': 1000000,
                        'gasPrice': 1,
                        'chainId': w3.eth.chain_id
                    })
                    signed_set = w3.eth.account.sign_transaction(tx_set, private_key)
                    tx_set_hash = w3.eth.send_raw_transaction(signed_set.raw_transaction)
                    print(f"[INFO] SetValue TX: 0x{tx_set_hash.hex()}")
                    
                    # Wait for confirmation
                    print("[WAIT] Waiting for setValue confirmation...")
                    for j in range(50):
                        try:
                            receipt_set = w3.eth.get_transaction_receipt(tx_set_hash)
                            if receipt_set:
                                print(f"[SUCCESS] SetValue Confirmed (Block {receipt_set['blockNumber']})")
                                break
                        except:
                            pass
                        time.sleep(1)
                    
                    # Check new value
                    new_val = contract_instance.functions.getValue().call()
                    print(f"[TEST] Final getValue(): {new_val}")
                    if new_val != 100:
                        print(f"[ERROR] Expected 100, got {new_val}")
                        sys.exit(1)
                    else:
                        print(f"[SUCCESS] Final state matches (100)")
                        
                except Exception as e:
                    print(f"[ERROR] Verification failed: {e}")
                    sys.exit(1)

            sys.exit(0 if receipt['status'] == 1 else 1)
    except Exception as e:
        pass
    time.sleep(1)
    if i % 5 == 0:
        print(f"  Waiting... ({i+1}/100)")

print("\n[ERROR] Transaction not mined within 100 seconds")
print(f"Transaction hash: 0x{tx_hash.hex()}")
sys.exit(1)
