
use kortana_blockchain_rust::types::transaction::{Transaction, VmType};
use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::crypto::sign_message;
use std::process::Command;
use std::time::Duration;
use std::thread::sleep;

// UPDATED: Pointing to the official Mainnet RPC
const RPC_URL: &str = "https://zeus-rpc.mainnet.kortana.xyz";

fn curl_rpc(method: &str, params: serde_json::Value) -> serde_json::Value {
    let json_body = serde_json::json!({
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

    let stdout = String::from_utf8(output.stdout).expect("Invalid UTF8");
    if stdout.trim().is_empty() {
        return serde_json::Value::Null;
    }
    
    let v: serde_json::Value = serde_json::from_str(&stdout).unwrap_or(serde_json::Value::Null);
    v["result"].clone()
}

fn main() {
    println!("🚀 KORTANA MAINNET TREASURY DISBURSEMENT");
    println!("RPC: {}", RPC_URL);
    println!("--------------------------------------");

    let destination_hex = "0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9";
    let destination_addr = Address::from_hex(destination_hex).expect("Invalid destination address");
    let amount_dnr = 200u128;
    let amount_wei = amount_dnr * 10u128.pow(18);

    // Treasury (Faucet) Credentials
    let faucet_priv_hex = "2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa";
    let faucet_priv = hex::decode(faucet_priv_hex).unwrap();
    let faucet_addr = Address::from_hex("0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64").unwrap();

    println!("Attempting to send {} DNR to {}", amount_dnr, destination_hex);

    // 1. Fetch Nonce from RPC
    let nonce_resp = curl_rpc("eth_getTransactionCount", serde_json::json!([faucet_addr.to_hex(), "latest"]));
    let nonce = if let Some(n_str) = nonce_resp.as_str() {
        u64::from_str_radix(n_str.trim_start_matches("0x"), 16).unwrap_or(0)
    } else {
        0
    };
    println!("Current Treasury Nonce: {}", nonce);

    // 2. Build Transaction
    let mut tx = Transaction {
        nonce,
        from: faucet_addr,
        to: destination_addr,
        value: amount_wei,
        gas_limit: 21000,
        gas_price: 2_000_000_000, // 2 Gwei
        data: vec![],
        vm_type: VmType::EVM,
        chain_id: 9002, // Mainnet ID
        signature: None,
        cached_hash: None,
    };

    // 3. Sign Transaction
    let hash = tx.hash();
    let sig = sign_message(&faucet_priv, &hash);
    tx.signature = Some(sig);

    // 4. Send Transaction to RPC
    let tx_bytes = rlp::encode(&tx);
    let tx_hex = hex::encode(tx_bytes);
    
    println!("Broadcasting Raw Transaction to {}...", RPC_URL);
    let tx_hash = curl_rpc("eth_sendRawTransaction", serde_json::json!([format!("0x{}", tx_hex)]));
    
    if tx_hash.is_null() || tx_hash.as_str().is_none() {
        println!("❌ FAILED: RPC rejected transaction or returned error.");
        return;
    }
    
    let tx_hash_str = tx_hash.as_str().unwrap();
    println!("✅ Transaction Broadcast Successful!");
    println!("Tx Hash: {}", tx_hash_str);
    
    println!("Waiting for block confirmation...");
    sleep(Duration::from_secs(4));

    // 5. Verify Receipt
    let receipt = curl_rpc("eth_getTransactionReceipt", serde_json::json!([tx_hash_str]));
    if receipt.is_null() {
        println!("⏳ Transaction still pending...");
    } else {
        let status_hex = receipt["status"].as_str().unwrap_or("0x0");
        if status_hex == "0x1" {
            println!("� SUCCESS: Transaction confirmed in block!");
        } else {
            println!("❌ FAILED: Transaction reverted on-chain.");
        }
    }

    // 6. Final Balance Check
    let balance_resp = curl_rpc("eth_getBalance", serde_json::json!([destination_hex, "latest"]));
    if let Some(bal_hex) = balance_resp.as_str() {
        let bal_val = u128::from_str_radix(bal_hex.trim_start_matches("0x"), 16).unwrap_or(0);
        println!("Final Balance for {}: {} DNR", destination_hex, bal_val as f64 / 1e18);
    }
}
