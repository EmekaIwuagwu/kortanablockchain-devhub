const { ethers } = require('ethers');

async function test() {
    const RPC_URL = 'https://poseidon-rpc.kortana.worchsester.xyz/';
    console.log(`Connecting to ${RPC_URL}...`);

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        const network = await provider.getNetwork();
        console.log(`Connected to Network: ${network.name} (ChainID: ${network.chainId})`);

        const blockNumber = await provider.getBlockNumber();
        console.log(`Current Block Number: ${blockNumber}`);

        const gasPrice = await provider.getFeeData();
        console.log(`Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);

        // We will try to send a dummy signed transaction to see the RPC response
        // Using a random private key
        const wallet = ethers.Wallet.createRandom(provider);
        console.log(`Test Wallet Address: ${wallet.address}`);

        // VALID Counter Bytecode (Creation)
        const bytecode = "0x608060405234801561001057600080fd5b60dc8061001e6000396000f3fe6080604052348015600f57600080fd5b6004361060325760003560e01c806306661abd146037578063d09de08a146049575b600080fd5b604760005481565b60405190815260200160405180910390f35b60516053565b50565b60008054600101905556fea2646970667358221220a32e18e3595ed54a8360fba442b08a3d45ce0d62da32332997193b2184e666a364736f6c63430008130033";

        console.log("Attempting to estimate gas for deployment...");
        const estimate = await provider.estimateGas({
            data: bytecode
        });
        console.log(`Gas Estimate: ${estimate.toString()}`);

        console.log("\nAttempting to broadcast dummy deployment...");

        try {
            // We'll prepare the transaction manually
            const txRequest = {
                type: 0, // FORCE LEGACY
                data: bytecode,
                gasLimit: 3000000,
                gasPrice: ethers.parseUnits('20', 'gwei'),
                chainId: network.chainId,
                nonce: await provider.getTransactionCount(wallet.address)
            };

            console.log("Signing transaction...");
            const signedTx = await wallet.signTransaction(txRequest);
            const txHash = ethers.keccak256(signedTx);
            console.log("Calculated Tx Hash:", txHash);

            console.log("Broadcasting via eth_sendRawTransaction...");
            const rpcHash = await provider.send("eth_sendRawTransaction", [signedTx]);
            console.log("RPC Transaction ID:", rpcHash);

            console.log("Polling for Receipt...");
            let receipt = null;
            let attempts = 0;
            while (!receipt && attempts < 30) {
                receipt = await provider.getTransactionReceipt(rpcHash);
                if (!receipt) {
                    process.stdout.write(".");
                    await new Promise(r => setTimeout(r, 2000));
                    attempts++;
                }
            }

            if (!receipt) {
                console.log("\nTimeout waiting for confirm. Check explorer at block:", await provider.getBlockNumber());
                return;
            }

            console.log("\n\n--- KORTANA NODE RESPONSE ---");
            console.log("Confirming Block:", receipt.blockNumber);
            console.log("Status:", receipt.status === 1 ? "SUCCESS" : "REVERTED");
            console.log("CONTRACT ADDRESS:", receipt.contractAddress || "N/A (Reverted)");
            console.log("Gas Used:", receipt.gasUsed.toString());
            console.log("-----------------------------\n");

        } catch (e) {
            console.log("\n--- RPC ERROR RESPONSE ---");
            console.log("Message:", e.message);
            if (e.info && e.info.error) {
                console.log("Detailed Info:", JSON.stringify(e.info.error));
            }
            console.log("---------------------------\n");
        }

    } catch (error) {
        console.error("Critical Connection Error:", error);
    }
}

test();
