export async function getBlockHeight() {
    try {
        const response = await fetch('https://poseidon-rpc.kortana.name.ng/', {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1,
            }),
        });
        const data = await response.json();
        if (data.result) {
            return parseInt(data.result, 16).toLocaleString();
        }
        return "N/A";
    } catch (error) {
        console.error("Error fetching block height:", error);
        return "N/A";
    }
}
