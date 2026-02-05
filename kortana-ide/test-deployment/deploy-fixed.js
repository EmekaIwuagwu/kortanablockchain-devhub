const { ethers } = require('ethers');

// Simple Counter contract - properly formatted bytecode
const COUNTER_BYTECODE = "0x608060405234801561001057600080fd5b5060ec8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306661abd146037578063d09de08a146051575b600080fd5b603d6059565b604051604891906073565b60405180910390f35b6057605f565b005b60005481565b6000808154809291906070906088565b9190505550565b6000819050919050565b608d816076565b82525050565b600060208201905060a660008301846084565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600060da826076565b915060e3836076565b925082820190508082111560fa5760f960ac565b5b9291505056fea2646970667358221220abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab64736f6c63430008130033";

const COUNTER_ABI = [
    { "inputs": [], "name": "count", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

async function deployWithProperSigning(privateKey) {
    console.log("\n=== KORTANA CONTRACT DEPLOYMENT (FIXED) ===\n");

    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const CHAIN_ID = 72511;

    try {
        // Setup
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);

        console.log(`Deployer: ${wallet.address}`);

        const balance = await provider.getBalance(wallet.address);
        console.log(`Balance: ${ethers.formatEther(balance)} DNR`);

        if (balance === 0n) {
            throw new Error("Insufficient balance!");
        }

        // Get network state
        const nonce = await provider.getTransactionCount(wallet.address);
        const gasPrice = await provider.getFeeData();

        console.log(`Nonce: ${nonce}`);
        console.log(`Network Gas Price: ${ethers.formatUnits(gasPrice.gasPrice || 1n, 'gwei')} Gwei\n`);

        // Build transaction - simpler approach
        const tx = {
            to: null, // deployment
            data: COUNTER_BYTECODE,
            gasLimit: 300000,
            gasPrice: ethers.parseUnits("1", "gwei"),
            nonce: nonce,
            chainId: CHAIN_ID,
            type: 0 // Legacy
        };

        console.log("🚀 Signing and broadcasting...");

        // Send using wallet (handles signing automatically)
        const txResponse = await wallet.sendTransaction(tx);

        console.log(`✅ Broadcasted!`);
        console.log(`   Hash: ${txResponse.hash}\n`);

        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        const receipt = await txResponse.wait();

        console.log("\n✅ DEPLOYMENT SUCCESSFUL!\n");
        console.log(`Contract Address: ${receipt.contractAddress}`);
        console.log(`Transaction Hash: ${receipt.hash}`);
        console.log(`Block: ${receipt.blockNumber}`);
        console.log(`Gas Used: ${receipt.gasUsed.toString()}\n`);

        return receipt.contractAddress;

    } catch (error) {
        console.error("\n❌ FAILED:", error.message);
        throw error;
    }
}

// Execute
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("\nUsage: node deploy-fixed.js <PRIVATE_KEY>\n");
    process.exit(1);
}

deployWithProperSigning(args[0])
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
