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

async function verifyFix() {
    console.log('\n🎯 FINAL VERIFICATION: Smart Contract Fix Status\n');
    console.log('='.repeat(70));

    const contracts = JSON.parse(fs.readFileSync(CONTRACTS_PATH, 'utf-8'));
    const abis = JSON.parse(fs.readFileSync(ABIS_PATH, 'utf-8'));

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const platformWallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);

    console.log(`\n📍 Deployment Information:`);
    console.log(`   Network: ${contracts.network}`);
    console.log(`   Platform: ${platformWallet.address}`);
    console.log(`   EscrowManager: ${contracts.escrowManager}`);
    console.log(`   PropertyRegistry: ${contracts.propertyRegistry}`);

    let allFixed = true;

    console.log(`\n📊 Token Approval Status:\n`);

    for (const property of contracts.properties) {
        const tokenContract = new ethers.Contract(
            property.address,
            abis.PropertyToken,
            platformWallet
        );

        try {
            const balance = await tokenContract.balanceOf(platformWallet.address);
            const allowance = await tokenContract.allowance(
                platformWallet.address,
                contracts.escrowManager
            );

            const isUnlimited = allowance.toString() === ethers.MaxUint256.toString();

            console.log(`   ${property.symbol} - ${property.title}`);
            console.log(`   ├─ Address: ${property.address}`);
            console.log(`   ├─ Platform Balance: ${ethers.formatEther(balance)} tokens`);
            console.log(`   ├─ Allowance: ${isUnlimited ? '∞ UNLIMITED' : ethers.formatEther(allowance) + ' tokens'}`);
            console.log(`   └─ Status: ${isUnlimited ? '✅ FIXED - Ready for transactions!' : '❌ NOT FIXED - Needs approval'}\n`);

            if (!isUnlimited) {
                allFixed = false;
            }
        } catch (error) {
            console.log(`   ❌ Error checking ${property.symbol}: ${error.message}\n`);
            allFixed = false;
        }
    }

    console.log('='.repeat(70));

    if (allFixed) {
        console.log('\n✨ SUCCESS! All contracts are properly configured!\n');
        console.log('🎉 Golden Visa and Fractional Yield transactions will now work!\n');
        console.log('📝 Next Steps:');
        console.log('   1. Open the frontend at http://localhost:3000');
        console.log('   2. Connect your wallet (MetaMask)');
        console.log('   3. Navigate to Marketplace');
        console.log('   4. Try investing in a property');
        console.log('   5. Transaction should complete successfully!\n');
    } else {
        console.log('\n⚠️  WARNING: Some contracts still need approval!\n');
        console.log('Run: npx tsx src/refresh_approvals.ts\n');
    }
}

verifyFix()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
