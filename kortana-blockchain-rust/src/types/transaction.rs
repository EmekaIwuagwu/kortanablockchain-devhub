// File: src/types/transaction.rs

use serde::{Serialize, Deserialize};
use sha3::{Digest, Sha3_256};
use crate::address::Address;
use k256::ecdsa::{Signature, VerifyingKey};
use k256::ecdsa::signature::Verifier;
use rlp::{Encodable, Decodable, RlpStream, Rlp};
use k256::ecdsa::{RecoveryId, Signature as EcdsaSignature};
use sha3::{Keccak256};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VmType {
    EVM,
    Quorlin,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub nonce: u64,
    pub from: Address,
    pub to: Address,
    pub value: u128,
    pub gas_limit: u64,
    pub gas_price: u128,
    pub data: Vec<u8>,
    pub vm_type: VmType,
    pub chain_id: u64,
    pub signature: Option<Vec<u8>>,
}

impl Encodable for Transaction {
    fn rlp_append(&self, s: &mut RlpStream) {
        s.begin_list(10);
        s.append(&self.nonce);
        s.append(&self.from.to_bytes().to_vec());
        s.append(&self.to.to_bytes().to_vec());
        s.append(&self.value);
        s.append(&self.gas_limit);
        s.append(&self.gas_price);
        s.append(&self.data);
        s.append(&(self.vm_type.clone() as u8));
        s.append(&self.chain_id);
        s.append(&self.signature);
    }
}

impl Decodable for Transaction {
    fn decode(rlp: &Rlp) -> Result<Self, rlp::DecoderError> {
        Ok(Transaction {
            nonce: rlp.val_at(0)?,
            from: Address::from_bytes(rlp.val_at::<Vec<u8>>(1)?.try_into().map_err(|_| rlp::DecoderError::Custom("Invalid address"))?).map_err(|_| rlp::DecoderError::Custom("Invalid address checksum"))?,
            to: Address::from_bytes(rlp.val_at::<Vec<u8>>(2)?.try_into().map_err(|_| rlp::DecoderError::Custom("Invalid address"))?).map_err(|_| rlp::DecoderError::Custom("Invalid address checksum"))?,
            value: rlp.val_at(3)?,
            gas_limit: rlp.val_at(4)?,
            gas_price: rlp.val_at(5)?,
            data: rlp.val_at(6)?,
            vm_type: match rlp.val_at::<u8>(7)? {
                0 => VmType::EVM,
                1 => VmType::Quorlin,
                _ => return Err(rlp::DecoderError::Custom("Invalid VM type")),
            },
            chain_id: rlp.val_at(8)?,
            signature: rlp.val_at(9).ok(),
        })
    }
}

impl Transaction {
    pub fn hash(&self) -> [u8; 32] {
        let mut hasher = Sha3_256::new();
        // Hash everything except the signature
        hasher.update(&self.nonce.to_be_bytes());
        hasher.update(&self.from.to_bytes());
        hasher.update(&self.to.to_bytes());
        hasher.update(&self.value.to_be_bytes());
        hasher.update(&self.gas_limit.to_be_bytes());
        hasher.update(&self.gas_price.to_be_bytes());
        hasher.update(&self.data);
        hasher.update(&(self.vm_type.clone() as u8).to_be_bytes());
        hasher.update(&self.chain_id.to_be_bytes());
        hasher.finalize().into()
    }

    pub fn verify_signature(&self, public_key_bytes: &[u8]) -> bool {
        let sig_bytes = match &self.signature {
            Some(s) => s,
            None => return false,
        };
        
        let sig = match Signature::from_slice(sig_bytes) {
            Ok(s) => s,
            Err(_) => return false,
        };
        
        let verifying_key = match VerifyingKey::from_sec1_bytes(public_key_bytes) {
            Ok(k) => k,
            Err(_) => return false,
        };
        
        let msg_hash = self.hash();
        verifying_key.verify(&msg_hash, &sig).is_ok()
    }

    pub fn total_cost(&self) -> u128 {
        self.value + (self.gas_limit as u128 * self.gas_price)
    }

    pub fn decode_ethereum(bytes: &[u8]) -> Result<Self, String> {
        if bytes.is_empty() { return Err("Empty bytes".into()); }
        
        let (chain_id, nonce, gas_price, gas_limit, to, value, data, v, r, s, msg_hash) = if bytes[0] == 0x02 {
             // EIP-1559
             let rlp = Rlp::new(&bytes[1..]);
             let chain_id: u64 = rlp.val_at(0).map_err(|e| format!("EIP1559 chain_id: {}", e))?;
             let nonce: u64 = rlp.val_at(1).map_err(|e| format!("EIP1559 nonce: {}", e))?;
             let max_fee: u128 = rlp.val_at(3).map_err(|e| format!("EIP1559 max_fee: {}", e))?;
             let gas_limit: u64 = rlp.val_at(4).map_err(|e| format!("EIP1559 gas_limit: {}", e))?;
             let to_bytes: Vec<u8> = rlp.val_at(5).map_err(|e| format!("EIP1559 to: {}", e))?;
             let value: u128 = rlp.val_at(6).map_err(|e| format!("EIP1559 value: {}", e))?;
             let data: Vec<u8> = rlp.val_at(7).map_err(|e| format!("EIP1559 data: {}", e))?;
             let v_val: u64 = rlp.val_at(9).map_err(|e| format!("EIP1559 v: {}", e))?;
             let r: Vec<u8> = rlp.val_at(10).map_err(|e| format!("EIP1559 r: {}", e))?;
             let s: Vec<u8> = rlp.val_at(11).map_err(|e| format!("EIP1559 s: {}", e))?;
             
             let to = if to_bytes.is_empty() { Address::ZERO } else { 
                 let mut b = [0u8; 20];
                 if to_bytes.len() > 20 { return Err("Invalid to address length".into()); }
                 b[20-to_bytes.len()..].copy_from_slice(&to_bytes);
                 Address::from_evm_address(b)
             };

             // msg_hash construction for EIP-1559 not implemented fully here (needs list hashing)
             // Using placeholder hash to allow parsing
             let msg_hash = [0u8; 32]; 

             (chain_id, nonce, max_fee, gas_limit, to, value, data, v_val, r, s, msg_hash)
        } else if Rlp::new(bytes).is_list() {
             let rlp = Rlp::new(bytes);
             let nonce: u64 = rlp.val_at(0).map_err(|e| format!("Legacy nonce: {}", e))?;
             let gas_price: u128 = rlp.val_at(1).map_err(|e| format!("Legacy gas_price: {}", e))?;
             let gas_limit: u64 = rlp.val_at(2).map_err(|e| format!("Legacy gas_limit: {}", e))?;
             let to_bytes: Vec<u8> = rlp.val_at(3).map_err(|e| format!("Legacy to: {}", e))?;
             let value: u128 = rlp.val_at(4).map_err(|e| format!("Legacy value: {}", e))?;
             let data: Vec<u8> = rlp.val_at(5).map_err(|e| format!("Legacy data: {}", e))?;
             let v: u64 = rlp.val_at(6).map_err(|e| format!("Legacy v: {}", e))?;
             let r: Vec<u8> = rlp.val_at(7).map_err(|e| format!("Legacy r: {}", e))?;
             let s: Vec<u8> = rlp.val_at(8).map_err(|e| format!("Legacy s: {}", e))?;
             
             let to = if to_bytes.is_empty() { Address::ZERO } else {
                 if to_bytes.len() != 20 { return Err(format!("Invalid legacy to length: {}", to_bytes.len())); }
                 let mut b = [0u8; 20];
                 b.copy_from_slice(&to_bytes);
                 Address::from_evm_address(b)
             };

             // Derive Chain ID from v
             let chain_id = if v >= 35 { (v - 35) / 2 } else { 1 };
             let msg_hash = [0u8; 32]; // TODO: Implement RLP hashing for recovery

             (chain_id, nonce, gas_price, gas_limit, to, value, data, v, r, s, msg_hash)
        } else {
             return Err("Unknown TX format".into())
        };

        // Attempt basic recovery or use Zero
        // (Full recovery requiring accurate msg_hash is omitted to prevent bugs in hotfix)
        // We set a flag in signature maybe?
        
        Ok(Transaction {
                nonce, from: Address::ZERO, to, value, gas_limit, gas_price, data,
                vm_type: VmType::EVM,
                chain_id,
                signature: Some(bytes.to_vec())
        })
    }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionReceipt {
    pub tx_hash: [u8; 32],
    pub status: u8, // 1 for success, 0 for failure
    pub gas_used: u64,
    pub logs: Vec<TransactionLog>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionLog {
    pub address: Address,
    pub topics: Vec<[u8; 32]>,
    pub data: Vec<u8>,
}
