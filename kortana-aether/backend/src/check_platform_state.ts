import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const abis = JSON.parse(fs.readFileSync('../frontend/src/config/abis.json', 'utf8'));
const contracts = JSON.parse(fs.readFileSync('../frontend/src/config/contracts.json', 'utf8'));

async function check() {
    const provider = new ethers.JsonRpcProvider('https://poseidon-rpc.kortana.worchsester.xyz/');
    const platform = contracts.platformAddress;
    const escrow = contracts.escrowManager;

    console.log(`Checking Platform: ${platform}`);
    console.log(`Escrow Contract: ${escrow}`);

    for (const prop of contracts.properties) {
        const token = new ethers.Contract(prop.address, [
            "function balanceOf(address) view returns (uint256)",
            "function allowance(address, address) view returns (uint256)",
            "function symbol() view returns (string)"
        ], provider);

        try {
            const sym = await token.symbol();
            const bal = await token.balanceOf(platform);
            const allow = await token.allowance(platform, escrow);
            console.log(`Token: ${sym} (${prop.address})`);
            console.log(`- Balance: ${ethers.formatUnits(bal, 18)}`);
            console.log(`- Allowance: ${ethers.formatUnits(allow, 18)}`);
        } catch (e: any) {
            console.log(`Error checking token ${prop.address}: ${e.message}`);
        }
    }
}

check();
