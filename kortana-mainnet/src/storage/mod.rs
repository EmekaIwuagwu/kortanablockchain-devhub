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
        let val = serde_json::to_vec(block).map_err(|e| e.to_string())?;
        // Index by height
        let height_key = format!("block:{}", block.header.height);
        self.db.insert(height_key, val.clone()).map_err(|e| e.to_string())?;
        // Index by hash
        let hash_key = format!("blockhash:{}", hex::encode(block.header.hash()));
        self.db.insert(hash_key, val).map_err(|e| e.to_string())?;
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

    pub fn get_block_by_hash(&self, hash_hex: &str) -> Result<Option<Block>, String> {
        let h = hash_hex.strip_prefix("0x").unwrap_or(hash_hex).to_lowercase();
        let key = format!("blockhash:{}", h);
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

    // Store mapping of transaction hash to block height and hash
    pub fn put_transaction_location(&self, tx_hash: &[u8; 32], block_height: u64, block_hash: &[u8; 32], tx_index: usize) -> Result<(), String> {
        let key = format!("txloc:{}", hex::encode(tx_hash));
        let location = serde_json::json!({
            "block_height": block_height,
            "block_hash": hex::encode(block_hash),
            "tx_index": tx_index
        });
        let val = serde_json::to_vec(&location).map_err(|e| e.to_string())?;
        self.db.insert(key, val).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_transaction_location(&self, tx_hash: &str) -> Result<Option<(u64, String, usize)>, String> {
        let h = tx_hash.strip_prefix("0x").unwrap_or(tx_hash).to_lowercase();
        let key = format!("txloc:{}", h);
        let val = self.db.get(key).map_err(|e| e.to_string())?;
        match val {
            Some(data) => {
                let location: serde_json::Value = serde_json::from_slice(&data).map_err(|e| e.to_string())?;
                let height = location["block_height"].as_u64().unwrap_or(0);
                let hash = location["block_hash"].as_str().unwrap_or("").to_string();
                let index = location["tx_index"].as_u64().unwrap_or(0) as usize;
                Ok(Some((height, hash, index)))
            },
            None => Ok(None),
        }
    }

    pub fn get_transaction(&self, hash_hex: &str) -> Result<Option<crate::types::transaction::Transaction>, String> {
        let h = hash_hex.strip_prefix("0x").unwrap_or(hash_hex).to_lowercase();
        let key = format!("tx:{}", h);
        let val = self.db.get(key).map_err(|e| e.to_string())?;
        match val {
            Some(data) => Ok(Some(serde_json::from_slice(&data).map_err(|e| e.to_string())?)),
            None => Ok(None),
        }
    }
    
    pub fn put_receipt(&self, receipt: &crate::types::transaction::TransactionReceipt) -> Result<(), String> {
        let key = format!("receipt:{}", hex::encode(receipt.tx_hash));
        let val = serde_json::to_vec(receipt).map_err(|e| e.to_string())?;
        self.db.insert(key, val).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_receipt(&self, hash_hex: &str) -> Result<Option<crate::types::transaction::TransactionReceipt>, String> {
        let h = hash_hex.strip_prefix("0x").unwrap_or(hash_hex).to_lowercase();
        let key = format!("receipt:{}", h);
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

    pub fn put_global_transaction(&self, tx_hash: [u8; 32]) -> Result<(), String> {
        let mut txs = self.get_global_transactions()?;
        txs.push(tx_hash);
        let val = serde_json::to_vec(&txs).map_err(|e| e.to_string())?;
        self.db.insert("global_txs", val).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_global_transactions(&self) -> Result<Vec<[u8; 32]>, String> {
        let val = self.db.get("global_txs").map_err(|e| e.to_string())?;
        match val {
            Some(data) => Ok(serde_json::from_slice(&data).map_err(|e| e.to_string())?),
            None => Ok(Vec::new()),
        }
    }

    pub fn clear_all_data(&self) -> Result<(), String> {
        // Clear blocks
        for key in self.db.scan_prefix("block:") {
            if let Ok((k, _)) = key {
                self.db.remove(k).map_err(|e| e.to_string())?;
            }
        }
        
        // Clear block hashes
        for key in self.db.scan_prefix("blockhash:") {
            if let Ok((k, _)) = key {
                self.db.remove(k).map_err(|e| e.to_string())?;
            }
        }
        
        // Clear transactions
        for key in self.db.scan_prefix("tx:") {
            if let Ok((k, _)) = key {
                self.db.remove(k).map_err(|e| e.to_string())?;
            }
        }
        
        // Clear transaction locations
        for key in self.db.scan_prefix("txloc:") {
            if let Ok((k, _)) = key {
                self.db.remove(k).map_err(|e| e.to_string())?;
            }
        }
        
        // Clear receipts
        for key in self.db.scan_prefix("receipt:") {
            if let Ok((k, _)) = key {
                self.db.remove(k).map_err(|e| e.to_string())?;
            }
        }
        
        // Clear address indices
        for key in self.db.scan_prefix("addr_txs:") {
            if let Ok((k, _)) = key {
                self.db.remove(k).map_err(|e| e.to_string())?;
            }
        }
        
        // Clear global transactions
        self.db.remove("global_txs").map_err(|e| e.to_string())?;
        
        // Clear state roots
        for key in self.db.scan_prefix("stateroot:") {
            if let Ok((k, _)) = key {
                self.db.remove(k).map_err(|e| e.to_string())?;
            }
        }
        
        // Clear states
        for key in self.db.scan_prefix("state:") {
            if let Ok((k, _)) = key {
                self.db.remove(k).map_err(|e| e.to_string())?;
            }
        }
        
        self.db.remove("latest_state_height").map_err(|e| e.to_string())?;
        
        self.db.flush().map_err(|e| e.to_string())?;
        tracing::info!("[STORAGE] Database cleared successfully");
        Ok(())
    }
}
