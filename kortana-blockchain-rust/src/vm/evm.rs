// File: src/vm/evm.rs

use serde::{Serialize, Deserialize};
use sha3::{Digest, Keccak256};

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
    pub logs: Vec<crate::types::transaction::TransactionLog>,
}

impl EvmExecutor {
    pub fn new(address: crate::address::Address, gas_limit: u64) -> Self {
        Self {
            stack: EvmStack::new(),
            memory: EvmMemory::new(),
            gas_remaining: gas_limit,
            address,
            logs: Vec::new(),
        }
    }

    pub fn execute(&mut self, bytecode: &[u8], state: &mut crate::state::account::State, header: &crate::types::block::BlockHeader) -> Result<(), EvmError> {
        let mut pc = 0;
        let mut _return_data = Vec::new();

        while pc < bytecode.len() {
            let opcode = bytecode[pc];
            pc += 1;

            match opcode {
                0x00 => break, // STOP
                // Arithmetic
                0x01 => { let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::add_u256(a, b))?; }
                0x02 => { let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::mul_u256(a, b))?; }
                0x03 => { let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::sub_u256(a, b))?; }
                
                // Logic
                0x10 => { let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::u256_bool(a < b))?; }
                0x11 => { let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::u256_bool(a > b))?; }
                0x14 => { let (a, b) = (self.stack.pop()?, self.stack.pop()?); self.stack.push(Self::u256_bool(a == b))?; }
                0x15 => { let a = self.stack.pop()?; self.stack.push(Self::u256_bool(a == [0u8; 32]))?; }
                0x16 => { let (a, b) = (self.stack.pop()?, self.stack.pop()?); let mut r = [0u8; 32]; for i in 0..32 { r[i] = a[i] & b[i]; } self.stack.push(r)?; }
                0x17 => { let (a, b) = (self.stack.pop()?, self.stack.pop()?); let mut r = [0u8; 32]; for i in 0..32 { r[i] = a[i] | b[i]; } self.stack.push(r)?; }
                
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
                0x30 => { self.stack.push(self.address.as_evm_address_u256())?; } // ADDRESS
                0x31 => { // BALANCE (Stub)
                     let _addr_bytes = self.stack.pop()?;
                     self.stack.push([0u8;32])?;
                }
                0x33 => { self.stack.push(crate::address::Address::ZERO.as_evm_address_u256())?; }

                // Block
                0x42 => { self.stack.push(Self::u128_to_u256(header.timestamp as u128))?; }
                0x43 => { self.stack.push(Self::u128_to_u256(header.height as u128))?; }
                
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
                0x50 => { self.stack.pop()?; } // POP
                0x51 => { // MLOAD
                    let off = Self::u256_to_usize(self.stack.pop()?)?;
                    let data = self.memory.load(off, 32)?;
                    self.stack.push(Self::bytes_to_u256(&data))?;
                }
                0x52 => { // MSTORE
                    let off = Self::u256_to_usize(self.stack.pop()?)?;
                    let val = self.stack.pop()?;
                    self.memory.store(off, &val);
                }
                0x60..=0x7F => { // PUSH
                    let len = (opcode - 0x5F) as usize;
                    let mut val = [0u8; 32];
                    let end = std::cmp::min(pc + len, bytecode.len());
                    val[32 - (end - pc)..].copy_from_slice(&bytecode[pc..end]);
                    pc += len;
                    self.stack.push(val)?;
                }
                0x80..=0x8F => { // DUP
                    let dl = (opcode - 0x7F) as usize;
                    let val = self.stack.peek(dl - 1)?;
                    self.stack.push(val)?;
                }
                0x90..=0x9F => { // SWAP (stub)
                    let _sl = (opcode - 0x8F) as usize;
                    // TODO: impl swap
                }

                // Logging
                0xA0..=0xA4 => { // LOG
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
                0xF0 => { // CREATE
                    self.consume_gas(32000)?;
                    let _val = self.stack.pop()?;
                    let off = Self::u256_to_usize(self.stack.pop()?)?;
                    let len = Self::u256_to_usize(self.stack.pop()?)?;
                    let _init_code = self.memory.load(off, len)?;
                     self.stack.push([0u8; 32])?;
                }
                0xF1 => { // CALL
                     self.consume_gas(700)?;
                     for _ in 0..7 { self.stack.pop()?; } 
                     self.stack.push(Self::u256_bool(true))?;
                }
                0xF3 => { // RETURN
                    let off = Self::u256_to_usize(self.stack.pop()?)?;
                    let len = Self::u256_to_usize(self.stack.pop()?)?;
                    _return_data = self.memory.load(off, len)?;
                    break;
                }
                0xFD => return Err(EvmError::Revert),
                _ => return Err(EvmError::InvalidOpcode),
            }
        }
        Ok(())
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
        // Simplified multiplication (lower 128-bit only for MVP)
        // Production would use full big-int logic
        let a_val = Self::u256_to_u128(a);
        let b_val = Self::u256_to_u128(b);
        let prod = a_val.wrapping_mul(b_val);
        Self::u128_to_u256(prod)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evm_add() {
        let mut executor = EvmExecutor::new(100);
        // PUSH1 0x01, PUSH1 0x02, ADD, STOP
        let bytecode = vec![0x60, 0x01, 0x60, 0x02, 0x01, 0x00];
        executor.execute(&bytecode).unwrap();
        let result = executor.stack.pop().unwrap();
        assert_eq!(result[31], 0x03);
    }
}
