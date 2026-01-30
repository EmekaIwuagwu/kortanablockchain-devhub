// File: src/vm/quorlin.rs

use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QuorlinOpcode {
    Add, Sub, Mul, Div,
    Push(u64),
    Pop,
    LoadLocal(u8),
    StoreLocal(u8),
    LoadGlobal(String),
    StoreGlobal(String),
    Emit(String),
    Return,
    Revert,
}

pub struct QuorlinExecutor {
    pub stack: Vec<u64>,
    pub locals: [u64; 256],
    pub globals: HashMap<String, u64>,
    pub events: Vec<(String, u64)>,
    pub gas_remaining: u64,
}

impl QuorlinExecutor {
    pub fn new(gas: u64) -> Self {
        Self {
            stack: Vec::new(),
            locals: [0u64; 256],
            globals: HashMap::new(),
            events: Vec::new(),
            gas_remaining: gas,
        }
    }

    pub fn execute(&mut self, instructions: &[QuorlinOpcode]) -> Result<u64, String> {
        for op in instructions {
            self.consume_gas(1)?;
            match op {
                QuorlinOpcode::Add => {
                    let a = self.stack.pop().ok_or("Stack underflow")?;
                    let b = self.stack.pop().ok_or("Stack underflow")?;
                    self.stack.push(a.wrapping_add(b));
                }
                QuorlinOpcode::Sub => {
                    let a = self.stack.pop().ok_or("Stack underflow")?;
                    let b = self.stack.pop().ok_or("Stack underflow")?;
                    self.stack.push(b.wrapping_sub(a));
                }
                QuorlinOpcode::Push(v) => self.stack.push(*v),
                QuorlinOpcode::Pop => { self.stack.pop(); },
                QuorlinOpcode::LoadLocal(idx) => {
                    self.stack.push(self.locals[*idx as usize]);
                }
                QuorlinOpcode::StoreLocal(idx) => {
                    let val = self.stack.pop().ok_or("Stack underflow")?;
                    self.locals[*idx as usize] = val;
                }
                QuorlinOpcode::LoadGlobal(key) => {
                    let val = *self.globals.get(key).unwrap_or(&0);
                    self.stack.push(val);
                }
                QuorlinOpcode::StoreGlobal(key) => {
                    let val = self.stack.pop().ok_or("Stack underflow")?;
                    self.globals.insert(key.clone(), val);
                }
                QuorlinOpcode::Emit(event) => {
                    let val = self.stack.pop().ok_or("Stack underflow")?;
                    self.events.push((event.clone(), val));
                }
                QuorlinOpcode::Return => {
                    return self.stack.pop().ok_or("No return value".to_string());
                }
                QuorlinOpcode::Revert => return Err("Execution reverted".to_string()),
                _ => return Err("Not implemented".to_string()),
            }
        }
        Ok(0)
    }

    fn consume_gas(&mut self, amount: u64) -> Result<(), String> {
        if self.gas_remaining < amount {
            return Err("Out of gas".to_string());
        }
        self.gas_remaining -= amount;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_quorlin_add() {
        let mut executor = QuorlinExecutor::new(100);
        let ops = vec![
            QuorlinOpcode::Push(10),
            QuorlinOpcode::Push(20),
            QuorlinOpcode::Add,
            QuorlinOpcode::Return,
        ];
        let res = executor.execute(&ops).unwrap();
        assert_eq!(res, 30);
    }
}
