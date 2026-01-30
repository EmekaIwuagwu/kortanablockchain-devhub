// File: src/staking/mod.rs

use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use crate::address::Address;
use crate::parameters::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Delegation {
    pub delegator: Address,
    pub validator: Address,
    pub amount: u128,
    pub start_block: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnbondingRequest {
    pub delegator: Address,
    pub validator: Address,
    pub amount: u128,
    pub release_block: u64,
}

pub struct StakingStore {
    pub delegations: HashMap<Address, Vec<Delegation>>, // validator -> delegations
    pub unbonding: Vec<UnbondingRequest>,
    pub min_self_stake: u128,
}

impl StakingStore {
    pub fn new() -> Self {
        Self {
            delegations: HashMap::new(),
            unbonding: Vec::new(),
            min_self_stake: MIN_VALIDATOR_STAKE,
        }
    }

    pub fn delegate(&mut self, delegator: Address, validator: Address, amount: u128, height: u64) {
        let entry = self.delegations.entry(validator).or_insert_with(Vec::new);
        entry.push(Delegation {
            delegator,
            validator,
            amount,
            start_block: height,
        });
    }

    pub fn undelegate(&mut self, delegator: Address, validator: Address, amount: u128, height: u64) -> Result<(), String> {
        let entry = self.delegations.get_mut(&validator).ok_or("Validator not found")?;
        
        let mut found = false;
        for d in entry.iter_mut() {
            if d.delegator == delegator && d.amount >= amount {
                d.amount -= amount;
                found = true;
                break;
            }
        }

        if !found {
            return Err("Insufficient delegation to undelegate".to_string());
        }

        // Add to unbonding queue
        self.unbonding.push(UnbondingRequest {
            delegator,
            validator,
            amount,
            release_block: height + UNBONDING_PERIOD_BLOCKS,
        });

        Ok(())
    }

    pub fn process_matured_unbonding(&mut self, current_height: u64) -> Vec<(Address, u128)> {
        let mut released = Vec::new();
        let mut i = 0;
        while i < self.unbonding.len() {
            if self.unbonding[i].release_block <= current_height {
                let req = self.unbonding.remove(i);
                released.push((req.delegator, req.amount));
            } else {
                i += 1;
            }
        }
        released
    }
}
