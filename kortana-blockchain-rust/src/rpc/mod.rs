// File: src/rpc/mod.rs

use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcRequest {
    #[serde(default = "default_jsonrpc")]
    pub jsonrpc: String,
    pub method: String,
    pub params: Option<Value>,
    pub id: Value,
}

fn default_jsonrpc() -> String { "2.0".to_string() }

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<Value>,
    pub id: Value,
}

impl JsonRpcResponse {
    pub fn new_error(id: Value, code: i32, message: &str) -> Self {
        JsonRpcResponse {
            jsonrpc: "2.0".to_string(),
            result: None,
            error: Some(serde_json::json!({ "code": code, "message": message })),
            id,
        }
    }
}

use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicU64, Ordering};
use crate::state::account::State;
use crate::mempool::Mempool;
use crate::storage::Storage;
use tokio::sync::mpsc;

use crate::consensus::ConsensusEngine;

pub struct RpcHandler {
    pub state: Arc<Mutex<State>>,
    pub mempool: Arc<Mutex<Mempool>>,
    pub storage: Arc<Storage>,
    pub consensus: Arc<Mutex<ConsensusEngine>>,
    pub network_tx: mpsc::Sender<crate::network::messages::NetworkMessage>,
    pub height: Arc<AtomicU64>,
    pub chain_id: u64,
}

impl RpcHandler {
    pub fn new(state: Arc<Mutex<State>>, mempool: Arc<Mutex<Mempool>>, storage: Arc<Storage>, consensus: Arc<Mutex<ConsensusEngine>>, network_tx: mpsc::Sender<crate::network::messages::NetworkMessage>, height: Arc<AtomicU64>, chain_id: u64) -> Self {
        Self { state, mempool, storage, consensus, network_tx, height, chain_id }
    }

    pub async fn handle(&self, request: JsonRpcRequest) -> JsonRpcResponse {
        let req_id = request.id.clone();
        let params = request.params.unwrap_or(Value::Array(vec![]));
        let p = params.as_array();

        // Helper to get latest block header for VM context
        let current_height = self.height.load(Ordering::Relaxed);
        let latest_block = self.storage.get_block(current_height).ok().flatten();
        let latest_header = latest_block.as_ref().map(|b| b.header.clone());

        let result: Option<Value> = match request.method.as_str() {
            "eth_chainId" => Some(serde_json::to_value(format!("0x{:x}", self.chain_id)).unwrap()),
            "eth_blockNumber" => {
                Some(serde_json::to_value(format!("0x{:x}", current_height)).unwrap())
            }
            "eth_gasPrice" => Some(serde_json::to_value(format!("0x{:x}", crate::parameters::MIN_GAS_PRICE)).unwrap()),
            "eth_estimateGas" => {
                let mut gas = crate::parameters::MIN_GAS_PER_TX;
                if let Some(arr) = p {
                    if let Some(call_obj) = arr.first().and_then(|v| v.as_object()) {
                        if let Some(data_str) = call_obj.get("data").and_then(|v| v.as_str()) {
                             let data_len = (data_str.len().saturating_sub(2)) / 2;
                             gas += (data_len as u64) * 16; 
                        }
                    }
                }
                Some(serde_json::to_value(format!("0x{:x}", gas)).unwrap())
            }
            "eth_getBalance" => {
                if let Some(arr) = p {
                    if let Some(addr_str) = arr.first().and_then(|v| v.as_str()) {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let state = self.state.lock().unwrap();
                            let acc = state.get_account(&addr);
                            Some(serde_json::to_value(format!("0x{:x}", acc.balance)).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_getTransactionCount" => {
                if let Some(arr) = p {
                    if let Some(addr_str) = arr.first().and_then(|v| v.as_str()) {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let state = self.state.lock().unwrap();
                            let acc = state.get_account(&addr);
                            Some(serde_json::to_value(format!("0x{:x}", acc.nonce)).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_getCode" => {
                if let Some(arr) = p {
                    if let Some(addr_str) = arr.first().and_then(|v| v.as_str()) {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                             let state = self.state.lock().unwrap();
                             let acc = state.get_account(&addr);
                             if acc.is_contract {
                                 if let Some(code) = state.get_code(&acc.code_hash) {
                                     Some(serde_json::to_value(format!("0x{}", hex::encode(code))).unwrap())
                                 } else {
                                     Some(serde_json::to_value("0x").unwrap())
                                 }
                             } else {
                                 Some(serde_json::to_value("0x").unwrap())
                             }
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_call" => {
                if let Some(arr) = p {
                    if let Some(call_obj) = arr.first().and_then(|v| v.as_object()) {
                        let to_addr = call_obj.get("to").and_then(|v| v.as_str())
                             .and_then(|s| crate::address::Address::from_hex(s).ok())
                             .unwrap_or(crate::address::Address::ZERO);
                        
                        let data = call_obj.get("data").and_then(|v| v.as_str())
                             .and_then(|s| hex::decode(s.strip_prefix("0x").unwrap_or(s)).ok())
                             .unwrap_or_default();

                        if let Some(header) = &latest_header {
                            let mut state_clone = self.state.lock().unwrap().clone(); 
                            let acc = state_clone.get_account(&to_addr);
                            if acc.is_contract {
                                if let Some(code) = state_clone.get_code(&acc.code_hash) {
                                    let mut executor = crate::vm::evm::EvmExecutor::new(to_addr, 10_000_000)
                                        .with_calldata(data); 
                                    
                                    match executor.execute(&code, &mut state_clone, header) {
                                        Ok(res) => Some(serde_json::to_value(format!("0x{}", hex::encode(res))).unwrap()),
                                        Err(_) => Some(serde_json::to_value("0x").unwrap())
                                    }
                                } else {
                                     Some(serde_json::to_value("0x").unwrap())
                                }
                            } else {
                                Some(serde_json::to_value("0x").unwrap())
                            }
                        } else {
                            Some(serde_json::to_value("0x").unwrap())
                        }
                    } else { None }
                } else { None }
            }
            "eth_feeHistory" => {
                Some(serde_json::json!({
                    "baseFeePerGas": ["0x0"],
                    "gasUsedRatio": [],
                    "oldestBlock": format!("0x{:x}", current_height),
                    "reward": []
                }))
            }
            "eth_sendRawTransaction" => {
                if let Some(arr) = p {
                    if let Some(raw_tx_hex) = arr.first().and_then(|v| v.as_str()) {
                        let hex_str = raw_tx_hex.strip_prefix("0x").unwrap_or(raw_tx_hex);
                        match hex::decode(hex_str) {
                            Ok(bytes) => {
                                match rlp::decode::<crate::types::transaction::Transaction>(&bytes) {
                                    Ok(tx) => {
                                        {
                                            let mut mempool = self.mempool.lock().unwrap();
                                            mempool.add(tx.clone());
                                        }
                                        let _ = self.network_tx.try_send(crate::network::messages::NetworkMessage::NewTransaction(tx.clone()));
                                        Some(serde_json::to_value(format!("0x{}", hex::encode(tx.hash()))).unwrap())
                                    },
                                    Err(e) => {
                                        match crate::types::transaction::Transaction::decode_ethereum(&bytes) {
                                            Ok(tx) => {
                                                {
                                                    let mut mempool = self.mempool.lock().unwrap();
                                                    mempool.add(tx.clone());
                                                }
                                                let _ = self.network_tx.try_send(crate::network::messages::NetworkMessage::NewTransaction(tx.clone()));
                                                Some(serde_json::to_value(format!("0x{}", hex::encode(tx.hash()))).unwrap())
                                            },
                                            Err(e2) => Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, &format!("RLP error: {}; Eth error: {}", e, e2))).unwrap())
                                        }
                                    }
                                }
                            },
                            Err(e) => Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, &format!("Hex error: {}", e))).unwrap())
                        }
                    } else { Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, "Invalid tx hex")).unwrap()) }
                } else { Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, "Params must be an array")).unwrap()) }
            }
            "eth_getRecentTransactions" => {
                match self.storage.get_global_transactions() {
                    Ok(tx_hashes) => {
                        let mut result = Vec::new();
                        let start = if tx_hashes.len() > 100 { tx_hashes.len() - 100 } else { 0 };
                        for hash in tx_hashes[start..].iter().rev() {
                            let hash_hex = format!("0x{}", hex::encode(hash));
                            if let Ok(Some(tx)) = self.storage.get_transaction(hash_hex.strip_prefix("0x").unwrap()) {
                                let (block_height, block_hash, tx_index) = self.storage.get_transaction_location(hash_hex.strip_prefix("0x").unwrap())
                                    .ok()
                                    .flatten()
                                    .map(|(h, hash, idx)| (format!("0x{:x}", h), format!("0x{}", hash), format!("0x{:x}", idx)))
                                    .unwrap_or((format!("0x{:x}", 0), "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(), "0x0".to_string()));

                                result.push(serde_json::json!({
                                    "hash": hash_hex,
                                    "from": format!("0x{}", hex::encode(tx.from.as_evm_address())),
                                    "to": format!("0x{}", hex::encode(tx.to.as_evm_address())),
                                    "value": format!("0x{:x}", tx.value),
                                    "nonce": format!("0x{:x}", tx.nonce),
                                    "blockNumber": block_height,
                                    "blockHash": block_hash,
                                    "transactionIndex": tx_index,
                                    "gas": format!("0x{:x}", tx.gas_limit),
                                    "gasPrice": format!("0x{:x}", tx.gas_price),
                                    "input": format!("0x{}", hex::encode(&tx.data)),
                                    "timestamp": "0x0",
                                    "v": "0x1b", 
                                    "r": "0x0",
                                    "s": "0x0",
                                    "type": "0x0"
                                }));
                            }
                        }
                        Some(serde_json::Value::Array(result))
                    },
                    _ => Some(serde_json::Value::Array(vec![]))
                }
            }
            "eth_getBlockByNumber" => {
                let mut requested_height = current_height;
                let mut full_txs = false;
                
                if let Some(arr) = p {
                     if let Some(h_val) = arr.first() {
                         if h_val.as_str() == Some("latest") {
                             requested_height = current_height;
                         } else if let Some(h_str) = h_val.as_str() {
                             let clean = h_str.strip_prefix("0x").unwrap_or(h_str);
                             requested_height = u64::from_str_radix(clean, 16).unwrap_or(current_height);
                         }
                     }
                     full_txs = arr.get(1).and_then(|v| v.as_bool()).unwrap_or(false);
                }

                match self.storage.get_block(requested_height) {
                    Ok(Some(block)) => {
                        let block_hash_hex = format!("0x{}", hex::encode(block.header.hash()));
                        let block_num_hex = format!("0x{:x}", block.header.height);
                        
                        let txs_json: Vec<Value> = if full_txs {
                            block.transactions.iter().enumerate().map(|(idx, tx)| {
                                serde_json::json!({
                                    "hash": format!("0x{}", hex::encode(tx.hash())),
                                    "nonce": format!("0x{:x}", tx.nonce),
                                    "blockHash": &block_hash_hex,
                                    "blockNumber": &block_num_hex,
                                    "transactionIndex": format!("0x{:x}", idx),
                                    "from": format!("0x{}", hex::encode(tx.from.as_evm_address())),
                                    "to": format!("0x{}", hex::encode(tx.to.as_evm_address())),
                                    "value": format!("0x{:x}", tx.value),
                                    "gas": format!("0x{:x}", tx.gas_limit),
                                    "gasPrice": format!("0x{:x}", tx.gas_price),
                                    "input": format!("0x{}", hex::encode(&tx.data)),
                                    "v": "0x1b", "r": "0x0", "s": "0x0",
                                    "type": "0x0"
                                })
                            }).collect()
                        } else {
                            block.transactions.iter().map(|tx| {
                                serde_json::to_value(format!("0x{}", hex::encode(tx.hash()))).unwrap()
                            }).collect()
                        };
                        
                        Some(serde_json::json!({
                            "number": block_num_hex,
                            "hash": block_hash_hex,
                            "parentHash": format!("0x{}", hex::encode(block.header.parent_hash)),
                            "nonce": format!("0x{:016x}", block.header.poh_sequence),
                            "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
                            "logsBloom": "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                            "transactionsRoot": format!("0x{}", hex::encode(block.header.transactions_root)),
                            "stateRoot": format!("0x{}", hex::encode(block.header.state_root)),
                            "miner": format!("0x{}", hex::encode(block.header.proposer.as_evm_address())), 
                            "difficulty": "0x1",
                            "totalDifficulty": "0x1",
                            "extraData": "0x",
                            "size": format!("0x{:x}", block.transactions.len() * 100 + 100),
                            "gasLimit": format!("0x{:x}", block.header.gas_limit),
                            "gasUsed": format!("0x{:x}", block.header.gas_used),
                            "timestamp": format!("0x{:x}", block.header.timestamp),
                            "transactions": txs_json,
                            "uncles": []
                        }))
                    },
                    _ => Some(serde_json::Value::Null)
                }
            }
            "eth_getBlockByHash" => {
                let mut hash_str = String::new();
                let mut full_txs = false;
                
                if let Some(arr) = p {
                     if let Some(h_val) = arr.first().and_then(|v| v.as_str()) {
                         hash_str = h_val.to_string();
                     }
                     full_txs = arr.get(1).and_then(|v| v.as_bool()).unwrap_or(false);
                }

                match self.storage.get_block_by_hash(&hash_str) {
                    Ok(Some(block)) => {
                        let block_hash_hex = format!("0x{}", hex::encode(block.header.hash()));
                        let block_num_hex = format!("0x{:x}", block.header.height);
                        
                        let txs_json: Vec<Value> = if full_txs {
                            block.transactions.iter().enumerate().map(|(idx, tx)| {
                                serde_json::json!({
                                    "hash": format!("0x{}", hex::encode(tx.hash())),
                                    "nonce": format!("0x{:x}", tx.nonce),
                                    "blockHash": &block_hash_hex,
                                    "blockNumber": &block_num_hex,
                                    "transactionIndex": format!("0x{:x}", idx),
                                    "from": format!("0x{}", hex::encode(tx.from.as_evm_address())),
                                    "to": format!("0x{}", hex::encode(tx.to.as_evm_address())),
                                    "value": format!("0x{:x}", tx.value),
                                    "gas": format!("0x{:x}", tx.gas_limit),
                                    "gasPrice": format!("0x{:x}", tx.gas_price),
                                    "input": format!("0x{}", hex::encode(&tx.data)),
                                    "v": "0x1b", "r": "0x0", "s": "0x0",
                                    "type": "0x0"
                                })
                            }).collect()
                        } else {
                            block.transactions.iter().map(|tx| {
                                serde_json::to_value(format!("0x{}", hex::encode(tx.hash()))).unwrap()
                            }).collect()
                        };
                        
                        Some(serde_json::json!({
                            "number": block_num_hex,
                            "hash": block_hash_hex,
                            "parentHash": format!("0x{}", hex::encode(block.header.parent_hash)),
                            "nonce": format!("0x{:016x}", block.header.poh_sequence),
                            "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
                            "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                            "transactionsRoot": format!("0x{}", hex::encode(block.header.transactions_root)),
                            "stateRoot": format!("0x{}", hex::encode(block.header.state_root)),
                            "miner": format!("0x{}", hex::encode(block.header.proposer.as_evm_address())), 
                            "difficulty": "0x1",
                            "totalDifficulty": "0x1",
                            "extraData": "0x",
                            "size": format!("0x{:x}", block.transactions.len() * 100 + 100),
                            "gasLimit": format!("0x{:x}", block.header.gas_limit),
                            "gasUsed": format!("0x{:x}", block.header.gas_used),
                            "timestamp": format!("0x{:x}", block.header.timestamp),
                            "transactions": txs_json,
                            "uncles": []
                        }))
                    },
                    _ => Some(serde_json::Value::Null)
                }
            }
            "eth_requestDNR" => {
                if let Some(arr) = p {
                    if let Some(addr_str) = arr.first().and_then(|v| v.as_str()) {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let amount_str = arr.get(1).and_then(|v| v.as_str()).unwrap_or("10");
                            let amount_dnr: u128 = amount_str.parse().unwrap_or(10);
                            let amount_wei = amount_dnr * 10u128.pow(18);
                            
                            let mut state = self.state.lock().unwrap();
                            let mut acc = state.get_account(&addr);
                            acc.balance += amount_wei;
                            state.update_account(addr, acc);

                            let faucet_addr = crate::address::Address::ZERO; 
                            let faucet_tx = crate::types::transaction::Transaction {
                                from: faucet_addr,
                                to: addr,
                                value: amount_wei,
                                nonce: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs() % 10000,
                                gas_limit: 21000,
                                gas_price: 1,
                                data: vec![],
                                vm_type: crate::types::transaction::VmType::EVM,
                                chain_id: self.chain_id,
                                signature: Some(vec![0u8; 65]), 
                            };

                            let _ = self.storage.put_transaction(&faucet_tx);
                            let _ = self.storage.put_index(&addr, faucet_tx.hash());
                            
                            println!("[FAUCET] Distributed {} DNR to {} (Tx Indexed)", amount_dnr, addr_str);
                            Some(serde_json::to_value(true).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_getValidators" => {
                let consensus = self.consensus.lock().unwrap();
                let validators: Vec<serde_json::Value> = consensus.validators.iter().enumerate().map(|(i, v)| {
                     let uptime_pct = if v.missed_blocks > 0 {
                         100.0 - (v.missed_blocks as f64 / 100.0)
                     } else { 100.0 };

                     serde_json::json!({
                         "id": i + 1,
                         "address": format!("0x{}", hex::encode(v.address.as_evm_address())),
                         "stake": format!("{}", v.stake), 
                         "isActive": v.is_active,
                         "commission": format!("{:.2}", v.commission as f64 / 100.0),
                         "missedBlocks": v.missed_blocks,
                         "uptime": format!("{:.2}", uptime_pct),
                         "status": if v.is_active { "Active" } else { "Inactive" }
                     })
                }).collect();
                Some(serde_json::to_value(validators).unwrap())
            }
            "eth_pendingTransactions" => {
                let mempool = self.mempool.lock().unwrap();
                let txs = mempool.get_all();
                let formatted_txs: Vec<serde_json::Value> = txs.into_iter().map(|tx| {
                    serde_json::json!({
                        "hash": format!("0x{}", hex::encode(tx.hash())),
                        "nonce": format!("0x{:x}", tx.nonce),
                        "from": format!("0x{}", hex::encode(tx.from.as_evm_address())), 
                        "to": format!("0x{}", hex::encode(tx.to.as_evm_address())),
                        "value": format!("0x{:x}", tx.value),
                         "gas": format!("0x{:x}", tx.gas_limit),
                         "gasPrice": format!("0x{:x}", tx.gas_price),
                         "input": format!("0x{}", hex::encode(&tx.data)),
                         "v": "0x1b", "r": "0x0", "s": "0x0",
                         "type": "0x0"
                     })
                }).collect();
                Some(serde_json::to_value(formatted_txs).unwrap())
            }
            "net_version" => Some(serde_json::to_value(self.chain_id.to_string()).unwrap()),
            "net_listening" => Some(serde_json::to_value(true).unwrap()),
            "eth_syncing" => Some(serde_json::to_value(false).unwrap()),
            "eth_protocolVersion" => Some(serde_json::to_value("0x41").unwrap()),
            "web3_clientVersion" => Some(serde_json::to_value("Kortana/v1.0.0/rust").unwrap()),
            "eth_getAddressHistory" => {
                if let Some(arr) = p {
                    if let Some(addr_str) = arr.first().and_then(|v| v.as_str()) {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let hashes = self.storage.get_address_history(&addr).unwrap_or_default();
                            let mut txs = Vec::new();
                            for hash in hashes {
                                if let Ok(Some(tx)) = self.storage.get_transaction(&hex::encode(hash)) {
                                    txs.push(serde_json::json!({
                                        "hash": format!("0x{}", hex::encode(tx.hash())),
                                        "nonce": format!("0x{:x}", tx.nonce),
                                        "from": format!("0x{}", hex::encode(tx.from.as_evm_address())), 
                                        "to": format!("0x{}", hex::encode(tx.to.as_evm_address())),
                                        "value": format!("0x{:x}", tx.value),
                                        "gas": format!("0x{:x}", tx.gas_limit),
                                        "gasPrice": format!("0x{:x}", tx.gas_price),
                                        "input": format!("0x{}", hex::encode(&tx.data)),
                                        "chainId": format!("0x{:x}", tx.chain_id),
                                        "v": "0x1b", "r": "0x0", "s": "0x0",
                                        "type": "0x0"
                                    }));
                                }
                            }
                            txs.reverse(); // Latest first
                            Some(serde_json::to_value(txs).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_getTransactionByHash" => {
                if let Some(arr) = p {
                    if let Some(tx_hash_raw) = arr.first().and_then(|v| v.as_str()) {
                         let hash_str = tx_hash_raw.strip_prefix("0x").unwrap_or(tx_hash_raw);
                         let mut res_tx = None;
                         
                         if let Ok(Some(tx)) = self.storage.get_transaction(hash_str) {
                             res_tx = Some(tx);
                         } 
                         else if let Ok(h) = hex::decode(hash_str) {
                             if h.len() == 32 {
                                 let mut hash_bytes = [0u8; 32];
                                 hash_bytes.copy_from_slice(&h);
                                 if let Some(tx) = self.mempool.lock().unwrap().get_transaction(&hash_bytes) {
                                     res_tx = Some(tx);
                                 }
                             }
                         }

                         match res_tx {
                             Some(tx) => {
                                 let (block_number, block_hash, tx_index) = self.storage.get_transaction_location(hash_str)
                                     .ok()
                                     .flatten()
                                     .map(|(h, hash, idx)| (format!("0x{:x}", h), format!("0x{}", hash), format!("0x{:x}", idx)))
                                     .unwrap_or((format!("0x{:x}", 0), "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(), "0x0".to_string()));

                                 Some(serde_json::json!({
                                     "hash": format!("0x{}", hex::encode(tx.hash())),
                                     "nonce": format!("0x{:x}", tx.nonce),
                                     "blockHash": if block_hash.starts_with("0x") { block_hash.clone() } else { format!("0x{}", block_hash) },
                                     "blockNumber": block_number,
                                     "transactionIndex": tx_index,
                                     "from": format!("0x{}", hex::encode(tx.from.as_evm_address())),
                                     "to": format!("0x{}", hex::encode(tx.to.as_evm_address())),
                                     "value": format!("0x{:x}", tx.value),
                                     "gas": format!("0x{:x}", tx.gas_limit),
                                     "gasPrice": format!("0x{:x}", tx.gas_price),
                                     "input": format!("0x{}", hex::encode(&tx.data)),
                                     "v": "0x1b", "r": "0x0", "s": "0x0",
                                     "type": "0x0"
                                 }))
                             },
                             None => Some(serde_json::Value::Null)
                         }
                    } else { None }
                } else { None }
            }
            "eth_getTransactionReceipt" => {
                if let Some(arr) = p {
                    if let Some(tx_hash_raw) = arr.first().and_then(|v| v.as_str()) {
                         let hash_str = tx_hash_raw.strip_prefix("0x").unwrap_or(tx_hash_raw);
                         match self.storage.get_receipt(hash_str) {
                             Ok(Some(receipt)) => {
                                  let (block_hash, block_number, tx_index) = self.storage.get_transaction_location(hash_str)
                                      .ok()
                                      .flatten()
                                      .map(|(height, hash_str, idx)| (format!("0x{}", hash_str), format!("0x{:x}", height), format!("0x{:x}", idx)))
                                      .unwrap_or_else(|| (
                                          "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(),
                                          "0x0".to_string(),
                                          "0x0".to_string()
                                      ));

                                 let logs: Vec<serde_json::Value> = receipt.logs.iter().enumerate().map(|(i, log)| {
                                     serde_json::json!({
                                         "address": format!("0x{}", hex::encode(log.address.as_evm_address())),
                                         "topics": log.topics.iter().map(|t| format!("0x{}", hex::encode(t))).collect::<Vec<_>>(),
                                         "data": format!("0x{}", hex::encode(&log.data)),
                                         "blockNumber": &block_number,
                                         "transactionHash": tx_hash_raw,
                                         "transactionIndex": &tx_index,
                                         "blockHash": &block_hash,
                                         "logIndex": format!("0x{:x}", i),
                                         "removed": false
                                     })
                                 }).collect();

                                  let tx = self.storage.get_transaction(hash_str).ok().flatten();
                                  let (from, to, gas_price) = if let Some(t) = &tx {
                                     (
                                         format!("0x{}", hex::encode(t.from.as_evm_address())),
                                         format!("0x{}", hex::encode(t.to.as_evm_address())),
                                         format!("0x{:x}", t.gas_price)
                                     )
                                 } else {
                                     (
                                         "0x0000000000000000000000000000000000000000".to_string(),
                                         "0x0000000000000000000000000000000000000000".to_string(),
                                         "0x3b9aca00".to_string()
                                     )
                                 };

                                 Some(serde_json::json!({
                                     "transactionHash": tx_hash_raw,
                                     "transactionIndex": &tx_index,
                                     "blockHash": if block_hash.starts_with("0x") { block_hash.clone() } else { format!("0x{}", block_hash) },
                                     "blockNumber": &block_number,
                                     "from": from,
                                     "to": to,
                                     "cumulativeGasUsed": format!("0x{:x}", receipt.gas_used),
                                     "gasUsed": format!("0x{:x}", receipt.gas_used),
                                     "effectiveGasPrice": gas_price,
                                     "logs": logs,
                                     "status": format!("0x{:x}", receipt.status),
                                     "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                                     "type": "0x0"
                                 }))
                             },
                             Ok(None) => Some(serde_json::Value::Null),
                             Err(_) => None
                         }
                    } else { None }
                } else { None }
            }
            "eth_newBlockFilter" => {
                // Return a stable filter ID
                Some(serde_json::to_value("0x1").unwrap())
            }
            "eth_getFilterChanges" | "eth_getFilterLogs" => {
                // If MetaMask asks for changes, return the latest block hash to keep it synced
                let block_hash = latest_block.map(|b| format!("0x{}", hex::encode(b.header.hash()))).unwrap_or_else(|| "0x0".to_string());
                Some(serde_json::json!([block_hash]))
            }
            "eth_getTransactionByBlockNumberAndIndex" | "eth_getTransactionByBlockHashAndIndex" => {
                 if let Some(arr) = p {
                     let block = if request.method == "eth_getTransactionByBlockNumberAndIndex" {
                         let h_str = arr.first().and_then(|v| v.as_str()).unwrap_or("latest");
                         let height = if h_str == "latest" { current_height } else { 
                             u64::from_str_radix(h_str.strip_prefix("0x").unwrap_or(h_str), 16).unwrap_or(current_height)
                         };
                         self.storage.get_block(height).ok().flatten()
                     } else {
                         let h_str = arr.first().and_then(|v| v.as_str()).unwrap_or("");
                         self.storage.get_block_by_hash(h_str).ok().flatten()
                     };

                     if let Some(b) = block {
                         let idx_str = arr.get(1).and_then(|v| v.as_str()).unwrap_or("0x0");
                         let idx = usize::from_str_radix(idx_str.strip_prefix("0x").unwrap_or(idx_str), 16).unwrap_or(0);
                         if let Some(tx) = b.transactions.get(idx) {
                             Some(serde_json::json!({
                                 "hash": format!("0x{}", hex::encode(tx.hash())),
                                 "nonce": format!("0x{:x}", tx.nonce),
                                 "blockHash": format!("0x{}", hex::encode(b.header.hash())),
                                 "blockNumber": format!("0x{:x}", b.header.height),
                                 "transactionIndex": format!("0x{:x}", idx),
                                 "from": format!("0x{}", hex::encode(tx.from.as_evm_address())),
                                 "to": format!("0x{}", hex::encode(tx.to.as_evm_address())),
                                 "value": format!("0x{:x}", tx.value),
                                 "gas": format!("0x{:x}", tx.gas_limit),
                                 "gasPrice": format!("0x{:x}", tx.gas_price),
                                 "input": format!("0x{}", hex::encode(&tx.data)),
                                 "v": "0x1b", "r": "0x0", "s": "0x0",
                                 "type": "0x0"
                             }))
                         } else { Some(serde_json::Value::Null) }
                     } else { Some(serde_json::Value::Null) }
                 } else { None }
            }
            _ => None,
        };

        if let Some(res) = result {
            if res.is_object() && res.as_object().unwrap().contains_key("jsonrpc") {
                serde_json::from_value::<JsonRpcResponse>(res).unwrap()
            } else {
                JsonRpcResponse {
                    jsonrpc: "2.0".to_string(),
                    result: Some(res),
                    error: None,
                    id: req_id,
                }
            }
        } else {
            JsonRpcResponse::new_error(req_id, -32601, "Method not found")
        }
    }
}
