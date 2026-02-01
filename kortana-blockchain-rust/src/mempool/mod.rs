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
    pub fn new(max_size: usize) -> Self {
        Self {
            heap: BinaryHeap::new(),
            seen_hashes: HashSet::new(),
            max_size,
        }
    }

    pub fn add(&mut self, tx: Transaction) -> bool {
        let hash = tx.hash();
        if self.seen_hashes.contains(&hash) || self.heap.len() >= self.max_size {
            return false;
        }
        
        let priority = tx.gas_price;
        self.seen_hashes.insert(hash);
        self.heap.push(MempoolTransaction { tx, priority });
        true
    }

    pub fn select_transactions(&mut self, gas_limit: u64) -> Vec<Transaction> {
        let mut selected = Vec::new();
        let mut total_gas = 0;
        
        // Use a temporary list to extract and potentially filter
        let mut temp_list = Vec::new();
        while let Some(m_tx) = self.heap.pop() {
            if total_gas + m_tx.tx.gas_limit <= gas_limit {
                total_gas += m_tx.tx.gas_limit;
                selected.push(m_tx.tx.clone());
            } else {
                temp_list.push(m_tx);
            }
        }
        
        // Push back those that didn't fit (optional, depending on policy)
        for m_tx in temp_list {
            self.heap.push(m_tx);
        }
        
        selected
    }

    pub fn size(&self) -> usize {
        self.heap.len()
    }

    pub fn get_all(&self) -> Vec<Transaction> {
        self.heap.iter().map(|mt| mt.tx.clone()).collect()
    }
}
