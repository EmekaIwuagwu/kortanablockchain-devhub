// File: src/main.rs

use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::consensus::{ConsensusEngine, ValidatorInfo};
use kortana_blockchain_rust::state::account::State;
use kortana_blockchain_rust::mempool::Mempool;
use kortana_blockchain_rust::parameters::*;
use kortana_blockchain_rust::staking::StakingStore;
use kortana_blockchain_rust::core::fees::FeeMarket;
use kortana_blockchain_rust::consensus::bft::FinalityGadget;
use std::sync::{Arc, Mutex};
use std::time::Duration;

pub struct KortanaNode {
    pub consensus: Arc<Mutex<ConsensusEngine>>,
    pub state: Arc<Mutex<State>>,
    pub mempool: Arc<Mutex<Mempool>>,
    pub staking: Arc<Mutex<StakingStore>>,
    pub fees: Arc<Mutex<FeeMarket>>,
    pub finality: Arc<Mutex<FinalityGadget>>,
    pub storage: Arc<kortana_blockchain_rust::storage::Storage>,
    pub height: u64,
}

#[tokio::main]
async fn main() {
    println!("Starting Kortana Blockchain Node (Rust) - Production Grade...");

    // 1. Initialize Genesis State
    let state = kortana_blockchain_rust::core::genesis::create_genesis_state();
    let genesis_root = state.calculate_root();
    println!("Genesis state root: 0x{}", hex::encode(genesis_root));

    // 2. Initialize Core Components
    let genesis_validator = ValidatorInfo {
        address: Address::from_pubkey(b"genesis_validator"),
        stake: 32_000_000_000_000_000_000,
        is_active: true,
        commission: 500, // 5%
        missed_blocks: 0,
    };

    let storage = Arc::new(kortana_blockchain_rust::storage::Storage::new("./data/kortana.db"));

    let node = KortanaNode {
        consensus: Arc::new(Mutex::new(ConsensusEngine::new(vec![genesis_validator.clone()]))),
        state: Arc::new(Mutex::new(state)),
        mempool: Arc::new(Mutex::new(Mempool::new(MEMPOOL_MAX_SIZE))),
        staking: Arc::new(Mutex::new(StakingStore::new())),
        fees: Arc::new(Mutex::new(FeeMarket::new())),
        finality: Arc::new(Mutex::new(FinalityGadget::new())),
        storage: storage.clone(),
        height: 0,
    };

    println!("Node initialized at height {}", node.height);

    // 3. Setup Networking Channels
    let (p2p_tx, p2p_rx) = tokio::sync::mpsc::channel(100);
    let (node_tx, mut node_rx) = tokio::sync::mpsc::channel(100);

    // 4. Start P2P Network
    let network = kortana_blockchain_rust::network::p2p::KortanaNetwork::new(p2p_rx, node_tx).await.unwrap();
    tokio::spawn(async move {
        network.run().await;
    });

    // 5. Start RPC Server
    let rpc_handler = kortana_blockchain_rust::rpc::RpcHandler {
        chain_id: CHAIN_ID,
        state: node.state.clone(),
        mempool: node.mempool.clone(),
        storage: node.storage.clone(),
        network_tx: p2p_tx.clone(),
    };
    
    let rpc_handler = Arc::new(rpc_handler);
    tokio::spawn(async move {
        // INSECURE: Binding to 0.0.0.0 allows public access. Ensure Firewall rules restrict access to trusted IPs only!
        let listener = tokio::net::TcpListener::bind("0.0.0.0:8545").await.unwrap();
        println!("RPC Server listening on 0.0.0.0:8545");
        loop {
            let (mut socket, _) = listener.accept().await.unwrap();
            let handler = rpc_handler.clone();
            tokio::spawn(async move {
                let mut buffer = [0; 4096];
                if let Ok(n) = tokio::io::AsyncReadExt::read(&mut socket, &mut buffer).await {
                    if let Ok(req_str) = std::str::from_utf8(&buffer[..n]) {
                        // Very simplified HTTP parsing
                        if let Some(body_start) = req_str.find("\r\n\r\n") {
                            let body = &req_str[body_start+4..];
                            if let Ok(request) = serde_json::from_str::<kortana_blockchain_rust::rpc::JsonRpcRequest>(body) {
                                let response = handler.handle(request).await;
                                let response_str = serde_json::to_string(&response).unwrap();
                                let http_response = format!(
                                    "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
                                    response_str.len(),
                                    response_str
                                );
                                let _ = tokio::io::AsyncWriteExt::write_all(&mut socket, http_response.as_bytes()).await;
                            }
                        }
                    }
                }
            });
        }
    });

    let mut interval = tokio::time::interval(Duration::from_secs(BLOCK_TIME_SECS));
    let mut current_slot = 0;

    loop {
        tokio::select! {
            // Handle Slot Ticks (Block Production)
            _ = interval.tick() => {
                current_slot += 1;
                let mut consensus = node.consensus.lock().unwrap();
                consensus.current_slot = current_slot;
                
                if let Some(leader) = consensus.get_leader(current_slot) {
                    consensus.advance_era(current_slot);
                    
                    if leader == genesis_validator.address {
                        println!("[Slot {}] Producing block as leader...", current_slot);
                        
                        let mut mempool = node.mempool.lock().unwrap();
                        let txs = mempool.select_transactions(GAS_LIMIT_PER_BLOCK);
                        
                // Generate VRF
                let leader_priv = hex::decode("2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa").unwrap();
                let vrf = kortana_blockchain_rust::crypto::vrf::generate_vrf_seed(&leader_priv, b"epoch_seed", current_slot);
                        let timestamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();

                        let fees = node.fees.lock().unwrap();
                        let mut header = kortana_blockchain_rust::types::block::BlockHeader {
                            version: 1,
                            height: current_slot,
                            slot: current_slot,
                            timestamp,
                            parent_hash: consensus.finalized_hash,
                            state_root: [0u8; 32],
                            transactions_root: [0u8; 32],
                            receipts_root: [0u8; 32],
                            poh_hash: [0u8; 32],
                            poh_sequence: 0,
                            proposer: leader.clone(),
                            gas_used: 0,
                            gas_limit: GAS_LIMIT_PER_BLOCK,
                            base_fee: fees.base_fee,
                            vrf_output: vrf.output,
                        };

                        let mut state = node.state.lock().unwrap();
                        let mut processor = kortana_blockchain_rust::core::processor::BlockProcessor::new(&mut *state, fees.clone());
                        
                        let mut receipts = Vec::new();
                        for tx in &txs {
                            if let Ok(receipt) = processor.process_transaction(tx.clone(), &header) {
                                receipts.push(receipt);
                            }
                        }

                        // Compute Merkle Roots
                        let (tx_root, receipt_root) = kortana_blockchain_rust::types::block::Block::calculate_merkle_roots(&txs, &receipts);
                        header.state_root = state.calculate_root();
                        header.transactions_root = tx_root;
                        header.receipts_root = receipt_root;
                        header.gas_used = receipts.iter().map(|r| r.gas_used).sum();

                        // Save Receipts to Storage (For Explorer)
                        for receipt in &receipts {
                            let _ = node.storage.put_receipt(receipt);
                        }

                        // Create Block
                        let mut block = kortana_blockchain_rust::types::block::Block {
                            header,
                            transactions: txs,
                            signature: vec![], 
                        };
                        
                        // Sign the block
                        // Sign the block
                        block.sign(&leader_priv);
                        
                        // Update our own fee market state
                        drop(fees);
                        let mut fees_mut = node.fees.lock().unwrap();
                        fees_mut.update_base_fee(block.header.gas_used);

                        // Gossip Block
                        let _ = p2p_tx.send(kortana_blockchain_rust::network::messages::NetworkMessage::NewBlock(block)).await;
                    }
                }
            }
            // Handle Incoming P2P Messages
            Some(msg) = node_rx.recv() => {
                match msg {
                    kortana_blockchain_rust::network::messages::NetworkMessage::NewBlock(block) => {
                        println!("[P2P] Received new block at height {} from {}", block.header.height, block.header.proposer);
                        
                        let mut state = node.state.lock().unwrap();
                        let mut fees = node.fees.lock().unwrap();
                        let mut processor = kortana_blockchain_rust::core::processor::BlockProcessor::new(&mut *state, fees.clone());
                        
                        // Perform State Transition & Validation
                        match processor.validate_block(&block) {
                            Ok(_) => {
                                println!("  Block verified and applied to state.");
                                // Sync local fee market with verified block
                                *fees = processor.fee_market;

                                // Periodic State Pruning
                                if block.header.height % BLOCKS_PER_EPOCH == 0 {
                                    // Periodic State Pruning (Placeholder)
                                    println!("  State pruning check at epoch boundary.");
                                }
                            }
                            Err(e) => {
                                println!("  Block validation failed: {}", e);
                            }
                        }
                    }
                    kortana_blockchain_rust::network::messages::NetworkMessage::NewTransaction(tx) => {
                        let mut mempool = node.mempool.lock().unwrap();
                        mempool.add(tx);
                    }
                    kortana_blockchain_rust::network::messages::NetworkMessage::PreCommit { block_hash, height, round, validator, signature: _ } => {
                        // Log PreCommit (Simulating BFT phases)
                        println!("[P2P] PreCommit: h={} r={} hash=0x{} val={}", height, round, hex::encode(block_hash), validator);
                    }
                    kortana_blockchain_rust::network::messages::NetworkMessage::Commit { block_hash, height, round, validator, signature } => {
                         let mut finality = node.finality.lock().unwrap();
                         let consensus = node.consensus.lock().unwrap();
                         if finality.add_vote(block_hash, height, round, validator, signature, &consensus.validators) {
                             println!("FINALITY REACHED for height {} hash 0x{}", height, hex::encode(block_hash));
                             // Here we would checkpoint state
                         }
                    }
                    _ => {}
                }
            }
        }
    }
}
