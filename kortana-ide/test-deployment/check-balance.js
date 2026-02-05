const { ethers } = require('ethers');

async function checkBalance() {
    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const privateKey = process.argv[2];
    if (!privateKey) {
        console.log("Usage: node check-balance.js <PRIVATE_KEY>");
        process.exit(1);
    }

    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("\n=== KORTANA ACCOUNT INFO ===\n");
    console.log(`Address: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} DNR`);

    const nonce = await provider.getTransactionCount(wallet.address);
    console.log(`Nonce: ${nonce}`);

    const blockNumber = await provider.getBlockNumber();
    console.log(`Current Block: ${blockNumber}`);

    const gasPrice = await provider.getFeeData();
    console.log(`Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} Gwei`);

    console.log("\n" + "=".repeat(40) + "\n");

    if (balance > 0n) {
        console.log("✅ Account is funded and ready to deploy!");
    } else {
        console.log("❌ No balance - please fund this account first");
    }
}

checkBalance().catch(console.error);
