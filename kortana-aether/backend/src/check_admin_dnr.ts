import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const provider = new ethers.JsonRpcProvider('https://poseidon-rpc.kortana.worchsester.xyz/');
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY as string, provider);
    const bal = await provider.getBalance(wallet.address);
    console.log(`Admin Address: ${wallet.address}`);
    console.log(`DNR Balance: ${ethers.formatEther(bal)}`);
}
check();
