// File: src/core/genesis.rs

use crate::address::Address;
use crate::state::account::{State, Account};
use crate::types::block::{Block, BlockHeader};
use crate::parameters::*;

pub fn create_genesis_state() -> State {
    let mut state = State::new();
    
    // Foundation Account
    let foundation_addr = Address::from_pubkey(b"foundation");
    let mut foundation_acc = Account::new();
    foundation_acc.balance = 250_000_000_000_000_000_000_000_000; // 250M DNR
    state.update_account(foundation_addr, foundation_acc);

    // Initial Validator
    let validator_addr = Address::from_pubkey(b"genesis_validator");
    let mut validator_acc = Account::new();
    let stake = 32_000_000_000_000_000_000; // 32 DNR (min stake)
    validator_acc.balance = stake;
    state.update_account(validator_addr, validator_acc);
    
    // Add to staking store as initial stake
    state.staking.delegate(validator_addr, validator_addr, stake, 0);

    // Faucet Account (Priv: 2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa)
    // Addr: kn:0x450abfda8fc66fcd1f98f7108bfa71ca338322738c512ade
    let faucet_addr = Address::from_hex("kn:0x450abfda8fc66fcd1f98f7108bfa71ca338322738c512ade").unwrap();
    let mut faucet_acc = Account::new();
    faucet_acc.balance = 100_000_000_000_000_000_000_000_000; // 100M DNR
    state.update_account(faucet_addr, faucet_acc);

    state
}

pub fn create_genesis_block(state_root: [u8; 32]) -> Block {
    let header = BlockHeader {
        version: 1,
        height: 0,
        slot: 0,
        timestamp: 1738224000, // Jan 30 2026 
        parent_hash: [0u8; 32],
        state_root,
        transactions_root: [0u8; 32],
        receipts_root: [0u8; 32],
        poh_hash: [0u8; 32],
        poh_sequence: 0,
        proposer: Address::ZERO,
        gas_used: 0,
        gas_limit: GAS_LIMIT_PER_BLOCK,
        base_fee: 1_000_000_000, // 1 Gwei
        vrf_output: [0u8; 32],
    };

    Block {
        header,
        transactions: vec![],
        signature: vec![],
    }
}
