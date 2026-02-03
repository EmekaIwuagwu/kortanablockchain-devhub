from web3 import Web3
from eth_account import Account
import sys

# Configuration
RPC_URL = "http://localhost:8545"
CHAIN_ID = 72511
FAUCET_PRIVATE_KEY = "2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa"
RECIPIENT_ADDRESS = "0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9"
AMOUNT_DNR = 4500000

def send_tokens():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    
    # Check connection
    if not w3.is_connected():
        print("Failed to connect to the Kortana RPC.")
        return

    account = Account.from_key(FAUCET_PRIVATE_KEY)
    balance_wei = w3.eth.get_balance(account.address)
    print(f"Faucet Address: {account.address}")
    print(f"Faucet Balance: {w3.from_wei(balance_wei, 'ether')} DNR")

    # Prepare transaction
    nonce = w3.eth.get_transaction_count(account.address)
    amount_wei = w3.to_wei(AMOUNT_DNR, 'ether')

    tx = {
        'nonce': nonce,
        'to': RECIPIENT_ADDRESS,
        'value': amount_wei,
        'gas': 21000,
        'gasPrice': w3.eth.gas_price,
        'chainId': CHAIN_ID
    }

    print(f"\nSending {AMOUNT_DNR} DNR to {RECIPIENT_ADDRESS}...")
    
    # Sign and send
    signed_tx = w3.eth.account.sign_transaction(tx, FAUCET_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    print(f"Transaction sent! Hash: {tx_hash.hex()}")
    print(f"URL: https://explorer.kortana.worchsester.xyz/tx/{tx_hash.hex()}")

if __name__ == "__main__":
    send_tokens()
