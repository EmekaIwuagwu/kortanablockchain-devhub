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
        let params = request.params.unwrap_or(Value::Array(vec![]));
        let p = params.as_array();

        let result: Option<Value> = match request.method.as_str() {
            "eth_chainId" => Some(serde_json::to_value(format!("0x{:x}", self.chain_id)).unwrap()),
            "eth_blockNumber" => {
                let height = self.height.load(Ordering::Relaxed);
                Some(serde_json::to_value(format!("0x{:x}", height)).unwrap())
            }
            "eth_gasPrice" => Some(serde_json::to_value("0x3b9aca00").unwrap()), // 1 Gwei
            "eth_estimateGas" => Some(serde_json::to_value("0x5208").unwrap()), // 21000
            "eth_getBalance" => {
                if let Some(arr) = p {
                    if let Some(addr_str) = arr.get(0).and_then(|v| v.as_str()) {
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
                    if let Some(addr_str) = arr.get(0).and_then(|v| v.as_str()) {
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
                    if let Some(addr_str) = arr.get(0).and_then(|v| v.as_str()) {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                             let state = self.state.lock().unwrap();
                             let acc = state.get_account(&addr);
                             if acc.is_contract {
                                 Some(serde_json::to_value("0x608060405234801561001057600080fd5b5061012f").unwrap())
                             } else {
                                 Some(serde_json::to_value("0x").unwrap())
                             }
                        } else { None }
                    } else { None }
                } else { None }
            }
            "eth_call" => {
                // Mock balance: 1,000,000 tokens (decoded as uint256 = 10^24)
                // 10^24 in hex is d3c21bcecceda1000000. Padded to 64 chars:
                Some(serde_json::to_value("0x00000000000000000000000000000000000000000000d3c21bcecceda1000000").unwrap())
            }
            "eth_feeHistory" => {
                Some(serde_json::json!({
                    "baseFeePerGas": ["0x3b9aca00", "0x3b9aca00", "0x3b9aca00", "0x3b9aca00", "0x3b9aca00"],
                    "gasUsedRatio": [0.0, 0.0, 0.0, 0.0],
                    "oldestBlock": "0x1",
                    "reward": [["0x0"], ["0x0"], ["0x0"], ["0x0"]]
                }))
            }
            "eth_sendRawTransaction" => {
                if let Some(arr) = p {
                    if let Some(raw_tx_hex) = arr.get(0).and_then(|v| v.as_str()) {
                        let hex_str = raw_tx_hex.strip_prefix("0x").unwrap_or(raw_tx_hex);
                        match hex::decode(hex_str) {
                            Ok(bytes) => {
                                match rlp::decode::<crate::types::transaction::Transaction>(&bytes) {
                                    Ok(tx) => {
                                        {
                                            let mut mempool = self.mempool.lock().unwrap();
                                            mempool.add(tx.clone());
                                        }
                                        let _ = self.network_tx.send(crate::network::messages::NetworkMessage::NewTransaction(tx.clone())).await;
                                        Some(serde_json::to_value(format!("0x{}", hex::encode(tx.hash()))).unwrap())
                                    },
                                    Err(e) => Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, &format!("RLP error: {}", e))).unwrap())
                                }
                            },
                            Err(e) => Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, &format!("Hex error: {}", e))).unwrap())
                        }
                    } else { Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, "Invalid tx hex")).unwrap()) }
                } else { Some(serde_json::to_value(JsonRpcResponse::new_error(req_id.clone(), -32602, "Params must be an array")).unwrap()) }
            }
            "eth_getBlockByNumber" => {
                let height = self.height.load(Ordering::Relaxed);
                Some(serde_json::json!({
                    "number": format!("0x{:x}", height),
                    "hash": format!("0x{}", hex::encode(vec![height as u8; 32])),
                    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "nonce": "0x0000000000000000",
                    "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
                    "logsBloom": "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "transactionsRoot": "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
                    "stateRoot": "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
                    "miner": "0x0000000000000000000000000000000000000000",
                    "difficulty": "0x20000",
                    "totalDifficulty": "0x20000",
                    "extraData": "0x",
                    "size": "0x3e8",
                    "gasLimit": "0x1c9c380",
                    "gasUsed": "0x0",
                    "timestamp": "0x5678",
                    "transactions": [],
                    "uncles": []
                }))
            }
            "eth_requestDNR" => {
                if let Some(arr) = p {
                    if let Some(addr_str) = arr.get(0).and_then(|v| v.as_str()) {
                        if let Ok(addr) = crate::address::Address::from_hex(addr_str) {
                            let amount_str = arr.get(1).and_then(|v| v.as_str()).unwrap_or("10");
                            let amount_dnr: u128 = amount_str.parse().unwrap_or(10);
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
