use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::consensus::{ConsensusEngine, ValidatorInfo};
use kortana_blockchain_rust::state::account::State;
use kortana_blockchain_rust::mempool::Mempool;
use kortana_blockchain_rust::parameters::*;
use kortana_blockchain_rust::staking::StakingStore;
use kortana_blockchain_rust::core::fees::FeeMarket;
use kortana_blockchain_rust::consensus::bft::FinalityGadget;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;
use clap::Parser;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// RPC server address
    #[arg(short, long, default_value = "0.0.0.0:8545")]
    rpc_addr: String,

    /// P2P listen address (Multiaddr format)
    #[arg(short, long, default_value = "/ip4/0.0.0.0/tcp/30333")]
    p2p_addr: String,

    /// Bootnodes to connect to (Multiaddr format)
    #[arg(short, long)]
    bootnodes: Vec<String>,
}

pub struct KortanaNode {
    pub consensus: Arc<Mutex<ConsensusEngine>>,
    pub state: Arc<Mutex<State>>,
    pub mempool: Arc<Mutex<Mempool>>,
    pub fees: Arc<Mutex<FeeMarket>>,
    pub finality: Arc<Mutex<FinalityGadget>>,
    pub storage: Arc<kortana_blockchain_rust::storage::Storage>,
    pub height: Arc<AtomicU64>,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    println!("Starting Kortana Blockchain Node (Rust) - Production Grade...");
    println!("RPC Addr: {}", args.rpc_addr);
    println!("P2P Addr: {}", args.p2p_addr);

    // 1. Initialize Storage
    let storage = Arc::new(kortana_blockchain_rust::storage::Storage::new("./data/kortana.db"));

    // 2. Load or Initialize State
    let (h_init, state) = match storage.get_latest_state() {
        Ok(Some((h, s))) => {
            println!("Resuming from stored state at height {}", h);
            (h, s)
        },
        _ => {
            println!("No stored state found. Initializing from genesis...");
            let initial_state = kortana_blockchain_rust::core::genesis::create_genesis_state();
            (0, initial_state)
        }
    };

    let genesis_root = state.calculate_root();
    println!("Current state root: 0x{}", hex::encode(genesis_root));

    // 3. Initialize Core Components
    let genesis_validator = ValidatorInfo {
        address: Address::from_pubkey(b"genesis_validator"),
        stake: 32_000_000_000_000_000_000,
        is_active: true,
        commission: 500, // 5%
        missed_blocks: 0,
    };

    let node = KortanaNode {
        consensus: Arc::new(Mutex::new(ConsensusEngine::new(vec![genesis_validator.clone()]))),
        state: Arc::new(Mutex::new(state)),
        mempool: Arc::new(Mutex::new(Mempool::new(MEMPOOL_MAX_SIZE))),
        fees: Arc::new(Mutex::new(FeeMarket::new())),
        finality: Arc::new(Mutex::new(FinalityGadget::new())),
        storage: storage.clone(),
        height: Arc::new(AtomicU64::new(h_init)),
    };

    println!("Node initialized at height {}", node.height.load(Ordering::Relaxed));

    // 3. Setup Networking Channels
    let (p2p_tx, p2p_rx) = tokio::sync::mpsc::channel(100);
    let (node_tx, mut node_rx) = tokio::sync::mpsc::channel(100);

    // 4. Start P2P Network
    let mut network = kortana_blockchain_rust::network::p2p::KortanaNetwork::new(p2p_rx, node_tx).await.unwrap();
    
    // Add Bootnodes
    for bootnode in args.bootnodes {
        if let Ok(addr) = bootnode.parse() {
            println!("Connecting to bootnode: {}", addr);
            network.add_bootnode(addr);
        }
    }

    let p2p_addr = args.p2p_addr.clone();
    tokio::spawn(async move {
        network.run(p2p_addr).await;
    });

    // 5. Start RPC Server
    let rpc_handler = kortana_blockchain_rust::rpc::RpcHandler {
        chain_id: CHAIN_ID,
        state: node.state.clone(),
        mempool: node.mempool.clone(),
        storage: node.storage.clone(),
        network_tx: p2p_tx.clone(),
        height: node.height.clone(),
    };
    
    let rpc_handler = Arc::new(rpc_handler);
    let rpc_addr = args.rpc_addr.clone();
    tokio::spawn(async move {
        // INSECURE: Binding to 0.0.0.0 allows public access. Ensure Firewall rules restrict access to trusted IPs only!
        let listener = tokio::net::TcpListener::bind(&rpc_addr).await.unwrap();
        println!("RPC Server listening on {}", rpc_addr);
        loop {
            let (mut socket, _) = listener.accept().await.unwrap();
            let handler = rpc_handler.clone();
            tokio::spawn(async move {
                let mut buffer = [0; 4096];
                if let Ok(n) = tokio::io::AsyncReadExt::read(&mut socket, &mut buffer).await {
                    if let Ok(req_str) = std::str::from_utf8(&buffer[..n]) {
                        
                        // Handler for OPTIONS (Preflight)
                        if req_str.starts_with("OPTIONS") {
                            let response = "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: POST, GET, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nContent-Length: 0\r\n\r\n";
                            let _ = tokio::io::AsyncWriteExt::write_all(&mut socket, response.as_bytes()).await;
                            return;
                        }

                        // Very simplified HTTP parsing
                        if let Some(body_start) = req_str.find("\r\n\r\n") {
                            let body = &req_str[body_start+4..];
                            if let Ok(request) = serde_json::from_str::<kortana_blockchain_rust::rpc::JsonRpcRequest>(body) {
                                let response = handler.handle(request).await;
                                let response_str = serde_json::to_string(&response).unwrap();
                                let http_response = format!(
                                    "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: POST, GET, OPTIONS\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
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
    let mut max_seen_height = 0;
    let mut sync_check_interval = tokio::time::interval(Duration::from_secs(10));

    loop {
        tokio::select! {
            // Periodic Block Production (Leader only)
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
                        
                        let leader_priv = hex::decode("2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa").unwrap();
                        let vrf = kortana_blockchain_rust::crypto::vrf::generate_vrf_seed(&leader_priv, b"epoch_seed", current_slot);
                        let timestamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();

                        let fees = node.fees.lock().unwrap();
                        let mut header = kortana_blockchain_rust::types::block::BlockHeader {
                            version: 1,
                            height: node.height.load(Ordering::SeqCst) + 1,
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

                        let (tx_root, receipt_root) = kortana_blockchain_rust::types::block::Block::calculate_merkle_roots(&txs, &receipts);
                        header.state_root = state.calculate_root();
                        header.transactions_root = tx_root;
                        header.receipts_root = receipt_root;
                        header.gas_used = receipts.iter().map(|r| r.gas_used).sum();

                        for receipt in &receipts {
                            let _ = node.storage.put_receipt(receipt);
                        }

                        let mut block = kortana_blockchain_rust::types::block::Block {
                            header,
                            transactions: txs,
                            signature: vec![], 
                        };
                        
                        block.sign(&leader_priv);
                        
                        drop(fees);
                        let mut fees_mut = node.fees.lock().unwrap();
                        fees_mut.update_base_fee(block.header.gas_used);

                        let _ = p2p_tx.send(kortana_blockchain_rust::network::messages::NetworkMessage::NewBlock(block.clone())).await;
                        
                        node.height.fetch_add(1, Ordering::SeqCst);
                        let _ = node.storage.put_block(&block);
                        let _ = node.storage.put_state(block.header.height, &*state);
                    }
                }
            }

            // Periodic Sync Check
            _ = sync_check_interval.tick() => {
                let h = node.height.load(Ordering::SeqCst);
                if max_seen_height > h {
                     let start = h + 1;
                     let end = std::cmp::min(start + 50, max_seen_height);
                     println!("[Sync] Node is behind. Requesting blocks {} to {}", start, end);
                     let _ = p2p_tx.send(kortana_blockchain_rust::network::messages::NetworkMessage::SyncRequest { 
                         start_height: start, 
                         end_height: end 
                     }).await;
                }
            }

            // Handle Incoming P2P Messages
            Some(msg) = node_rx.recv() => {
                match msg {
                    kortana_blockchain_rust::network::messages::NetworkMessage::NewBlock(block) => {
                        if block.header.height > max_seen_height {
                            max_seen_height = block.header.height;
                        }

                        if block.header.height == node.height.load(Ordering::SeqCst) + 1 {
                             println!("[P2P] Received next block at height {} from {}", block.header.height, block.header.proposer);
                             let mut state = node.state.lock().unwrap();
                             let mut fees = node.fees.lock().unwrap();
                             
                             let mut success = false;
                             {
                                 let mut processor = kortana_blockchain_rust::core::processor::BlockProcessor::new(&mut *state, fees.clone());
                                 if let Ok(_) = processor.validate_block(&block) {
                                     println!("  Block verified and applied.");
                                     *fees = processor.fee_market;
                                     success = true;
                                 }
                             }

                             if success {
                                 let root = state.calculate_root();
                                 let _ = node.storage.put_block(&block);
                                 let _ = node.storage.put_state_root(block.header.height, root);
                                 let _ = node.storage.put_state(block.header.height, &*state);
                                 node.height.fetch_add(1, Ordering::SeqCst);
                             }
                        }
                    }
                    kortana_blockchain_rust::network::messages::NetworkMessage::NewTransaction(tx) => {
                        let mut mempool = node.mempool.lock().unwrap();
                        mempool.add(tx);
                    }
                    kortana_blockchain_rust::network::messages::NetworkMessage::SyncRequest { start_height, end_height } => {
                        println!("[P2P] SyncRequest for range {}-{}", start_height, end_height);
                        let mut blocks = Vec::new();
                        for h in start_height..=end_height {
                            if let Ok(Some(block)) = node.storage.get_block(h) {
                                blocks.push(block);
                            } else {
                                break;
                            }
                        }
                        if !blocks.is_empty() {
                            let _ = p2p_tx.send(kortana_blockchain_rust::network::messages::NetworkMessage::SyncResponse { blocks }).await;
                        }
                    }
                    kortana_blockchain_rust::network::messages::NetworkMessage::SyncResponse { blocks } => {
                        println!("[P2P] Received SyncResponse with {} blocks", blocks.len());
                        let mut state = node.state.lock().unwrap();
                        let mut fees = node.fees.lock().unwrap();

                        for block in blocks {
                            let h = node.height.load(Ordering::SeqCst);
                            if block.header.height == h + 1 {
                                let mut success = false;
                                {
                                    let mut processor = kortana_blockchain_rust::core::processor::BlockProcessor::new(&mut *state, fees.clone());
                                    if let Ok(_) = processor.validate_block(&block) {
                                        println!("  Sync: Block {} verified.", block.header.height);
                                        *fees = processor.fee_market.clone();
                                        success = true;
                                    }
                                }
                                
                                if success {
                                    node.height.fetch_add(1, Ordering::SeqCst);
                                    let _ = node.storage.put_block(&block);
                                    let _ = node.storage.put_state(block.header.height, &*state);
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                    kortana_blockchain_rust::network::messages::NetworkMessage::Commit { block_hash, height, round, validator, signature } => {
                         let mut finality = node.finality.lock().unwrap();
                         let consensus = node.consensus.lock().unwrap();
                         if finality.add_vote(block_hash, height, round, validator, signature, &consensus.validators) {
                             println!("FINALITY REACHED for height {} hash 0x{}", height, hex::encode(block_hash));
                         }
                    }
                    _ => {}
                }
            }
        }
    }
}
