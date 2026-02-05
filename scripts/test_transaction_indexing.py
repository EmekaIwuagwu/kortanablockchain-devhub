"""
Test Script for Transaction Inflow/Outflow Fix
Tests that both incoming and outgoing transactions appear in MetaMask
"""

from web3 import Web3
from eth_account import Account
import time

# Configuration
RPC_URL = "http://localhost:8545"
SENDER_KEY = "2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa"
RECEIVER_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
CHAIN_ID = 72511

def test_transaction_indexing():
    """Test that transactions are indexed for both sender and receiver"""
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    
    if not w3.is_connected():
        print("❌ Failed to connect to RPC")
        return False
    
    print("✅ Connected to Kortana RPC")
    
    # Setup accounts
    sender = Account.from_key(SENDER_KEY)
    receiver = Account.from_key(RECEIVER_KEY)
    
    sender_addr = sender.address
    receiver_addr = receiver.address
    
    print(f"\n📧 Sender: {sender_addr}")
    print(f"📧 Receiver: {receiver_addr}")
    
    # Check initial history
    print("\n📊 Checking initial transaction history...")
    try:
        sender_history_before = w3.provider.make_request("eth_getAddressHistory", [sender_addr])
        receiver_history_before = w3.provider.make_request("eth_getAddressHistory", [receiver_addr])
        
        sender_count_before = len(sender_history_before.get('result', []))
        receiver_count_before = len(receiver_history_before.get('result', []))
        
        print(f"   Sender has {sender_count_before} transactions")
        print(f"   Receiver has {receiver_count_before} transactions")
    except:
        sender_count_before = 0
        receiver_count_before = 0
    
    # Send a transaction
    print(f"\n💸 Sending 1 DNR from sender to receiver...")
    
    nonce = w3.eth.get_transaction_count(sender_addr)
    
    tx = {
        'from': sender_addr,
        'to': receiver_addr,
        'value': Web3.to_wei(1, 'ether'),
        'gas': 21000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
        'chainId': CHAIN_ID
    }
    
    signed_txn = sender.sign_transaction(tx)
    
    try:
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        print(f"📝 Transaction sent: {tx_hash.hex()}")
        
        # Wait for transaction
        print("⏳ Waiting for confirmation...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        
        print(f"✅ Transaction confirmed in block {receipt['blockNumber']}")
        
        # Wait a bit for indexing
        time.sleep(2)
        
        # Check history after transaction
        print("\n📊 Checking transaction history after transfer...")
        
        sender_history_after = w3.provider.make_request("eth_getAddressHistory", [sender_addr])
        receiver_history_after = w3.provider.make_request("eth_getAddressHistory", [receiver_addr])
        
        sender_count_after = len(sender_history_after.get('result', []))
        receiver_count_after = len(receiver_history_after.get('result', []))
        
        print(f"   Sender now has {sender_count_after} transactions (+{sender_count_after - sender_count_before})")
        print(f"   Receiver now has {receiver_count_after} transactions (+{receiver_count_after - receiver_count_before})")
        
        # Verify both addresses have the transaction
        sender_has_tx = sender_count_after > sender_count_before
        receiver_has_tx = receiver_count_after > receiver_count_before
        
        print("\n📋 Verification Results:")
        print(f"   ✅ Sender has transaction (OUTFLOW): {sender_has_tx}")
        print(f"   {'✅' if receiver_has_tx else '❌'} Receiver has transaction (INFLOW): {receiver_has_tx}")
        
        if sender_has_tx and receiver_has_tx:
            print("\n🎉 FIX #1 VERIFIED: Both inflow and outflow are indexed!")
            return True
        elif sender_has_tx and not receiver_has_tx:
            print("\n❌ FIX #1 FAILED: Only outflow is indexed (inflow missing)")
            return False
        else:
            print("\n❌ Transaction indexing failed completely")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING FIX #1: Transaction Inflow/Outflow")
    print("=" * 60)
    print()
    
    success = test_transaction_indexing()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED - Inflow/Outflow Fixed!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ TEST FAILED - Inflow/Outflow Still Broken")
        print("=" * 60)
