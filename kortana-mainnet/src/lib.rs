// File: src/lib.rs

pub mod address;
pub mod config;
pub mod consensus;
pub mod core;
pub mod crypto;
pub mod parameters;
pub mod state;
pub mod staking;
pub mod storage;
pub mod types;
pub mod vm;
pub mod mempool;
pub mod network;
pub mod rpc;

pub use address::Address;
pub use consensus::ConsensusEngine;
pub use state::account::State;
pub use types::block::Block;
pub use types::transaction::Transaction;
