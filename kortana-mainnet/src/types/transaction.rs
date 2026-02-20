// File: src/types/transaction.rs

use serde::{Serialize, Deserialize};
use sha3::{Digest, Keccak256};
use crate::address::Address;
use k256::ecdsa::{Signature, VerifyingKey};
use k256::ecdsa::signature::Verifier;
use rlp::{Encodable, Decodable, RlpStream, Rlp};
use k256::ecdsa::{RecoveryId, Signature as EcdsaSignature};

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
    #[serde(skip)]
    pub cached_hash: Option<[u8; 32]>,
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
        s.append(&(0u8)); // Always EVM
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
            vm_type: VmType::EVM, // Always EVM
            chain_id: rlp.val_at(8)?,
            signature: rlp.val_at(9).ok(),
            cached_hash: None,
        })
    }
}

impl Transaction {
    pub fn hash(&self) -> [u8; 32] {
        if let Some(h) = self.cached_hash {
            return h;
        }

        // Fallback to custom hashing if no cached hash (e.g. for internally created txs)
        let mut hasher = Keccak256::new();
        hasher.update(self.nonce.to_be_bytes());
        hasher.update(self.from.to_bytes());
        hasher.update(self.to.to_bytes());
        hasher.update(self.value.to_be_bytes());
        hasher.update(self.gas_limit.to_be_bytes());
        hasher.update(self.gas_price.to_be_bytes());
        hasher.update(&self.data);
        hasher.update((self.vm_type.clone() as u8).to_be_bytes());
        hasher.update(self.chain_id.to_be_bytes());
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
        
        let (chain_id, nonce, gas_price, gas_limit, to, value, data, v, r, s, signing_hash) = if bytes[0] == 0x02 {
             // EIP-1559: 0x02 || rlp([chain_id, nonce, max_priority_fee, max_fee, gas_limit, to, value, data, access_list])
             let rlp = Rlp::new(&bytes[1..]);
             let chain_id: u64 = rlp.val_at(0).map_err(|e| format!("EIP1559 chain_id: {}", e))?;
             let nonce: u64 = rlp.val_at(1).map_err(|e| format!("EIP1559 nonce: {}", e))?;
             let max_priority_fee: u128 = rlp.val_at(2).map_err(|e| format!("EIP1559 max_prio: {}", e))?;
             let max_fee: u128 = rlp.val_at(3).map_err(|e| format!("EIP1559 max_fee: {}", e))?;
             let gas_limit: u64 = rlp.val_at(4).map_err(|e| format!("EIP1559 gas_limit: {}", e))?;
             let to_bytes: Vec<u8> = rlp.val_at(5).map_err(|e| format!("EIP1559 to: {}", e))?;
             let value: u128 = rlp.val_at(6).map_err(|e| format!("EIP1559 value: {}", e))?;
             let data: Vec<u8> = rlp.val_at(7).map_err(|e| format!("EIP1559 data: {}", e))?;
             // access_list is an RLP list (e.g. 0xc0 for empty), NOT raw bytes.
             // Use at().as_raw() to grab the raw RLP encoding so we can reconstruct the signing hash exactly.
             let access_list_raw: Vec<u8> = rlp.at(8).map_err(|e| format!("EIP1559 access_list pos: {}", e))?.as_raw().to_vec();
             let v_val: u64 = rlp.val_at(9).map_err(|e| format!("EIP1559 v: {}", e))?;
             let r_bytes: Vec<u8> = rlp.val_at(10).map_err(|e| format!("EIP1559 r: {}", e))?;
             let s_bytes: Vec<u8> = rlp.val_at(11).map_err(|e| format!("EIP1559 s: {}", e))?;
             
             let to = if to_bytes.is_empty() { Address::ZERO } else { 
                 let mut b = [0u8; 20];
                 b[20-to_bytes.len()..].copy_from_slice(&to_bytes);
                 Address::from_evm_address(b)
             };

             // Reconstruct signing data for EIP-1559: 0x02 || rlp([chain_id, nonce, max_priority_fee, max_fee, gas_limit, to, value, data, access_list])
             let mut s_rlp = RlpStream::new_list(9);
             s_rlp.append(&chain_id).append(&nonce).append(&max_priority_fee).append(&max_fee)
                  .append(&gas_limit).append(&to_bytes).append(&value).append(&data)
                  .append_raw(&access_list_raw, 1); // append raw RLP list node verbatim

             
             let mut msg = vec![0x02];
             msg.extend_from_slice(&s_rlp.out());
             let mut hasher = Keccak256::new();
             hasher.update(&msg);
             let hash: [u8; 32] = hasher.finalize().into();

             (chain_id, nonce, max_fee, gas_limit, to, value, data, v_val, r_bytes, s_bytes, hash)
        } else if Rlp::new(bytes).is_list() {
             // Legacy: [nonce, gasPrice, gasLimit, to, value, data, v, r, s]
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
                 let mut b = [0u8; 20];
                 b[20-to_bytes.len()..].copy_from_slice(&to_bytes);
                 Address::from_evm_address(b)
             };

             let chain_id = if v >= 35 { (v - 35) / 2 } else { 72511 };
             
             // Reconstruct signing data for Legacy/EIP-155
             let mut s_rlp = RlpStream::new_list(9);
             s_rlp.append(&nonce).append(&gas_price).append(&gas_limit).append(&to_bytes)
                  .append(&value).append(&data).append(&chain_id).append(&0u8).append(&0u8);
             
             let mut hasher = Keccak256::new();
             hasher.update(s_rlp.out());
             let hash: [u8; 32] = hasher.finalize().into();

             (chain_id, nonce, gas_price, gas_limit, to, value, data, v, r, s, hash)
        } else {
             return Err("Unknown TX format".into())
        };

        // Cryptographic Sender Recovery (Ecrecover)
        if r.len() != 32 || s.len() != 32 { return Err("Invalid signature component length".into()); }
        let mut sig_bytes = [0u8; 64];
        sig_bytes[0..32].copy_from_slice(&r);
        sig_bytes[32..64].copy_from_slice(&s);
        
        let signature = EcdsaSignature::from_slice(&sig_bytes).map_err(|e| format!("Sig error: {}", e))?;
        let recovery_id = if bytes[0] == 0x02 {
            RecoveryId::try_from(v as u8).map_err(|_| "Invalid recovery ID")?
        } else {
            let rec_v = if v >= 35 { (v - 35) % 2 } else { v % 2 };
            RecoveryId::try_from(rec_v as u8).map_err(|_| "Invalid legacy recovery ID")?
        };

        let recovered_key = VerifyingKey::recover_from_prehash(&signing_hash, &signature, recovery_id)
            .map_err(|_| "Failed to recover public key")?;
        
        let encoded_pub = recovered_key.to_encoded_point(false);
        let pub_bytes = encoded_pub.as_bytes(); // [0x04, x_bytes, y_bytes]
        
        // Use Keccak256 on the public key (excluding the 0x04 prefix) to get the Ethereum address
        let mut hasher = Keccak256::new();
        hasher.update(&pub_bytes[1..]);
        let hash = hasher.finalize();
        let mut evm_addr = [0u8; 20];
        evm_addr.copy_from_slice(&hash[12..32]);
        
        let from = Address::from_evm_address(evm_addr);
        
        Ok(Transaction {
                nonce, from, to, value, gas_limit, gas_price, data,
                vm_type: VmType::EVM,
                chain_id,
                signature: Some(bytes.to_vec()), 
                cached_hash: None,
        })
    }

}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionReceipt {
    pub tx_hash: [u8; 32],
    pub status: u8, // 1 for success, 0 for failure
    pub gas_used: u64,
    pub logs: Vec<TransactionLog>,
    pub contract_address: Option<Address>, // Contract address for deployments
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionLog {
    pub address: Address,
    pub topics: Vec<[u8; 32]>,
    pub data: Vec<u8>,
}
