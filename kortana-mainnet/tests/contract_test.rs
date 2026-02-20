use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::types::transaction::{Transaction, VmType};
use kortana_blockchain_rust::vm::quorlin::QuorlinOpcode;
use kortana_blockchain_rust::core::processor::BlockProcessor;
use kortana_blockchain_rust::core::fees::FeeMarket;
use kortana_blockchain_rust::parameters::CHAIN_ID;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_quorlin_contract_deployment() {
        let mut state = kortana_blockchain_rust::core::genesis::create_genesis_state();
        let faucet_addr = Address::from_hex("0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64").unwrap();
        
        // 1. Prepare Quorlin Contract (JSON serialized opcodes)
        let instructions = vec![
            QuorlinOpcode::Push(10),
            QuorlinOpcode::Push(20),
            QuorlinOpcode::Add,
            QuorlinOpcode::Return,
        ];
        let data = serde_json::to_vec(&instructions).unwrap();

        let tx = Transaction {
            nonce: 0,
            from: faucet_addr,
            to: Address::ZERO, // Deploy
            value: 0,
            gas_limit: 100000,
            gas_price: 1,
            data,
            vm_type: VmType::Quorlin,
            chain_id: CHAIN_ID,
            signature: None,
            cached_hash: None,
        };

        let mut processor = BlockProcessor::new(&mut state, FeeMarket::new());
        let header = kortana_blockchain_rust::types::block::BlockHeader {
            version: 1, height: 1, slot: 1, timestamp: 123456789, parent_hash: [0u8;32], state_root: [0u8;32], transactions_root: [0u8;32], receipts_root: [0u8;32], poh_hash: [0u8;32], poh_sequence: 0, proposer: Address::ZERO, gas_used: 0, gas_limit: 30000000, base_fee: 1, vrf_output: [0u8; 32]
        };

        let receipt = processor.process_transaction(tx, &header).unwrap();
        assert_eq!(receipt.status, 1);
        println!("Quorlin Contract execution status: {}", receipt.status);
    }

    #[test]
    fn test_solidity_evm_deployment() {
        let mut state = kortana_blockchain_rust::core::genesis::create_genesis_state();
        let faucet_addr = Address::from_hex("0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64").unwrap();
        
        // 1. Prepare EVM Contract (PUSH 42, RETURN)
        // 602a60005260206000f3
        let data = hex::decode("602a60005260206000f3").unwrap();

        let tx = Transaction {
            nonce: 0,
            from: faucet_addr,
            to: Address::ZERO, // Deploy
            value: 0,
            gas_limit: 100000,
            gas_price: 1,
            data,
            vm_type: VmType::EVM,
            chain_id: CHAIN_ID,
            signature: None,
            cached_hash: None,
        };

        let mut processor = BlockProcessor::new(&mut state, FeeMarket::new());
        let header = kortana_blockchain_rust::types::block::BlockHeader {
            version: 1, height: 1, slot: 1, timestamp: 123456789, parent_hash: [0u8;32], state_root: [0u8;32], transactions_root: [0u8;32], receipts_root: [0u8;32], poh_hash: [0u8;32], poh_sequence: 0, proposer: Address::ZERO, gas_used: 0, gas_limit: 30000000, base_fee: 1, vrf_output: [0u8; 32]
        };

        let receipt = processor.process_transaction(tx, &header).unwrap();
        assert_eq!(receipt.status, 1);
        println!("Solidity (EVM) Contract execution status: {}", receipt.status);
    }
}
