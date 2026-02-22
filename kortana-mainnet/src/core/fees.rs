// File: src/core/fees.rs

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeeMarket {
    pub base_fee: u128,
    pub target_gas_per_block: u64,
    pub elasticity_multiplier: u64,
}

impl Default for FeeMarket {
    fn default() -> Self {
        Self::new()
    }
}

impl FeeMarket {
    pub fn new() -> Self {
        Self {
            base_fee: crate::parameters::MIN_GAS_PRICE, // 1 wei — Kortana minimum
            target_gas_per_block: 15_000_000,
            elasticity_multiplier: 2,
        }
    }

    pub fn update_base_fee(&mut self, gas_used: u64) {
        let target = self.target_gas_per_block;
        let diff = if gas_used > target {
            (gas_used - target) as i128
        } else {
            -((target - gas_used) as i128)
        };

        // EIP-1559 base fee adjustment: clamped to ±12.5% per block, floored at MIN_GAS_PRICE
        let delta = (self.base_fee as i128 * diff) / (target as i128 * 8);
        self.base_fee = (self.base_fee as i128 + delta)
            .max(crate::parameters::MIN_GAS_PRICE as i128) as u128;
    }

    pub fn calculate_priority_fee(&self, max_fee: u128, max_priority_fee: u128) -> u128 {
        if max_fee < self.base_fee {
            return 0;
        }
        let potential_priority = max_fee - self.base_fee;
        std::cmp::min(potential_priority, max_priority_fee)
    }
}
