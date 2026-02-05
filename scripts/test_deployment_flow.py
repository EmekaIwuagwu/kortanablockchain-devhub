"""
Diagnostic script to trace BisamToken deployment through the entire flow
"""

from web3 import Web3
from eth_account import Account
from solcx import compile_source, install_solc
import json
import time

# Configuration
RPC_URL = "http://127.0.0.1:8545"
DEPLOYER_KEY = "2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa"
CHAIN_ID = 72511

# Install Solidity compiler
print("Installing Solidity compiler...")
install_solc('0.8.20')

# Read and compile contract
print("Reading BisamToken contract...")
with open('contracts/BisamToken.sol', 'r') as f:
    contract_source = f.read()

print("Compiling BisamToken...")
compiled_sol = compile_source(
    contract_source,
    output_values=['abi', 'bin'],
    solc_version='0.8.20'
)

contract_id, contract_interface = compiled_sol.popitem()
bytecode = contract_interface['bin']
abi = contract_interface['abi']

print(f"Bytecode length: {len(bytecode)} characters")

# Connect to Kortana
w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    print("ERROR: Failed to connect to Kortana RPC")
    exit(1)

print(f"\n✓ Connected to Kortana Testnet")
print(f"Chain ID: {w3.eth.chain_id}")

# Setup deployer account
deployer = Account.from_key(DEPLOYER_KEY)
print(f"\nDeployer Address: {deployer.address}")

# Check balance
balance = w3.eth.get_balance(deployer.address)
print(f"Balance: {Web3.from_wei(balance, 'ether')} DNR")

# Check nonce
nonce = w3.eth.get_transaction_count(deployer.address)
print(f"Current Nonce: {nonce}")

# Check mempool before submission
try:
    pending_txs = w3.eth.get_block('pending', full_transactions=True)
    print(f"Pending transactions in mempool: {len(pending_txs.get('transactions', []))}")
except:
    print("Unable to check pending transactions")

# Create contract instance
BisamToken = w3.eth.contract(abi=abi, bytecode=bytecode)

# Build deployment transaction
print(f"\n{'='*60}")
print(f"BUILDING DEPLOYMENT TRANSACTION")
print(f"{'='*60}")

construct_txn = BisamToken.constructor(1000000).build_transaction({
    'from': deployer.address,
    'nonce': nonce,
    'gas': 10000000,
    'gasPrice': w3.eth.gas_price,
    'chainId': CHAIN_ID
})

print(f"Transaction Details:")
print(f"  Gas Limit: {construct_txn['gas']}")
print(f"  Gas Price: {construct_txn['gasPrice']}")
print(f"  Nonce: {construct_txn['nonce']}")
print(f"  To: {construct_txn.get('to', 'CONTRACT_CREATION (None)')}")
print(f"  Value: {construct_txn.get('value', 0)}")
print(f"  Data Length: {len(construct_txn['data'])} chars")
print(f"  Data (first 100 chars): {construct_txn['data'][:100]}...")

# Sign transaction
print(f"\nSigning transaction...")
signed_txn = deployer.sign_transaction(construct_txn)

# Send transaction
print(f"\n{'='*60}")
print(f"SENDING TRANSACTION")
print(f"{'='*60}")

try:
    raw_tx = signed_txn.raw_transaction if hasattr(signed_txn, 'raw_transaction') else signed_txn.rawTransaction
    print(f"Raw transaction bytes: {len(raw_tx)}")
    print(f"Raw transaction (hex, first 100 chars): {raw_tx.hex()[:100]}...")
    
    tx_hash = w3.eth.send_raw_transaction(raw_tx)
    
    print(f"\n✓ Transaction Hash: {tx_hash.hex()}")
    print(f"Waiting for receipt...")
    
    # Wait for receipt with timeout
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    
    print(f"\n{'='*60}")
    print(f"TRANSACTION RECEIPT")
    print(f"{'='*60}")
    print(f"Block Number: {receipt['blockNumber']}")
    print(f"Block Hash: {receipt['blockHash'].hex()}")
    print(f"Transaction Index: {receipt['transactionIndex']}")
    print(f"Gas Used: {receipt['gasUsed']}")
    print(f"Cumulative Gas: {receipt['cumulativeGasUsed']}")
    print(f"Contract Address: {receipt.get('contractAddress', 'N/A')}")
    print(f"Status: {receipt.get('status', 'UNKNOWN')}")
    print(f"Status (raw): {receipt.get('status')}")
    print(f"Logs: {len(receipt.get('logs', []))} events")
    
    # Detailed status check
    status_value = receipt.get('status')
    if status_value == 1 or status_value == '0x1':
        print(f"\n✓✓✓ DEPLOYMENT SUCCESSFUL! ✓✓✓")
    elif status_value == 0 or status_value == '0x0':
        print(f"\n✗✗✗ DEPLOYMENT FAILED - TRANSACTION REVERTED ✗✗✗")
        print(f"\nDEBUGGING INFO:")
        print(f"  - Check if bytecode is correct")
        print(f"  - Check if constructor arguments are valid")
        print(f"  - Check EVM logs for invalid opcodes")
        print(f"  - Check if sufficient gas was provided")
    else:
        print(f"\n??? UNKNOWN STATUS: {status_value}")
    
except Exception as e:
    print(f"\n{'='*60}")
    print(f"DEPLOYMENT ERROR")
    print(f"{'='*60}")
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print(f"\n{'='*60}")
print(f"POST-DEPLOYMENT CHECKS")
print(f"{'='*60}")

# Check nonce again
final_nonce = w3.eth.get_transaction_count(deployer.address)
print(f"Final Nonce: {final_nonce} (increased by {final_nonce - nonce})")

# Check balance again
final_balance = w3.eth.get_balance(deployer.address)
print(f"Final Balance: {Web3.from_wei(final_balance, 'ether')} DNR")
print(f"Gas Cost: {Web3.from_wei(balance - final_balance, 'ether')} DNR")
