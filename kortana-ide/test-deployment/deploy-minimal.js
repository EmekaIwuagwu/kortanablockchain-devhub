const { ethers } = require('ethers');

// Super minimal contract that just exists (returns empty)
// This is the simplest possible valid contract
const MINIMAL_BYTECODE = "0x6080604052348015600f57600080fd5b50603e80601d6000396000f3fe6080604052600080fdfea264697066735822122000000000000000000000000000000000000000000000000000000000000000064736f6c63430008130033";

async function deployMinimal(privateKey) {
    console.log("\n=== DEPLOYING MINIMAL CONTRACT ===\n");

    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const CHAIN_ID = 72511;

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Deployer: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} DNR`);

    const nonce = await provider.getTransactionCount(wallet.address);
    console.log(`Nonce: ${nonce}`);

    // Get gas price from network
    const feeData = await provider.getFeeData();
    const networkGasPrice = feeData.gasPrice;

    console.log(`Network Gas Price: ${ethers.formatUnits(networkGasPrice, 'gwei')} Gwei`);

    // Use network gas price (it's extremely low on Poseidon)
    const tx = {
        to: null,
        value: 0,
        data: MINIMAL_BYTECODE,
        gasLimit: 100000, // Minimal gas
        gasPrice: networkGasPrice, // Use network's actual gas price
        nonce: nonce,
        chainId: CHAIN_ID,
        type: 0
    };

    console.log(`\nUsing Gas Price: ${ethers.formatUnits(tx.gasPrice, 'gwei')} Gwei`);
    console.log(`Gas Limit: ${tx.gasLimit}\n`);

    console.log("🔐 Signing...");
    const signedTx = await wallet.signTransaction(tx);

    console.log("📡 Broadcasting...");
    const rpcHash = await provider.send("eth_sendRawTransaction", [signedTx]);

    console.log(`✅ Broadcasted! Hash: ${rpcHash}\n`);

    console.log("⏳ Waiting for confirmation...");
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
        throw new Error(`Timeout! Hash: ${rpcHash}`);
    }

    console.log("Receipt Status:", receipt.status);
    console.log("Contract Address:", receipt.contractAddress);
    console.log("Gas Used:", receipt.gasUsed.toString());

    if (receipt.status === 0) {
        throw new Error("Transaction reverted!");
    }

    if (!receipt.contractAddress) {
        throw new Error("No contract address in receipt!");
    }

    console.log("\n✅ SUCCESS!\n");
    console.log(`Deployed at: ${receipt.contractAddress}`);
    console.log(`Block: ${receipt.blockNumber}\n`);

    return receipt.contractAddress;
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: node deploy-minimal.js <PRIVATE_KEY>");
    process.exit(1);
}

deployMinimal(args[0])
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("\n❌ ERROR:", e.message);
        process.exit(1);
    });
