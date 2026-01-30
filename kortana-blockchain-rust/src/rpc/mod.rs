// File: src/rpc/mod.rs

use serde::{Serialize, Deserialize};
use sha3::{Digest, Keccak256};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub method: String,
    pub params: Value,
    pub id: Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    pub result: Option<Value>,
    pub error: Option<JsonRpcError>,
    pub id: Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcError {
    pub code: i32,
    pub message: String,
}

use std::sync::{Arc, Mutex};
use sha3::Sha3_256;
use std::sync::atomic::{AtomicU64, Ordering};
use crate::state::account::State;
use crate::mempool::Mempool;
use crate::types::transaction::Transaction;

pub struct RpcHandler {
    pub chain_id: u64,
    pub state: Arc<Mutex<State>>,
    pub mempool: Arc<Mutex<Mempool>>,
    pub storage: Arc<crate::storage::Storage>,
    pub network_tx: tokio::sync::mpsc::Sender<crate::network::messages::NetworkMessage>,
    pub height: Arc<AtomicU64>,
}

impl RpcHandler {
    pub async fn handle(&self, request: JsonRpcRequest) -> JsonRpcResponse {
        let result = match request.method.as_str() {
            "eth_chainId" => Some(serde_json::to_value(format!("0x{:x}", self.chain_id)).unwrap()),
            "eth_blockNumber" => {
                let h = self.height.load(Ordering::Relaxed);
                Some(serde_json::to_value(format!("0x{:x}", h)).unwrap())
            }
            "eth_getBlockByNumber" => {
                let params: Result<Vec<String>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                    if let Some(num_str) = p.first() {
                        let height = if num_str == "latest" { 0 } else { 
                            u64::from_str_radix(num_str.strip_prefix("0x").unwrap_or(num_str), 16).unwrap_or(0)
                        };
                        if let Ok(Some(block)) = self.storage.get_block(height) {
                            Some(serde_json::to_value(block).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_getTransactionByHash" => {
                let params: Result<Vec<String>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                    if let Some(hash_str) = p.first() {
                        let hash_hex = hash_str.strip_prefix("0x").unwrap_or(hash_str);
                        if let Ok(Some(tx)) = self.storage.get_transaction(&format!("0x{}", hash_hex)) {
                            Some(serde_json::to_value(tx).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_getBalance" => {
                let params: Result<Vec<String>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                    if let Some(addr_str) = p.first() {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let state = self.state.lock().unwrap();
                            let acc = state.get_account(&addr);
                            Some(serde_json::to_value(format!("0x{:x}", acc.balance)).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_getTransactionCount" => {
                let params: Result<Vec<String>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                    if let Some(addr_str) = p.first() {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let state = self.state.lock().unwrap();
                            let acc = state.get_account(&addr);
                            Some(serde_json::to_value(format!("0x{:x}", acc.nonce)).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_sendRawTransaction" => {
                let params: Result<Vec<String>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                    if let Some(raw_tx_hex) = p.first() {
                        let hex_str = raw_tx_hex.strip_prefix("0x").unwrap_or(raw_tx_hex);
                        if let Ok(bytes) = hex::decode(hex_str) {
                            if let Ok(tx) = rlp::decode::<crate::types::transaction::Transaction>(&bytes) {
                                // Add to local mempool
                                let mut mempool = self.mempool.lock().unwrap();
                                mempool.add(tx.clone());
                                
                                // Gossip to network
                                let _ = self.network_tx.send(crate::network::messages::NetworkMessage::NewTransaction(tx.clone()));
                                
                                Some(serde_json::to_value(format!("0x{}", hex::encode(tx.hash()))).unwrap())
                            } else { None }
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_call" => {
                let params: Result<Vec<Value>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                    if let Some(call_obj) = p.first() {
                        // Extract 'to' and 'data'
                        let to_str = call_obj.get("to").and_then(|v| v.as_str()).unwrap_or("");
                        let data_str = call_obj.get("data").and_then(|v| v.as_str()).unwrap_or("");
                        
                        if let Ok(to) = crate::address::Address::from_hex(to_str) {
                             let _data = hex::decode(data_str.strip_prefix("0x").unwrap_or(data_str)).unwrap_or_default();
                             
                             // Clone state for read-only execution (Expensive but MV P)
                             let mut temp_state = {
                                 let state = self.state.lock().unwrap();
                                 (*state).clone() 
                             };
                             
                             // Get code
                             let code = temp_state.get_code(&to.as_evm_address_u256()).unwrap_or_default();
                             
                             // Dummy Header
                             let header = crate::types::block::BlockHeader {
                                    version: 1, height: 0, slot: 0, timestamp: 0, parent_hash: [0u8;32], state_root: [0u8;32], transactions_root: [0u8;32], receipts_root: [0u8;32], poh_hash: [0u8;32], poh_sequence: 0, proposer: crate::address::Address::ZERO, gas_used: 0, gas_limit: 30_000_000, base_fee: 0, vrf_output: [0u8; 32]
                             };

                             let mut executor = crate::vm::evm::EvmExecutor::new(to, 10_000_000);
                             if let Ok(output) = executor.execute(&code, &mut temp_state, &header) {
                                  Some(serde_json::to_value(format!("0x{}", hex::encode(output))).unwrap())
                             } else {
                                  Some(serde_json::to_value("0x").unwrap())
                             }
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_estimateGas" => {
                // Return static 21000 for standard txs, simple estimation
                Some(serde_json::to_value("0x5208").unwrap()) 
            }
            "eth_getCode" => {
                let params: Result<Vec<String>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                     if let Some(addr_str) = p.first() {
                         if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                             let state = self.state.lock().unwrap();
                             let code_res = state.get_code(&addr.as_evm_address_u256());
                             match code_res {
                                 Some(c) => Some(serde_json::to_value(format!("0x{}", hex::encode(c))).unwrap()),
                                 None => Some(serde_json::to_value("0x").unwrap())
                             }
                         } else { None }
                     } else { None }
                } else { None }
            }
            "eth_gasPrice" => {
                Some(serde_json::to_value("0x3b9aca00").unwrap()) // 1 Gwei
            }
            "eth_getTransactionReceipt" => {
                let params: Result<Vec<String>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                    if let Some(hash_str) = p.first() {
                         let hash_hex = hash_str.strip_prefix("0x").unwrap_or(hash_str);
                         if let Ok(Some(receipt)) = self.storage.get_receipt(&format!("0x{}", hash_hex)) {
                             let val = serde_json::to_value(receipt).unwrap();
                             Some(val)
                         } else { None }
                    } else { None }
                } else { None }
            }
            "eth_stakingValidators" => {
                let state = self.state.lock().unwrap();
                let mut vals = Vec::new();
                for (v_addr, delegations) in &state.staking.delegations {
                    let total_stake: u128 = delegations.iter().map(|d| d.amount).sum();
                    vals.push(serde_json::json!({
                        "address": v_addr.to_hex(),
                        "totalStake": format!("0x{:x}", total_stake),
                        "delegatorCount": delegations.len()
                    }));
                }
                Some(serde_json::to_value(vals).unwrap())
            }
            "eth_stakingInfo" => {
                let params: Result<Vec<String>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                    if let Some(addr_str) = p.first() {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let state = self.state.lock().unwrap();
                            let mut user_delegations = Vec::new();
                            for delegations in state.staking.delegations.values() {
                                for d in delegations {
                                    if d.delegator == addr {
                                        user_delegations.push(serde_json::json!({
                                            "validator": d.validator.to_hex(),
                                            "amount": format!("0x{:x}", d.amount)
                                        }));
                                    }
                                }
                            }
                            
                            let mut unbondings = Vec::new();
                            for u in &state.staking.unbonding {
                                if u.delegator == addr {
                                    unbondings.push(serde_json::json!({
                                        "validator": u.validator.to_hex(),
                                        "amount": format!("0x{:x}", u.amount),
                                        "releaseBlock": format!("0x{:x}", u.release_block)
                                    }));
                                }
                            }

                            Some(serde_json::json!({
                                "delegations": user_delegations,
                                "unbonding": unbondings
                            }))
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_requestDNR" => {
                let params: Result<Vec<String>, _> = serde_json::from_value(request.params.clone());
                if let Ok(p) = params {
                    if let Some(addr_str) = p.first() {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let mut state = self.state.lock().unwrap();
                            let mut acc = state.get_account(&addr);
                            acc.balance += 10 * 10u128.pow(18); // 10 DNR
                            state.update_account(addr, acc);
                            println!("\x1b[35m[FAUCET]\x1b[0m Distributed 10 DNR to {}", addr_str);
                            Some(serde_json::to_value(true).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "net_version" => Some(serde_json::to_value(self.chain_id.to_string()).unwrap()),
            "web3_clientVersion" => Some(serde_json::to_value("Kortana/v1.0.0/rust").unwrap()),
            _ => None,
        };

        if let Some(res) = result {
            JsonRpcResponse {
                jsonrpc: "2.0".to_string(),
                result: Some(res),
                error: None,
                id: request.id,
            }
        } else {
            JsonRpcResponse {
                jsonrpc: "2.0".to_string(),
                result: None,
                error: Some(JsonRpcError {
                    code: -32601,
                    message: "Method not found".to_string(),
                }),
                id: request.id,
            }
        }
    }
}
