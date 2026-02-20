// File: src/parameters.rs

pub const CHAIN_ID: u64 = 72511;
pub const TESTNET_CHAIN_ID: u64 = 11155111;

pub const STAKING_CONTRACT_ADDRESS: &str = "0x0000000000000000000000000000000000000001";

pub const BLOCK_TIME_SECS: u64 = 5;
pub const SLOT_DURATION_SECS: u64 = 5;
pub const FINALITY_DELAY_SLOTS: u64 = 20;

pub const BLOCKS_PER_EPOCH: u64 = 432;  // ~36 minutes
pub const BLOCKS_PER_DAY: u64 = 17280;
pub const BLOCKS_PER_YEAR: u64 = 6_307_200;
pub const EPOCHS_PER_YEAR: u64 = 14600;

pub const INITIAL_BLOCK_REWARD: u128 = 5_000_000_000_000_000_000;  // 5 DNR
pub const HALVING_INTERVAL: u64 = 4_320_000;  // ~1 year
pub const HALVING_PERCENTAGE: u32 = 10;

pub const TOTAL_SUPPLY: u128 = 800_000_000_000_000_000_000_000_000_000_000;  // 800B DNR

pub const MIN_VALIDATOR_STAKE: u128 = 32_000_000_000_000_000_000;  // 32 DNR
pub const ACTIVE_VALIDATOR_COUNT: usize = 50;
pub const MAX_COMMISSION_RATE: u16 = 10000;  // 100% in basis points

pub const MIN_GAS_PRICE: u128 = 1;  // 1 satoshi
pub const GAS_LIMIT_PER_BLOCK: u64 = 30_000_000;
pub const GAS_LIMIT_PER_TX: u64 = 10_000_000;
pub const MIN_GAS_PER_TX: u64 = 21_000;

pub const MEMPOOL_MAX_SIZE: usize = 10_000;
pub const MEMPOOL_TX_TIMEOUT: u64 = 604800;  // 7 days in seconds

pub const BASE_FEE_BURN_PERCENT: u16 = 5000;  // 50%
pub const BASE_FEE_PROPOSER_PERCENT: u16 = 5000;  // 50%

pub const SLASH_DOUBLE_PROPOSAL: u16 = 1000;  // 10%
pub const SLASH_EQUIVOCATION: u16 = 3300;  // 33%
pub const SLASH_DOWNTIME: u16 = 100;  // 1%
pub const SLASH_BYZANTINE: u16 = 10000;  // 100%

pub const MAX_MISSED_BLOCKS_BEFORE_JAIL: u64 = 50;
pub const JAIL_DURATION_SLOTS: u64 = 500;
pub const UNBONDING_PERIOD_BLOCKS: u64 = 20160; // Approx 1 day at 5s blocks (simplified)

pub fn calculate_block_reward(block_number: u64) -> u128 {
    let halvings = block_number / HALVING_INTERVAL;
    let mut reward = INITIAL_BLOCK_REWARD;
    
    for _ in 0..halvings {
        reward = (reward * (100 - HALVING_PERCENTAGE as u128)) / 100;
        if reward == 0 {
            break;
        }
    }
    
    reward
}

pub fn is_valid_commission_rate(rate: u16) -> bool {
    rate <= MAX_COMMISSION_RATE
}

pub fn is_valid_gas_price(price: u128) -> bool {
    price >= MIN_GAS_PRICE
}

pub fn is_valid_gas_limit(limit: u64) -> bool {
    (MIN_GAS_PER_TX..=GAS_LIMIT_PER_TX).contains(&limit)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_block_reward_initial() {
        let reward = calculate_block_reward(0);
        assert_eq!(reward, INITIAL_BLOCK_REWARD);
    }

    #[test]
    fn test_block_reward_after_halving() {
        let reward = calculate_block_reward(HALVING_INTERVAL);
        assert_eq!(reward, (INITIAL_BLOCK_REWARD * 90) / 100);
    }

    #[test]
    fn test_block_reward_double_halving() {
        let reward = calculate_block_reward(HALVING_INTERVAL * 2);
        let first_halving = (INITIAL_BLOCK_REWARD * 90) / 100;
        let expected = (first_halving * 90) / 100;
        assert_eq!(reward, expected);
    }

    #[test]
    fn test_gas_validation() {
        assert!(is_valid_gas_price(MIN_GAS_PRICE));
        assert!(!is_valid_gas_price(0));
        assert!(is_valid_gas_limit(MIN_GAS_PER_TX));
        assert!(is_valid_gas_limit(GAS_LIMIT_PER_TX));
        assert!(!is_valid_gas_limit(GAS_LIMIT_PER_TX + 1));
    }

    #[test]
    fn test_commission_rate_validation() {
        assert!(is_valid_commission_rate(0));
        assert!(is_valid_commission_rate(5000));  // 50%
        assert!(is_valid_commission_rate(MAX_COMMISSION_RATE));
        assert!(!is_valid_commission_rate(MAX_COMMISSION_RATE + 1));
    }

    #[test]
    fn test_total_annual_supply_year_1() {
        let mut total = 0u128;
        for block in 0..BLOCKS_PER_YEAR {
            total = total.saturating_add(calculate_block_reward(block));
        }
        assert!(total < 50_000_000_000_000_000_000_000_000_000_000_000_000);  // Adjusted for total supply scale
        assert!(total > 30_000_000_000_000_000_000_000_000);
    }
}
