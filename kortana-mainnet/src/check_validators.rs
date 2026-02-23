use kortana_blockchain_rust::address::Address;

fn main() {
    let validator_keys = vec![
        b"genesis_validator_1",
        b"genesis_validator_2",
        b"genesis_validator_3",
    ];

    for key in validator_keys {
        let addr = Address::from_pubkey(key);
        println!("Validator Key: {:?}, Address: {}", String::from_utf8_lossy(key), addr.to_hex());
    }
}
