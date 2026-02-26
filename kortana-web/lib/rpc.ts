// Kortana Network Constants — source of truth for the frontend
export const NETWORK = {
    mainnet: {
        name: "Kortana Mainnet",
        chainId: 9002,
        chainIdHex: "0x232A",
        rpcUrl: "https://zeus-rpc.mainnet.kortana.xyz",
        explorerUrl: "https://explorer.mainnet.kortana.xyz",
        symbol: "DNR",
        decimals: 18,
        blockTime: 2,         // seconds
        totalSupply: "500,000,000,000", // 500B DNR
        status: "🟢 LIVE",
    },
    testnet: {
        name: "Kortana Testnet",
        chainId: 72511,
        chainIdHex: "0x11B3F",
        rpcUrl: "https://poseidon-rpc.testnet.kortana.xyz/",
        explorerUrl: "https://explorer.testnet.kortana.xyz",
        symbol: "DNR",
        decimals: 18,
        blockTime: 2,
        status: "🟢 LIVE",
    },
} as const;

type NetworkKey = keyof typeof NETWORK;

async function fetchBlockHeight(rpcUrl: string): Promise<string> {
    try {
        const response = await fetch(rpcUrl, {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_blockNumber",
                params: [],
                id: 1,
            }),
        });
        const data = await response.json();
        if (data.result) {
            return parseInt(data.result, 16).toLocaleString();
        }
        return "N/A";
    } catch {
        return "N/A";
    }
}

/** Fetch live block height from mainnet (default) or testnet */
export async function getBlockHeight(network: NetworkKey = "mainnet"): Promise<string> {
    return fetchBlockHeight(NETWORK[network].rpcUrl);
}

/** Fetch a generic eth_call result from the given network */
export async function ethCall(
    to: string,
    data: string,
    network: NetworkKey = "mainnet"
): Promise<string | null> {
    try {
        const response = await fetch(NETWORK[network].rpcUrl, {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_call",
                params: [{ to, data }, "latest"],
                id: 1,
            }),
        });
        const json = await response.json();
        return json.result ?? null;
    } catch {
        return null;
    }
}

/**
 * Fetch the real total transaction count from the mainnet.
 * Strategy: get the latest block number, batch-fetch block headers
 * (up to MAX_BLOCKS most recent), sum transaction counts, then
 * extrapolate for blocks beyond the window using the average tx-per-block.
 */
export async function getTotalTransactions(network: NetworkKey = "mainnet"): Promise<string> {
    const rpcUrl = NETWORK[network].rpcUrl;
    const MAX_BLOCKS = 200; // keep request count reasonable

    try {
        // 1. Get latest block number
        const bnResp = await fetch(rpcUrl, {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
        });
        const bnData = await bnResp.json();
        if (!bnData.result) return "N/A";
        const latestBlock = parseInt(bnData.result, 16);

        // 2. Batch-fetch the last MAX_BLOCKS block headers
        const windowSize = Math.min(latestBlock + 1, MAX_BLOCKS);
        const startBlock = latestBlock - windowSize + 1;

        const batchReqs = Array.from({ length: windowSize }, (_, i) => ({
            jsonrpc: "2.0",
            method: "eth_getBlockByNumber",
            params: ["0x" + (startBlock + i).toString(16), false],
            id: startBlock + i,
        }));

        const batchResp = await fetch(rpcUrl, {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batchReqs),
        });
        const batchData: { result?: { transactions?: string[] } }[] = await batchResp.json();

        // 3. Sum tx counts in the fetched window
        let windowTxCount = 0;
        let validBlocks = 0;
        for (const item of batchData) {
            const txs = item?.result?.transactions;
            if (Array.isArray(txs)) {
                windowTxCount += txs.length;
                validBlocks++;
            }
        }

        // 4. Extrapolate total across all blocks using average tx-per-block
        const avgTxPerBlock = validBlocks > 0 ? windowTxCount / validBlocks : 0;
        const estimatedTotal = Math.round(avgTxPerBlock * (latestBlock + 1));

        return estimatedTotal.toLocaleString();
    } catch {
        return "N/A";
    }
}
