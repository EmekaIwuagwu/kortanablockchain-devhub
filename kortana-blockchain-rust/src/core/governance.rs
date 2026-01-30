// File: src/core/governance.rs

use serde::{Serialize, Deserialize};
use crate::address::Address;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProposalType {
    ParameterChange { key: String, value: String },
    SoftwareUpgrade { version: String, hash: [u8; 32] },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Proposal {
    pub id: u64,
    pub proposer: Address,
    pub p_type: ProposalType,
    pub votes_for: u128,
    pub votes_against: u128,
    pub end_block: u64,
    pub executed: bool,
}

pub struct GovernanceModule {
    pub proposals: Vec<Proposal>,
    pub next_id: u64,
}

impl GovernanceModule {
    pub fn new() -> Self {
        Self {
            proposals: Vec::new(),
            next_id: 1,
        }
    }

    pub fn submit_proposal(&mut self, proposer: Address, p_type: ProposalType, current_height: u64) -> u64 {
        let id = self.next_id;
        self.next_id += 1;
        self.proposals.push(Proposal {
            id,
            proposer,
            p_type,
            votes_for: 0,
            votes_against: 0,
            end_block: current_height + 1000, // 1000 blocks voting period
            executed: false,
        });
        id
    }

    pub fn vote(&mut self, proposal_id: u64, weight: u128, in_favor: bool) -> Result<(), String> {
        let proposal = self.proposals.iter_mut().find(|p| p.id == proposal_id)
            .ok_or("Proposal not found")?;
        
        if in_favor {
            proposal.votes_for += weight;
        } else {
            proposal.votes_against += weight;
        }
        Ok(())
    }
}
