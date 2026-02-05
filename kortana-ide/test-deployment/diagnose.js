const { ethers } = require('ethers');

async function diagnose() {
    console.log("=== KORTANA POSEIDON RPC DIAGNOSTICS ===\n");

    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        // 1. Check RPC connectivity
        console.log("1. Testing RPC connectivity...");
        const network = await provider.getNetwork();
        console.log(`   ✓ Connected to Chain ID: ${network.chainId}`);

        // 2. Get current block
        const blockNumber = await provider.getBlockNumber();
        console.log(`   ✓ Current Block: ${blockNumber}`);

        // 3. Get gas price
        const feeData = await provider.getFeeData();
        console.log(`   ✓ Gas Price: ${ethers.formatUnits(feeData.gasPrice || 0, 'gwei')} Gwei`);

        // 4. Check if we can create a test wallet
        console.log("\n2. Creating test wallet...");
        const testWallet = ethers.Wallet.createRandom(provider);
        console.log(`   ✓ Test Address: ${testWallet.address}`);

        // 5. Check balance
        const balance = await provider.getBalance(testWallet.address);
        console.log(`   Balance: ${ethers.formatEther(balance)} DNR`);

        if (balance === 0n) {
            console.log("\n⚠️  WARNING: Test wallet has 0 balance!");
            console.log("   To deploy contracts, you need DNR in your account.");
            console.log("   Please provide a private key with funds for deployment testing.\n");
        }

        // 6. Simple bytecode test (minimal contract)
        console.log("\n3. Testing bytecode deployment estimation...");
        const minimalBytecode = "0x6080604052348015600f57600080fd5b50603e80601d6000396000f3fe6080604052600080fdfea264697066735822122000000000000000000000000000000000000000000000000000000000000000064736f6c63430008130033";

        try {
            const gasEstimate = await provider.estimateGas({
                data: minimalBytecode
            });
            console.log(`   ✓ Gas Estimate: ${gasEstimate}`);
        } catch (e) {
            console.log(`   ✗ Gas Estimation Failed: ${e.message}`);
        }

        console.log("\n=== DIAGNOSTICS COMPLETE ===");
        console.log("\nRECOMMENDATIONS:");
        console.log("1. Use a wallet with sufficient DNR balance");
        console.log("2. Set gas price to 1 Gwei (testnet standard)");
        console.log("3. Use Legacy (Type 0) transactions");
        console.log("4. Poll using the RPC-returned hash, not the calculated hash\n");

    } catch (error) {
        console.error("\n✗ DIAGNOSTIC FAILED:");
        console.error(error.message);
    }
}

diagnose();
