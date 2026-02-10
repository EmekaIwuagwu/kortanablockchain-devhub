// @ts-nocheck
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACTS_PATH = path.join(__dirname, '../../frontend/src/config/contracts.json');
const ABIS_PATH = path.join(__dirname, '../../frontend/src/config/abis.json');

const RPC_URL = 'https://poseidon-rpc.kortana.worchsester.xyz/';
const PLATFORM_PRIVATE_KEY = '0xef3c8edcf70855ba073cb9ef556b5cb8a0d20aea57a0bf2dceb3210b0c8c4792';
// Test buyer wallet (different from platform)
const BUYER_PRIVATE_KEY = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

async function testTransaction() {
    try {
        console.log('🧪 Testing Property Investment Transaction\n');
        console.log('='.repeat(60));

        // Load contract addresses and ABIs
        const contracts = JSON.parse(fs.readFileSync(CONTRACTS_PATH, 'utf-8'));
        const abis = JSON.parse(fs.readFileSync(ABIS_PATH, 'utf-8'));

        // Setup provider and wallets
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const platformWallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);
        const buyerWallet = new ethers.Wallet(BUYER_PRIVATE_KEY, provider);

        console.log(`\n📋 Test Configuration:`);
        console.log(`   Platform Address: ${platformWallet.address}`);
        console.log(`   Buyer Address: ${buyerWallet.address}`);
        console.log(`   EscrowManager: ${contracts.escrowManager}`);

        // Select first property for testing
        const property = contracts.properties[0];
        console.log(`\n🏠 Testing Property: ${property.title} (${property.symbol})`);
        console.log(`   Token Address: ${property.address}`);

        // Create contract instances
        const tokenContract = new ethers.Contract(
            property.address,
            abis.PropertyToken,
            platformWallet
        );

        const escrowContract = new ethers.Contract(
            contracts.escrowManager,
            abis.EscrowManager,
            buyerWallet
        );

        // Step 1: Check platform's token balance
        console.log(`\n📊 Step 1: Checking Platform Token Balance...`);
        const platformBalance = await tokenContract.balanceOf(platformWallet.address);
        console.log(`   Platform has: ${ethers.formatEther(platformBalance)} ${property.symbol} tokens`);

        // Step 2: Check current allowance
        console.log(`\n🔐 Step 2: Checking EscrowManager Allowance...`);
        const currentAllowance = await tokenContract.allowance(
            platformWallet.address,
            contracts.escrowManager
        );
        console.log(`   Current Allowance: ${ethers.formatEther(currentAllowance)} tokens`);

        if (currentAllowance === BigInt(0)) {
            console.log(`   ⚠️  WARNING: Allowance is ZERO! This will cause the transaction to fail.`);
            console.log(`   💡 Approving EscrowManager now...`);

            const approveTx = await tokenContract.approve(
                contracts.escrowManager,
                ethers.MaxUint256,
                { gasLimit: 100000 }
            );
            console.log(`   📤 Approval TX: ${approveTx.hash}`);
            await approveTx.wait();
            console.log(`   ✅ Approval confirmed!`);
        } else {
            console.log(`   ✅ Allowance is sufficient (${currentAllowance === ethers.MaxUint256 ? 'UNLIMITED' : 'LIMITED'})`);
        }

        // Step 3: Check buyer's DNR balance
        console.log(`\n💰 Step 3: Checking Buyer's DNR Balance...`);
        const buyerBalance = await provider.getBalance(buyerWallet.address);
        console.log(`   Buyer has: ${ethers.formatEther(buyerBalance)} DNR`);

        if (buyerBalance < ethers.parseEther('1000')) {
            console.log(`   ⚠️  WARNING: Buyer has insufficient DNR for testing!`);
            console.log(`   💡 Please fund the buyer wallet: ${buyerWallet.address}`);
            return;
        }

        // Step 4: Initiate a test escrow transaction
        console.log(`\n🚀 Step 4: Initiating Test Investment Transaction...`);

        const tokenAmount = ethers.parseEther('10'); // Buy 10 tokens
        const dinarAmount = ethers.parseEther('100'); // Pay 100 DNR
        const totalWithFee = ethers.parseEther('101'); // 100 + 1% fee

        console.log(`   Investment Details:`);
        console.log(`   - Token Amount: ${ethers.formatEther(tokenAmount)} ${property.symbol}`);
        console.log(`   - DNR Amount: ${ethers.formatEther(dinarAmount)} DNR`);
        console.log(`   - Total with Fee: ${ethers.formatEther(totalWithFee)} DNR`);

        try {
            const tx = await escrowContract.initiateEscrow(
                platformWallet.address, // seller
                property.address, // property token
                tokenAmount,
                totalWithFee,
                {
                    value: totalWithFee,
                    gasLimit: 800000
                }
            );

            console.log(`\n   📤 Transaction Sent!`);
            console.log(`   TX Hash: ${tx.hash}`);
            console.log(`   ⏳ Waiting for confirmation...`);

            const receipt = await tx.wait();

            console.log(`\n   ✅ TRANSACTION SUCCESSFUL!`);
            console.log(`   Block Number: ${receipt?.blockNumber}`);
            console.log(`   Gas Used: ${receipt?.gasUsed.toString()}`);
            console.log(`   Status: ${receipt?.status === 1 ? 'SUCCESS ✅' : 'FAILED ❌'}`);

            // Get the escrow ID from events
            if (receipt?.logs && receipt.logs.length > 0) {
                console.log(`\n   📝 Transaction Events:`);
                receipt.logs.forEach((log, index) => {
                    try {
                        const parsed = escrowContract.interface.parseLog({
                            topics: log.topics as string[],
                            data: log.data
                        });
                        if (parsed) {
                            console.log(`   Event ${index + 1}: ${parsed.name}`);
                            console.log(`   Args:`, parsed.args);
                        }
                    } catch (e) {
                        // Not an escrow event
                    }
                });
            }

            console.log(`\n   🔗 View on Explorer:`);
            console.log(`   https://explorer-testnet.kortana.worchsester.xyz/tx/${tx.hash}`);

        } catch (txError: any) {
            console.log(`\n   ❌ TRANSACTION FAILED!`);
            console.log(`   Error: ${txError.message}`);

            if (txError.data) {
                console.log(`   Error Data: ${txError.data}`);
            }

            // Check if it's an allowance issue
            if (txError.message.includes('ERC20InsufficientAllowance') ||
                txError.message.includes('insufficient allowance')) {
                console.log(`\n   🔍 DIAGNOSIS: This is the ALLOWANCE ISSUE we fixed!`);
                console.log(`   The platform hasn't approved the EscrowManager to spend tokens.`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✨ Test Complete!\n');

    } catch (error: any) {
        console.error('\n❌ Test Error:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

// Run the test
testTransaction()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
