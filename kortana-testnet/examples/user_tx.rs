
use kortana_blockchain_rust::types::transaction::{Transaction, VmType};
use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::crypto::sign_message;
use std::process::Command;
use serde_json::json;

// Use the public RPC URL seen in the codebase
const RPC_URL: &str = "https://poseidon-rpc.kortana.worchsester.xyz";

fn rpc_call(method: &str, params: serde_json::Value) -> serde_json::Value {
    let json_body = json!({
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    });

    // Use curl.exe for Windows compatibility in this environment
    let output = Command::new("curl.exe")
        .arg("-k")
        .arg("-s")
        .arg("-X").arg("POST")
        .arg("-H").arg("Content-Type: application/json")
        .arg("-d").arg(json_body.to_string())
        .arg(RPC_URL)
        .output()
        .expect("Failed to execute curl");

    let stdout = String::from_utf8_lossy(&output.stdout);
    if stdout.is_empty() {
        return json!({"error": {"message": "Empty response from RPC. Server might be down or unreachable."}});
    }
    
    let v: serde_json::Value = serde_json::from_str(&stdout).unwrap_or_else(|_| {
        json!({"error": {"message": format!("Could not parse RPC response: {}", stdout)}})
    });
    
    v
}

fn main() {
    println!("=== KORTANA TRANSACTION SENDER ===");

    // User address
    let dest_addr_str = "0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9";
    let to_addr = Address::from_hex(dest_addr_str).expect("Invalid destination address");
    
    // Faucet credentials from spec
    let faucet_priv = hex::decode("2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa").unwrap();
    let faucet_addr = Address::from_hex("kn:0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64").unwrap();

    println!("From: {}", faucet_addr);
    println!("To:   {} (Kortana Format)", to_addr);
    println!("Original To: {}", dest_addr_str);

    // 1. Get Nonce
    println!("\n[1/3] Fetching nonce for faucet...");
    let res = rpc_call("eth_getTransactionCount", json!([faucet_addr.to_hex(), "latest"]));
    if let Some(err) = res.get("error") {
        println!("Error fetching nonce: {}", err);
        return;
    }
    
    let nonce_str = res["result"].as_str().unwrap_or("0x0").trim_start_matches("0x");
    let nonce = u64::from_str_radix(nonce_str, 16).unwrap_or(0);
    println!("Nonce: {}", nonce);

    // 2. Construct Transaction (Transfer 3,500,000 DNR)
    let amount_dnr: u128 = 3_500_000;
    let value = amount_dnr * 10u128.pow(18);

    let mut tx = Transaction {
        nonce,
        from: faucet_addr,
        to: to_addr,
        value,
        gas_limit: 21000,
        gas_price: 1_000_000_000, // 1 Gwei
        data: vec![],
        vm_type: VmType::EVM,
        chain_id: 72511,
        signature: None,
        cached_hash: None,
    };

    let hash = tx.hash();
    let sig = sign_message(&faucet_priv, &hash);
    tx.signature = Some(sig);

    let tx_encoded = rlp::encode(&tx);
    let tx_hex = format!("0x{}", hex::encode(tx_encoded));

    // 3. Send Transaction
    println!("\n[2/3] Sending 3,500,000 DNR transaction...");
    let res = rpc_call("eth_sendRawTransaction", json!([tx_hex]));
    
    if let Some(err) = res.get("error") {
        println!("Error sending transaction: {}", err);
    } else {
        println!("Success! Transaction Hash: {}", res["result"]);
        println!("\n[3/3] Wait a few seconds for block production, then check your address on the explorer:");
        println!("Address: {}", dest_addr_str);
    }
}

