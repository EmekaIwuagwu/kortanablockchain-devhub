use serde::{Serialize, Deserialize};
use crate::address::Address;
use crate::state::account::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QuorlinOpcode {
    Push(u64),
    Add,
    StoreGlobal(String),
    Address,
    Return,
}

pub struct QuorlinExecutor {
    pub address: Address,
    pub stack: Vec<u64>,
    pub gas_remaining: u64,
}

impl QuorlinExecutor {
    pub fn new(address: Address, gas_limit: u64) -> Self {
        Self {
            address,
            stack: Vec::new(),
            gas_remaining: gas_limit,
        }
    }

    pub fn execute(&mut self, bytecode: &[u8], state: &mut State) -> Result<Vec<u8>, String> {
        let opcodes: Vec<QuorlinOpcode> = serde_json::from_slice(bytecode)
            .map_err(|e| format!("Invalid Quorlin bytecode: {}", e))?;

        for opcode in opcodes {
            if self.gas_remaining < 10 {
                return Err("Out of gas in Quorlin VM".to_string());
            }
            self.gas_remaining -= 10;

            match opcode {
                QuorlinOpcode::Push(val) => {
                    self.stack.push(val);
                }
                QuorlinOpcode::Add => {
                    let a = self.stack.pop().ok_or("Stack underflow")?;
                    let b = self.stack.pop().ok_or("Stack underflow")?;
                    self.stack.push(a.wrapping_add(b));
                }
                QuorlinOpcode::StoreGlobal(key) => {
                    let val = self.stack.pop().ok_or("Stack underflow")?;
                    // Convert val to [u8; 32] for EVM-compatible state storage
                    let mut bytes = [0u8; 32];
                    bytes[24..32].copy_from_slice(&val.to_be_bytes());
                    
                    let mut key_bytes = [0u8; 32];
                    let key_hash = {
                        use sha3::{Digest, Keccak256};
                        let mut hasher = Keccak256::new();
                        hasher.update(key.as_bytes());
                        let res = hasher.finalize();
                        key_bytes.copy_from_slice(&res);
                        key_bytes
                    };

                    let storage = state.storage.entry(self.address).or_default();
                    storage.insert(key_hash, bytes);
                }
                QuorlinOpcode::Address => {
                    // For Quorlin, address is just numeric-ish for now
                    let addr_bytes = self.address.to_bytes();
                    let mut val = 0u64;
                    for i in 16..24 {
                        val = (val << 8) | addr_bytes[i] as u64;
                    }
                    self.stack.push(val);
                }
                QuorlinOpcode::Return => {
                    let val = self.stack.pop().ok_or("Stack underflow")?;
                    return Ok(val.to_be_bytes().to_vec());
                }
            }
        }

        Ok(Vec::new())
    }
}
