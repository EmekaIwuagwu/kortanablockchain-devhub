import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACTS_PATH = path.join(__dirname, '../../frontend/src/config/contracts.json');
const ABIS_PATH = path.join(__dirname, '../../frontend/src/config/abis.json');

const RPC_URL = process.env.RPC_URL || 'https://poseidon-rpc.kortana.worchsester.xyz/';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xef3c8edcf70855ba073cb9ef556b5cb8a0d20aea57a0bf2dceb3210b0c8c4792';

async function refreshApprovals() {
    try {
        console.log('🔄 Checking and refreshing token approvals...\n');

        // Load contract addresses and ABIs
        const contracts = JSON.parse(fs.readFileSync(CONTRACTS_PATH, 'utf-8'));
        const abis = JSON.parse(fs.readFileSync(ABIS_PATH, 'utf-8'));

        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        console.log(`Platform Address: ${wallet.address}`);
        console.log(`EscrowManager: ${contracts.escrowManager}\n`);

        // Check and approve each property token
        for (const property of contracts.properties) {
            console.log(`📋 Checking ${property.title} (${property.symbol})...`);

            const tokenContract = new ethers.Contract(
                property.address,
                abis.PropertyToken,
                wallet
            );

            // Check current allowance
            const currentAllowance = await tokenContract.allowance!(
                wallet.address,
                contracts.escrowManager
            );

            console.log(`   Current Allowance: ${ethers.formatEther(currentAllowance)} tokens`);

            // Check platform's balance
            const balance = await tokenContract.balanceOf!(wallet.address);
            console.log(`   Platform Balance: ${ethers.formatEther(balance)} tokens`);

            // If allowance is less than balance or less than 1000 tokens, refresh it
            const minAllowance = ethers.parseEther('1000');

            if (currentAllowance < minAllowance || currentAllowance < balance) {
                console.log(`   ⚠️  Allowance too low! Refreshing to maximum...`);

                const approveTx = await tokenContract.approve!(
                    contracts.escrowManager,
                    ethers.MaxUint256,
                    {
                        gasLimit: 100000,
                        type: 0 // Legacy transaction
                    }
                );

                console.log(`   📤 Approval TX sent: ${approveTx.hash}`);
                await approveTx.wait();
                console.log(`   ✅ Approval confirmed!\n`);
            } else {
                console.log(`   ✅ Allowance is sufficient\n`);
            }
        }

        console.log('✨ All approvals checked and refreshed successfully!');

    } catch (error) {
        console.error('❌ Error refreshing approvals:', error);
        process.exit(1);
    }
}

// Run if executed directly
refreshApprovals()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

export { refreshApprovals };
