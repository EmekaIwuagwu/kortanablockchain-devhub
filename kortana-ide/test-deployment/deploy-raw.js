const { ethers } = require('ethers');

// Minimal valid Counter contract
const COUNTER_BYTECODE = "0x608060405234801561001057600080fd5b5060dc8061001f6000396000f3fe6080604052348015600f57600080fd5b5060043610603c5760003560e01c806306661abd146041578063d09de08a14605d575b600080fd5b6047606381565b6040516054919060a5565b60405180910390f35b606160698286565b005b60005481565b60008082607691906090565b905092915050565b6000819050919050565b608a81607d565b82525050565b600060208201905060a36000830184608156fea26469706673582212201234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd64736f6c63430008130033";

async function deployRaw(privateKey) {
    console.log("\n=== RAW TRANSACTION DEPLOYMENT ===\n");

    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const CHAIN_ID = 72511;

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Deployer: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} DNR`);

    if (balance === 0n) throw new Error("No balance!");

    const nonce = await provider.getTransactionCount(wallet.address);
    console.log(`Nonce: ${nonce}\n`);

    // Build unsigned transaction
    const tx = {
        to: null,
        value: 0,
        data: COUNTER_BYTECODE,
        gasLimit: 300000,
        gasPrice: ethers.parseUnits("20", "gwei"),
        nonce: nonce,
        chainId: CHAIN_ID,
        type: 0
    };

    console.log("🔐 Signing transaction...");
    const signedTx = await wallet.signTransaction(tx);

    console.log("📡 Broadcasting via eth_sendRawTransaction...");
    const rpcHash = await provider.send("eth_sendRawTransaction", [signedTx]);

    console.log(`✅ Broadcasted! Hash: ${rpcHash}\n`);

    // Manual polling
    console.log("⏳ Polling for receipt...");
    let receipt = null;
    let attempts = 0;

    while (!receipt && attempts < 60) {
        receipt = await provider.getTransactionReceipt(rpcHash);
        if (!receipt) {
            process.stdout.write(".");
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }
    }

    console.log("\n");

    if (!receipt) {
        throw new Error(`Timeout! Check explorer for: ${rpcHash}`);
    }

    if (receipt.status === 0) {
        console.error("❌ Transaction REVERTED");
        console.log("Receipt:", JSON.stringify(receipt, null, 2));
        throw new Error("Deployment reverted");
    }

    if (!receipt.contractAddress) {
        console.error("❌ No contract address!");
        console.log("Receipt:", JSON.stringify(receipt, null, 2));
        throw new Error("No contract address");
    }

    console.log("✅ DEPLOYMENT SUCCESSFUL!\n");
    console.log(`Contract Address: ${receipt.contractAddress}`);
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}\n`);

    return receipt.contractAddress;
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: node deploy-raw.js <PRIVATE_KEY>");
    process.exit(1);
}

deployRaw(args[0])
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e.message);
        process.exit(1);
    });
