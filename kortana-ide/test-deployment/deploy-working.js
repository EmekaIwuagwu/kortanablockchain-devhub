const { ethers } = require('ethers');

// Counter contract bytecode (Solidity 0.8.19 compiled)
const COUNTER_BYTECODE = "0x608060405234801561001057600080fd5b5060df8061001f6000396000f3fe6080604052348015600f57600080fd5b5060043610603c5760003560e01c806306661abd14604157806367e404ce146049578063d09de08a14606b575b600080fd5b600054604f565b60405190815260200160405180910390f35b604f7f000000000000000000000000000000000000000000000000000000000000000081565b6071603581565b005b6000805460010190555056fea26469706673582212206c6530f2a1c3d9e8e1c3e4b9c8f0e1c3d9e8e1c3e4b9c8f0e1c3d9e8e1c3e464736f6c63430008130033";

const COUNTER_ABI = [
    {
        "inputs": [],
        "name": "count",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "increment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

async function deployContract(privateKey) {
    console.log("\n=== KORTANA CONTRACT DEPLOYMENT ===\n");

    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const CHAIN_ID = 72511;

    try {
        // 1. Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(RPC_URL, {
            chainId: CHAIN_ID,
            name: "Kortana Testnet"
        });

        const wallet = new ethers.Wallet(privateKey, provider);
        console.log(`Deploying from: ${wallet.address}`);

        // 2. Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`Balance: ${ethers.formatEther(balance)} DNR`);

        if (balance === 0n) {
            throw new Error("Insufficient balance! Please fund your account with DNR from the faucet.");
        }

        // 3. Get current network state
        const blockNumber = await provider.getBlockNumber();
        const feeData = await provider.getFeeData();
        const nonce = await provider.getTransactionCount(wallet.address);

        console.log(`Current Block: ${blockNumber}`);
        console.log(`Network Gas Price: ${ethers.formatUnits(feeData.gasPrice || 1n, 'gwei')} Gwei`);
        console.log(`Account Nonce: ${nonce}\n`);

        // 4. Prepare deployment transaction (Legacy Type 0)
        const deploymentTx = {
            type: 0, // Legacy
            data: COUNTER_BYTECODE,
            gasLimit: 500000, // Conservative limit
            gasPrice: ethers.parseUnits("1", "gwei"), // 1 Gwei for testnet
            nonce: nonce,
            chainId: CHAIN_ID
        };

        console.log("🚀 Broadcasting deployment transaction...");

        // 5. Sign and send
        const signedTx = await wallet.signTransaction(deploymentTx);
        const txHash = await provider.send("eth_sendRawTransaction", [signedTx]);

        console.log(`📄 Transaction broadcasted!`);
        console.log(`   RPC Hash: ${txHash}\n`);

        // 6. Manual polling for receipt (handle hash mismatch)
        console.log("⏳ Waiting for confirmation...");
        let receipt = null;
        let attempts = 0;
        const maxAttempts = 60;

        while (!receipt && attempts < maxAttempts) {
            receipt = await provider.getTransactionReceipt(txHash);
            if (!receipt) {
                process.stdout.write(".");
                await new Promise(r => setTimeout(r, 2000));
                attempts++;
            }
        }

        console.log("\n");

        if (!receipt) {
            throw new Error(`Timeout waiting for transaction. Check explorer: ${txHash}`);
        }

        // 7. Verify deployment
        if (receipt.status === 0) {
            throw new Error(`Transaction reverted! Hash: ${txHash}`);
        }

        if (!receipt.contractAddress) {
            throw new Error(`No contract address in receipt!`);
        }

        console.log("✅ DEPLOYMENT SUCCESSFUL!\n");
        console.log(`Contract Address: ${receipt.contractAddress}`);
        console.log(`Transaction Hash: ${txHash}`);
        console.log(`Block Number: ${receipt.blockNumber}`);
        console.log(`Gas Used: ${receipt.gasUsed.toString()}\n`);

        return receipt.contractAddress;

    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error.message);
        throw error;
    }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("\nUsage: node deploy-working.js <PRIVATE_KEY>");
    console.log("\nExample:");
    console.log("  node deploy-working.js 0x1234567890abcdef...\n");
    console.log("Note: Make sure your account has DNR balance!");
    process.exit(1);
}

const privateKey = args[0];
deployContract(privateKey)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
