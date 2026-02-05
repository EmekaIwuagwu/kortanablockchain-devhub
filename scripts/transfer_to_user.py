import sys
import time
from web3 import Web3
from eth_account import Account

# Connection
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
if not w3.is_connected():
    print("ERROR: Failed to connect to Kortana RPC")
    sys.exit(1)

# Configuration
contract_address = Web3.to_checksum_address('0x350ef3784ec5fa5437ec3d67b57057ba6b9b0e86')
deployer_private_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
user_address = Web3.to_checksum_address('0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9')
amount_to_send = 50000 * 10**18  # 50,000 tokens with 18 decimals

# Load Wallet
account = Account.from_key(deployer_private_key)
print(f"Transferring from: {account.address}")
print(f"Transferring to: {user_address}")

# Minimal ABI for transfer
abi = [{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]

# Contract Instance
token = w3.eth.contract(address=contract_address, abi=abi)

# Build Transaction
nonce = w3.eth.get_transaction_count(account.address)
tx = token.functions.transfer(user_address, amount_to_send).build_transaction({
    'from': account.address,
    'nonce': nonce,
    'gas': 1000000,
    'gasPrice': 1,
    'chainId': 72511
})

# Sign and Send
signed_tx = w3.eth.account.sign_transaction(tx, deployer_private_key)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
print(f"Transaction Hash: {tx_hash.hex()}")

# Wait for confirmation
print("Waiting for confirmation...")
while True:
    receipt = w3.eth.get_transaction_receipt(tx_hash)
    if receipt:
        print(f"SUCCESS! Confirmed in block {receipt['blockNumber']}")
        break
    time.sleep(1)
