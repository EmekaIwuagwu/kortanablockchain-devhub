// File: src/rpc/mod.rs

use serde::{Serialize, Deserialize};
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
use crate::state::account::State;
use crate::mempool::Mempool;
use crate::types::transaction::Transaction;

pub struct RpcHandler {
    pub chain_id: u64,
    pub state: Arc<Mutex<State>>,
    pub mempool: Arc<Mutex<Mempool>>,
    pub storage: Arc<crate::storage::Storage>,
    pub network_tx: tokio::sync::mpsc::Sender<crate::network::messages::NetworkMessage>,
}

impl RpcHandler {
    pub async fn handle(&self, request: JsonRpcRequest) -> JsonRpcResponse {
        let result = match request.method.as_str() {
            "eth_chainId" => Some(serde_json::to_value(format!("0x{:x}", self.chain_id)).unwrap()),
            "eth_blockNumber" => {
                let state = self.state.lock().unwrap();
                // In this implementation, height might be stored in state or storage
                // Simple stub if not tracked globally
                Some(serde_json::to_value("0x0").unwrap())
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
