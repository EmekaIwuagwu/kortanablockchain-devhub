// File: src/address.rs

use sha3::{Digest, Keccak256, Sha3_256};
use std::fmt;
use serde::{Serialize, Deserialize};
use hex;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Address([u8; 24]);

impl Address {
    pub const ZERO: Address = Address([0u8; 24]);

    pub fn from_pubkey(pubkey: &[u8]) -> Self {
        let mut hasher = Sha3_256::new();
        hasher.update(pubkey);
        let result = hasher.finalize();
        
        // Take the first 20 bytes for the core address
        let mut addr_bytes = [0u8; 24];
        addr_bytes[0..20].copy_from_slice(&result[0..20]);
        
        // Calculate 4-byte checksum
        let checksum = Self::calculate_checksum(&addr_bytes[0..20]);
        addr_bytes[20..24].copy_from_slice(&checksum);
        
        Address(addr_bytes)
    }

    pub fn from_bytes(bytes: [u8; 24]) -> Result<Self, &'static str> {
        // Special case: All-zero address is valid (used for contract deployment)
        if bytes == [0u8; 24] {
            return Ok(Address(bytes));
        }
        
        let checksum = Self::calculate_checksum(&bytes[0..20]);
        if bytes[20..24] != checksum {
            return Err("Invalid checksum");
        }
        Ok(Address(bytes))
    }

    pub fn to_bytes(&self) -> [u8; 24] {
        self.0
    }

    pub fn as_evm_address(&self) -> [u8; 20] {
        let mut evm_addr = [0u8; 20];
        evm_addr.copy_from_slice(&self.0[0..20]);
        evm_addr
    }

    pub fn as_evm_address_u256(&self) -> [u8; 32] {
        let mut padded = [0u8; 32];
        padded[12..32].copy_from_slice(&self.0[0..20]);
        padded
    }

    pub fn from_evm_address(addr: [u8; 20]) -> Self {
        let mut addr_bytes = [0u8; 24];
        addr_bytes[0..20].copy_from_slice(&addr);
        let checksum = Self::calculate_checksum(&addr);
        addr_bytes[20..24].copy_from_slice(&checksum);
        Address(addr_bytes)
    }

    pub fn is_contract(&self) -> bool {
        // High bit of byte 0 as flag? (Specification mentioned contract flag)
        // Let's use a specific byte or bit as protocol convention
        // For simplicity, let's say if it starts with 0xFF it's a special system addr
        self.0[0] == 0xFF
    }

    fn calculate_checksum(core: &[u8]) -> [u8; 4] {
        let mut hasher = Keccak256::new();
        hasher.update(core);
        let result = hasher.finalize();
        let mut checksum = [0u8; 4];
        checksum.copy_from_slice(&result[0..4]);
        checksum
    }

    pub fn from_hex(s: &str) -> Result<Self, &'static str> {
        // Handle "kn:0x", "kn:", "0x", or raw hex
        let s = s.strip_prefix("kn:").unwrap_or(s);
        let s = s.strip_prefix("kn").unwrap_or(s);
        let s = s.strip_prefix("0x").unwrap_or(s);
        
        let bytes = hex::decode(s).map_err(|_| "Invalid hex")?;
        
        match bytes.len() {
            20 => {
                // MetaMask format: 20 bytes. Convert to 24 by adding checksum.
                let mut addr_bytes = [0u8; 20];
                addr_bytes.copy_from_slice(&bytes);
                Ok(Self::from_evm_address(addr_bytes))
            },
            24 => {
                // Full Kortana format: 24 bytes (includes checksum)
                let mut addr_bytes = [0u8; 24];
                addr_bytes.copy_from_slice(&bytes);
                Self::from_bytes(addr_bytes)
            },
            _ => Err("Invalid address length. Expected 20 or 24 bytes (40 or 48 hex chars).")
        }
    }

    pub fn to_hex(&self) -> String {
        format!("kn:0x{}", hex::encode(self.0))
    }

    pub fn distance(&self, other: &Address) -> [u8; 24] {
        let mut dist = [0u8; 24];
        for i in 0..24 {
            dist[i] = self.0[i] ^ other.0[i];
        }
        dist
    }
}

impl fmt::Display for Address {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_hex())
    }
}

impl fmt::Debug for Address {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Address({})", self.to_hex())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_address_derivation() {
        let pubkey = b"test_pubkey";
        let addr = Address::from_pubkey(pubkey);
        assert_eq!(addr.0.len(), 24);
        
        let hex_addr = addr.to_hex();
        let decoded = Address::from_hex(&hex_addr).unwrap();
        assert_eq!(addr, decoded);
    }

    #[test]
    fn test_invalid_checksum() {
        let mut bytes = [0u8; 24];
        bytes[0] = 1;
        // Checksum remains 0, which is likely wrong
        assert!(Address::from_bytes(bytes).is_err());
    }

    #[test]
    fn test_evm_compatibility() {
        let addr = Address::from_pubkey(b"test");
        let evm_addr = addr.as_evm_address();
        assert_eq!(evm_addr.len(), 20);
    }
}
