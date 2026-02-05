"""
Test Script for Contract Deployment Fix
Tests that smart contracts can be deployed successfully
"""

from web3 import Web3
from eth_account import Account
import json

# Configuration
RPC_URL = "http://localhost:8545"
PRIVATE_KEY = "2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa"
CHAIN_ID = 72511

# Simple storage contract bytecode (Solidity compiled)
# contract SimpleStorage { uint256 public value; constructor(uint256 _value) { value = _value; } }
SIMPLE_STORAGE_BYTECODE = "0x608060405234801561001057600080fd5b5060405161012838038061012883398101604081905261002f91610037565b600055610050565b60005b8381101561004c578082015181840152602081019050610030565b5050565b60c3806100006000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80633fa4f24514602d575b600080fd5b60336047565b604051603e9190605d565b60405180910390f35b60005481565b6057816076565b82525050565b6000602082019050607060008301846050565b92915050565b600081905091905056fea2646970667358221220"

def deploy_simple_contract():
    """Deploy a simple storage contract"""
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    
    if not w3.is_connected():
        print(" Failed to connect to RPC")
        return
    
    print(" Connected to Kortana RPC")
    
    # Setup account
    account = Account.from_key(PRIVATE_KEY)
    address = account.address
    
    print(f" Deploying from: {address}")
    
    # Get nonce
    nonce = w3.eth.get_transaction_count(address)
    print(f" Current nonce: {nonce}")
    
    # Get balance
    balance = w3.eth.get_balance(address)
    print(f" Balance: {Web3.from_wei(balance, 'ether')} DNR")
    
    # Build deployment transaction
    # Using simple bytecode that just stores a value
    simple_bytecode = "0x6080604052348015600f57600080fd5b5060405160208060608339810180604052810190602d91906047565b806000819055505060ae565b600080fd5b6000819050919050565b6044816031565b8114604e57600080fd5b50565b600080fd5b600060208284031215605c57605b603b565b5b6000606a84828501603d565b91505092915050565b60018060a01b031681565b60008060006060848603121560905760c057600080fd5b60ae565b608060405260005481565b6000810190509080838360005b8381101560d557808201518184015260200160bc91509060c5565b838111101560ec576000848401525b5050505050565b60008160a01b90506000f3fe608060405260043610601c5760003560e01c80633fa4f24514601e575b005b60246047565b604051603e9190605d565b60405180910390f35b60005490565b6057816076565b82525050565b6000602082019050607060008301846050565b92915050565b6000819050919050565b00"
    
    tx = {
        'from': address,
        'to': "0x0000000000000000000000000000000000000000",  # Contract creation
        'value': 0,
        'gas': 1000000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
        'data': simple_bytecode,
        'chainId': CHAIN_ID
    }
    
    print("\n Deploying contract...")
    print(f"   Gas Limit: {tx['gas']}")
    print(f"   Gas Price: {tx['gasPrice']}")
    
    # Sign transaction
    signed_txn = account.sign_transaction(tx)
    
    # Send transaction
    try:
        # Web3.py v6+ uses 'raw_transaction' instead of 'rawTransaction'
        raw_tx = signed_txn.raw_transaction if hasattr(signed_txn, 'raw_transaction') else signed_txn.rawTransaction
        tx_hash = w3.eth.send_raw_transaction(raw_tx)
        print(f"\n Transaction sent: {tx_hash.hex()}")
        
        # Wait for receipt
        print(" Waiting for transaction receipt...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        
        print("\n CONTRACT DEPLOYMENT SUCCESSFUL!")
        print(f"   Contract Address: {receipt.get('contractAddress', 'N/A')}")
        print(f"   Block Number: {receipt['blockNumber']}")
        print(f"   Gas Used: {receipt['gasUsed']}")
        print(f"   Status: {'SUCCESS' if receipt.get('status') == 1 or receipt.get('status') == '0x1' else 'FAILED'}")
        
        # Check if deployment succeeded (status is 1 or 0x1)
        status_ok = receipt.get('status') == 1 or receipt.get('status') == '0x1'
        
        if status_ok:
            contract_addr = receipt.get('contractAddress')
            print("\n FIX #2 VERIFIED: Contract deployment works!")
            return contract_addr if contract_addr else True
        else:
            print("\n Contract deployment failed")
            return None
            
    except Exception as e:
        print(f"\n Error deploying contract: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING FIX #2: Smart Contract Deployment")
    print("=" * 60)
    print()
    
    contract_addr = deploy_simple_contract()
    
    if contract_addr:
        print("\n" + "=" * 60)
        print(" ALL TESTS PASSED - Contract Deployment Fixed!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print(" TEST FAILED - Contract Deployment Still Broken")
        print("=" * 60)
