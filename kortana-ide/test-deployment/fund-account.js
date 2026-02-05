const { ethers } = require('ethers');

async function fundAccount() {
    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const privateKey = process.argv[2];
    if (!privateKey) {
        console.log("Usage: node fund-account.js <PRIVATE_KEY>");
        process.exit(1);
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const address = wallet.address;

    console.log("\n💰 Requesting DNR from faucet...\n");
    console.log(`Address: ${address}`);

    try {
        // Try to use eth_requestDNR RPC method
        const result = await provider.send("eth_requestDNR", [address, "5000000"]);

        console.log(`✅ Faucet request successful!`);
        console.log(`   Result: ${result}`);

        // Wait a bit for the transaction to be mined
        await new Promise(r => setTimeout(r, 3000));

        // Check new balance
        const balance = await provider.getBalance(address);
        console.log(`\n💎 New Balance: ${ethers.formatEther(balance)} DNR\n`);

        if (balance > 0n) {
            console.log("✅ Account funded successfully!\n");
        } else {
            console.log("⚠️  Balance still 0 - faucet may need manual processing\n");
        }

    } catch (error) {
        console.error("❌ Faucet request failed:", error.message);
        console.log("\n💡 Alternative: Contact the network admin to fund this address manually.");
    }
}

fundAccount().catch(console.error);
