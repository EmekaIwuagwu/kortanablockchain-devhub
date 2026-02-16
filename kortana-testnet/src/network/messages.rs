// File: src/network/messages.rs

use serde::{Serialize, Deserialize};
use crate::types::block::Block;
use crate::types::transaction::Transaction;

#[derive(Debug, Serialize, Deserialize)]
pub enum NetworkMessage {
    NewBlock(Block),
    NewTransaction(Transaction),
    SyncRequest { start_height: u64, end_height: u64 },
    SyncResponse { blocks: Vec<Block> },
    PreCommit { block_hash: [u8; 32], height: u64, round: u32, validator: crate::address::Address, signature: Vec<u8> },
    Commit { block_hash: [u8; 32], height: u64, round: u32, validator: crate::address::Address, signature: Vec<u8> },
}
