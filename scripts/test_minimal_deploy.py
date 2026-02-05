"""
Deploy a VERY simple token to test what's working
"""

from web3 import Web3
from eth_account import Account

RPC_URL = "http://127.0.0.1:8545"
DEPLOYER_KEY = "2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa"
CHAIN_ID = 72511

# Ultra-minimal bytecode that just returns a small runtime
# This is a contract that does almost nothing
MINIMAL_BYTECODE = "0x60806040526000805534801561001457600080fd5b5060358060226000396000f3fe6080604052600080fdfea264697066735822122012345678901234567890123456789012345678901234567890123456789012345664736f6c63430008140033"

w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    print("ERROR: Failed to connect")
    exit(1)

deployer = Account.from_key(DEPLOYER_KEY)
print(f"Deploying from: {deployer.address}")
print(f"Balance: {Web3.from_wei(w3.eth.get_balance(deployer.address), 'ether')} DNR")

nonce = w3.eth.get_transaction_count(deployer.address)

tx = {
    'from': deployer.address,
    'to': "0x0000000000000000000000000000000000000000",
    'value': 0,
    'gas': 500000,
    'gasPrice': w3.eth.gas_price,
    'nonce': nonce,
    'data': MINIMAL_BYTECODE,
    'chainId': CHAIN_ID
}

print(f"\nDeploying minimal contract...")
print(f"Bytecode length: {len(MINIMAL_BYTECODE)} chars")

signed_txn = deployer.sign_transaction(tx)
raw_tx = signed_txn.raw_transaction if hasattr(signed_txn, 'raw_transaction') else signed_txn.rawTransaction

try:
    tx_hash = w3.eth.send_raw_transaction(raw_tx)
    print(f"TX Hash: {tx_hash.hex()}")
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    
    print(f"\nResult:")
    print(f"  Block: {receipt['blockNumber']}")
    print(f"  Gas Used: {receipt['gasUsed']}")
    print(f"  Status: {'SUCCESS' if receipt.get('status') == 1 or receipt.get('status') == '0x1' else 'FAILED'}")
    print(f"  Contract Address: {receipt.get('contractAddress', 'N/A')}")
    
except Exception as e:
    print(f"ERROR: {e}")
