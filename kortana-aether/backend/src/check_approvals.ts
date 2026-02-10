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

async function checkApprovals() {
    console.log('🔍 Checking Smart Contract Approvals\n');
    console.log('='.repeat(60));

    const contracts = JSON.parse(fs.readFileSync(CONTRACTS_PATH, 'utf-8'));
    const abis = JSON.parse(fs.readFileSync(ABIS_PATH, 'utf-8'));

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const platformWallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);

    console.log(`\nPlatform Address: ${platformWallet.address}`);
    console.log(`EscrowManager: ${contracts.escrowManager}\n`);

    for (const property of contracts.properties) {
        console.log(`\n📋 ${property.title} (${property.symbol})`);
        console.log(`   Address: ${property.address}`);

        const tokenContract = new ethers.Contract(
            property.address,
            abis.PropertyToken,
            platformWallet
        );

        try {
            const balance = await tokenContract.balanceOf(platformWallet.address);
            console.log(`   Platform Balance: ${ethers.formatEther(balance)} tokens`);

            const allowance = await tokenContract.allowance(
                platformWallet.address,
                contracts.escrowManager
            );

            const isUnlimited = allowance === ethers.MaxUint256;
            console.log(`   Allowance: ${isUnlimited ? 'UNLIMITED ✅' : ethers.formatEther(allowance) + ' tokens ⚠️'}`);

            if (!isUnlimited && allowance < ethers.parseEther('1000')) {
                console.log(`   ⚠️  WARNING: Low allowance! Transactions may fail.`);
            }
        } catch (error) {
            console.log(`   ❌ Error checking: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Check Complete!\n');
}

checkApprovals()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
