import { ethers } from 'ethers';

async function checkBalance() {
    const provider = new ethers.JsonRpcProvider('https://poseidon-rpc.kortana.worchsester.xyz/');
    const address = '0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9';

    try {
        const balance = await provider.getBalance(address);
        console.log(`Balance of ${address}: ${ethers.formatEther(balance)} DNR`);
        process.exit(0);
    } catch (error) {
        console.error('Error fetching balance:', error);
        process.exit(1);
    }
}

checkBalance();
