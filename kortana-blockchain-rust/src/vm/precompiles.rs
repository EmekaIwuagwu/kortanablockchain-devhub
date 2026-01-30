// File: src/vm/precompiles.rs

use crate::address::Address;
use sha3::{Digest, Sha3_256, Keccak256};
use crate::crypto;

pub type PrecompileFn = fn(&[u8]) -> Result<Vec<u8>, String>;

pub fn get_precompile(addr: &Address) -> Option<PrecompileFn> {
    let bytes = addr.as_evm_address();
    // Standard EVM precompile addresses (1-9)
    match bytes[19] {
        1 => Some(ecrecover),
        2 => Some(sha256_precompile),
        3 => Some(ripemd160_precompile),
        4 => Some(identity_precompile),
        _ => None,
    }
}

fn ecrecover(input: &[u8]) -> Result<Vec<u8>, String> {
    // Input is 128 bytes: [hash][v][r][s]
    let mut data = [0u8; 128];
    let len = std::cmp::min(input.len(), 128);
    data[..len].copy_from_slice(&input[..len]);

    let hash = &data[0..32];
    let v_raw = data[63]; // v is at 32-64, but usually only the last byte matters
    let r = &data[64..96];
    let s = &data[96..128];
    
    // Normalize V to 0 or 1
    let v = if v_raw >= 27 { v_raw - 27 } else { v_raw };
    if v > 1 { return Ok(vec![0u8; 32]); } // Invalid V

    use k256::ecdsa::{Signature, VerifyingKey};
    
    let signature = match Signature::from_slice(&data[64..128]) {
        Ok(s) => s,
        Err(_) => return Ok(vec![0u8; 32]),
    };

    let recovery_id = k256::ecdsa::RecoveryId::from_byte(v).ok_or("Invalid recovery ID")?;
    
    if let Ok(recovered_key) = VerifyingKey::recover_from_prehash(hash, &signature, recovery_id) {
        let encoded = recovered_key.to_encoded_point(false);
        let public_key = &encoded.as_bytes()[1..]; // Remove 0x04 prefix
        
        let mut hasher = Keccak256::new();
        hasher.update(public_key);
        let hash_res = hasher.finalize();
        
        let mut out = [0u8; 32];
        out[12..32].copy_from_slice(&hash_res[12..32]);
        Ok(out.to_vec())
    } else {
        Ok(vec![0u8; 32])
    }
}

fn sha256_precompile(input: &[u8]) -> Result<Vec<u8>, String> {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(input);
    Ok(hasher.finalize().to_vec())
}

fn ripemd160_precompile(input: &[u8]) -> Result<Vec<u8>, String> {
    // Requires ripemd crate, skipping for now or using placeholder
    Ok(input.to_vec()) 
}

fn identity_precompile(input: &[u8]) -> Result<Vec<u8>, String> {
    Ok(input.to_vec())
}
