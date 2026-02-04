const { ethers } = require('ethers');

console.log("\n🚀 KORTANA CONTRACT DEPLOYMENT TEST\n");
console.log("This will deploy a simple contract to verify the fix works.\n");

const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
const CHAIN_ID = 72511;

// Minimal valid contract that just stores a uint256
// Constructor code that returns runtime code
const MINIMAL_CONTRACT = "0x6080604052348015600e575f80fd5b50603e80601a5f395ff3fe60806040525f80fdfea2646970667358221220" + "0".repeat(64) + "64736f6c63430008130033";

async function testDeployment(privateKey) {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);

        console.log(`📍 Deployer: ${wallet.address}`);

        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} DNR`);

        if (balance === 0n) {
            console.log("\n❌ No balance! Fund your account first.");
            return false;
        }

        const nonce = await provider.getTransactionCount(wallet.address);
        console.log(`🔢 Nonce: ${nonce}`);

        // Calculate expected contract address
        const expectedAddress = ethers.getCreateAddress({
            from: wallet.address,
            nonce: nonce
        });
        console.log(`📝 Expected Contract Address: ${expectedAddress}\n`);

        // Build deployment transaction
        const tx = {
            to: null, // Deployment
            value: 0,
            data: MINIMAL_CONTRACT,
            gasLimit: 100000,
            gasPrice: ethers.parseUnits("1", "gwei"),
            nonce: nonce,
            chainId: CHAIN_ID,
            type: 0
        };

        console.log("🔐 Signing and broadcasting...");
        const signedTx = await wallet.signTransaction(tx);
        const txHash = await provider.send("eth_sendRawTransaction", [signedTx]);

        console.log(`✅ Broadcasted! Hash: ${txHash}\n`);
        console.log("⏳ Waiting for confirmation (max 2 minutes)...");

        // Manual polling
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
            console.log("⏱️  Timeout - check manually:");
            console.log(`   TX: ${txHash}`);
            return false;
        }

        console.log("📊 DEPLOYMENT RESULT:\n");
        console.log(`   Status: ${receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`   Gas Used: ${receipt.gasUsed}`);
        console.log(`   Contract Address: ${receipt.contractAddress || 'null'}`);
        console.log(`   Block: ${receipt.blockNumber}\n`);

        if (receipt.status === 0) {
            console.log("❌ Transaction reverted!");
            return false;
        }

        if (!receipt.contractAddress) {
            console.log("❌ NO CONTRACT ADDRESS RETURNED!");
            console.log("\n⚠️  This means the node is running the OLD code.");
            console.log("    Please restart the Poseidon node:");
            console.log("    1. Stop the current node");
            console.log("    2. cd kortana-blockchain-rust");
            console.log("    3. .\\target\\release\\kortana-blockchain-rust.exe\n");
            return false;
        }

        console.log("🎉 CONTRACT DEPLOYMENT SUCCESSFUL!\n");
        console.log(`✅ Contract Address: ${receipt.contractAddress}`);

        // Verify contract exists
        console.log("\n🔍 Verifying contract code...");
        const code = await provider.getCode(receipt.contractAddress);

        if (code === "0x") {
            console.log("⚠️  Warning: No code found at address!");
        } else {
            console.log(`✅ Code verified! (${code.length} bytes)`);
            console.log(`   Code: ${code.substring(0, 66)}...`);
        }

        console.log("\n" + "=".repeat(60));
        console.log("CONTRACT DEPLOYMENT TEST: PASSED ✅");
        console.log("=".repeat(60) + "\n");

        return true;

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
        return false;
    }
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: node test-contract-deployment.js <PRIVATE_KEY>\n");
    console.log("Example:");
    console.log("  node test-contract-deployment.js 0xYOUR_PRIVATE_KEY\n");
    process.exit(1);
}

testDeployment(args[0])
    .then(success => process.exit(success ? 0 : 1))
    .catch(e => {
        console.error("Fatal error:", e);
        process.exit(1);
    });
