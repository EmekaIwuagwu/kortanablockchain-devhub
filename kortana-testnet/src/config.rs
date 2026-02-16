// File: src/config.rs
//
// Secure configuration management for Kortana Blockchain Node
// Follows security best practices by using environment variables for sensitive data

use std::env;
use anyhow::{Context, Result};

/// Node Configuration - Loaded from environment variables for security
#[derive(Debug, Clone)]
pub struct NodeConfig {
    /// Validator private key (32-byte hex string)
    /// SECURITY: Must be set via VALIDATOR_PRIVATE_KEY environment variable
    pub validator_private_key: Vec<u8>,
    
    /// RPC server bind address
    pub rpc_addr: String,
    
    /// P2P network bind address
    pub p2p_addr: String,
    
    /// Database path
    pub db_path: String,
}

impl NodeConfig {
    /// Load configuration from environment variables
    /// 
    /// Required environment variables:
    /// - VALIDATOR_PRIVATE_KEY: Hex-encoded private key for block signing (64 hex chars)
    /// 
    /// Optional environment variables:
    /// - RPC_ADDR: RPC server address (default: "0.0.0.0:8545")
    /// - P2P_ADDR: P2P network address (default: "/ip4/0.0.0.0/tcp/30333")
    /// - DB_PATH: Database directory (default: "./data/kortana.db")
    pub fn from_env() -> Result<Self> {
        // Load validator private key (REQUIRED for production)
        let validator_key_hex = env::var("VALIDATOR_PRIVATE_KEY")
            .context("VALIDATOR_PRIVATE_KEY environment variable is required. Set it to your validator's private key (64 hex characters)")?;
        
        // Validate and decode private key
        if validator_key_hex.len() != 64 {
            anyhow::bail!("VALIDATOR_PRIVATE_KEY must be exactly 64 hex characters (32 bytes)");
        }
        
        let validator_private_key = hex::decode(&validator_key_hex)
            .context("VALIDATOR_PRIVATE_KEY must be valid hex encoding")?;
        
        if validator_private_key.len() != 32 {
            anyhow::bail!("Decoded VALIDATOR_PRIVATE_KEY must be exactly 32 bytes");
        }
        
        // Load optional configuration with sensible defaults
        let rpc_addr = env::var("RPC_ADDR")
            .unwrap_or_else(|_| "0.0.0.0:8545".to_string());
        
        let p2p_addr = env::var("P2P_ADDR")
            .unwrap_or_else(|_| "/ip4/0.0.0.0/tcp/30333".to_string());
        
        let db_path = env::var("DB_PATH")
            .unwrap_or_else(|_| "./data/kortana.db".to_string());
        
        Ok(Self {
            validator_private_key,
            rpc_addr,
            p2p_addr,
            db_path,
        })
    }
    
    /// Create a development/testnet configuration with a default validator key
    /// 
    /// ⚠️ WARNING: ONLY FOR DEVELOPMENT/TESTING
    /// DO NOT USE IN PRODUCTION OR ON MAINNET
    pub fn development() -> Self {
        eprintln!("⚠️  WARNING: Using DEVELOPMENT configuration with default validator key");
        eprintln!("⚠️  This is INSECURE and should ONLY be used for testing");
        eprintln!("⚠️  For production, set VALIDATOR_PRIVATE_KEY environment variable");
        
        Self {
            // Default testnet validator key (publicly known - DO NOT USE IN PRODUCTION)
            validator_private_key: hex::decode("2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa")
                .expect("Hardcoded key should always decode"),
            rpc_addr: "0.0.0.0:8545".to_string(),
            p2p_addr: "/ip4/0.0.0.0/tcp/30333".to_string(),
            db_path: "data/kortana.db".to_string(),
        }
    }
}
