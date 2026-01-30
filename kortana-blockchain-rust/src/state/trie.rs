// File: src/state/trie.rs

use sha3::{Digest, Sha3_256};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum TrieNode {
    Empty,
    Leaf { 
        partial_path: Vec<u8>, 
        value: Vec<u8> 
    },
    Extension { 
        partial_path: Vec<u8>, 
        child_hash: [u8; 32] 
    },
    Branch { 
        children: [Option<[u8; 32]>; 16], 
        value: Option<Vec<u8>> 
    },
}

impl TrieNode {
    pub fn hash(&self) -> [u8; 32] {
        if let TrieNode::Empty = self {
            return [0u8; 32];
        }
        let serialized = serde_json::to_vec(self).unwrap();
        let mut hasher = Sha3_256::new();
        hasher.update(&serialized);
        hasher.finalize().into()
    }
}

#[derive(Clone, Debug)]
pub struct MerklePatriciaTrie {
    pub root_hash: [u8; 32],
    pub nodes: HashMap<[u8; 32], TrieNode>,
}

impl MerklePatriciaTrie {
    pub fn new() -> Self {
        Self {
            root_hash: [0u8; 32],
            nodes: HashMap::new(),
        }
    }

    pub fn insert(&mut self, key: &[u8], value: Vec<u8>) {
        let nibbles = self.to_nibbles(key);
        self.root_hash = self.insert_at(self.root_hash, &nibbles, value);
    }

    pub fn get(&self, key: &[u8]) -> Option<Vec<u8>> {
        let nibbles = self.to_nibbles(key);
        self.get_at(self.root_hash, &nibbles)
    }

    fn get_at(&self, current_hash: [u8; 32], nibbles: &[u8]) -> Option<Vec<u8>> {
        if current_hash == [0u8; 32] { return None; }
        let node = self.nodes.get(&current_hash)?;
        match node {
            TrieNode::Leaf { partial_path, value } => {
                if partial_path == nibbles { Some(value.clone()) } else { None }
            }
            TrieNode::Extension { partial_path, child_hash } => {
                let common = self.common_prefix(partial_path, nibbles);
                if common == partial_path.len() {
                    self.get_at(*child_hash, &nibbles[common..])
                } else {
                    None
                }
            }
            TrieNode::Branch { children, value } => {
                if nibbles.is_empty() {
                    value.clone()
                } else {
                    let idx = nibbles[0] as usize;
                    let next_hash = children[idx]?;
                    self.get_at(next_hash, &nibbles[1..])
                }
            }
            TrieNode::Empty => None,
        }
    }

    fn insert_at(&mut self, current_hash: [u8; 32], nibbles: &[u8], value: Vec<u8>) -> [u8; 32] {
        let node = if current_hash == [0u8; 32] {
            TrieNode::Leaf { partial_path: nibbles.to_vec(), value }
        } else {
            let current_node = self.nodes.get(&current_hash).cloned().unwrap_or(TrieNode::Empty);
            match current_node {
                TrieNode::Leaf { partial_path, value: old_value } => {
                    let common = self.common_prefix(&partial_path, nibbles);
                    if common == partial_path.len() && common == nibbles.len() {
                        TrieNode::Leaf { partial_path, value }
                    } else {
                        self.split_leaf_or_extension(true, &partial_path, old_value, nibbles, value)
                    }
                }
                TrieNode::Extension { partial_path, child_hash } => {
                    let common = self.common_prefix(&partial_path, nibbles);
                    if common == partial_path.len() {
                        let inner_hash = self.insert_at(child_hash, &nibbles[common..], value);
                        TrieNode::Extension { partial_path, child_hash: inner_hash }
                    } else {
                        // Complex: Split extension into (Extension? -> Branch -> (Extension/Leaf?))
                        self.split_node_complex(&partial_path, child_hash, nibbles, value)
                    }
                }
                TrieNode::Branch { mut children, value: branch_val } => {
                    if nibbles.is_empty() {
                        TrieNode::Branch { children, value: Some(value) }
                    } else {
                        let idx = nibbles[0] as usize;
                        let next_hash = children[idx].unwrap_or([0u8; 32]);
                        children[idx] = Some(self.insert_at(next_hash, &nibbles[1..], value));
                        TrieNode::Branch { children, value: branch_val }
                    }
                }
                TrieNode::Empty => TrieNode::Leaf { partial_path: nibbles.to_vec(), value },
            }
        };

        let h = node.hash();
        self.nodes.insert(h, node);
        h
    }

    fn split_leaf_or_extension(&mut self, _is_leaf: bool, old_path: &[u8], old_val: Vec<u8>, new_path: &[u8], new_val: Vec<u8>) -> TrieNode {
        let common = self.common_prefix(old_path, new_path);
        let mut children = [None; 16];
        
        let branch_val = if common == old_path.len() && common == new_path.len() {
            Some(new_val.clone())
        } else {
            // Old path next
            if common < old_path.len() {
                let idx = old_path[common] as usize;
                let h = self.insert_at([0u8; 32], &old_path[common+1..], old_val);
                children[idx] = Some(h);
            }
            // New path next
            if common < new_path.len() {
                let idx = new_path[common] as usize;
                let h = self.insert_at([0u8; 32], &new_path[common+1..], new_val);
                children[idx] = Some(h);
            }
            None
        };

        let branch = TrieNode::Branch { children, value: branch_val };
        if common > 0 {
            let branch_hash = branch.hash();
            self.nodes.insert(branch_hash, branch);
            TrieNode::Extension { partial_path: old_path[..common].to_vec(), child_hash: branch_hash }
        } else {
            branch
        }
    }

    fn split_node_complex(&mut self, ext_path: &[u8], child_hash: [u8; 32], new_path: &[u8], new_val: Vec<u8>) -> TrieNode {
        let common = self.common_prefix(ext_path, new_path);
        let mut children = [None; 16];
        
        // Old extension remainder
        let old_idx = ext_path[common] as usize;
        let old_remaining = &ext_path[common+1..];
        let sub_ext = if old_remaining.is_empty() {
            child_hash
        } else {
            let node = TrieNode::Extension { partial_path: old_remaining.to_vec(), child_hash };
            let h = node.hash();
            self.nodes.insert(h, node);
            h
        };
        children[old_idx] = Some(sub_ext);

        // New path
        if common < new_path.len() {
            let new_idx = new_path[common] as usize;
            let h = self.insert_at([0u8; 32], &new_path[common+1..], new_val);
            children[new_idx] = Some(h);
        }

        let branch = TrieNode::Branch { children, value: None };
        if common > 0 {
            let b_hash = branch.hash();
            self.nodes.insert(b_hash, branch);
            TrieNode::Extension { partial_path: ext_path[..common].to_vec(), child_hash: b_hash }
        } else {
            branch
        }
    }

    fn to_nibbles(&self, bytes: &[u8]) -> Vec<u8> {
        let mut nibbles = Vec::with_capacity(bytes.len() * 2);
        for &b in bytes {
            nibbles.push(b >> 4);
            nibbles.push(b & 0x0F);
        }
        nibbles
    }

    fn common_prefix(&self, a: &[u8], b: &[u8]) -> usize {
        let mut i = 0;
        while i < a.len() && i < b.len() && a[i] == b[i] {
            i += 1;
        }
        i
    }
}
