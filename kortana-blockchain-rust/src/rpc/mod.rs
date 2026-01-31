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

pub struct RpcHandler {
    pub state: Arc<Mutex<State>>,
    pub mempool: Arc<Mutex<Mempool>>,
    pub storage: Arc<Storage>,
    pub network_tx: mpsc::Sender<crate::network::messages::NetworkMessage>,
    pub height: Arc<AtomicU64>,
    pub chain_id: u64,
}

impl RpcHandler {
    pub fn new(state: Arc<Mutex<State>>, mempool: Arc<Mutex<Mempool>>, storage: Arc<Storage>, network_tx: mpsc::Sender<crate::network::messages::NetworkMessage>, height: Arc<AtomicU64>, chain_id: u64) -> Self {
        Self { state, mempool, storage, network_tx, height, chain_id }
    }

    pub async fn handle(&self, request: JsonRpcRequest) -> JsonRpcResponse {
        let req_id = request.id.clone();
        
        let result: Option<Value> = match request.method.as_str() {
            "eth_chainId" => Some(serde_json::to_value(format!("0x{:x}", self.chain_id)).unwrap()),
            "eth_blockNumber" => {
                let height = self.height.load(Ordering::Relaxed);
                Some(serde_json::to_value(format!("0x{:x}", height)).unwrap())
            }
            "eth_getBalance" => {
                let params_val = request.params.clone().unwrap_or(Value::Array(vec![]));
                let params: Result<Vec<String>, _> = serde_json::from_value(params_val);
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
                let params_val = request.params.clone().unwrap_or(Value::Array(vec![]));
                let params: Result<Vec<String>, _> = serde_json::from_value(params_val);
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
                let params_val = request.params.clone().unwrap_or(Value::Array(vec![]));
                let params: Result<Vec<String>, _> = serde_json::from_value(params_val);
                match params {
                    Ok(p) => {
                        if let Some(raw_tx_hex) = p.first() {
                            let hex_str = raw_tx_hex.strip_prefix("0x").unwrap_or(raw_tx_hex);
                            match hex::decode(hex_str) {
                                Ok(bytes) => {
                                    match rlp::decode::<crate::types::transaction::Transaction>(&bytes) {
                                        Ok(tx) => {
                                            {
                                                let mut mempool = self.mempool.lock().unwrap();
                                                mempool.add(tx.clone());
                                            } // Lock dropped here
                                            let _ = self.network_tx.send(crate::network::messages::NetworkMessage::NewTransaction(tx.clone())).await;
                                            Some(serde_json::to_value(format!("0x{}", hex::encode(tx.hash()))).unwrap())
                                        },
                                        Err(e) => Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32700, &format!("Parse error: {}", e))).unwrap())
                                    }
                                },
                                Err(e) => Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32700, &format!("Hex error: {}", e))).unwrap())
                            }
                        } else { Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, "Missing tx data")).unwrap()) }
                    },
                    Err(_) => Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, "Invalid params")).unwrap())
                }
            }
            "eth_requestDNR" => {
                let params_val = request.params.clone().unwrap_or(Value::Array(vec![]));
                let params: Result<Vec<String>, _> = serde_json::from_value(params_val);
                if let Ok(p) = params {
                    if let Some(addr_str) = p.first() {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let amount_dnr: u128 = p.get(1).and_then(|s| s.parse().ok()).unwrap_or(10);
                            let mut state = self.state.lock().unwrap();
                            let mut acc = state.get_account(&addr);
                            acc.balance += amount_dnr * 10u128.pow(18);
                            state.update_account(addr, acc);
                            println!("[FAUCET] Distributed {} DNR to {}", amount_dnr, addr_str);
                            Some(serde_json::to_value(true).unwrap())
                        } else { None }
                    } else { None }
                } else { None }
            }
            "net_version" => Some(serde_json::to_value(self.chain_id.to_string()).unwrap()),
            "net_listening" => Some(serde_json::to_value(true).unwrap()),
            "eth_syncing" => Some(serde_json::to_value(false).unwrap()),
            "eth_protocolVersion" => Some(serde_json::to_value("0x41").unwrap()),
            "web3_clientVersion" => Some(serde_json::to_value("Kortana/v1.0.0/rust").unwrap()),
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
