from web3 import Web3
w = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
print(f"Block height: {w.eth.block_number}")
block = w.eth.get_block(15)
print(f"Block 15 txs: {len(block['transactions'])}")
for i, tx_hash in enumerate(block['transactions']):
    print(f"  TX {i}: 0x{tx_hash.hex()}")
    receipt = w.eth.get_transaction_receipt(tx_hash)
    if receipt:
        print(f"    Status: {receipt['status']}")
        print(f"    Contract: {receipt.get('contractAddress')}")
        print(f"    Gas used: {receipt['gasUsed']}")
