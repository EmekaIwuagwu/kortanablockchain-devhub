const { ethers } = require('ethers');
const solc = require('solc');
const fs = require('fs');
const path = require('path');

async function deployKortanaToken(privateKey, initialSupply = "1000000") {
    console.log("\n🚀 DEPLOYING KORTANA TOKEN\n");

    const RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/";
    const CHAIN_ID = 72511;

    // Read the contract source
    const contractPath = path.join(__dirname, 'KortanaToken.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    // Compile the contract
    console.log("📝 Compiling KortanaToken.sol...");

    const input = {
        language: 'Solidity',
        sources: {
            'KortanaToken.sol': { content: source }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error("❌ Compilation errors:");
            errors.forEach(err => console.error(err.formattedMessage));
            return;
        }
    }

    const contract = output.contracts['KortanaToken.sol']['KortanaToken'];
    const bytecode = '0x' + contract.evm.bytecode.object;
    const abi = contract.abi;

    console.log(`✅ Compiled successfully`);
    console.log(`   Bytecode size: ${bytecode.length / 2 - 1} bytes\n`);

    // Connect to network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`📍 Deployer: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} DNR`);

    if (balance === 0n) {
        console.log("\n❌ No balance! Run: node fund-account.js <PRIVATE_KEY>");
        return;
    }

    const nonce = await provider.getTransactionCount(wallet.address);
    console.log(`🔢 Nonce: ${nonce}`);

    // Calculate expected contract address
    const expectedAddress = ethers.getCreateAddress({
        from: wallet.address,
        nonce: nonce
    });
    console.log(`📝 Expected Contract Address: ${expectedAddress}\n`);

    // Encode constructor arguments (initialSupply)
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    const deployTx = await contractFactory.getDeployTransaction(initialSupply);

    console.log(`🎯 Deploying with initial supply: ${initialSupply} KTT`);
    console.log(`   (${ethers.parseUnits(initialSupply, 18)} tokens total)\n`);

    // Build deployment transaction
    const tx = {
        to: null,
        value: 0,
        data: deployTx.data,
        gasLimit: 500000,
        gasPrice: ethers.parseUnits("1", "gwei"),
        nonce: nonce,
        chainId: CHAIN_ID,
        type: 0
    };

    console.log("🔐 Signing and broadcasting transaction...");
    const signedTx = await wallet.signTransaction(tx);
    const txHash = await provider.send("eth_sendRawTransaction", [signedTx]);

    console.log(`✅ Transaction broadcasted!`);
    console.log(`   Hash: ${txHash}\n`);

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
        console.log("⏱️  Timeout! Check manually:");
        console.log(`   TX Hash: ${txHash}`);
        console.log(`   Expected Address: ${expectedAddress}`);
        return;
    }

    console.log("🎊 DEPLOYMENT RESULT:\n");
    console.log(`   Status: ${receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Contract Address: ${receipt.contractAddress || 'null'}`);
    console.log(`   Gas Used: ${receipt.gasUsed}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Transaction Hash: ${txHash}\n`);

    if (receipt.status === 0) {
        console.log("❌ Transaction reverted!");
        return;
    }

    if (!receipt.contractAddress) {
        console.log("❌ NO CONTRACT ADDRESS!");
        console.log("\n⚠️  The node might be running old code without the deployment fix.");
        console.log("   Please ensure the server has pulled and rebuilt the latest code.\n");
        return;
    }

    const contractAddress = receipt.contractAddress;

    console.log("=".repeat(60));
    console.log("🎉 KORTANA TOKEN DEPLOYED SUCCESSFULLY! 🎉");
    console.log("=".repeat(60));
    console.log(`
📜 Contract Details:
   Name: Kortana Test Token
   Symbol: KTT
   Decimals: 18
   Initial Supply: ${initialSupply} KTT
   Total Supply: ${ethers.parseUnits(initialSupply, 18)} (wei)
   
🌐 Network:
   Network: Kortana Poseidon Testnet
   Chain ID: ${CHAIN_ID}
   
📍 Addresses:
   Contract: ${contractAddress}
   Owner: ${wallet.address}
   
🔗 Transaction:
   Hash: ${txHash}
   Block: ${receipt.blockNumber}
   Gas Used: ${receipt.gasUsed}
`);

    // Verify contract code
    console.log("🔍 Verifying contract code...");
    const code = await provider.getCode(contractAddress);

    if (code === "0x") {
        console.log("⚠️  Warning: No code at address!");
    } else {
        console.log(`✅ Contract verified! Runtime code: ${code.length} bytes\n`);
    }

    // Save deployment info
    const deploymentInfo = {
        network: "Kortana Poseidon Testnet",
        chainId: CHAIN_ID,
        contractAddress: contractAddress,
        deployerAddress: wallet.address,
        transactionHash: txHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        initialSupply: initialSupply,
        deployedAt: new Date().toISOString(),
        abi: abi
    };

    const outputPath = path.join(__dirname, 'KortanaToken-deployment.json');
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${outputPath}\n`);

    console.log("✅ You can now interact with your token!");
    console.log(`   Contract: ${contractAddress}\n`);
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("\nUsage: node deploy-kortana-token.js <PRIVATE_KEY> [INITIAL_SUPPLY]\n");
    console.log("Example:");
    console.log("  node deploy-kortana-token.js 0xYOUR_KEY 1000000\n");
    console.log("Initial supply defaults to 1,000,000 tokens if not specified.\n");
    process.exit(1);
}

const privateKey = args[0];
const initialSupply = args[1] || "1000000";

deployKortanaToken(privateKey, initialSupply)
    .then(() => process.exit(0))
    .catch(error => {
        console.error("\n❌ Deployment failed:", error.message);
        console.error(error);
        process.exit(1);
    });
