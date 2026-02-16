// File: src/consensus/sync.rs

use crate::types::block::Block;
use crate::storage::Storage;
use std::sync::Arc;

pub enum SyncState {
    Idle,
    FastSyncing { start_height: u64, target_height: u64 },
    Broadcasting,
}

pub struct SyncEngine {
    pub state: SyncState,
    pub storage: Arc<Storage>,
}

impl SyncEngine {
    pub fn new(storage: Arc<Storage>) -> Self {
        Self {
            state: SyncState::Idle,
            storage,
        }
    }

    pub fn start_fast_sync(&mut self, current_height: u64, target_height: u64) {
        println!("Starting Fast Sync: {} -> {}", current_height, target_height);
        self.state = SyncState::FastSyncing {
            start_height: current_height,
            target_height,
        };
    }

    pub fn process_blocks_batch(&mut self, blocks: Vec<Block>) -> Result<u64, String> {
        let mut last_height = 0;
        for block in blocks {
            // 1. Verify block exists in chain
            // 2. Persist to storage
            self.storage.put_block(&block)?;
            last_height = block.header.height;
        }
        
        if let SyncState::FastSyncing { target_height, .. } = self.state {
            if last_height >= target_height {
                self.state = SyncState::Broadcasting;
                println!("Fast Sync Complete at height {}", last_height);
            }
        }
        
        Ok(last_height)
    }
}
