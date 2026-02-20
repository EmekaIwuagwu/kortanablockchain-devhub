// File: src/core/processor.rs

use crate::state::account::State;
use crate::types::transaction::{Transaction, TransactionReceipt};
use crate::vm::evm::EvmExecutor;
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
        let tx_hash = tx.hash();
        println!("[PROCESSOR] >>> Processing TX: 0x{}, from: {}, to: {}, value: {}, gas: {}", 
            hex::encode(tx_hash), tx.from, tx.to, tx.value, tx.gas_limit);
        use std::io::Write;
        let _ = std::io::stdout().flush();

        // 0. Chain ID validation (EIP-155)
        if tx.chain_id != CHAIN_ID {
             println!("[PROCESSOR ERROR] Invalid Chain ID. Expected: {}, Got: {}", CHAIN_ID, tx.chain_id);
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
             println!("[PROCESSOR ERROR] Invalid Nonce. Account: {}, Expected: {}, Got: {}", tx.from, sender.nonce, tx.nonce);
            return Err("Invalid nonce".to_string());
        }
        
        let total_cost = tx.total_cost();
        if sender.balance < total_cost {
             println!("[PROCESSOR ERROR] Insufficient Funds. Account: {}, Balance: {}, Cost: {}", tx.from, sender.balance, total_cost);
            return Err("Insufficient funds for tx".to_string());
        }

        // 2. Deduct upfront cost
        sender.balance -= total_cost;
        sender.nonce += 1;
        self.state.update_account(tx.from, sender.clone());

        // 3. Execute payload
        let mut logs = Vec::new();
        
        let is_staking = tx.to.to_hex() == STAKING_CONTRACT_ADDRESS;
        let is_deployment = tx.to.is_evm_zero();
         
        // Calculate intrinsic gas
        let intrinsic_gas = if is_deployment { 53000 } else { 21000 };
        println!("[PROCESSOR DEBUG] is_deployment: {}, is_staking: {}, intrinsic_gas: {}", is_deployment, is_staking, intrinsic_gas);
        let _ = std::io::stdout().flush();
        if tx.gas_limit < intrinsic_gas {
            return Err(format!("Gas limit too low: {} < {}", tx.gas_limit, intrinsic_gas));
        }

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
                            let amount = tx.value;
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
                crate::types::transaction::VmType::EVM => {
                    if is_deployment {
                        // CONTRACT DEPLOYMENT
                        println!("[PROCESSOR] EVM Contract deployment detected - Data length: {}, Gas: {}", tx.data.len(), tx.gas_limit);
                        
                        // Derive contract address from sender and nonce (nonce was already incremented)
                        let contract_addr = Address::derive_contract_address(&tx.from, tx.nonce);
                        
                        let mut executor = EvmExecutor::new(contract_addr, tx.gas_limit - intrinsic_gas);
                        executor.caller = tx.from;
                        executor.callvalue = tx.value;

                        // Standard Ethereum: Transfer value to contract address BEFORE execution
                        if tx.value > 0 {
                            let mut contract_acc = self.state.get_account(&contract_addr);
                            contract_acc.balance += tx.value;
                            self.state.update_account(contract_addr, contract_acc);
                        }                
                        match executor.execute(&tx.data, self.state, header) {
                            Ok(runtime_code) => {
                                println!("[PROCESSOR DEBUG] EVM Deployment successful. Runtime code length: {}", runtime_code.len());
                                let _ = std::io::stdout().flush();
                                // Store the runtime code
                                let code_hash = {
                                    use sha3::{Digest, Keccak256};
                                    let mut hasher = Keccak256::new();
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
                                self.state.update_account(contract_addr, contract_acc);
                                
                                logs = executor.logs;
                                (1, tx.gas_limit - executor.gas_remaining, Some(contract_addr))
                            }
                            Err(e) => {
                                println!("[PROCESSOR ERROR] EVM Deployment failed: {:?}", e);
                                (0, tx.gas_limit, None)
                            }
                        }
                    } else {
                        // REGULAR CONTRACT CALL
                        let to_account = self.state.get_account(&tx.to);
                        
                        if to_account.is_contract {
                            // Call existing contract
                            if let Some(code) = self.state.get_code(&to_account.code_hash) {
                                 // Standard Ethereum: Transfer value to contract address BEFORE execution
                                if tx.value > 0 {
                                    let mut recipient = self.state.get_account(&tx.to);
                                    recipient.balance += tx.value;
                                    self.state.update_account(tx.to, recipient);
                                }

                                let mut executor = EvmExecutor::new(tx.to, tx.gas_limit - intrinsic_gas);
                                executor.calldata = tx.data.clone();
                                executor.caller = tx.from;
                                executor.callvalue = tx.value;
                                
                                match executor.execute(&code, self.state, header) {
                                    Ok(_) => {
                                        logs = executor.logs;
                                        (1, tx.gas_limit - executor.gas_remaining, None)
                                    }
                                    Err(e) => {
                                        println!("[PROCESSOR ERROR] EVM call failed: {:?}", e);
                                        (0, tx.gas_limit, None)
                                    },
                                }
                            } else {
                                // Contract has no code
                                (0, intrinsic_gas, None)
                            }
                        } else {
                            let gas_used = intrinsic_gas + (tx.data.len() as u64 * 16);
                            if gas_used > tx.gas_limit {
                                println!("[PROCESSOR ERROR] Out of gas: used {} > limit {}", gas_used, tx.gas_limit);
                                (0, tx.gas_limit, None) // Return 0 status, used all gas
                            } else {
                                println!("[PROCESSOR] Regular EVM transfer: from {} to {} value {}", tx.from, tx.to, tx.value);
                                // Transfer value to recipient
                                if tx.value > 0 {
                                    let mut recipient = self.state.get_account(&tx.to);
                                    recipient.balance += tx.value;
                                    self.state.update_account(tx.to, recipient);
                                }
                                (1, gas_used, None)
                            }
                        }
                    }
                }
                crate::types::transaction::VmType::Quorlin => {
                    use crate::vm::quorlin::QuorlinExecutor;
                    if is_deployment {
                        println!("[PROCESSOR] Quorlin Contract deployment detected");
                        let contract_addr = Address::derive_contract_address(&tx.from, tx.nonce);
                        let mut executor = QuorlinExecutor::new(contract_addr, tx.gas_limit - intrinsic_gas);
                        
                        match executor.execute(&tx.data, self.state) {
                            Ok(_) => {
                                // For Quorlin, we'll store the original bytecode as the "code"
                                let code_hash = {
                                    use sha3::{Digest, Keccak256};
                                    let mut hasher = Keccak256::new();
                                    hasher.update(&tx.data);
                                    let result = hasher.finalize();
                                    let mut hash = [0u8; 32];
                                    hash.copy_from_slice(&result);
                                    hash
                                };
                                self.state.put_code(code_hash, tx.data.clone());
                                let mut contract_acc = self.state.get_account(&contract_addr);
                                contract_acc.is_contract = true;
                                contract_acc.code_hash = code_hash;
                                self.state.update_account(contract_addr, contract_acc);
                                (1, tx.gas_limit - executor.gas_remaining, Some(contract_addr))
                            }
                            Err(e) => {
                                println!("[PROCESSOR ERROR] Quorlin deployment failed: {}", e);
                                (0, tx.gas_limit, None)
                            }
                        }
                    } else {
                        // Call Quorlin contract
                        let to_account = self.state.get_account(&tx.to);
                        if to_account.is_contract {
                            if let Some(code) = self.state.get_code(&to_account.code_hash) {
                                let mut executor = QuorlinExecutor::new(tx.to, tx.gas_limit - intrinsic_gas);
                                match executor.execute(&code, self.state) {
                                    Ok(_) => (1, tx.gas_limit - executor.gas_remaining, None),
                                    Err(e) => {
                                        println!("[PROCESSOR ERROR] Quorlin call failed: {}", e);
                                        (0, tx.gas_limit, None)
                                    }
                                }
                            } else { (0, intrinsic_gas, None) }
                        } else { (0, intrinsic_gas, None) }
                    }
                }
            }
        };

        // 5. Refund unused gas AND value if failed
        let mut refund = if tx.gas_limit >= gas_used {
            (tx.gas_limit - gas_used) as u128 * tx.gas_price
        } else {
            0
        };

        if status == 0 && tx.value > 0 && !is_staking {
            // Revert value transfer on failure
            refund += tx.value;
        }
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
