import { ethers } from 'ethers';

const RPC_URL = 'http://localhost:8545';

export const provider = new ethers.JsonRpcProvider(RPC_URL);

// ERC20 ABI for basic token info
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)"
];

export async function getLatestBlocks(count = 10) {
    try {
        const latestBlockNumber = await provider.getBlockNumber();
        const blocks = [];
        const start = Math.max(0, latestBlockNumber - count + 1);

        for (let i = latestBlockNumber; i >= start; i--) {
            const block = await provider.getBlock(i);
            if (block) blocks.push(block);
        }
        return blocks;
    } catch (error) {
        console.error('Error fetching latest blocks:', error);
        return [];
    }
}

export async function getBlock(hashOrNumber) {
    try {
        return await provider.getBlock(hashOrNumber);
    } catch (error) {
        console.error('Error fetching block:', error);
        return null;
    }
}

export async function getTransaction(hash) {
    try {
        return await provider.getTransaction(hash);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return null;
    }
}

export async function getTransactionReceipt(hash) {
    try {
        return await provider.getTransactionReceipt(hash);
    } catch (error) {
        console.error('Error fetching transaction receipt:', error);
        return null;
    }
}

export async function getAddressBalance(address) {
    try {
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (error) {
        console.error('Error fetching address balance:', error);
        return '0';
    }
}

export async function getTransactionCount(address) {
    try {
        const count = await provider.getTransactionCount(address);
        return count;
    } catch (error) {
        console.error('Error fetching txn count:', error);
        return 0;
    }
}

export async function getAddressHistory(address) {
    try {
        const txs = await provider.send("eth_getAddressHistory", [address]);
        return txs;
    } catch (error) {
        console.error("Error fetching address history:", error);
        return [];
    }
}

export async function getCode(address) {
    try {
        return await provider.getCode(address);
    } catch (error) {
        console.error('Error fetching code:', error);
        return '0x';
    }
}

export async function getTokenMetadata(address) {
    try {
        const code = await getCode(address);
        if (code === '0x') return null;

        const contract = new ethers.Contract(address, ERC20_ABI, provider);
        const [name, symbol, decimals] = await Promise.all([
            contract.name().catch(() => null),
            contract.symbol().catch(() => null),
            contract.decimals().catch(() => 18)
        ]);

        if (!name || !symbol) return null;

        return { address, name, symbol, decimals };
    } catch (error) {
        return null;
    }
}

// Mock Validator Data based on Kortana Specification
// Validators Data fetch via custom RPC
export async function getValidators() {
    try {
        const validators = await provider.send("eth_getValidators", []);
        // Map to include a display name if missing
        return validators.map((v, i) => ({
            ...v,
            name: v.name || `Validator-${i + 1}`, // Fallback name
            uptime: v.uptime || '100.00',
            blocksProduced: v.blocksProduced || 0
        })).sort((a, b) => Number(b.stake) - Number(a.stake));
    } catch (error) {
        console.error("Error fetching validators:", error);
        return [];
    }
}

export async function getNetworkStats() {
    try {
        const [blockNumber, gasPrice, validators] = await Promise.all([
            provider.getBlockNumber(),
            provider.getFeeData(),
            getValidators()
        ]);

        return {
            latestBlock: blockNumber,
            gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
            tps: (Math.random() * 2 + 0.5).toFixed(2), // Lower realistic range for now
            activeValidators: validators.filter(v => v.isActive).length,
            marketCap: (1000000000 * 1.24).toLocaleString()
        };
    } catch (error) {
        console.error('Error fetching network stats:', error);
        return null;
    }
}

// Transaction History Fallback (Since RPCs don't index by address easily)
// Transaction History Fallback (Since RPCs don't index by address easily)
export async function getRecentTransactions(address, maxBlocks = 50) {
    try {
        const latestBlock = await provider.getBlockNumber();
        const startBlock = Math.max(0, latestBlock - maxBlocks);
        const txs = [];

        // Optimized: only look at last 50 blocks to prevent hanging
        for (let i = latestBlock; i >= startBlock; i--) {
            try {
                const block = await provider.getBlock(i, true);
                if (block && block.prefetchedTransactions) {
                    const filtered = block.prefetchedTransactions.filter(
                        tx => tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()
                    );
                    txs.push(...filtered);
                }
            } catch (e) {
                console.warn(`Skip block ${i}`, e);
            }
            if (txs.length >= 20) break;
        }
        return txs;
    } catch (error) {
        console.error('Error searching transactions:', error);
        return [];
    }
}

export async function getPendingTransactions() {
    try {
        const txs = await provider.send("eth_pendingTransactions", []);
        return txs;
    } catch (error) {
        // Fallback or error logging
        console.error("Error fetching pending transactions:", error);
        return [];
    }
}
