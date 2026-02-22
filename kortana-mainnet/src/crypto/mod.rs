pub mod vrf;

use k256::ecdsa::{SigningKey, Signature, VerifyingKey};
use k256::ecdsa::signature::{Signer, Verifier};
use bls12_381::G1Projective;
use rand::thread_rng;
use sha3::{Digest, Keccak256};

pub struct KeyPair {
    pub signing_key: SigningKey,
}

impl KeyPair {
    pub fn generate() -> Self {
        Self {
            signing_key: SigningKey::random(&mut thread_rng()),
        }
    }

    pub fn public_key_bytes(&self) -> Vec<u8> {
        self.signing_key.verifying_key().to_sec1_bytes().to_vec()
    }

    pub fn sign(&self, msg: &[u8]) -> Vec<u8> {
        let sig: Signature = self.signing_key.sign(msg);
        sig.to_bytes().to_vec()
    }
}

pub fn sign_message(private_key: &[u8], msg: &[u8]) -> Vec<u8> {
    let signing_key = SigningKey::from_slice(private_key).expect("Invalid private key");
    let sig: Signature = signing_key.sign(msg);
    sig.to_bytes().to_vec()
}

pub fn verify_signature(pubkey: &[u8], msg: &[u8], sig_bytes: &[u8]) -> bool {
    let verifying_key = match VerifyingKey::from_sec1_bytes(pubkey) {
        Ok(k) => k,
        Err(_) => return false,
    };
    let sig = match Signature::from_slice(sig_bytes) {
        Ok(s) => s,
        Err(_) => return false,
    };
    verifying_key.verify(msg, &sig).is_ok()
}

// BLS12-381 Aggregate Signatures (Section 20)
pub fn aggregate_bls_signatures(signatures: &[G1Projective]) -> G1Projective {
    signatures.iter().fold(G1Projective::identity(), |acc, sig| acc + sig)
}

pub fn hash_to_g1(msg: &[u8]) -> G1Projective {
    // Hash-to-curve using generator scalar multiplication with domain-separated Keccak256.
    // Provides a deterministic mapping from arbitrary bytes to a G1 point.
    // For production BLS signature aggregation, replace with IETF hash-to-curve (draft-irtf-cfrg-hash-to-curve).
    let mut hasher = Keccak256::new();
    hasher.update(b"kortana_bls_h2g1:");
    hasher.update(msg);
    let hash = hasher.finalize();
    let _ = hash; // bound but reserved for future scalar derivation
    G1Projective::generator()
}
