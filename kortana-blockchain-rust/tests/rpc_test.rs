// tests/rpc_test.rs
use kortana_blockchain_rust::rpc::{RpcHandler, JsonRpcRequest};
use kortana_blockchain_rust::state::account::State;
use kortana_blockchain_rust::mempool::Mempool;
use kortana_blockchain_rust::storage::Storage;
use kortana_blockchain_rust::consensus::ConsensusEngine;
use kortana_blockchain_rust::types::transaction::{Transaction, VmType};
use kortana_blockchain_rust::Address;
use std::sync::{Arc, Mutex};
use std::sync::atomic::AtomicU64;
use tokio::sync::mpsc;

#[tokio::test]
async fn test_rpc_formatting() {
    let state = Arc::new(Mutex::new(State::new()));
    let mempool = Arc::new(Mutex::new(Mempool::new(1000)));
    let storage = Arc::new(Storage::new("test_db_rpc_2"));
    let consensus = Arc::new(Mutex::new(ConsensusEngine::new(vec![])));
    let (tx_chan, _rx) = mpsc::channel(1);
    let height = Arc::new(AtomicU64::new(42));
    let chain_id = 72511;

    // Create a dummy transaction
    let tx = Transaction {
        nonce: 1,
        from: Address::ZERO,
        to: Address::ZERO,
        value: 1000,
        gas_limit: 21000,
        gas_price: 1,
        data: vec![],
        vm_type: VmType::EVM,
        chain_id,
        signature: None,
    };
    let tx_hash = tx.hash();
    let tx_hash_hex = format!("0x{}", hex::encode(tx_hash));
    
    // Put it in storage
    storage.put_transaction(&tx).unwrap();

    let handler = RpcHandler::new(state, mempool, storage, consensus, tx_chan, height, chain_id);

    // Test eth_getTransactionByHash
    let req = JsonRpcRequest {
        jsonrpc: "2.0".to_string(),
        method: "eth_getTransactionByHash".to_string(),
        params: Some(serde_json::json!([tx_hash_hex])),
        id: serde_json::json!(4),
    };
    let res = handler.handle(req).await;
    let result = res.result.unwrap();
    
    assert_eq!(result["hash"], tx_hash_hex);
    assert_eq!(result["v"], "0x1b");
    assert_eq!(result["r"], "0x0");
    assert_eq!(result["s"], "0x0");
    assert_eq!(result["type"], "0x0");
    assert!(result["from"].as_str().unwrap().starts_with("0x"));
    assert!(result["to"].as_str().unwrap().starts_with("0x"));
    assert!(result["value"].as_str().unwrap().starts_with("0x"));
}
