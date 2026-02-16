// File: src/core/genesis.rs

use crate::address::Address;
use crate::state::account::{State, Account};
use crate::types::block::{Block, BlockHeader};
use crate::parameters::*;

pub fn create_genesis_state() -> State {
    let mut state = State::new();
    
    // Foundation Treasury Account
    let foundation_addr = Address::from_hex("0x4A6bBcDde6a900fa2b585dd299e03d12FA4293BC").unwrap();
    let mut foundation_acc = Account::new();
    foundation_acc.balance = 250_000_000_000_000_000_000_000_000; // 250M DNR
    state.update_account(foundation_addr, foundation_acc);

    // Initial Validator Set (3 Nodes for Mainnet Consensus)
    let validator_addresses = [
        "0x6c7540c27810555bcbbfd7053138808561a47088", // Validator Alpha (Our Primary Node)
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Validator Beta
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Validator Gamma
    ];

    let stake = 32_000_000_000_000_000_000; // 32 DNR (minimum staking requirement)

    for &addr_hex in validator_addresses.iter() {
        let addr = Address::from_hex(addr_hex).unwrap();
        let mut acc = Account::new();
        acc.balance = stake;
        state.update_account(addr, acc);
        
        // Initialize staking position for genesis validators
        state.staking.delegate(addr, addr, stake, 0);
    }

    // Mainnet Faucet / Community Fund
    let faucet_addr = Address::from_hex("0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64").unwrap();
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
