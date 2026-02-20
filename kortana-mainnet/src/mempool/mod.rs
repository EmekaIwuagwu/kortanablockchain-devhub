// File: src/mempool/mod.rs

use std::collections::{BinaryHeap, HashSet};
use crate::types::transaction::Transaction;
use std::cmp::Ordering;

#[derive(Debug, Clone)]
struct MempoolTransaction {
    tx: Transaction,
    priority: u128,
}

impl PartialEq for MempoolTransaction {
    fn eq(&self, other: &Self) -> bool {
        self.priority == other.priority
    }
}

impl Eq for MempoolTransaction {}

impl PartialOrd for MempoolTransaction {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for MempoolTransaction {
    fn cmp(&self, other: &Self) -> Ordering {
        self.priority.cmp(&other.priority)
    }
}

pub struct Mempool {
    heap: BinaryHeap<MempoolTransaction>,
    seen_hashes: HashSet<[u8; 32]>,
    max_size: usize,
}

impl Mempool {
    #[allow(clippy::new_without_default)]
    pub fn new(max_size: usize) -> Self {
        Self {
            heap: BinaryHeap::new(),
            seen_hashes: HashSet::new(),
            max_size,
        }
    }

    pub fn add(&mut self, tx: Transaction) -> bool {
        use std::io::Write;
        let hash = tx.hash();
        println!("[MEMPOOL] add() called - TX hash: 0x{}, current size: {}, max: {}", 
            hex::encode(hash), self.heap.len(), self.max_size);
        let _ = std::io::stdout().flush();
        
        if self.seen_hashes.contains(&hash) {
            println!("[MEMPOOL] REJECTED: Transaction already seen");
            let _ = std::io::stdout().flush();
            return false;
        }
        
        if self.heap.len() >= self.max_size {
            println!("[MEMPOOL] REJECTED: Mempool is full ({}/{})", self.heap.len(), self.max_size);
            let _ = std::io::stdout().flush();
            return false;
        }
        
        let priority = tx.gas_price;
        self.seen_hashes.insert(hash);
        self.heap.push(MempoolTransaction { tx, priority });
        println!("[MEMPOOL] ACCEPTED: Transaction added. New size: {}", self.heap.len());
        let _ = std::io::stdout().flush();
        true
    }

    pub fn select_transactions(&self, gas_limit: u64) -> Vec<Transaction> {
        let mut selected = Vec::new();
        let mut total_gas = 0;
        
        let mut tx_pool: Vec<_> = self.heap.iter().collect();
        tx_pool.sort_by(|a, b| b.priority.cmp(&a.priority));

        for m_tx in tx_pool {
            if total_gas + m_tx.tx.gas_limit <= gas_limit {
                total_gas += m_tx.tx.gas_limit;
                selected.push(m_tx.tx.clone());
            }
        }
        
        selected
    }

    pub fn remove_transaction(&mut self, hash: &[u8; 32]) {
        use std::io::Write;
        println!("[MEMPOOL] remove_transaction() - Hash: 0x{}", hex::encode(hash));
        let _ = std::io::stdout().flush();

        self.seen_hashes.remove(hash);
        let mut new_heap = BinaryHeap::new();
        while let Some(m_tx) = self.heap.pop() {
            if &m_tx.tx.hash() != hash {
                new_heap.push(m_tx);
            }
        }
        self.heap = new_heap;
    }

    pub fn size(&self) -> usize {
        self.heap.len()
    }

    pub fn get_all(&self) -> Vec<Transaction> {
        self.heap.iter().map(|mt| mt.tx.clone()).collect()
    }

    pub fn get_transaction(&self, hash: &[u8; 32]) -> Option<Transaction> {
        self.heap.iter().find(|mt| &mt.tx.hash() == hash).map(|mt| mt.tx.clone())
    }
}
