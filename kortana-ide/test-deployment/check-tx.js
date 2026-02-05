const { ethers } = require('ethers');

async function checkTx() {
    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const txHash = "0xaba6359d18c6d38e48c9600678a33d47dd911bb4dec6925853d27081cd3d430c";

    console.log("Fetching transaction details...\n");

    const receipt = await provider.getTransactionReceipt(txHash);
    const tx = await provider.getTransaction(txHash);

    console.log("Transaction:", JSON.stringify(tx, null, 2));
    console.log("\nReceipt:", JSON.stringify(receipt, null, 2));
}

checkTx();
