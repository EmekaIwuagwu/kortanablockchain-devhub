use crate::types::block::Block;

use sled::Db;

pub struct Storage {
    db: Db,
}

impl Storage {
    pub fn new(path: &str) -> Self {
        let db = sled::open(path).expect("Failed to open sled database");
        Self { db }
    }

    pub fn put_block(&self, block: &Block) -> Result<(), String> {
        let key = format!("block:{}", block.header.height);
        let val = serde_json::to_vec(block).map_err(|e| e.to_string())?;
        self.db.insert(key, val).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_block(&self, height: u64) -> Result<Option<Block>, String> {
        let key = format!("block:{}", height);
        let val = self.db.get(key).map_err(|e| e.to_string())?;
        match val {
            Some(data) => Ok(Some(serde_json::from_slice(&data).map_err(|e| e.to_string())?)),
            None => Ok(None),
        }
    }

    pub fn put_state_root(&self, height: u64, root: [u8; 32]) -> Result<(), String> {
        let key = format!("stateroot:{}", height);
        self.db.insert(key, &root).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn put_transaction(&self, tx: &crate::types::transaction::Transaction) -> Result<(), String> {
        let key = format!("tx:{}", hex::encode(tx.hash()));
        let val = serde_json::to_vec(tx).map_err(|e| e.to_string())?;
        self.db.insert(key, val).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_transaction(&self, hash_hex: &str) -> Result<Option<crate::types::transaction::Transaction>, String> {
        let key = format!("tx:{}", hash_hex);
        let val = self.db.get(key).map_err(|e| e.to_string())?;
        match val {
            Some(data) => Ok(Some(serde_json::from_slice(&data).map_err(|e| e.to_string())?)),
            None => Ok(None),
        }
    }
    
    pub fn put_receipt(&self, receipt: &crate::types::transaction::TransactionReceipt) -> Result<(), String> {
        let key = format!("receipt:0x{}", hex::encode(receipt.tx_hash));
        let val = serde_json::to_vec(receipt).map_err(|e| e.to_string())?;
        self.db.insert(key, val).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_receipt(&self, hash_hex: &str) -> Result<Option<crate::types::transaction::TransactionReceipt>, String> {
        let key = format!("receipt:0x{}", hash_hex.strip_prefix("0x").unwrap_or(hash_hex));
        let val = self.db.get(key).map_err(|e| e.to_string())?;
        match val {
            Some(data) => Ok(Some(serde_json::from_slice(&data).map_err(|e| e.to_string())?)),
            None => Ok(None),
        }
    }

    pub fn put_state(&self, height: u64, state: &crate::state::account::State) -> Result<(), String> {
        let key = format!("state:{}", height);
        let val = serde_json::to_vec(state).map_err(|e| e.to_string())?;
        self.db.insert(key, val).map_err(|e| e.to_string())?;
        // Also update latest state pointer
        self.db.insert("latest_state_height", &height.to_be_bytes()).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_latest_state(&self) -> Result<Option<(u64, crate::state::account::State)>, String> {
        let height_val = self.db.get("latest_state_height").map_err(|e| e.to_string())?;
        if let Some(h_bytes) = height_val {
            let height = u64::from_be_bytes(h_bytes.as_ref().try_into().unwrap_or([0; 8]));
            let key = format!("state:{}", height);
            let state_val = self.db.get(key).map_err(|e| e.to_string())?;
            if let Some(data) = state_val {
                let state = serde_json::from_slice(&data).map_err(|e| e.to_string())?;
                return Ok(Some((height, state)));
            }
        }
        Ok(None)
    }

    pub fn put_index(&self, address: &crate::address::Address, tx_hash: [u8; 32]) -> Result<(), String> {
        let key = format!("addr_txs:{}", address.to_hex());
        let mut txs = self.get_address_history(address)?;
        txs.push(tx_hash);
        let val = serde_json::to_vec(&txs).map_err(|e| e.to_string())?;
        self.db.insert(key, val).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_address_history(&self, address: &crate::address::Address) -> Result<Vec<[u8; 32]>, String> {
        let key = format!("addr_txs:{}", address.to_hex());
        let val = self.db.get(key).map_err(|e| e.to_string())?;
        match val {
            Some(data) => Ok(serde_json::from_slice(&data).map_err(|e| e.to_string())?),
            None => Ok(Vec::new()),
        }
    }
}
