#!/usr/bin/env python3
"""
Deploy BisamToken to Kortana Blockchain
"""

import sys
import time
import requests
from web3 import Web3
from eth_account import Account
import solcx

# Install and set Solidity compiler
print("Installing Solidity compiler...")
solcx.install_solc('0.8.20')
solcx.set_solc_version('0.8.20')

# Read contract
print("Reading BisamToken contract...")
with open('contracts/BisamToken.sol', 'r') as f:
    source = f.read()

# Compile
print("Compiling BisamToken...")
compiled = solcx.compile_source(source, output_values=['abi', 'bin'])
contract_id, contract_interface = compiled.popitem()
abi = contract_interface['abi']
bytecode = contract_interface['bin']
print(f"Bytecode length: {len(bytecode)} characters")

# Connect to Kortana
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
if not w3.is_connected():
    print("ERROR: Failed to connect to Kortana RPC")
    sys.exit(1)

print(f"\n[OK] Connected to Kortana Testnet")
print(f"Chain ID: {w3.eth.chain_id}")

# Account (Hardhat test account #0)
private_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
account = Account.from_key(private_key)

print(f"\nDeployer Address: {account.address}")
print(f"Initial Balance: {w3.eth.get_balance(account.address) / 10**18} DNR")

# Fund if balance is low
if w3.eth.get_balance(account.address) < 100 * 10**18:
    print("Funding account...")
    response = requests.post('http://127.0.0.1:8545', json={
        "jsonrpc": "2.0",
        "method": "eth_requestDNR",
        "params": [account.address, "10000"],
        "id": 1
    })
    print(f"Funding response: {response.json()}")
    print(f"New Balance: {w3.eth.get_balance(account.address) / 10**18} DNR")

initial_nonce = w3.eth.get_transaction_count(account.address)
print(f"Initial Nonce: {initial_nonce}")

# Prepare deployment transaction with constructor argument (1 million tokens)
initial_supply = 1_000_000  # 1 million BISAM tokens
contract = w3.eth.contract(abi=abi, bytecode=bytecode)
constructor_data = contract.constructor(initial_supply).build_transaction({
    'from': account.address,
    'nonce': initial_nonce,
    'gas': 10000000,
    'gasPrice': 1,
    'chainId': w3.eth.chain_id,
})

print(f"\n[INFO] Deploying BisamToken with {initial_supply:,} initial supply...")
print(f"  Gas Limit: {constructor_data['gas']}")
print(f"  Data Length: {len(constructor_data['data'])} characters")

# Sign and send
signed_tx = w3.eth.account.sign_transaction(constructor_data, private_key)
print(f"\n[DEBUG] Transaction hash: 0x{signed_tx.hash.hex()}")

tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
print(f"[SUCCESS] Transaction sent: 0x{tx_hash.hex()}")

# Wait for receipt
print("[WAIT] Waiting for transaction to be mined...")
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
            
            if receipt['contractAddress'] and receipt['status'] == 1:
                print(f"\n[YAY] BisamToken deployed at: {receipt['contractAddress']}")
                
                # Verify contract interaction
                print(f"\n[INFO] Verifying token contract...")
                token = w3.eth.contract(address=receipt['contractAddress'], abi=abi)
                
                try:
                    name = token.functions.name().call()
                    symbol = token.functions.symbol().call()
                    decimals = token.functions.decimals().call()
                    total_supply = token.functions.totalSupply().call()
                    deployer_balance = token.functions.balanceOf(account.address).call()
                    
                    print(f"\n[TOKEN INFO]")
                    print(f"  Name: {name}")
                    print(f"  Symbol: {symbol}")
                    print(f"  Decimals: {decimals}")
                    print(f"  Total Supply: {total_supply / 10**decimals:,.0f} {symbol}")
                    print(f"  Deployer Balance: {deployer_balance / 10**decimals:,.0f} {symbol}")
                    
                    if deployer_balance == total_supply:
                        print(f"\n[SUCCESS] All tokens correctly assigned to deployer!")
                    else:
                        print(f"\n[WARNING] Token balance mismatch!")
                        
                    # Test transfer
                    print(f"\n[INFO] Testing token transfer...")
                    recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"  # Hardhat account #1
                    transfer_amount = 1000 * 10**18  # 1000 tokens
                    
                    tx_transfer = token.functions.transfer(recipient, transfer_amount).build_transaction({
                        'from': account.address,
                        'nonce': w3.eth.get_transaction_count(account.address),
                        'gas': 1000000,
                        'gasPrice': 1,
                        'chainId': w3.eth.chain_id
                    })
                    signed_transfer = w3.eth.account.sign_transaction(tx_transfer, private_key)
                    tx_transfer_hash = w3.eth.send_raw_transaction(signed_transfer.raw_transaction)
                    print(f"  Transfer TX: 0x{tx_transfer_hash.hex()}")
                    
                    # Wait for transfer confirmation
                    for j in range(50):
                        try:
                            receipt_transfer = w3.eth.get_transaction_receipt(tx_transfer_hash)
                            if receipt_transfer:
                                print(f"  Transfer confirmed in block {receipt_transfer['blockNumber']}")
                                
                                # Check balances after transfer
                                new_deployer_balance = token.functions.balanceOf(account.address).call()
                                recipient_balance = token.functions.balanceOf(recipient).call()
                                
                                print(f"\n[BALANCES AFTER TRANSFER]")
                                print(f"  Deployer: {new_deployer_balance / 10**decimals:,.0f} {symbol}")
                                print(f"  Recipient: {recipient_balance / 10**decimals:,.0f} {symbol}")
                                
                                if recipient_balance == transfer_amount:
                                    print(f"\n[SUCCESS] Token transfer verified!")
                                break
                        except:
                            pass
                        time.sleep(1)
                        
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
sys.exit(1)
