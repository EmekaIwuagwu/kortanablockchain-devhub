// File: src/state/account.rs

use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use crate::address::Address;

use crate::state::trie::MerklePatriciaTrie;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub nonce: u64,
    pub balance: u128,
    pub storage_root: [u8; 32],
    pub code_hash: [u8; 32],
    pub is_contract: bool,
}

impl Default for Account {
    fn default() -> Self {
        Self::new()
    }
}

impl Account {
    pub fn new() -> Self {
        Self {
            nonce: 0,
            balance: 0,
            storage_root: [0u8; 32],
            code_hash: [0u8; 32],
            is_contract: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct State {
    pub accounts: HashMap<Address, Account>,
    pub storage: HashMap<Address, HashMap<[u8; 32], [u8; 32]>>,
    pub codes: HashMap<[u8; 32], Vec<u8>>,
    pub trie: MerklePatriciaTrie,
    pub staking: crate::staking::StakingStore,
}

impl Default for State {
    fn default() -> Self {
        Self::new()
    }
}

impl State {
    pub fn new() -> Self {
        Self {
            accounts: HashMap::new(),
            storage: HashMap::new(),
            codes: HashMap::new(),
            trie: MerklePatriciaTrie::new(),
            staking: crate::staking::StakingStore::new(),
        }
    }

    pub fn get_code(&self, hash: &[u8; 32]) -> Option<Vec<u8>> {
        self.codes.get(hash).cloned()
    }

    pub fn put_code(&mut self, hash: [u8; 32], code: Vec<u8>) {
        self.codes.insert(hash, code);
    }

    pub fn get_account(&self, addr: &Address) -> Account {
        self.accounts.get(addr).cloned().unwrap_or(Account::new())
    }

    pub fn update_account(&mut self, addr: Address, account: Account) {
        self.accounts.insert(addr, account.clone());
        // Update Trie
        let serialized = serde_json::to_vec(&account).unwrap();
        self.trie.insert(&addr.to_bytes(), serialized);
    }

    pub fn transfer(&mut self, from: &Address, to: &Address, amount: u128) -> Result<(), String> {
        let mut from_acc = self.get_account(from);
        let mut to_acc = self.get_account(to);
        
        if from_acc.balance < amount {
            return Err("Insufficient balance".to_string());
        }
        
        from_acc.balance -= amount;
        to_acc.balance += amount;
        
        self.update_account(*from, from_acc);
        self.update_account(*to, to_acc);
        Ok(())
    }

    pub fn calculate_root(&self) -> [u8; 32] {
        self.trie.root_hash
    }
}
