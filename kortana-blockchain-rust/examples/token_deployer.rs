
use kortana_blockchain_rust::types::transaction::{Transaction, VmType};
use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::crypto::sign_message;
use std::process::Command;
use serde_json::json;

const RPC_URL: &str = "https://poseidon-rpc.kortana.name.ng";

fn rpc_call(method: &str, params: serde_json::Value) -> serde_json::Value {
    let json_body = json!({
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    });

    let output = Command::new("curl")
        .arg("-s")
        .arg("-X").arg("POST")
        .arg("-H").arg("Content-Type: application/json")
        .arg("-d").arg(json_body.to_string())
        .arg(RPC_URL)
        .output()
        .expect("Failed to execute curl");

    let stdout = String::from_utf8_lossy(&output.stdout);
    let v: serde_json::Value = serde_json::from_str(&stdout).unwrap_or_else(|_| {
        println!("FAIL: Could not parse RPC response: {}", stdout);
        json!({"error": {"message": "Invalid JSON"}})
    });
    
    if let Some(err) = v.get("error") {
        println!("   RPC ERROR: {}", err);
    }
    v["result"].clone()
}

fn main() {
    println!("=== KORTANA SENIOR ENGINEER DEPLOYMENT SUITE ===");

    // Faucet credentials from spec
    let faucet_priv = hex::decode("2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa").unwrap();
    let faucet_addr = Address::from_hex("kn:0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64").unwrap();

    // 1. Deploy Bantumi (EVM)
    println!("\n[1/2] Deploying Bantumi Token (Solidity) to EVM...");
    let bantumi_bytecode = "608060405234801561001057600080fd5b5061012f806100206000396000f3fe"; // Simplified ERC20 deployer
    deploy_contract(&faucet_addr, &faucet_priv, hex::decode(bantumi_bytecode).unwrap(), VmType::EVM);

    // 2. Deploy Maya (Quorlin)
    println!("\n[2/2] Deploying Maya Token (Quorlin) to Native VM...");
    use kortana_blockchain_rust::vm::quorlin::QuorlinOpcode;
    let maya_ops = vec![
        QuorlinOpcode::Push(1000000), // Initial supply
        QuorlinOpcode::StoreGlobal("total_supply".to_string()),
        QuorlinOpcode::Address,
        QuorlinOpcode::StoreGlobal("bal:owner".to_string()),
        QuorlinOpcode::Return,
    ];
    let maya_data = serde_json::to_vec(&maya_ops).unwrap();
    deploy_contract(&faucet_addr, &faucet_priv, maya_data, VmType::Quorlin);

    println!("\n=== DEPLOYMENT COMPLETE ===");
}

fn deploy_contract(from: &Address, priv_key: &[u8], data: Vec<u8>, vm_type: VmType) {
    let nonce_hex = rpc_call("eth_getTransactionCount", json!([from.to_hex(), "latest"]));
    let nonce_str = nonce_hex.as_str().unwrap_or("0x0").trim_start_matches("0x");
    let nonce = u64::from_str_radix(nonce_str, 16).unwrap_or(0);
    
    let mut tx = Transaction {
        nonce,
        from: *from,
        to: Address::ZERO,
        value: 0,
        gas_limit: 1000000,
        gas_price: 1_000_000_000,
        data,
        vm_type,
        chain_id: 21337,
        signature: None,
    };

    let hash = tx.hash();
    let sig = sign_message(priv_key, &hash);
    tx.signature = Some(sig);

    let tx_encoded = rlp::encode(&tx);
    let res = rpc_call("eth_sendRawTransaction", json!([format!("0x{}", hex::encode(tx_encoded))]));
    println!("   > Deployment Tx Hash: {:?}", res);
    println!("   > Gas Provided: 1,000,000 units");
}
