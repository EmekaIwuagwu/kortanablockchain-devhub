// File: src/types/block.rs

use serde::{Serialize, Deserialize};
use sha3::{Digest, Keccak256};
use crate::address::Address;
use crate::types::transaction::Transaction;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockHeader {
    pub version: u32,
    pub height: u64,
    pub slot: u64,
    pub timestamp: u64,
    pub parent_hash: [u8; 32],
    pub state_root: [u8; 32],
    pub transactions_root: [u8; 32],
    pub receipts_root: [u8; 32],
    pub poh_hash: [u8; 32],
    pub poh_sequence: u64,
    pub proposer: Address,
    pub gas_used: u64,
    pub gas_limit: u64,
    pub base_fee: u128,
    pub vrf_output: [u8; 32],
}

impl BlockHeader {
    pub fn hash(&self) -> [u8; 32] {
        let mut hasher = Keccak256::new();
        hasher.update(self.version.to_be_bytes());
        hasher.update(self.height.to_be_bytes());
        hasher.update(self.slot.to_be_bytes());
        hasher.update(self.timestamp.to_be_bytes());
        hasher.update(self.parent_hash);
        hasher.update(self.state_root);
        hasher.update(self.transactions_root);
        hasher.update(self.receipts_root);
        hasher.update(self.poh_hash);
        hasher.update(self.poh_sequence.to_be_bytes());
        hasher.update(self.proposer.to_bytes());
        hasher.update(self.gas_used.to_be_bytes());
        hasher.update(self.gas_limit.to_be_bytes());
        hasher.update(self.base_fee.to_be_bytes());
        hasher.update(self.vrf_output);
        hasher.finalize().into()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    pub header: BlockHeader,
    pub transactions: Vec<Transaction>,
    pub signature: Vec<u8>,
}

impl Block {
    pub fn new(header: BlockHeader, transactions: Vec<Transaction>) -> Self {
        Self {
            header,
            transactions,
            signature: Vec::new(),
        }
    }

    pub fn sign(&mut self, private_key: &[u8]) {
        let hash = self.header.hash();
        self.signature = crate::crypto::sign_message(private_key, &hash);
    }

    pub fn verify(&self, public_key: &[u8]) -> bool {
        let hash = self.header.hash();
        crate::crypto::verify_signature(public_key, &hash, &self.signature)
    }

    pub fn calculate_tx_root(txs: &[Transaction]) -> [u8; 32] {
        let tx_hashes: Vec<[u8; 32]> = txs.iter().map(|tx| tx.hash()).collect();
        Self::compute_merkle_root(&tx_hashes)
    }

    pub fn calculate_merkle_roots(txs: &[Transaction], receipts: &[crate::types::transaction::TransactionReceipt]) -> ([u8; 32], [u8; 32]) {
        let tx_hashes: Vec<[u8; 32]> = txs.iter().map(|tx| tx.hash()).collect();
        let receipt_hashes: Vec<[u8; 32]> = receipts.iter().map(|r| r.tx_hash).collect(); // Simplified receipt hash
        
        (
            Self::compute_merkle_root(&tx_hashes),
            Self::compute_merkle_root(&receipt_hashes)
        )
    }

    fn compute_merkle_root(hashes: &[[u8; 32]]) -> [u8; 32] {
        if hashes.is_empty() { return [0u8; 32]; }
        if hashes.len() == 1 { return hashes[0]; }
        
        let mut current_level = hashes.to_vec();
        while current_level.len() > 1 {
            let mut next_level = Vec::new();
            for i in (0..current_level.len()).step_by(2) {
                let left = current_level[i];
                let right = if i + 1 < current_level.len() {
                    current_level[i + 1]
                } else {
                    left
                };
                let mut hasher = Keccak256::new();
                hasher.update(left);
                hasher.update(right);
                next_level.push(hasher.finalize().into());
            }
            current_level = next_level;
        }
        current_level[0]
    }
}
