// File: src/core/processor.rs

use crate::state::account::State;
use crate::types::transaction::{Transaction, TransactionReceipt, VmType};
use crate::vm::evm::EvmExecutor;
use crate::vm::quorlin::{QuorlinExecutor, QuorlinOpcode};
use crate::address::Address;
use crate::parameters::*;

pub struct BlockProcessor<'a> {
    pub state: &'a mut State,
    pub fee_market: crate::core::fees::FeeMarket,
}

use crate::types::block::Block;

impl<'a> BlockProcessor<'a> {
    pub fn new(state: &'a mut State, fee_market: crate::core::fees::FeeMarket) -> Self {
        Self { state, fee_market }
    }

    pub fn process_transaction(&mut self, tx: Transaction, header: &crate::types::block::BlockHeader) -> Result<TransactionReceipt, String> {
        // 0. Chain ID validation (EIP-155)
        if tx.chain_id != CHAIN_ID {
            return Err(format!("Invalid chain ID: expected {}, got {}", CHAIN_ID, tx.chain_id));
        }

        // Process matured unbonding at the start of each tx or block
        let matured = self.state.staking.process_matured_unbonding(header.height);
        for (recipient_addr, amount) in matured {
            let mut acc = self.state.get_account(&recipient_addr);
            acc.balance += amount;
            self.state.update_account(recipient_addr, acc);
        }

        // 1. Basic validation
        let mut sender = self.state.get_account(&tx.from);
        if sender.nonce != tx.nonce {
            return Err("Invalid nonce".to_string());
        }
        
        let total_cost = tx.total_cost();
        if sender.balance < total_cost {
            return Err("Insufficient funds for tx".to_string());
        }

        // 2. Deduct upfront cost
        sender.balance -= total_cost;
        sender.nonce += 1;
        self.state.update_account(tx.from, sender.clone());

        // 3. Execute payload
        let mut logs = Vec::new();
        
        let is_staking = tx.to.to_hex() == STAKING_CONTRACT_ADDRESS;

        let (status, gas_used, contract_address) = if is_staking {
            // Primitive Staking Logic
            if tx.data.is_empty() {
                (0, 21000, None)
            } else {
                match tx.data[0] {
                    1 => { // Delegate
                        if tx.data.len() >= 25 {
                            let mut val_bytes = [0u8; 24];
                            val_bytes.copy_from_slice(&tx.data[1..25]);
                            if let Ok(validator_addr) = Address::from_bytes(val_bytes) {
                                self.state.staking.delegate(tx.from, validator_addr, tx.value, header.height);
                                (1, 50000, None)
                            } else { (0, 21000, None) }
                        } else { (0, 21000, None) }
                    }
                    2 => { // Undelegate
                         if tx.data.len() >= 25 {
                            let mut val_bytes = [0u8; 24];
                            val_bytes.copy_from_slice(&tx.data[1..25]);
                            // Parse amount from remaining data if present, or use tx.value as indicator (though undelegate usually doesn't send money)
                            let amount = tx.value; // For now use tx.value or parse from data
                            if let Ok(validator_addr) = Address::from_bytes(val_bytes) {
                                match self.state.staking.undelegate(tx.from, validator_addr, amount, header.height) {
                                    Ok(_) => (1, 50000, None),
                                    Err(_) => (0, 50000, None),
                                }
                            } else { (0, 21000, None) }
                         } else { (0, 21000, None) }
                    }
                    _ => (0, 21000, None)
                }
            }
        } else if let Some(precompile) = crate::vm::precompiles::get_precompile(&tx.to) {
             match precompile(&tx.data) {
                 Ok(_) => (1, 500u64, None), // Static cost for precompile
                 Err(_) => (0, 500u64, None),
             }
        } else {
            match tx.vm_type {
                VmType::EVM => {
                    // Check if this is a contract deployment (to == 0x0)
                    let is_deployment = tx.to == Address::ZERO || tx.to.to_hex() == "0x0000000000000000000000000000000000000000";
                    
                    if is_deployment {
                        // CONTRACT DEPLOYMENT
                        // Derive contract address from sender and nonce (nonce was already incremented)
                        let contract_addr = Address::derive_contract_address(&tx.from, tx.nonce - 1);
                        
                        // Execute init code to get runtime bytecode
                        let mut executor = EvmExecutor::new(contract_addr, tx.gas_limit);
                        executor.caller = tx.from;  // FIX: Set msg.sender
                        executor.callvalue = tx.value;  // FIX: Set msg.value
                        
                        match executor.execute(&tx.data, self.state, header) {
                            Ok(runtime_code) => {
                                // Store the runtime code
                                let code_hash = {
                                    use sha3::{Digest, Sha3_256};
                                    let mut hasher = Sha3_256::new();
                                    hasher.update(&runtime_code);
                                    let result = hasher.finalize();
                                    let mut hash = [0u8; 32];
                                    hash.copy_from_slice(&result);
                                    hash
                                };
                                
                                self.state.put_code(code_hash, runtime_code);
                                
                                // Create contract account
                                let mut contract_acc = self.state.get_account(&contract_addr);
                                contract_acc.is_contract = true;
                                contract_acc.code_hash = code_hash;
                                if tx.value > 0 {
                                    contract_acc.balance += tx.value;
                                }
                                self.state.update_account(contract_addr, contract_acc);
                                
                                logs = executor.logs;
                                (1, tx.gas_limit - executor.gas_remaining, Some(contract_addr))
                            }
                            Err(_) => (0, tx.gas_limit, None),
                        }
                    } else {
                        // REGULAR CONTRACT CALL
                        let to_account = self.state.get_account(&tx.to);
                        
                        if to_account.is_contract {
                            // Call existing contract
                            if let Some(code) = self.state.get_code(&to_account.code_hash) {
                                let mut executor = EvmExecutor::new(tx.to, tx.gas_limit);
                                executor.calldata = tx.data.clone();
                                executor.caller = tx.from;  // FIX: Set msg.sender
                                executor.callvalue = tx.value;  // FIX: Set msg.value
                                
                                match executor.execute(&code, self.state, header) {
                                    Ok(_) => {
                                        logs = executor.logs;
                                        (1, tx.gas_limit - executor.gas_remaining, None)
                                    }
                                    Err(_) => (0, tx.gas_limit, None),
                                }
                            } else {
                                // Contract has no code
                                (0, 21000, None)
                            }
                        } else {
                            // Regular transfer with data (no code to execute)
                            if !tx.data.is_empty() {
                                // Data sent to non-contract address
                                (1, 21000 + (tx.data.len() as u64 * 16), None)
                            } else {
                                (1, 21000, None)
                            }
                        }
                    }
                }
                VmType::Quorlin => {
                    // Quorlin contracts are currently expected to be passed as raw instructions (simplified for this era)
                    // In production, we'd have a bytecode -> instructions decoder.
                    // For now, we assume tx.data contains serialized instructions or we decode them.
                    if let Ok(instructions) = serde_json::from_slice::<Vec<QuorlinOpcode>>(&tx.data) {
                        let mut executor = QuorlinExecutor::new(tx.gas_limit);
                        match executor.execute(&instructions) {
                            Ok(_) => (1, tx.gas_limit - executor.gas_remaining, None),
                            Err(_) => (0, tx.gas_limit, None),
                        }
                    } else {
                        (0, 21000, None)
                    }
                }
            }
        };

        // 4. Transfer value (Only for non-staking, or if staking delegate)
        if status == 1 && tx.value > 0 && !is_staking {
            let mut recipient = self.state.get_account(&tx.to);
            recipient.balance += tx.value;
            self.state.update_account(tx.to, recipient);
        }

        // 5. Refund unused gas
        let refund = (tx.gas_limit - gas_used) as u128 * tx.gas_price;
        if refund > 0 {
            sender.balance += refund;
            self.state.update_account(tx.from, sender);
        }

        Ok(TransactionReceipt {
            tx_hash: tx.hash(),
            status,
            gas_used,
            logs,
            contract_address,
        })
    }

    pub fn validate_block(&mut self, block: &Block) -> Result<Vec<TransactionReceipt>, String> {
        // 1. Verify Base Fee matches expected
        if block.header.base_fee != self.fee_market.base_fee {
            return Err("Incorrect base fee in block header".to_string());
        }

        // 2. Verify VRF output matches leader (Simplified: check it's non-zero if using VRF)
        if block.header.vrf_output == [0u8; 32] {
             return Err("Missing VRF output in header".to_string());
        }

        // 3. Verify Header and Transactions Root
        let tx_root = Block::calculate_tx_root(&block.transactions);
        if tx_root != block.header.transactions_root {
            return Err("Invalid transactions root".to_string());
        }

        // 4. Process transactions sequentially
        let mut receipts = Vec::new();
        for tx in &block.transactions {
            // Verify tx gas price >= base fee
            if tx.gas_price < self.fee_market.base_fee {
                return Err(format!("Transaction gas price too low: {} < {}", tx.gas_price, self.fee_market.base_fee));
            }

            match self.process_transaction(tx.clone(), &block.header) {
                Ok(receipt) => receipts.push(receipt),
                Err(e) => return Err(format!("Transaction failed: {}", e)),
            }
        }

        // 5. Verify Receipts Root (Omitted for brevity, but same logic as tx_root)
        
        Ok(receipts)
    }
}
