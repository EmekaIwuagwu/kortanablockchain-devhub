
use kortana_blockchain_rust::address::Address;
use std::process::Command;
use serde_json::json;

const RPC_URL: &str = "http://127.0.0.1:8545";

fn rpc_call(method: &str, params: serde_json::Value) -> serde_json::Value {
    let json_body = json!({
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    });

    let output = Command::new("curl.exe")
        .arg("-s")
        .arg("-X").arg("POST")
        .arg("-H").arg("Content-Type: application/json")
        .arg("-d").arg(json_body.to_string())
        .arg(RPC_URL)
        .output()
        .expect("Failed to execute curl");

    let stdout = String::from_utf8_lossy(&output.stdout);
    let v: serde_json::Value = serde_json::from_str(&stdout).unwrap_or(json!({}));
    v
}

fn main() {
    let dest_addr_str = "0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9";
    let addr = Address::from_hex(dest_addr_str).unwrap();

    println!("Checking status for: {}", addr);
    
    let res = rpc_call("eth_getBalance", json!([addr.to_hex(), "latest"]));
    println!("Balance: {}", res["result"]);

    let res = rpc_call("eth_getAddressHistory", json!([addr.to_hex()]));
    println!("History: {}", serde_json::to_string_pretty(&res["result"]).unwrap());
}
