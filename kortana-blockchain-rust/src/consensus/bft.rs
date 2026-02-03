// File: src/consensus/bft.rs

use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use crate::address::Address;
use crate::consensus::ValidatorInfo;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinalityCommit {
    pub block_hash: [u8; 32],
    pub height: u64,
    pub round: u32,
    pub signatures: HashMap<Address, Vec<u8>>,
}

pub struct FinalityGadget {
    pub last_finalized_height: u64,
    pub last_finalized_hash: [u8; 32],
    pub pending_commits: HashMap<u64, FinalityCommit>,
}

impl Default for FinalityGadget {
    fn default() -> Self {
        Self::new()
    }
}

impl FinalityGadget {
    pub fn new() -> Self {
        Self {
            last_finalized_height: 0,
            last_finalized_hash: [0u8; 32],
            pending_commits: HashMap::new(),
        }
    }

    pub fn add_vote(&mut self, block_hash: [u8; 32], height: u64, round: u32, validator: Address, signature: Vec<u8>, validators: &[ValidatorInfo]) -> bool {
        // Verify validator exists
        if !validators.iter().any(|v| v.address == validator) {
            return false;
        }
        
        // Initialize commit state for this height if missing
        let commit = self.pending_commits.entry(height).or_insert(FinalityCommit {
            block_hash,
            height,
            round,
            signatures: HashMap::new(),
        });

        // Simple conflict check
        if commit.block_hash != block_hash || commit.round != round {
            return false;
        }

        // Add vote
        commit.signatures.insert(validator, signature);
        
        // Check for finality
        self.check_finality(height, validators)
    }

    fn check_finality(&mut self, height: u64, validators: &[ValidatorInfo]) -> bool {
         if let Some(commit) = self.pending_commits.get(&height) {
            let total_stake: u128 = validators.iter().filter(|v| v.is_active).map(|v| v.stake).sum();
            let mut committed_stake = 0u128;

            for v in validators {
                if commit.signatures.contains_key(&v.address) {
                    committed_stake += v.stake;
                }
            }

            if committed_stake * 3 > total_stake * 2 {
                self.last_finalized_height = commit.height;
                self.last_finalized_hash = commit.block_hash;
                return true;
            }
         }
         false
    }

    // Deprecated in favor of internal check, but kept for compatibility if needed (or removed)
    pub fn process_commit(&mut self, commit: &FinalityCommit, validators: &[ValidatorInfo]) -> bool {
         let total_stake: u128 = validators.iter().filter(|v| v.is_active).map(|v| v.stake).sum();
         let mut committed_stake = 0u128;

         for v in validators {
             if commit.signatures.contains_key(&v.address) {
                 committed_stake += v.stake;
             }
         }

         if committed_stake * 3 > total_stake * 2 {
             self.last_finalized_height = commit.height;
             self.last_finalized_hash = commit.block_hash;
             return true;
         }
         false
    }
}
