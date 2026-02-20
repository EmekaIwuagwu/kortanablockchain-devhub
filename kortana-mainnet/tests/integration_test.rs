// File: tests/integration_test.rs

use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::types::transaction::{Transaction, VmType};
use kortana_blockchain_rust::state::account::State;
use kortana_blockchain_rust::core::processor::BlockProcessor;

#[test]
fn test_full_transaction_flow() {
    let mut state = State::new();
    let alice = Address::from_pubkey(b"alice");
    let bob = Address::from_pubkey(b"bob");

    // Give Alice some starting balance
    let mut alice_acc = state.get_account(&alice);
    alice_acc.balance = 100_000_000_000_000_000_000; // 100 DNR
    state.update_account(alice, alice_acc);

    let tx = Transaction {
        nonce: 0,
        from: alice,
        to: bob,
        value: 10_000_000_000_000_000_000, // 10 DNR
        gas_limit: 21000,
        gas_price: 1,
        data: vec![],
        vm_type: VmType::EVM,
        chain_id: kortana_blockchain_rust::parameters::CHAIN_ID,
        signature: None,
        cached_hash: None,
    };

    let header = kortana_blockchain_rust::types::block::BlockHeader {
        version: 1,
        height: 1,
        slot: 1,
        timestamp: 1234567890,
        parent_hash: [0u8; 32],
        state_root: [0u8; 32],
        transactions_root: [0u8; 32],
        receipts_root: [0u8; 32],
        poh_hash: [0u8; 32],
        poh_sequence: 0,
        proposer: Address::from_pubkey(b"validator"),
        gas_used: 0,
        gas_limit: 1000000,
        base_fee: 1,
        vrf_output: [0u8; 32],
    };

    let mut processor = BlockProcessor::new(&mut state, kortana_blockchain_rust::core::fees::FeeMarket::new());
    let receipt = processor.process_transaction(tx, &header).unwrap();

    assert_eq!(receipt.status, 1);
    assert_eq!(state.get_account(&bob).balance, 10_000_000_000_000_000_000);
}
