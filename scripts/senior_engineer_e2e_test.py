import json
import time
import sys
from web3 import Web3
from solcx import compile_source, install_solc

# Configuration
RPC_URL = "http://127.0.0.1:8545"
CHAIN_ID = 72511
SOLC_VERSION = '0.8.20'
PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

def setup_w3():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        print("[FAIL] Could not connect to Kortana node")
        sys.exit(1)
    print(f"[OK] Connected to Kortana Node (Chain ID: {w3.eth.chain_id})")
    return w3

def fund_account(w3, address, amount_dnr=1000):
    print(f"[INFO] Requesting {amount_dnr} DNR for {address}...")
    try:
        response = w3.provider.make_request("eth_requestDNR", [address, str(amount_dnr)])
        if response.get('result'):
            print(f"[OK] Success: Faucet distributed {amount_dnr} DNR")
            return True
    except Exception as e:
        print(f"[ERROR] Faucet request failed: {e}")
    return False

def deploy_contract(w3, account, contract_path, constructor_args=None):
    print(f"\n[INFO] Deploying {contract_path}...")
    with open(contract_path, 'r') as f:
        source = f.read()
    
    compiled = compile_source(source, output_values=['abi', 'bin'], solc_version=SOLC_VERSION)
    contract_id, interface = compiled.popitem()
    abi = interface['abi']
    bytecode = interface['bin']
    
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    nonce = w3.eth.get_transaction_count(account.address)
    
    if constructor_args:
        txn_dict = contract.constructor(*constructor_args).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 8000000,
            'gasPrice': w3.eth.gas_price,
            'chainId': CHAIN_ID
        })
    else:
        txn_dict = contract.constructor().build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 8000000,
            'gasPrice': w3.eth.gas_price,
            'chainId': CHAIN_ID
        })
        
    signed_tx = w3.eth.account.sign_transaction(txn_dict, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    print(f"[WAIT] Waiting for deployment (TX: {tx_hash.hex()})...")
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    if receipt['status'] == 1:
        print(f"[OK] Contract deployed at: {receipt['contractAddress']}")
        return w3.eth.contract(address=receipt['contractAddress'], abi=abi)
    else:
        print("[FAIL] Deployment failed")
        sys.exit(1)

def main():
    print("=" * 80)
    print("KORTANA BLOCKCHAIN - SENIOR ENGINEER END-TO-END TEST")
    print("=" * 80)
    
    # 1. Setup
    install_solc(SOLC_VERSION)
    w3 = setup_w3()
    account = w3.eth.account.from_key(PRIVATE_KEY)
    print(f"Testing with account: {account.address}")
    
    # 2. Faucet Test
    initial_balance = w3.eth.get_balance(account.address)
    print(f"Initial balance: {w3.from_wei(initial_balance, 'ether')} DNR")
    if initial_balance < w3.to_wei(100, 'ether'):
        fund_account(w3, account.address)
        new_balance = w3.eth.get_balance(account.address)
        print(f"New balance: {w3.from_wei(new_balance, 'ether')} DNR")
    
    # 3. Simple Storage Test (EVM Basic)
    storage_contract = deploy_contract(w3, account, 'contracts/SimpleStorage.sol')
    
    print("\n[INFO] Reading initial value...")
    val = storage_contract.functions.getValue().call()
    print(f"Current value: {val}")
    
    print("[INFO] Setting value to 1337...")
    tx_set = storage_contract.functions.setValue(1337).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 500000,
        'gasPrice': w3.eth.gas_price,
        'chainId': CHAIN_ID
    })
    signed_set = w3.eth.account.sign_transaction(tx_set, PRIVATE_KEY)
    tx_hash_set = w3.eth.send_raw_transaction(signed_set.raw_transaction)
    w3.eth.wait_for_transaction_receipt(tx_hash_set)
    
    new_val = storage_contract.functions.getValue().call()
    print(f"New value: {new_val}")
    if new_val == 1337:
        print("[OK] SimpleStorage test passed!")
    else:
        print(f"[FAIL] SimpleStorage test failed (expected 1337, got {new_val})")
        sys.exit(1)
        
    # 4. BantumiToken (Complex ERC20-like)
    token_contract = deploy_contract(w3, account, 'contracts/BantumiToken.sol', [1000000])
    
    name = token_contract.functions.name().call()
    symbol = token_contract.functions.symbol().call()
    supply = token_contract.functions.totalSupply().call()
    balance = token_contract.functions.balanceOf(account.address).call()
    
    print(f"\nToken: {name} ({symbol})")
    print(f"Total Supply: {supply / 10**18}")
    print(f"Owner Balance: {balance / 10**18}")
    
    # 5. Token Transfer Test
    receiver = "0x0000000000000000000000000000000000000001"
    print(f"[INFO] Transferring 5000 BANT to {receiver}...")
    
    tx_transfer = token_contract.functions.transfer(receiver, w3.to_wei(5000, 'ether')).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 1000000,
        'gasPrice': w3.eth.gas_price,
        'chainId': CHAIN_ID
    })
    signed_transfer = w3.eth.account.sign_transaction(tx_transfer, PRIVATE_KEY)
    tx_hash_transfer = w3.eth.send_raw_transaction(signed_transfer.raw_transaction)
    w3.eth.wait_for_transaction_receipt(tx_hash_transfer)
    
    owner_balance_after = token_contract.functions.balanceOf(account.address).call()
    receiver_balance = token_contract.functions.balanceOf(receiver).call()
    
    print(f"Owner Balance After: {owner_balance_after / 10**18}")
    print(f"Receiver Balance: {receiver_balance / 10**18}")
    
    if receiver_balance == w3.to_wei(5000, 'ether'):
        print("[OK] BantumiToken transfer passed!")
    else:
        print(f"[FAIL] BantumiToken transfer failed (expected 5000, got {receiver_balance / 10**18})")
        sys.exit(1)

    print("\n" + "=" * 80)
    print("[SUCCESS] ALL SENIOR ENGINEER E2E TESTS PASSED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    main()
