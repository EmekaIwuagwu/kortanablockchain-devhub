// File: src/vm/quorlin.rs

use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QuorlinOpcode {
    Add, Sub, Mul, Div, Mod,
    Push(u64),
    Pop,
    Eq, Gt, Lt,
    And, Or, Xor, Not,
    LoadLocal(u8),
    StoreLocal(u8),
    LoadGlobal(String),
    StoreGlobal(String),
    Emit(String),
    Jump(usize),
    JumpIf(usize),
    Dup, Swap,
    Address, Balance, BlockHeight, Timestamp,
    Return,
    Revert,
}

pub struct QuorlinExecutor {
    pub stack: Vec<u64>,
    pub locals: [u64; 256],
    pub globals: HashMap<String, u64>,
    pub events: Vec<(String, u64)>,
    pub gas_remaining: u64,
    pub pc: usize,
}

impl QuorlinExecutor {
    pub fn new(gas: u64) -> Self {
        Self {
            stack: Vec::new(),
            locals: [0u64; 256],
            globals: HashMap::new(),
            events: Vec::new(),
            gas_remaining: gas,
            pc: 0,
        }
    }

    pub fn execute(&mut self, instructions: &[QuorlinOpcode]) -> Result<u64, String> {
        while self.pc < instructions.len() {
            self.consume_gas(1)?;
            let op = &instructions[self.pc];
            self.pc += 1;

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
                QuorlinOpcode::Eq => {
                    let a = self.stack.pop().ok_or("Stack underflow")?;
                    let b = self.stack.pop().ok_or("Stack underflow")?;
                    self.stack.push(if a == b { 1 } else { 0 });
                }
                QuorlinOpcode::And => {
                    let a = self.stack.pop().ok_or("Stack underflow")?;
                    let b = self.stack.pop().ok_or("Stack underflow")?;
                    self.stack.push(a & b);
                }
                QuorlinOpcode::Or => {
                    let a = self.stack.pop().ok_or("Stack underflow")?;
                    let b = self.stack.pop().ok_or("Stack underflow")?;
                    self.stack.push(a | b);
                }
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
                QuorlinOpcode::Jump(target) => {
                    self.pc = *target;
                }
                QuorlinOpcode::JumpIf(target) => {
                    let cond = self.stack.pop().ok_or("Stack underflow")?;
                    if cond != 0 { self.pc = *target; }
                }
                QuorlinOpcode::Address => {
                    self.stack.push(0x4b4f5254414e41); // "KORTANA" in hex
                }
                QuorlinOpcode::Balance => {
                    self.stack.push(1000 * 10u64.pow(18)); // Dummy balance for VM test
                }
                QuorlinOpcode::BlockHeight => {
                    self.stack.push(100); // Fixed for VM env
                }
                QuorlinOpcode::Timestamp => {
                    let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
                    self.stack.push(now);
                }
                QuorlinOpcode::Return => {
                    return self.stack.pop().ok_or("No return value".to_string());
                }
                QuorlinOpcode::Revert => return Err("Execution reverted".to_string()),
                _ => {} 
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
