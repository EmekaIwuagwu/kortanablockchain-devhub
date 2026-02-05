"""
Compile and deploy BisamToken to Kortana testnet
"""

from web3 import Web3
from eth_account import Account
from solcx import compile_source, install_solc
import json

# Install Solidity compiler
print("Installing Solidity compiler...")
install_solc('0.8.20')

# Configuration
RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz"
DEPLOYER_KEY = "2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa"
CHAIN_ID = 72511

# Read contract source
print("Reading BisamToken contract...")
with open('contracts/BisamToken.sol', 'r') as f:
    contract_source = f.read()

# Compile contract
print("Compiling BisamToken...")
compiled_sol = compile_source(
    contract_source,
    output_values=['abi', 'bin'],
    solc_version='0.8.20'
)

# Get contract interface
contract_id, contract_interface = compiled_sol.popitem()
bytecode = contract_interface['bin']
abi = contract_interface['abi']

print(f"Bytecode length: {len(bytecode)} characters")
print(f"ABI functions: {len([item for item in abi if item['type'] == 'function'])}")

# Connect to Kortana
w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    print("ERROR: Failed to connect to Kortana RPC")
    exit(1)

print(f"\nConnected to Kortana Testnet")
print(f"Chain ID: {w3.eth.chain_id}")

# Setup deployer account
deployer = Account.from_key(DEPLOYER_KEY)
print(f"\nDeployer Address: {deployer.address}")

balance = w3.eth.get_balance(deployer.address)
print(f"Balance: {Web3.from_wei(balance, 'ether')} DNR")

if balance < Web3.to_wei(1, 'ether'):
    print("ERROR: Insufficient balance for deployment")
    exit(1)

# Create contract instance
BisamToken = w3.eth.contract(abi=abi, bytecode=bytecode)

# Build constructor transaction (1 million tokens initial supply)
print(f"\nBuilding deployment transaction...")
print(f"Initial Supply: 1,000,000 BISAM tokens")

nonce = w3.eth.get_transaction_count(deployer.address)

# Build the deployment transaction
construct_txn = BisamToken.constructor(1000000).build_transaction({
    'from': deployer.address,
    'nonce': nonce,
    'gas': 2000000,
    'gasPrice': w3.eth.gas_price,
    'chainId': CHAIN_ID
})

print(f"\nTransaction Details:")
print(f"  Gas Limit: {construct_txn['gas']}")
print(f"  Gas Price: {construct_txn['gasPrice']}")
print(f"  Nonce: {construct_txn['nonce']}")
print(f"  Data Length: {len(construct_txn['data'])} chars")

# Sign transaction
print(f"\nSigning transaction...")
signed_txn = deployer.sign_transaction(construct_txn)

# Send transaction
print(f"\n{'='*60}")
print(f"DEPLOYING BISAMTOKEN TO KORTANA TESTNET")
print(f"{'='*60}")

try:
    raw_tx = signed_txn.raw_transaction if hasattr(signed_txn, 'raw_transaction') else signed_txn.rawTransaction
    tx_hash = w3.eth.send_raw_transaction(raw_tx)
    
    print(f"\nTransaction Hash: {tx_hash.hex()}")
    print(f"Waiting for confirmation...")
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    
    print(f"\n{'='*60}")
    print(f"DEPLOYMENT RESULT")
    print(f"{'='*60}")
    print(f"Block Number: {receipt['blockNumber']}")
    print(f"Gas Used: {receipt['gasUsed']}")
    print(f"Cumulative Gas: {receipt['cumulativeGasUsed']}")
    print(f"Contract Address: {receipt.get('contractAddress', 'N/A')}")
    print(f"Status: {'SUCCESS' if receipt.get('status') == 1 or receipt.get('status') == '0x1' else 'FAILED'}")
    print(f"Logs: {len(receipt.get('logs', []))} events")
    
    # Check if deployment succeeded
    status_ok = receipt.get('status') == 1 or receipt.get('status') == '0x1'
    
    if status_ok:
        contract_addr = receipt.get('contractAddress')
        print(f"\n{'='*60}")
        print(f"BISAMTOKEN DEPLOYED SUCCESSFULLY!")
        print(f"{'='*60}")
        
        if contract_addr:
            print(f"Contract Address: {contract_addr}")
            
            # Try to interact with the contract
            print(f"\nVerifying contract...")
            bisam = w3.eth.contract(address=contract_addr, abi=abi)
            
            try:
                name = bisam.functions.name().call()
                symbol = bisam.functions.symbol().call()
                decimals = bisam.functions.decimals().call()
                total_supply = bisam.functions.totalSupply().call()
                deployer_balance = bisam.functions.balanceOf(deployer.address).call()
                
                print(f"\nToken Details:")
                print(f"  Name: {name}")
                print(f"  Symbol: {symbol}")
                print(f"  Decimals: {decimals}")
                print(f"  Total Supply: {total_supply / (10**decimals):,} {symbol}")
                print(f"  Deployer Balance: {deployer_balance / (10**decimals):,} {symbol}")
                
                print(f"\n{'='*60}")
                print(f"CONTRACT VERIFICATION SUCCESSFUL!")
                print(f"{'='*60}")
                
            except Exception as e:
                print(f"\nWARNING: Could not verify contract state")
                print(f"Error: {e}")
        else:
            print(f"\nNOTE: Contract deployed but address not returned in receipt")
            print(f"This is a known RPC formatting issue")
            print(f"The contract IS deployed (gas used: {receipt['gasUsed']})")
    else:
        print(f"\n{'='*60}")
        print(f"DEPLOYMENT FAILED - TRANSACTION REVERTED")
        print(f"{'='*60}")
        
except Exception as e:
    print(f"\n{'='*60}")
    print(f"DEPLOYMENT ERROR")
    print(f"{'='*60}")
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
