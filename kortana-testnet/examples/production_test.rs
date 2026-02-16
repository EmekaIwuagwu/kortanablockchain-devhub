
use kortana_blockchain_rust::types::transaction::{Transaction, VmType};
use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::crypto::sign_message;
use std::process::Command;
use std::time::Duration;
use std::thread::sleep;


fn curl_rpc(method: &str, params: serde_json::Value) -> serde_json::Value {
    let json_body = serde_json::json!({
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    });

    let output = Command::new("curl")
        .arg("-X").arg("POST")
        .arg("-H").arg("Content-Type: application/json")
        .arg("-d").arg(json_body.to_string())
        .arg("http://127.0.0.1:8545")
        .output()
        .expect("Failed to execute curl");

    let stdout = String::from_utf8(output.stdout).expect("Invalid UTF8");
    if stdout.trim().is_empty() {
        println!("Empty response from Node. Is it running?");
        return serde_json::Value::Null;
    }
    
    let v: serde_json::Value = serde_json::from_str(&stdout).unwrap_or_else(|_| {
        println!("Failed to parse JSON: {}", stdout);
        serde_json::Value::Null
    });
    println!("DEBUG RPC RESP: {:?}", v);
    v["result"].clone()
}

fn main() {
    println!("=== KORTANA PRODUCTION READINESS TEST ===");

    // 1. Generate Alice
    let alice_priv_bytes = [1u8; 32]; // Deterministic for test
    let signing_key = k256::ecdsa::SigningKey::from_slice(&alice_priv_bytes).unwrap();
    let pubkey = signing_key.verifying_key().to_sec1_bytes().to_vec();
    let alice_addr = Address::from_pubkey(&pubkey);
    println!("1. Created Alice: {}", alice_addr.to_hex());

    // 2. Check Initial Balance
    println!("2. Checking Alice's Initial Balance...");
    let balance_hex = curl_rpc("eth_getBalance", serde_json::json!([alice_addr.to_hex(), "latest"]));
    println!("   > Alice Balance (Hex): {}", balance_hex);
    
    if balance_hex != "0x0" && balance_hex != serde_json::Value::Null {
         println!("   WARNING: Balance not zero? {}", balance_hex);
    }

    // 3. Prepare Transaction from Faucet
    // Faucet Priv: 2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa
    // Faucet Addr: kn:0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64
    let faucet_priv = hex::decode("2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa").unwrap();
    let faucet_addr = Address::from_hex("kn:0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64").unwrap();

    // Fetch Nonce
    let nonce_hex = curl_rpc("eth_getTransactionCount", serde_json::json!([faucet_addr.to_hex(), "latest"]));
    let nonce = u64::from_str_radix(nonce_hex.as_str().unwrap().trim_start_matches("0x"), 16).unwrap_or(0);
    println!("   > Faucet Nonce: {}", nonce);

    let mut tx = Transaction {
        nonce,
        from: faucet_addr,
        to: alice_addr,
        value: 100_000_000_000_000_000_000, // 100 DNR
        gas_limit: 21000,
        gas_price: 2_000_000_000, // 2 Gwei
        data: vec![],
        vm_type: VmType::EVM,
        chain_id: 1, // Mainnet
        signature: None,
        cached_hash: None,
    };

    println!("3. Signing Transaction (Mint 100 DNR to Alice)...");
    let hash = tx.hash();
    let sig = sign_message(&faucet_priv, &hash);
    tx.signature = Some(sig);

    // Encode Tx
    let tx_bytes = rlp::encode(&tx);
    let tx_hex = hex::encode(tx_bytes);
    
    // 4. Send Transaction
    println!("4. Sending Transaction...");
    let tx_hash = curl_rpc("eth_sendRawTransaction", serde_json::json!([format!("0x{}", tx_hex)]));
    println!("   > Tx Hash: {}", tx_hash);

    // 5. Wait for confirmation
    println!("5. Waiting for Block Confirmation (10s)...");
    sleep(Duration::from_secs(10));

    // 6. Check Balance Again
    let balance_hex_new = curl_rpc("eth_getBalance", serde_json::json!([alice_addr.to_hex(), "latest"]));
    println!("   > Alice Balance After: {}", balance_hex_new);

    // Decode balance
    let bal_val = u128::from_str_radix(balance_hex_new.as_str().unwrap().trim_start_matches("0x"), 16).unwrap_or(0);
    println!("   > Alice Balance (Dec): {} DNR", bal_val as f64 / 1e18);

    if bal_val > 0 {
        println!("PASSED: Token Minting Successful!");
    } else {
        println!("FAILED: Balance did not increase.");
    }
}
