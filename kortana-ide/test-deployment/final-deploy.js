const { ethers } = require('ethers');

async function testDeploy(privateKey) {
    console.log("\n=== TESTING DEPLOYMENT TO KORTANA ===\n");

    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const CHAIN_ID = 72511;

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Address: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} DNR`);

    if (balance === 0n) {
        throw new Error("No balance!");
    }

    const nonce = await provider.getTransactionCount(wallet.address);
    const feeData = await provider.getFeeData();

    console.log(`Nonce: ${nonce}`);
    console.log(`Network Gas Price: ${feeData.gasPrice}\n`);

    // Use a properly validated bytecode - empty contract runtime
    const bytecode = "0x6080604052348015600e575f80fd5b50603e80601a5f395ff3fe60806040525f80fdfea2646970667358221220" + "0".repeat(64) + "64736f6c63430008130033";

    console.log(`Bytecode length: ${bytecode.length}`);
    console.log(`Bytecode (first 50): ${bytecode.substring(0, 50)}...\n`);

    // Build deployment transaction
    const tx = {
        to: null, // deployment
        value: 0,
        data: bytecode,
        gasLimit: 100000,
        gasPrice: 1000000000, // 1 Gwei
        nonce: nonce,
        chainId: CHAIN_ID,
        type: 0
    };

    console.log("📝 Transaction details:");
    console.log(`   Gas Limit: ${tx.gasLimit}`);
    console.log(`   Gas Price: ${ethers.formatUnits(tx.gasPrice, 'gwei')} Gwei`);
    console.log(`   Nonce: ${tx.nonce}`);
    console.log(`   Chain ID: ${tx.chainId}\n`);

    console.log("🔐 Signing transaction...");
    const signedTx = await wallet.signTransaction(tx);

    console.log(`✅ Signed! Length: ${signedTx.length}\n`);

    console.log("📡 Broadcasting...");
    const txHash = await provider.send("eth_sendRawTransaction", [signedTx]);

    console.log(`✅ Broadcasted!`);
    console.log(`   Hash: ${txHash}\n`);

    console.log("⏳ Waiting...");
    let receipt = null;
    let attempts = 0;

    while (!receipt && attempts < 60) {
        receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            process.stdout.write(".");
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }
    }

    console.log("\n");

    if (!receipt) {
        console.log("Timeout - check manually");
        return;
    }

    console.log(`Status: ${receipt.status}`);
    console.log(`Contract: ${receipt.contractAddress}`);
    console.log(`Gas Used: ${receipt.gasUsed}\n`);

    if (receipt.status === 1 && receipt.contractAddress) {
        console.log("✅ SUCCESS!\n");
        console.log(`🎉 CONTRACT ADDRESS: ${receipt.contractAddress}\n`);
    } else {
        console.log("❌ FAILED - Transaction reverted\n");
    }
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: node final-deploy.js <PRIVATE_KEY>");
    process.exit(1);
}

testDeploy(args[0])
    .then(() => process.exit(0))
    .catch(e => {
        console.error("\n❌ ERROR:", e.message);
        process.exit(1);
    });
