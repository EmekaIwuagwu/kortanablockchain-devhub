// File: src/crypto/vrf.rs

use sha3::{Digest, Sha3_256};
use crate::address::Address;

pub struct VrfSeed {
    pub proof: Vec<u8>,
    pub output: [u8; 32],
}

pub fn generate_vrf_seed(private_key: &[u8], epoch_seed: &[u8], slot: u64) -> VrfSeed {
    // In a production environment, this would use a proper VRF library (like ed25519-vrf)
    // Here we simulate the property that the output is deterministic based on private key + slot
    let mut hasher = Sha3_256::new();
    hasher.update(private_key);
    hasher.update(epoch_seed);
    hasher.update(&slot.to_be_bytes());
    let output: [u8; 32] = hasher.finalize().into();
    
    // The "proof" would allow anyone with the public key to verify this output was generated correctly
    let proof = output.to_vec(); // Placeholder for actual proof
    
    VrfSeed { proof, output }
}

pub fn verify_vrf(_public_key: &[u8], _seed: &[u8], _slot: u64, _proof: &[u8], _output: &[u8; 32]) -> bool {
    // Production: verify the VRF proof
    // For now, we simulate success
    true
}

pub fn get_leader_from_vrf(vrf_output: [u8; 32], active_validators: &[Address]) -> Address {
    let index = (u64::from_be_bytes(vrf_output[0..8].try_into().unwrap()) % active_validators.len() as u64) as usize;
    active_validators[index]
}
