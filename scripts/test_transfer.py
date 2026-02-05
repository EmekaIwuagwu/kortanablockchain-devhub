#!/usr/bin/env python3
from web3 import Web3
import time

# Connect to Kortana
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

if not w3.is_connected():
    print("ERROR: Failed to connect")
    exit(1)

print(f"✓ Connected to Chain ID: {w3.eth.chain_id}")

# Accounts
private_key = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
account = w3.eth.account.from_key(private_key)
recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

print(f"\nSender: {account.address}")
print(f"Recipient: {recipient}")
print(f"Sender Balance: {w3.eth.get_balance(account.address)} wei")

# Send transfer
nonce = w3.eth.get_transaction_count(account.address)
tx = {
    'nonce': nonce,
    'to': recipient,
    'value': w3.to_wei(1, 'ether'),
    'gas': 21000,
    'gasPrice': w3.eth.gas_price,
    'chainId': w3.eth.chain_id,
}

print(f"\n📝 Sending 1 ETH transfer...")
print(f"  Nonce: {nonce}")
print(f"  Gas: {tx['gas']}")

signed = w3.eth.account.sign_transaction(tx, private_key)
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
print(f"✅ TX sent: 0x{tx_hash.hex()}")

# Wait for receipt
for i in range(15):
    try:
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        if receipt:
            print(f"\n{'='*50}")
            print(f"✅ TRANSFER {'SUCCESS' if receipt['status'] == 1 else 'FAILED'}")
            print(f"{'='*50}")
            print(f"Block: {receipt['blockNumber']}")
            print(f"Gas Used: {receipt['gasUsed']}")
            print(f"Status: {receipt['status']}")
            
            final_balance = w3.eth.get_balance(account.address)
            print(f"\nFinal Sender Balance: {final_balance} wei")
            exit(0 if receipt['status'] == 1 else 1)
    except:
        pass
    time.sleep(1)
    print(f"  Waiting... ({i+1}/15)")

print("\n❌ Transaction not mined")
exit(1)
