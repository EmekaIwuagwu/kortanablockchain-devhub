# Kortana Blockchain - Critical Fixes Implementation Plan

**Prepared by:** Senior Blockchain Engineer
**Date:** February 5, 2026
**Complexity:** Critical (8/10)

## Executive Summary

After conducting a comprehensive analysis of the Kortana Layer 1 blockchain codebase, I have identified the root causes of all three critical issues and prepared detailed fixes. This document outlines the problems, root causes, and implementation strategies.

---

## Issue #1: Transaction Activity - Missing Inflow Transactions in MetaMask

### **Root Cause Analysis**

The issue lies in how transactions are indexed in the storage layer. Currently:

1. **Transaction indexing only occurs for the sender (`from` address)** - Line 431 in `rpc/mod.rs` shows only one index entry:
   ```rust
   let _ = self.storage.put_index(\u0026faucet_addr, faucet_tx.hash());
   ```

2. **MetaMask polls `eth_getBlockFilterChanges` to detect new blocks**, then fetches transactions for those blocks, but the backend doesn't properly identify which transactions are **inbound** vs **outbound** for a given address.

3. **The `eth_getAddressHistory` method** (lines 485-513) only retrieves transactions indexed to that address, which currently only includes **sent (outflow)** transactions.

### **Solution: Dual-Index System**

We need to index transactions for BOTH sender and recipient addresses. This requires:

**Fix Location:** `kortana-blockchain-rust/src/main.rs` - Block production loop (around line 370-380)

**Current Code:**
```rust
let _ = node.storage.put_index(\u0026tx.from, tx.hash());
```

**Fixed Code:**
```rust
// Index for sender (outflow)
let _ = node.storage.put_index(\u0026tx.from, tx.hash());
// Index for recipient (inflow) - CRITICAL FIX
let _ = node.storage.put_index(\u0026tx.to, tx.hash());
```

**Also fix in:** `rpc/mod.rs` at line 431 for faucet transactions

---

## Issue #2: Smart Contract Deployment Reverting

### **Root Cause Analysis**

The contract deployment is failing due to multiple critical bugs in the EVM executor:

1. **Missing CALLER opcode context** - Line 169 in `vm/evm.rs`:
   ```rust
   0x33 => { self.stack.push(crate::address::Address::ZERO.as_evm_address_u256())?; } // CALLER
   ```
   **Problem:** Always pushes ZERO address instead of the actual transaction sender (msg.sender)

2. **Missing CALLVALUE opcode** - Required by most Solidity contracts to check `msg.value`
   
3. **Insufficient gas for contract creation** - Line 107 in `processor.rs`:
   ```rust
   let mut executor = EvmExecutor::new(contract_addr, tx.gas_limit);
   ```
   **Problem:** Uses raw gas_limit without accounting for intrinsic gas already consumed

4. **Value transfer timing issue** - Lines 186-190 in `processor.rs`:
   ```rust
   if status == 1 && tx.value > 0 && !is_staking {
       let mut recipient = self.state.get_account(&tx.to);
       recipient.balance += tx.value;
   ```
   **Problem:** For contract deployment, this tries to transfer to `tx.to` (which is 0x0), but the value should be transferred to the newly created contract address

### **Solution: Multi-Part Fix**

#### **Part A: Fix EVM Executor Context (vm/evm.rs)**

Add transaction context to executor:

```rust
pub struct EvmExecutor {
    // ... existing fields
    pub caller: crate::address::Address,  // NEW
    pub callvalue: u128,  // NEW
}
```

Fix CALLER opcode (line 169):
```rust
0x33 => { self.stack.push(self.caller.as_evm_address_u256())?; }
```

Add CALLVALUE opcode (0x34 - currently missing):
```rust
0x34 => { self.stack.push(Self::u128_to_u256(self.callvalue))?; }
```

#### **Part B: Fix Contract Deployment Logic (processor.rs)**

```rust
if is_deployment {
    let contract_addr = Address::derive_contract_address(&tx.from, tx.nonce - 1);
    
    // Create contract account FIRST with value
    let mut contract_acc = self.state.get_account(&contract_addr);
    if tx.value > 0 {
        contract_acc.balance += tx.value;  // Transfer value to contract
    }
    contract_acc.is_contract = true;
    
    // Execute with proper context
    let mut executor = EvmExecutor::new(contract_addr, tx.gas_limit);
    executor.caller = tx.from;  // FIX: Set actual caller
    executor.callvalue = tx.value;  // FIX: Set msg.value
    
    match executor.execute(&tx.data, self.state, header) {
        Ok(runtime_code) => {
            // ... rest of deployment logic
        }
    }
}
```

#### **Part C: Remove Duplicate Value Transfer**

**Delete lines 186-190** since value transfer is now handled correctly in the deployment/call logic

---

## Issue #3: Explorer Database Clearing Not Removing Transactions

### **Root Cause Analysis**

The Sled database used by the node doesn't have a "clear all" method being called from the explorer. The explorer is likely calling a custom RPC endpoint or deleting the database folder, which removes:

- `block:*` entries (blocks)
- `blockhash:*` entries (block hashes)

But **NOT:**
- `tx:*` entries (transactions)
- `txloc:*` entries (transaction locations)
- `addr_txs:*` entries (address indices)
- `receipt:*` entries (transaction receipts)
- `global_txs` entry (global transaction list)

### **Solution: Add Database Clear Method**

**Step 1:** Add clear method to Storage (storage/mod.rs):

```rust
pub fn clear_all_data(&self) -> Result<(), String> {
    // Clear blocks
    for key in self.db.scan_prefix("block:") {
        if let Ok((k, _)) = key {
            self.db.remove(k).map_err(|e| e.to_string())?;
        }
    }
    
    // Clear block hashes
    for key in self.db.scan_prefix("blockhash:") {
        if let Ok((k, _)) = key {
            self.db.remove(k).map_err(|e| e.to_string())?;
        }
    }
    
    // Clear transactions
    for key in self.db.scan_prefix("tx:") {
        if let Ok((k, _)) = key {
            self.db.remove(k).map_err(|e| e.to_string())?;
        }
    }
    
    // Clear transaction locations
    for key in self.db.scan_prefix("txloc:") {
        if let Ok((k, _)) = key {
            self.db.remove(k).map_err(|e| e.to_string())?;
        }
    }
    
    // Clear receipts
    for key in self.db.scan_prefix("receipt:") {
        if let Ok((k, _)) = key {
            self.db.remove(k).map_err(|e| e.to_string())?;
        }
    }
    
    // Clear address indices
    for key in self.db.scan_prefix("addr_txs:") {
        if let Ok((k, _)) = key {
            self.db.remove(k).map_err(|e| e.to_string())?;
        }
    }
    
    // Clear global transactions
    self.db.remove("global_txs").map_err(|e| e.to_string())?;
    
    // Clear state roots
    for key in self.db.scan_prefix("stateroot:") {
        if let Ok((k, _)) = key {
            self.db.remove(k).map_err(|e| e.to_string())?;
        }
    }
    
    // Clear states
    for key in self.db.scan_prefix("state:") {
        if let Ok((k, _)) = key {
            self.db.remove(k).map_err(|e| e.to_string())?;
        }
    }
    
    self.db.remove("latest_state_height").map_err(|e| e.to_string())?;
    
    self.db.flush().map_err(|e| e.to_string())?;
    Ok(())
}
```

**Step 2:** Add RPC endpoint (rpc/mod.rs):

```rust
"eth_clearDatabase" => {
    // SECURITY: Only allow in development/testing
    #[cfg(debug_assertions)]
    {
        match self.storage.clear_all_data() {
            Ok(_) => Some(serde_json::json!({"success": true})),
            Err(e) => Some(serde_json::json!({"success": false, "error": e}))
        }
    }
    #[cfg(not(debug_assertions))]
    {
        Some(serde_json::json!({"success": false, "error": "Not available in production"}))
    }
}
```

---

## Implementation Order

### **Phase 1: Critical Fixes (Priority: IMMEDIATE)**

1. **Fix #1: Transaction Indexing** (15 minutes)
   - Edit `main.rs` line ~376
   - Edit `rpc/mod.rs` line ~431
   - Test with token transfer

2. **Fix #2: Contract Deployment** (45 minutes)
   - Edit `vm/evm.rs` - Add fields, fix opcodes
   - Edit `core/processor.rs` - Fix deployment logic
   - Test with simple contract deployment

### **Phase 2: Database Management (Priority: HIGH)**

3. **Fix #3: Database Clearing** (20 minutes)
   - Add `clear_all_data()` to `storage/mod.rs`
   - Add RPC endpoint to `rpc/mod.rs`
   - Test database clear and verify

---

## Testing Strategy

### **Test #1: Transaction Inflow**
```bash
# Send tokens TO an address
# Check MetaMask activity tab
# Verify both inflow and outflow appear
```

### **Test #2: Contract Deployment**
```solidity
// Deploy simple contract
contract SimpleStorage {
    uint256 public value;
    constructor(uint256 _value) payable {
        value = _value;
    }
}
```

### **Test #3: Database Clear**
```bash
# Deploy contract, send transactions
# Call eth_clearDatabase
# Verify all data cleared, not just blocks
```

---

## Risk Assessment

| Issue | Risk if Unfixed | User Impact |
|-------|-----------------|-------------|
| #1 - Missing Inflow | **CRITICAL** | Users cannot see received payments in MetaMask |
| #2 - Contract Deployment | **CRITICAL** | Cannot deploy any smart contracts |
| #3 - Database Clearing | **MEDIUM** | Testing/development inconvenience |

---

## Success Criteria

✅ MetaMask shows both incoming and outgoing transactions
✅ Smart contracts deploy successfully and return contract address
✅ Database clear removes ALL data, not just blocks

---

This plan addresses fundamental architectural issues in the blockchain that prevent core functionality. All fixes are backward-compatible and don't require state migration.
