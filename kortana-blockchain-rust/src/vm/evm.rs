// File: src/vm/evm.rs

use serde::{Serialize, Deserialize};
use sha3::{Digest, Keccak256};
use crate::parameters::CHAIN_ID;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EvmError {
    StackOverflow,
    StackUnderflow,
    OutOfGas,
    InvalidOpcode,
    InvalidMemoryAccess,
    Revert,
}

pub struct EvmStack {
    data: Vec<[u8; 32]>,
}

impl EvmStack {
    pub fn new() -> Self {
        Self { data: Vec::with_capacity(1024) }
    }

    pub fn push(&mut self, val: [u8; 32]) -> Result<(), EvmError> {
        if self.data.len() >= 1024 {
            return Err(EvmError::StackOverflow);
        }
        self.data.push(val);
        Ok(())
    }

    pub fn pop(&mut self) -> Result<[u8; 32], EvmError> {
        self.data.pop().ok_or(EvmError::StackUnderflow)
    }

    pub fn peek(&self, n: usize) -> Result<[u8; 32], EvmError> {
        if n >= self.data.len() {
            return Err(EvmError::StackUnderflow);
        }
        Ok(self.data[self.data.len() - 1 - n])
    }
}

pub struct EvmMemory {
    data: Vec<u8>,
}

impl EvmMemory {
    pub fn new() -> Self {
        Self { data: Vec::new() }
    }

    pub fn store(&mut self, offset: usize, value: &[u8]) {
        if offset + value.len() > self.data.len() {
            self.data.resize(offset + value.len(), 0);
        }
        self.data[offset..offset + value.len()].copy_from_slice(value);
    }

    pub fn load(&self, offset: usize, size: usize) -> Result<Vec<u8>, EvmError> {
        if offset + size > self.data.len() {
            return Err(EvmError::InvalidMemoryAccess);
        }
        Ok(self.data[offset..offset + size].to_vec())
    }
}

pub struct EvmExecutor {
    pub stack: EvmStack,
    pub memory: EvmMemory,
    pub gas_remaining: u64,
    pub address: crate::address::Address,
    pub calldata: Vec<u8>,
    pub logs: Vec<crate::types::transaction::TransactionLog>,
}

impl EvmExecutor {
    pub fn new(address: crate::address::Address, gas_limit: u64) -> Self {
        Self {
            stack: EvmStack::new(),
            memory: EvmMemory::new(),
            gas_remaining: gas_limit,
            address,
            calldata: Vec::new(),
            logs: Vec::new(),
        }
    }

    pub fn with_calldata(mut self, data: Vec<u8>) -> Self {
        self.calldata = data;
        self
    }

    pub fn execute(&mut self, bytecode: &[u8], state: &mut crate::state::account::State, header: &crate::types::block::BlockHeader) -> Result<Vec<u8>, EvmError> {
        let mut pc = 0;
        let mut _return_data = Vec::new();

        while pc < bytecode.len() {
            let opcode = bytecode[pc];
            pc += 1;

            match opcode {
                0x00 => break, // STOP
                // Arithmetic
                0x01 => { self.consume_gas(3)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::add_u256(a, b))?; }
                0x02 => { self.consume_gas(5)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::mul_u256(a, b))?; }
                0x03 => { self.consume_gas(3)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::sub_u256(a, b))?; }
                0x04 => { self.consume_gas(5)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::div_u256(a, b))?; }
                0x06 => { self.consume_gas(5)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::mod_u256(a, b))?; }
                0x08 => { self.consume_gas(10)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::exp_u256(a, b))?; }
                
                // Comparisons & Logic
                0x10 => { self.consume_gas(3)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::u256_bool(a < b))?; }
                0x11 => { self.consume_gas(3)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::u256_bool(a > b))?; }
                0x12 => { self.consume_gas(3)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::u256_bool(Self::u256_to_i256(a) < Self::u256_to_i256(b)))?; } // SLT
                0x14 => { self.consume_gas(3)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::u256_bool(a == b))?; }
                0x15 => { self.consume_gas(3)?; let a = self.stack.pop()?; self.stack.push(Self::u256_bool(a == [0u8; 32]))?; }
                0x16 => { self.consume_gas(3)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); let mut r = [0u8; 32]; for i in 0..32 { r[i] = a[i] & b[i]; } self.stack.push(r)?; }
                0x17 => { self.consume_gas(3)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); let mut r = [0u8; 32]; for i in 0..32 { r[i] = a[i] | b[i]; } self.stack.push(r)?; }
                0x18 => { self.consume_gas(3)?; let (a, b) = (self.stack.pop()?, self.stack.pop()?); let mut r = [0u8; 32]; for i in 0..32 { r[i] = a[i] ^ b[i]; } self.stack.push(r)?; }
                0x19 => { self.consume_gas(3)?; let a = self.stack.pop()?; let mut r = [0u8; 32]; for i in 0..32 { r[i] = !a[i]; } self.stack.push(r)?; }
                
                // Bitwise Shifting
                0x1B => { self.consume_gas(3)?; let (shift, val) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::shl_u256(shift, val))?; }
                0x1C => { self.consume_gas(3)?; let (shift, val) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::shr_u256(shift, val))?; }

                // SHA3
                0x20 => {
                    self.consume_gas(30)?;
                    let offset = Self::u256_to_usize(self.stack.pop()?)?;
                    let len = Self::u256_to_usize(self.stack.pop()?)?;
                    let data = self.memory.load(offset, len)?;
                    let mut hasher = Keccak256::new();
                    hasher.update(&data);
                    let result = hasher.finalize();
                    let mut res = [0u8; 32];
                    res.copy_from_slice(&result);
                    self.stack.push(res)?;
                }

                // Environment
                0x30 => { self.stack.push(self.address.as_evm_address_u256())?; }
                0x31 => { // BALANCE 
                     self.consume_gas(100)?; 
                     let addr_bytes = self.stack.pop()?;
                     let mut addr_buf = [0u8; 24];
                     addr_buf.copy_from_slice(&addr_bytes[8..32]);
                     if let Ok(addr) = crate::address::Address::from_bytes(addr_buf) {
                         let acc = state.get_account(&addr);
                         self.stack.push(Self::u128_to_u256(acc.balance))?;
                     } else {
                         self.stack.push([0u8; 32])?;
                     }
                }
                0x33 => { self.stack.push(crate::address::Address::ZERO.as_evm_address_u256())?; } // CALLER
                0x35 => { // CALLDATALOAD
                    self.consume_gas(3)?;
                    let offset = Self::u256_to_usize(self.stack.pop()?)?;
                    let mut data = [0u8; 32];
                    if offset < self.calldata.len() {
                        let end = std::cmp::min(offset + 32, self.calldata.len());
                        data[..end - offset].copy_from_slice(&self.calldata[offset..end]);
                    }
                    self.stack.push(data)?;
                }
                0x36 => { // CALLDATASIZE
                    self.consume_gas(2)?;
                    self.stack.push(Self::u128_to_u256(self.calldata.len() as u128))?;
                }

                // Block
                0x41 => { self.stack.push(Self::u128_to_u256(header.proposer.as_evm_address_u256()[31] as u128))?; } // COINBASE partial
                0x42 => { self.stack.push(Self::u128_to_u256(header.timestamp as u128))?; }
                0x43 => { self.stack.push(Self::u128_to_u256(header.height as u128))?; }
                0x44 => { self.stack.push(Self::u128_to_u256(header.gas_limit as u128))?; }
                0x45 => { self.stack.push(Self::u128_to_u256(CHAIN_ID as u128))?; }
                0x48 => { self.stack.push(Self::u128_to_u256(header.base_fee))?; }
                
                // Storage
                0x54 => { // SLOAD
                     self.consume_gas(100)?; 
                     let key = self.stack.pop()?;
                     let val = if let Some(storage) = state.storage.get(&self.address) {
                         *storage.get(&key).unwrap_or(&[0u8; 32])
                     } else {
                         [0u8; 32]
                     };
                     self.stack.push(val)?;
                }
                0x55 => { // SSTORE
                     self.consume_gas(20000)?; 
                     let key = self.stack.pop()?;
                     let val = self.stack.pop()?;
                     let storage = state.storage.entry(self.address).or_insert(std::collections::HashMap::new());
                     storage.insert(key, val);
                }

                // Flow
                0x56 => { // JUMP
                    let dest = Self::u256_to_usize(self.stack.pop()?)?;
                    if dest >= bytecode.len() || bytecode[dest] != 0x5B { return Err(EvmError::InvalidOpcode); }
                    pc = dest;
                }
                0x57 => { // JUMPI
                    let dest = Self::u256_to_usize(self.stack.pop()?)?;
                    let cond = self.stack.pop()?;
                    if cond != [0u8; 32] {
                        if dest >= bytecode.len() || bytecode[dest] != 0x5B { return Err(EvmError::InvalidOpcode); }
                        pc = dest;
                    }
                }
                0x5B => { /* JUMPDEST */ }

                // Stack / Memory
                0x50 => { self.consume_gas(2)?; self.stack.pop()?; } // POP
                0x51 => { // MLOAD
                    self.consume_gas(3)?;
                    let off = Self::u256_to_usize(self.stack.pop()?)?;
                    let data = self.memory.load(off, 32)?;
                    self.stack.push(Self::bytes_to_u256(&data))?;
                }
                0x52 => { // MSTORE
                    self.consume_gas(3)?;
                    let off = Self::u256_to_usize(self.stack.pop()?)?;
                    let val = self.stack.pop()?;
                    self.memory.store(off, &val);
                }
                0x60..=0x7F => { // PUSH1..32
                    let len = (opcode - 0x5F) as usize;
                    self.consume_gas(3)?;
                    let mut val = [0u8; 32];
                    let end = std::cmp::min(pc + len, bytecode.len());
                    val[32 - (end - pc)..].copy_from_slice(&bytecode[pc..end]);
                    pc += len;
                    self.stack.push(val)?;
                }
                0x80..=0x8F => { // DUP1..16
                    let n = (opcode - 0x7F) as usize;
                    self.consume_gas(3)?;
                    let val = self.stack.peek(n - 1)?;
                    self.stack.push(val)?;
                }
                0x90..=0x9F => { // SWAP1..16
                    let n = (opcode - 0x8F) as usize;
                    self.consume_gas(3)?;
                    let a = self.stack.pop()?;
                    let idx = self.stack.data.len() - n;
                    let b = self.stack.data[idx];
                    self.stack.data[idx] = a;
                    self.stack.push(b)?;
                }

                // Logging
                0xA0..=0xA4 => { // LOG0..4
                    let topic_count = (opcode - 0xA0) as usize;
                    self.consume_gas(375 + 8 * (topic_count as u64))?;
                    let offset = Self::u256_to_usize(self.stack.pop()?)?;
                    let length = Self::u256_to_usize(self.stack.pop()?)?;
                    let mut topics = Vec::new();
                    for _ in 0..topic_count { topics.push(self.stack.pop()?); }
                    let data = self.memory.load(offset, length)?;
                    self.logs.push(crate::types::transaction::TransactionLog { address: self.address.clone(), topics, data });
                }

                // System
                0xF0 => { // CREATE (Deploying local)
                    self.consume_gas(32000)?;
                    let _val = self.stack.pop()?;
                    let off = Self::u256_to_usize(self.stack.pop()?)?;
                    let len = Self::u256_to_usize(self.stack.pop()?)?;
                    let _init_code = self.memory.load(off, len)?;
                    // Simplified: just return success and a dummy address
                    self.stack.push([0u8; 32])?;
                }
                0xF3 => { // RETURN
                    let off = Self::u256_to_usize(self.stack.pop()?)?;
                    let len = Self::u256_to_usize(self.stack.pop()?)?;
                    _return_data = self.memory.load(off, len)?;
                    break;
                }
                0xFA => { // STATICCALL
                     self.consume_gas(100)?;
                     for _ in 0..6 { self.stack.pop()?; }
                     self.stack.push(Self::u256_bool(true))?;
                }
                0xFD => return Err(EvmError::Revert),
                _ => return Err(EvmError::InvalidOpcode),
            }
        }
        Ok(_return_data)
    }

    fn consume_gas(&mut self, amount: u64) -> Result<(), EvmError> {
        if self.gas_remaining < amount {
            return Err(EvmError::OutOfGas);
        }
        self.gas_remaining -= amount;
        Ok(())
    }

    fn add_u256(a: [u8; 32], b: [u8; 32]) -> [u8; 32] {
        let mut res = [0u8; 32];
        let mut carry = 0u16;
        for i in (0..32).rev() {
            let sum = a[i] as u16 + b[i] as u16 + carry;
            res[i] = (sum & 0xFF) as u8;
            carry = sum >> 8;
        }
        res
    }

    fn sub_u256(a: [u8; 32], b: [u8; 32]) -> [u8; 32] {
        let mut res = [0u8; 32];
        let mut borrow = 0i16;
        for i in (0..32).rev() {
            let diff = a[i] as i16 - b[i] as i16 - borrow;
            if diff < 0 {
                res[i] = (diff + 256) as u8;
                borrow = 1;
            } else {
                res[i] = diff as u8;
                borrow = 0;
            }
        }
        res
    }

    fn u256_to_usize(val: [u8; 32]) -> Result<usize, EvmError> {
        let mut bytes = [0u8; 8];
        bytes.copy_from_slice(&val[24..32]);
        Ok(u64::from_be_bytes(bytes) as usize)
    }

    fn u256_to_u128(val: [u8; 32]) -> u128 {
        let mut bytes = [0u8; 16];
        bytes.copy_from_slice(&val[16..32]);
        u128::from_be_bytes(bytes)
    }

    fn bytes_to_u256(bytes: &[u8]) -> [u8; 32] {
        let mut res = [0u8; 32];
        let len = std::cmp::min(bytes.len(), 32);
        res[32-len..].copy_from_slice(&bytes[..len]);
        res
    }

    fn u256_bool(val: bool) -> [u8; 32] {
        let mut res = [0u8; 32];
        if val { res[31] = 1; }
        res
    }

    fn u128_to_u256(val: u128) -> [u8; 32] {
        let mut res = [0u8; 32];
        res[16..32].copy_from_slice(&val.to_be_bytes());
        res
    }

    fn mul_u256(a: [u8; 32], b: [u8; 32]) -> [u8; 32] {
        let a_val = Self::u256_to_u128(a);
        let b_val = Self::u256_to_u128(b);
        Self::u128_to_u256(a_val.wrapping_mul(b_val))
    }

    fn div_u256(a: [u8; 32], b: [u8; 32]) -> [u8; 32] {
        let a_val = Self::u256_to_u128(a);
        let b_val = Self::u256_to_u128(b);
        if b_val == 0 { return [0u8; 32]; }
        Self::u128_to_u256(a_val / b_val)
    }

    fn mod_u256(a: [u8; 32], b: [u8; 32]) -> [u8; 32] {
        let a_val = Self::u256_to_u128(a);
        let b_val = Self::u256_to_u128(b);
        if b_val == 0 { return [0u8; 32]; }
        Self::u128_to_u256(a_val % b_val)
    }

    fn exp_u256(a: [u8; 32], b: [u8; 32]) -> [u8; 32] {
        let a_val = Self::u256_to_u128(a);
        let b_val = Self::u256_to_u128(b);
        Self::u128_to_u256(a_val.overflowing_pow(b_val as u32).0)
    }

    fn shl_u256(shift: [u8; 32], val: [u8; 32]) -> [u8; 32] {
        let s = Self::u256_to_u128(shift) as u32;
        if s >= 128 { return [0u8; 32]; }
        Self::u128_to_u256(Self::u256_to_u128(val) << s)
    }

    fn shr_u256(shift: [u8; 32], val: [u8; 32]) -> [u8; 32] {
        let s = Self::u256_to_u128(shift) as u32;
        if s >= 128 { return [0u8; 32]; }
        Self::u128_to_u256(Self::u256_to_u128(val) >> s)
    }

    fn u256_to_i256(val: [u8; 32]) -> i128 {
        Self::u256_to_u128(val) as i128
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::address::Address;
    use crate::state::account::State;
    use crate::types::block::BlockHeader;

    #[test]
    fn test_evm_add() {
        let addr = Address::from_pubkey(b"test");
        let mut executor = EvmExecutor::new(addr, 100000);
        let mut state = State::new();
        let header = BlockHeader {
            version: 1,
            height: 0,
            slot: 0,
            timestamp: 1234567890,
            parent_hash: [0u8; 32],
            state_root: [0u8; 32],
            transactions_root: [0u8; 32],
            receipts_root: [0u8; 32],
            poh_hash: [0u8; 32],
            poh_sequence: 0,
            proposer: Address::ZERO,
            gas_used: 0,
            gas_limit: 1000000,
            base_fee: 1,
            vrf_output: [0u8; 32],
        };
        
        // PUSH1 0x01, PUSH1 0x02, ADD, STOP
        let bytecode = vec![0x60, 0x01, 0x60, 0x02, 0x01, 0x00];
        executor.execute(&bytecode, &mut state, &header).unwrap();
        let result = executor.stack.pop().unwrap();
        assert_eq!(result[31], 0x03);
    }
}
