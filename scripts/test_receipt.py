from web3 import Web3
import time

w = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
private_key = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
account = w.eth.account.from_key(private_key)

recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
nonce = w.eth.get_transaction_count(account.address)

tx = {
    'nonce': nonce,
    'to': recipient,
    'value': w.to_wei(0.1, 'ether'),
    'gas': 21000,
    'gasPrice': w.eth.gas_price,
    'chainId': w.eth.chain_id,
}

signed = w.eth.account.sign_transaction(tx, private_key)
tx_hash = w.eth.send_raw_transaction(signed.raw_transaction)
print(f"✅ Transfer sent: 0x{tx_hash.hex()}")

# Wait for block
time.sleep(3)

# Try to get receipt
print("\nTrying direct RPC call...")
import requests
resp = requests.post('http://127.0.0.1:8545', json={
    "jsonrpc": "2.0",
    "method": "eth_getTransactionReceipt",
    "params": [f"0x{tx_hash.hex()}"],
    "id": 1
})
print(f"Response: {resp.json()}")

# Also try via Web3
print("\nTrying via Web3...")
try:
    receipt = w.eth.get_transaction_receipt(tx_hash)
    print(f"Receipt: {receipt}")
except Exception as e:
    print(f"Error: {e}")
