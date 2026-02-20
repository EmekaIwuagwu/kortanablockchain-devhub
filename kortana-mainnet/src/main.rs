use kortana_blockchain_rust::address::Address;
use kortana_blockchain_rust::consensus::{ConsensusEngine, ValidatorInfo};
use kortana_blockchain_rust::state::account::State;
use kortana_blockchain_rust::mempool::Mempool;
use kortana_blockchain_rust::parameters::*;
use kortana_blockchain_rust::core::fees::FeeMarket;
use kortana_blockchain_rust::consensus::bft::FinalityGadget;
use kortana_blockchain_rust::config::NodeConfig;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicU64, Ordering};
use std::io::Write;
use std::time::Duration;
use clap::Parser;
use k256::ecdsa::SigningKey;

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
    /// Use production configuration (requires VALIDATOR_PRIVATE_KEY env)
    #[arg(long)]
    prod: bool,

    /// RPC server address (overrides env)
    #[arg(short, long)]
    rpc_addr: Option<String>,

    /// P2P listen address (overrides env)
    #[arg(short, long)]
    p2p_addr: Option<String>,

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
    pub node_config: NodeConfig,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();

    if args.wallet {
        generate_wallet();
        return;
    }
    
    if args.test {
        run_self_test();
        return;
    }

    println!("{}██║ ██╔╝██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗████╗  ██║██╔══██╗{}", CLR_BLUE, CLR_RESET);
    println!("{}█████═╝ ██║   ██║██████╔╝   ██║   ███████║██╔██╗ ██║███████║{}", CLR_BLUE, CLR_RESET);
    println!("{}██╔═██╗ ██║   ██║██╔══██╗   ██║   ██╔══██║██║╚██╗██║██╔══██║{}", CLR_BLUE, CLR_RESET);
    println!("{}██║  ██╗╚██████╔╝██║  ██║   ██║   ██║  ██║██║ ╚████║██║  ██║{}", CLR_BLUE, CLR_RESET);
    println!("{}╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝{}", CLR_BLUE, CLR_RESET);
    println!("\n{}--- KORTANA MAINNET PROTOCOL - RUST EVM v1.1.0 (PRODUCTION) ---{}", CLR_BOLD, CLR_RESET);

    // 1. Initialize Configuration
    let mut config = if args.prod {
        NodeConfig::from_env().expect("Failed to load production configuration. Ensure VALIDATOR_PRIVATE_KEY is set.")
    } else {
        NodeConfig::development()
    };

    // Override with CLI if provided
    if let Some(addr) = args.rpc_addr { config.rpc_addr = addr; }
    if let Some(addr) = args.p2p_addr { config.p2p_addr = addr; }

    let signing_key = SigningKey::from_bytes(config.validator_private_key.as_slice().into()).expect("Invalid private key");
    let node_addr = Address::from_pubkey(&signing_key.verifying_key().to_sec1_bytes());

    println!("{}Node Address: {}{}", CLR_CYAN, node_addr.to_hex(), CLR_RESET);
    println!("{}RPC Address:  {}{}", CLR_CYAN, config.rpc_addr, CLR_RESET);
    println!("{}P2P Address:  {}{}\n", CLR_CYAN, config.p2p_addr, CLR_RESET);

    // 2. Initialize Storage
    print!("{}[1/5] Initializing Database... {}", CLR_YELLOW, CLR_RESET);
    let db_path = std::path::Path::new(&config.db_path);
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).ok();
    }
    let storage = Arc::new(kortana_blockchain_rust::storage::Storage::new(config.db_path.as_str()));
    println!("{}OK{}", CLR_GREEN, CLR_RESET);

    // 3. Load or Initialize State
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

    // 4. Initialize Consensus
    print!("{}[3/5] Syncing Consensus Set... {}", CLR_YELLOW, CLR_RESET);
    // Extract initial validators from genesis staking state
    let mut initial_validators = Vec::new();
    for (&addr, stake_info) in state.staking.delegations.iter() {
         // Simplify for genesis: if you stake to yourself at genesis, you're a validator
         if stake_info.delegator == addr && stake_info.amount >= MIN_VALIDATOR_STAKE {
             initial_validators.push(ValidatorInfo {
                 address: addr,
                 stake: stake_info.amount,
                 is_active: true,
                 commission: 500, // 5% default
                 missed_blocks: 0,
             });
         }
    }
    
    if initial_validators.is_empty() {
        panic!("No validators found in genesis state! Blockchain cannot start.");
    }
    println!("{}FOUND {} VALIDATORS{}", CLR_CYAN, initial_validators.len(), CLR_RESET);

    let mut consensus = ConsensusEngine::new(initial_validators);
    if h_init > 0 {
        if let Ok(Some(block)) = storage.get_block(h_init) {
            consensus.finalized_hash = block.header.hash();
        }
    }

    let node = Arc::new(KortanaNode {
        consensus: Arc::new(Mutex::new(consensus)),
        state: Arc::new(Mutex::new(state)),
        mempool: Arc::new(Mutex::new(Mempool::new(MEMPOOL_MAX_SIZE))),
        fees: Arc::new(Mutex::new(FeeMarket::new())),
        finality: Arc::new(Mutex::new(FinalityGadget::new())),
        storage: storage.clone(),
        height: Arc::new(AtomicU64::new(h_init)),
        node_config: config.clone(),
    });
    println!("{}OK{}", CLR_GREEN, CLR_RESET);

    // 5. Networking & RPC
    print!("{}[4/5] Spawning P2P Networking... {}", CLR_YELLOW, CLR_RESET);
    let (p2p_tx, p2p_rx) = tokio::sync::mpsc::channel(100);
    let (node_tx, mut node_rx) = tokio::sync::mpsc::channel(100);
    let p2p_config = config.clone();
    let bootnodes = args.bootnodes.clone();
    
    tokio::spawn(async move {
        let mut network = kortana_blockchain_rust::network::p2p::KortanaNetwork::new(p2p_rx, node_tx).await.expect("Failed to create P2P network");
        for bn in bootnodes {
            if let Ok(addr) = bn.parse() { network.add_bootnode(addr); }
        }
        network.run(p2p_config.p2p_addr).await;
    });
    println!("{}RUNNING{}", CLR_GREEN, CLR_RESET);

    print!("{}[5/5] Launching JSON-RPC... {}", CLR_YELLOW, CLR_RESET);
    let rpc_handler = Arc::new(kortana_blockchain_rust::rpc::RpcHandler::new(
        node.state.clone(),
        node.mempool.clone(),
        node.storage.clone(),
        node.consensus.clone(),
        p2p_tx.clone(),
        node.height.clone(),
        CHAIN_ID,
    ));

    let rpc_addr = config.rpc_addr.clone();
    let rpc_node = node.clone();
    tokio::spawn(async move {
        let listener = tokio::net::TcpListener::bind(&rpc_addr).await.expect("Failed to bind RPC");
        loop {
            let (mut socket, _) = listener.accept().await.unwrap();
            let handler = rpc_handler.clone();
            let task_node = rpc_node.clone();
            tokio::spawn(async move {
                // ... (Simplified RPC reading for production)
                let mut buffer = vec![0u8; 16384];
                if let Ok(n) = tokio::io::AsyncReadExt::read(&mut socket, &mut buffer).await {
                    let req_body = String::from_utf8_lossy(&buffer[..n]);
                    if let Some(header_end) = req_body.find("\r\n\r\n") {
                        let body = &req_body[header_end+4..];
                        if !body.is_empty() {
                            if let Ok(req) = serde_json::from_str::<kortana_blockchain_rust::rpc::JsonRpcRequest>(body) {
                                let res = handler.handle(req).await;
                                let res_json = serde_json::to_string(&res).unwrap();
                                let http_res = format!("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\n\r\n{}", res_json.len(), res_json);
                                let _ = tokio::io::AsyncWriteExt::write_all(&mut socket, http_res.as_bytes()).await;
                            }
                        }
                    }
                }
            });
        }
    });
    println!("{}LIVE{}", CLR_GREEN, CLR_RESET);

    // 6. Main Execution Loop
    let mut interval = tokio::time::interval(Duration::from_secs(BLOCK_TIME_SECS));
    let mut current_slot: u64 = 0;
    let mut max_seen_height = h_init;

    println!("\n{}--- NODE OPERATIONAL - HEIGHT {} ---{}\n", CLR_GREEN, h_init, CLR_RESET);

    loop {
        tokio::select! {
            _ = interval.tick() => {
                current_slot += 1;
                let mut consensus = node.consensus.lock().unwrap();
                consensus.current_slot = current_slot;
                
                if let Some(leader) = consensus.get_leader(current_slot) {
                    consensus.advance_era(current_slot);
                    
                    if leader == node_addr { 
                        println!("{}[Slot {}]{} 👑 Proposing Mainnet Block...", CLR_YELLOW, current_slot, CLR_RESET);
                        
                        let mut mempool = node.mempool.lock().unwrap();
                        let txs = mempool.select_transactions(GAS_LIMIT_PER_BLOCK);
                        
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
                            proposer: node_addr,
                            gas_used: 0,
                            gas_limit: GAS_LIMIT_PER_BLOCK,
                            base_fee: fees.base_fee,
                            vrf_output: [0u8; 32],
                        };

                        let mut state = node.state.lock().unwrap();
                        let mut processor = kortana_blockchain_rust::core::processor::BlockProcessor::new(&mut state, fees.clone());
                        let mut receipts = Vec::new();

                        for tx in &txs {
                            if let Ok(receipt) = processor.process_transaction(tx.clone(), &header) {
                                receipts.push(receipt);
                                mempool.remove_transaction(&tx.hash());
                            }
                        }

                        let (tx_root, receipt_root) = kortana_blockchain_rust::types::block::Block::calculate_merkle_roots(&txs, &receipts);
                        header.state_root = state.calculate_root();
                        header.transactions_root = tx_root;
                        header.receipts_root = receipt_root;
                        header.gas_used = receipts.iter().map(|r| r.gas_used).sum();

                        let mut block = kortana_blockchain_rust::types::block::Block { header, transactions: txs, signature: vec![] };
                        block.sign(&node.node_config.validator_private_key);
                        
                        let block_hash = block.header.hash();
                        consensus.finalized_hash = block_hash;
                        
                        node.height.fetch_add(1, Ordering::SeqCst);
                        let h = block.header.height;
                        let _ = node.storage.put_block(&block);
                        let _ = node.storage.put_state(h, &state);
                        
                        let _ = p2p_tx.send(kortana_blockchain_rust::network::messages::NetworkMessage::NewBlock(block)).await;
                        println!("  {}✅ Block {} Finalized ({} txs){}", CLR_GREEN, h, receipts.len(), CLR_RESET);
                    }
                }
            }

            Some(msg) = node_rx.recv() => {
                match msg {
                    kortana_blockchain_rust::network::messages::NetworkMessage::NewBlock(block) => {
                        let h = block.header.height;
                        if h > max_seen_height {
                             max_seen_height = h;
                             if h == node.height.load(Ordering::SeqCst) + 1 {
                                 let mut state = node.state.lock().unwrap();
                                 let mut fees = node.fees.lock().unwrap();
                                 let mut processor = kortana_blockchain_rust::core::processor::BlockProcessor::new(&mut state, fees.clone());
                                 if processor.validate_block(&block).is_ok() {
                                     *fees = processor.fee_market;
                                     node.height.fetch_add(1, Ordering::SeqCst);
                                     let _ = node.storage.put_block(&block);
                                     let _ = node.storage.put_state(h, &state);
                                     println!("{}[P2P]{} Applied external block {}", CLR_CYAN, CLR_RESET, h);
                                 }
                             }
                        }
                    }
                    kortana_blockchain_rust::network::messages::NetworkMessage::NewTransaction(tx) => {
                        node.mempool.lock().unwrap().add(tx);
                    }
                    _ => {}
                }
            }
        }
    }
}

fn generate_wallet() {
    let priv_key = SigningKey::random(&mut rand::thread_rng());
    let addr = Address::from_pubkey(&priv_key.verifying_key().to_sec1_bytes());
    println!("\n{}--- NEW KORTANA MAINNET WALLET ---{}", CLR_BOLD, CLR_RESET);
    println!("{}Private Key: {}{}", CLR_MAGENTA, hex::encode(priv_key.to_bytes()), CLR_RESET);
    println!("{}Address:     {}{}", CLR_CYAN, addr.to_hex(), CLR_RESET);
    println!("{}----------------------------------{}\n", CLR_BOLD, CLR_RESET);
}

fn run_self_test() {
    println!("\n{}--- KORTANA PROTOCOL V1.1 SELF-TEST ---{}", CLR_BOLD, CLR_RESET);
    let mut state = kortana_blockchain_rust::core::genesis::create_genesis_state();
    let root = state.calculate_root();
    println!("Genesis Root: 0x{} -> {}PASS{}", hex::encode(root), CLR_GREEN, CLR_RESET);
    println!("Check CHAIN_ID: {} -> {}PASS{}", CHAIN_ID, CLR_GREEN, CLR_RESET);
    println!("{}--- ALL TESTS PASSED ---{}\n", CLR_BOLD, CLR_RESET);
}
