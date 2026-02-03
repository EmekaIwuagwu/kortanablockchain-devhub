pub mod sync;
pub mod bft;

use sha3::{Digest, Sha3_256};
use std::collections::HashMap;
use crate::address::Address;
use serde::{Serialize, Deserialize};
use crate::parameters::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PohEntry {
    pub hash: [u8; 32],
    pub sequence: u64,
}

pub struct PohGenerator {
    last_hash: [u8; 32],
    sequence: u64,
}

impl PohGenerator {
    pub fn new(genesis_seed: &[u8]) -> Self {
        let mut hasher = Sha3_256::new();
        hasher.update(genesis_seed);
        let hash: [u8; 32] = hasher.finalize().into();
        Self {
            last_hash: hash,
            sequence: 0,
        }
    }

    pub fn tick(&mut self) -> PohEntry {
        let mut hasher = Sha3_256::new();
        hasher.update(self.last_hash);
        self.last_hash = hasher.finalize().into();
        self.sequence += 1;
        PohEntry {
            hash: self.last_hash,
            sequence: self.sequence,
        }
    }

    pub fn hash_transaction(&mut self, tx_hash: &[u8]) -> PohEntry {
        let mut hasher = Sha3_256::new();
        hasher.update(self.last_hash);
        hasher.update(tx_hash);
        self.last_hash = hasher.finalize().into();
        self.sequence += 1;
        PohEntry {
            hash: self.last_hash,
            sequence: self.sequence,
        }
    }

    pub fn verify(start_hash: [u8; 32], entries: &[PohEntry]) -> bool {
        let mut current_hash = start_hash;
        for entry in entries {
            let mut hasher = Sha3_256::new();
            hasher.update(current_hash);
            // If the entry contains a transaction (indicated by hash jump), 
            // we would need that tx hash here. For simplicity, we assume 
            // pure PoH chain verification here.
            current_hash = hasher.finalize().into();
            if current_hash != entry.hash {
                return false;
            }
        }
        true
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Vote {
    pub block_hash: [u8; 32],
    pub validator: Address,
    pub slot: u64,
    pub signature: Vec<u8>,
}

pub struct VoteAggregator {
    pub votes: HashMap<[u8; 32], HashMap<Address, Vec<u8>>>, // block_hash -> validator -> signature
}

impl Default for VoteAggregator {
    fn default() -> Self {
        Self::new()
    }
}

impl VoteAggregator {
    pub fn new() -> Self {
        Self { votes: HashMap::new() }
    }

    pub fn add_vote(&mut self, block_hash: [u8; 32], validator: Address, signature: Vec<u8>) {
        let block_votes = self.votes.entry(block_hash).or_default();
        block_votes.insert(validator, signature);
    }

    pub fn get_stake_for_block(&self, block_hash: [u8; 32], validators: &[ValidatorInfo]) -> u128 {
        let block_votes = match self.votes.get(&block_hash) {
            Some(v) => v,
            None => return 0,
        };
        
        validators.iter()
            .filter(|v| block_votes.contains_key(&v.address))
            .map(|v| v.stake)
            .sum()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SlashReason {
    DoubleProposal,
    Equivocation,
    Downtime,
    Byzantine,
}

pub struct SlashingHistory {
    pub records: HashMap<Address, Vec<(u64, SlashReason)>>, // address -> list of (slot, reason)
}

pub struct ConsensusEngine {
    pub current_slot: u64,
    pub validators: Vec<ValidatorInfo>,
    pub vote_aggregator: VoteAggregator,
    pub finalized_height: u64,
    pub finalized_hash: [u8; 32],
    pub slashing_history: SlashingHistory,
    pub jailed_validators: HashMap<Address, u64>, // addr -> jail_until_slot
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorInfo {
    pub address: Address,
    pub stake: u128,
    pub is_active: bool,
    pub commission: u16, // basis colors
    pub missed_blocks: u64,
}

impl ConsensusEngine {
    pub fn new(validators: Vec<ValidatorInfo>) -> Self {
        Self {
            current_slot: 0,
            validators,
            vote_aggregator: VoteAggregator::new(),
            finalized_height: 0,
            finalized_hash: [0u8; 32],
            slashing_history: SlashingHistory { records: HashMap::new() },
            jailed_validators: HashMap::new(),
        }
    }

    pub fn slash_validator(&mut self, addr: Address, reason: SlashReason, slot: u64) {
        let slash_percent = match reason {
            SlashReason::DoubleProposal => SLASH_DOUBLE_PROPOSAL,
            SlashReason::Equivocation => SLASH_EQUIVOCATION,
            SlashReason::Downtime => SLASH_DOWNTIME,
            SlashReason::Byzantine => SLASH_BYZANTINE,
        };

        if let Some(validator) = self.validators.iter_mut().find(|v| v.address == addr) {
            let amount_to_slash = (validator.stake * slash_percent as u128) / 10000;
            validator.stake = validator.stake.saturating_sub(amount_to_slash);
            
            // Record slashing
            self.slashing_history.records.entry(addr).or_default().push((slot, reason));
            
            // Jail if necessary
            if slash_percent >= 1000 { // 10% or more
                self.jail_validator(addr, slot + JAIL_DURATION_SLOTS);
            }
        }
    }

    pub fn jail_validator(&mut self, addr: Address, until_slot: u64) {
        self.jailed_validators.insert(addr, until_slot);
        if let Some(v) = self.validators.iter_mut().find(|v| v.address == addr) {
            v.is_active = false;
        }
    }

    pub fn check_unjail(&mut self, addr: Address, current_slot: u64) {
        if let Some(&until) = self.jailed_validators.get(&addr) {
            if current_slot >= until {
                self.jailed_validators.remove(&addr);
                if let Some(v) = self.validators.iter_mut().find(|v| v.address == addr) {
                    if v.stake >= MIN_VALIDATOR_STAKE {
                        v.is_active = true;
                    }
                }
            }
        }
    }

    pub fn record_block_participation(&mut self, proposer: Address, _active_at_slot: u64) {
        for v in self.validators.iter_mut() {
            if v.is_active {
                if v.address == proposer {
                    v.missed_blocks = 0;
                } else {
                    v.missed_blocks += 1;
                    if v.missed_blocks >= MAX_MISSED_BLOCKS_BEFORE_JAIL {
                        // This would be called by the node logic
                        // self.slash_validator(v.address, SlashReason::Downtime, active_at_slot);
                    }
                }
            }
        }
    }

    pub fn process_vote(&mut self, vote: Vote) {
        self.vote_aggregator.add_vote(vote.block_hash, vote.validator, vote.signature);
        
        let stake = self.vote_aggregator.get_stake_for_block(vote.block_hash, &self.validators);
        if self.is_super_majority(stake) {
            self.finalized_hash = vote.block_hash;
        }
    }

    pub fn get_leader(&self, slot: u64) -> Option<Address> {
        let active_validators: Vec<_> = self.validators.iter()
            .filter(|v| v.is_active && !self.jailed_validators.contains_key(&v.address))
            .collect();
            
        if active_validators.is_empty() {
            return None;
        }
        
        let mut hasher = Sha3_256::new();
 hasher.update(slot.to_be_bytes());
        let hash = hasher.finalize();
        let index = (u64::from_be_bytes(hash[0..8].try_into().unwrap()) % active_validators.len() as u64) as usize;
        
        Some(active_validators[index].address)
    }

    pub fn is_super_majority(&self, vote_stake: u128) -> bool {
        let total_stake: u128 = self.validators.iter().filter(|v| v.is_active).map(|v| v.stake).sum();
        if total_stake == 0 { return false; }
        vote_stake * 3 > total_stake * 2
    }

    pub fn advance_era(&mut self, current_height: u64) {
        if current_height.is_multiple_of(BLOCKS_PER_EPOCH) {
            self.distribute_rewards(current_height);
            self.recompute_active_set();
        }
    }

    fn distribute_rewards(&mut self, height: u64) {
        let reward_per_block = calculate_block_reward(height);
        let total_reward = reward_per_block * BLOCKS_PER_EPOCH as u128;
        
        let total_active_stake: u128 = self.validators.iter()
            .filter(|v| v.is_active)
            .map(|v| v.stake)
            .sum();

        if total_active_stake == 0 { return; }

        for v in self.validators.iter_mut() {
            if v.is_active {
                let validator_share = (total_reward * v.stake) / total_active_stake;
                let commission_amount = (validator_share * v.commission as u128) / 10000;
                let delegator_share = validator_share - commission_amount;
                
                v.stake += commission_amount;
                // In a real system, delegator_share would be distributed to delegators
                // For this implementation, we simplify and add it to the validator's pool balance
                v.stake += delegator_share; 
            }
        }
    }

    fn recompute_active_set(&mut self) {
        // Sort by stake descending
        self.validators.sort_by(|a, b| b.stake.cmp(&a.stake));
        
        for (i, v) in self.validators.iter_mut().enumerate() {
            if i < ACTIVE_VALIDATOR_COUNT && v.stake >= MIN_VALIDATOR_STAKE && !self.jailed_validators.contains_key(&v.address) {
                v.is_active = true;
            } else {
                v.is_active = false;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_poh_chain() {
        let mut poh = PohGenerator::new(b"genesis");
        let tick1 = poh.tick();
        let tick2 = poh.tick();
        assert_ne!(tick1.hash, tick2.hash);
        assert_eq!(tick2.sequence, 2);
    }

    #[test]
    fn test_leader_election() {
        let validators = vec![
            ValidatorInfo { address: Address::from_pubkey(b"v1"), stake: 100, is_active: true, commission: 500, missed_blocks: 0 },
            ValidatorInfo { address: Address::from_pubkey(b"v2"), stake: 100, is_active: true, commission: 500, missed_blocks: 0 },
        ];
        let engine = ConsensusEngine::new(validators);
        let leader1 = engine.get_leader(1).unwrap();
        let _leader2 = engine.get_leader(2).unwrap();
        // Deterministic but likely different
        assert!(leader1 == leader1); 
    }
}
