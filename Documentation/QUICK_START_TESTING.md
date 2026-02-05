# Quick Start Guide: Testing the MetaMask Activity Fix

## Prerequisites
- Kortana blockchain node compiled with the new filter code ✅
- MetaMask installed and configured for Kortana testnet
- Python 3 with `requests` library

## Step-by-Step Testing

### 1. Start the Blockchain Node

```powershell
cd C:\Users\emi\Desktop\blockchains\kortanablockchain-devhub\kortana-blockchain-rust
cargo run --release
```

**Expected output:**
```
[1/5] Initializing Database... OK
[2/5] Loading Ledger State... GENESIS
[3/5] Starting Consensus Engine... OK
[4/5] Spawning P2P Networking... RUNNING
[5/5] Launching JSON-RPC... RUNNING
```

### 2. Clear MetaMask Cache (Important!)

1. Open MetaMask
2. Click the account icon → Settings
3. Go to Advanced
4. Scroll down and click "Clear activity tab data"
5. Confirm the action

This ensures MetaMask starts fresh and creates a new filter.

### 3. Reconnect MetaMask to Kortana

1. In MetaMask, select the Kortana network
2. Wait a few seconds for it to connect
3. You should see your balance

**Behind the scenes:** MetaMask just called `eth_newBlockFilter` and received a unique filter ID!

### 4. Run the Filter Test (Optional but Recommended)

```powershell
cd C:\Users\emi\Desktop\blockchains\kortanablockchain-devhub
python scripts/test_metamask_filters.py
```

Choose option 1 for the basic filter workflow test.

**What to expect:**
- Filter creation succeeds
- First poll returns empty (no new blocks)
- After 15 seconds, second poll returns new blocks
- Third poll returns empty again

### 5. Test Incoming Transaction

```powershell
python scripts/send_faucet_tokens.py
```

Or manually:
```python
import requests
requests.post("http://localhost:8545", json={
    "jsonrpc": "2.0",
    "method": "eth_requestDNR",
    "params": ["YOUR_METAMASK_ADDRESS", "10"],
    "id": 1
})
```

### 6. Check MetaMask Activity Tab

1. Open MetaMask
2. Click on "Activity" tab
3. **You should now see:**
   - ✅ The incoming transaction
   - ✅ Status: Confirmed
   - ✅ From: Faucet address
   - ✅ To: Your address
   - ✅ Amount: 10 DNR
   - ✅ Timestamp

### 7. Test Outgoing Transaction

1. In MetaMask, click "Send"
2. Enter any address and amount
3. Confirm the transaction
4. **You should see:**
   - ✅ Transaction appears immediately as "Pending"
   - ✅ After ~5 seconds, status changes to "Confirmed"
   - ✅ Transaction details are correct

## Troubleshooting

### Problem: No transactions showing in Activity tab

**Solution 1:** Clear MetaMask cache
- Settings → Advanced → Clear activity tab data
- Disconnect and reconnect to the network

**Solution 2:** Check if node is running
```powershell
curl http://localhost:8545
```
Should return: "Kortana RPC is Live!"

**Solution 3:** Check node logs
Look for these messages in the node terminal:
```
[FILTER] Created new block filter 0x... at height ...
[FILTER] 0x... returned X new blocks (from ... to ...)
```

### Problem: Filter test fails

**Check RPC connection:**
```powershell
curl -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}'
```

**Check if blocks are being produced:**
Node should log every 5 seconds:
```
[Slot X] 👑 Producing block as leader...
✅ Block X produced successfully (Y txs)
```

### Problem: Transactions show but with wrong details

**Check transaction indexing:**
The node should log when transactions are indexed:
```
[FAUCET] Distributed 10 DNR to 0x... (Verified & Indexed)
```

## Understanding the Logs

### When MetaMask connects:
```
[FILTER] Created new block filter 0xabc123 at height 100
```

### When MetaMask polls (every ~4 seconds):
```
[FILTER] 0xabc123 returned 2 new blocks (from 101 to 102)
```

### When no new blocks:
```
(No log - filter returns empty array silently)
```

### When transaction is sent:
```
[RPC] Method: eth_sendRawTransaction -> OK
[MEMPOOL] Added tx 0x1234abcd from kn:0x...
```

### When block is produced with transaction:
```
[Slot 123] 👑 Producing block as leader...
✅ Block 123 produced successfully (1 txs)
```

## Verification Checklist

Before declaring success, verify:

- [ ] Node starts without errors
- [ ] MetaMask connects successfully
- [ ] Balance is displayed correctly
- [ ] Can send transactions (outgoing)
- [ ] Sent transactions appear in Activity tab
- [ ] Can receive transactions (incoming)
- [ ] **Received transactions appear in Activity tab** ← THE FIX!
- [ ] Transaction details are accurate
- [ ] Timestamps are correct
- [ ] Filter test script passes

## Technical Details

### What Changed

**File:** `kortana-blockchain-rust/src/rpc/mod.rs`

**Changes:**
1. Added `BlockFilter` struct to track filter state
2. Added `filters: FilterMap` to `RpcHandler`
3. Implemented stateful `eth_newBlockFilter`
4. Implemented stateful `eth_getFilterChanges`

### How It Works

```
MetaMask                    Kortana Node
   |                             |
   |--eth_newBlockFilter-------->|
   |<-------0xabc123-------------|  (Creates filter at block 100)
   |                             |
   |--eth_getFilterChanges------>|
   |<----------[]----------------|  (No new blocks)
   |                             |
   (wait 4 seconds)              |  (Block 101 produced)
   |                             |
   |--eth_getFilterChanges------>|
   |<----[0xblock101hash]--------|  (Returns new block!)
   |                             |
   |--eth_getBlockByHash-------->|
   |<----{block with txs}--------|
   |                             |
   (Examines transactions)       |
   (Shows in Activity tab!)      |
```

## Success Criteria

✅ **The fix is working if:**
- Incoming transactions appear in MetaMask Activity tab
- Outgoing transactions appear in MetaMask Activity tab
- Transaction details are accurate
- Real-time updates work (no need to refresh)

❌ **The fix is NOT working if:**
- Only outgoing transactions appear
- Need to refresh MetaMask to see transactions
- Transactions appear but with wrong details
- Activity tab is empty despite transactions occurring

## Next Steps After Verification

1. **Document the fix** ✅ (Already done in METAMASK_ACTIVITY_FIX.md)
2. **Update README** with MetaMask compatibility notes
3. **Create user guide** for connecting MetaMask
4. **Test with other wallets** (Trust Wallet, Rainbow, etc.)
5. **Monitor production** for any edge cases

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the node logs for errors
3. Run the test script to isolate the problem
4. Check MetaMask console logs (F12 in browser)

---

**Last Updated:** 2026-02-03
**Status:** ✅ Fixed and Ready for Testing
