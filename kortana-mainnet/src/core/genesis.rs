// File: src/core/genesis.rs

use crate::address::Address;
use crate::state::account::{State, Account};
use crate::types::block::{Block, BlockHeader};
use crate::parameters::*;

pub fn create_genesis_state() -> State {
    let mut state = State::new();

    // -------------------------------------------------------
    // Total Genesis Supply: 500,000,000,000 DNR (500 Billion)
    // Circulating at launch: 10,000,000,000 DNR (10 Billion)
    // Treasury (Foundation + Reserve): 490,000,000,000 DNR
    // -------------------------------------------------------

    // Foundation Reserve — 490B DNR
    let foundation_addr = Address::from_pubkey(b"foundation");
    let mut foundation_acc = Account::new();
    foundation_acc.balance = 490_000_000_000_000_000_000_000_000_000_000; // 490B DNR
    state.update_account(foundation_addr, foundation_acc);

    // Initial Validators - 3 Highly Secure Nodes
    let validator_stakes = 1_000_000_000_000_000_000_000_000; // 1M DNR each
    
    let validator_keys = vec![
        b"genesis_validator_1",
        b"genesis_validator_2",
        b"genesis_validator_3",
    ];

    for key in validator_keys {
        let addr = Address::from_pubkey(key);
        let mut acc = Account::new();
        acc.balance = validator_stakes;
        state.update_account(addr, acc);
        state.staking.delegate(addr, addr, validator_stakes, 0);
    }

    // Ecosystem Faucet — 306.993B DNR
    let faucet_addr = Address::from_hex("0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64").unwrap();
    let mut faucet_acc = Account::new();
    faucet_acc.balance = 306_993_000_000_000_000_000_000_000_000_000;
    state.update_account(faucet_addr, faucet_acc);

    // Owner Wallet — 7M DNR
    let owner_addr = Address::from_hex("0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9").unwrap();
    let mut owner_acc = Account::new();
    owner_acc.balance = 7_000_000_000_000_000_000_000_000; // 7M DNR
    state.update_account(owner_addr, owner_acc);

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
        base_fee: MIN_GAS_PRICE, // 1 wei — Kortana minimum gas price
        vrf_output: [0u8; 32],
    };

    Block {
        header,
        transactions: vec![],
        signature: vec![],
    }
}
