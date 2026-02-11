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

async function diagnoseBalances() {
    console.log('🔍 DIAGNOSING LEDGER BALANCES...\n');

    const contracts = JSON.parse(fs.readFileSync(CONTRACTS_PATH, 'utf-8'));
    const abis = JSON.parse(fs.readFileSync(ABIS_PATH, 'utf-8'));
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const platform = contracts.platformAddress;
    console.log(`Target Platform/Seller: ${platform}\n`);

    for (const prop of contracts.properties) {
        const contract = new ethers.Contract(prop.address, abis.PropertyToken, provider);
        try {
            const balance = await contract.balanceOf(platform);
            const allowance = await contract.allowance(platform, contracts.escrowManager);
            const name = await contract.name();
            const symbol = await contract.symbol();

            console.log(`🏠 Property: ${name} (${symbol})`);
            console.log(`   - Address: ${prop.address}`);
            console.log(`   - Platform Balance: ${ethers.formatEther(balance)} tokens`);
            console.log(`   - Escrow Allowance: ${allowance.toString() === ethers.MaxUint256.toString() ? 'UNLIMITED' : ethers.formatEther(allowance)}`);

            if (balance === BigInt(0)) {
                console.log(`   ❌ ERROR: Platform has 0 tokens. Transactions WILL fail.`);
            } else if (allowance === BigInt(0)) {
                console.log(`   ❌ ERROR: No allowance. Transactions WILL fail.`);
            } else {
                console.log(`   ✅ READY: Correct balance and allowance.`);
            }
            console.log('');
        } catch (e) {
            console.log(`   ⚠️ Error checking ${prop.symbol}: ${e.message}\n`);
        }
    }
}

diagnoseBalances();
