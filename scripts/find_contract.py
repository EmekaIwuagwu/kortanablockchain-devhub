import requests

def find_contract():
    r = requests.post('http://127.0.0.1:8545', json={'jsonrpc':'2.0', 'method':'eth_blockNumber', 'params':[], 'id':1}).json()
    last_block = int(r['result'], 16)
    
    for i in range(last_block, 0, -1):
        r = requests.post('http://127.0.0.1:8545', json={'jsonrpc':'2.0', 'method':'eth_getBlockByNumber', 'params':[hex(i), True], 'id':1}).json()
        if not r['result']: continue
        txs = r['result']['transactions']
        for tx in txs:
            receipt = requests.post('http://127.0.0.1:8545', json={'jsonrpc':'2.0', 'method':'eth_getTransactionReceipt', 'params':[tx['hash']], 'id':1}).json()
            addr = receipt['result'].get('contractAddress')
            if addr:
                print(f"BISAM found at: {addr}")
                return addr

if __name__ == "__main__":
    find_contract()
