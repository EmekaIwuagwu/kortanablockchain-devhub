"""Quick test to see EVM output"""
from web3 import Web3
from eth_account import Account

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
if not w3.is_connected():
    print("Node not running")
    exit(1)

deployer = Account.from_key("2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa")
nonce = w3.eth.get_transaction_count(deployer.address)

# Deploy ultra-minimal bytecode
bytecode = "0x600160005260206000f3"  # Just returns 0x01

tx = {
    'from': deployer.address,
    'to': "0x0000000000000000000000000000000000000000",
    'value': 0,
    'gas': 500000,
    'gasPrice': 1,
    'nonce': nonce,
    'data': bytecode,
    'chainId': 72511
}

signed = deployer.sign_transaction(tx)
raw_tx = signed.raw_transaction if hasattr(signed, 'raw_transaction') else signed.rawTransaction

print(f"Deploying minimal contract (bytecode: {len(bytecode)} chars)...")
tx_hash = w3.eth.send_raw_transaction(raw_tx)
print(f"TX: {tx_hash.hex()}")

receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
print(f"Block: {receipt['blockNumber']}, Gas: {receipt['gasUsed']}, Status: {receipt.get('status')}")
