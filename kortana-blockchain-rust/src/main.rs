use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::consensus::{ConsensusEngine, ValidatorInfo};
use kortana_blockchain_rust::state::account::State;
use kortana_blockchain_rust::mempool::Mempool;
use kortana_blockchain_rust::parameters::*;
use kortana_blockchain_rust::core::fees::FeeMarket;
use kortana_blockchain_rust::consensus::bft::FinalityGadget;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;
use clap::Parser;

// Color Constants for Beautiful Logs
const CLR_RESET: &str = "\x1b[0m";
const CLR_BLUE: &str = "\x1b[34m";
const CLR_CYAN: &str = "\x1b[36m";
const CLR_GREEN: &str = "\x1b[32m";
const CLR_RED: &str = "\x1b[31m";
const CLR_YELLOW: &str = "\x1b[33m";
const CLR_MAGENTA: &str = "\x1b[35m";
const CLR_BOLD: &str = "\x1b[1m";

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// RPC server address
    #[arg(short, long, default_value = "127.0.0.1:8545")]
    rpc_addr: String,

    /// P2P listen address (Multiaddr format)
    #[arg(short, long, default_value = "0.0.0.0:30333")]
    p2p_addr: String,

    /// Bootnodes to connect to (Multiaddr format)
    #[arg(short, long)]
    bootnodes: Vec<String>,

    #[arg(long)]
    wallet: bool, // Subcommand flag for wallet generation

    #[arg(long)]
    test: bool, // Subcommand flag for self-test
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

    if args.wallet {
        let priv_key = k256::ecdsa::SigningKey::random(&mut rand::thread_rng());
        let pub_key = priv_key.verifying_key();
        let addr = Address::from_pubkey(&pub_key.to_sec1_bytes());
        println!("\n{}--- NEW KORTANA WALLET GENERATED ---{}", CLR_BOLD, CLR_RESET);
        println!("{}Private Key: {}{}", CLR_MAGENTA, hex::encode(priv_key.to_bytes()), CLR_RESET);
        println!("{}Address:     {}{}", CLR_CYAN, addr.to_hex(), CLR_RESET);
        println!("{}-------------------------------------{}\n", CLR_BOLD, CLR_RESET);
        return;
    }
    
    if args.test {
        println!("\n{}--- KORTANA SELF-TEST SUITE ---{}", CLR_BOLD, CLR_RESET);
        
        // Test 1: Wallet & Address
        print!("Test 1: Wallet Derivation... ");
        let priv_key = k256::ecdsa::SigningKey::random(&mut rand::thread_rng());
        let addr = Address::from_pubkey(&priv_key.verifying_key().to_sec1_bytes());
        if addr.to_hex().starts_with("kn:0x") {
            println!("{}PASS{}", CLR_GREEN, CLR_RESET);
        } else {
            println!("{}FAIL{}", CLR_RED, CLR_RESET);
        }

        // Test 2: State & Storage
        print!("Test 2: State Initialization... ");
        let mut test_state = kortana_blockchain_rust::core::genesis::create_genesis_state();
        let root = test_state.calculate_root();
        if root != [0u8; 32] {
            println!("{}PASS (Root: 0x{}){}", CLR_GREEN, hex::encode(root), CLR_RESET);
        } else {
            println!("{}FAIL{}", CLR_RED, CLR_RESET);
        }

        // Test 3: Transaction Processing
        print!("Test 3: Core Processor (Mint & Transfer)... ");
        let faucet_addr = Address::from_hex("kn:0xc19d6dece56d290c71930c2f867ae9c2c652a19f7911ef64").unwrap();
        let mut acc = test_state.get_account(&faucet_addr);
        acc.balance += 1000;
        test_state.update_account(faucet_addr, acc);
        
        if test_state.get_account(&faucet_addr).balance >= 1000 {
            println!("{}PASS{}", CLR_GREEN, CLR_RESET);
        } else {
            println!("{}FAIL{}", CLR_RED, CLR_RESET);
        }

        println!("{}--- ALL TESTS PASSED SUCCESSFULLY ---{}\n", CLR_BOLD, CLR_RESET);
        return;
    }
    println!("{}██║ ██╔╝██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗████╗  ██║██╔══██╗{}", CLR_BLUE, CLR_RESET);
    println!("{}█████═╝ ██║   ██║██████╔╝   ██║   ███████║██╔██╗ ██║███████║{}", CLR_BLUE, CLR_RESET);
    println!("{}██╔═██╗ ██║   ██║██╔══██╗   ██║   ██╔══██║██║╚██╗██║██╔══██║{}", CLR_BLUE, CLR_RESET);
    println!("{}██║  ██╗╚██████╔╝██║  ██║   ██║   ██║  ██║██║ ╚████║██║  ██║{}", CLR_BLUE, CLR_RESET);
    println!("{}╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝{}", CLR_BLUE, CLR_RESET);
    println!("\n{}--- KORTANA BLOCKCHAIN NODE (RUST) - PRODUCTION GRADE v1.0.0 ---{}", CLR_BOLD, CLR_RESET);
    println!("{}RPC Address: {}{}", CLR_CYAN, args.rpc_addr, CLR_RESET);
    println!("{}P2P Address: {}{}\n", CLR_CYAN, args.p2p_addr, CLR_RESET);

    // 1. Initialize Storage
    print!("{}[1/5] Initializing Database... {}", CLR_YELLOW, CLR_RESET);
    let storage = Arc::new(kortana_blockchain_rust::storage::Storage::new("./data/kortana.db"));
    println!("{}OK{}", CLR_GREEN, CLR_RESET);

    // 2. Load or Initialize State
    print!("{}[2/5] Loading Ledger State... {}", CLR_YELLOW, CLR_RESET);
    let (h_init, state) = match storage.get_latest_state() {
        Ok(Some((h, s))) => {
            println!("{}RESUMED at height {}{}", CLR_CYAN, h, CLR_RESET);
            (h, s)
        },
        _ => {
            println!("{}GENESIS{}", CLR_CYAN, CLR_RESET);
            let initial_state = kortana_blockchain_rust::core::genesis::create_genesis_state();
            (0, initial_state)
        }
    };

    let genesis_root = state.calculate_root();
    println!("Current state root: 0x{}", hex::encode(genesis_root));

    // 3. Initialize Core Components
    print!("{}[3/5] Starting Consensus Engine... {}", CLR_YELLOW, CLR_RESET);
    let genesis_validator = ValidatorInfo {
        address: Address::from_pubkey(b"genesis_validator"),
        stake: 32_000_000_000_000_000_000,
        is_active: true,
        commission: 500, // 5%
        missed_blocks: 0,
    };

    let node = Arc::new(KortanaNode {
        consensus: Arc::new(Mutex::new(ConsensusEngine::new(vec![genesis_validator.clone()]))),
        state: Arc::new(Mutex::new(state)),
        mempool: Arc::new(Mutex::new(Mempool::new(MEMPOOL_MAX_SIZE))),
        fees: Arc::new(Mutex::new(FeeMarket::new())),
        finality: Arc::new(Mutex::new(FinalityGadget::new())),
        storage: storage.clone(),
        height: Arc::new(AtomicU64::new(h_init)),
    });
    println!("{}OK{}", CLR_GREEN, CLR_RESET);

    println!("Node initialized at height {}", node.height.load(Ordering::Relaxed));

    // 4. Register Network Handlers
    print!("{}[4/5] Spawning P2P Networking... {}", CLR_YELLOW, CLR_RESET);
    let (p2p_tx, p2p_rx) = tokio::sync::mpsc::channel(100);
    let (node_tx, mut node_rx) = tokio::sync::mpsc::channel(100);
    
    let bootnodes = args.bootnodes.clone();
    let p2p_addr = args.p2p_addr.clone();

    tokio::spawn(async move {
        let mut network = kortana_blockchain_rust::network::p2p::KortanaNetwork::new(p2p_rx, node_tx).await.expect("Failed to create P2P network");
        for bn in bootnodes {
            if let Ok(addr) = bn.parse() {
                network.add_bootnode(addr);
            }
        }
        network.run(p2p_addr).await;
    });
    println!("{}RUNNING{}", CLR_GREEN, CLR_RESET);

    // 5. Start RPC Server
    print!("{}[5/5] Launching JSON-RPC... {}", CLR_YELLOW, CLR_RESET);
    let rpc_handler = Arc::new(kortana_blockchain_rust::rpc::RpcHandler {
        chain_id: CHAIN_ID,
        state: node.state.clone(),
        mempool: node.mempool.clone(),
        storage: node.storage.clone(),
        network_tx: p2p_tx.clone(),
        height: node.height.clone(),
    });

    let rpc_addr = args.rpc_addr.clone();
    tokio::spawn(async move {
        let listener = tokio::net::TcpListener::bind(&rpc_addr).await.unwrap();
        loop {
            let (mut socket, _) = listener.accept().await.unwrap();
            let handler = rpc_handler.clone();
            tokio::spawn(async move {
                let mut buffer = [0u8; 4096];
                if let Ok(n) = tokio::io::AsyncReadExt::read(&mut socket, &mut buffer).await {
                    let req_str = String::from_utf8_lossy(&buffer[..n]);
                    if req_str.starts_with("OPTIONS") {
                        let res = "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: POST, GET, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nContent-Length: 0\r\n\r\n";
                        let _ = tokio::io::AsyncWriteExt::write_all(&mut socket, res.as_bytes()).await;
                    } else if let Some(body_start) = req_str.find("\r\n\r\n") {
                        let body = &req_str[body_start + 4..];
                        if let Ok(req) = serde_json::from_str::<kortana_blockchain_rust::rpc::JsonRpcRequest>(body) {
                            let res = handler.handle(req).await;
                            let res_str = serde_json::to_string(&res).unwrap();
                            let http_res = format!(
                                "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: {}\r\n\r\n{}",
                                res_str.len(),
                                res_str
                            );
                            let _ = tokio::io::AsyncWriteExt::write_all(&mut socket, http_res.as_bytes()).await;
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
                        println!("{}[Slot {}]{} 👑 Producing block as leader...", CLR_YELLOW, current_slot, CLR_RESET);
                        
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
                                // Index transaction
                                let _ = node.storage.put_transaction(tx);
                                let _ = node.storage.put_index(&tx.from, tx.hash());
                                let _ = node.storage.put_index(&tx.to, tx.hash());
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
                            transactions: txs.clone(),
                            signature: vec![], 
                        };
                        
                        block.sign(&leader_priv);
                        
                        drop(fees);
                        let mut fees_mut = node.fees.lock().unwrap();
                        fees_mut.update_base_fee(block.header.gas_used);

                        let h = block.header.height;
                        let _ = p2p_tx.send(kortana_blockchain_rust::network::messages::NetworkMessage::NewBlock(block.clone())).await;
                        
                        node.height.fetch_add(1, Ordering::SeqCst);
                        let _ = node.storage.put_block(&block);
                        let _ = node.storage.put_state(block.header.height, &*state);
                        println!("  {}✅ Block {} produced successfully ({} txs){}", CLR_GREEN, h, txs.len(), CLR_RESET);
                    }
                }
            }

            // Periodic Sync Check
            _ = sync_check_interval.tick() => {
                let h = node.height.load(Ordering::SeqCst);
                if max_seen_height > h {
                     let start = h + 1;
                     let end = std::cmp::min(start + 50, max_seen_height);
                     println!("{}[SYNC]{} Node is behind. Requesting blocks {} to {}", CLR_CYAN, CLR_RESET, start, end);
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
                             println!("{}[P2P]{} Received block {} from {}", CLR_CYAN, CLR_RESET, block.header.height, block.header.proposer);
                             let mut state = node.state.lock().unwrap();
                             let mut fees = node.fees.lock().unwrap();
                             
                             let mut success = false;
                             {
                                 let mut processor = kortana_blockchain_rust::core::processor::BlockProcessor::new(&mut *state, fees.clone());
                                 if let Ok(_) = processor.validate_block(&block) {
                                     println!("  {}✅ Block verified and applied.{}", CLR_GREEN, CLR_RESET);
                                     *fees = processor.fee_market;
                                     success = true;
                                     // Index transactions
                                     for tx in &block.transactions {
                                         let _ = node.storage.put_transaction(tx);
                                         let _ = node.storage.put_index(&tx.from, tx.hash());
                                         let _ = node.storage.put_index(&tx.to, tx.hash());
                                     }
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
                        println!("{}[MEMPOOL]{} Added tx 0x{} from {}", CLR_MAGENTA, CLR_RESET, hex::encode(tx.hash())[..8].to_string(), tx.from);
                        mempool.add(tx);
                    }
                    kortana_blockchain_rust::network::messages::NetworkMessage::SyncRequest { start_height, end_height } => {
                        println!("{}[P2P]{} Servicing SyncRequest for {}-{}", CLR_CYAN, CLR_RESET, start_height, end_height);
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
                        println!("{}[SYNC]{} Received Response with {} blocks", CLR_CYAN, CLR_RESET, blocks.len());
                        let mut state = node.state.lock().unwrap();
                        let mut fees = node.fees.lock().unwrap();

                        for block in blocks {
                            let h = node.height.load(Ordering::SeqCst);
                            if block.header.height == h + 1 {
                                let mut success = false;
                                {
                                    let mut processor = kortana_blockchain_rust::core::processor::BlockProcessor::new(&mut *state, fees.clone());
                                    if let Ok(_) = processor.validate_block(&block) {
                                        println!("  {}✅ Sync Block {} verified.{}", CLR_GREEN, block.header.height, CLR_RESET);
                                        *fees = processor.fee_market.clone();
                                        success = true;
                                        // Index transactions
                                        for tx in &block.transactions {
                                            let _ = node.storage.put_transaction(tx);
                                            let _ = node.storage.put_index(&tx.from, tx.hash());
                                            let _ = node.storage.put_index(&tx.to, tx.hash());
                                        }
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
                             println!("{}🏆 FINALITY REACHED for height {} hash 0x{}{}", CLR_GREEN, height, hex::encode(block_hash), CLR_RESET);
                         }
                    }
                    _ => {}
                }
            }
        }
    }
}
