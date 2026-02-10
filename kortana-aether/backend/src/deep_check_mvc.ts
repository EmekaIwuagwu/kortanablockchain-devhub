import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function check() {
    const provider = new ethers.JsonRpcProvider('https://poseidon-rpc.kortana.worchsester.xyz/');
    const tokenAddr = "0x1692Ec0372a1c95798411b7B6D6B62eEf8230592";
    const walletAddr = "0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9";

    const token = new ethers.Contract(tokenAddr, [
        "function balanceOf(address) view returns (uint256)",
        "function owner() view returns (address)",
        "function totalSupply() view returns (uint256)",
        "function symbol() view returns (string)"
    ], provider);

    try {
        const sym = await token.symbol();
        const owner = await token.owner();
        const total = await token.totalSupply();
        const bal = await token.balanceOf(walletAddr);

        console.log(`Token MVC (${tokenAddr})`);
        console.log(`- Symbol: ${sym}`);
        console.log(`- Owner (Creator): ${owner}`);
        console.log(`- Total Supply: ${ethers.formatUnits(total, 18)}`);
        console.log(`- Account 2 Balance: ${ethers.formatUnits(bal, 18)}`);

        if (bal === 0n) {
            console.log("!!! ACCOUNT HAS ZERO MVC TOKENS !!!");
        }
    } catch (e: any) {
        console.log(`Error: ${e.message}`);
    }
}

check();
