const { ethers } = require('ethers');

// Try the absolute minimum - just STOP opcode (0x00)
// Or minimal valid contract creation code
const BYTECODES = {
    // Empty initialization that returns empty runtime
    minimal: "0x6000600055",  //"600060005260206000f3", // PUSH1 0 PUSH1 0 MSTORE PUSH1 32 PUSH1 0 RETURN
    // Just return empty
    empty: "0x600160005260206000f3" // Return 32 bytes of zeros
};

async function tryDeploy(privateKey, bytecodeKey) {
    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const CHAIN_ID = 72511;

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    const nonce = await provider.getTransactionCount(wallet.address);

    console.log(`\nTrying: ${bytecodeKey}`);
    console.log(`Bytecode: ${BYTECODES[bytecodeKey]}`);

    const tx = {
        to: null,
        value: 0,
        data: BYTECODES[bytecodeKey],
        gasLimit: 50000,
        gasPrice: 1000000000,
        nonce: nonce,
        chainId: CHAIN_ID,
        type: 0
    };

    const signedTx = await wallet.signTransaction(tx);
    const txHash = await provider.send("eth_sendRawTransaction", [signedTx]);

    console.log(`Hash: ${txHash}`);
    console.log("Waiting...");

    let receipt = null;
    let attempts = 0;

    while (!receipt && attempts < 30) {
        receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }
    }

    if (!receipt) {
        console.log("Timeout\n");
        return false;
    }

    console.log(`Status: ${receipt.status}`);
    console.log(`Contract: ${receipt.contractAddress}`);
    console.log(`Gas: ${receipt.gasUsed}\n`);

    if (receipt.status === 1 && receipt.contractAddress) {
        console.log(`✅ SUCCESS with ${bytecodeKey}!`);
        console.log(`Contract: ${receipt.contractAddress}\n`);
        return true;
    }

    return false;
}

async function tryAll(privateKey) {
    console.log("\n=== TESTING DIFFERENT BYTECODES ===");
    console.log(`Address: ${new ethers.Wallet(privateKey).address}\n`);

    for (const key of Object.keys(BYTECODES)) {
        const success = await tryDeploy(privateKey, key);
        if (success) break;
    }
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: node try-bytecodes.js <PRIVATE_KEY>");
    process.exit(1);
}

tryAll(args[0])
    .then(() => process.exit(0))
    .catch(e => {
        console.error("ERROR:", e.message);
        process.exit(1);
    });
