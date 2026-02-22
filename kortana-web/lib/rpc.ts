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
        chainIdHex: "0x11AFF",
        rpcUrl: "https://poseidon-rpc.kortana.worchsester.xyz",
        explorerUrl: "https://explorer-testnet.kortana.worchsester.xyz",
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
