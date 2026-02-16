use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QuorlinOpcode {
    Push(u64),
    Add,
    StoreGlobal(String),
    Address,
    Return,
}
