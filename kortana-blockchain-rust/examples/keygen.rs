fn main() {
    // Generate a valid Secp256k1 keypair
    use k256::ecdsa::{SigningKey, VerifyingKey};
    use k256::elliptic_curve::rand_core::OsRng;
    use sha3::{Digest, Keccak256, Sha3_256};

    let signing_key = SigningKey::random(&mut OsRng);
    let verify_key = signing_key.verifying_key();
    let pubkey_bytes = verify_key.to_sec1_bytes().to_vec();
    
    // Calculate Address (Kortana style)
    // 1. SHA3-256 of pubkey
    let mut hasher = Sha3_256::new();
    hasher.update(&pubkey_bytes);
    let result = hasher.finalize();
    
    // 2. Take first 20 bytes
    let mut addr_bytes = [0u8; 24];
    addr_bytes[0..20].copy_from_slice(&result[0..20]);
    
    // 3. Checksum
    let mut k_hasher = Keccak256::new();
    k_hasher.update(&addr_bytes[0..20]);
    let k_res = k_hasher.finalize();
    addr_bytes[20..24].copy_from_slice(&k_res[0..4]);
    
    println!("Private Key (hex): {}", hex::encode(signing_key.to_bytes()));
    println!("Public Key (hex): {}", hex::encode(pubkey_bytes));
    println!("Address (hex): kn:0x{}", hex::encode(addr_bytes));
}
